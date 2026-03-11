export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          nickname: string
          grade: number | null
          class_num: number | null
          student_num: number | null
          role: 'student' | 'admin'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          nickname: string
          grade?: number | null
          class_num?: number | null
          student_num?: number | null
          role?: 'student' | 'admin'
        }
        Update: {
          nickname?: string
          grade?: number | null
          class_num?: number | null
          student_num?: number | null
          role?: 'student' | 'admin'
          updated_at?: string
        }
      }
      posts: {
        Row: {
          id: number
          board: 'notice' | 'anon' | 'qna'
          title: string
          content: string
          author_id: string
          is_anon: boolean
          is_pinned: boolean
          is_deleted: boolean
          views: number
          likes: number
          comment_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          board: 'notice' | 'anon' | 'qna'
          title: string
          content: string
          author_id: string
          is_anon?: boolean
          is_pinned?: boolean
        }
        Update: {
          title?: string
          content?: string
          is_pinned?: boolean
          is_deleted?: boolean
          views?: number
          likes?: number
          comment_count?: number
          updated_at?: string
        }
      }
      comments: {
        Row: {
          id: number
          post_id: number
          author_id: string
          content: string
          is_anon: boolean
          is_best: boolean
          is_deleted: boolean
          likes: number
          created_at: string
        }
        Insert: {
          post_id: number
          author_id: string
          content: string
          is_anon?: boolean
        }
        Update: {
          content?: string
          is_best?: boolean
          is_deleted?: boolean
          likes?: number
        }
      }
      post_likes: {
        Row: {
          post_id: number
          user_id: string
          created_at: string
        }
        Insert: {
          post_id: number
          user_id: string
        }
      }
      comment_likes: {
        Row: {
          comment_id: number
          user_id: string
          created_at: string
        }
        Insert: {
          comment_id: number
          user_id: string
        }
      }
      files: {
        Row: {
          id: number
          name: string
          description: string | null
          file_path: string
          file_size: number
          mime_type: string
          uploader_id: string
          category: string
          downloads: number
          created_at: string
        }
        Insert: {
          name: string
          description?: string | null
          file_path: string
          file_size: number
          mime_type: string
          uploader_id: string
          category: string
        }
        Update: {
          downloads?: number
        }
      }
      reports: {
        Row: {
          id: number
          reporter_id: string
          target_type: 'post' | 'comment'
          target_id: number
          reason: string
          status: 'pending' | 'resolved' | 'dismissed'
          created_at: string
        }
        Insert: {
          reporter_id: string
          target_type: 'post' | 'comment'
          target_id: number
          reason: string
        }
      }
    }
  }
}

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Post = Database['public']['Tables']['posts']['Row']
export type Comment = Database['public']['Tables']['comments']['Row']
export type FileItem = Database['public']['Tables']['files']['Row']
export type Report = Database['public']['Tables']['reports']['Row']
