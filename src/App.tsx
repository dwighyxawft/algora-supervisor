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
import MentorProgramBatchesPage from "@/pages/supervisor/MentorProgramBatchesPage";
import BatchOnboardingPage from "@/pages/supervisor/BatchOnboardingPage";
import ProgramBatchDetailPage from "@/pages/supervisor/ProgramBatchDetailPage";
import AssignmentDetailPage from "@/pages/supervisor/AssignmentDetailPage";
import ExamDetailPage from "@/pages/supervisor/ExamDetailPage";
import AnalyticsPage from "@/pages/supervisor/AnalyticsPage";
import SettingsPage from "@/pages/supervisor/SettingsPage";

// Screening (still accessible from mentor profile)
import ScreeningReviewPage from "@/pages/supervisor/ScreeningReviewPage";
import CreateScreeningPage from "@/pages/supervisor/CreateScreeningPage";
import CreateAssessmentPage from "@/pages/supervisor/CreateAssessmentPage";
import AssessmentSubmissionPage from "@/pages/supervisor/AssessmentSubmissionPage";
import AssessmentDetailPage from "@/pages/supervisor/AssessmentDetailPage";
import WorkSamplePreviewPage from "@/pages/supervisor/WorkSamplePreviewPage";
import QbotResponsePage from "@/pages/supervisor/QbotResponsePage";
import CodeInterviewSubmissionPage from "@/pages/supervisor/CodeInterviewSubmissionPage";
import CodeInterviewRoomPage from "@/pages/supervisor/CodeInterviewRoomPage";
import MonthEndMeetingPage from "@/pages/supervisor/MonthEndMeetingPage";

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
                
                {/* Mentors */}
                <Route path="/supervisor/mentors" element={<MentorListPage />} />
                <Route path="/supervisor/mentors/:id" element={<MentorProfilePage />} />
                <Route path="/supervisor/mentors/:id/programs/:programId" element={<MentorProgramBatchesPage />} />
                <Route path="/supervisor/mentors/:id/programs/:programId/batches/:batchId" element={<ProgramBatchDetailPage />} />
                <Route path="/supervisor/mentors/:id/programs/:programId/batches/:batchId/onboarding" element={<BatchOnboardingPage />} />
                <Route path="/supervisor/mentors/:id/programs/:programId/batches/:batchId/homework/:homeworkId" element={<AssignmentDetailPage />} />
                <Route path="/supervisor/mentors/:id/programs/:programId/batches/:batchId/classwork/:classworkId" element={<AssignmentDetailPage />} />
                <Route path="/supervisor/mentors/:id/programs/:programId/batches/:batchId/challenge/:challengeId" element={<AssignmentDetailPage />} />
                <Route path="/supervisor/mentors/:id/programs/:programId/batches/:batchId/exam/:examId/:examType" element={<ExamDetailPage />} />

                {/* Screening */}
                <Route path="/supervisor/screening" element={<ScreeningReviewPage />} />
                <Route path="/supervisor/screening/create" element={<CreateScreeningPage />} />
                <Route path="/supervisor/screening/:id" element={<ScreeningReviewPage />} />
                <Route path="/supervisor/screening/:screeningId/assessment/create" element={<CreateAssessmentPage />} />
                <Route path="/supervisor/screening/:screeningId/assessment/:assessmentId/submission" element={<AssessmentSubmissionPage />} />
                <Route path="/supervisor/screening/:screeningId/work-sample/:sampleId/preview" element={<WorkSamplePreviewPage />} />
                <Route path="/supervisor/screening/:screeningId/qbot/:qbotId/response" element={<QbotResponsePage />} />
                <Route path="/supervisor/screening/:screeningId/code-interview/:interviewId/submission" element={<CodeInterviewSubmissionPage />} />

                {/* Analytics */}
                <Route path="/supervisor/analytics" element={<AnalyticsPage />} />

                {/* Settings */}
                <Route path="/supervisor/settings" element={<SettingsPage />} />

                {/* Meetings */}
                <Route path="/supervisor/code-interview/:interviewId" element={<CodeInterviewRoomPage />} />
                <Route path="/supervisor/month-end-meeting" element={<MonthEndMeetingPage />} />
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
