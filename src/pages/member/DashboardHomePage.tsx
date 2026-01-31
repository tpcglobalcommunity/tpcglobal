import React from "react";
import { useNavigate } from "react-router-dom";
import { FileText, TrendingUp, Calendar, DollarSign, ArrowRight } from "lucide-react";
import { useI18n } from "@/i18n/i18n";

const DashboardHomePage = () => {
  const { t, lang } = useI18n();
  const navigate = useNavigate();

  const quickActions = [
    {
      icon: DollarSign,
      title: t("dashboard.quickActions.createInvoice"),
      description: t("dashboard.quickActions.createInvoiceDesc"),
      path: `/${lang}/buytpc`
    },
    {
      icon: FileText,
      title: t("dashboard.quickActions.viewInvoices"),
      description: t("dashboard.quickActions.viewInvoicesDesc"),
      path: `/${lang}/dashboard/invoices`
    },
    {
      icon: TrendingUp,
      title: t("dashboard.quickActions.viewStats"),
      description: t("dashboard.quickActions.viewStatsDesc"),
      path: `/${lang}/dashboard/invoices`
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2" style={{ color: '#F0B90B' }}>
          {t("dashboard.title")}
        </h1>
        <p style={{ color: '#9CA3AF' }}>
          {t("dashboard.welcome")}
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 rounded-xl" 
             style={{
               backgroundColor: '#0F1624',
               border: '1px solid rgba(240,185,11,0.25)'
             }}>
          <div className="flex items-center justify-between mb-4">
            <FileText className="w-8 h-8" style={{ color: 'rgba(240,185,11,0.35)' }} />
            <span className="text-2xl font-bold" style={{ color: '#E5E7EB' }}>
              0
            </span>
          </div>
          <p style={{ color: '#9CA3AF' }}>{t("dashboard.stats.totalInvoices")}</p>
        </div>

        <div className="p-6 rounded-xl" 
             style={{
               backgroundColor: '#0F1624',
               border: '1px solid rgba(240,185,11,0.25)'
             }}>
          <div className="flex items-center justify-between mb-4">
            <DollarSign className="w-8 h-8" style={{ color: 'rgba(240,185,11,0.35)' }} />
            <span className="text-2xl font-bold" style={{ color: '#E5E7EB' }}>
              0
            </span>
          </div>
          <p style={{ color: '#9CA3AF' }}>{t("dashboard.stats.totalTPC")}</p>
        </div>

        <div className="p-6 rounded-xl" 
             style={{
               backgroundColor: '#0F1624',
               border: '1px solid rgba(240,185,11,0.25)'
             }}>
          <div className="flex items-center justify-between mb-4">
            <TrendingUp className="w-8 h-8" style={{ color: 'rgba(240,185,11,0.35)' }} />
            <span className="text-2xl font-bold" style={{ color: '#E5E7EB' }}>
              0
            </span>
          </div>
          <p style={{ color: '#9CA3AF' }}>{t("dashboard.stats.completed")}</p>
        </div>

        <div className="p-6 rounded-xl" 
             style={{
               backgroundColor: '#0F1624',
               border: '1px solid rgba(240,185,11,0.25)'
             }}>
          <div className="flex items-center justify-between mb-4">
            <Calendar className="w-8 h-8" style={{ color: 'rgba(240,185,11,0.35)' }} />
            <span className="text-2xl font-bold" style={{ color: '#E5E7EB' }}>
              0
            </span>
          </div>
          <p style={{ color: '#9CA3AF' }}>{t("dashboard.stats.pending")}</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-xl" 
             style={{
               backgroundColor: '#0F1624',
               border: '1px solid rgba(240,185,11,0.25)'
             }}>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: '#E5E7EB' }}>
            <TrendingUp className="w-5 h-5" style={{ color: 'rgba(240,185,11,0.35)' }} />
            {t("dashboard.quickActions.title")}
          </h2>
          
          <div className="space-y-3">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <button
                  key={index}
                  onClick={() => navigate(action.path)}
                  className="w-full flex items-center justify-between p-4 rounded-lg transition-all hover:bg-[rgba(240,185,11,0.05)]"
                  style={{ border: '1px solid rgba(255,255,255,0.12)' }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center"
                         style={{ backgroundColor: 'rgba(240,185,11,0.15)' }}>
                      <Icon className="w-5 h-5" style={{ color: '#F0B90B' }} />
                    </div>
                    <div className="text-left">
                      <p className="font-medium" style={{ color: '#E5E7EB' }}>
                        {action.title}
                      </p>
                      <p className="text-sm" style={{ color: '#9CA3AF' }}>
                        {action.description}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5" style={{ color: '#9CA3AF' }} />
                </button>
              );
            })}
          </div>
        </div>

        {/* Recent Activity Placeholder */}
        <div className="p-6 rounded-xl" 
             style={{
               backgroundColor: '#0F1624',
               border: '1px solid rgba(240,185,11,0.25)'
             }}>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: '#E5E7EB' }}>
            <Calendar className="w-5 h-5" style={{ color: 'rgba(240,185,11,0.35)' }} />
            {t("dashboard.recentActivity.title")}
          </h2>
          
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                 style={{ backgroundColor: 'rgba(240,185,11,0.15)' }}>
              <FileText className="w-8 h-8" style={{ color: '#F0B90B' }} />
            </div>
            <h3 className="text-lg font-medium mb-2" style={{ color: '#E5E7EB' }}>
              {t("dashboard.recentActivity.emptyTitle")}
            </h3>
            <p className="text-sm mb-4" style={{ color: '#9CA3AF' }}>
              {t("dashboard.recentActivity.emptySubtitle")}
            </p>
            <button
              onClick={() => navigate(`/${lang}/dashboard/invoices`)}
              className="px-6 py-2 font-medium rounded-lg transition-all"
              style={{
                background: 'linear-gradient(180deg, #F0B90B, #D9A441)',
                color: '#111827'
              }}
            >
              {t("dashboard.recentActivity.viewInvoices")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHomePage;
