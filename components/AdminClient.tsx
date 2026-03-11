'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Report, Profile } from '@/lib/types'
import { formatTimeAgo } from '@/lib/utils'

interface Props {
  reports: Report[]
  userCount: number
  postCount: number
  todayCount: number
  recentUsers: Profile[]
}

export default function AdminClient({ reports: initialReports, userCount, postCount, todayCount, recentUsers: initialUsers }: Props) {
  const supabase = createClient()
  const [reports, setReports] = useState(initialReports)
  const [users, setUsers] = useState(initialUsers)
  const [tab, setTab] = useState<'overview' | 'reports' | 'users'>('overview')

  const handleReport = async (id: number, status: 'resolved' | 'dismissed') => {
    await supabase.from('reports').update({ status }).eq('id', id)
    setReports(prev => prev.filter(r => r.id !== id))
  }

  const handleRoleChange = async (userId: string, role: 'student' | 'admin') => {
    if (!confirm(`역할을 ${role}로 변경할까요?`)) return
    await supabase.from('profiles').update({ role }).eq('id', userId)
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, role } : u))
  }

  const stats = [
    { label: '전체 학생', value: userCount, icon: '👥', color: 'bg-blue-50 text-blue-600' },
    { label: '전체 게시글', value: postCount, icon: '📝', color: 'bg-green-50 text-green-600' },
    { label: '오늘 게시글', value: todayCount, icon: '🔥', color: 'bg-orange-50 text-orange-600' },
    { label: '처리 대기', value: reports.length, icon: '🚨', color: 'bg-red-50 text-red-600' },
  ]

  return (
    <div className="page-enter">
      <div className="px-5 pt-5 pb-4">
        <h1 className="text-[22px] font-black text-ink">관리자</h1>
        <p className="text-ink3 text-[13px] mt-0.5">잌명 커뮤니티 관리</p>
      </div>

      {/* Tabs */}
      <div className="px-5 mb-4">
        <div className="bg-surface rounded-2xl p-1 flex gap-1">
          {(['overview', 'reports', 'users'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2 rounded-xl text-[13px] font-semibold transition-all ${
                tab === t ? 'bg-white text-ink shadow-card' : 'text-ink3'
              }`}
            >
              {t === 'overview' ? '📊 현황' : t === 'reports' ? `🚨 신고 ${reports.length}` : '👥 학생'}
            </button>
          ))}
        </div>
      </div>

      <div className="px-5">
        {tab === 'overview' && (
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3">
              {stats.map(s => (
                <div key={s.label} className="bg-white rounded-2xl shadow-card border border-line p-4">
                  <div className={`w-9 h-9 rounded-xl ${s.color} flex items-center justify-center text-lg mb-2`}>
                    {s.icon}
                  </div>
                  <p className="text-[24px] font-black text-ink">{s.value.toLocaleString()}</p>
                  <p className="text-ink3 text-[12px] font-medium">{s.label}</p>
                </div>
              ))}
            </div>

            {reports.length > 0 && (
              <div className="bg-red-50 rounded-2xl border border-red-100 p-4">
                <p className="text-[14px] font-bold text-red-600 mb-1">⚠️ 처리 대기 신고 {reports.length}건</p>
                <p className="text-[13px] text-red-500">신고 탭에서 확인해 주세요</p>
              </div>
            )}
          </div>
        )}

        {tab === 'reports' && (
          <div className="flex flex-col gap-2">
            {reports.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-card border border-line py-16 text-center">
                <p className="text-3xl mb-3">✅</p>
                <p className="text-ink3 text-[14px]">처리할 신고가 없어요</p>
              </div>
            ) : reports.map(report => (
              <div key={report.id} className="bg-white rounded-2xl shadow-card border border-line p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className="tag bg-red-50 text-red-600 text-[11px]">
                      {report.target_type === 'post' ? '게시글' : '댓글'} #{report.target_id}
                    </span>
                    <p className="text-[14px] font-semibold text-ink mt-2">{report.reason}</p>
                    <p className="text-ink3 text-[12px] mt-0.5">{formatTimeAgo(report.created_at)}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleReport(report.id, 'resolved')}
                    className="flex-1 py-2.5 rounded-xl bg-red-50 text-red-600 text-[13px] font-semibold border border-red-100 hover:bg-red-100 transition-colors"
                  >
                    콘텐츠 삭제
                  </button>
                  <button
                    onClick={() => handleReport(report.id, 'dismissed')}
                    className="flex-1 py-2.5 rounded-xl bg-surface text-ink2 text-[13px] font-semibold border border-line hover:bg-surface2 transition-colors"
                  >
                    무시
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'users' && (
          <div className="bg-white rounded-2xl shadow-card border border-line overflow-hidden">
            {users.map((user, i) => (
              <div key={user.id} className={`px-4 py-4 flex items-center gap-3 ${i > 0 ? 'border-t border-line' : ''}`}>
                <div className="w-9 h-9 rounded-xl bg-surface2 flex items-center justify-center text-base">
                  {user.role === 'admin' ? '👑' : '👤'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-semibold text-ink truncate">{user.nickname}</p>
                  <p className="text-ink3 text-[11px] truncate">{user.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`tag text-[10px] ${user.role === 'admin' ? 'bg-accent-light text-accent' : 'bg-surface2 text-ink3'}`}>
                    {user.role === 'admin' ? '관리자' : '학생'}
                  </span>
                  <button
                    onClick={() => handleRoleChange(user.id, user.role === 'admin' ? 'student' : 'admin')}
                    className="text-ink3 text-[11px] hover:text-ink2 underline"
                  >
                    변경
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="h-6"/>
    </div>
  )
}
