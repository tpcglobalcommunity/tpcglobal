import { NavLink, useLocation } from 'react-router-dom'
import { Home, Info, CreditCard, ShieldCheck, LogIn } from 'lucide-react'

export default function BottomNav() {
  const location = useLocation()
  const currentLang = location.pathname.startsWith('/en') ? '/en' : '/id'

  const navItems = [
    {
      label: 'Home',
      icon: Home,
      path: currentLang
    },
    {
      label: 'About',
      icon: Info,
      path: '/about'
    },
    {
      label: 'BuyTPC',
      icon: CreditCard,
      path: '/buy'
    },
    {
      label: 'Transparency',
      icon: ShieldCheck,
      path: '/transparency'
    },
    {
      label: 'Login',
      icon: LogIn,
      path: '/login'
    }
  ]

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 bg-black/80 border-t border-white/10 backdrop-blur">
      <div className="flex justify-around items-center h-20">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.label}
              to={item.path}
              className={({ isActive }) => `
                flex flex-col items-center justify-center flex-1 py-2 px-1 transition-colors
                ${isActive 
                  ? 'text-yellow-400' 
                  : 'text-gray-400 hover:text-white'
                }
              `}
            >
              <Icon size={20} className="mb-1" />
              <span className="text-xs font-medium">{item.label}</span>
              {location.pathname === item.path && (
                <div className="w-1 h-1 bg-yellow-400 rounded-full mt-1" />
              )}
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}
