import React from "react";
import { Settings, User, Bell, Shield, Globe } from "lucide-react";
import { useI18n } from "@/i18n/i18n";

const MemberSettingsPage = () => {
  const { t } = useI18n();

  const settingsSections = [
    {
      icon: User,
      title: "Profile Settings",
      description: "Manage your account information and preferences",
      comingSoon: true
    },
    {
      icon: Bell,
      title: "Notifications",
      description: "Configure email and push notifications",
      comingSoon: true
    },
    {
      icon: Shield,
      title: "Security",
      description: "Password, 2FA, and login preferences",
      comingSoon: true
    },
    {
      icon: Globe,
      title: "Language & Region",
      description: "Set your language and regional preferences",
      comingSoon: true
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2" style={{ color: '#F0B90B' }}>
          {t("member.nav.settings")}
        </h1>
        <p style={{ color: '#9CA3AF' }}>
          Manage your account settings and preferences
        </p>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {settingsSections.map((section, index) => {
          const Icon = section.icon;
          return (
            <div
              key={index}
              className="p-6 rounded-xl transition-all"
              style={{
                backgroundColor: '#0F1624',
                border: '1px solid rgba(240,185,11,0.25)'
              }}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                     style={{ backgroundColor: 'rgba(240,185,11,0.15)' }}>
                  <Icon className="w-6 h-6" style={{ color: '#F0B90B' }} />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-2" style={{ color: '#E5E7EB' }}>
                    {section.title}
                  </h3>
                  <p className="text-sm mb-3" style={{ color: '#9CA3AF' }}>
                    {section.description}
                  </p>
                  {section.comingSoon && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
                          style={{
                            backgroundColor: 'rgba(240,185,11,0.1)',
                            color: '#F0B90B',
                            border: '1px solid rgba(240,185,11,0.2)'
                          }}>
                      Coming Soon
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Coming Soon Notice */}
      <div className="p-6 rounded-xl text-center" 
           style={{
             backgroundColor: 'rgba(240,185,11,0.1)',
             border: '1px solid rgba(240,185,11,0.2)'
           }}>
        <Settings className="w-12 h-12 mx-auto mb-4" style={{ color: '#F0B90B' }} />
        <h3 className="text-xl font-semibold mb-2" style={{ color: '#E5E7EB' }}>
          Settings Coming Soon
        </h3>
        <p style={{ color: '#9CA3AF' }}>
          We're working on bringing you comprehensive account settings and preferences. 
          Stay tuned for updates!
        </p>
      </div>
    </div>
  );
};

export default MemberSettingsPage;
