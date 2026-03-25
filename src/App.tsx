import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import LandingPage from "./pages/LandingPage";
import AllTemplatesPage from "./pages/AllTemplatesPage";
import TemplateDemoPage from "./pages/TemplateDemoPage";
import PublicInvitationPage from "./pages/PublicInvitationPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import OAuthCallbackPage from "./pages/OAuthCallbackPage";
import DashboardPage from "./pages/DashboardPage";
import CreateInvitationPage from "./pages/CreateInvitationPage";
import EditInvitationPage from "./pages/EditInvitationPage";
import InvitationPreviewPage from "./pages/InvitationPreviewPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppInner = () => {
  const loadFromStorage = useAuthStore((s) => s.loadFromStorage);

  // Load auth state as early as possible
  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  return (
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
      <Route path="/edit/:invitationId" element={<EditInvitationPage />} />
      <Route path="/:code/invite/:slug" element={<PublicInvitationPage />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
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
