import { Outlet } from 'react-router-dom'
import BottomNav from '../components/layout/BottomNav'

export default function PublicLayout() {
  return (
    <div className="min-h-screen pb-[76px]">
      <Outlet />
      <BottomNav />
    </div>
  )
}
