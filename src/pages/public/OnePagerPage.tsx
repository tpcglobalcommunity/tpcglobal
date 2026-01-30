import React from 'react';
import { useI18n } from "@/i18n/i18n";
import { PremiumShell } from "@/components/layout/PremiumShell";
import { Download, FileText, Globe, ExternalLink } from "lucide-react";

const OnePagerPage: React.FC = () => {
  const { t, lang } = useI18n();
  const isIndonesian = lang === 'id';

  return (
    <PremiumShell>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {isIndonesian ? 'One-Pager TPC' : 'TPC One-Pager'}
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            {isIndonesian 
              ? 'Informasi lengkap tentang Trader Professional Community (TPC)' 
              : 'Complete information about Trader Professional Community (TPC)'
            }
          </p>
          
          {/* Download Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <a
              href="https://tpcglobal.io/whitepaper"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-gold-500 text-black hover:bg-gold-400 rounded-md text-sm font-medium h-12 px-6 text-base transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 focus-visible:ring-offset-2"
            >
              <Download className="h-4 w-4 mr-1" />
              {t("onePager.downloadWhitepaper")}
            </a>
            
            <a
              href="https://tpcglobal.io/one-pager"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 border border-neutral-700 text-white hover:bg-neutral-800 rounded-md text-sm font-medium h-12 px-6 text-base transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 focus-visible:ring-offset-2"
            >
              <ExternalLink className="h-4 w-4 mr-1" />
              {t("onePager.downloadOnePager")}
            </a>
          </div>
          
          <p className="text-sm text-gray-500">
            {isIndonesian 
              ? 'PDF berisi informasi resmi TPC tanpa hype, siap untuk dibagikan kepada partner dan komunitas.' 
              : 'PDF contains official TPC information without hype, ready to share with partners and community.'
            }
          </p>
        </div>

        {/* Content Preview */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
          <div className="flex items-center gap-2 mb-6">
            <FileText className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">
              {isIndonesian ? 'Pratinjau Konten' : 'Content Preview'}
            </h2>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {t('onePager.title')}
              </h3>
              <p className="text-gray-600">
                {t('onePager.description')}
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {t('onePager.notTitle')}
              </h3>
              <div className="text-gray-600 whitespace-pre-line">
                {t('onePager.notDescription')}
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {t('onePager.verifyTitle')}
              </h3>
              <div className="text-gray-600 whitespace-pre-line">
                {t('onePager.verifyDescription')}
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {t('onePager.presaleTitle')}
              </h3>
              <div className="text-gray-600 whitespace-pre-line">
                {t('onePager.presaleDescription')}
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {t('onePager.safetyTitle')}
              </h3>
              <div className="text-gray-600 whitespace-pre-line">
                {t('onePager.safetyDescription')}
              </div>
            </div>
          </div>
        </div>

        {/* Verification URLs */}
        <div className="bg-blue-50 rounded-lg p-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-blue-900">
              {isIndonesian ? 'URL Verifikasi Resmi' : 'Official Verification URLs'}
            </h3>
          </div>
          <div className="space-y-2">
            <a 
              href="https://tpcglobal.io/verified" 
              target="_blank" 
              rel="noopener noreferrer"
              className="block text-blue-600 hover:text-blue-800 underline"
            >
              https://tpcglobal.io/verified
            </a>
            <a 
              href="https://tpcglobal.io/transparency" 
              target="_blank" 
              rel="noopener noreferrer"
              className="block text-blue-600 hover:text-blue-800 underline"
            >
              https://tpcglobal.io/transparency
            </a>
          </div>
        </div>

        {/* Footer Disclaimer */}
        <div className="text-center">
          <p className="text-sm text-gray-500 italic">
            {t('onePager.footerDisclaimer')}
          </p>
        </div>
      </div>
    </PremiumShell>
  );
};

export default OnePagerPage;
