import { RouterProvider, createRouter, createRoute, createRootRoute, Outlet } from '@tanstack/react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';

import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import SendMoneyPage from './pages/transactions/SendMoneyPage';
import RechargePage from './pages/transactions/RechargePage';
import AddMoneyPage from './pages/transactions/AddMoneyPage';
import PayBillPage from './pages/transactions/PayBillPage';
import CashOutPage from './pages/transactions/CashOutPage';
import BankTransferPage from './pages/transactions/BankTransferPage';
import SavingsPage from './pages/transactions/SavingsPage';

// Lazy-loaded pages
import { lazy, Suspense } from 'react';
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const KYCPage = lazy(() => import('./pages/KYCPage'));
const NotificationsPage = lazy(() => import('./pages/NotificationsPage'));
const HistoryPage = lazy(() => import('./pages/HistoryPage'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

// Root layout
const rootRoute = createRootRoute({
  component: () => (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>}>
      <Outlet />
    </Suspense>
  ),
});

// Routes
const loginRoute = createRoute({ getParentRoute: () => rootRoute, path: '/login', component: LoginPage });
const homeRoute = createRoute({ getParentRoute: () => rootRoute, path: '/home', component: HomePage });
const indexRoute = createRoute({ getParentRoute: () => rootRoute, path: '/', component: LoginPage });

// Transaction routes
const sendMoneyRoute = createRoute({ getParentRoute: () => rootRoute, path: '/send-money', component: SendMoneyPage });
const rechargeRoute = createRoute({ getParentRoute: () => rootRoute, path: '/recharge', component: RechargePage });
const addMoneyRoute = createRoute({ getParentRoute: () => rootRoute, path: '/add-money', component: AddMoneyPage });
const payBillRoute = createRoute({ getParentRoute: () => rootRoute, path: '/pay-bill', component: PayBillPage });
const cashOutRoute = createRoute({ getParentRoute: () => rootRoute, path: '/cash-out', component: CashOutPage });
const bankTransferRoute = createRoute({ getParentRoute: () => rootRoute, path: '/bank-transfer', component: BankTransferPage });
const savingsRoute = createRoute({ getParentRoute: () => rootRoute, path: '/savings', component: SavingsPage });

// Profile & utility routes
const profileRoute = createRoute({ getParentRoute: () => rootRoute, path: '/profile', component: ProfilePage });
const kycRoute = createRoute({ getParentRoute: () => rootRoute, path: '/kyc', component: KYCPage });
const notificationsRoute = createRoute({ getParentRoute: () => rootRoute, path: '/notifications', component: NotificationsPage });
const historyRoute = createRoute({ getParentRoute: () => rootRoute, path: '/history', component: HistoryPage });

// Admin routes
const adminRoute = createRoute({ getParentRoute: () => rootRoute, path: '/admin', component: AdminLoginPage });
const adminDashboardRoute = createRoute({ getParentRoute: () => rootRoute, path: '/admin/dashboard', component: AdminDashboardPage });

const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  homeRoute,
  sendMoneyRoute,
  rechargeRoute,
  addMoneyRoute,
  payBillRoute,
  cashOutRoute,
  bankTransferRoute,
  savingsRoute,
  profileRoute,
  kycRoute,
  notificationsRoute,
  historyRoute,
  adminRoute,
  adminDashboardRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <Toaster />
    </QueryClientProvider>
  );
}
