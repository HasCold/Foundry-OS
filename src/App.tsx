import { MutationCache, QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Toaster } from '@/components/ui/toaster'
import { toast } from '@/components/ui/toast-store'
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
import { RequirePermission, RequireSuperUser } from '@/features/rbac/components/RequirePermission'
import { UsersPage } from '@/features/rbac/components/users/UsersPage'
import { GroupsPage } from '@/features/rbac/components/groups/GroupsPage'
import { RolesPage } from '@/features/rbac/components/roles/RolesPage'

const queryClient = new QueryClient({
  // One place that surfaces every failed mutation — including "you don't have
  // permission" rejections from authorize() — so no feature hook can forget to.
  mutationCache: new MutationCache({
    onError: (err) => toast({ title: "Couldn't complete that", description: err.message, variant: 'destructive' }),
  }),
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
                {/* Each page is gated on `view` for its RBAC resource; the sidebar hides the same links. */}
                <Route element={<RequirePermission resource="setup.companyProfile" />}>
                  <Route path="/setup/company-profile" element={<BasicInfoPage />} />
                </Route>
                <Route element={<RequirePermission resource="setup.businessDetails" />}>
                  <Route path="/setup/business-details" element={<BusinessDetailsPage />} />
                </Route>
                <Route element={<RequirePermission resource="dashboard" />}>
                  <Route index element={<DashboardPage />} />
                </Route>
                <Route element={<RequirePermission resource="bom" />}>
                  <Route path="/bom" element={<BomPage />} />
                </Route>
                <Route element={<RequirePermission resource="scheduler" />}>
                  <Route path="/scheduler" element={<SchedulerPage />} />
                </Route>
                <Route element={<RequirePermission resource="inventory" />}>
                  <Route path="/inventory" element={<InventoryPage />} />
                </Route>
                <Route element={<RequirePermission resource="quality" />}>
                  <Route path="/quality" element={<QualityPage />} />
                </Route>
                <Route element={<RequirePermission resource="procurement" />}>
                  <Route path="/procurement" element={<ProcurementPage />} />
                </Route>
                <Route element={<RequirePermission resource="analytics" />}>
                  <Route path="/analytics" element={<AnalyticsPage />} />
                </Route>
                <Route element={<RequirePermission resource="finance" />}>
                  <Route path="/finance" element={<FinanceDashboardPage />} />
                </Route>

                {/* Access management — super user only. */}
                <Route element={<RequireSuperUser />}>
                  <Route path="/utilities/users" element={<UsersPage />} />
                  <Route path="/utilities/groups" element={<GroupsPage />} />
                  <Route path="/utilities/roles" element={<RolesPage />} />
                </Route>
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  )
}
