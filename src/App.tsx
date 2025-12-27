import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline, Box, Toolbar } from '@mui/material';
import { useState, Suspense, lazy } from 'react';
import { SnackbarProvider } from 'notistack';
import { motion, AnimatePresence } from 'framer-motion';
import type { ReactNode } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './hooks/useAuth';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { DashboardSkeleton } from './components/common/LoadingSkeleton';

// Auth
import { Login } from './auth/Login.enhanced';
import { TwoFactor } from './auth/TwoFactor';
import { AuthGuard } from './auth/AuthGuard';
import { RoleGuard } from './auth/RoleGuard';

// Layout
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { MobileFooter } from './components/common/MobileFooter';

// Pages - Lazy loaded for better performance
const HomePublic = lazy(() => import('./pages/public/HomePublic').then(m => ({ default: m.HomePublic })));
const CompanyDashboard = lazy(() => import('./pages/dashboard/CompanyDashboard.enhanced').then(m => ({ default: m.CompanyDashboard })));
const ProjectDashboard = lazy(() => import('./pages/dashboard/ProjectDashboard').then(m => ({ default: m.ProjectDashboard })));
const ProjectList = lazy(() => import('./pages/projects/ProjectList').then(m => ({ default: m.ProjectList })));
const ProjectDetails = lazy(() => import('./pages/projects/ProjectDetails').then(m => ({ default: m.ProjectDetails })));
const ExpenseList = lazy(() => import('./pages/expenses/ExpenseList.enhanced').then(m => ({ default: m.ExpenseList })));
const ExpenseDetails = lazy(() => import('./pages/expenses/ExpenseDetails').then(m => ({ default: m.ExpenseDetails })));
const Approvals = lazy(() => import('./pages/expenses/Approvals').then(m => ({ default: m.Approvals })));
const PaymentManagement = lazy(() => import('./pages/payments/PaymentManagement').then(m => ({ default: m.PaymentManagement })));
const Reports = lazy(() => import('./pages/reports/Reports').then(m => ({ default: m.Reports })));

// Page transition wrapper
const PageTransition = ({ children }: { children: ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.3 }}
  >
    {children}
  </motion.div>
);

const MainLayout = ({ children }: { children: ReactNode }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopOpen, setDesktopOpen] = useState(false); // Changed to false for auto-collapse

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleDesktopToggle = () => {
    setDesktopOpen(!desktopOpen);
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <Header onMenuClick={handleDrawerToggle} onDesktopToggle={handleDesktopToggle} desktopOpen={desktopOpen} />
      <Sidebar mobileOpen={mobileOpen} onClose={handleDrawerToggle} desktopOpen={desktopOpen} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 1.5, sm: 3, md: 4 },
          pb: { xs: 10, sm: 3, md: 4 }, // Extra bottom padding for mobile footer
          width: '100%',
          minHeight: '100vh',
          backgroundColor: 'background.default',
          ml: { 
            xs: 0, 
            sm: desktopOpen ? '240px' : '64px' 
          },
          transition: (theme) => theme.transitions.create(['margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        }}
      >
        <Toolbar sx={{ display: { xs: 'none', sm: 'block' } }} />
        <Box sx={{ mt: { xs: 1, sm: 2, md: 3 } }}>
          <AnimatePresence mode="wait">
            <PageTransition>{children}</PageTransition>
          </AnimatePresence>
        </Box>
      </Box>
      <MobileFooter />
    </Box>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <CssBaseline />
        <SnackbarProvider
          maxSnack={3}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          autoHideDuration={4000}
        >
          <AuthProvider>
            <Router>
              <Suspense fallback={<DashboardSkeleton />}>
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<HomePublic />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/two-factor" element={<TwoFactor />} />

            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <AuthGuard>
                  <MainLayout>
                    <CompanyDashboard />
                  </MainLayout>
                </AuthGuard>
              }
            />

            <Route
              path="/dashboard/project/:projectId"
              element={
                <AuthGuard>
                  <MainLayout>
                    <ProjectDashboard />
                  </MainLayout>
                </AuthGuard>
              }
            />

            <Route
              path="/projects"
              element={
                <AuthGuard>
                  <MainLayout>
                    <ProjectList />
                  </MainLayout>
                </AuthGuard>
              }
            />

            <Route
              path="/projects/:projectId"
              element={
                <AuthGuard>
                  <MainLayout>
                    <ProjectDetails />
                  </MainLayout>
                </AuthGuard>
              }
            />

            <Route
              path="/expenses"
              element={
                <AuthGuard>
                  <MainLayout>
                    <ExpenseList />
                  </MainLayout>
                </AuthGuard>
              }
            />

            <Route
              path="/expenses/:expenseId"
              element={
                <AuthGuard>
                  <MainLayout>
                    <ExpenseDetails />
                  </MainLayout>
                </AuthGuard>
              }
            />

            <Route
              path="/approvals"
              element={
                <AuthGuard>
                  <RoleGuard allowedRoles={['Admin', 'Project Manager', 'Treasurer']}>
                    <MainLayout>
                      <Approvals />
                    </MainLayout>
                  </RoleGuard>
                </AuthGuard>
              }
            />

            <Route
              path="/payments"
              element={
                <AuthGuard>
                  <MainLayout>
                    <PaymentManagement />
                  </MainLayout>
                </AuthGuard>
              }
            />

            <Route
              path="/reports"
              element={
                <AuthGuard>
                  <MainLayout>
                    <Reports />
                  </MainLayout>
                </AuthGuard>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Suspense>
            </Router>
          </AuthProvider>
        </SnackbarProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
