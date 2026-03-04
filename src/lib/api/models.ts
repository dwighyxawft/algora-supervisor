// =============================================
// SCHEMA MODELS — Response Types
// Auto-generated from NestJS TypeORM entities
// =============================================

// ==================== ENUMS ====================

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
}

export enum IDType {
  NATIONAL_ID = 'national_id',
  PASSPORT = 'passport',
  DRIVER_LICENSE = 'driver_license',
}

export enum AssessmentStatus {
  PENDING = 'PENDING',
  READY = 'READY',
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
}

export enum AssessmentType {
  OBJECTIVE = 'OBJECTIVE',
  THEORY = 'THEORY',
}

export enum ScreeningStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export enum ProgramType {
  ONE_TIME = 'one_time',
  RECURRING = 'recurring',
}

export enum ClassworkType {
  THEORETICAL = 'theoretical',
  CODING = 'coding',
}

export enum MasteryLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

export enum LearningMode {
  TEACH = 'teach',
  REVISE = 'revise',
  PRACTICE = 'practice',
  ASSESS = 'assess',
}

export enum LearningStatus {
  ACTIVE = 'active',
  PAUSED = 'paused',
  COMPLETED = 'completed',
}

export enum ProgressStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  STRUGGLING = 'struggling',
  UNDERSTOOD = 'understood',
  MASTERED = 'mastered',
}

export enum PresenceStatus {
  PRESENT = 'present',
  ABSENT = 'absent',
  LATE = 'late',
  EXCUSED = 'excused',
}

export enum SupervisorRank {
  BRONZE = 'BRONZE',
  SILVER = 'SILVER',
  GOLD = 'GOLD',
  PLATINUM = 'PLATINUM',
  DIAMOND = 'DIAMOND',
  MASTER = 'MASTER',
  LEGEND = 'LEGEND',
}

export enum SupervisorRankNo {
  BRONZE = 1,
  SILVER = 2,
  GOLD = 3,
  PLATINUM = 4,
  DIAMOND = 5,
  MASTER = 6,
  LEGEND = 7,
}

export enum RootRole {
  SUPERUSER = 'superuser',
  ADMIN = 'admin',
}

export enum NotificationTargetType {
  ROOT = 'root',
  SUPERVISOR = 'supervisor',
  MENTOR = 'mentor',
  INTERN = 'intern',
}

export enum DayOfWeek {
  MONDAY = 'monday',
  TUESDAY = 'tuesday',
  WEDNESDAY = 'wednesday',
  THURSDAY = 'thursday',
  FRIDAY = 'friday',
  SATURDAY = 'saturday',
  SUNDAY = 'sunday',
}

export enum ExamStatus {
  NOT_STARTED = 'NOT_STARTED',
  ONGOING = 'ONGOING',
  COMPLETED = 'COMPLETED',
}

export enum ProjectDurationType {
  Minutes = 'Minutes',
  Hours = 'Hours',
  Days = 'Days',
  Weeks = 'Weeks',
}

export enum UserSittedStatus {
  Pending = 'Pending',
  Ongoing = 'Ongoing',
  Submitted = 'Submitted',
  Reviewed = 'Reviewed',
  Passed = 'Passed',
  Failed = 'Failed',
}

export enum PaymentType {
  PROGRAM = 'program_fee',
  EXAM = 'exam_fee',
  TOTAL = 'total_fee'
}

export enum PaymentStatus {
  PENDING = 'pending',
  SUCCESS = 'success',
  FAILED = 'failed',
}

export enum ProjectStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export enum ComplaintStatus {
  PENDING = 'pending',
  RESOLVED = 'resolved',
  REJECTED = 'rejected',
}

// ==================== MODELS ====================

export interface Achievement {
  id: string;
  title: string;
  description?: string;
  goal: number;
  createdAt: Date;
}

export interface UserAchievement {
  id: string;
  achievement: Achievement;
  mentor?: Mentor;
  intern?: Intern;
  progress: number;
  completed: boolean;
  earnedAt: Date;
}

export interface AiAssessment {
  id: string;
  internId: string;
  programId: string;
  learningSessionId: string;
  intern?: Intern;
  program?: Program;
  learningSession?: LearningSession;
  topic: string;
  totalQuestions: number;
  correctAnswers: number;
  scorePercentage: number;
  masteryResult: MasteryLevel;
  aiFeedback?: string;
  passed: boolean;
  createdAt: Date;
}

export interface AIInteraction {
  id: string;
  learningSessionId: string;
  internId: string;
  programId: string;
  intern?: Intern;
  program?: Program;
  learningSession?: LearningSession;
  learningState: string;
  userInput: string;
  aiResponse: {
    text: string;
    codeBlocks?: {
      language: string;
      code: string;
    }[];
  };
  meta?: {
    focusTopics?: string[];
    reason?: string;
  };
  createdAt: Date;
}

export interface Assessment {
  id: string;
  screening_id?: string;
  screening?: Screening;
  mentor_id?: string;
  mentor?: Mentor;
  title: string;
  description?: string;
  startDateTime?: Date;
  endDateTime?: Date;
  type: AssessmentType;
  status: AssessmentStatus;
  durationMinutes?: number;
  score?: number;
  passed: boolean;
  objective?: ObjectiveAssessment;
  theory?: TheoryAssessment;
  createdAt: Date;
  updatedAt: Date;
}

export interface AssessmentRetry {
  id: string;
  screening_id?: string;
  screening?: Screening;
  mentor_id?: string;
  mentor?: Mentor;
  requestedStart: Date;
  requestedEnd: Date;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: Date;
  updatedAt: Date;
}

export interface Badge {
  id: string;
  title: string;
  description?: string;
  iconUrl?: string;
  createdAt: Date;
}

export interface UserBadge {
  id: string;
  mentorId: string;
  internId: string;
  badgeId: string;
  badge: Badge;
  mentor?: Mentor;
  intern?: Intern;
  awardedAt: Date;
}

export interface ProgramCategory {
  id: string;
  name: string;
  description?: string;
  programs?: Program[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Certificate {
  id: string;
  link: string;
  issuedAt: Date;
  internId: string;
  programId: string;
  programBatchId: string;
  intern?: Intern;
  program?: Program;
  batch?: ProgramBatch;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  tasks?: { step: string; guide?: string }[];
  resources?: { title: string; link: string }[];
  programId?: string;
  program?: Program;
  mentorId: string;
  mentor?: Mentor;
  submissions?: ChallengeSubmission[];
  dueAt?: Date;
  isClosed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChallengeSubmission {
  id: string;
  internId: string;
  intern?: Intern;
  challengeId: string;
  challenge?: Challenge;
  submissionFileUrl?: string;
  submissionType?: 'zip' | 'single-file';
  language?: string;
  score?: number;
  earnedXp?: number;
  mentorFeedback?: string;
  isGraded: boolean;
  isLate: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ClassDay {
  id: string;
  programBatchId: string;
  programBatch?: ProgramBatch;
  dayOfWeek: string;
  schedules?: Schedule[];
  startTime: string;
  endTime: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Classwork {
  id: string;
  title: string;
  description?: string;
  type: ClassworkType;
  questions?: { question: string }[];
  dueAt: Date;
  scheduleId?: string;
  mentorId: string;
  schedule?: Schedule;
  mentor?: Mentor;
  submissions?: ClassworkSubmission[];
  isClosed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ClassworkSubmission {
  id: string;
  internId: string;
  classworkId: string;
  answers?: string;
  submissionFileUrl?: string;
  submissionType?: 'zip' | 'single-file';
  language?: string;
  isLate: boolean;
  isGraded: boolean;
  score?: number;
  mentorFeedback?: string;
  intern?: Intern;
  classwork?: Classwork;
  createdAt: Date;
  updatedAt: Date;
}

export interface CodeInterview {
  id: string;
  mentor_id: string;
  mentor?: Mentor;
  title: string;
  description?: string;
  passCutoff: number;
  startDateTime?: Date;
  endDateTime?: Date;
  status: AssessmentStatus;
  durationMinutes?: number;
  score?: number;
  passed: boolean;
  screening_id?: string;
  screening?: Screening;
  tasks?: CodeInterviewTask[];
  codingWorkspace?: CodingWorkspace;
  createdAt: Date;
  updatedAt: Date;
}

export interface CodeInterviewTask {
  id: string;
  code_interview_id: string;
  code_interview?: CodeInterview;
  requirements: string[];
  points: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CodeInterviewAttempt {
  id: string;
  mentor_id: string;
  mentor?: Mentor;
  screening_id?: string;
  screening?: Screening;
  requestedStart: Date;
  requestedEnd: Date;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  submittedAt?: Date;
  reviewerFeedback?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CodingWorkspace {
  id: string;
  code_interview_id: string;
  codeInterview?: CodeInterview;
  title: string;
  description: string;
  dateStarted?: Date;
  dateEnded?: Date;
  s3Key: string;
  s3Url: string;
}

export interface ContactComplaint {
  id: string;
  subject: string;
  message: string;
  attachment: string[];
  internId?: string;
  mentorId?: string;
  mentor?: Mentor;
  intern?: Intern;
  status: 'open' | 'closed';
  response?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Exam {
  id: string;
  title: string;
  firstExamType: 'objective' | 'theory';
  firstExamStartTime: Date;
  firstExamEndTime: Date;
  secondExamStartTime: Date;
  secondExamEndTime: Date;
  duration: number;
  status: ExamStatus;
  mentorId: string;
  mentor?: Mentor;
  programId: string;
  program?: Program;
  programBatchId: string;
  group?: ProgramBatch;
  theory?: TheoryExam[];
  objective?: ObjectiveExam[];
  projectExam?: ProjectExam;
  projectSubmissions?: ProjectExamSubmission[];
  examAttendance?: ExamAttendance[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectExam {
  id: string;
  examId: string;
  exam?: Exam;
  title: string;
  description: string;
  tasks: string[];
  guide: string[];
  start?: Date;
  end?: Date;
  duration_type: ProjectDurationType;
  duration: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectExamSubmission {
  id: string;
  examId: string;
  exam?: Exam;
  internId: string;
  intern?: Intern;
  link?: string;
  markGiven?: number;
  passed: boolean;
  status: UserSittedStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface ExamAttendance {
  id: string;
  examId: string;
  exam?: Exam;
  internId: string;
  intern?: Intern;
  startedFirstExamAt?: Date;
  startedSecondExamAt?: Date;
  endedFirstExamAt?: Date;
  endedSecondExamAt?: Date;
  firstExamFinalScore?: number;
  secondExamFinalScore?: number;
  firstExamIsCompleted?: boolean;
  secondExamIsCompleted?: boolean;
  finalScore: number;
  isCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Faction {
  id: string;
  name: string;
  description?: string;
  creatorId: string;
  creator?: Intern;
  members?: FactionMember[];
  joinRequests?: FactionJoinRequest[];
  messages?: FactionMessage[];
  createdAt: Date;
}

export interface FactionJoinRequest {
  id: string;
  factionId: string;
  faction?: Faction;
  internId: string;
  intern?: Intern;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  createdAt: Date;
}

export interface FactionMember {
  id: string;
  factionId: string;
  faction?: Faction;
  internId: string;
  intern?: Intern;
  role: 'ADMIN' | 'MEMBER';
  joinedAt: Date;
}

export interface Friendship {
  id: string;
  requesterId: string;
  requester?: Intern;
  receiverId: string;
  receiver?: Intern;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'BLOCKED';
  createdAt: Date;
}

export interface ProgramBatch {
  id: string;
  batchName: string;
  startDate: Date;
  endDate: Date;
  durationInWeeks?: number;
  isActive: boolean;
  programId: string;
  program?: Program;
  outlines?: ProgramOutline[];
  schedules?: Schedule[];
  exam?: Exam;
  classDays?: ClassDay[];
  certificates?: Certificate[];
  onboarding?: InternProgramOnboarding[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Homework {
  id: string;
  title: string;
  description: string;
  mentorId: string;
  mentor?: Mentor;
  scheduleId: string;
  schedule?: Schedule;
  dueAt: Date;
  isClosed: boolean;
  submissions?: HomeworkSubmission[];
  createdAt: Date;
  updatedAt: Date;
}

export interface HomeworkSubmission {
  id: string;
  internId: string;
  homeworkId: string;
  answers?: string;
  submissionFileUrl?: string;
  submissionType?: 'zip' | 'single-file';
  language?: string;
  isLate: boolean;
  isGraded: boolean;
  score?: number;
  mentorFeedback?: string;
  intern?: Intern;
  homework?: Homework;
  createdAt: Date;
  updatedAt: Date;
}

export interface Honor {
  id: string;
  title: string;
  description?: string;
  supervisors?: Supervisor[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Intern {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  image?: string;
  bio?: string;
  gender?: Gender;
  dateOfBirth?: Date;
  verified: boolean;
  socketId?: string;
  badges?: UserBadge[];
  achievements?: UserAchievement[];
  programs?: InternProgramOnboarding[];
  classworkSubmissions?: ClassworkSubmission[];
  challengeSubmissions?: ChallengeSubmission[];
  homeworkSubmissions?: HomeworkSubmission[];
  learningSessions?: LearningSession[];
  aiInteractions?: AIInteraction[];
  aiAssessments?: AiAssessment[];
  personalProjects?: PersonalProject[];
  sentMessages?: FriendMessage[];
  receivedMessages?: FriendMessage[];
  factionMembers?: FactionMember[];
  createdFactions?: Faction[];
  sentFriendships?: Friendship[];
  receivedFriendships?: Friendship[];
  contactComplaints?: ContactComplaint[];
  createdAt: Date;
  updatedAt: Date;
}

export interface LearningProgress {
  id: string;
  learningSessionId: string;
  learningSession?: LearningSession;
  topicKey: string;
  topicTitle: string;
  status: ProgressStatus;
  attempts: number;
  confidenceScore: number;
  aiNotes?: string;
  lastInteractedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface LearningSession {
  id: string;
  internId: string;
  programId: string;
  intern?: Intern;
  program?: Program;
  currentOutlineIndex: number;
  currentTopic?: string;
  mode: LearningMode;
  status: LearningStatus;
  masteryLevel: MasteryLevel;
  revisionCount: number;
  weakTopics?: string[];
  lastInteractionAt?: Date;
  endedAt?: Date;
  aiInteractions?: AIInteraction[];
  aiAssessments?: AiAssessment[];
  createdAt: Date;
  updatedAt: Date;
}

export interface MajorCertification {
  id: string;
  type: string;
  institution: string;
  issueDate?: Date;
  fileUrl: string;
  majorId: string;
  major?: MentorMajor;
}

export interface MentorMajor {
  id: string;
  name: string;
  mentorId: string;
  mentor?: Mentor;
  certifications?: MajorCertification[];
}

export interface Mentor {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  gender: Gender;
  dateOfBirth: Date;
  phoneNumber?: string;
  image?: string;
  bio?: string;
  idNumber?: string;
  idType?: IDType;
  country?: string;
  stateOrProvince?: string;
  portfolioUrl?: string;
  linkedinUrl?: string;
  youtubeUrl?: string;
  tiktokUrl?: string;
  githubUrl?: string;
  socketId?: string;
  isEmailVerified: boolean;
  mentoringInterests?: string[];
  supervisorId?: string;
  supervisor?: Supervisor;
  majors?: MentorMajor[];
  badges?: UserBadge[];
  achievements?: UserAchievement[];
  workSamples?: WorkSample[];
  screening?: Screening;
  assessments?: Assessment[];
  codeInterviews?: CodeInterview[];
  solos?: Solo[];
  classworks?: Classwork[];
  challenges?: Challenge[];
  assessment_retries?: AssessmentRetry[];
  programs?: Program[];
  contactComplaints?: ContactComplaint[];
  complaints?: MentorComplaint[];
  reviews?: MentorReview[];
  exams?: Exam[];
  homeworks?: Homework[];
  programMessages?: ProgramMessage[];
  createdAt: Date;
  updatedAt: Date;
}

export interface MentorComplaint {
  id: string;
  title: string;
  description: string;
  mentorId: string;
  mentor?: Mentor;
  internId?: string;
  intern?: Intern;
  status: ComplaintStatus;
  attachments?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface MentorReview {
  id: string;
  mentorId: string;
  mentor?: Mentor;
  internId: string;
  intern?: Intern;
  rating: number;
  comment?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface FriendMessage {
  id: string;
  senderId: string;
  sender?: Intern;
  receiverId: string;
  receiver?: Intern;
  content: string;
  createdAt: Date;
}

export interface FactionMessage {
  id: string;
  factionId: string;
  faction?: Faction;
  factionSenderId: string;
  factionSender?: Intern;
  content: string;
  isEdited: boolean;
  createdAt: Date;
}

export interface ProgramMessage {
  id: string;
  program?: Program;
  internSenderId?: string;
  internSender?: Intern;
  mentorSenderId?: string;
  mentor?: Mentor;
  content: string;
  isEdited: boolean;
  createdAt: Date;
}

export interface Notify {
  id: string;
  title: string;
  message?: string;
  targetType: NotificationTargetType;
  targetId: string;
  isRead: boolean;
  createdAt: Date;
}

export interface ObjectiveAssessment {
  id: string;
  assessment_id: string;
  assessment?: Assessment;
  timeStarted?: Date;
  timeStopped?: Date;
  scorePerQuestion?: number;
  questions?: ObjectiveAssessmentQuestion[];
}

export interface ObjectiveAssessmentQuestion {
  id: string;
  text: string;
  objective_assessment_id: string;
  option_1: { text: string; tag: number };
  option_2: { text: string; tag: number };
  option_3: { text: string; tag: number };
  option_4: { text: string; tag: number };
  correctOption: number;
}

export interface ObjectiveAssessmentAnswer {
  id: string;
  question_id: string;
  question?: ObjectiveAssessmentQuestion;
  selectedOption: number;
  isCorrect: boolean;
}

export interface ObjectiveExam {
  id: string;
  examId: string;
  exam?: Exam;
  scorePerQuestion?: number;
  durationInMinutes: number;
  questions?: ObjectiveExamQuestion[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ObjectiveExamQuestion {
  id: string;
  text: string;
  correctTag: number;
  options?: ObjectiveExamOption[];
}

export interface ObjectiveExamOption {
  id: string;
  text: string;
  tag: number;
}

export interface ObjectiveExamAnswer {
  id: string;
  questionId: string;
  internId: string;
  selectedOption: number;
  isCorrect: boolean;
}

export interface OnboardPayment {
  id: string;
  internId: string;
  programId: string;
  onboardingId: string;
  type: PaymentType;
  amount: number;
  status: PaymentStatus;
  currency: string;
  reference: string;
  paidAt?: Date;
  paymentChannel?: string;
  gatewayResponse?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface InternProgramOnboarding {
  id: string;
  internId: string;
  intern?: Intern;
  programId: string;
  program?: Program;
  batchId: string;
  batch?: ProgramBatch;
  progressPercentage: number;
  completed: boolean;
  passed: boolean;
  feedback?: string;
  programPricePaid: boolean;
  examPricePaid: boolean;
  fullyPaid: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProgramOutline {
  id: string;
  title: string;
  description?: string;
  weekNumber?: number;
  batchId: string;
  batch?: ProgramBatch;
  topics?: { title: string; content?: string }[];
  schedules?: Schedule[];
  createdAt: Date;
  updatedAt: Date;
}

export interface PersonalProject {
  id: string;
  title: string;
  description?: string;
  language: string;
  zipUrl: string;
  zipKey: string;
  status: ProjectStatus;
  internId: string;
  intern?: Intern;
  isPrivate: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Program {
  id: string;
  title: string;
  description?: string;
  categoryId?: string;
  type: ProgramType;
  mentorId: string;
  mentor?: Mentor;
  category?: ProgramCategory;
  programPrice: number;
  examPrice: number;
  totalPrice: number;
  batches?: ProgramBatch[];
  onboarding?: InternProgramOnboarding[];
  challenges?: Challenge[];
  exams?: Exam[];
  learningSessions?: LearningSession[];
  aiInteractions?: AIInteraction[];
  aiAssessments?: AiAssessment[];
  messages?: ProgramMessage[];
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface QBotInterviewRetry {
  id: string;
  screening_id?: string;
  screening?: Screening;
  mentor_id?: string;
  mentor?: Mentor;
  requestedStart: Date;
  requestedEnd: Date;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: Date;
  updatedAt: Date;
}

export interface Qbot {
  id: string;
  screening_id: string;
  screening?: Screening;
  questionnaires?: Questionnaire[];
  status: string;
  satisfactory: boolean;
  report?: string;
  startedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Questionnaire {
  id: string;
  qbot_id: string;
  qbot?: Qbot;
  mentor_id: string;
  mentor?: Mentor;
  question: string;
  answers?: QbotResponse;
  createdAt: Date;
  updatedAt: Date;
}

export interface QbotResponse {
  id: string;
  questionnaire_id: string;
  questionnaire?: Questionnaire;
  answer_text: string;
  summary?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Root {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: RootRole;
  type?: string;
  profileImage?: string;
  verified: boolean;
  socketId?: string;
  supervisors?: Supervisor[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Schedule {
  id: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  videoLinks?: string[];
  classSummary?: string[];
  programBatchId: string;
  outlineId: string;
  classDayId: string;
  programBatch?: ProgramBatch;
  outline?: ProgramOutline;
  classDay?: ClassDay;
  sessionPresences?: SessionPresence[];
  solos?: Solo[];
  classworks?: Classwork[];
  homeworks?: Homework[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Screening {
  id: string;
  supervisor_id?: string;
  title: string;
  description: string;
  supervisor?: Supervisor;
  mentor?: Mentor;
  mentor_id: string;
  status: ScreeningStatus;
  currentPhase: number;
  assessmentRetries: number;
  finalAssessmentScore?: number;
  assessmentPassed: boolean;
  codeInterviewRetries: number;
  finalCodeInterviewScore?: number;
  codeInterviewPassed: boolean;
  qBotPassed: boolean;
  qBotRetries: number;
  reviewRetries: number;
  reviewCompleted: boolean;
  assessments?: Assessment[];
  retries?: AssessmentRetry[];
  codeInterviews?: CodeInterview[];
  codeInterviewAttempts?: CodeInterviewAttempt[];
  supervisorReviews?: SupervisorReview[];
  qbots?: Qbot[];
  createdAt: Date;
  updatedAt: Date;
}

export interface SessionPresence {
  id: string;
  scheduleId: string;
  internId: string;
  schedule?: Schedule;
  intern?: Intern;
  status: PresenceStatus;
  checkInTime?: Date;
  note?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Solo {
  id: string;
  scheduleId: string;
  mentorId: string;
  schedule?: Schedule;
  mentor?: Mentor;
  startTime: Date;
  endTime?: Date;
  status: 'upcoming' | 'live' | 'completed' | 'cancelled';
  recordingLinks: string[];
  soloSummary: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Supervisor {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  bio?: string;
  image?: string;
  phoneNumber?: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  currentMentorCount: number;
  socketId?: string;
  lastAssignedAt?: Date;
  mentors?: Mentor[];
  honors?: Honor[];
  screenings?: Screening[];
  rank: SupervisorRank;
  rankNo: number;
  maxMentors: number;
  rootId: string;
  root?: Root;
  createdAt: Date;
  updatedAt: Date;
}

export interface SupervisorReview {
  id: string;
  screening_id: string;
  screening?: Screening;
  meeting_uuid: string;
  comments?: string;
  decision: 'approved' | 'rejected' | 'needs_followup' | 'pending';
  evaluation_summary?: { passed: boolean; report: string };
  review_started_at?: Date;
  review_completed_at?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface TheoryAssessment {
  id: string;
  assessment_id: string;
  assessment?: Assessment;
  timeStarted?: Date;
  timeStopped?: Date;
  scorePerQuestion?: number;
  questions?: TheoryAssessmentQuestion[];
}

export interface TheoryAssessmentQuestion {
  id: string;
  text: string;
  correctAnswerText: string;
  theory_assessment_id: string;
  assessment?: TheoryAssessment;
  answer?: TheoryAssessmentAnswer;
}

export interface TheoryAssessmentAnswer {
  id: string;
  question_id: string;
  question?: TheoryAssessmentQuestion;
  answerText: string;
  isCorrect: boolean;
  feedback?: string;
}

export interface TheoryExam {
  id: string;
  scorePerQuestion?: number;
  durationInMinutes: number;
  questions?: TheoryExamQuestion[];
  examId: string;
  exam?: Exam;
  createdAt: Date;
  updatedAt: Date;
}

export interface TheoryExamQuestion {
  id: string;
  text: string;
  correctAnswerText?: string;
  theoryExamId: string;
  theoryExam?: TheoryExam;
  submissions?: TheoryExamSubmission[];
  createdAt: Date;
  updatedAt: Date;
}

export interface TheoryExamSubmission {
  id: string;
  questionId: string;
  question?: TheoryExamQuestion;
  internId: string;
  intern?: Intern;
  answerText: string;
  isCorrect: boolean;
  feedback?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkSample {
  id: string;
  mentorId: string;
  mentor?: Mentor;
  title: string;
  description: string;
  images?: string[];
  link?: string;
  status: 'accepted' | 'rejected' | 'pending';
  dateStarted?: Date;
  dateEnded?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface DeleteResult {
  affected?: number;
  raw: any;
}

export interface UpdateResult {
  affected?: number;
  raw: any;
  generatedMaps: any[];
}
