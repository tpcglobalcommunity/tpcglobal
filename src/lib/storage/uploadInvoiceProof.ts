import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

export interface UploadProofOptions {
  file: File;
  invoiceNo: string;
}

export interface UploadProofResult {
  success: boolean;
  proofUrl?: string;
  error?: string;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];

export async function uploadInvoiceProof({ file, invoiceNo }: UploadProofOptions): Promise<UploadProofResult> {
  try {
    // Validation
    if (file.size > MAX_FILE_SIZE) {
      return {
        success: false,
        error: 'File size must be less than 5MB'
      };
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return {
        success: false,
        error: 'Only JPG, PNG, and PDF files are allowed'
      };
    }

    // Generate unique filename with timestamp
    const timestamp = Date.now();
    const fileExt = file.name.split('.').pop()?.toLowerCase() || '';
    const fileName = `${timestamp}.${fileExt}`;
    const filePath = `invoice-proofs/${invoiceNo}/${fileName}`;

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('invoice-proofs')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      logger.error('Failed to upload proof file', { error: uploadError, invoiceNo, fileName });
      return {
        success: false,
        error: 'Failed to upload file. Please try again.'
      };
    }

    // Get public URL (assuming bucket is public with appropriate policies)
    const { data: urlData } = supabase.storage
      .from('invoice-proofs')
      .getPublicUrl(filePath);

    const proofUrl = urlData.publicUrl;

    logger.info('Proof file uploaded successfully', { invoiceNo, filePath, proofUrl });

    return {
      success: true,
      proofUrl
    };

  } catch (error) {
    logger.error('Unexpected error during proof upload', { error, invoiceNo });
    return {
      success: false,
      error: 'An unexpected error occurred. Please try again.'
    };
  }
}

export function validateProofFile(file: File): { isValid: boolean; error?: string } {
  if (file.size > MAX_FILE_SIZE) {
    return {
      isValid: false,
      error: 'File size must be less than 5MB'
    };
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      isValid: false,
      error: 'Only JPG, PNG, and PDF files are allowed'
    };
  }

  return { isValid: true };
}
