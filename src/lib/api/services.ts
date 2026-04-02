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
  ScreeningRoutes,
  InternRoutes,
  GroupRoutes,
  OnboardingRoutes,
  ScheduleRoutes,
  ClassDaysRoutes,
  HomeworkRoutes,
  ClassworkRoutes,
  OutlineRoutes,
  ObjectiveAssessmentRoutes,
  TheoryAssessmentRoutes,
} from './routes';

import type {
  Supervisor,
  Mentor,
  Intern,
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
  InternProgramOnboarding,
  MentorComplaint,
  MentorReview,
  ProgramBatch,
  Schedule,
  ClassDay,
  Homework,
  Classwork,
  ProgramOutline,
  ObjectiveAssessment,
  ObjectiveAssessmentQuestion,
  TheoryAssessment,
  TheoryAssessmentQuestion,
  CodeInterviewAttempt,
  Questionnaire,
  QbotResponse,
  QBotInterviewRetry,
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
  CreateNotifyDto,
  UpdateMentorComplaintDto,
  CreateObjectiveAssessmentDto,
  CreateTheoryAssessmentQuestionDto,
  CreateCodeInterviewTaskDto,
  CreateCodeInterviewAttemptDto,
  CreateCodingWorkspaceDto,
  CreateQuestionnaireDto,
  CreateResponseDto,
  QbotInterviewRetryDto,
} from './dto';

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
  findAll: () => apiClient.get<Mentor[]>(MentorRoutes.findAll()),
  findBySupervisor: (supervisorId: string) => apiClient.get<Mentor[]>(MentorRoutes.findBySupervisor(supervisorId)),
  findOne: (id: string) => apiClient.get<Mentor>(MentorRoutes.findOne(id)),
  approve: (id: string) => apiClient.patch<Mentor>(MentorRoutes.approve(id)),
};

// ==================== INTERNS ====================
export const internService = {
  findAll: () => apiClient.get<Intern[]>(InternRoutes.findAll()),
  findOne: (id: string) => apiClient.get<Intern>(InternRoutes.findOne(id)),
};

// ==================== SCREENING ====================
export const screeningService = {
  findAll: () => apiClient.get<Screening[]>(ScreeningRoutes.findAll()),
  findOne: (id: string) => apiClient.get<Screening>(ScreeningRoutes.findOne(id)),
  create: (data: CreateScreeningDto) => apiClient.post<Screening>(ScreeningRoutes.create(), data),
  update: (id: string, data: UpdateScreeningDto) => apiClient.patch<Screening>(ScreeningRoutes.update(id), data),
  updateCurrentPhase: (id: string) => apiClient.patch<Screening>(ScreeningRoutes.updateCurrentPhase(id)),
  remove: (id: string) => apiClient.delete<DeleteResult>(ScreeningRoutes.remove(id)),
};

// ==================== ASSESSMENTS ====================
export const assessmentService = {
  findAll: () => apiClient.get<Assessment[]>(AssessmentRoutes.findAll()),
  findOne: (id: string) => apiClient.get<Assessment>(AssessmentRoutes.findOne(id)),
  create: (data: CreateAssessmentDto) => apiClient.post<Assessment>(AssessmentRoutes.create(), data),
  update: (id: string, data: UpdateAssessmentDto) => apiClient.patch<Assessment>(AssessmentRoutes.update(id), data),
  remove: (id: string) => apiClient.delete<DeleteResult>(AssessmentRoutes.remove(id)),
  ready: (id: string) => apiClient.post<void>(AssessmentRoutes.ready(id)),
  approveRetry: (id: string) => apiClient.post<void>(AssessmentRoutes.approveRetry(id)),
};

// ==================== OBJECTIVE ASSESSMENT ====================
export const objectiveAssessmentService = {
  create: (assessmentId: string, score: number) => apiClient.post<ObjectiveAssessment>(ObjectiveAssessmentRoutes.create(assessmentId), { score }),
  findOne: (id: string) => apiClient.get<ObjectiveAssessment>(ObjectiveAssessmentRoutes.findOne(id)),
  findAll: () => apiClient.get<ObjectiveAssessment[]>(ObjectiveAssessmentRoutes.findAll()),
  findQuestions: (id: string) => apiClient.get<ObjectiveAssessmentQuestion[]>(ObjectiveAssessmentRoutes.findAllQuestions(id)),
  createQuestion: (data: CreateObjectiveAssessmentDto) =>
    apiClient.post<ObjectiveAssessmentQuestion>(ObjectiveAssessmentRoutes.createQuestion(), data),
  createQuestionAgent: (oaId: string) =>
    apiClient.post<ObjectiveAssessmentQuestion>(ObjectiveAssessmentRoutes.createQuestionAgent(oaId)),
  createManyAgent: (oaId: string) =>
    apiClient.post<ObjectiveAssessmentQuestion[]>(ObjectiveAssessmentRoutes.createManyAgent(oaId)),
  updateQuestion: (id: string, data: Partial<CreateObjectiveAssessmentDto>) =>
    apiClient.patch<ObjectiveAssessmentQuestion>(ObjectiveAssessmentRoutes.updateQuestion(id), data),
  deleteQuestion: (id: string) => apiClient.delete<DeleteResult>(ObjectiveAssessmentRoutes.deleteQuestion(id)),
  remove: (id: string) => apiClient.delete<DeleteResult>(ObjectiveAssessmentRoutes.remove(id)),
  start: (assessmentId: string) => apiClient.post<void>(ObjectiveAssessmentRoutes.start(assessmentId)),
  stop: (assessmentId: string) => apiClient.post<void>(ObjectiveAssessmentRoutes.stop(assessmentId)),
};

// ==================== THEORY ASSESSMENT ====================
export const theoryAssessmentService = {
  create: (assessmentId: string, score: number) => apiClient.post<TheoryAssessment>(TheoryAssessmentRoutes.create(assessmentId), { score }),
  findOne: (id: string) => apiClient.get<TheoryAssessment>(TheoryAssessmentRoutes.findOne(id)),
  findAll: () => apiClient.get<TheoryAssessment[]>(TheoryAssessmentRoutes.findAll()),
  findQuestions: (taId: string) => apiClient.get<TheoryAssessmentQuestion[]>(TheoryAssessmentRoutes.findAllQuestions(taId)),
  createQuestion: (data: CreateTheoryAssessmentQuestionDto) =>
    apiClient.post<TheoryAssessmentQuestion>(TheoryAssessmentRoutes.createQuestion(), data),
  createQuestionAgent: (taId: string) =>
    apiClient.post<TheoryAssessmentQuestion>(TheoryAssessmentRoutes.createQuestionAgent(taId)),
  createManyAgent: (taId: string, mentorId: string, n: number) =>
    apiClient.post<TheoryAssessmentQuestion[]>(TheoryAssessmentRoutes.createManyAgent(taId, mentorId, n)),
  updateQuestion: (id: string, data: Partial<CreateTheoryAssessmentQuestionDto>) =>
    apiClient.patch<TheoryAssessmentQuestion>(TheoryAssessmentRoutes.updateQuestion(id), data),
  deleteQuestion: (id: string) => apiClient.delete<DeleteResult>(TheoryAssessmentRoutes.deleteQuestion(id)),
  remove: (id: string) => apiClient.delete<DeleteResult>(TheoryAssessmentRoutes.remove(id)),
  start: (assessmentId: string) => apiClient.post<void>(TheoryAssessmentRoutes.start(assessmentId)),
  stop: (assessmentId: string) => apiClient.post<void>(TheoryAssessmentRoutes.stop(assessmentId)),
};

// ==================== CODE INTERVIEW ====================
export const codeInterviewService = {
  findAll: () => apiClient.get<CodeInterview[]>(CodingWorkspaceRoutes.findAllCodeInterviews()),
  findOne: (id: string) => apiClient.get<CodeInterview>(CodingWorkspaceRoutes.findCodeInterview(id)),
  create: (data: CreateCodeInterviewDto) => apiClient.post<CodeInterview>(CodingWorkspaceRoutes.createCodeInterview(), data),
  update: (id: string, data: UpdateCodeInterviewDto) => apiClient.patch<CodeInterview>(CodingWorkspaceRoutes.updateCodeInterview(id), data),
  remove: (id: string) => apiClient.delete<DeleteResult>(CodingWorkspaceRoutes.removeCodeInterview(id)),
  approveAttempt: (id: string) => apiClient.patch<void>(CodingWorkspaceRoutes.approveAttempt(id)),
  rejectAttempt: (id: string) => apiClient.patch<void>(CodingWorkspaceRoutes.rejectAttempt(id)),
  createTask: (data: CreateCodeInterviewTaskDto) =>
    apiClient.post<any>(CodingWorkspaceRoutes.createTask(), data),
  updateTask: (id: string, data: any) => apiClient.patch<any>(CodingWorkspaceRoutes.updateTask(id), data),
  removeTask: (id: string) => apiClient.delete<DeleteResult>(CodingWorkspaceRoutes.removeTask(id)),
  createAttempt: (data: CreateCodeInterviewAttemptDto) => apiClient.post<CodeInterviewAttempt>(CodingWorkspaceRoutes.createAttempt(), data),
};

// ==================== MENTOR COMPLAINTS ====================
export const mentorComplaintService = {
  findBySupervisor: (supervisorId: string) => apiClient.get<MentorComplaint[]>(MentorRoutes.getComplaintsBySupervisor(supervisorId)),
  update: (complaintId: string, data: UpdateMentorComplaintDto) => apiClient.patch<MentorComplaint>(MentorRoutes.updateComplaint(complaintId), data),
};

// ==================== MENTOR REVIEWS ====================
export const mentorReviewService = {
  findByMentor: (mentorId: string) => apiClient.get<MentorReview[]>(MentorRoutes.getReviewsByMentor(mentorId)),
};

// ==================== CONTACT COMPLAINTS ====================
export const complaintService = {
  findAll: () => apiClient.get<ContactComplaint[]>(ContactComplaintRoutes.findAll()),
  findOne: (id: string) => apiClient.get<ContactComplaint>(ContactComplaintRoutes.findOne(id)),
  update: (id: string, data: UpdateContactComplaintDto) => apiClient.patch<ContactComplaint>(ContactComplaintRoutes.update(id), data),
  remove: (id: string) => apiClient.delete<DeleteResult>(ContactComplaintRoutes.remove(id)),
};

// ==================== SUPERVISOR REVIEW ====================
export const reviewService = {
  start: (data: { screening_id: string; supervisor_id: string; mentor_id: string }) =>
    apiClient.post<SupervisorReview>(SupervisorReviewRoutes.start(), data),
  getByMeeting: (uuid: string) => apiClient.get<SupervisorReview>(SupervisorReviewRoutes.getByMeeting(uuid)),
  update: (id: string, data: UpdateSupervisorReviewDto) => apiClient.patch<SupervisorReview>(SupervisorReviewRoutes.update(id), data),
  complete: (id: string, data: CompleteReviewDto) => apiClient.post<SupervisorReview>(SupervisorReviewRoutes.complete(id), data),
};

// ==================== QBOT ====================
export const qbotService = {
  create: (screeningId: string, body: { startDate: Date }) => apiClient.post<Qbot>(QbotRoutes.create(screeningId), body),
  findAll: () => apiClient.get<Qbot[]>(QbotRoutes.findAll()),
  findOne: (id: string) => apiClient.get<Qbot>(QbotRoutes.findOne(id)),
  updateStatus: (qbotId: string, status: 'pending' | 'in_progress' | 'completed') =>
    apiClient.patch<Qbot>(QbotRoutes.updateStatus(qbotId), { status }),
  createQuestionnaire: (data: CreateQuestionnaireDto) =>
    apiClient.post<Questionnaire>(QbotRoutes.createQuestionnaire(), data),
  createResponse: (data: CreateResponseDto) =>
    apiClient.post<QbotResponse>(QbotRoutes.createResponse(), data),
  createRetry: (data: QbotInterviewRetryDto) =>
    apiClient.post<QBotInterviewRetry>(QbotRoutes.createRetry(), data),
  updateRetryStatus: (retryId: string, status: 'APPROVED' | 'REJECTED') =>
    apiClient.patch<QBotInterviewRetry>(QbotRoutes.updateRetry(retryId), { status }),
};

// ==================== NOTIFICATIONS ====================
export const notificationService = {
  findMy: () => apiClient.get<Notify[]>(NotifyRoutes.findMy('supervisor')),
  markAsRead: (id: string) => apiClient.patch<void>(NotifyRoutes.markAsRead(id)),
  remove: (id: string) => apiClient.delete<DeleteResult>(NotifyRoutes.remove(id)),
  create: (data: CreateNotifyDto) => apiClient.post<Notify>(NotifyRoutes.create(), data),
};

// ==================== PROGRAMS ====================
export const programService = {
  findAll: () => apiClient.get<Program[]>(ProgramRoutes.findAll()),
  findOne: (id: string) => apiClient.get<Program>(ProgramRoutes.findOne(id)),
};

// ==================== PROGRAM BATCHES (GROUPS) ====================
export const batchService = {
  findForProgram: (programId: string) => apiClient.get<ProgramBatch[]>(GroupRoutes.findForProgram(programId)),
  findOne: (id: string) => apiClient.get<ProgramBatch>(GroupRoutes.findOne(id)),
};

// ==================== ONBOARDING ====================
export const onboardingService = {
  findAll: () => apiClient.get<InternProgramOnboarding[]>(OnboardingRoutes.findAll()),
  findForIntern: (internId: string) => apiClient.get<InternProgramOnboarding[]>(OnboardingRoutes.findForIntern(internId)),
  findForProgramAndBatch: (programId: string, batchId: string) =>
    apiClient.get<InternProgramOnboarding[]>(OnboardingRoutes.findForProgramAndBatch(programId, batchId)),
  findForProgram: (programId: string) => apiClient.get<InternProgramOnboarding[]>(OnboardingRoutes.findForProgram(programId)),
};

// ==================== CHALLENGES ====================
export const challengeService = {
  findAll: () => apiClient.get<Challenge[]>(ChallengeRoutes.findAll()),
  findOne: (id: string) => apiClient.get<Challenge>(ChallengeRoutes.findOne(id)),
};

// ==================== WORK SAMPLES ====================
export const workSampleService = {
  findAll: () => apiClient.get<WorkSample[]>(WorkSampleRoutes.findAll()),
  findByMentor: (mentorId: string) => apiClient.get<WorkSample[]>(WorkSampleRoutes.findByMentor(mentorId)),
  findOne: (id: string) => apiClient.get<WorkSample>(WorkSampleRoutes.findOne(id)),
  update: (id: string, data: { status: 'accepted' | 'rejected' | 'pending' }) =>
    apiClient.patch<WorkSample>(WorkSampleRoutes.update(id), data),
  remove: (id: string) => apiClient.delete<DeleteResult>(WorkSampleRoutes.remove(id)),
};

// ==================== EXAMS ====================
export const examService = {
  findAll: () => apiClient.get<Exam[]>(ExamRoutes.findAll()),
  findOne: (id: string) => apiClient.get<Exam>(ExamRoutes.findOne(id)),
};

// ==================== SCHEDULES ====================
export const scheduleService = {
  findAll: () => apiClient.get<Schedule[]>(ScheduleRoutes.findAll()),
  findOne: (id: string) => apiClient.get<Schedule>(ScheduleRoutes.findOne(id)),
};

// ==================== CLASS DAYS ====================
export const classDayService = {
  findAll: (programBatchId?: string) => apiClient.get<ClassDay[]>(ClassDaysRoutes.findAll(programBatchId)),
  findOne: (id: string) => apiClient.get<ClassDay>(ClassDaysRoutes.findOne(id)),
};

// ==================== HOMEWORK ====================
export const homeworkService = {
  findAll: () => apiClient.get<Homework[]>(HomeworkRoutes.findAll()),
  findOne: (id: string) => apiClient.get<Homework>(HomeworkRoutes.findOne(id)),
};

// ==================== CLASSWORK ====================
export const classworkService = {
  findAll: () => apiClient.get<Classwork[]>(ClassworkRoutes.findAll()),
  findOne: (id: string) => apiClient.get<Classwork>(ClassworkRoutes.findOne(id)),
};

// ==================== OUTLINES ====================
export const outlineService = {
  findAll: (batchId?: string) => apiClient.get<ProgramOutline[]>(OutlineRoutes.findAll(batchId)),
  findOne: (id: string) => apiClient.get<ProgramOutline>(OutlineRoutes.findOne(id)),
};

// ==================== PROJECT EXAM ====================
export const projectExamService = {
  findAll: () => apiClient.get<ProjectExam[]>(ProjectExamRoutes.findAll()),
  findOne: (id: string) => apiClient.get<ProjectExam>(ProjectExamRoutes.findOne(id)),
  findByExam: (examId: string) => apiClient.get<ProjectExam>(ProjectExamRoutes.findByExam(examId)),
  create: (data: CreateProjectExamDto) => apiClient.post<ProjectExam>(ProjectExamRoutes.create(), data),
  update: (id: string, data: UpdateProjectExamDto) => apiClient.patch<ProjectExam>(ProjectExamRoutes.update(id), data),
  remove: (id: string) => apiClient.delete<DeleteResult>(ProjectExamRoutes.remove(id)),
  getExamSubmissions: (examId: string) => apiClient.get<ProjectExamSubmission[]>(ProjectExamRoutes.getExamSubmissions(examId)),
  getSubmission: (id: string) => apiClient.get<ProjectExamSubmission>(ProjectExamRoutes.getSubmission(id)),
  reviewSubmission: (submissionId: string, data: ReviewProjectSubmissionDto) =>
    apiClient.patch<ProjectExamSubmission>(ProjectExamRoutes.reviewSubmission(submissionId), data),
  updateSubmissionStatus: (submissionId: string, data: UpdateProjectSubmissionStatusDto) =>
    apiClient.patch<ProjectExamSubmission>(ProjectExamRoutes.updateSubmissionStatus(submissionId), data),
};
