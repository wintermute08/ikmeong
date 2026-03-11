# 잌명 - 잌명고등학교 커뮤니티

> 잌명고등학교 학생 전용 폐쇄형 커뮤니티

## 🚀 배포 가이드 (30분 완성)

---

### 1단계: Supabase 프로젝트 만들기

1. [supabase.com](https://supabase.com) → **New Project** 클릭
2. 프로젝트 이름: `ikmeong`, 비밀번호 설정, 지역: `Northeast Asia (Seoul)`
3. 생성 완료 후 **Settings → API** 에서 아래 두 값 복사:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon/public key` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

### 2단계: 데이터베이스 스키마 설정

1. Supabase 대시보드 → **SQL Editor** → **New Query**
2. `supabase_schema.sql` 파일 전체 내용 복사 → 붙여넣기 → **Run**
3. ✅ 성공 메시지 확인

---

### 3단계: 이메일 인증 설정

Supabase **Authentication → Settings**:
- **Enable email confirmations**: **OFF** (바로 로그인 가능하게)
- **Site URL**: `https://your-app.vercel.app` (배포 후 변경)

---

### 4단계: Vercel 배포

```bash
# 1. 이 프로젝트를 GitHub에 올리기
git init
git add .
git commit -m "초기 배포"
git remote add origin https://github.com/your-username/ikmeong.git
git push -u origin main

# 또는 Vercel CLI 직접 배포
npm i -g vercel
vercel
```

2. [vercel.com](https://vercel.com) → **New Project** → GitHub 연결
3. **Environment Variables** 설정:

| 키 | 값 |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase에서 복사한 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase에서 복사한 키 |
| `NEXT_PUBLIC_ALLOWED_EMAIL_DOMAINS` | `ikmeong.hs.kr` (학교 도메인) |

4. **Deploy** 클릭 → 완료!

---

### 5단계: 관리자 계정 설정

배포 완료 후:
1. 학교 이메일로 회원가입
2. Supabase → **Table Editor → profiles**
3. 본인 계정의 `role` 값을 `admin`으로 변경

---

## 📁 프로젝트 구조

```
ikmeong/
├── app/
│   ├── auth/              # 로그인, 회원가입
│   │   ├── login/
│   │   ├── signup/
│   │   └── callback/
│   └── (app)/             # 인증 필요한 페이지들
│       ├── page.tsx        # 홈
│       ├── board/          # 익명게시판
│       ├── notice/         # 공지사항
│       ├── qna/            # 질문게시판
│       ├── files/          # 자료실
│       ├── admin/          # 관리자
│       ├── mypage/         # 마이페이지
│       └── post/[id]/      # 게시글 상세
├── components/
│   ├── BottomNav.tsx
│   ├── TopBar.tsx
│   ├── PostCard.tsx
│   ├── PostDetail.tsx
│   ├── FilesClient.tsx
│   ├── MyPageClient.tsx
│   └── AdminClient.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   └── server.ts
│   ├── types.ts
│   └── utils.ts
├── middleware.ts           # 인증 미들웨어
├── supabase_schema.sql     # DB 스키마
└── .env.example
```

---

## 🎨 디자인 시스템

- **Accent**: `#C6613F` (잌명 오렌지)
- **폰트**: Pretendard Variable
- **스타일**: Toss 스타일 미니멀 핀테크 UI
- **컴포넌트**: 카드 UI, 바텀시트, 둥근 모서리

---

## ⚙️ 기능 목록

### 인증
- [x] 학교 이메일(@ikmeong.hs.kr)만 가입 가능
- [x] 이메일 인증 없이 바로 로그인
- [x] 2단계 회원가입 (이메일/비밀번호 → 프로필)
- [x] 미들웨어로 비로그인 접근 차단

### 게시판
- [x] 공지사항 (관리자만 작성)
- [x] 익명게시판 (전체 익명)
- [x] 질문게시판 (채택 기능)
- [x] 게시글 작성/삭제
- [x] 댓글/답글
- [x] 좋아요 토글
- [x] 신고 기능 (바텀시트)
- [x] 검색 기능
- [x] 페이지네이션
- [x] 인기글 (좋아요 기준)

### 자료실
- [x] 파일 업로드/다운로드 (관리자 업로드)
- [x] 카테고리 필터
- [x] Supabase Storage 연동

### 관리자
- [x] 현황 대시보드
- [x] 신고 처리 (삭제/무시)
- [x] 회원 관리 (역할 변경)

---

## 🔧 로컬 개발

```bash
cp .env.example .env.local
# .env.local에 Supabase 키 입력

npm install
npm run dev
# http://localhost:3000
```

---

## 📌 학교 도메인 변경 방법

`.env.local` (또는 Vercel 환경변수):
```
NEXT_PUBLIC_ALLOWED_EMAIL_DOMAINS=yourschool.hs.kr
```

여러 도메인 허용:
```
NEXT_PUBLIC_ALLOWED_EMAIL_DOMAINS=school.hs.kr,school.ac.kr
```
