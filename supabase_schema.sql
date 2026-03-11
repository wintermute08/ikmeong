-- ============================================================
-- 잌명 커뮤니티 - Supabase 데이터베이스 스키마
-- Supabase SQL Editor에서 전체 복사 후 실행하세요
-- ============================================================

-- 1. PROFILES (회원 프로필)
CREATE TABLE IF NOT EXISTS public.profiles (
  id         UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email      TEXT NOT NULL UNIQUE,
  nickname   TEXT NOT NULL,
  grade      INT CHECK (grade IN (1,2,3)),
  class_num  INT,
  student_num INT,
  role       TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. POSTS (게시글)
CREATE TABLE IF NOT EXISTS public.posts (
  id            BIGSERIAL PRIMARY KEY,
  board         TEXT NOT NULL CHECK (board IN ('notice', 'anon', 'qna')),
  title         TEXT NOT NULL,
  content       TEXT NOT NULL,
  author_id     UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  is_anon       BOOLEAN DEFAULT FALSE,
  is_pinned     BOOLEAN DEFAULT FALSE,
  is_deleted    BOOLEAN DEFAULT FALSE,
  views         INT DEFAULT 0,
  likes         INT DEFAULT 0,
  comment_count INT DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- 3. COMMENTS (댓글)
CREATE TABLE IF NOT EXISTS public.comments (
  id         BIGSERIAL PRIMARY KEY,
  post_id    BIGINT REFERENCES public.posts(id) ON DELETE CASCADE,
  author_id  UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  content    TEXT NOT NULL,
  is_anon    BOOLEAN DEFAULT FALSE,
  is_best    BOOLEAN DEFAULT FALSE,
  is_deleted BOOLEAN DEFAULT FALSE,
  likes      INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. POST_LIKES (게시글 좋아요)
CREATE TABLE IF NOT EXISTS public.post_likes (
  post_id    BIGINT REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id    UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (post_id, user_id)
);

-- 5. COMMENT_LIKES (댓글 좋아요)
CREATE TABLE IF NOT EXISTS public.comment_likes (
  comment_id BIGINT REFERENCES public.comments(id) ON DELETE CASCADE,
  user_id    UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (comment_id, user_id)
);

-- 6. FILES (자료실)
CREATE TABLE IF NOT EXISTS public.files (
  id          BIGSERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  description TEXT,
  file_path   TEXT NOT NULL,
  file_size   BIGINT NOT NULL,
  mime_type   TEXT NOT NULL,
  uploader_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  category    TEXT NOT NULL DEFAULT '기타',
  downloads   INT DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 7. REPORTS (신고)
CREATE TABLE IF NOT EXISTS public.reports (
  id          BIGSERIAL PRIMARY KEY,
  reporter_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  target_type TEXT NOT NULL CHECK (target_type IN ('post', 'comment')),
  target_id   BIGINT NOT NULL,
  reason      TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'resolved', 'dismissed')),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- RLS (Row Level Security) 설정
-- ============================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comment_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- PROFILES policies
CREATE POLICY "profiles_select" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "profiles_insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- POSTS policies
CREATE POLICY "posts_select" ON public.posts FOR SELECT TO authenticated USING (is_deleted = false);
CREATE POLICY "posts_insert" ON public.posts FOR INSERT TO authenticated WITH CHECK (auth.uid() = author_id);
CREATE POLICY "posts_update_own" ON public.posts FOR UPDATE TO authenticated USING (auth.uid() = author_id);
CREATE POLICY "posts_update_admin" ON public.posts FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- COMMENTS policies
CREATE POLICY "comments_select" ON public.comments FOR SELECT TO authenticated USING (is_deleted = false);
CREATE POLICY "comments_insert" ON public.comments FOR INSERT TO authenticated WITH CHECK (auth.uid() = author_id);
CREATE POLICY "comments_update" ON public.comments FOR UPDATE TO authenticated
  USING (auth.uid() = author_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- POST_LIKES policies
CREATE POLICY "post_likes_all" ON public.post_likes FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- COMMENT_LIKES policies
CREATE POLICY "comment_likes_all" ON public.comment_likes FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- FILES policies
CREATE POLICY "files_select" ON public.files FOR SELECT TO authenticated USING (true);
CREATE POLICY "files_insert" ON public.files FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "files_delete" ON public.files FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "files_update" ON public.files FOR UPDATE TO authenticated USING (true);

-- REPORTS policies
CREATE POLICY "reports_insert" ON public.reports FOR INSERT TO authenticated WITH CHECK (auth.uid() = reporter_id);
CREATE POLICY "reports_select_admin" ON public.reports FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "reports_update_admin" ON public.reports FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- ============================================================
-- STORAGE 버킷 설정 (SQL Editor에서 실행)
-- ============================================================

INSERT INTO storage.buckets (id, name, public) VALUES ('files', 'files', false);

CREATE POLICY "files_storage_select" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'files');
CREATE POLICY "files_storage_insert" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'files' AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "files_storage_delete" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'files' AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- ============================================================
-- 자동 profile 생성 트리거
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, nickname, grade, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nickname', split_part(NEW.email, '@', 1)),
    CASE WHEN NEW.raw_user_meta_data->>'grade' IS NOT NULL
         THEN (NEW.raw_user_meta_data->>'grade')::INT
         ELSE NULL END,
    'student'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 인덱스 (성능 최적화)
-- ============================================================

CREATE INDEX IF NOT EXISTS posts_board_idx ON public.posts(board, is_deleted, created_at DESC);
CREATE INDEX IF NOT EXISTS posts_author_idx ON public.posts(author_id);
CREATE INDEX IF NOT EXISTS posts_pinned_idx ON public.posts(is_pinned, board);
CREATE INDEX IF NOT EXISTS comments_post_idx ON public.comments(post_id, is_deleted);
CREATE INDEX IF NOT EXISTS files_category_idx ON public.files(category, created_at DESC);
