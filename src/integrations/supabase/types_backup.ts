export type Json =
  | string
  | number
  | { [key: string]: Json | undefined }
  | Json[]

export interface PresaleSettings {
  active_stage: string;
  stage1_price_usd: number;
  stage2_price_usd: number;
  usd_idr_rate: number;
  treasury_address: string;
}

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
      admin_whitelist_audit: {
        Row: {
          id: number
          action: 'ADD' | 'REMOVE'
          target_user_id: string
          note: string | null
          actor_user_id: string
          created_at: string
        }
        Insert: {
          id?: number
          action: 'ADD' | 'REMOVE'
          target_user_id: string
          note?: string | null
          actor_user_id: string
          created_at?: string
        }
        Update: {
          id?: number
          action?: 'ADD' | 'REMOVE'
          target_user_id?: string
          note?: string | null
          actor_user_id?: string
          created_at?: string
        }
        Relationships: []
      }
      invoice_confirmations: {
        Row: {
          id: number
          invoice_no: string
          user_id: string
          payment_method: string
          payer_name: string | null
          payer_ref: string | null
          tx_signature: string | null
          proof_url: string | null
          created_at: string
        }
        Insert: {
          id?: number
          invoice_no: string
          user_id: string
          payment_method: string
          payer_name?: string | null
          payer_ref?: string | null
          tx_signature?: string | null
          proof_url?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          invoice_no?: string
          user_id?: string
          payment_method?: string
          payer_name?: string | null
          payer_ref?: string | null
          tx_signature?: string | null
          proof_url?: string | null
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
      admin_whitelist_list: {
        Args: Record<PropertyKey, never>
        Returns: {
          user_id: string
          email: string
          note: string | null
          created_at: string
        }[]
      }
      get_invoice_public: {
        Args: { p_invoice_no: string }
        Returns: {
          invoice_no: string;
          status: string;
          stage: string;
          tpc_amount: number;
          total_usd: number;
          total_idr: number;
          treasury_address: string;
          created_at: string;
          expires_at: string;
        }[]
      }
      admin_whitelist_add: {
        Args: { p_user_id: string; p_note?: string }
        Returns: void
      }
      admin_whitelist_remove: {
        Args: { p_user_id: string }
        Returns: void
      }
      get_presale_settings_public: {
        Args: {}
        Returns: PresaleSettings[]
      }
      submit_invoice_confirmation: {
        Args: { 
          p_invoice_no: string; 
          p_payment_method: string; 
          p_payer_name: string; 
          p_payer_ref: string; 
          p_tx_signature: string; 
          p_proof_url: string; 
        }
        Returns: {
          success: boolean;
          invoice_no: string;
          status: string;
          payment_method: string;
          confirmation_id: string;
        }[]
      }
    Views: {
      [_ in never]: never
    }
    Enums: {}
    CompositeTypes: {}
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
    | keyof Database["public"]["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
    : DefaultSchemaEnumNameOrOptions extends keyof Database["public"]["Enums"]
    ? Database["public"]["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof Database["public"]["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
    : PublicCompositeTypeNameOrOptions extends keyof Database["public"]["CompositeTypes"]
    ? Database["public"]["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
