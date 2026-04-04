// =============================================
// ROUTES — Controller Route Definitions
// Auto-generated from NestJS Controllers
// =============================================
//
// BASE_URL should be set to your backend API root.
// All routes are relative to this base.
// =============================================

export const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://algora.onrender.com';

// Helper to build full URL
const url = (path: string) => `${BASE_URL}/${path}`;

// ==================== ACHIEVEMENT ====================
export const AchievementRoutes = {
  create:                     () => url('achievement'),                           // POST
  findAll:                    () => url('achievement'),                           // GET
  findOne:                    (id: string) => url(`achievement/${id}`),           // GET
  update:                     (id: string) => url(`achievement/${id}`),           // PATCH
  remove:                     (id: string) => url(`achievement/${id}`),           // DELETE
  findMentorAchievements:     (mentorId: string) => url(`achievement/mentor/${mentorId}`),   // GET
  findInternAchievements:     (internId: string) => url(`achievement/intern/${internId}`),   // GET
  awardToIntern:              () => url('achievement/award/intern'),              // POST { achievementId, internId }
  awardToMentor:              () => url('achievement/award/mentor'),              // POST { achievementId, mentorId }
  findAchievementUsers:       (achievementId: string) => url(`achievement/users/${achievementId}`), // GET
} as const;

// ==================== AI ASSESSMENT ====================
export const AiAssessmentRoutes = {
  evaluate:   () => url('ai-assessment/evaluate'),     // POST
  nextAction: () => url('ai-assessment/next-action'),  // POST
} as const;

// ==================== AI ASSESSMENT ORCHESTRATOR ====================
export const AssessmentOrchestratorRoutes = {
  start:  () => url('assessments/start'),   // POST
  submit: () => url('assessments/submit'),  // POST
} as const;

// ==================== AI INTERACTIONS ====================
export const AIInteractionRoutes = {
  interact: () => url('ai-interactions'),   // POST
} as const;

// ==================== ASSESSMENT ====================
export const AssessmentRoutes = {
  create:       () => url('assessment'),                             // POST
  findAll:      () => url('assessment'),                             // GET
  findOne:      (id: string) => url(`assessment/${id}`),             // GET
  update:       (id: string) => url(`assessment/${id}`),             // PATCH
  remove:       (id: string) => url(`assessment/${id}`),             // DELETE
  ready:        (id: string) => url(`assessment/${id}/ready`),       // POST
  createRetry:  () => url('assessment/retry/create'),                // POST
  approveRetry: (id: string) => url(`assessment/retry/${id}/approve`), // POST
} as const;

// ==================== AUTH ====================
export const AuthRoutes = {
  loginIntern:       () => url('auth/login/intern'),        // POST { username, password }
  loginMentor:       () => url('auth/login/mentor'),        // POST { username, password }
  loginRoot:         () => url('auth/login/root'),          // POST { username, password }
  loginSupervisor:   () => url('auth/login/supervisor'),    // POST { username, password }
  mentorGoogle:      () => url('auth/mentor/google'),       // GET (redirect)
  mentorGoogleCb:    () => url('auth/mentor/google/callback'), // GET
  internGoogle:      () => url('auth/intern/google'),       // GET (redirect)
  internGoogleCb:    () => url('auth/intern/google/callback'), // GET
  logoutIntern:      () => url('auth/logout/intern'),       // GET
  logoutMentor:      () => url('auth/logout/mentor'),       // GET
  logoutSupervisor:  () => url('auth/logout/supervisor'),   // GET
} as const;

// ==================== BADGE ====================
export const BadgeRoutes = {
  create:            () => url('badge'),                                      // POST (multipart)
  findAll:           () => url('badge'),                                      // GET
  findOne:           (id: string) => url(`badge/${id}`),                      // GET
  findInternBadges:  (internId: string) => url(`badge/intern/${internId}`),   // GET
  findMentorBadges:  (mentorId: string) => url(`badge/mentor/${mentorId}`),   // GET
  findBadgeUsers:    (badgeId: string) => url(`badge/${badgeId}/users`),      // GET
  awardToIntern:     (badgeId: string, internId: string) => url(`badge/${badgeId}/award/intern/${internId}`),  // POST
  awardToMentor:     (badgeId: string, mentorId: string) => url(`badge/${badgeId}/award/mentor/${mentorId}`),  // POST
  update:            (id: string) => url(`badge/${id}`),                      // PATCH
  updateIcon:        (id: string) => url(`badge/${id}/icon`),                 // PATCH (multipart)
  remove:            (id: string) => url(`badge/${id}`),                      // DELETE
} as const;

// ==================== PROGRAM CATEGORY ====================
export const ProgramCategoryRoutes = {
  create:  () => url('program-categories'),                   // POST
  findAll: (includePrograms?: boolean) => url(`program-categories${includePrograms ? '?includePrograms=true' : ''}`), // GET
  findOne: (id: string, includePrograms?: boolean) => url(`program-categories/${id}${includePrograms ? '?includePrograms=true' : ''}`), // GET
  update:  (id: string) => url(`program-categories/${id}`),   // PATCH
  remove:  (id: string) => url(`program-categories/${id}`),   // DELETE
} as const;

// ==================== CHALLENGE ====================
export const ChallengeRoutes = {
  create:     () => url('challenge'),                         // POST
  submission: () => url('challenge/submission'),               // POST (multipart)
  findAll:    () => url('challenge'),                         // GET
  findOne:    (id: string) => url(`challenge/${id}`),         // GET
  update:     (id: string) => url(`challenge/${id}`),         // PATCH
  remove:     (id: string) => url(`challenge/${id}`),         // DELETE
} as const;

// ==================== CLASS DAYS ====================
export const ClassDaysRoutes = {
  create:  () => url('class-days'),                           // POST
  findAll: (programBatchId?: string) => url(`class-days${programBatchId ? `?programBatchId=${programBatchId}` : ''}`), // GET
  findOne: (id: string) => url(`class-days/${id}`),           // GET
  update:  (id: string) => url(`class-days/${id}`),           // PATCH
  toggle:  (id: string) => url(`class-days/${id}/toggle`),    // PATCH
  remove:  (id: string) => url(`class-days/${id}`),           // DELETE
} as const;

// ==================== CLASSWORK ====================
export const ClassworkRoutes = {
  create:     () => url('classwork'),                         // POST
  submission: () => url('classwork/submission'),               // POST (multipart)
  findAll:    () => url('classwork'),                         // GET
  findOne:    (id: string) => url(`classwork/${id}`),         // GET
  update:     (id: string) => url(`classwork/${id}`),         // PATCH
  remove:     (id: string) => url(`classwork/${id}`),         // DELETE
} as const;

// ==================== CODING WORKSPACE ====================
export const CodingWorkspaceRoutes = {
  createWorkspace:       () => url('coding-workspace/workspace'),                           // POST (multipart)
  createCodeInterview:   () => url('coding-workspace/code-interview'),                      // POST
  findAllCodeInterviews: () => url('coding-workspace/code-interview'),                      // GET
  findCodeInterview:     (id: string) => url(`coding-workspace/code-interview/${id}`),      // GET
  updateCodeInterview:   (id: string) => url(`coding-workspace/code-interview/${id}`),      // PATCH
  updateScore:           (id: string) => url(`coding-workspace/code-interview/${id}/score`),// PATCH
  removeCodeInterview:   (id: string) => url(`coding-workspace/code-interview/${id}`),      // DELETE
  createTask:            () => url('coding-workspace/code-interview-task'),                  // POST
  updateTask:            (id: string) => url(`coding-workspace/code-interview-task/${id}`), // PATCH
  removeTask:            (id: string) => url(`coding-workspace/code-interview-task/${id}`), // DELETE
  createAttempt:         () => url('coding-workspace/retry'),               // POST
  approveAttempt:        (id: string) => url(`coding-workspace/retry/${id}/approve`), // PATCH
  rejectAttempt:         (id: string) => url(`coding-workspace/retry/${id}/reject`),  // PATCH
} as const;

// ==================== CONTACT COMPLAINT ====================
export const ContactComplaintRoutes = {
  create:  () => url('contact-complaints'),                   // POST (multipart)
  findAll: () => url('contact-complaints'),                   // GET
  findOne: (id: string) => url(`contact-complaints/${id}`),   // GET
  update:  (id: string) => url(`contact-complaints/${id}`),   // PATCH
  remove:  (id: string) => url(`contact-complaints/${id}`),   // DELETE
} as const;

// ==================== EXAM ====================
export const ExamRoutes = {
  create:  () => url('exam'),                                 // POST
  findAll: () => url('exam'),                                 // GET
  findOne: (id: string) => url(`exam/${id}`),                 // GET
  update:  (id: string) => url(`exam/${id}`),                 // PATCH
  remove:  (id: string) => url(`exam/${id}`),                 // DELETE
} as const;

// ==================== FACTION (GROUPS) ====================
export const FactionRoutes = {
  create:      () => url('groups'),                                     // POST { name, description? }
  invite:      (id: string, internId: string) => url(`groups/${id}/invite/${internId}`), // POST
  accept:      (requestId: string) => url(`groups/accept/${requestId}`),// POST
  myGroups:    () => url('groups/my'),                                  // GET
  members:     (id: string) => url(`groups/${id}/members`),             // GET
  getRequests: (id: string) => url(`groups/${id}/requests`),            // GET
  leave:       (id: string) => url(`groups/${id}/leave`),               // POST
} as const;

// ==================== FRIENDSHIP ====================
export const FriendshipRoutes = {
  sendRequest: (id: string) => url(`friends/request/${id}`),  // POST
  accept:      (id: string) => url(`friends/accept/${id}`),   // POST
  reject:      (id: string) => url(`friends/reject/${id}`),   // POST
  getFriends:  () => url('friends'),                          // GET
  getPending:  () => url('friends/requests'),                 // GET
} as const;

// ==================== GROUP (PROGRAM BATCH) ====================
export const GroupRoutes = {
  create:         () => url('group'),                                    // POST
  findAll:        () => url('group'),                                    // GET
  findForProgram: (programId: string) => url(`group/program/${programId}`), // GET
  findOne:        (id: string) => url(`group/${id}`),                    // GET
  update:         (id: string) => url(`group/${id}`),                    // PATCH
  remove:         (id: string) => url(`group/${id}`),                    // DELETE
} as const;

// ==================== HOMEWORK ====================
export const HomeworkRoutes = {
  create:     () => url('homework'),                          // POST
  submission: () => url('homework/submit'),                // POST (multipart)
  findAll:    () => url('homework'),                          // GET
  findOne:    (id: string) => url(`homework/${id}`),          // GET
  update:     (id: string) => url(`homework/${id}`),          // PATCH
  remove:     (id: string) => url(`homework/${id}`),          // DELETE
} as const;

// ==================== HONOR ====================
export const HonorRoutes = {
  create:  () => url('honor'),                                // POST
  findAll: () => url('honor'),                                // GET
  findOne: (id: string) => url(`honor/${id}`),                // GET
  update:  (id: string) => url(`honor/${id}`),                // PATCH
  remove:  (id: string) => url(`honor/${id}`),                // DELETE
} as const;

// ==================== INTERN ====================
export const InternRoutes = {
  create:              () => url('intern'),                                   // POST
  checkOrCreate:       () => url('intern/manual'),                            // POST
  findAll:             () => url('intern'),                                   // GET
  findOne:             (id: string) => url(`intern/${id}`),                   // GET
  findByEmail:         () => url('intern/email/'),                            // GET (body: { email })
  sendVerification:    () => url('intern/send-email'),                 // POST
  verifyEmail:         (id: string, token: string) => url(`intern/verify-email/${id}?token=${token}`), // GET
  forgotPassword:      () => url('intern/forgot-password'),                   // POST
  checkResetToken:     (id: string, token: string) => url(`intern/reset-password/${id}/verify?token=${token}`),  // GET
  resetPassword:       (id: string, token: string) => url(`intern/reset-password/${id}`), // PATCH
  update:              (id: string) => url(`intern/${id}`),                   // PATCH
  updatePassword:      () => url('intern/password'),                  // PATCH
  updateEmail:         () => url('intern/email'),                     // PATCH
  updateImage:         () => url('intern/image'),                            // PATCH (multipart)
  remove:              (id: string) => url(`intern/${id}`),                   // DELETE
} as const;

// ==================== LEARNING SESSION ====================
export const LearningSessionRoutes = {
  create:  () => url('learning-sessions'),                    // POST
  findMine:() => url('learning-sessions'),                    // GET
  findOne: (id: string) => url(`learning-sessions/${id}`),    // GET
  update:  (id: string) => url(`learning-sessions/${id}`),    // PATCH
  pause:   (id: string) => url(`learning-sessions/${id}/pause`),  // PATCH
  resume:  (id: string) => url(`learning-sessions/${id}/resume`), // PATCH
} as const;

// ==================== MENTOR ====================
export const MentorRoutes = {
  create:            () => url('mentor'),                                    // POST
  checkOrCreate:     () => url('mentor/manual'),                             // POST
  findAll:           () => url('mentor'),                                    // GET
  findBySupervisor:  (supervisorId: string) => url(`mentor/supervisor/${supervisorId}`), // GET
  findOne:           (id: string) => url(`mentor/${id}`),                    // GET
  findByEmail:       () => url('mentor/email/'),                             // GET (body: { email })
  sendVerification:  () => url('mentor/send-verification'),                  // POST
  verifyEmail:       (id: string, token: string) => url(`mentor/verify-email/${id}?token=${token}`), // GET
  forgotPassword:    () => url('mentor/forgot-password'),                    // POST
  checkResetToken:   (id: string, token: string) => url(`mentor/check-reset/${id}?token=${token}`),  // GET
  createMajor:       () => url('mentor/major'),                              // POST (multipart)
  updateImage:       () => url('mentor/image/'),                             // PATCH (multipart)
  updateMajor:       (id: string) => url(`mentor/major/${id}`),              // PUT (multipart)
  updateMedia:       () => url('mentor/media'),                              // PATCH
  resetPassword:     (id: string, token: string) => url(`mentor/reset-password/${id}?token=${token}`), // POST
  update:            (id: string) => url(`mentor/${id}`),                    // PATCH
  updatePassword:    () => url('mentor/update-password/'),                   // PATCH
  updateEmail:       () => url('mentor/update-email/'),                      // PATCH
  remove:            (id: string) => url(`mentor/${id}`),                    // DELETE
  approve:           (id: string) => url(`mentor/approve/${id}`),            // PATCH
  // Complaints (MentorComplaint)
  getComplaintsBySupervisor: (supervisorId: string) => url(`mentor/complaints/supervisor/${supervisorId}`), // GET — custom
  updateComplaint:   (complaintId: string) => url(`mentor/complaint/${complaintId}`), // PATCH — custom
  // Reviews (MentorReview)
  getReviewsByMentor: (mentorId: string) => url(`mentor/${mentorId}/reviews`), // GET — custom
} as const;

// ==================== MESSAGES ====================
export const MessageRoutes = {
  sendFriend:      (friendId: string) => url(`messages/friend/${friendId}`),    // POST
  getFriendChat:   (friendId: string) => url(`messages/friend/${friendId}`),    // GET
  sendFaction:     (factionId: string) => url(`messages/faction/${factionId}`), // POST
  getFactionChat:  (factionId: string) => url(`messages/faction/${factionId}`), // GET
  sendProgram:     (programId: string, senderType: 'intern' | 'mentor') => url(`messages/program/${programId}/${senderType}`), // POST
  getProgramChat:  (programId: string) => url(`messages/program/${programId}`), // GET
} as const;

// ==================== NOTIFICATIONS ====================
export const NotifyRoutes = {
  create:     () => url('notify'),                                    // POST
  findMy:     (targetType: string) => url(`notify/my/${targetType}`), // GET
  markAsRead: (id: string) => url(`notify/${id}/read`),               // PATCH
  remove:     (id: string) => url(`notify/${id}`),                    // DELETE
} as const;

// ==================== OBJECTIVE ASSESSMENT ====================
export const ObjectiveAssessmentRoutes = {
  create:                 (assessmentId: string) => url(`objective-assessment/${assessmentId}`), // POST
  createQuestion:         () => url('objective-assessment/question'),                            // POST
  createQuestionAgent:    (id: string) => url(`objective-assessment/question/agent/${id}`),      // POST
  createManyAgent:        (id: string) => url(`objective-assessment/question/agent-many/${id}`), // POST
  findAllQuestions:       (id: string) => url(`objective-assessment/questions/${id}`),           // GET
  findAll:                () => url('objective-assessment'),                                     // GET
  findOne:                (id: string) => url(`objective-assessment/${id}`),                     // GET
  start:                  (assessmentId: string) => url(`objective-assessment/start/${assessmentId}`), // POST
  stop:                   (assessmentId: string) => url(`objective-assessment/stop/${assessmentId}`),  // POST
  updateQuestion:         (id: string) => url(`objective-assessment/question/${id}`),            // PATCH
  deleteQuestion:         (id: string) => url(`objective-assessment/question/${id}`),            // DELETE
  remove:                 (id: string) => url(`objective-assessment/${id}`),                     // DELETE
} as const;

// ==================== OBJECTIVE EXAM ====================
export const ObjectiveExamRoutes = {
  create:            () => url('objective-exam'),                                  // POST
  generateQuestion:  (id: string, prompt?: string) => url(`objective-exam/${id}/generate-question${prompt ? `?prompt=${prompt}` : ''}`), // POST
  generateQuestions: (id: string, count?: number, prompt?: string) => {
    const params = new URLSearchParams();
    if (count) params.set('count', String(count));
    if (prompt) params.set('prompt', prompt);
    const qs = params.toString();
    return url(`objective-exam/${id}/generate-questions${qs ? `?${qs}` : ''}`);
  }, // POST
  findAll:           () => url('objective-exam'),                                  // GET
  findOne:           (id: string) => url(`objective-exam/${id}`),                  // GET
  remove:            (id: string) => url(`objective-exam/${id}`),                  // DELETE
} as const;

// ==================== ONBOARD PAYMENT ====================
export const OnboardPaymentRoutes = {
  initialize:      () => url('onboard-payment/initialize'),                       // POST
  verify:          () => url('onboard-payment/verify'),                           // POST
  getInternPayments: (internId: string) => url(`onboard-payment/intern/${internId}`), // GET
} as const;

// ==================== ONBOARDING ====================
export const OnboardingRoutes = {
  create:                (type?: string) => url(`onboarding${type ? `?type=${type}` : ''}`),                   // POST
  findAll:               () => url('onboarding'),                                  // GET
  findByInternForProgram:(internId: string, programId: string) => url(`onboarding/intern/${internId}/program/${programId}`), // GET
  findForProgramAndBatch:(programId: string, batchId: string) => url(`onboarding/program/${programId}/batch/${batchId}`),    // GET
  findForProgram:        (programId: string) => url(`onboarding/program/${programId}`), // GET
  findForIntern:         (internId: string) => url(`onboarding/intern/${internId}`),    // GET
  findOne:               (id: string) => url(`onboarding/${id}`),                  // GET
  payForExam:            (id: string) => url(`onboarding/${id}`),                  // PATCH
  update:                (id: string) => url(`onboarding/${id}`),                  // PUT
  remove:                (id: string) => url(`onboarding/${id}`),                  // DELETE
} as const;

// ==================== OUTLINE ====================
export const OutlineRoutes = {
  create:      () => url('program-outlines'),                                 // POST
  findAll:     (batchId?: string) => url(`program-outlines${batchId ? `?batchId=${batchId}` : ''}`), // GET
  findOne:     (id: string) => url(`program-outlines/${id}`),                 // GET
  update:      (id: string) => url(`program-outlines/${id}`),                 // PATCH
  remove:      (id: string) => url(`program-outlines/${id}`),                 // DELETE
} as const;

// ==================== PERSONAL PROJECTS ====================
export const PersonalProjectRoutes = {
  create:  () => url('personal-projects'),                    // POST (multipart)
  findAll: (id: string) => url(`personal-projects/${id}`),    // GET
  findOne: (id: string) => url(`personal-projects/${id}`),    // GET
  update:  (id: string) => url(`personal-projects/${id}`),    // PATCH (multipart)
  remove:  (id: string) => url(`personal-projects/${id}`),    // DELETE
} as const;

// ==================== PROGRAMS ====================
export const ProgramRoutes = {
  create:  () => url('programs'),                             // POST
  findAll: () => url('programs'),                             // GET
  findOne: (id: string) => url(`programs/${id}`),             // GET
  update:  (id: string) => url(`programs/${id}`),             // PATCH
  remove:  (id: string) => url(`programs/${id}`),             // DELETE
} as const;

// ==================== QBOT ====================
export const QbotRoutes = {
  create:               (screeningId: string) => url(`qbot/${screeningId}`),                   // POST
  findAll:              () => url('qbot'),                                                      // GET
  findOne:              (id: string) => url(`qbot/${id}`),                                     // GET
  remove:               (id: string) => url(`qbot/${id}`),                                     // DELETE
  evaluate:             (id: string) => url(`qbot/${id}/evaluate`),                             // PATCH
  createQuestionnaire:  () => url('qbot/questionnaire'),                                        // POST
  createQuestionnaireManual: () => url('qbot/questionnaire/manual'),                             // POST
  deleteQuestionnaire:  (id: string) => url(`qbot/questionnaire/${id}`),                        // DELETE
  getQuestionnaire:     (id: string) => url(`qbot/questionnaire/${id}`),                       // GET
  getQuestionnairesByQbot: (qbotId: string) => url(`qbot/${qbotId}/questionnaires`),           // GET
  createResponse:       () => url('qbot/response'),                                             // POST
  createRetry:          () => url('qbot/retry'),                                                // POST
  updateRetry:          (retryId: string) => url(`qbot/retry/${retryId}`),                     // PATCH
  updateStatus:         (id: string) => url(`qbot/${id}/status`),                               // PATCH
} as const;

// ==================== SCHEDULE ====================
export const ScheduleRoutes = {
  create:  () => url('schedule'),                             // POST
  findAll: () => url('schedule'),                             // GET
  findOne: (id: string) => url(`schedule/${id}`),             // GET
  update:  (id: string) => url(`schedule/${id}`),             // PATCH
  remove:  (id: string) => url(`schedule/${id}`),             // DELETE
} as const;

// ==================== SOLO ====================
export const SoloRoutes = {
  create:  () => url('solo'),                                 // POST
  findAll: () => url('solo'),                                 // GET
  findOne: (id: string) => url(`solo/${id}`),                 // GET
  update:  (id: string) => url(`solo/${id}`),                 // PATCH
  remove:  (id: string) => url(`solo/${id}`),                 // DELETE
} as const;

// ==================== SUPERVISOR ====================
export const SupervisorRoutes = {
  create:         () => url('supervisor'),                            // POST
  findAll:        () => url('supervisor'),                            // GET
  findOne:        (id: string) => url(`supervisor/${id}`),            // GET
  update:         () => url('supervisor'),                            // PATCH
  updatePassword: () => url('supervisor/password'),                   // PATCH
  verify:         (id: string, token: string) => url(`supervisor/verify/${id}?token=${token}`), // GET
  remove:         (id: string) => url(`supervisor/${id}`),            // DELETE
} as const;

// ==================== SUPERVISOR REVIEW ====================
export const SupervisorReviewRoutes = {
  start:          () => url('supervisor-reviews/start'),               // POST
  getByMeeting:   (uuid: string) => url(`supervisor-reviews/meeting/${uuid}`), // GET
  update:         (id: string) => url(`supervisor-reviews/${id}`),     // PATCH
  complete:       (id: string) => url(`supervisor-reviews/${id}/complete`), // POST
} as const;

// ==================== THEORY ASSESSMENT ====================
export const TheoryAssessmentRoutes = {
  create:              (assessmentId: string) => url(`theory-assessment/${assessmentId}`),   // POST
  findAll:             () => url('theory-assessment'),                                       // GET
  findOne:             (id: string) => url(`theory-assessment/${id}`),                       // GET
  remove:              (id: string) => url(`theory-assessment/${id}`),                       // DELETE
  createQuestion:      () => url('theory-assessment/question'),                              // POST
  updateQuestion:      (id: string) => url(`theory-assessment/question/${id}`),              // PATCH
  deleteQuestion:      (id: string) => url(`theory-assessment/question/${id}`),              // DELETE
  findAllQuestions:    (taId: string) => url(`theory-assessment/${taId}/questions`),          // GET
  findOneQuestion:     (id: string) => url(`theory-assessment/question/${id}`),               // GET
  start:               (assessmentId: string) => url(`theory-assessment/start/${assessmentId}/`), // POST
  stop:                (assessmentId: string) => url(`theory-assessment/stop/${assessmentId}`),    // POST
  createQuestionAgent: (taId: string) => url(`theory-assessment/question/agent/${taId}`),     // POST
  createManyAgent:     (taId: string, mentorId: string, n: number) => url(`theory-assessment/questions/agent/${taId}/${mentorId}/${n}`), // POST
} as const;

// ==================== THEORY EXAM ====================
export const TheoryExamRoutes = {
  create:             () => url('theory-exam'),                                               // POST
  createQuestion:     () => url('theory-exam/question'),                                      // POST
  createQuestionAI:   (teId: string, programId: string) => url(`theory-exam/${teId}/ai-question/${programId}`), // POST
  createManyAI:       (teId: string, programId: string) => url(`theory-exam/${teId}/ai-questions/${programId}`), // POST
  findAll:            () => url('theory-exam'),                                               // GET
  findOne:            (id: string) => url(`theory-exam/${id}`),                               // GET
  findQuestions:      (teId: string) => url(`theory-exam/${teId}/questions`),                  // GET
  remove:             (id: string) => url(`theory-exam/${id}`),                               // DELETE
} as const;

// ==================== WORK SAMPLE ====================
export const WorkSampleRoutes = {
  create:       () => url('work-sample'),                             // POST (multipart)
  findAll:      () => url('work-sample'),                             // GET
  findByMentor: (mentorId: string) => url(`work-sample/mentor/${mentorId}`), // GET
  findOne:      (id: string) => url(`work-sample/${id}`),             // GET
  update:       (id: string) => url(`work-sample/${id}`),             // PATCH
  remove:       (id: string) => url(`work-sample/${id}`),             // DELETE
} as const;

// ==================== PROJECT EXAM ====================
export const ProjectExamRoutes = {
  create:              () => url('project-exams'),                                  // POST
  findAll:             () => url('project-exams'),                                  // GET
  findOne:             (id: string) => url(`project-exams/${id}`),                  // GET
  findByExam:          (examId: string) => url(`project-exams/exam/${examId}`),     // GET
  update:              (id: string) => url(`project-exams/${id}`),                  // PATCH
  remove:              (id: string) => url(`project-exams/${id}`),                  // DELETE
  submitProject:       (internId: string) => url(`project-exams/submit/${internId}`), // POST
  getInternSubmissions:(internId: string) => url(`project-exams/submissions/intern/${internId}`), // GET
  reviewSubmission:    (submissionId: string) => url(`project-exams/review/${submissionId}`),     // PATCH
  updateSubmissionStatus: (submissionId: string) => url(`project-exams/status/${submissionId}`),  // PATCH
  getExamSubmissions:  (examId: string) => url(`project-exams/submissions/exam/${examId}`),       // GET
  getSubmission:       (id: string) => url(`project-exams/submission/${id}`),       // GET
} as const;

// ==================== SCREENING ====================
export const ScreeningRoutes = {
  create:             () => url('screening'),                              // POST
  findAll:            () => url('screening'),                              // GET
  findOne:            (id: string) => url(`screening/${id}`),              // GET
  update:             (id: string) => url(`screening/${id}`),              // PATCH
  updateCurrentPhase: (id: string) => url(`screening/currentPhase/${id}`), // PATCH
  remove:             (id: string) => url(`screening/${id}`),              // DELETE
} as const;
