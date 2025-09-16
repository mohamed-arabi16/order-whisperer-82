import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { TranslationProvider } from "@/hooks/useTranslation";
import { Suspense, lazy } from "react";
import Header from "./components/Header";
import ErrorBoundary from "./components/ErrorBoundary";
import FloatingLanguageSwitcher from "./components/FloatingLanguageSwitcher";

// Lazy load pages for better code splitting
const Index = lazy(() => import("./pages/Index"));
const Auth = lazy(() => import("./pages/Auth"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const MenuManagement = lazy(() => import("./pages/MenuManagement"));
const PublicMenu = lazy(() => import("./pages/PublicMenu"));
const RestaurantBranding = lazy(() => import("./components/branding/RestaurantBranding"));
const QRCodeGenerator = lazy(() => import("./components/qr/QRCodeGenerator"));
const Analytics = lazy(() => import("./pages/Analytics"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Pricing = lazy(() => import("./pages/Pricing"));
const Contact = lazy(() => import("./pages/Contact"));
const POSSystem = lazy(() => import("./pages/POSSystem"));
const POSAccess = lazy(() => import("./pages/POSAccess"));

const queryClient = new QueryClient();

/**
 * The root component of the application.
 * It sets up all the necessary providers and defines the application's routes.
 *
 * @returns {JSX.Element} The rendered application.
 */
const App = (): JSX.Element => (
  <QueryClientProvider client={queryClient}>
    <TranslationProvider>
      <AuthProvider>
        <ThemeProvider attribute="data-theme" defaultTheme="light" enableSystem>
          <TooltipProvider>
            <Toaster />
            <Sonner />
          <BrowserRouter>
            <ErrorBoundary>
              <Header />
              <FloatingLanguageSwitcher />
              <Suspense fallback={
                <div className="min-h-screen flex items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
              }>
                <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/analytics" element={<Analytics />} />
                    <Route path="/menu-management" element={<MenuManagement />} />
                    <Route path="/branding" element={<RestaurantBranding />} />
                    <Route path="/qr-code" element={<QRCodeGenerator />} />
                    <Route path="/menu/:slug" element={<PublicMenu />} />
                    <Route path="/pos-access/:slug" element={<POSAccess />} />
                    <Route path="/pos-system/:slug" element={<POSSystem />} />
                    <Route path="/pricing" element={<Pricing />} />
                    <Route path="/contact" element={<Contact />} />
                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </ErrorBoundary>
            </BrowserRouter>
          </TooltipProvider>
        </ThemeProvider>
      </AuthProvider>
    </TranslationProvider>
  </QueryClientProvider>
);

export default App;
