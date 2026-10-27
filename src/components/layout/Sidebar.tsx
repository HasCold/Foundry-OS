import { NavLink } from 'react-router-dom'
import { BarChart3, Boxes, Factory, LayoutDashboard, Network, ShieldCheck, ShoppingCart, Landmark } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_SECTIONS = [
  {
    label: 'Overview',
    items: [{ to: '/', label: 'Executive Dashboard', icon: LayoutDashboard, end: true }],
  },
  {
    label: 'Engineering',
    items: [{ to: '/bom', label: 'BOM & Costing Engine', icon: Network }],
  },
  {
    label: 'Operations',
    items: [
      { to: '/scheduler', label: 'Production Scheduler', icon: Factory },
      { to: '/inventory', label: 'Inventory & MRP', icon: Boxes },
    ],
  },
  {
    label: 'Quality & Sourcing',
    items: [
      { to: '/quality', label: 'Quality Assurance', icon: ShieldCheck },
      { to: '/procurement', label: 'Procurement', icon: ShoppingCart },
    ],
  },
  {
    label: 'Insights',
    items: [
      { to: '/analytics', label: 'BI Analytics', icon: BarChart3 },
      { to: '/finance', label: 'Finance & Ledger', icon: Landmark },
    ],
  },
]

export function Sidebar() {
  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-border bg-card">
      <div className="flex items-center gap-2.5 border-b border-border px-4 py-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-md shadow-blue-600/20">
          <Factory className="h-5 w-5" />
        </div>
        <div>
          <p className="text-[15px] font-bold leading-tight tracking-tight text-foreground">FoundryOS</p>
          <p className="text-[10.5px] uppercase tracking-wider text-muted-foreground">Manufacturing Platform</p>
        </div>
      </div>
      <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4 scrollbar-thin">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label}>
            <p className="mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{section.label}</p>
            <div className="space-y-0.5">
              {section.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={'end' in item ? item.end : false}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium transition-colors',
                      isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                    )
                  }
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  {item.label}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>
      <div className="border-t border-border p-3">
        <div className="rounded-lg bg-muted/60 p-3 text-xs text-muted-foreground">
          <p className="font-medium text-foreground">In-memory demo mode</p>
          <p className="mt-0.5">All data is simulated client-side. Refreshing resets the session.</p>
        </div>
      </div>
    </aside>
  )
}
