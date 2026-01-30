import React from 'react';
import { useI18n } from '@/i18n/i18n';

interface OnePagerPDFProps {
  lang: 'en' | 'id';
}

const OnePagerPDF: React.FC<OnePagerPDFProps> = ({ lang }) => {
  const { t } = useI18n();
  const isIndonesian = lang === 'id';

  return (
    <div style={{
      fontFamily: 'Arial, sans-serif',
      color: '#333',
      lineHeight: '1.6',
      maxWidth: '800px',
      margin: '0 auto',
      padding: '40px',
      backgroundColor: '#fff',
      minHeight: '100vh'
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ 
          fontSize: '32px', 
          fontWeight: 'bold', 
          color: '#1a1a1a',
          marginBottom: '10px'
        }}>
          Trader Professional Community (TPC)
        </h1>
      </div>

      {/* Title */}
      <div style={{ marginBottom: '30px' }}>
        <h2 style={{ 
          fontSize: '24px', 
          fontWeight: 'bold', 
          color: '#333',
          marginBottom: '15px'
        }}>
          {t('onePager.title')}
        </h2>
        <p style={{ 
          fontSize: '16px', 
          lineHeight: '1.6',
          textAlign: 'justify'
        }}>
          {t('onePager.description')}
        </p>
      </div>

      {/* What TPC Is NOT */}
      <div style={{ marginBottom: '30px' }}>
        <h2 style={{ 
          fontSize: '24px', 
          fontWeight: 'bold', 
          color: '#333',
          marginBottom: '15px'
        }}>
          {t('onePager.notTitle')}
        </h2>
        <div style={{ 
          fontSize: '16px', 
          lineHeight: '1.6',
          whiteSpace: 'pre-line'
        }}>
          {t('onePager.notDescription')}
        </div>
      </div>

      {/* How to Verify TPC */}
      <div style={{ marginBottom: '30px' }}>
        <h2 style={{ 
          fontSize: '24px', 
          fontWeight: 'bold', 
          color: '#333',
          marginBottom: '15px'
        }}>
          {t('onePager.verifyTitle')}
        </h2>
        <div style={{ 
          fontSize: '16px', 
          lineHeight: '1.6',
          whiteSpace: 'pre-line'
        }}>
          {t('onePager.verifyDescription')}
        </div>
        
        {/* URLs */}
        <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '5px' }}>
          <p style={{ fontWeight: 'bold', marginBottom: '10px' }}>
            {isIndonesian ? 'URL Verifikasi Resmi:' : 'Official Verification URLs:'}
          </p>
          <p style={{ margin: '5px 0' }}>
            https://tpcglobal.io/verified
          </p>
          <p style={{ margin: '5px 0' }}>
            https://tpcglobal.io/transparency
          </p>
        </div>
      </div>

      {/* Presale Basics */}
      <div style={{ marginBottom: '30px' }}>
        <h2 style={{ 
          fontSize: '24px', 
          fontWeight: 'bold', 
          color: '#333',
          marginBottom: '15px'
        }}>
          {t('onePager.presaleTitle')}
        </h2>
        <div style={{ 
          fontSize: '16px', 
          lineHeight: '1.6',
          whiteSpace: 'pre-line'
        }}>
          {t('onePager.presaleDescription')}
        </div>
      </div>

      {/* Safety Checklist */}
      <div style={{ marginBottom: '30px' }}>
        <h2 style={{ 
          fontSize: '24px', 
          fontWeight: 'bold', 
          color: '#333',
          marginBottom: '15px'
        }}>
          {t('onePager.safetyTitle')}
        </h2>
        <div style={{ 
          fontSize: '16px', 
          lineHeight: '1.6',
          whiteSpace: 'pre-line'
        }}>
          {t('onePager.safetyDescription')}
        </div>
      </div>

      {/* Footer Disclaimer */}
      <div style={{ 
        marginTop: '50px',
        padding: '20px',
        borderTop: '1px solid #ddd'
      }}>
        <p style={{ 
          fontSize: '14px', 
          textAlign: 'center',
          fontStyle: 'italic',
          color: '#666'
        }}>
          {t('onePager.footerDisclaimer')}
        </p>
      </div>
    </div>
  );
};

export default OnePagerPDF;
