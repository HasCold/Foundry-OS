import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Toaster } from '@/components/ui/toaster'
import { AppLayout } from '@/components/layout/AppLayout'
import { RequireAuth, RedirectIfAuthed } from '@/features/auth/components/RequireAuth'
import { LoginPage } from '@/features/auth/components/LoginPage'
import { SignUpPage } from '@/features/auth/components/SignUpPage'
import { VerifyEmailPage } from '@/features/auth/components/VerifyEmailPage'
import { ForgotPasswordPage } from '@/features/auth/components/ForgotPasswordPage'
import { DashboardPage } from '@/features/dashboard/components/DashboardPage'
import { BomPage } from '@/features/bom/components/BomPage'
import { SchedulerPage } from '@/features/scheduler/components/SchedulerPage'
import { InventoryPage } from '@/features/inventory/components/InventoryPage'
import { QualityPage } from '@/features/quality/components/QualityPage'
import { ProcurementPage } from '@/features/procurement/components/ProcurementPage'
import { AnalyticsPage } from '@/features/analytics/components/AnalyticsPage'
import { FinanceDashboardPage } from '@/features/finance/components/FinanceDashboardPage'
import { BasicInfoPage } from '@/features/setup/components/BasicInfoPage'
import { BusinessDetailsPage } from '@/features/setup/components/BusinessDetailsPage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false },
    mutations: { retry: 0 },
  },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider delayDuration={200}>
        <BrowserRouter>
          <Routes>
            {/* Public auth routes — bounce straight to the dashboard if already signed in. */}
            <Route element={<RedirectIfAuthed />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignUpPage />} />
              <Route path="/verify" element={<VerifyEmailPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            </Route>

            {/* Everything else requires an authenticated in-memory session. */}
            <Route element={<RequireAuth />}>
              <Route element={<AppLayout />}>
                <Route path="/setup/company-profile" element={<BasicInfoPage />} />
                <Route path="/setup/business-details" element={<BusinessDetailsPage />} />
                <Route index element={<DashboardPage />} />
                <Route path="/bom" element={<BomPage />} />
                <Route path="/scheduler" element={<SchedulerPage />} />
                <Route path="/inventory" element={<InventoryPage />} />
                <Route path="/quality" element={<QualityPage />} />
                <Route path="/procurement" element={<ProcurementPage />} />
                <Route path="/analytics" element={<AnalyticsPage />} />
                <Route path="/finance" element={<FinanceDashboardPage />} />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  )
}
