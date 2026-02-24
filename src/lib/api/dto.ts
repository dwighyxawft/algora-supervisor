// =============================================
// DTOs — Form Interfaces & Request Bodies
// Auto-generated from NestJS DTOs
// =============================================

import {
  AssessmentStatus,
  AssessmentType,
  ClassworkType,
  DayOfWeek,
  ExamStatus,
  Gender,
  IDType,
  LearningMode,
  LearningStatus,
  MasteryLevel,
  PaymentType,
  PresenceStatus,
  ProjectDurationType,
  ProgramType,
  ProgressStatus,
  RootRole,
  ScreeningStatus,
  SupervisorRank,
  UserSittedStatus,
} from './models';

// ==================== ACHIEVEMENT ====================

export interface CreateAchievementDto {
  title: string;
  description?: string;
  goal?: number;
}

export type UpdateAchievementDto = Partial<CreateAchievementDto>;

// ==================== AI INTERACTION ====================

export interface CreateAIInteractionDto {
  learningSessionId: string;
  userInput: string;
}

export type UpdateAiInteractionDto = Partial<CreateAIInteractionDto>;

// ==================== ASSESSMENT ====================

export interface CreateAssessmentDto {
  screening_id: string;
  mentor_id: string;
  title: string;
  description?: string;
  startDateTime: Date;
  endDateTime: Date;
  type: AssessmentType;
  status?: AssessmentStatus;
  durationMinutes: number;
  score?: number;
  scorePerQuestion: number;
  passed?: boolean;
}

export type UpdateAssessmentDto = Partial<CreateAssessmentDto>;

export interface CreateAssessmentRetryDto {
  screening_id: string;
  mentor_id: string;
  requestedStart: Date;
  requestedEnd: Date;
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';
}

// ==================== BADGE ====================

export interface CreateBadgeDto {
  title: string;
  description?: string;
  iconUrl?: string;
}

export type UpdateBadgeDto = Partial<CreateBadgeDto>;

// ==================== CATEGORY ====================

export interface CreateCategoryDto {
  name: string;
  description?: string;
}

export type UpdateCategoryDto = Partial<CreateCategoryDto>;

// ==================== CHALLENGE ====================

export interface CreateChallengeDto {
  title: string;
  description: string;
  taskGuide?: string;
  resourceUrl?: string;
  dueAt: string;
  mentorId: string;
}

export type UpdateChallengeDto = Partial<CreateChallengeDto>;

export interface CreateChallengeSubmissionDto {
  challengeId: string;
  submissionFileUrl?: string;
  submissionType: 'zip' | 'single-file';
  language?: string;
}

// ==================== CLASS DAYS ====================

export interface CreateClassDayDto {
  programBatchId: string;
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  isActive?: boolean;
}

export type UpdateClassDayDto = Partial<CreateClassDayDto>;

// ==================== CLASSWORK ====================

export interface CreateClassworkDto {
  title: string;
  description?: string;
  type: ClassworkType;
  questions?: { question: string }[];
  dueAt: Date;
  scheduleId?: string;
  isClosed?: boolean;
}

export type UpdateClassworkDto = Partial<CreateClassworkDto>;

export interface CreateClassworkSubmissionDto {
  classworkId: string;
  answers?: string;
  submissionType?: 'zip' | 'single-file';
  language?: string;
  isLate?: boolean;
  score?: number;
  mentorFeedback?: string;
}

// ==================== CODE INTERVIEW ====================

export interface CreateCodeInterviewDto {
  mentor_id: string;
  title: string;
  description?: string;
  passCutoff?: number;
  startDateTime?: Date;
  endDateTime?: Date;
  status: AssessmentStatus;
  durationMinutes?: number;
  score?: number;
  passed?: boolean;
  screening_id?: string;
}

export type UpdateCodeInterviewDto = Partial<CreateCodeInterviewDto>;

export interface CreateCodeInterviewTaskDto {
  code_interview_id: string;
  requirements?: string[];
  points?: number;
}

export type UpdateCodeInterviewTaskDto = Partial<CreateCodeInterviewTaskDto>;

export interface CreateCodeInterviewAttemptDto {
  mentor_id: string;
  screening_id?: string;
  requestedStart: Date;
  requestedEnd: Date;
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';
  submittedAt?: Date;
  reviewerFeedback?: string;
}

export type UpdateCodeInterviewAttemptDto = Partial<CreateCodeInterviewAttemptDto>;

// ==================== CODING WORKSPACE ====================

export interface CreateCodingWorkspaceDto {
  mentor_id: string;
  screening_id: string;
  title: string;
  description: string;
  dateStarted?: string;
  dateEnded?: string;
  codeInterviewId: string;
}

export type UpdateCodingWorkspaceDto = Partial<CreateCodingWorkspaceDto>;

// ==================== CONTACT COMPLAINT ====================

export interface CreateContactComplaintDto {
  subject: string;
  message: string;
  attachment?: string[];
  internId?: string;
  mentorId?: string;
  status?: 'open' | 'closed';
  response?: string;
}

export type UpdateContactComplaintDto = Partial<CreateContactComplaintDto>;

// ==================== EXAM ====================

export interface CreateExamDto {
  title: string;
  firstExamStartTime: string;
  firstExamEndTime: string;
  secondExamStartTime: string;
  secondExamEndTime: string;
  duration: number;
  programBatchId: string;
  status: ExamStatus;
  mentorId: string;
  programId: string;
}

export type UpdateExamDto = Partial<CreateExamDto>;

export interface CreateExamAttendanceDto {
  examId: string;
  internId: string;
  startedAt?: Date;
  endedAt?: Date;
  finalScore?: number;
  isCompleted?: boolean;
}

export type UpdateExamAttendanceDto = Partial<CreateExamAttendanceDto>;

// ==================== GROUP (PROGRAM BATCH) ====================

export interface CreateGroupDto {
  batchName: string;
  startDate: Date;
  endDate: Date;
  durationInWeeks?: number;
  isActive?: boolean;
  programId: string;
}

export type UpdateGroupDto = Partial<CreateGroupDto>;

// ==================== HOMEWORK ====================

export interface CreateHomeworkDto {
  title: string;
  description: string;
  scheduleId: string;
  dueAt: string;
}

export type UpdateHomeworkDto = Partial<CreateHomeworkDto>;

export interface CreateHomeworkSubmissionDto {
  internId: string;
  homeworkId: string;
  answers?: string;
  submissionType?: 'zip' | 'single-file';
  language?: string;
}

// ==================== HONOR ====================

export interface CreateHonorDto {
  title: string;
  description?: string;
}

export type UpdateHonorDto = Partial<CreateHonorDto>;

// ==================== INTERN ====================

export interface CreateInternDto {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  bio?: string;
  gender?: Gender;
  dateOfBirth?: Date;
  image?: string;
  password: string;
  confirmPassword: string;
  previousPassword?: string;
}

export type UpdateInternDto = Partial<CreateInternDto>;

// ==================== LEARNING SESSION ====================

export interface CreateLearningSessionDto {
  programId: string;
}

export interface UpdateLearningSessionDto {
  mode?: LearningMode;
  status?: LearningStatus;
  masteryLevel?: MasteryLevel;
  currentOutlineIndex?: number;
  currentTopic?: string;
}

export interface CreateLearningProgressDto {
  topicKey: string;
  topicTitle: string;
}

export interface UpdateLearningProgressDto {
  status?: ProgressStatus;
  attempts?: number;
  confidenceScore?: number;
  aiNotes?: string;
}

// ==================== MENTOR ====================

export interface CreateCertificationDto {
  type: string;
  institution: string;
  issueDate?: string;
  fileUrl: string;
}

export interface CreateMajorDto {
  name: string;
  certifications: CreateCertificationDto[];
}

export type UpdateMajorDto = Partial<CreateMajorDto>;

export interface CreateMentorDto {
  firstName: string;
  lastName: string;
  email: string;
  gender: Gender;
  dateOfBirth: Date;
  password: string;
  confirmPassword: string;
  oldPassword?: string;
  idNumber?: string;
  idType?: IDType;
  country: string;
  stateOrProvince: string;
  phoneNumber?: string;
  image?: string;
  bio?: string;
  portfolioUrl?: string;
  linkedinUrl?: string;
  tiktokUrl?: string;
  githubUrl?: string;
  youtubeUrl?: string;
}

export type UpdateMentorDto = Partial<CreateMentorDto>;

// ==================== MESSAGES ====================

export interface SendMessageDto {
  content: string;
}

// ==================== NOTIFICATIONS ====================

export interface CreateNotifyDto {
  title: string;
  message?: string;
  targetType: string;
  targetId: string;
}

// ==================== OBJECTIVE ASSESSMENT ====================

export interface CreateObjectiveAssessmentDto {
  text: string;
  objective_assessment_id: string;
  option_1: { text: string; tag: number };
  option_2: { text: string; tag: number };
  option_3: { text: string; tag: number };
  option_4: { text: string; tag: number };
  correctOption: number;
}

export type UpdateObjectiveAssessmentDto = Partial<CreateObjectiveAssessmentDto>;

export interface CreateObjectiveAssessmentAnswerDto {
  question_id: string;
  selectedOption: number;
  isCorrect?: boolean;
  feedback?: string;
}

// ==================== OBJECTIVE EXAM ====================

export interface CreateObjectiveExamDto {
  examId: string;
  scorePerQuestion: number;
}

export type UpdateObjectiveExamDto = Partial<CreateObjectiveExamDto>;

// ==================== ONBOARDING ====================

export interface CreateOnboardingDto {
  internId: string;
  programId: string;
  batchId: string;
  progressPercentage?: number;
  completed?: boolean;
  passed?: boolean;
  feedback?: string;
  programPricePaid: boolean;
  examPricePaid: boolean;
  fullyPaid: boolean;
}

export type UpdateOnboardingDto = Partial<CreateOnboardingDto>;

// ==================== OUTLINE ====================

export interface CreateOutlineDto {
  title: string;
  description?: string;
  weekNumber?: number;
  batchId: string;
  topics?: { title: string; content?: string }[];
}

export type UpdateOutlineDto = Partial<CreateOutlineDto>;

// ==================== PERSONAL PROJECT ====================

export interface CreatePersonalProjectDto {
  title: string;
  description?: string;
  language: string;
  isPrivate?: boolean;
}

export type UpdatePersonalProjectDto = Partial<CreatePersonalProjectDto>;

// ==================== PROGRAM ====================

export interface CreateProgramDto {
  title: string;
  description?: string;
  type: ProgramType;
  categoryId: string;
  programPrice: number;
  examPrice: number;
  isPublished?: boolean;
}

export type UpdateProgramDto = Partial<CreateProgramDto>;

// ==================== QBOT ====================

export interface CreateQuestionnaireDto {
  qbot_id: string;
  mentor_id: string;
  question: string;
}

export interface CreateResponseDto {
  questionnaire_id: string;
  answer_text: string;
  summary?: string;
}

export interface QbotInterviewRetryDto {
  screening_id: string;
  mentor_id: string;
  requestedStart: Date;
  requestedEnd: Date;
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';
}

// ==================== ROOT ====================

export interface CreateRootDto {
  firstName: string;
  lastName: string;
  email: string;
  type?: string;
  password: string;
  role?: RootRole;
}

export type UpdateRootDto = Partial<CreateRootDto>;

// ==================== SCHEDULE ====================

export interface CreateScheduleDto {
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  videoLinks?: string;
  classSummary?: string;
  programBatchId: string;
  classDayId: string;
  outlineId: string;
}

export type UpdateScheduleDto = Partial<CreateScheduleDto>;

// ==================== SCREENING ====================

export interface CreateScreeningDto {
  supervisor_id: string;
  title: string;
  description?: string;
  status?: ScreeningStatus;
  currentPhase?: number;
  assessmentRetries?: number;
  finalAssessmentScore?: number;
  assessmentPassed?: boolean;
}

export type UpdateScreeningDto = Partial<CreateScreeningDto>;

// ==================== SESSION PRESENCE ====================

export interface CreateSessionPresenceDto {
  scheduleId: string;
  internId: string;
  status?: PresenceStatus;
  note?: string;
}

export type UpdateSessionPresenceDto = Partial<CreateSessionPresenceDto>;

// ==================== SOLO ====================

export interface CreateSoloDto {
  scheduleId: string;
  startTime: Date;
  endTime?: Date;
  recordingLinks?: string;
  classSummary?: string;
}

export type UpdateSoloDto = Partial<CreateSoloDto>;

// ==================== SUPERVISOR ====================

export interface CreateSupervisorDto {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword?: string;
  oldPassword?: string;
  bio?: string;
  phoneNumber?: string;
  rank?: SupervisorRank;
  rootId?: string;
}

export type UpdateSupervisorDto = Partial<CreateSupervisorDto>;

// ==================== SUPERVISOR REVIEW ====================

export interface CreateSupervisorReviewDto {
  screening_id: string;
  supervisor_id: string;
  mentor_id: string;
  comments?: string;
}

export interface UpdateSupervisorReviewDto {
  comments?: string;
  decision?: 'approved' | 'rejected' | 'needs_followup' | 'pending';
}

export interface CompleteReviewDto {
  passed: boolean;
  report: string;
  comments: string;
}

// ==================== THEORY ASSESSMENT ====================

export interface CreateTheoryAssessmentQuestionDto {
  text: string;
  correctAnswerText: string;
  theory_assessment_id: string;
}

export interface UpdateTheoryAssessmentQuestionDto {
  text?: string;
  correctAnswerText?: string;
}

export interface CreateTheoryAssessmentAnswerDto {
  question_id: string;
  answerText: string;
  isCorrect?: boolean;
  feedback?: string;
}

// ==================== THEORY EXAM ====================

export interface CreateTheoryExamDto {
  examId: string;
  scorePerQuestion: number;
}

export interface CreateTheoryExamQuestionDto {
  text: string;
  correctAnswerText: string;
  theory_exam_id: string;
}

export interface CreateTheoryExamAnswerDto {
  question_id: string;
  answerText: string;
  isCorrect?: boolean;
  feedback?: string;
}

// ==================== WORK SAMPLE ====================

export interface CreateWorkSampleDto {
  title: string;
  description: string;
  images?: string[];
  link?: string;
  dateStarted?: Date;
  dateEnded?: Date;
  mentorId: string;
}

export type UpdateWorkSampleDto = Partial<CreateWorkSampleDto>;

// ==================== ONBOARD PAYMENT ====================

export interface InitializeOnboardPaymentDto {
  onboardingId: string;
  type: PaymentType;
  email: string;
  amount: number;
}

export interface VerifyPaymentDto {
  reference: string;
}

// ==================== PROJECT EXAM ====================

export interface CreateProjectExamDto {
  examId: string;
  title: string;
  description: string;
  tasks: string[];
  guide: string[];
  start?: string;
  end?: string;
  duration_type?: ProjectDurationType;
  duration: number;
}

export type UpdateProjectExamDto = Partial<CreateProjectExamDto>;

export interface SubmitProjectDto {
  examId: string;
  link?: string;
}

export interface ReviewProjectSubmissionDto {
  markGiven?: number;
  passed?: boolean;
}

export interface UpdateProjectSubmissionStatusDto {
  status: UserSittedStatus;
}
