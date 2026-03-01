import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/supervisor/ProtectedRoute";
import SupervisorLayout from "@/components/supervisor/SupervisorLayout";

// Auth pages
import LoginPage from "@/pages/supervisor/LoginPage";
import ForgotPasswordPage from "@/pages/supervisor/ForgotPasswordPage";
import ResetPasswordPage from "@/pages/supervisor/ResetPasswordPage";

// Dashboard pages
import DashboardPage from "@/pages/supervisor/DashboardPage";
import MentorListPage from "@/pages/supervisor/MentorListPage";
import MentorProfilePage from "@/pages/supervisor/MentorProfilePage";
import MentorPerformancePage from "@/pages/supervisor/MentorPerformancePage";
import ScreeningDashboardPage from "@/pages/supervisor/ScreeningDashboardPage";
import CreateScreeningPage from "@/pages/supervisor/CreateScreeningPage";
import ScreeningReviewPage from "@/pages/supervisor/ScreeningReviewPage";
import ComplaintsPage from "@/pages/supervisor/ComplaintsPage";
import ComplaintDetailPage from "@/pages/supervisor/ComplaintDetailPage";
import ReviewsPage from "@/pages/supervisor/ReviewsPage";
import AnalyticsPage from "@/pages/supervisor/AnalyticsPage";
import SettingsPage from "@/pages/supervisor/SettingsPage";
import ProjectSubmissionsPage from "@/pages/supervisor/ProjectSubmissionsPage";
import ProgramDetailPage from "@/pages/supervisor/ProgramDetailPage";
import BatchDetailPage from "@/pages/supervisor/BatchDetailPage";

import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/supervisor/login" replace />} />

            {/* Auth routes */}
            <Route path="/supervisor/login" element={<LoginPage />} />
            <Route path="/supervisor/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/supervisor/reset-password" element={<ResetPasswordPage />} />

            {/* Protected supervisor routes */}
            <Route element={<ProtectedRoute />}>
              <Route element={<SupervisorLayout />}>
                <Route path="/supervisor/dashboard" element={<DashboardPage />} />
                <Route path="/supervisor/mentors" element={<MentorListPage />} />
                <Route path="/supervisor/mentors/:id" element={<MentorProfilePage />} />
                <Route path="/supervisor/performance" element={<MentorPerformancePage />} />
                <Route path="/supervisor/screening" element={<ScreeningDashboardPage />} />
                <Route path="/supervisor/screening/create" element={<CreateScreeningPage />} />
                <Route path="/supervisor/screening/:id" element={<ScreeningReviewPage />} />
                <Route path="/supervisor/complaints" element={<ComplaintsPage />} />
                <Route path="/supervisor/complaints/:id" element={<ComplaintDetailPage />} />
                <Route path="/supervisor/reviews" element={<ReviewsPage />} />
                <Route path="/supervisor/analytics" element={<AnalyticsPage />} />
                <Route path="/supervisor/projects" element={<ProjectSubmissionsPage />} />
                <Route path="/supervisor/programs/:id" element={<ProgramDetailPage />} />
                <Route path="/supervisor/programs/:id/batches/:batchId" element={<BatchDetailPage />} />
                <Route path="/supervisor/settings" element={<SettingsPage />} />
              </Route>
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
