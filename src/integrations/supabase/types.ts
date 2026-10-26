export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      articles: {
        Row: {
          body_en: string
          body_zh: string
          category: string
          created_at: string
          created_by: string | null
          excerpt_en: string
          excerpt_zh: string
          id: string
          kind: string
          published: boolean
          published_at: string
          slug: string
          source_links: string[]
          tags: string[]
          title_en: string
          title_zh: string
          updated_at: string
        }
        Insert: {
          body_en?: string
          body_zh?: string
          category?: string
          created_at?: string
          created_by?: string | null
          excerpt_en?: string
          excerpt_zh?: string
          id?: string
          kind?: string
          published?: boolean
          published_at?: string
          slug: string
          source_links?: string[]
          tags?: string[]
          title_en: string
          title_zh: string
          updated_at?: string
        }
        Update: {
          body_en?: string
          body_zh?: string
          category?: string
          created_at?: string
          created_by?: string | null
          excerpt_en?: string
          excerpt_zh?: string
          id?: string
          kind?: string
          published?: boolean
          published_at?: string
          slug?: string
          source_links?: string[]
          tags?: string[]
          title_en?: string
          title_zh?: string
          updated_at?: string
        }
        Relationships: []
      }
      discussion_comments: {
        Row: {
          author_id: string
          body: string
          created_at: string
          id: string
          post_id: string
          status: string
        }
        Insert: {
          author_id: string
          body: string
          created_at?: string
          id?: string
          post_id: string
          status?: string
        }
        Update: {
          author_id?: string
          body?: string
          created_at?: string
          id?: string
          post_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "discussion_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "discussion_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      discussion_posts: {
        Row: {
          author_id: string
          body: string
          category: string
          created_at: string
          id: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          author_id: string
          body: string
          category?: string
          created_at?: string
          id?: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          body?: string
          category?: string
          created_at?: string
          id?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          body_en: string
          body_zh: string
          created_at: string
          created_by: string | null
          id: string
          published: boolean
          recap_en: string | null
          recap_zh: string | null
          signup_url: string | null
          slug: string
          starts_at: string | null
          status: string
          summary_en: string
          summary_zh: string
          title_en: string
          title_zh: string
          updated_at: string
          venue_en: string | null
          venue_zh: string | null
        }
        Insert: {
          body_en?: string
          body_zh?: string
          created_at?: string
          created_by?: string | null
          id?: string
          published?: boolean
          recap_en?: string | null
          recap_zh?: string | null
          signup_url?: string | null
          slug: string
          starts_at?: string | null
          status?: string
          summary_en?: string
          summary_zh?: string
          title_en: string
          title_zh: string
          updated_at?: string
          venue_en?: string | null
          venue_zh?: string | null
        }
        Update: {
          body_en?: string
          body_zh?: string
          created_at?: string
          created_by?: string | null
          id?: string
          published?: boolean
          recap_en?: string | null
          recap_zh?: string | null
          signup_url?: string | null
          slug?: string
          starts_at?: string | null
          status?: string
          summary_en?: string
          summary_zh?: string
          title_en?: string
          title_zh?: string
          updated_at?: string
          venue_en?: string | null
          venue_zh?: string | null
        }
        Relationships: []
      }
      opportunities: {
        Row: {
          author_id: string
          consent_confirmed: boolean
          created_at: string
          description: string
          id: string
          kind: string
          skills: string[]
          status: string
          title: string
          topics: string[]
          updated_at: string
          visibility: string
        }
        Insert: {
          author_id: string
          consent_confirmed?: boolean
          created_at?: string
          description: string
          id?: string
          kind?: string
          skills?: string[]
          status?: string
          title: string
          topics?: string[]
          updated_at?: string
          visibility?: string
        }
        Update: {
          author_id?: string
          consent_confirmed?: boolean
          created_at?: string
          description?: string
          id?: string
          kind?: string
          skills?: string[]
          status?: string
          title?: string
          topics?: string[]
          updated_at?: string
          visibility?: string
        }
        Relationships: []
      }
      opportunity_contacts: {
        Row: {
          author_id: string
          contact: string
          opportunity_id: string
          share_with_members: boolean
        }
        Insert: {
          author_id: string
          contact: string
          opportunity_id: string
          share_with_members?: boolean
        }
        Update: {
          author_id?: string
          contact?: string
          opportunity_id?: string
          share_with_members?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "opportunity_contacts_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: true
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
        ]
      }
      post_votes: {
        Row: {
          created_at: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_votes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "discussion_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          bio: string | null
          created_at: string
          display_name: string
          expertise: string[]
          id: string
          interests: string[]
          updated_at: string
          visibility: string
        }
        Insert: {
          bio?: string | null
          created_at?: string
          display_name?: string
          expertise?: string[]
          id: string
          interests?: string[]
          updated_at?: string
          visibility?: string
        }
        Update: {
          bio?: string | null
          created_at?: string
          display_name?: string
          expertise?: string[]
          id?: string
          interests?: string[]
          updated_at?: string
          visibility?: string
        }
        Relationships: []
      }
      reports: {
        Row: {
          created_at: string
          id: string
          reason: string
          reporter_id: string
          status: string
          target_id: string
          target_type: string
        }
        Insert: {
          created_at?: string
          id?: string
          reason: string
          reporter_id: string
          status?: string
          target_id: string
          target_type: string
        }
        Update: {
          created_at?: string
          id?: string
          reason?: string
          reporter_id?: string
          status?: string
          target_id?: string
          target_type?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_exists: { Args: never; Returns: boolean }
      author_names: {
        Args: { _ids: string[] }
        Returns: {
          display_name: string
          id: string
        }[]
      }
      claim_first_admin: { Args: never; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_staff: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
