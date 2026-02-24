// =============================================
// API Services — Typed API calls for Supervisor
// =============================================

import { apiClient } from './client';
import {
  AuthRoutes,
  SupervisorRoutes,
  MentorRoutes,
  ContactComplaintRoutes,
  AssessmentRoutes,
  CodingWorkspaceRoutes,
  QbotRoutes,
  SupervisorReviewRoutes,
  NotifyRoutes,
  ProgramRoutes,
  ChallengeRoutes,
  WorkSampleRoutes,
  ExamRoutes,
  ProjectExamRoutes,
} from './routes';

import type {
  Supervisor,
  Mentor,
  ContactComplaint,
  Screening,
  Assessment,
  CodeInterview,
  SupervisorReview,
  Notify,
  Program,
  Challenge,
  WorkSample,
  Exam,
  ProjectExam,
  ProjectExamSubmission,
  Qbot,
  DeleteResult,
  UpdateResult,
} from './models';

import type {
  CreateScreeningDto,
  UpdateScreeningDto,
  CreateAssessmentDto,
  UpdateAssessmentDto,
  CreateCodeInterviewDto,
  UpdateCodeInterviewDto,
  CreateContactComplaintDto,
  UpdateContactComplaintDto,
  UpdateSupervisorDto,
  UpdateSupervisorReviewDto,
  CompleteReviewDto,
  CreateProjectExamDto,
  UpdateProjectExamDto,
  ReviewProjectSubmissionDto,
  UpdateProjectSubmissionStatusDto,
} from './dto';

// We need ScreeningRoutes — add inline if not in routes.ts yet
// They were added at the end of routes.ts

// Re-export BASE_URL for convenience
export { BASE_URL } from './routes';

// ==================== AUTH ====================
export const authService = {
  loginSupervisor: (username: string, password: string) =>
    apiClient.post<{ token: string; user: Supervisor }>(AuthRoutes.loginSupervisor(), { username, password }),

  logoutSupervisor: () =>
    apiClient.get<void>(AuthRoutes.logoutSupervisor()),
};

// ==================== SUPERVISOR ====================
export const supervisorService = {
  getProfile: (id: string) =>
    apiClient.get<Supervisor>(SupervisorRoutes.findOne(id)),

  updateProfile: (data: UpdateSupervisorDto) =>
    apiClient.patch<Supervisor>(SupervisorRoutes.update(), data),

  updatePassword: (data: { oldPassword: string; password: string; confirmPassword: string }) =>
    apiClient.patch<void>(SupervisorRoutes.updatePassword(), data),
};

// ==================== MENTORS ====================
export const mentorService = {
  findAll: () =>
    apiClient.get<Mentor[]>(MentorRoutes.findAll()),

  findOne: (id: string) =>
    apiClient.get<Mentor>(MentorRoutes.findOne(id)),
};

// ==================== SCREENING ====================

// Use inline routes since ScreeningRoutes was added
import { ScreeningRoutes } from './routes';

export const screeningService = {
  findAll: () =>
    apiClient.get<Screening[]>(ScreeningRoutes.findAll()),

  findOne: (id: string) =>
    apiClient.get<Screening>(ScreeningRoutes.findOne(id)),

  create: (data: CreateScreeningDto) =>
    apiClient.post<Screening>(ScreeningRoutes.create(), data),

  update: (id: string, data: UpdateScreeningDto) =>
    apiClient.patch<Screening>(ScreeningRoutes.update(id), data),

  remove: (id: string) =>
    apiClient.delete<DeleteResult>(ScreeningRoutes.remove(id)),
};

// ==================== ASSESSMENTS ====================
export const assessmentService = {
  findAll: () =>
    apiClient.get<Assessment[]>(AssessmentRoutes.findAll()),

  findOne: (id: string) =>
    apiClient.get<Assessment>(AssessmentRoutes.findOne(id)),

  create: (data: CreateAssessmentDto) =>
    apiClient.post<Assessment>(AssessmentRoutes.create(), data),

  update: (id: string, data: UpdateAssessmentDto) =>
    apiClient.patch<Assessment>(AssessmentRoutes.update(id), data),

  remove: (id: string) =>
    apiClient.delete<DeleteResult>(AssessmentRoutes.remove(id)),

  approveRetry: (id: string) =>
    apiClient.post<void>(AssessmentRoutes.approveRetry(id)),
};

// ==================== CODE INTERVIEW ====================
export const codeInterviewService = {
  findAll: () =>
    apiClient.get<CodeInterview[]>(CodingWorkspaceRoutes.findAllCodeInterviews()),

  findOne: (id: string) =>
    apiClient.get<CodeInterview>(CodingWorkspaceRoutes.findCodeInterview(id)),

  create: (data: CreateCodeInterviewDto) =>
    apiClient.post<CodeInterview>(CodingWorkspaceRoutes.createCodeInterview(), data),

  update: (id: string, data: UpdateCodeInterviewDto) =>
    apiClient.patch<CodeInterview>(CodingWorkspaceRoutes.updateCodeInterview(id), data),

  remove: (id: string) =>
    apiClient.delete<DeleteResult>(CodingWorkspaceRoutes.removeCodeInterview(id)),

  approveAttempt: (id: string) =>
    apiClient.patch<void>(CodingWorkspaceRoutes.approveAttempt(id)),

  rejectAttempt: (id: string) =>
    apiClient.patch<void>(CodingWorkspaceRoutes.rejectAttempt(id)),
};

// ==================== COMPLAINTS ====================
export const complaintService = {
  findAll: () =>
    apiClient.get<ContactComplaint[]>(ContactComplaintRoutes.findAll()),

  findOne: (id: string) =>
    apiClient.get<ContactComplaint>(ContactComplaintRoutes.findOne(id)),

  update: (id: string, data: UpdateContactComplaintDto) =>
    apiClient.patch<ContactComplaint>(ContactComplaintRoutes.update(id), data),

  remove: (id: string) =>
    apiClient.delete<DeleteResult>(ContactComplaintRoutes.remove(id)),
};

// ==================== SUPERVISOR REVIEW ====================
export const reviewService = {
  start: (data: { screening_id: string; supervisor_id: string; mentor_id: string }) =>
    apiClient.post<SupervisorReview>(SupervisorReviewRoutes.start(), data),

  getByMeeting: (uuid: string) =>
    apiClient.get<SupervisorReview>(SupervisorReviewRoutes.getByMeeting(uuid)),

  update: (id: string, data: UpdateSupervisorReviewDto) =>
    apiClient.patch<SupervisorReview>(SupervisorReviewRoutes.update(id), data),

  complete: (id: string, data: CompleteReviewDto) =>
    apiClient.post<SupervisorReview>(SupervisorReviewRoutes.complete(id), data),
};

// ==================== QBOT ====================
export const qbotService = {
  findAll: () =>
    apiClient.get<Qbot[]>(QbotRoutes.findAll()),

  findOne: (id: string) =>
    apiClient.get<Qbot>(QbotRoutes.findOne(id)),

  approveRetry: (retryId: string) =>
    apiClient.patch<void>(QbotRoutes.approveRetry(retryId)),

  rejectRetry: (retryId: string) =>
    apiClient.patch<void>(QbotRoutes.rejectRetry(retryId)),
};

// ==================== NOTIFICATIONS ====================
export const notificationService = {
  findMy: () =>
    apiClient.get<Notify[]>(NotifyRoutes.findMy('supervisor')),

  markAsRead: (id: string) =>
    apiClient.patch<void>(NotifyRoutes.markAsRead(id)),

  remove: (id: string) =>
    apiClient.delete<DeleteResult>(NotifyRoutes.remove(id)),
};

// ==================== PROGRAMS ====================
export const programService = {
  findAll: () =>
    apiClient.get<Program[]>(ProgramRoutes.findAll()),

  findOne: (id: string) =>
    apiClient.get<Program>(ProgramRoutes.findOne(id)),
};

// ==================== CHALLENGES ====================
export const challengeService = {
  findAll: () =>
    apiClient.get<Challenge[]>(ChallengeRoutes.findAll()),

  findOne: (id: string) =>
    apiClient.get<Challenge>(ChallengeRoutes.findOne(id)),
};

// ==================== WORK SAMPLES ====================
export const workSampleService = {
  findByMentor: (mentorId: string) =>
    apiClient.get<WorkSample[]>(WorkSampleRoutes.findByMentor(mentorId)),
};

// ==================== EXAMS ====================
export const examService = {
  findAll: () =>
    apiClient.get<Exam[]>(ExamRoutes.findAll()),

  findOne: (id: string) =>
    apiClient.get<Exam>(ExamRoutes.findOne(id)),
};

// ==================== PROJECT EXAM ====================
export const projectExamService = {
  findAll: () =>
    apiClient.get<ProjectExam[]>(ProjectExamRoutes.findAll()),

  findOne: (id: string) =>
    apiClient.get<ProjectExam>(ProjectExamRoutes.findOne(id)),

  findByExam: (examId: string) =>
    apiClient.get<ProjectExam>(ProjectExamRoutes.findByExam(examId)),

  create: (data: CreateProjectExamDto) =>
    apiClient.post<ProjectExam>(ProjectExamRoutes.create(), data),

  update: (id: string, data: UpdateProjectExamDto) =>
    apiClient.patch<ProjectExam>(ProjectExamRoutes.update(id), data),

  remove: (id: string) =>
    apiClient.delete<DeleteResult>(ProjectExamRoutes.remove(id)),

  getExamSubmissions: (examId: string) =>
    apiClient.get<ProjectExamSubmission[]>(ProjectExamRoutes.getExamSubmissions(examId)),

  getSubmission: (id: string) =>
    apiClient.get<ProjectExamSubmission>(ProjectExamRoutes.getSubmission(id)),

  reviewSubmission: (submissionId: string, data: ReviewProjectSubmissionDto) =>
    apiClient.patch<ProjectExamSubmission>(ProjectExamRoutes.reviewSubmission(submissionId), data),

  updateSubmissionStatus: (submissionId: string, data: UpdateProjectSubmissionStatusDto) =>
    apiClient.patch<ProjectExamSubmission>(ProjectExamRoutes.updateSubmissionStatus(submissionId), data),
};
