import { Link } from "@/components/Router";
import { type Language } from "@/i18n";
import { PremiumCard, PremiumButton } from "@/components/ui";
import { 
  Users, 
  Store, 
  TrendingUp, 
  Ticket,
  ArrowRight,
  Eye,
  Settings,
  ShoppingBag
} from "lucide-react";

interface AdminIndexProps {
  lang: Language;
}

export default function AdminIndex({ lang }: AdminIndexProps) {
  // Stats cards data
  const stats = [
    {
      title: "Total Members",
      value: "1,234",
      change: "+12%",
      icon: Users,
      color: "blue",
      href: `/${lang}/admin/members`
    },
    {
      title: "Vendor Applications",
      value: "45",
      change: "+8%",
      icon: Store,
      color: "yellow",
      href: `/${lang}/admin/vendors`
    },
    {
      title: "Revenue",
      value: "$12,345",
      change: "+23%",
      icon: TrendingUp,
      color: "green",
      href: `/${lang}/admin/settings`
    },
    {
      title: "Support Tickets",
      value: "8",
      change: "-2%",
      icon: Ticket,
      color: "purple",
      href: `/${lang}/admin/settings`
    }
  ];

  const quickActions = [
    {
      title: "Manage Members",
      description: "View and manage member accounts",
      icon: Users,
      href: `/${lang}/admin/members`,
      color: "blue"
    },
    {
      title: "Review Vendors",
      description: "Approve or reject vendor applications",
      icon: Store,
      href: `/${lang}/admin/vendors`,
      color: "yellow"
    },
    {
      title: "Marketplace",
      description: "Manage marketplace listings",
      icon: ShoppingBag,
      href: `/${lang}/admin/marketplace`,
      color: "green"
    },
    {
      title: "Settings",
      description: "Configure system settings",
      icon: Settings,
      href: `/${lang}/admin/settings`,
      color: "purple"
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: "from-blue-500/20 to-blue-600/20 border-blue-500/30 text-blue-400",
      yellow: "from-yellow-500/20 to-yellow-600/20 border-yellow-500/30 text-yellow-400",
      green: "from-green-500/20 to-green-600/20 border-green-500/30 text-green-400",
      purple: "from-purple-500/20 to-purple-600/20 border-purple-500/30 text-purple-400"
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
        <p className="text-gray-400">Welcome to the TPC administration control panel</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Link
            key={index}
            to={stat.href}
            className="block group"
          >
            <PremiumCard className={`p-6 border transition-all duration-200 hover:border-yellow-500/50 hover:shadow-lg hover:shadow-yellow-500/10`}>
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg bg-gradient-to-br ${getColorClasses(stat.color)}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <div className={`text-sm font-medium px-2 py-1 rounded-full ${
                  stat.change.startsWith('+') 
                    ? 'bg-green-500/20 text-green-400' 
                    : 'bg-red-500/20 text-red-400'
                }`}>
                  {stat.change}
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-1">{stat.value}</h3>
                <p className="text-gray-400 text-sm">{stat.title}</p>
              </div>
            </PremiumCard>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {quickActions.map((action, index) => (
            <Link
              key={index}
              to={action.href}
              className="block group"
            >
              <PremiumCard className={`p-6 border transition-all duration-200 hover:border-yellow-500/50 hover:shadow-lg hover:shadow-yellow-500/10`}>
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg bg-gradient-to-br ${getColorClasses(action.color)}`}>
                    <action.icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-yellow-400 transition-colors">
                      {action.title}
                    </h3>
                    <p className="text-gray-400 text-sm mb-3">{action.description}</p>
                    <div className="flex items-center text-yellow-400 text-sm font-medium">
                      <span>Manage</span>
                      <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </PremiumCard>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <PremiumCard className="p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Recent Activity</h2>
        <div className="space-y-4">
          {[
            { action: "New vendor application", time: "2 minutes ago", icon: Store },
            { action: "Member upgrade request", time: "15 minutes ago", icon: Users },
            { action: "Support ticket resolved", time: "1 hour ago", icon: Ticket },
            { action: "Marketplace listing updated", time: "3 hours ago", icon: Eye }
          ].map((activity, index) => (
            <div key={index} className="flex items-center gap-4 p-3 rounded-lg bg-white/5 border border-gray-800">
              <div className="p-2 rounded-lg bg-yellow-500/10">
                <activity.icon className="w-4 h-4 text-yellow-400" />
              </div>
              <div className="flex-1">
                <p className="text-white text-sm">{activity.action}</p>
                <p className="text-gray-400 text-xs">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </PremiumCard>
    </div>
  );
}
