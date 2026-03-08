import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  mentorProgramService, mentorBatchService, mentorOutlineService,
  mentorClassDayService, mentorScheduleService, mentorHomeworkService,
  mentorClassworkService, mentorChallengeService, mentorExamService,
  mentorObjectiveExamService, mentorTheoryExamService, mentorProjectExamService,
  mentorOnboardingService, mentorMessageService, mentorCategoryService,
  mentorNotificationService,
} from '@/lib/api/mentor-services';
import type {
  CreateProgramDto, CreateGroupDto, CreateOutlineDto, CreateScheduleDto,
  CreateClassDayDto, CreateHomeworkDto, CreateClassworkDto, CreateChallengeDto,
  CreateExamDto, CreateProjectExamDto, ReviewProjectSubmissionDto,
  CreateTheoryExamQuestionDto,
} from '@/lib/api/dto';
import { useToast } from '@/hooks/use-toast';

const t = (toast: any, title: string) => ({ onSuccess: () => toast({ title }), onError: (e: Error) => toast({ title: 'Error', description: e.message, variant: 'destructive' as const }) });

// Programs
export const useMentorPrograms = () => useQuery({ queryKey: ['m', 'programs'], queryFn: mentorProgramService.findAll });
export const useMentorProgram = (id: string) => useQuery({ queryKey: ['m', 'programs', id], queryFn: () => mentorProgramService.findOne(id), enabled: !!id });
export const useCreateMentorProgram = () => { const qc = useQueryClient(); const { toast } = useToast(); return useMutation({ mutationFn: (d: CreateProgramDto) => mentorProgramService.create(d), onSuccess: () => { qc.invalidateQueries({ queryKey: ['m', 'programs'] }); toast({ title: 'Program created' }); }, onError: (e: Error) => toast({ title: 'Error', description: e.message, variant: 'destructive' }) }); };
export const useUpdateMentorProgram = () => { const qc = useQueryClient(); const { toast } = useToast(); return useMutation({ mutationFn: ({ id, data }: { id: string; data: Partial<CreateProgramDto> }) => mentorProgramService.update(id, data), onSuccess: () => { qc.invalidateQueries({ queryKey: ['m', 'programs'] }); toast({ title: 'Program updated' }); }, onError: (e: Error) => toast({ title: 'Error', description: e.message, variant: 'destructive' }) }); };
export const useDeleteMentorProgram = () => { const qc = useQueryClient(); return useMutation({ mutationFn: (id: string) => mentorProgramService.remove(id), onSuccess: () => qc.invalidateQueries({ queryKey: ['m', 'programs'] }) }); };

// Batches
export const useMentorBatches = (programId: string) => useQuery({ queryKey: ['m', 'batches', programId], queryFn: () => mentorBatchService.findForProgram(programId), enabled: !!programId });
export const useMentorBatch = (id: string) => useQuery({ queryKey: ['m', 'batch', id], queryFn: () => mentorBatchService.findOne(id), enabled: !!id });
export const useCreateMentorBatch = () => { const qc = useQueryClient(); const { toast } = useToast(); return useMutation({ mutationFn: (d: CreateGroupDto) => mentorBatchService.create(d), onSuccess: () => { qc.invalidateQueries({ queryKey: ['m', 'batches'] }); toast({ title: 'Batch created' }); }, onError: (e: Error) => toast({ title: 'Error', description: e.message, variant: 'destructive' }) }); };
export const useUpdateMentorBatch = () => { const qc = useQueryClient(); const { toast } = useToast(); return useMutation({ mutationFn: ({ id, data }: { id: string; data: Partial<CreateGroupDto> }) => mentorBatchService.update(id, data), onSuccess: () => { qc.invalidateQueries({ queryKey: ['m', 'batches'] }); qc.invalidateQueries({ queryKey: ['m', 'batch'] }); toast({ title: 'Batch updated' }); }, onError: (e: Error) => toast({ title: 'Error', description: e.message, variant: 'destructive' }) }); };
export const useDeleteMentorBatch = () => { const qc = useQueryClient(); return useMutation({ mutationFn: (id: string) => mentorBatchService.remove(id), onSuccess: () => qc.invalidateQueries({ queryKey: ['m', 'batches'] }) }); };

// Outlines
export const useMentorOutlines = (batchId?: string) => useQuery({ queryKey: ['m', 'outlines', batchId], queryFn: () => mentorOutlineService.findAll(batchId), enabled: !!batchId });
export const useCreateMentorOutline = () => { const qc = useQueryClient(); const { toast } = useToast(); return useMutation({ mutationFn: (d: CreateOutlineDto) => mentorOutlineService.create(d), onSuccess: () => { qc.invalidateQueries({ queryKey: ['m', 'outlines'] }); toast({ title: 'Outline created' }); }, onError: (e: Error) => toast({ title: 'Error', description: e.message, variant: 'destructive' }) }); };
export const useUpdateMentorOutline = () => { const qc = useQueryClient(); const { toast } = useToast(); return useMutation({ mutationFn: ({ id, data }: { id: string; data: Partial<CreateOutlineDto> }) => mentorOutlineService.update(id, data), onSuccess: () => { qc.invalidateQueries({ queryKey: ['m', 'outlines'] }); toast({ title: 'Outline updated' }); }, onError: (e: Error) => toast({ title: 'Error', description: e.message, variant: 'destructive' }) }); };
export const useDeleteMentorOutline = () => { const qc = useQueryClient(); return useMutation({ mutationFn: (id: string) => mentorOutlineService.remove(id), onSuccess: () => qc.invalidateQueries({ queryKey: ['m', 'outlines'] }) }); };

// Class Days (Timetable)
export const useMentorClassDays = (batchId?: string) => useQuery({ queryKey: ['m', 'classDays', batchId], queryFn: () => mentorClassDayService.findAll(batchId), enabled: !!batchId });
export const useCreateMentorClassDay = () => { const qc = useQueryClient(); const { toast } = useToast(); return useMutation({ mutationFn: (d: CreateClassDayDto) => mentorClassDayService.create(d), onSuccess: () => { qc.invalidateQueries({ queryKey: ['m', 'classDays'] }); toast({ title: 'Timetable entry created' }); }, onError: (e: Error) => toast({ title: 'Error', description: e.message, variant: 'destructive' }) }); };
export const useUpdateMentorClassDay = () => { const qc = useQueryClient(); const { toast } = useToast(); return useMutation({ mutationFn: ({ id, data }: { id: string; data: Partial<CreateClassDayDto> }) => mentorClassDayService.update(id, data), onSuccess: () => { qc.invalidateQueries({ queryKey: ['m', 'classDays'] }); toast({ title: 'Timetable updated' }); }, onError: (e: Error) => toast({ title: 'Error', description: e.message, variant: 'destructive' }) }); };
export const useToggleMentorClassDay = () => { const qc = useQueryClient(); return useMutation({ mutationFn: (id: string) => mentorClassDayService.toggle(id), onSuccess: () => qc.invalidateQueries({ queryKey: ['m', 'classDays'] }) }); };
export const useDeleteMentorClassDay = () => { const qc = useQueryClient(); return useMutation({ mutationFn: (id: string) => mentorClassDayService.remove(id), onSuccess: () => qc.invalidateQueries({ queryKey: ['m', 'classDays'] }) }); };

// Schedules
export const useMentorSchedules = () => useQuery({ queryKey: ['m', 'schedules'], queryFn: mentorScheduleService.findAll });
export const useMentorSchedule = (id: string) => useQuery({ queryKey: ['m', 'schedule', id], queryFn: () => mentorScheduleService.findOne(id), enabled: !!id });
export const useCreateMentorSchedule = () => { const qc = useQueryClient(); const { toast } = useToast(); return useMutation({ mutationFn: (d: CreateScheduleDto) => mentorScheduleService.create(d), onSuccess: () => { qc.invalidateQueries({ queryKey: ['m', 'schedules'] }); toast({ title: 'Schedule created' }); }, onError: (e: Error) => toast({ title: 'Error', description: e.message, variant: 'destructive' }) }); };
export const useUpdateMentorSchedule = () => { const qc = useQueryClient(); const { toast } = useToast(); return useMutation({ mutationFn: ({ id, data }: { id: string; data: Partial<CreateScheduleDto> }) => mentorScheduleService.update(id, data), onSuccess: () => { qc.invalidateQueries({ queryKey: ['m', 'schedules'] }); toast({ title: 'Schedule updated' }); }, onError: (e: Error) => toast({ title: 'Error', description: e.message, variant: 'destructive' }) }); };
export const useDeleteMentorSchedule = () => { const qc = useQueryClient(); return useMutation({ mutationFn: (id: string) => mentorScheduleService.remove(id), onSuccess: () => qc.invalidateQueries({ queryKey: ['m', 'schedules'] }) }); };

// Homework
export const useMentorHomeworks = () => useQuery({ queryKey: ['m', 'homeworks'], queryFn: mentorHomeworkService.findAll });
export const useMentorHomework = (id: string) => useQuery({ queryKey: ['m', 'homework', id], queryFn: () => mentorHomeworkService.findOne(id), enabled: !!id });
export const useCreateMentorHomework = () => { const qc = useQueryClient(); const { toast } = useToast(); return useMutation({ mutationFn: (d: CreateHomeworkDto) => mentorHomeworkService.create(d), onSuccess: () => { qc.invalidateQueries({ queryKey: ['m', 'homeworks'] }); toast({ title: 'Homework created' }); }, onError: (e: Error) => toast({ title: 'Error', description: e.message, variant: 'destructive' }) }); };
export const useDeleteMentorHomework = () => { const qc = useQueryClient(); return useMutation({ mutationFn: (id: string) => mentorHomeworkService.remove(id), onSuccess: () => qc.invalidateQueries({ queryKey: ['m', 'homeworks'] }) }); };

// Classwork
export const useMentorClassworks = () => useQuery({ queryKey: ['m', 'classworks'], queryFn: mentorClassworkService.findAll });
export const useMentorClasswork = (id: string) => useQuery({ queryKey: ['m', 'classwork', id], queryFn: () => mentorClassworkService.findOne(id), enabled: !!id });
export const useCreateMentorClasswork = () => { const qc = useQueryClient(); const { toast } = useToast(); return useMutation({ mutationFn: (d: CreateClassworkDto) => mentorClassworkService.create(d), onSuccess: () => { qc.invalidateQueries({ queryKey: ['m', 'classworks'] }); toast({ title: 'Classwork created' }); }, onError: (e: Error) => toast({ title: 'Error', description: e.message, variant: 'destructive' }) }); };
export const useDeleteMentorClasswork = () => { const qc = useQueryClient(); return useMutation({ mutationFn: (id: string) => mentorClassworkService.remove(id), onSuccess: () => qc.invalidateQueries({ queryKey: ['m', 'classworks'] }) }); };

// Challenges
export const useMentorChallenges = () => useQuery({ queryKey: ['m', 'challenges'], queryFn: mentorChallengeService.findAll });
export const useMentorChallenge = (id: string) => useQuery({ queryKey: ['m', 'challenge', id], queryFn: () => mentorChallengeService.findOne(id), enabled: !!id });
export const useCreateMentorChallenge = () => { const qc = useQueryClient(); const { toast } = useToast(); return useMutation({ mutationFn: (d: CreateChallengeDto) => mentorChallengeService.create(d), onSuccess: () => { qc.invalidateQueries({ queryKey: ['m', 'challenges'] }); toast({ title: 'Challenge created' }); }, onError: (e: Error) => toast({ title: 'Error', description: e.message, variant: 'destructive' }) }); };
export const useDeleteMentorChallenge = () => { const qc = useQueryClient(); return useMutation({ mutationFn: (id: string) => mentorChallengeService.remove(id), onSuccess: () => qc.invalidateQueries({ queryKey: ['m', 'challenges'] }) }); };

// Exams
export const useMentorExams = () => useQuery({ queryKey: ['m', 'exams'], queryFn: mentorExamService.findAll });
export const useMentorExam = (id: string) => useQuery({ queryKey: ['m', 'exam', id], queryFn: () => mentorExamService.findOne(id), enabled: !!id });
export const useCreateMentorExam = () => { const qc = useQueryClient(); const { toast } = useToast(); return useMutation({ mutationFn: (d: CreateExamDto) => mentorExamService.create(d), onSuccess: () => { qc.invalidateQueries({ queryKey: ['m', 'exams'] }); toast({ title: 'Exam created' }); }, onError: (e: Error) => toast({ title: 'Error', description: e.message, variant: 'destructive' }) }); };

// Objective Exam
export const useMentorObjectiveExam = (id: string) => useQuery({ queryKey: ['m', 'objExam', id], queryFn: () => mentorObjectiveExamService.findOne(id), enabled: !!id });
export const useCreateMentorObjectiveExam = () => { const qc = useQueryClient(); const { toast } = useToast(); return useMutation({ mutationFn: (d: { examId: string; scorePerQuestion: number }) => mentorObjectiveExamService.create(d), onSuccess: () => { qc.invalidateQueries({ queryKey: ['m', 'exams'] }); toast({ title: 'Objective exam created' }); }, onError: (e: Error) => toast({ title: 'Error', description: e.message, variant: 'destructive' }) }); };
export const useGenerateObjExamQuestion = () => { const qc = useQueryClient(); const { toast } = useToast(); return useMutation({ mutationFn: ({ id, prompt }: { id: string; prompt?: string }) => mentorObjectiveExamService.generateQuestion(id, prompt), onSuccess: () => { qc.invalidateQueries({ queryKey: ['m', 'objExam'] }); qc.invalidateQueries({ queryKey: ['m', 'exam'] }); toast({ title: 'Question generated' }); }, onError: (e: Error) => toast({ title: 'Error', description: e.message, variant: 'destructive' }) }); };
export const useGenerateObjExamQuestions = () => { const qc = useQueryClient(); const { toast } = useToast(); return useMutation({ mutationFn: ({ id, count, prompt }: { id: string; count?: number; prompt?: string }) => mentorObjectiveExamService.generateQuestions(id, count, prompt), onSuccess: () => { qc.invalidateQueries({ queryKey: ['m', 'objExam'] }); qc.invalidateQueries({ queryKey: ['m', 'exam'] }); toast({ title: 'Questions generated' }); }, onError: (e: Error) => toast({ title: 'Error', description: e.message, variant: 'destructive' }) }); };

// Theory Exam
export const useMentorTheoryExam = (id: string) => useQuery({ queryKey: ['m', 'theoryExam', id], queryFn: () => mentorTheoryExamService.findOne(id), enabled: !!id });
export const useMentorTheoryExamQuestions = (teId: string) => useQuery({ queryKey: ['m', 'theoryExamQ', teId], queryFn: () => mentorTheoryExamService.findQuestions(teId), enabled: !!teId });
export const useCreateMentorTheoryExam = () => { const qc = useQueryClient(); const { toast } = useToast(); return useMutation({ mutationFn: (d: { examId: string; scorePerQuestion: number }) => mentorTheoryExamService.create(d), onSuccess: () => { qc.invalidateQueries({ queryKey: ['m', 'exams'] }); toast({ title: 'Theory exam created' }); }, onError: (e: Error) => toast({ title: 'Error', description: e.message, variant: 'destructive' }) }); };
export const useCreateTheoryExamQuestion = () => { const qc = useQueryClient(); const { toast } = useToast(); return useMutation({ mutationFn: (d: CreateTheoryExamQuestionDto) => mentorTheoryExamService.createQuestion(d), onSuccess: () => { qc.invalidateQueries({ queryKey: ['m', 'theoryExamQ'] }); toast({ title: 'Question created' }); }, onError: (e: Error) => toast({ title: 'Error', description: e.message, variant: 'destructive' }) }); };
export const useGenerateTheoryExamAI = () => { const qc = useQueryClient(); const { toast } = useToast(); return useMutation({ mutationFn: ({ teId, programId }: { teId: string; programId: string }) => mentorTheoryExamService.createManyAI(teId, programId), onSuccess: () => { qc.invalidateQueries({ queryKey: ['m', 'theoryExamQ'] }); toast({ title: 'AI questions generated' }); }, onError: (e: Error) => toast({ title: 'Error', description: e.message, variant: 'destructive' }) }); };

// Project Exam
export const useMentorProjectExamByExam = (examId: string) => useQuery({ queryKey: ['m', 'projectExam', examId], queryFn: () => mentorProjectExamService.findByExam(examId), enabled: !!examId });
export const useCreateMentorProjectExam = () => { const qc = useQueryClient(); const { toast } = useToast(); return useMutation({ mutationFn: (d: CreateProjectExamDto) => mentorProjectExamService.create(d), onSuccess: () => { qc.invalidateQueries({ queryKey: ['m', 'projectExam'] }); qc.invalidateQueries({ queryKey: ['m', 'exams'] }); toast({ title: 'Project exam created' }); }, onError: (e: Error) => toast({ title: 'Error', description: e.message, variant: 'destructive' }) }); };
export const useMentorProjectSubmissions = (examId: string) => useQuery({ queryKey: ['m', 'projSubs', examId], queryFn: () => mentorProjectExamService.getSubmissions(examId), enabled: !!examId });
export const useReviewMentorProjectSubmission = () => { const qc = useQueryClient(); const { toast } = useToast(); return useMutation({ mutationFn: ({ id, data }: { id: string; data: ReviewProjectSubmissionDto }) => mentorProjectExamService.reviewSubmission(id, data), onSuccess: () => { qc.invalidateQueries({ queryKey: ['m', 'projSubs'] }); toast({ title: 'Submission reviewed' }); }, onError: (e: Error) => toast({ title: 'Error', description: e.message, variant: 'destructive' }) }); };

// Onboarding
export const useMentorBatchOnboarding = (programId: string, batchId: string) => useQuery({ queryKey: ['m', 'onboarding', programId, batchId], queryFn: () => mentorOnboardingService.findForProgramAndBatch(programId, batchId), enabled: !!programId && !!batchId });

// Messages
export const useProgramMessages = (programId: string) => useQuery({ queryKey: ['m', 'messages', programId], queryFn: () => mentorMessageService.getProgramChat(programId), enabled: !!programId });
export const useSendProgramMessage = () => { const qc = useQueryClient(); return useMutation({ mutationFn: ({ programId, content }: { programId: string; content: string }) => mentorMessageService.sendProgramMessage(programId, content), onSuccess: (_, v) => qc.invalidateQueries({ queryKey: ['m', 'messages', v.programId] }) }); };

// Categories
export const useMentorCategories = () => useQuery({ queryKey: ['m', 'categories'], queryFn: mentorCategoryService.findAll });

// Notifications
export const useMentorNotifications = () => useQuery({ queryKey: ['m', 'notifications'], queryFn: mentorNotificationService.findMy, refetchInterval: 30000 });
