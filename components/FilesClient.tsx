'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { FileItem } from '@/lib/types'
import { formatTimeAgo, formatBytes } from '@/lib/utils'

interface Props {
  files: FileItem[]
  isAdmin: boolean
  userId: string
}

const CATEGORIES = ['전체', '학습자료', '서식/양식', '시험자료', '기타']

const fileIcon = (mime: string) => {
  if (mime.includes('pdf')) return '📄'
  if (mime.includes('word') || mime.includes('document')) return '📝'
  if (mime.includes('sheet') || mime.includes('excel')) return '📊'
  if (mime.includes('presentation') || mime.includes('powerpoint')) return '📈'
  if (mime.includes('image')) return '🖼️'
  return '📎'
}

export default function FilesClient({ files: initialFiles, isAdmin, userId }: Props) {
  const supabase = createClient()
  const [files, setFiles] = useState(initialFiles)
  const [category, setCategory] = useState('전체')
  const [uploading, setUploading] = useState(false)
  const [showUploadSheet, setShowUploadSheet] = useState(false)
  const [uploadName, setUploadName] = useState('')
  const [uploadDesc, setUploadDesc] = useState('')
  const [uploadCategory, setUploadCategory] = useState('학습자료')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const filtered = category === '전체' ? files : files.filter(f => f.category === category)

  const handleDownload = async (file: FileItem) => {
    const { data } = await supabase.storage.from('files').createSignedUrl(file.file_path, 60)
    if (data?.signedUrl) {
      window.open(data.signedUrl)
      await supabase.from('files').update({ downloads: file.downloads + 1 }).eq('id', file.id)
      setFiles(prev => prev.map(f => f.id === file.id ? { ...f, downloads: f.downloads + 1 } : f))
    }
  }

  const handleUpload = async () => {
    if (!selectedFile || !uploadName.trim()) return
    setUploading(true)

    const ext = selectedFile.name.split('.').pop()
    const path = `${userId}/${Date.now()}.${ext}`

    const { error: storageError } = await supabase.storage.from('files').upload(path, selectedFile)
    if (storageError) { alert('업로드 실패했어요.'); setUploading(false); return }

    const { data, error } = await supabase.from('files').insert({
      name: uploadName.trim(),
      description: uploadDesc.trim() || null,
      file_path: path,
      file_size: selectedFile.size,
      mime_type: selectedFile.type,
      uploader_id: userId,
      category: uploadCategory,
    }).select().single()

    if (!error && data) {
      setFiles(prev => [data, ...prev])
      setShowUploadSheet(false)
      setUploadName('')
      setUploadDesc('')
      setSelectedFile(null)
    }
    setUploading(false)
  }

  const handleDelete = async (file: FileItem) => {
    if (!confirm('삭제할까요?')) return
    await supabase.storage.from('files').remove([file.file_path])
    await supabase.from('files').delete().eq('id', file.id)
    setFiles(prev => prev.filter(f => f.id !== file.id))
  }

  return (
    <div className="page-enter">
      <div className="px-5 pt-5 pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-black text-ink">자료실</h1>
          <p className="text-ink3 text-[13px] mt-0.5">학습 자료를 공유해요</p>
        </div>
        {isAdmin && (
          <button onClick={() => setShowUploadSheet(true)} className="btn-primary py-2 px-4 text-[13px]">
            업로드
          </button>
        )}
      </div>

      {/* Category filter */}
      <div className="px-5 mb-4">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`shrink-0 px-4 py-2 rounded-2xl text-[13px] font-semibold transition-all ${
                category === cat ? 'bg-accent text-white' : 'bg-white text-ink2 border border-line'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Files list */}
      <div className="px-5">
        <div className="bg-white rounded-2xl shadow-card border border-line overflow-hidden">
          {filtered.length > 0 ? (
            filtered.map((file, i) => (
              <div key={file.id} className={`px-4 py-4 flex items-center gap-3 ${i > 0 ? 'border-t border-line' : ''}`}>
                <div className="w-10 h-10 rounded-xl bg-surface flex items-center justify-center text-xl shrink-0">
                  {fileIcon(file.mime_type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-semibold text-ink truncate">{file.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="tag bg-surface2 text-ink2 text-[10px]">{file.category}</span>
                    <span className="text-ink3 text-[11px]">{formatBytes(file.file_size)}</span>
                    <span className="text-ink3 text-[11px]">↓ {file.downloads}</span>
                    <span className="text-ink3 text-[11px]">{formatTimeAgo(file.created_at)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDownload(file)}
                    className="w-9 h-9 rounded-xl bg-accent-light flex items-center justify-center hover:bg-accent-mid/20 transition-colors"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C6613F" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="7 10 12 15 17 10"/>
                      <line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                  </button>
                  {isAdmin && (
                    <button
                      onClick={() => handleDelete(file)}
                      className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center hover:bg-red-100 transition-colors"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="py-16 text-center">
              <p className="text-3xl mb-3">📁</p>
              <p className="text-ink3 text-[14px]">자료가 없어요</p>
            </div>
          )}
        </div>
      </div>

      {/* Upload bottom sheet */}
      {showUploadSheet && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowUploadSheet(false)}/>
          <div className="absolute bottom-0 left-0 right-0 max-w-[480px] mx-auto bg-white rounded-t-3xl p-6 sheet-enter">
            <div className="w-10 h-1 bg-line rounded-full mx-auto mb-5"/>
            <h3 className="text-[17px] font-black text-ink mb-4">자료 업로드</h3>
            <div className="flex flex-col gap-3">
              <div>
                <label className="text-[13px] font-semibold text-ink2 mb-1.5 block">파일 선택</label>
                <input
                  type="file"
                  onChange={e => {
                    const f = e.target.files?.[0]
                    if (f) { setSelectedFile(f); if (!uploadName) setUploadName(f.name) }
                  }}
                  className="input-base text-[13px] file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-accent-light file:text-accent file:text-[12px] file:font-semibold"
                />
              </div>
              <div>
                <label className="text-[13px] font-semibold text-ink2 mb-1.5 block">자료 이름</label>
                <input type="text" className="input-base" placeholder="자료 이름을 입력하세요" value={uploadName} onChange={e => setUploadName(e.target.value)}/>
              </div>
              <div>
                <label className="text-[13px] font-semibold text-ink2 mb-1.5 block">카테고리</label>
                <select className="input-base" value={uploadCategory} onChange={e => setUploadCategory(e.target.value)}>
                  {CATEGORIES.slice(1).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[13px] font-semibold text-ink2 mb-1.5 block">설명 <span className="text-ink3 font-normal">(선택)</span></label>
                <input type="text" className="input-base" placeholder="간단한 설명" value={uploadDesc} onChange={e => setUploadDesc(e.target.value)}/>
              </div>
            </div>
            <button onClick={handleUpload} disabled={uploading || !selectedFile || !uploadName.trim()} className="btn-primary w-full mt-4">
              {uploading ? '업로드 중...' : '업로드'}
            </button>
            <button onClick={() => setShowUploadSheet(false)} className="btn-ghost w-full mt-2">취소</button>
          </div>
        </div>
      )}
      <div className="h-6"/>
    </div>
  )
}
