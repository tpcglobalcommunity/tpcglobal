import { VendorApplication } from '@/lib/supabase';

export interface VendorApplicationInput {
  brand_name: string;
  category: string;
  description: string;
  website: string;
  contact_email: string;
}

export type VendorApplicationStatus = VendorApplication['status'];

// Re-export for convenience
export type { VendorApplication };
