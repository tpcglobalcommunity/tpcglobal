import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "https://esm.sh/resend@2.0.0";

// CORS headers for cross-origin requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Explicit environment validation
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      console.log("[EDGE] RESEND_API_KEY is missing");
      throw new Error("RESEND_API_KEY is missing");
    }

    const FROM_EMAIL = Deno.env.get("FROM_EMAIL") ?? "onboarding@resend.dev";
    console.log("[EDGE] Using FROM_EMAIL:", FROM_EMAIL);

    // Only allow POST requests
    if (req.method !== "POST") {
      return new Response("Method not allowed", { 
        status: 405, 
        headers: corsHeaders 
      });
    }

    // Parse request body
    const body = await req.json();
    console.log("[EDGE] Incoming payload:", body);
    
    const { invoice_no, email, lang = "id" } = body;

    // Hard validation - fail fast
    if (!invoice_no) {
      console.log("[EDGE] Validation failed: missing invoice_no");
      return new Response(
        JSON.stringify({ 
          success: false, 
          step: "validation",
          error: "Missing required field: invoice_no" 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    if (!email) {
      console.log("[EDGE] Validation failed: missing email");
      return new Response(
        JSON.stringify({ 
          success: false, 
          step: "validation",
          error: "Missing required field: email" 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    console.log("[EDGE] Validation passed:", { invoice_no, email, lang, FROM_EMAIL });

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseKey) {
      console.log("[EDGE] Missing Supabase configuration");
      return new Response(
        JSON.stringify({ 
          success: false, 
          step: "config",
          error: "Supabase configuration missing" 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch invoice data using RPC with structured logging
    console.log("[EDGE] Fetching invoice:", invoice_no);
    const { data: invoice, error: invoiceError } = await supabase
      .rpc('get_invoice_public', { p_invoice_no: invoice_no });

    console.log("[EDGE] RPC result:", { invoice, invoiceError });

    if (invoiceError) {
      console.log("[EDGE] RPC error:", invoiceError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          step: "fetch-invoice",
          error: `Failed to fetch invoice: ${invoiceError.message}` 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    if (!invoice) {
      console.log("[EDGE] Invoice not found:", invoice_no);
      return new Response(
        JSON.stringify({ 
          success: false, 
          step: "fetch-invoice",
          error: "Invoice not found" 
        }),
        { 
          status: 404, 
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    console.log("[EDGE] Invoice data found:", {
      invoice_no: invoice.invoice_no,
      status: invoice.status,
      tpc_amount: invoice.tpc_amount,
      total_usd: invoice.total_usd
    });

    // Build email content
    const siteUrl = Deno.env.get("SITE_URL") || "http://localhost:8084";
    const confirmUrl = `${siteUrl}/auth/callback?next=${encodeURIComponent(`/${lang}/member/invoices/${invoice_no}`)}`;
    
    console.log("[EDGE] Building email content:", { siteUrl, confirmUrl });
    
    const emailHtml = buildInvoiceEmailHtml(invoice, lang, confirmUrl, siteUrl);
    const subject = lang === "id" ? `Invoice TPC - ${invoice_no}` : `TPC Invoice - ${invoice_no}`;

    // Initialize Resend client
    console.log("[EDGE] Initializing Resend client");
    const resend = new Resend(resendApiKey);

    // Send email via Resend with hardened error handling
    console.log("[EDGE] Sending email via Resend:", { to: email, from: FROM_EMAIL, subject });

    let sendResult;
    try {
      sendResult = await resend.emails.send({
        from: FROM_EMAIL,
        to: email,
        subject: subject,
        html: emailHtml,
      });
      
      console.log("[EDGE] Resend response:", sendResult);

    } catch (err) {
      console.error("[EDGE][RESEND ERROR]", err);
      return new Response(
        JSON.stringify({
          success: false,
          step: "resend",
          error: err.message ?? "Resend failed",
        }),
        { status: 500, headers: corsHeaders }
      );
    }

    // Return success only if Resend OK
    if (!sendResult?.id) {
      console.log("[EDGE] No messageId from Resend");
      return new Response(
        JSON.stringify({
          success: false,
          step: "resend",
          error: "No messageId returned from Resend",
        }),
        { status: 500, headers: corsHeaders }
      );
    }

    // Success response
    console.log("[EDGE] Function completed successfully:", { messageId: sendResult.id });
    return new Response(
      JSON.stringify({ 
        success: true, 
        invoice_no,
        messageId: sendResult.id
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );

  } catch (error) {
    console.log("[EDGE] Unexpected error:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        step: "unknown",
        error: `Internal server error: ${error.message}` 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});

function buildInvoiceEmailHtml(invoice: any, lang: string, confirmUrl: string, siteUrl: string): string {
  const isIndonesian = lang === "id";
  
  const translations = {
    id: {
      title: "INVOICE PEMBELIAN TPC",
      subtitle: "Terima kasih telah bergabung dengan presale TPC Global",
      invoiceDetails: "Detail Invoice",
      invoiceNo: "No. Invoice",
      status: "Status",
      expires: "Kadaluarsa",
      stage: "Stage",
      tpcAmount: "Jumlah TPC",
      totalUsd: "Total USD",
      totalIdr: "Total IDR",
      confirmPayment: "Konfirmasi Pembayaran",
      securityWarning: "⚠️ PERINGATAN KEAMANAN",
      securityText: "Gunakan hanya halaman resmi ini. Jangan transfer lewat DM atau pihak lain.",
      companyName: "TPC Global",
      website: "www.tpcglobal.io",
      email: "support@tpcglobal.io"
    },
    en: {
      title: "TPC PURCHASE INVOICE",
      subtitle: "Thank you for joining the TPC Global presale",
      invoiceDetails: "Invoice Details",
      invoiceNo: "Invoice No.",
      status: "Status",
      expires: "Expires",
      stage: "Stage",
      tpcAmount: "TPC Amount",
      totalUsd: "Total USD",
      totalIdr: "Total IDR",
      confirmPayment: "Confirm Payment",
      securityWarning: "⚠️ SECURITY WARNING",
      securityText: "Use only this official page. Do not transfer via DM or third parties.",
      companyName: "TPC Global",
      website: "www.tpcglobal.io",
      email: "support@tpcglobal.io"
    }
  };

  const t = translations[lang as keyof typeof translations];
  
  // Format dates
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  // Format numbers
  const formatUSD = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD"
    }).format(value);
  };

  const formatIDR = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR"
    }).format(value);
  };

  // Status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "UNPAID": return "#ef4444";
      case "PENDING_REVIEW": return "#f59e0b";
      case "PAID": return "#10b981";
      default: return "#6b7280";
    }
  };

  return `
<!DOCTYPE html>
<html lang="${lang}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${t.title}</title>
    <style>
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        background: #0b0f14;
        color: #f8fafc;
        margin: 0;
        padding: 20px;
        line-height: 1.6;
      }
      .container {
        max-width: 600px;
        margin: 0 auto;
        background: #1e293b;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      }
      .header {
        background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
        padding: 30px;
        text-align: center;
      }
      .header h1 {
        margin: 0;
        font-size: 24px;
        font-weight: bold;
        color: #0b0f14;
      }
      .header p {
        margin: 8px 0 0 0;
        color: #0b0f14;
        opacity: 0.8;
      }
      .content {
        padding: 30px;
      }
      .invoice-info {
        background: #374151;
        padding: 20px;
        border-radius: 8px;
        margin-bottom: 20px;
      }
      .invoice-number {
        font-size: 18px;
        font-weight: bold;
        margin-bottom: 15px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .status-badge {
        background: ${getStatusColor(invoice.status)};
        color: white;
        padding: 4px 12px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 500;
      }
      .invoice-meta {
        display: grid;
        gap: 8px;
        font-size: 14px;
      }
      .details-table {
        width: 100%;
        border-collapse: collapse;
        margin: 20px 0;
        background: #374151;
        border-radius: 8px;
        overflow: hidden;
      }
      .details-table th,
      .details-table td {
        padding: 12px;
        text-align: left;
        border-bottom: 1px solid #4b5563;
      }
      .details-table th {
        background: #4b5563;
        font-weight: 600;
      }
      .amount-cell {
        font-weight: bold;
        color: #fbbf24;
      }
      .cta-button {
        display: inline-block;
        background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
        color: #0b0f14;
        text-decoration: none;
        padding: 16px 32px;
        border-radius: 8px;
        font-weight: bold;
        text-align: center;
        margin: 20px 0;
        transition: transform 0.2s;
      }
      .cta-button:hover {
        transform: translateY(-2px);
      }
      .security-warning {
        background: rgba(239, 68, 68, 0.1);
        border: 1px solid #ef4444;
        border-radius: 8px;
        padding: 20px;
        margin: 20px 0;
      }
      .security-warning p {
        margin: 0;
        font-size: 14px;
      }
      .footer {
        text-align: center;
        padding: 20px;
        border-top: 1px solid #374151;
        font-size: 12px;
        color: #9ca3af;
      }
      .footer a {
        color: #fbbf24;
        text-decoration: none;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>${t.title}</h1>
        <p>${t.subtitle}</p>
      </div>
      
      <div class="content">
        <div class="invoice-info">
          <div class="invoice-number">
            ${t.invoiceNo}: ${invoice.invoice_no}
            <span class="status-badge">${invoice.status}</span>
          </div>
          <div class="invoice-meta">
            <div><strong>${isIndonesian ? 'Tanggal' : 'Date'}:</strong> ${formatDate(invoice.created_at)}</div>
            <div><strong>${t.expires}:</strong> ${formatDate(invoice.expires_at)}</div>
            <div><strong>${t.stage}:</strong> ${invoice.stage.toUpperCase()}</div>
          </div>
        </div>
        
        <table class="details-table">
          <thead>
            <tr>
              <th>${t.tpcAmount}</th>
              <th>${t.totalUsd}</th>
              <th>${t.totalIdr}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>${invoice.tpc_amount.toLocaleString()} TPC</td>
              <td class="amount-cell">${formatUSD(invoice.total_usd)}</td>
              <td class="amount-cell">${formatIDR(invoice.total_idr)}</td>
            </tr>
          </tbody>
        </table>
        
        <div style="text-align: center;">
          <a href="${confirmUrl}" class="cta-button">
            ${t.confirmPayment}
          </a>
        </div>
        
        <div class="security-warning">
          <p><strong>${t.securityWarning}</strong></p>
          <p>${t.securityText}</p>
        </div>
      </div>
      
      <div class="footer">
        <p><strong>${t.companyName}</strong></p>
        <p>
          <a href="${siteUrl}">${t.website}</a> | 
          <a href="mailto:${t.email}">${t.email}</a>
        </p>
        <p style="margin-top: 10px; font-size: 10px; opacity: 0.7;">
          ${isIndonesian 
            ? 'Email ini dikirim otomatis. Mohon tidak membalas email ini.' 
            : 'This email was sent automatically. Please do not reply to this email.'}
        </p>
      </div>
    </div>
  </body>
</html>
  `;
}
