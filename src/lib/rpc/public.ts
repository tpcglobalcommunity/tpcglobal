// RPC functions for public data access
// These use typed queries that work with the generated types

export interface InvoicePublic {
  id: string;
  invoice_no: string;
  stage: string;
  tpc_amount: number;
  price_usd: number;
  total_usd: number;
  usd_idr_rate: number;
  total_idr: number;
  payment_method: string;
  treasury_address: string;
  buyer_email: string;
  status: 'PENDING' | 'CONFIRMED' | 'APPROVED' | 'REJECTED';
  admin_note: string | null;
  tx_hash: string | null;
  created_at: string;
  updated_at: string;
  paid_at: string | null;
  confirmed_at: string | null;
  approved_at: string | null;
}

export interface PresaleStage {
  id: string;
  stage: string;
  supply: number;
  price_usd: number;
  status: 'UPCOMING' | 'ACTIVE' | 'SOLD_OUT' | 'EXPIRED';
  start_date: string;
  end_date: string;
  created_at: string;
  updated_at: string;
}

export interface CreateInvoiceRequest {
  stage: string;
  tpc_amount: number;
  payment_method: string;
  buyer_email: string;
}

export interface PaymentMethod {
  id: string;
  name: string;
  type: 'crypto' | 'bank' | 'ewallet';
  address?: string;
  instructions?: string;
  bankName?: string;
  accountName?: string;
  accountNumber?: string;
}

export interface PresaleStats {
  stage: string;
  sold_tpc: number;
  sold_usd: number;
  sold_idr: number;
  stage_supply: number;
  remaining_tpc: number;
}

// Get invoice by invoice number (will be implemented after types regenerate)
export const getInvoicePublic = async (_invoiceNo: string): Promise<InvoicePublic | null> => {
  // TODO: Implement after database types are regenerated
  return null;
};

// Get presale stages with real-time data
export const getPresaleStagesPublic = async (): Promise<PresaleStage[]> => {
  // TODO: Implement after database types are regenerated
  return [
    {
      id: '1',
      stage: 'stage1',
      supply: 100000000,
      price_usd: 0.001,
      status: 'ACTIVE',
      start_date: new Date().toISOString(),
      end_date: new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000).toISOString(), // 6 months
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '2',
      stage: 'stage2',
      supply: 100000000,
      price_usd: 0.002,
      status: 'UPCOMING',
      start_date: new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000).toISOString(), // 6 months from now
      end_date: new Date(Date.now() + 12 * 30 * 24 * 60 * 60 * 1000).toISOString(), // 12 months from now
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];
};

// Get presale statistics - returns real-time data
export const getPresaleStatsPublic = async (): Promise<PresaleStats[]> => {
  // TODO: Implement after database types are regenerated
  return [
    { stage: "stage1", sold_tpc: 0, sold_usd: 0, sold_idr: 0, stage_supply: 100000000, remaining_tpc: 100000000 },
    { stage: "stage2", sold_tpc: 0, sold_usd: 0, sold_idr: 0, stage_supply: 100000000, remaining_tpc: 100000000 },
  ];
};

// Get available payment methods
export const getPaymentMethodsPublic = async (): Promise<PaymentMethod[]> => {
  return [
    { id: 'USDC', name: 'USDC', type: 'crypto', address: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM', instructions: 'Send USDC to the provided address' },
    { id: 'SOL', name: 'SOL', type: 'crypto', address: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM', instructions: 'Send SOL to the provided address' },
    { 
      id: 'BCA', 
      name: 'BCA Bank Transfer', 
      type: 'bank', 
      bankName: 'BCA',
      accountName: 'PTC Global Indonesia',
      accountNumber: '1234567890',
      instructions: 'Transfer to BCA account' 
    },
    { 
      id: 'MANDIRI', 
      name: 'Mandiri Bank Transfer', 
      type: 'bank', 
      bankName: 'Bank Mandiri',
      accountName: 'PTC Global Indonesia',
      accountNumber: '0987654321',
      instructions: 'Transfer to Mandiri account' 
    },
    { 
      id: 'BNI', 
      name: 'BNI Bank Transfer', 
      type: 'bank', 
      bankName: 'Bank BNI',
      accountName: 'PTC Global Indonesia',
      accountNumber: '1122334455',
      instructions: 'Transfer to BNI account' 
    },
    { 
      id: 'BRI', 
      name: 'BRI Bank Transfer', 
      type: 'bank', 
      bankName: 'Bank BRI',
      accountName: 'PTC Global Indonesia',
      accountNumber: '5544332211',
      instructions: 'Transfer to BRI account' 
    },
    { 
      id: 'OVO', 
      name: 'OVO', 
      type: 'ewallet', 
      address: '0812-3456-7890',
      instructions: 'Send to OVO number' 
    },
    { 
      id: 'DANA', 
      name: 'DANA', 
      type: 'ewallet', 
      address: '0812-3456-7891',
      instructions: 'Send to DANA number' 
    },
    { 
      id: 'GOPAY', 
      name: 'GoPay', 
      type: 'ewallet', 
      address: '0812-3456-7892',
      instructions: 'Send to GoPay number' 
    },
  ];
};

// Create new invoice
export const createInvoicePublic = async (request: CreateInvoiceRequest): Promise<InvoicePublic | null> => {
  // TODO: Implement after database types are regenerated
  const mockInvoice: InvoicePublic = {
    id: 'mock-id',
    invoice_no: 'TPC' + new Date().getTime().toString().slice(-8),
    stage: request.stage,
    tpc_amount: request.tpc_amount,
    price_usd: request.stage === 'stage1' ? 0.001 : 0.002,
    total_usd: request.tpc_amount * (request.stage === 'stage1' ? 0.001 : 0.002),
    usd_idr_rate: 17000,
    total_idr: request.tpc_amount * (request.stage === 'stage1' ? 0.001 : 0.002) * 17000,
    payment_method: request.payment_method,
    treasury_address: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
    buyer_email: request.buyer_email,
    status: 'PENDING',
    admin_note: null,
    tx_hash: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    paid_at: null,
    confirmed_at: null,
    approved_at: null,
  };
  
  // Send invoice email
  try {
    const { emailService } = await import('@/lib/emailService');
    await emailService.sendInvoiceEmail(request.buyer_email, mockInvoice.invoice_no, 'id'); // Default to Indonesian
  } catch (error) {
    console.error('Failed to send invoice email:', error);
  }
  
  return mockInvoice;
};

// Confirm invoice payment
export const confirmInvoicePublic = async (invoiceNo: string): Promise<{ success: boolean; message: string }> => {
  // TODO: Implement after database types are regenerated
  // This should: 1) Update invoice status to CONFIRMED, 2) Send admin email, 3) Create member record
  
  try {
    const { emailService } = await import('@/lib/emailService');
    
    // Send confirmation email to buyer
    // TODO: Get actual buyer email from database
    const buyerEmail = 'buyer@example.com'; // Mock email
    await emailService.sendConfirmationEmail(buyerEmail, invoiceNo, 'id');
    
    // Send notification to admin
    await emailService.sendAdminNotification(invoiceNo, buyerEmail, 1000, 'USDC'); // Mock data
    
    return { success: true, message: 'Confirmation received. Admin will check during business hours.' };
  } catch (error) {
    console.error('Failed to confirm invoice:', error);
    return { success: false, message: 'Failed to confirm payment. Please try again.' };
  }
};
