import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { CriticalAlertBanner } from '@/features/simulator/components/CriticalAlertBanner'
import { useShopFloorSimulator } from '@/features/simulator/hooks/useShopFloorSimulator'

export function AppLayout() {
  // Mounted once here (rather than on any individual page) so the background tick
  // loop keeps running no matter which route the operator is currently viewing.
  useShopFloorSimulator()

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <CriticalAlertBanner />
        <main className="flex-1 overflow-y-auto p-6 scrollbar-thin">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
