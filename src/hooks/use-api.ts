// =============================================
// React Query hooks for Supervisor API
// =============================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  mentorService,
  screeningService,
  complaintService,
  notificationService,
  programService,
  supervisorService,
  assessmentService,
  codeInterviewService,
  reviewService,
  qbotService,
  workSampleService,
  projectExamService,
} from '@/lib/api/services';
import type {
  CreateScreeningDto,
  UpdateScreeningDto,
  UpdateContactComplaintDto,
  UpdateSupervisorDto,
  CompleteReviewDto,
} from '@/lib/api/dto';
import { useToast } from '@/hooks/use-toast';

// ==================== MENTORS ====================
export function useMentors() {
  return useQuery({ queryKey: ['mentors'], queryFn: mentorService.findAll });
}

export function useMentor(id: string) {
  return useQuery({ queryKey: ['mentors', id], queryFn: () => mentorService.findOne(id), enabled: !!id });
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

// ==================== COMPLAINTS ====================
export function useComplaints() {
  return useQuery({ queryKey: ['complaints'], queryFn: complaintService.findAll });
}

export function useUpdateComplaint() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateContactComplaintDto }) => complaintService.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['complaints'] }),
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

// ==================== PROGRAMS ====================
export function usePrograms() {
  return useQuery({ queryKey: ['programs'], queryFn: programService.findAll });
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

// ==================== CODE INTERVIEWS ====================
export function useCodeInterviews() {
  return useQuery({ queryKey: ['codeInterviews'], queryFn: codeInterviewService.findAll });
}

// ==================== QBOT ====================
export function useQbots() {
  return useQuery({ queryKey: ['qbots'], queryFn: qbotService.findAll });
}

// ==================== WORK SAMPLES ====================
export function useMentorWorkSamples(mentorId: string) {
  return useQuery({ queryKey: ['workSamples', mentorId], queryFn: () => workSampleService.findByMentor(mentorId), enabled: !!mentorId });
}

// ==================== SUPERVISOR REVIEWS ====================
export function useCompleteReview() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CompleteReviewDto }) => reviewService.complete(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['screenings'] }); toast({ title: 'Review completed' }); },
    onError: (e: Error) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });
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
