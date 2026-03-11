'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Post, Comment } from '@/lib/types'
import { formatTimeAgo } from '@/lib/utils'

interface Props {
  post: Post
  comments: Comment[]
  userId: string | null
  userLiked: boolean
  authorProfile: { nickname: string; grade: number | null } | null
  isAdmin: boolean
}

const boardLabel: Record<string, string> = { notice: '공지', anon: '익명', qna: '질문' }
const boardTagClass: Record<string, string> = { notice: 'tag-notice', anon: 'tag-anon', qna: 'tag-qna' }

export default function PostDetail({ post, comments: initialComments, userId, userLiked: initialLiked, authorProfile, isAdmin }: Props) {
  const router = useRouter()
  const supabase = createClient()
  const [liked, setLiked] = useState(initialLiked)
  const [likeCount, setLikeCount] = useState(post.likes)
  const [comments, setComments] = useState(initialComments)
  const [commentText, setCommentText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [showReportSheet, setShowReportSheet] = useState(false)
  const [reportReason, setReportReason] = useState('')

  const isAuthor = userId === post.author_id

  const handleLike = async () => {
    if (!userId) { router.push('/auth/login'); return }
    const supabase = createClient()
    if (liked) {
      await supabase.from('post_likes').delete().eq('post_id', post.id).eq('user_id', userId)
      await supabase.from('posts').update({ likes: likeCount - 1 }).eq('id', post.id)
      setLiked(false)
      setLikeCount(c => c - 1)
    } else {
      await supabase.from('post_likes').insert({ post_id: post.id, user_id: userId })
      await supabase.from('posts').update({ likes: likeCount + 1 }).eq('id', post.id)
      setLiked(true)
      setLikeCount(c => c + 1)
    }
  }

  const handleComment = async () => {
    if (!userId) { router.push('/auth/login'); return }
    if (!commentText.trim()) return
    setSubmitting(true)

    const { data, error } = await supabase
      .from('comments')
      .insert({
        post_id: post.id,
        author_id: userId,
        content: commentText.trim(),
        is_anon: post.is_anon,
      })
      .select()
      .single()

    if (!error && data) {
      await supabase.from('posts').update({ comment_count: comments.length + 1 }).eq('id', post.id)
      setComments(prev => [...prev, data])
      setCommentText('')
    }
    setSubmitting(false)
  }

  const handleDelete = async () => {
    if (!confirm('정말 삭제할까요?')) return
    await supabase.from('posts').update({ is_deleted: true }).eq('id', post.id)
    router.back()
  }

  const handleReport = async () => {
    if (!userId || !reportReason) return
    await supabase.from('reports').insert({
      reporter_id: userId,
      target_type: 'post',
      target_id: post.id,
      reason: reportReason,
    })
    setShowReportSheet(false)
    alert('신고가 접수됐어요.')
  }

  const handleAdminDelete = async (commentId: number) => {
    if (!confirm('댓글을 삭제할까요?')) return
    await supabase.from('comments').update({ is_deleted: true }).eq('id', commentId)
    setComments(prev => prev.filter(c => c.id !== commentId))
  }

  return (
    <div className="page-enter">
      {/* Post content */}
      <div className="px-5 pt-5">
        {/* Tags & meta */}
        <div className="flex items-center gap-2 mb-3">
          <span className={`tag ${boardTagClass[post.board]}`}>{boardLabel[post.board]}</span>
          {post.is_pinned && (
            <span className="tag bg-amber-50 text-amber-700">📌 고정</span>
          )}
        </div>

        <h1 className="text-[20px] font-black text-ink leading-snug mb-3">{post.title}</h1>

        <div className="flex items-center justify-between mb-4 pb-4 border-b border-line">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-surface2 flex items-center justify-center text-[13px]">
              {post.is_anon ? '🎭' : '👤'}
            </div>
            <div>
              <p className="text-[13px] font-semibold text-ink">
                {post.is_anon ? '익명' : authorProfile?.nickname || '학생'}
                {!post.is_anon && authorProfile?.grade && (
                  <span className="text-ink3 font-normal ml-1">{authorProfile.grade}학년</span>
                )}
              </p>
              <p className="text-[11px] text-ink3">{formatTimeAgo(post.created_at)}</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-ink3 text-[12px]">
            <span>👁 {post.views}</span>
          </div>
        </div>

        {/* Content */}
        <div className="text-[15px] text-ink leading-relaxed whitespace-pre-wrap mb-6">
          {post.content}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2.5 pb-5 border-b border-line">
          <button
            onClick={handleLike}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-[14px] font-semibold transition-all active:scale-95 ${
              liked
                ? 'bg-red-50 text-red-500 border border-red-100'
                : 'bg-surface text-ink2 border border-line'
            }`}
          >
            {liked ? '❤️' : '🤍'} {likeCount}
          </button>

          {(isAuthor || isAdmin) && (
            <button
              onClick={handleDelete}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-[14px] font-semibold bg-surface text-red-500 border border-line"
            >
              🗑 삭제
            </button>
          )}

          {!isAuthor && (
            <button
              onClick={() => setShowReportSheet(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-[14px] font-semibold bg-surface text-ink2 border border-line ml-auto"
            >
              🚩 신고
            </button>
          )}
        </div>

        {/* Comments */}
        <div className="pt-4">
          <h2 className="text-[15px] font-bold text-ink mb-3">댓글 {comments.length}</h2>

          {comments.length === 0 && (
            <div className="py-8 text-center text-ink3 text-[14px]">
              첫 댓글을 남겨보세요 💬
            </div>
          )}

          <div className="flex flex-col gap-1">
            {comments.map(comment => (
              <div key={comment.id} className="py-3 border-b border-line last:border-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[12px] font-semibold text-ink">
                      {comment.is_anon ? '익명' : '학생'}
                    </span>
                    {comment.is_best && (
                      <span className="tag bg-green-50 text-green-700 text-[10px]">✅ 채택</span>
                    )}
                    <span className="text-ink3 text-[11px]">{formatTimeAgo(comment.created_at)}</span>
                  </div>
                  {(isAdmin || userId === comment.author_id) && (
                    <button
                      onClick={() => handleAdminDelete(comment.id)}
                      className="text-ink3 text-[12px] hover:text-red-500"
                    >
                      삭제
                    </button>
                  )}
                </div>
                <p className="text-[14px] text-ink mt-1.5 leading-relaxed">{comment.content}</p>
              </div>
            ))}
          </div>

          {/* Comment input */}
          <div className="mt-4 flex gap-2">
            <textarea
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              placeholder="댓글을 입력하세요"
              className="input-base flex-1 resize-none h-[80px] text-[14px]"
              onKeyDown={e => {
                if (e.key === 'Enter' && e.metaKey) handleComment()
              }}
            />
          </div>
          <button
            onClick={handleComment}
            disabled={submitting || !commentText.trim()}
            className="btn-primary w-full mt-2"
          >
            {submitting ? '등록 중...' : '댓글 등록'}
          </button>
        </div>
      </div>

      {/* Report bottom sheet */}
      {showReportSheet && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowReportSheet(false)}
          />
          <div className="absolute bottom-0 left-0 right-0 max-w-[480px] mx-auto bg-white rounded-t-3xl p-6 sheet-enter">
            <div className="w-10 h-1 bg-line rounded-full mx-auto mb-5"/>
            <h3 className="text-[17px] font-black text-ink mb-4">신고 이유를 선택해 주세요</h3>
            <div className="flex flex-col gap-2">
              {['욕설 / 비방', '개인정보 포함', '스팸 / 광고', '음란물', '기타'].map(reason => (
                <button
                  key={reason}
                  onClick={() => setReportReason(reason)}
                  className={`px-4 py-3 rounded-xl text-[15px] font-medium text-left transition-all ${
                    reportReason === reason
                      ? 'bg-accent-light text-accent border border-accent/30'
                      : 'bg-surface text-ink2'
                  }`}
                >
                  {reason}
                </button>
              ))}
            </div>
            <button
              onClick={handleReport}
              disabled={!reportReason}
              className="btn-primary w-full mt-4"
            >
              신고하기
            </button>
            <button
              onClick={() => setShowReportSheet(false)}
              className="btn-ghost w-full mt-2"
            >
              취소
            </button>
          </div>
        </div>
      )}

      <div className="h-6"/>
    </div>
  )
}
