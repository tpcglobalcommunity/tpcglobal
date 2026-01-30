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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      app_settings: {
        Row: {
          admin_email: string
          admin_user_ids: string[]
          created_at: string
          id: number
          require_admin_email: boolean
          stage1_price_usd: number
          stage1_supply: number
          stage2_price_usd: number
          stage2_supply: number
          tpc_usd_idr_rate: number
          updated_at: string
        }
        Insert: {
          admin_email?: string
          admin_user_ids?: string[]
          created_at?: string
          id?: number
          require_admin_email?: boolean
          stage1_price_usd?: number
          stage1_supply?: number
          stage2_price_usd?: number
          stage2_supply?: number
          tpc_usd_idr_rate?: number
          updated_at?: string
        }
        Update: {
          admin_email?: string
          admin_user_ids?: string[]
          created_at?: string
          id?: number
          require_admin_email?: boolean
          stage1_price_usd?: number
          stage1_supply?: number
          stage2_price_usd?: number
          stage2_supply?: number
          tpc_usd_idr_rate?: number
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      tpc_invoices: {
        Row: {
          admin_note: string | null
          buyer_email: string
          created_at: string
          id: string
          invoice_no: string
          paid_at: string | null
          payment_method: string
          price_usd: number
          proof_url: string | null
          stage: string
          status: string
          total_idr: number
          total_usd: number
          tpc_amount: number
          treasury_address: string
          updated_at: string
          usd_idr_rate: number
          user_id: string | null
        }
        Insert: {
          admin_note?: string | null
          buyer_email: string
          created_at?: string
          id?: string
          invoice_no: string
          paid_at?: string | null
          payment_method: string
          price_usd: number
          proof_url?: string | null
          stage: string
          status?: string
          total_idr: number
          total_usd: number
          tpc_amount: number
          treasury_address: string
          updated_at?: string
          usd_idr_rate: number
          user_id?: string | null
        }
        Update: {
          admin_note?: string | null
          buyer_email?: string
          created_at?: string
          id?: string
          invoice_no?: string
          paid_at?: string | null
          payment_method?: string
          price_usd?: number
          proof_url?: string | null
          stage?: string
          status?: string
          total_idr?: number
          total_usd?: number
          tpc_amount?: number
          treasury_address?: string
          updated_at?: string
          usd_idr_rate?: number
          user_id?: string | null
        }
        Relationships: []
      }
      admin_whitelist: {
        Row: {
          user_id: string
          note: string | null
          created_at: string
        }
        Insert: {
          user_id: string
          note?: string | null
          created_at?: string
        }
        Update: {
          user_id?: string
          note?: string | null
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: {
        Args: { p_email?: string; p_user_id?: string }
        Returns: boolean
      }
      get_is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      get_invoice_public: {
        Args: { p_invoice_no: string }
        Returns: {
          invoice_no: string
          status: string
          stage: string
          tpc_amount: number
          total_usd: number
          total_idr: number
          created_at: string
          paid_at: string | null
          treasury_address: string
        }[]
      }
    }
    Enums: {
      [_ in never]: never
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
