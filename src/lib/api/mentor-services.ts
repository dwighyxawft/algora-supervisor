import { mentorApiClient } from './mentor-client';
import {
  ProgramRoutes, GroupRoutes, OutlineRoutes, ScheduleRoutes,
  ClassDaysRoutes, HomeworkRoutes, ClassworkRoutes, ChallengeRoutes,
  ExamRoutes, ObjectiveExamRoutes, TheoryExamRoutes, ProjectExamRoutes,
  OnboardingRoutes, MessageRoutes, SoloRoutes, ProgramCategoryRoutes,
  MentorRoutes, NotifyRoutes,
} from './routes';
import type {
  Program, ProgramBatch, ProgramOutline, Schedule, ClassDay,
  Homework, Classwork, Challenge, Exam, ObjectiveExam, TheoryExam,
  TheoryExamQuestion, ProjectExam, ProjectExamSubmission,
  InternProgramOnboarding, ProgramMessage, Solo, Mentor,
  ProgramCategory, Notify,
} from './models';
import type {
  CreateProgramDto, CreateGroupDto, CreateOutlineDto, CreateScheduleDto,
  CreateClassDayDto, CreateHomeworkDto, CreateClassworkDto, CreateChallengeDto,
  CreateExamDto, CreateProjectExamDto, UpdateProjectExamDto,
  ReviewProjectSubmissionDto, CreateSoloDto, CreateTheoryExamQuestionDto,
} from './dto';

// Programs
export const mentorProgramService = {
  findAll: () => mentorApiClient.get<Program[]>(ProgramRoutes.findAll()),
  findOne: (id: string) => mentorApiClient.get<Program>(ProgramRoutes.findOne(id)),
  create: (data: CreateProgramDto) => mentorApiClient.post<Program>(ProgramRoutes.create(), data),
  update: (id: string, data: Partial<CreateProgramDto>) => mentorApiClient.patch<Program>(ProgramRoutes.update(id), data),
  remove: (id: string) => mentorApiClient.delete<any>(ProgramRoutes.remove(id)),
};

// Batches
export const mentorBatchService = {
  findForProgram: (programId: string) => mentorApiClient.get<ProgramBatch[]>(GroupRoutes.findForProgram(programId)),
  findOne: (id: string) => mentorApiClient.get<ProgramBatch>(GroupRoutes.findOne(id)),
  create: (data: CreateGroupDto) => mentorApiClient.post<ProgramBatch>(GroupRoutes.create(), data),
  update: (id: string, data: Partial<CreateGroupDto>) => mentorApiClient.patch<ProgramBatch>(GroupRoutes.update(id), data),
  remove: (id: string) => mentorApiClient.delete<any>(GroupRoutes.remove(id)),
};

// Outlines
export const mentorOutlineService = {
  findAll: (batchId?: string) => mentorApiClient.get<ProgramOutline[]>(OutlineRoutes.findAll(batchId)),
  findOne: (id: string) => mentorApiClient.get<ProgramOutline>(OutlineRoutes.findOne(id)),
  create: (data: CreateOutlineDto) => mentorApiClient.post<ProgramOutline>(OutlineRoutes.create(), data),
  update: (id: string, data: Partial<CreateOutlineDto>) => mentorApiClient.patch<ProgramOutline>(OutlineRoutes.update(id), data),
  remove: (id: string) => mentorApiClient.delete<any>(OutlineRoutes.remove(id)),
};

// Class Days (Timetable)
export const mentorClassDayService = {
  findAll: (batchId?: string) => mentorApiClient.get<ClassDay[]>(ClassDaysRoutes.findAll(batchId)),
  findOne: (id: string) => mentorApiClient.get<ClassDay>(ClassDaysRoutes.findOne(id)),
  create: (data: CreateClassDayDto) => mentorApiClient.post<ClassDay>(ClassDaysRoutes.create(), data),
  update: (id: string, data: Partial<CreateClassDayDto>) => mentorApiClient.patch<ClassDay>(ClassDaysRoutes.update(id), data),
  toggle: (id: string) => mentorApiClient.patch<ClassDay>(ClassDaysRoutes.toggle(id)),
  remove: (id: string) => mentorApiClient.delete<any>(ClassDaysRoutes.remove(id)),
};

// Schedules
export const mentorScheduleService = {
  findAll: () => mentorApiClient.get<Schedule[]>(ScheduleRoutes.findAll()),
  findOne: (id: string) => mentorApiClient.get<Schedule>(ScheduleRoutes.findOne(id)),
  create: (data: CreateScheduleDto) => mentorApiClient.post<Schedule>(ScheduleRoutes.create(), data),
  update: (id: string, data: Partial<CreateScheduleDto>) => mentorApiClient.patch<Schedule>(ScheduleRoutes.update(id), data),
  remove: (id: string) => mentorApiClient.delete<any>(ScheduleRoutes.remove(id)),
};

// Homework
export const mentorHomeworkService = {
  findAll: () => mentorApiClient.get<Homework[]>(HomeworkRoutes.findAll()),
  findOne: (id: string) => mentorApiClient.get<Homework>(HomeworkRoutes.findOne(id)),
  create: (data: CreateHomeworkDto) => mentorApiClient.post<Homework>(HomeworkRoutes.create(), data),
  update: (id: string, data: Partial<CreateHomeworkDto>) => mentorApiClient.patch<Homework>(HomeworkRoutes.update(id), data),
  remove: (id: string) => mentorApiClient.delete<any>(HomeworkRoutes.remove(id)),
};

// Classwork
export const mentorClassworkService = {
  findAll: () => mentorApiClient.get<Classwork[]>(ClassworkRoutes.findAll()),
  findOne: (id: string) => mentorApiClient.get<Classwork>(ClassworkRoutes.findOne(id)),
  create: (data: CreateClassworkDto) => mentorApiClient.post<Classwork>(ClassworkRoutes.create(), data),
  update: (id: string, data: Partial<CreateClassworkDto>) => mentorApiClient.patch<Classwork>(ClassworkRoutes.update(id), data),
  remove: (id: string) => mentorApiClient.delete<any>(ClassworkRoutes.remove(id)),
};

// Challenges
export const mentorChallengeService = {
  findAll: () => mentorApiClient.get<Challenge[]>(ChallengeRoutes.findAll()),
  findOne: (id: string) => mentorApiClient.get<Challenge>(ChallengeRoutes.findOne(id)),
  create: (data: CreateChallengeDto) => mentorApiClient.post<Challenge>(ChallengeRoutes.create(), data),
  update: (id: string, data: Partial<CreateChallengeDto>) => mentorApiClient.patch<Challenge>(ChallengeRoutes.update(id), data),
  remove: (id: string) => mentorApiClient.delete<any>(ChallengeRoutes.remove(id)),
};

// Exams
export const mentorExamService = {
  findAll: () => mentorApiClient.get<Exam[]>(ExamRoutes.findAll()),
  findOne: (id: string) => mentorApiClient.get<Exam>(ExamRoutes.findOne(id)),
  create: (data: CreateExamDto) => mentorApiClient.post<Exam>(ExamRoutes.create(), data),
  update: (id: string, data: Partial<CreateExamDto>) => mentorApiClient.patch<Exam>(ExamRoutes.update(id), data),
  remove: (id: string) => mentorApiClient.delete<any>(ExamRoutes.remove(id)),
};

// Objective Exam
export const mentorObjectiveExamService = {
  findAll: () => mentorApiClient.get<ObjectiveExam[]>(ObjectiveExamRoutes.findAll()),
  findOne: (id: string) => mentorApiClient.get<ObjectiveExam>(ObjectiveExamRoutes.findOne(id)),
  create: (data: { examId: string; scorePerQuestion: number }) => mentorApiClient.post<ObjectiveExam>(ObjectiveExamRoutes.create(), data),
  generateQuestion: (id: string, prompt?: string) => mentorApiClient.post<any>(ObjectiveExamRoutes.generateQuestion(id, prompt)),
  generateQuestions: (id: string, count?: number, prompt?: string) => mentorApiClient.post<any>(ObjectiveExamRoutes.generateQuestions(id, count, prompt)),
  remove: (id: string) => mentorApiClient.delete<any>(ObjectiveExamRoutes.remove(id)),
};

// Theory Exam
export const mentorTheoryExamService = {
  findAll: () => mentorApiClient.get<TheoryExam[]>(TheoryExamRoutes.findAll()),
  findOne: (id: string) => mentorApiClient.get<TheoryExam>(TheoryExamRoutes.findOne(id)),
  create: (data: { examId: string; scorePerQuestion: number }) => mentorApiClient.post<TheoryExam>(TheoryExamRoutes.create(), data),
  findQuestions: (teId: string) => mentorApiClient.get<TheoryExamQuestion[]>(TheoryExamRoutes.findQuestions(teId)),
  createQuestion: (data: CreateTheoryExamQuestionDto) => mentorApiClient.post<TheoryExamQuestion>(TheoryExamRoutes.createQuestion(), data),
  createQuestionAI: (teId: string, programId: string) => mentorApiClient.post<TheoryExamQuestion>(TheoryExamRoutes.createQuestionAI(teId, programId)),
  createManyAI: (teId: string, programId: string) => mentorApiClient.post<TheoryExamQuestion[]>(TheoryExamRoutes.createManyAI(teId, programId)),
  remove: (id: string) => mentorApiClient.delete<any>(TheoryExamRoutes.remove(id)),
};

// Project Exam
export const mentorProjectExamService = {
  findAll: () => mentorApiClient.get<ProjectExam[]>(ProjectExamRoutes.findAll()),
  findOne: (id: string) => mentorApiClient.get<ProjectExam>(ProjectExamRoutes.findOne(id)),
  findByExam: (examId: string) => mentorApiClient.get<ProjectExam>(ProjectExamRoutes.findByExam(examId)),
  create: (data: CreateProjectExamDto) => mentorApiClient.post<ProjectExam>(ProjectExamRoutes.create(), data),
  update: (id: string, data: UpdateProjectExamDto) => mentorApiClient.patch<ProjectExam>(ProjectExamRoutes.update(id), data),
  remove: (id: string) => mentorApiClient.delete<any>(ProjectExamRoutes.remove(id)),
  getSubmissions: (examId: string) => mentorApiClient.get<ProjectExamSubmission[]>(ProjectExamRoutes.getExamSubmissions(examId)),
  reviewSubmission: (id: string, data: ReviewProjectSubmissionDto) => mentorApiClient.patch<ProjectExamSubmission>(ProjectExamRoutes.reviewSubmission(id), data),
};

// Onboarding
export const mentorOnboardingService = {
  findForProgramAndBatch: (programId: string, batchId: string) =>
    mentorApiClient.get<InternProgramOnboarding[]>(OnboardingRoutes.findForProgramAndBatch(programId, batchId)),
  findForProgram: (programId: string) =>
    mentorApiClient.get<InternProgramOnboarding[]>(OnboardingRoutes.findForProgram(programId)),
};

// Messages
export const mentorMessageService = {
  getProgramChat: (programId: string) => mentorApiClient.get<ProgramMessage[]>(MessageRoutes.getProgramChat(programId)),
  sendProgramMessage: (programId: string, content: string) =>
    mentorApiClient.post<ProgramMessage>(MessageRoutes.sendProgram(programId, 'mentor'), { content }),
};

// Solos
export const mentorSoloService = {
  findAll: () => mentorApiClient.get<Solo[]>(SoloRoutes.findAll()),
  findOne: (id: string) => mentorApiClient.get<Solo>(SoloRoutes.findOne(id)),
  create: (data: CreateSoloDto) => mentorApiClient.post<Solo>(SoloRoutes.create(), data),
  update: (id: string, data: Partial<CreateSoloDto>) => mentorApiClient.patch<Solo>(SoloRoutes.update(id), data),
  remove: (id: string) => mentorApiClient.delete<any>(SoloRoutes.remove(id)),
};

// Categories
export const mentorCategoryService = {
  findAll: () => mentorApiClient.get<ProgramCategory[]>(ProgramCategoryRoutes.findAll()),
};

// Mentor Profile
export const mentorProfileService = {
  findOne: (id: string) => mentorApiClient.get<Mentor>(MentorRoutes.findOne(id)),
  update: (id: string, data: Partial<any>) => mentorApiClient.patch<Mentor>(MentorRoutes.update(id), data),
};

// Notifications
export const mentorNotificationService = {
  findMy: () => mentorApiClient.get<Notify[]>(NotifyRoutes.findMy('mentor')),
  markAsRead: (id: string) => mentorApiClient.patch<void>(NotifyRoutes.markAsRead(id)),
};
