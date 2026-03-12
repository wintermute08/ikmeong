import Link from 'next/link'
import { Post } from '@/lib/types'
import { formatTimeAgo } from '@/lib/utils'

interface Props {
  post: Post
}

const boardLabel: Record<string, string> = {
  notice: '공지',
  anon: '익명',
  qna: '질문',
}

const boardTagClass: Record<string, string> = {
  notice: 'tag-notice',
  anon: 'tag-anon',
  qna: 'tag-qna',
}

export default function PostCard({ post }: Props) {
  return (
    <Link href={`/post/${post.id}`}>
      <div className="post-row">
        <div className="flex items-start gap-2">
          {post.is_pinned && (
            <span className="shrink-0 mt-0.5 text-accent">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M16 4v6l2 2v2h-5v6l-1 1-1-1v-6H6v-2l2-2V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1z"/>
              </svg>
            </span>
          )}
          <p className="text-[15px] font-semibold text-ink leading-snug flex-1 line-clamp-2 tracking-[-0.01em]">
            {post.title}
          </p>
        </div>

        <div className="flex items-center gap-2 mt-0.5">
          <span className={`tag ${boardTagClass[post.board]}`}>
            {boardLabel[post.board]}
          </span>
          <span className="help">{formatTimeAgo(post.created_at)}</span>
          <div className="flex items-center gap-2.5 ml-auto text-ink3 text-[12px]">
            <span className="flex items-center gap-0.5 tabular-nums">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
              </svg>
              {post.views}
            </span>
            <span className="flex items-center gap-0.5 tabular-nums">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              {post.comment_count}
            </span>
            {post.board !== 'notice' && (
              <span className="flex items-center gap-0.5 tabular-nums">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
                {post.likes}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
