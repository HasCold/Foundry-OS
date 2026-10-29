import { Bell, Coins, LogOut, Moon, Search, Sun } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useThemeStore } from '@/store/themeStore'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useCurrency } from '@/features/finance/hooks/useCurrency'
import type { CurrencyCode } from '@/types'

const CURRENCY_OPTIONS: CurrencyCode[] = ['USD', 'EUR', 'GBP']

/** Initials fallback shown in the profile avatar, e.g. "Jordan Reyes" -> "JR". */
function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/)
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase() || 'OP'
}

export function Topbar() {
  const { theme, toggleTheme } = useThemeStore()
  const { currentUser, logout } = useAuth()
  const { activeCurrency, setActiveCurrency } = useCurrency()

  const displayName = currentUser?.fullName ?? 'Operations Admin'
  const displayOrg = currentUser?.organizationName ?? 'Global Access'

  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-4 border-b border-border bg-card px-5">
      <div className="flex items-center gap-3">
        <span className="hidden text-sm font-bold tracking-tight text-foreground md:inline">FoundryOS</span>
        <Separator orientation="vertical" className="hidden h-5 md:block" />
        <div className="relative w-full max-w-sm">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search orders, SKUs, purchase orders…" className="pl-8" />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-1.5" aria-label="Switch display currency" title="Switch display currency">
              <Coins className="h-4 w-4" />
              {activeCurrency}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuLabel>Display currency</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuRadioGroup value={activeCurrency} onValueChange={(value) => setActiveCurrency(value as CurrencyCode)}>
              {CURRENCY_OPTIONS.map((code) => (
                <DropdownMenuRadioItem key={code} value={code}>
                  {code}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button size="icon" variant="ghost" onClick={toggleTheme} aria-label="Toggle theme" title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
        <Button size="icon" variant="ghost" className="relative">
          <Bell className="h-4 w-4" />
          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-destructive" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-md px-1.5 py-1 transition-colors hover:bg-muted">
              <Avatar className="h-8 w-8">
                <AvatarFallback>{initialsOf(displayName)}</AvatarFallback>
              </Avatar>
              <div className="hidden text-left text-xs leading-tight sm:block">
                <p className="font-medium">{displayName}</p>
                <p className="text-muted-foreground">{displayOrg}</p>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel>
              Signed in as {displayName}
              {currentUser?.isSuperUser && <span className="mt-0.5 block text-xs font-normal text-muted-foreground">Super User · full access</span>}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive">
              <LogOut className="h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
