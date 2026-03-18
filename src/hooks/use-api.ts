// =============================================
// React Query hooks for Supervisor API
// =============================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  mentorService,
  internService,
  screeningService,
  mentorComplaintService,
  mentorReviewService,
  notificationService,
  programService,
  supervisorService,
  assessmentService,
  codeInterviewService,
  reviewService,
  qbotService,
  workSampleService,
  projectExamService,
  examService,
  onboardingService,
  challengeService,
  batchService,
  scheduleService,
  classDayService,
  homeworkService,
  classworkService,
  outlineService,
  objectiveAssessmentService,
  theoryAssessmentService,
} from '@/lib/api/services';
import type {
  CreateScreeningDto,
  UpdateScreeningDto,
  UpdateContactComplaintDto,
  UpdateSupervisorDto,
  CompleteReviewDto,
  CreateNotifyDto,
  ReviewProjectSubmissionDto,
  UpdateProjectSubmissionStatusDto,
  UpdateMentorComplaintDto,
  CreateAssessmentDto,
  CreateObjectiveAssessmentDto,
  CreateTheoryAssessmentQuestionDto,
  CreateCodeInterviewDto,
} from '@/lib/api/dto';
import type { ComplaintStatus } from '@/lib/api/models';
import { useToast } from '@/hooks/use-toast';

// ==================== MENTORS ====================
export function useSupervisorMentors(supervisorId: string) {
  return useQuery({
    queryKey: ['mentors', 'supervisor', supervisorId],
    queryFn: () => mentorService.findBySupervisor(supervisorId),
    enabled: !!supervisorId,
  });
}

export function useMentor(id: string) {
  return useQuery({ queryKey: ['mentors', id], queryFn: () => mentorService.findOne(id), enabled: !!id });
}

// ==================== INTERNS ====================
export function useIntern(id: string) {
  return useQuery({ queryKey: ['interns', id], queryFn: () => internService.findOne(id), enabled: !!id });
}

// ==================== SCREENINGS ====================
export function useScreenings() {
  return useQuery({ queryKey: ['screenings'], queryFn: screeningService.findAll });
}

export function useScreening(id: string) {
  return useQuery({ queryKey: ['screenings', id], queryFn: () => screeningService.findOne(id), enabled: !!id });
}

export function useCreateScreening() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (data: CreateScreeningDto) => screeningService.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['screenings'] }); toast({ title: 'Screening created' }); },
    onError: (e: Error) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });
}

export function useUpdateScreening() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateScreeningDto }) => screeningService.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['screenings'] }),
  });
}

// ==================== MENTOR COMPLAINTS ====================
export function useMentorComplaints(supervisorId: string) {
  return useQuery({
    queryKey: ['mentorComplaints', supervisorId],
    queryFn: () => mentorComplaintService.findBySupervisor(supervisorId),
    enabled: !!supervisorId,
  });
}

export function useUpdateMentorComplaint() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateMentorComplaintDto }) => mentorComplaintService.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['mentorComplaints'] }); toast({ title: 'Complaint updated' }); },
    onError: (e: Error) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });
}

// ==================== MENTOR REVIEWS ====================
export function useMentorReviews(mentorId: string) {
  return useQuery({
    queryKey: ['mentorReviews', mentorId],
    queryFn: () => mentorReviewService.findByMentor(mentorId),
    enabled: !!mentorId,
  });
}

// ==================== NOTIFICATIONS ====================
export function useNotifications() {
  return useQuery({ queryKey: ['notifications'], queryFn: notificationService.findMy, refetchInterval: 30000 });
}

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationService.markAsRead(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });
}

export function useDeleteNotification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });
}

// ==================== PROGRAMS ====================
export function usePrograms() {
  return useQuery({ queryKey: ['programs'], queryFn: programService.findAll });
}

export function useProgram(id: string) {
  return useQuery({ queryKey: ['programs', id], queryFn: () => programService.findOne(id), enabled: !!id });
}

// ==================== PROGRAM BATCHES ====================
export function useProgramBatches(programId: string) {
  return useQuery({
    queryKey: ['batches', programId],
    queryFn: () => batchService.findForProgram(programId),
    enabled: !!programId,
  });
}

export function useBatch(id: string) {
  return useQuery({ queryKey: ['batches', 'detail', id], queryFn: () => batchService.findOne(id), enabled: !!id });
}

// ==================== ONBOARDING ====================
export function useBatchOnboardings(programId: string, batchId: string) {
  return useQuery({
    queryKey: ['onboardings', programId, batchId],
    queryFn: () => onboardingService.findForProgramAndBatch(programId, batchId),
    enabled: !!programId && !!batchId,
  });
}

export function useProgramOnboardings(programId: string) {
  return useQuery({
    queryKey: ['onboardings', 'program', programId],
    queryFn: () => onboardingService.findForProgram(programId),
    enabled: !!programId,
  });
}

// ==================== SUPERVISOR PROFILE ====================
export function useUpdateSupervisorProfile() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (data: UpdateSupervisorDto) => supervisorService.updateProfile(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['supervisor'] }); toast({ title: 'Profile updated' }); },
    onError: (e: Error) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });
}

export function useUpdateSupervisorPassword() {
  const { toast } = useToast();
  return useMutation({
    mutationFn: (data: { oldPassword: string; password: string; confirmPassword: string }) => supervisorService.updatePassword(data),
    onSuccess: () => toast({ title: 'Password updated' }),
    onError: (e: Error) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });
}

// ==================== ASSESSMENTS ====================
export function useAssessments() {
  return useQuery({ queryKey: ['assessments'], queryFn: assessmentService.findAll });
}

export function useAssessment(id: string) {
  return useQuery({ queryKey: ['assessments', id], queryFn: () => assessmentService.findOne(id), enabled: !!id });
}

export function useCreateAssessment() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (data: CreateAssessmentDto) => assessmentService.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['screenings'] }); qc.invalidateQueries({ queryKey: ['assessments'] }); toast({ title: 'Assessment created' }); },
    onError: (e: Error) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });
}

export function useUpdateAssessment() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateAssessmentDto> }) => assessmentService.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['screenings'] }); qc.invalidateQueries({ queryKey: ['assessments'] }); toast({ title: 'Assessment updated' }); },
    onError: (e: Error) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });
}

export function useReadyAssessment() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (id: string) => assessmentService.ready(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['screenings'] }); qc.invalidateQueries({ queryKey: ['assessments'] }); toast({ title: 'Assessment marked ready' }); },
    onError: (e: Error) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });
}

export function useApproveAssessmentRetry() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (id: string) => assessmentService.approveRetry(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['screenings'] }); toast({ title: 'Retry approved' }); },
    onError: (e: Error) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });
}

// ==================== OBJECTIVE ASSESSMENT ====================
export function useCreateObjectiveAssessment() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: ({ assessmentId, score }: { assessmentId: string; score: number }) => objectiveAssessmentService.create(assessmentId, score),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['assessments'] }); toast({ title: 'Objective assessment created' }); },
    onError: (e: Error) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });
}

export function useObjectiveQuestions(oaId: string) {
  return useQuery({
    queryKey: ['objectiveQuestions', oaId],
    queryFn: () => objectiveAssessmentService.findQuestions(oaId),
    enabled: !!oaId,
  });
}

export function useCreateObjectiveQuestion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateObjectiveAssessmentDto) => objectiveAssessmentService.createQuestion(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['objectiveQuestions'] }); qc.invalidateQueries({ queryKey: ['assessments'] }); },
  });
}

export function useUpdateObjectiveQuestion() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateObjectiveAssessmentDto> }) => objectiveAssessmentService.updateQuestion(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['objectiveQuestions'] }); qc.invalidateQueries({ queryKey: ['assessments'] }); toast({ title: 'Question updated' }); },
    onError: (e: Error) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });
}

export function useDeleteObjectiveQuestion() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (id: string) => objectiveAssessmentService.deleteQuestion(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['objectiveQuestions'] }); qc.invalidateQueries({ queryKey: ['assessments'] }); toast({ title: 'Question deleted' }); },
    onError: (e: Error) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });
}

export function useGenerateObjectiveQuestion() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (oaId: string) => objectiveAssessmentService.createQuestionAgent(oaId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['objectiveQuestions'] }); qc.invalidateQueries({ queryKey: ['assessments'] }); toast({ title: 'AI question generated' }); },
    onError: (e: Error) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });
}

export function useGenerateObjectiveQuestions() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (oaId: string) => objectiveAssessmentService.createManyAgent(oaId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['objectiveQuestions'] }); qc.invalidateQueries({ queryKey: ['assessments'] }); toast({ title: 'AI questions generated' }); },
    onError: (e: Error) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });
}

// ==================== THEORY ASSESSMENT ====================
export function useCreateTheoryAssessment() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: ({ assessmentId, score }: { assessmentId: string; score: number }) => theoryAssessmentService.create(assessmentId, score),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['assessments'] }); toast({ title: 'Theory assessment created' }); },
    onError: (e: Error) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });
}

export function useTheoryQuestions(taId: string) {
  return useQuery({
    queryKey: ['theoryQuestions', taId],
    queryFn: () => theoryAssessmentService.findQuestions(taId),
    enabled: !!taId,
  });
}

export function useCreateTheoryQuestion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTheoryAssessmentQuestionDto) => theoryAssessmentService.createQuestion(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['theoryQuestions'] }); qc.invalidateQueries({ queryKey: ['assessments'] }); },
  });
}

export function useUpdateTheoryQuestion() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateTheoryAssessmentQuestionDto> }) => theoryAssessmentService.updateQuestion(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['theoryQuestions'] }); qc.invalidateQueries({ queryKey: ['assessments'] }); toast({ title: 'Question updated' }); },
    onError: (e: Error) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });
}

export function useDeleteTheoryQuestion() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (id: string) => theoryAssessmentService.deleteQuestion(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['theoryQuestions'] }); qc.invalidateQueries({ queryKey: ['assessments'] }); toast({ title: 'Question deleted' }); },
    onError: (e: Error) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });
}

export function useGenerateTheoryQuestion() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (taId: string) => theoryAssessmentService.createQuestionAgent(taId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['theoryQuestions'] }); qc.invalidateQueries({ queryKey: ['assessments'] }); toast({ title: 'AI question generated' }); },
    onError: (e: Error) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });
}

export function useGenerateTheoryQuestions() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: ({ taId, mentorId, n }: { taId: string; mentorId: string; n: number }) =>
      theoryAssessmentService.createManyAgent(taId, mentorId, n),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['theoryQuestions'] }); qc.invalidateQueries({ queryKey: ['assessments'] }); toast({ title: 'AI questions generated' }); },
    onError: (e: Error) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });
}

// ==================== CODE INTERVIEWS ====================
export function useCodeInterviews() {
  return useQuery({ queryKey: ['codeInterviews'], queryFn: codeInterviewService.findAll });
}

export function useCodeInterview(id: string) {
  return useQuery({ queryKey: ['codeInterviews', id], queryFn: () => codeInterviewService.findOne(id), enabled: !!id });
}

export function useCreateCodeInterview() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (data: CreateCodeInterviewDto) => codeInterviewService.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['screenings'] }); qc.invalidateQueries({ queryKey: ['codeInterviews'] }); toast({ title: 'Code interview created' }); },
    onError: (e: Error) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });
}

export function useApproveCodeAttempt() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (id: string) => codeInterviewService.approveAttempt(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['screenings'] }); toast({ title: 'Attempt approved' }); },
  });
}

export function useRejectCodeAttempt() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (id: string) => codeInterviewService.rejectAttempt(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['screenings'] }); toast({ title: 'Attempt rejected' }); },
  });
}

// ==================== QBOT ====================
export function useQbots() {
  return useQuery({ queryKey: ['qbots'], queryFn: qbotService.findAll });
}

export function useCreateQbot() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (screeningId: string) => qbotService.create(screeningId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['screenings'] }); qc.invalidateQueries({ queryKey: ['qbots'] }); toast({ title: 'QBot interview created' }); },
    onError: (e: Error) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });
}

export function useStartQbotInterview() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (qbotId: string) => qbotService.startInterview(qbotId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['screenings'] }); toast({ title: 'QBot interview started' }); },
    onError: (e: Error) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });
}

export function useGenerateQbotQuestions() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: ({ qbotId, mentorId }: { qbotId: string; mentorId: string }) => qbotService.generateManyAi(qbotId, mentorId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['screenings'] }); toast({ title: 'AI questions generated for QBot' }); },
    onError: (e: Error) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });
}

export function useApproveQbotRetry() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (id: string) => qbotService.approveRetry(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['screenings'] }); toast({ title: 'QBot retry approved' }); },
  });
}

export function useRejectQbotRetry() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (id: string) => qbotService.rejectRetry(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['screenings'] }); toast({ title: 'QBot retry rejected' }); },
  });
}

// ==================== WORK SAMPLES ====================
export function useMentorWorkSamples(mentorId: string) {
  return useQuery({ queryKey: ['workSamples', mentorId], queryFn: () => workSampleService.findByMentor(mentorId), enabled: !!mentorId });
}

// ==================== SUPERVISOR REVIEWS ====================
export function useStartReview() {
  const { toast } = useToast();
  return useMutation({
    mutationFn: (data: { screening_id: string; supervisor_id: string; mentor_id: string }) => reviewService.start(data),
    onError: (e: Error) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });
}

export function useCompleteReview() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CompleteReviewDto }) => reviewService.complete(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['screenings'] }); toast({ title: 'Review completed' }); },
    onError: (e: Error) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });
}

// ==================== EXAMS ====================
export function useExams() {
  return useQuery({ queryKey: ['exams'], queryFn: examService.findAll });
}

// ==================== SCHEDULES ====================
export function useSchedules() {
  return useQuery({ queryKey: ['schedules'], queryFn: scheduleService.findAll });
}

// ==================== HOMEWORK ====================
export function useHomeworks() {
  return useQuery({ queryKey: ['homeworks'], queryFn: homeworkService.findAll });
}

// ==================== CLASSWORK ====================
export function useClassworks() {
  return useQuery({ queryKey: ['classworks'], queryFn: classworkService.findAll });
}

// ==================== CHALLENGES ====================
export function useChallenges() {
  return useQuery({ queryKey: ['challenges'], queryFn: challengeService.findAll });
}

// ==================== PROJECT EXAMS ====================
export function useProjectExams() {
  return useQuery({ queryKey: ['projectExams'], queryFn: projectExamService.findAll });
}

export function useProjectExamSubmissions(examId: string) {
  return useQuery({
    queryKey: ['projectExamSubmissions', examId],
    queryFn: () => projectExamService.getExamSubmissions(examId),
    enabled: !!examId,
  });
}

export function useReviewProjectSubmission() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: ({ submissionId, data }: { submissionId: string; data: ReviewProjectSubmissionDto }) =>
      projectExamService.reviewSubmission(submissionId, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['projectExamSubmissions'] }); toast({ title: 'Submission reviewed' }); },
    onError: (e: Error) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });
}

export function useUpdateProjectSubmissionStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ submissionId, data }: { submissionId: string; data: UpdateProjectSubmissionStatusDto }) =>
      projectExamService.updateSubmissionStatus(submissionId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['projectExamSubmissions'] }),
  });
}