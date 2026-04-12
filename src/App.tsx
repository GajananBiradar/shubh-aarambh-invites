import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Suspense, lazy, useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import OAuthCallbackPage from "./pages/OAuthCallbackPage";
import NotFound from "./pages/NotFound";

const AllTemplatesPage = lazy(() => import("./pages/AllTemplatesPage"));
const TemplateDemoPage = lazy(() => import("./pages/TemplateDemoPage"));
const PublicInvitationPage = lazy(() => import("./pages/PublicInvitationPage"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const CreateInvitationPage = lazy(() => import("./pages/CreateInvitationPage"));
const CreatePreviewPage = lazy(() => import("./pages/CreatePreviewPage"));
const EditInvitationPage = lazy(() => import("./pages/EditInvitationPage"));
const InvitationPreviewPage = lazy(
  () => import("./pages/InvitationPreviewPage"),
);

const RouteLoader = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
  </div>
);

const queryClient = new QueryClient();

const AppInner = () => {
  const loadFromStorage = useAuthStore((s) => s.loadFromStorage);

  // Load auth state as early as possible
  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  return (
    <Suspense fallback={<RouteLoader />}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/templates" element={<AllTemplatesPage />} />
        <Route
          path="/templates/:templateId/demo"
          element={<TemplateDemoPage />}
        />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/oauth2/callback" element={<OAuthCallbackPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/create/:templateId" element={<CreateInvitationPage />} />
        <Route
          path="/create/:templateId/preview"
          element={<CreatePreviewPage />}
        />
        <Route path="/edit/:invitationId" element={<EditInvitationPage />} />
        <Route
          path="/invitations/:id/preview"
          element={<InvitationPreviewPage />}
        />
        <Route path="/:code/invite/:slug" element={<PublicInvitationPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

const App = () => {
  // Immediately restore auth from localStorage to prevent flash of logged-out state
  useAuthStore.getState().loadFromStorage();

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster
          position="top-center"
          toastOptions={{
            style: { fontFamily: "Jost, sans-serif", fontSize: "14px" },
          }}
        />
        <BrowserRouter>
          <AppInner />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
