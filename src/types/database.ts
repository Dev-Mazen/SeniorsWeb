export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string | null
          full_name: string | null
          nickname: string | null
          role: string
          is_active: boolean
          photo_url: string | null
          bio: string | null
          created_at: string
        }
        Insert: {
          id: string
          email?: string | null
          full_name?: string | null
          nickname?: string | null
          role?: string
          is_active?: boolean
          photo_url?: string | null
          bio?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          full_name?: string | null
          nickname?: string | null
          role?: string
          is_active?: boolean
          photo_url?: string | null
          bio?: string | null
          created_at?: string
        }
      }
      platform_settings: {
        Row: {
          id: string
          wall_posts_enabled: boolean
          uploads_enabled: boolean
          voting_enabled: boolean
          awards_revealed: boolean
          graduation_date: string
          created_at: string
        }
        Insert: {
          wall_posts_enabled?: boolean
          uploads_enabled?: boolean
          voting_enabled?: boolean
          awards_revealed?: boolean
          graduation_date?: string
        }
        Update: {
          wall_posts_enabled?: boolean
          uploads_enabled?: boolean
          voting_enabled?: boolean
          awards_revealed?: boolean
          graduation_date?: string
        }
      }
      wall_posts: {
        Row: {
          id: string
          author_id: string
          content: string
          status: string
          created_at: string
        }
        Insert: {
          author_id: string
          content: string
          status?: string
        }
        Update: {
          content?: string
          status?: string
        }
      }
      memories: {
        Row: {
          id: string
          author_id: string
          caption: string | null
          media_url: string
          media_type: string
          status: string
          created_at: string
        }
        Insert: {
          author_id: string
          caption?: string | null
          media_url: string
          media_type: string
          status?: string
        }
        Update: {
          caption?: string | null
          status?: string
        }
      }
      awards_questions: {
        Row: {
          id: string
          question: string
          display_order: number
          is_active: boolean
          created_at: string
        }
        Insert: {
          question: string
          display_order?: number
          is_active?: boolean
        }
        Update: {
          question?: string
          display_order?: number
          is_active?: boolean
        }
      }
      awards_votes: {
        Row: {
          id: string
          voter_id: string
          question_id: string
          nominee_id: string
          created_at: string
        }
        Insert: {
          voter_id: string
          question_id: string
          nominee_id: string
        }
        Update: Record<string, never>
      }
      senior_memories: {
        Row: {
          id: string
          author_id: string
          subject_id: string
          content: string
          status: string
          created_at: string
        }
        Insert: {
          author_id: string
          subject_id: string
          content: string
          status?: string
        }
        Update: {
          content?: string
          status?: string
        }
      }
      teachers: {
        Row: {
          id: string
          name: string
          subject: string | null
          photo_url: string | null
          created_at: string
        }
        Insert: {
          name: string
          subject?: string | null
          photo_url?: string | null
        }
        Update: {
          name?: string
          subject?: string | null
          photo_url?: string | null
        }
      }
      teacher_messages: {
        Row: {
          id: string
          author_id: string
          teacher_id: string
          content: string
          status: string
          created_at: string
        }
        Insert: {
          author_id: string
          teacher_id: string
          content: string
          status?: string
        }
        Update: {
          content?: string
          status?: string
        }
      }
      time_capsules: {
        Row: {
          id: string
          author_id: string
          content: string
          open_date: string
          created_at: string
        }
        Insert: {
          author_id: string
          content: string
          open_date: string
        }
        Update: {
          content?: string
          open_date?: string
        }
      }
      comments: {
        Row: {
          id: string
          memory_id: string
          user_id: string
          content: string
          created_at: string
        }
        Insert: {
          memory_id: string
          user_id: string
          content: string
        }
        Update: {
          content?: string
        }
      }
      memory_comments: {
        Row: {
          id: string
          memory_id: string
          user_id: string
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          memory_id: string
          user_id: string
          content: string
          created_at?: string
        }
        Update: {
          id?: string
          memory_id?: string
          user_id?: string
          content?: string
          created_at?: string
        }
      }
      likes: {
        Row: {
          id: string
          memory_id: string
          user_id: string
          created_at: string
        }
        Insert: {
          memory_id: string
          user_id: string
        }
        Update: Record<string, never>
        }
      }
      memory_likes: {
        Row: {
          id: string
          memory_id: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          memory_id: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          memory_id?: string
          user_id?: string
          created_at?: string
        }
      }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}

// Convenience type aliases
export type Profile = Database["public"]["Tables"]["profiles"]["Row"]
export type PlatformSettings = Database["public"]["Tables"]["platform_settings"]["Row"]
export type WallPost = Database["public"]["Tables"]["wall_posts"]["Row"]
export type Memory = Database["public"]["Tables"]["memories"]["Row"]
export type AwardsQuestion = Database["public"]["Tables"]["awards_questions"]["Row"]
export type AwardsVote = Database["public"]["Tables"]["awards_votes"]["Row"]
export type SeniorMemory = Database["public"]["Tables"]["senior_memories"]["Row"]
export type Teacher = Database["public"]["Tables"]["teachers"]["Row"]
export type TeacherMessage = Database["public"]["Tables"]["teacher_messages"]["Row"]
export type TimeCapsule = Database["public"]["Tables"]["time_capsules"]["Row"]
export type Comment = Database["public"]["Tables"]["comments"]["Row"]
export type Like = Database["public"]["Tables"]["likes"]["Row"]
export type MemoryComment = Database["public"]["Tables"]["memory_comments"]["Row"]
export type MemoryLike = Database["public"]["Tables"]["memory_likes"]["Row"]
