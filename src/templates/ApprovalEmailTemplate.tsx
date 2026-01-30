interface ApprovalEmailTemplateProps {
  invoiceNo: string;
  buyerEmail: string;
  tpcAmount: number;
  txHash: string;
  lang: 'id' | 'en';
}

const ApprovalEmailTemplate = ({ invoiceNo, buyerEmail, tpcAmount, txHash, lang }: ApprovalEmailTemplateProps) => {
  const isIndonesian = lang === 'id';
  
  const translations = {
    id: {
      title: 'Pembayaran Disetujui! 🎉',
      subtitle: 'TPC telah berhasil ditransfer ke wallet Anda',
      message: 'Selamat! Pembayaran Anda telah disetujui dan TPC telah ditransfer. Terima kasih telah bergabung dengan TPC Global.',
      invoiceNo: 'No. Invoice',
      tpcAmount: 'Jumlah TPC',
      transactionHash: 'Transaction Hash',
      viewOnSolscan: 'Lihat di Solscan',
      nextSteps: 'Langkah Selanjutnya',
      step1: 'Periksa wallet Anda untuk menerima TPC',
      step2: 'Simpan transaction hash sebagai bukti',
      step3: 'Ikuti pengumuman untuk DEX listing',
      viewInvoice: 'Lihat Detail Invoice',
      joinCommunity: 'Bergabung dengan Komunitas',
      contactSupport: 'Hubungi Support',
      companyName: 'TPC Global',
      website: 'www.tpcglobal.io',
      email: 'support@tpcglobal.io'
    },
    en: {
      title: 'Payment Approved! 🎉',
      subtitle: 'TPC has been successfully transferred to your wallet',
      message: 'Congratulations! Your payment has been approved and TPC has been transferred. Thank you for joining TPC Global.',
      invoiceNo: 'Invoice No.',
      tpcAmount: 'TPC Amount',
      transactionHash: 'Transaction Hash',
      viewOnSolscan: 'View on Solscan',
      nextSteps: 'Next Steps',
      step1: 'Check your wallet to receive TPC',
      step2: 'Save the transaction hash as proof',
      step3: 'Follow announcements for DEX listing',
      viewInvoice: 'View Invoice Details',
      joinCommunity: 'Join Community',
      contactSupport: 'Contact Support',
      companyName: 'TPC Global',
      website: 'www.tpcglobal.io',
      email: 'support@tpcglobal.io'
    }
  };

  const t = translations[lang];

  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${t.title}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f8f9fa;
        }
        
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        
        .header {
            background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
        }
        
        .header h1 {
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 10px;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }
        
        .header p {
            font-size: 16px;
            opacity: 0.9;
        }
        
        .content {
            padding: 40px 30px;
        }
        
        .success-box {
            background: #d4edda;
            border: 1px solid #c3e6cb;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 30px;
            color: #155724;
        }
        
        .invoice-info {
            background: #f8f9fa;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 30px;
        }
        
        .invoice-number {
            font-size: 20px;
            font-weight: 700;
            color: #28a745;
            margin-bottom: 15px;
        }
        
        .detail-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            padding-bottom: 10px;
            border-bottom: 1px solid #e9ecef;
        }
        
        .detail-row:last-child {
            border-bottom: none;
            margin-bottom: 0;
            padding-bottom: 0;
        }
        
        .detail-label {
            font-weight: 600;
            color: #666;
        }
        
        .detail-value {
            font-weight: 700;
            color: #333;
        }
        
        .tx-hash-box {
            background: white;
            border: 2px dashed #28a745;
            border-radius: 6px;
            padding: 15px;
            font-family: 'Courier New', monospace;
            font-size: 12px;
            word-break: break-all;
            margin: 10px 0;
        }
        
        .steps-section {
            margin-bottom: 30px;
        }
        
        .steps-title {
            font-weight: 700;
            margin-bottom: 20px;
            color: #333;
        }
        
        .step-item {
            display: flex;
            align-items: flex-start;
            margin-bottom: 15px;
            gap: 15px;
        }
        
        .step-number {
            background: #28a745;
            color: white;
            width: 24px;
            height: 24px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            font-size: 12px;
            flex-shrink: 0;
        }
        
        .action-buttons {
            display: flex;
            gap: 15px;
            justify-content: center;
            margin: 30px 0;
            flex-wrap: wrap;
        }
        
        .action-button {
            display: inline-block;
            background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
            color: white;
            text-decoration: none;
            padding: 15px 30px;
            border-radius: 8px;
            font-weight: 600;
            text-align: center;
            transition: transform 0.2s;
            flex: 1;
            min-width: 200px;
        }
        
        .action-button:hover {
            transform: translateY(-2px);
        }
        
        .action-button.secondary {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        
        .footer {
            background: #f8f9fa;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e9ecef;
        }
        
        .footer p {
            color: #666;
            font-size: 14px;
            margin-bottom: 10px;
        }
        
        .footer a {
            color: #28a745;
            text-decoration: none;
        }
        
        .footer a:hover {
            text-decoration: underline;
        }
        
        @media (max-width: 600px) {
            .container {
                margin: 10px;
                border-radius: 8px;
            }
            
            .header {
                padding: 30px 20px;
            }
            
            .content {
                padding: 30px 20px;
            }
            
            .action-buttons {
                flex-direction: column;
            }
            
            .action-button {
                min-width: auto;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <h1>${t.title}</h1>
            <p>${t.subtitle}</p>
        </div>
        
        <!-- Content -->
        <div class="content">
            <!-- Success Message -->
            <div class="success-box">
                <p>${t.message}</p>
                <p style="margin-top: 10px; font-size: 14px; font-style: italic;">
                    ${isIndonesian ? 'Status ditentukan berdasarkan pengecekan manual oleh admin.' : 'Status determined based on manual verification by admin.'}
                </p>
            </div>
            
            <!-- Invoice Info -->
            <div class="invoice-info">
                <div class="invoice-number">
                    ${t.invoiceNo}: ${invoiceNo}
                </div>
                
                <div class="detail-row">
                    <span class="detail-label">${isIndonesian ? 'Email' : 'Email'}:</span>
                    <span class="detail-value">${buyerEmail}</span>
                </div>
                
                <div class="detail-row">
                    <span class="detail-label">${t.tpcAmount}:</span>
                    <span class="detail-value">${tpcAmount.toLocaleString()} TPC</span>
                </div>
                
                <div class="detail-row">
                    <span class="detail-label">${t.transactionHash}:</span>
                    <span class="detail-value">
                        <a href="https://solscan.io/tx/${txHash}" target="_blank" style="color: #28a745; text-decoration: none;">
                            ${t.viewOnSolscan}
                        </a>
                    </span>
                </div>
                
                <div class="tx-hash-box">${txHash}</div>
            </div>
            
            <!-- Next Steps -->
            <div class="steps-section">
                <h3 class="steps-title">${t.nextSteps}:</h3>
                <div class="step-item">
                    <div class="step-number">1</div>
                    <div>${t.step1}</div>
                </div>
                <div class="step-item">
                    <div class="step-number">2</div>
                    <div>${t.step2}</div>
                </div>
                <div class="step-item">
                    <div class="step-number">3</div>
                    <div>${t.step3}</div>
                </div>
            </div>
            
            <!-- Action Buttons -->
            <div class="action-buttons">
                <a href="https://tpcglobal.io/${lang}/invoice/${invoiceNo}" class="action-button">
                    ${t.viewInvoice}
                </a>
                <a href="https://t.me/tpcglobal" class="action-button secondary" target="_blank">
                    ${t.joinCommunity}
                </a>
            </div>
        </div>
        
        <!-- Footer -->
        <div class="footer">
            <p><strong>${t.companyName}</strong></p>
            <p>
                <a href="https://tpcglobal.io">${t.website}</a> | 
                <a href="mailto:${t.email}">${t.email}</a>
            </p>
            <p style="margin-top: 20px; font-size: 12px; color: #999;">
                ${isIndonesian ? 'Email ini dikirim otomatis. Mohon tidak membalas email ini.' : 'This email was sent automatically. Please do not reply to this email.'}
            </p>
        </div>
    </div>
</body>
</html>`;
};

export default ApprovalEmailTemplate;
