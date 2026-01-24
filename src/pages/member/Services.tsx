import ServiceAccessGate from '@/components/guards/ServiceAccessGate';
import { 
  Store, 
  TrendingUp, 
  Users, 
  Shield, 
  Zap,
  ArrowRight
} from 'lucide-react';

type Props = {
  lang: any;
};

export default function Services({ lang }: Props) {
  const services = [
    {
      icon: Store,
      title: 'Marketplace',
      description: 'Buy and sell TPC tokens and other digital assets',
      status: 'active',
      comingSoon: false
    },
    {
      icon: TrendingUp,
      title: 'Trading Tools',
      description: 'Advanced trading analytics and tools for TPC',
      status: 'active',
      comingSoon: false
    },
    {
      icon: Users,
      title: 'Community Hub',
      description: 'Connect with other TPC holders and traders',
      status: 'active',
      comingSoon: false
    },
    {
      icon: Shield,
      title: 'Staking Pool',
      description: 'Stake your TPC tokens and earn rewards',
      status: 'beta',
      comingSoon: false
    },
    {
      icon: Zap,
      title: 'Flash Loans',
      description: 'Instant crypto-backed loans using TPC as collateral',
      status: 'coming-soon',
      comingSoon: true
    }
  ];

  return (
    <ServiceAccessGate lang={lang}>
      <div className="min-h-screen bg-black">
        <div className="max-w-7xl mx-auto px-4 py-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Services</h1>
            <p className="text-white/70">
              Premium services available to TPC holders with 1,000+ TPC balance
            </p>
          </div>

          {/* Services Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => {
              const Icon = service.icon;
              
              return (
                <div
                  key={index}
                  className={`
                    relative bg-white/5 border border-white/10 rounded-xl p-6
                    hover:bg-white/10 hover:border-[#F0B90B]/30 transition-all duration-200
                    ${service.comingSoon ? 'opacity-75' : 'hover:scale-[1.02]'}
                  `}
                >
                  {/* Status Badge */}
                  <div className="absolute top-4 right-4">
                    {service.status === 'beta' && (
                      <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs font-medium rounded-full">
                        Beta
                      </span>
                    )}
                    {service.status === 'coming-soon' && (
                      <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs font-medium rounded-full">
                        Coming Soon
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col items-center text-center mb-4">
                    <Icon className={`w-12 h-12 mb-3 ${
                      service.comingSoon ? 'text-white/40' : 'text-[#F0B90B]'
                    }`} />
                    <h3 className={`text-xl font-semibold text-white mb-2 ${
                      service.comingSoon ? 'text-white/60' : ''
                    }`}>
                      {service.title}
                    </h3>
                  </div>

                  <p className={`text-white/70 text-sm text-center mb-4 ${
                    service.comingSoon ? 'text-white/40' : ''
                  }`}>
                    {service.description}
                  </p>

                  {!service.comingSoon && (
                    <button className="w-full py-2 bg-[#F0B90B] text-black font-medium rounded-lg hover:bg-[#F0B90B]/90 transition-colors flex items-center justify-center gap-2">
                      Access Service
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}

                  {service.comingSoon && (
                    <button 
                      disabled
                      className="w-full py-2 bg-white/10 border border-white/20 text-white/50 font-medium rounded-lg cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      Coming Soon
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Info Section */}
          <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-[#F0B90B]/10 border border-[#F0B90B]/20 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-3">Requirements</h3>
              <ul className="space-y-2 text-white/70 text-sm">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-[#F0B90B] rounded-full"></div>
                  Connected Phantom wallet
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-[#F0B90B] rounded-full"></div>
                  Minimum 1,000 TPC balance
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-[#F0B90B] rounded-full"></div>
                  Completed member profile
                </li>
              </ul>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-3">Benefits</h3>
              <ul className="space-y-2 text-white/70 text-sm">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                  Exclusive member services
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                  Priority support
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                  Early access to new features
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                  Reduced fees and rewards
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </ServiceAccessGate>
  );
}
