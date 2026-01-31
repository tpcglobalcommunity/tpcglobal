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
      }
      profiles: {
        Row: {
          id: string
          updated_at: string
          username: string | null
          full_name: string | null
          avatar_url: string | null
          website: string | null
        }
        Insert: {
          id: string
          updated_at?: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          website?: string | null
        }
        Update: {
          id?: string
          updated_at?: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          website?: string | null
        }
      }
      tpc_invoices: {
        Row: {
          invoice_no: string
          stage: string
          tpc_amount: number
          unit_price_usd: number
          total_usd: number
          total_idr: number
          usd_idr_rate: number
          treasury_address: string
          status: string
          payment_method: string | null
          payer_name: string | null
          payer_ref: string | null
          tx_signature: string | null
          proof_url: string | null
          receiver_wallet: string | null
          buyer_email: string
          created_at: string
          expires_at: string
          reviewed_at: string | null
          review_note: string | null
          updated_at: string
        }
        Insert: {
          invoice_no: string
          stage?: string
          tpc_amount?: number
          unit_price_usd?: number
          total_usd?: number
          total_idr?: number
          usd_idr_rate?: number
          treasury_address?: string
          status?: string
          payment_method?: string | null
          payer_name?: string | null
          payer_ref?: string | null
          tx_signature?: string | null
          proof_url?: string | null
          receiver_wallet?: string | null
          buyer_email?: string
          created_at?: string
          expires_at?: string
          reviewed_at?: string | null
          review_note?: string | null
          updated_at?: string
        }
        Update: {
          invoice_no?: string
          stage?: string
          tpc_amount?: number
          unit_price_usd?: number
          total_usd?: number
          total_idr?: number
          usd_idr_rate?: number
          treasury_address?: string
          status?: string
          payment_method?: string | null
          payer_name?: string | null
          payer_ref?: string | null
          tx_signature?: string | null
          proof_url?: string | null
          receiver_wallet?: string | null
          buyer_email?: string
          created_at?: string
          expires_at?: string
          reviewed_at?: string | null
          review_note?: string | null
          updated_at?: string
        }
      }
      admin_whitelist: {
        Row: {
          user_id: string
          email: string
          note: string | null
          created_at: string
        }
        Insert: {
          user_id: string
          email?: string
          note?: string | null
          created_at?: string
        }
        Update: {
          user_id?: string
          email?: string
          note?: string | null
          created_at?: string
        }
      }
      admin_whitelist_audit: {
        Row: {
          id: number
          user_id: string
          action: string
          admin_id: string
          created_at: string
        }
        Insert: {
          id?: number
          user_id: string
          action: string
          admin_id: string
          created_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          action?: string
          admin_id?: string
          created_at?: string
        }
      }
      invoice_confirmations: {
        Row: {
          id: string
          invoice_no: string
          user_id: string | null
          payment_method: string
          payer_name: string | null
          payer_ref: string | null
          tx_signature: string | null
          proof_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          invoice_no: string
          user_id?: string | null
          payment_method: string
          payer_name?: string | null
          payer_ref?: string | null
          tx_signature?: string | null
          proof_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          invoice_no?: string
          user_id?: string | null
          payment_method?: string
          payer_name?: string | null
          payer_ref?: string | null
          tx_signature?: string | null
          proof_url?: string | null
          created_at?: string
        }
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
          stage: string;
          tpc_amount: number;
          unit_price_usd: number;
          total_usd: number;
          total_idr: number;
          usd_idr_rate: number;
          treasury_address: string;
          status: string;
          payment_method: string | null;
          payer_name: string | null;
          payer_ref: string | null;
          tx_signature: string | null;
          proof_url: string | null;
          receiver_wallet: string | null;
          created_at: string;
          expires_at: string;
          reviewed_at: string | null;
          review_note: string | null;
        }[]
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
      create_invoice: {
        Args: { p_email: string; p_tpc_amount: number; p_referral_code: string }
        Returns: {
          invoice_no: string;
          stage: string;
          tpc_amount: number;
          price_usd: number;
          total_usd: number;
          total_idr: number;
          usd_idr_rate: number;
          treasury_address: string;
          expires_at: string;
          status: string;
        }[]
      }
      update_invoice_email: {
        Args: { p_invoice_no: string; p_email: string }
        Returns: boolean
      }
      cancel_invoice: {
        Args: { p_invoice_no: string }
        Returns: boolean
      }
    }
    Enums: {}
    CompositeTypes: {}
  }
}

// Type helpers for Supabase
export type Tables<
  TableName extends keyof Database["public"]["Tables"]
> = Database["public"]["Tables"][TableName]

export type TablesInsert<
  TableName extends keyof Database["public"]["Tables"]
> = Database["public"]["Tables"][TableName]["Insert"]

export type TablesUpdate<
  TableName extends keyof Database["public"]["Tables"]
> = Database["public"]["Tables"][TableName]["Update"]

export type Enums<
  EnumName extends keyof Database["public"]["Enums"]
> = Database["public"]["Enums"][EnumName]

export type CompositeTypes<
  CompositeTypeName extends keyof Database["public"]["CompositeTypes"]
> = Database["public"]["CompositeTypes"][CompositeTypeName]
