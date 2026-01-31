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
    console.log("Starting upload...", { fileName: file.name, fileSize: file.size, fileType: file.type });
    
    // Validation
    if (file.size > MAX_FILE_SIZE) {
      console.error("File too large:", file.size, "max:", MAX_FILE_SIZE);
      return {
        success: false,
        error: 'File size must be less than 5MB'
      };
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      console.error("Invalid file type:", file.type, "allowed:", ALLOWED_TYPES);
      return {
        success: false,
        error: 'Only JPG, PNG, and PDF files are allowed'
      };
    }

    // Generate unique filename with timestamp
    const timestamp = Date.now();
    const fileExt = file.name.split('.').pop()?.toLowerCase() || '';
    const fileName = `${timestamp}-${file.name}`;
    const filePath = `invoice-proofs/${invoiceNo}/${fileName}`;

    console.log("Uploading to path:", filePath);
    console.log("Using bucket name: invoice-proofs");

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('invoice-proofs')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      logger.error('Failed to upload proof file', { error: uploadError, invoiceNo, fileName });
      
      // More specific error messages
      let errorMessage = 'Failed to upload file. Please try again.';
      if (uploadError.message.includes('Bucket not found') || uploadError.message.includes('The bucket') || uploadError.message.includes('StorageError: bucket_not_found')) {
        errorMessage = 'Bucket invoice-proofs belum dibuat di Supabase Storage.';
        if (import.meta.env.DEV) {
          console.warn('DEV: Bucket "invoice-proofs" not found. Please create it in Supabase Storage with:');
          console.warn('- Name: invoice-proofs');
          console.warn('- Private: true');
          console.warn('- Allowed: jpg/png/pdf');
          console.warn('- Limit: 10MB');
        }
      } else if (uploadError.message.includes('duplicate')) {
        errorMessage = 'File already exists. Please try again with a different file.';
      } else if (uploadError.message.includes('quota')) {
        errorMessage = 'Storage quota exceeded. Please contact support.';
      }
      
      return {
        success: false,
        error: errorMessage
      };
    }

    console.log("Upload successful:", uploadData);

    // Get public URL (assuming bucket is public with appropriate policies)
    const { data: urlData } = supabase.storage
      .from('invoice-proofs')
      .getPublicUrl(filePath);

    const proofUrl = urlData.publicUrl;
    console.log("Public URL generated:", proofUrl);

    logger.info('Proof file uploaded successfully', { invoiceNo, filePath, proofUrl });

    return {
      success: true,
      proofUrl
    };

  } catch (error) {
    console.error("Unexpected error during proof upload:", error);
    logger.error('Unexpected error during proof upload', { error, invoiceNo });
    
    // More specific error handling
    let errorMessage = 'An unexpected error occurred. Please try again.';
    if (error instanceof Error) {
      if (error.message.includes('Bucket not found') || error.message.includes('StorageError: bucket_not_found')) {
        errorMessage = 'Bucket invoice-proofs belum dibuat di Supabase Storage.';
        if (import.meta.env.DEV) {
          console.warn('DEV: Bucket "invoice-proofs" not found. Please create it in Supabase Storage with:');
          console.warn('- Name: invoice-proofs');
          console.warn('- Private: true');
          console.warn('- Allowed: jpg/png/pdf');
          console.warn('- Limit: 10MB');
        }
      } else if (error.message.includes('Network')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else if (error.message.includes('timeout')) {
        errorMessage = 'Upload timeout. Please try again.';
      }
    }
    
    return {
      success: false,
      error: errorMessage
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
