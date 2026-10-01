export interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'CONTENT_EDITOR';
  createdAt: string;
}

export type InstitutionScope =
  | 'SHRI_RAM_GROUP'
  | 'SRIT'
  | 'SRIST'
  | 'SRIT_PHARMACY'
  | 'SRIT_MCA'
  | 'OTHER';

export type VerificationStatus = 'Verified' | 'Unverified' | 'Needs Review';

export interface Institution {
  id: string;
  name: string;
  shortName: string;
  type: string;
  description: string;
  establishmentDate: string;
  location: string;
  website: string;
  contact: string;
  email: string;
  affiliation: string;
  approval: string;
  accreditation: string;
  history: string;
  source: string;
  sourceUrl: string;
  lastVerified: string;
}

export interface Person {
  id: string;
  fullName: string;
  title?: string;
  designation: string;
  role: string;
  institution: string;
  institutionId: InstitutionScope;
  department?: string;
  qualifications?: string;
  biography: string;
  experience?: string;
  achievements?: string;
  email?: string;
  phone?: string;
  profileImage?: string;
  source: string;
  sourceUrl: string;
  status: VerificationStatus;
  lastVerified: string;
}

export interface FacultyMember {
  id: string;
  fullName: string;
  title?: string;
  designation: string;
  department: string;
  qualification: string;
  specialization?: string;
  joiningDate?: string;
  registrationStatus?: string;
  institution: string;
  institutionId: InstitutionScope;
  profileUrl?: string;
  source: string;
  status: VerificationStatus;
  lastVerified: string;
}

export interface Department {
  id: string;
  name: string;
  abbreviation: string;
  description: string;
  HOD?: string;
  facultyCount: number;
  courses: string[];
  contact?: string;
  institution: string;
  institutionId: InstitutionScope;
  source: string;
  sourceUrl: string;
  lastVerified: string;
}

export interface Course {
  id: string;
  name: string;
  level: 'UG' | 'PG' | 'Diploma';
  department: string;
  duration: string;
  intake: number;
  eligibility: string;
  affiliation: string;
  approval: string;
  accreditation?: string;
  institution: string;
  institutionId: InstitutionScope;
  source: string;
  sourceUrl: string;
  lastVerified: string;
}

export interface InstitutionalStatistic {
  id: string;
  statisticName: string;
  value: string | number;
  unit?: string;
  academicYear: string;
  institution: string;
  institutionId: InstitutionScope;
  category: 'Student Strength' | 'Staff Strength' | 'Placement' | 'Intake' | 'Campus';
  source: string;
  sourceUrl: string;
  publishedDate?: string;
  lastVerified: string;
}

export interface CollegeEvent {
  id: string;
  eventName: string;
  eventType: string;
  description: string;
  date: string;
  startTime: string;
  endTime?: string;
  venue: string;
  organizer: string;
  department?: string;
  eligibility: string;
  registrationUrl?: string;
  registrationDeadline?: string;
  contactPerson?: string;
  contactPhone?: string;
  contactEmail?: string;
  poster?: string;
  status: 'Draft' | 'Published' | 'Upcoming' | 'Ongoing' | 'Completed' | 'Cancelled';
  year: number;
  createdAt: string;
  updatedAt: string;
  publishedBy: string;
}

export interface Club {
  id: string;
  name: string;
  category: string;
  description: string;
  activities: string[];
  eligibility: string;
  meetingInformation?: string;
  contactPerson?: string;
  contactEmail?: string;
  contactPhone?: string;
  source: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface KnowledgeItem {
  id: string;
  title: string;
  content: string;
  category: string;
  subcategory?: string;
  sourceType: string;
  sourceUrl?: string;
  status: 'Draft' | 'Published';
  published: boolean;
  effectiveFrom?: string;
  effectiveUntil?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: Array<{
    title: string;
    sourceType: string;
    sourceUrl?: string;
  }>;
  matchedEvents?: CollegeEvent[];
  matchedClubs?: Club[];
  matchedPersons?: Person[];
  matchedFaculty?: FacultyMember[];
  matchedStatistics?: InstitutionalStatistic[];
  feedback?: {
    rating: 'helpful' | 'unhelpful';
    reason?: string;
    comment?: string;
  };
  createdAt: string;
}

export interface Conversation {
  id: string;
  userId?: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface DocumentItem {
  id: string;
  filename: string;
  fileType: string;
  extractedText: string;
  category: string;
  source: string;
  fileSize: number;
  uploadDate: string;
  uploader: string;
  status: 'Indexed' | 'Pending' | 'Failed';
}

export interface UnansweredQuestion {
  id: string;
  question: string;
  category: string;
  frequency: number;
  lastAskedAt: string;
  status: 'Unanswered' | 'Answered' | 'Ignored';
  adminAnswer?: string;
  resolvedAt?: string;
  resolvedBy?: string;
}

export interface FeedbackItem {
  id: string;
  messageId: string;
  question: string;
  answer: string;
  rating: 'helpful' | 'unhelpful';
  reason?: string;
  comment?: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  entityTitle: string;
  details: string;
  performedBy: string;
  createdAt: string;
}

export interface AnalyticsData {
  totalKnowledge: number;
  publishedKnowledge: number;
  totalEvents: number;
  upcomingEvents: number;
  totalClubs: number;
  totalConversations: number;
  totalMessages: number;
  unansweredQuestionsCount: number;
  totalQuestionsAsked: number;
  helpfulFeedbacks: number;
  unhelpfulFeedbacks: number;
  categoryCounts: Record<string, number>;
  mostAskedQuestions: UnansweredQuestion[];
  totalPersons: number;
  totalFaculty: number;
  totalDepartments: number;
  totalCourses: number;
  totalStatistics: number;
  coverage: {
    leadership: boolean;
    leadershipCount: number;
    faculty: boolean;
    facultyCount: number;
    departments: boolean;
    departmentsCount: number;
    courses: boolean;
    coursesCount: number;
    statistics: boolean;
    statisticsCount: number;
    facilities: boolean;
    clubs: boolean;
    clubsCount: number;
    events: boolean;
    eventsCount: number;
    documents: boolean;
    documentsCount: number;
    unansweredQuestions: number;
  };
}

export interface DetectedEntity {
  entityType: 'event' | 'knowledge' | 'club';
  titleOrName: string;
  categoryOrType: string;
  date?: string;
  startTime?: string;
  venue?: string;
  eligibility?: string;
  registrationDeadline?: string;
  descriptionOrContent: string;
  summary: string;
}

export interface SyncReport {
  timestamp: string;
  pagesDiscovered: number;
  pagesProcessed: number;
  updated: number;
  createdNew: number;
  skipped: number;
  pages: Array<{
    url: string;
    title: string;
    status: 'new' | 'updated' | 'skipped' | 'failed';
    reason?: string;
  }>;
}

const TOKEN_KEY = 'srit_admin_token';
const USER_KEY = 'srit_admin_user';

export const authStorage = {
  getToken: () => localStorage.getItem(TOKEN_KEY),
  getUser: (): User | null => {
    try {
      const u = localStorage.getItem(USER_KEY);
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  },
  setAuth: (token: string, user: User) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  clearAuth: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
};

async function fetchJson<T>(url: string, options: RequestInit = {}): Promise<T> {
  const token = authStorage.getToken();
  const headers = new Headers(options.headers || {});
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const res = await fetch(url, { ...options, headers });
  if (!res.ok) {
    let errMsg = `Request failed: ${res.statusText}`;
    try {
      const data = await res.json();
      if (data.error) errMsg = data.error;
    } catch {
      // ignore
    }
    throw new Error(errMsg);
  }
  return res.json();
}

export const api = {
  // Auth
  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    const res = await fetchJson<{ token: string; user: User }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    authStorage.setAuth(res.token, res.user);
    return res;
  },

  async getMe(): Promise<{ user: User }> {
    return fetchJson<{ user: User }>('/api/auth/me');
  },

  logout() {
    authStorage.clearAuth();
  },

  // Chat
  async sendMessage(
    message: string,
    conversationId?: string
  ): Promise<{
    conversationId: string;
    message: ChatMessage;
    sources: Array<{ title: string; sourceType: string; sourceUrl?: string }>;
    matchedEvents?: CollegeEvent[];
    matchedClubs?: Club[];
    matchedPersons?: Person[];
    matchedFaculty?: FacultyMember[];
    matchedStatistics?: InstitutionalStatistic[];
    isUnknownQuestion?: boolean;
  }> {
    return fetchJson('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ message, conversationId }),
    });
  },

  // Conversations
  async listConversations(): Promise<{ conversations: Conversation[] }> {
    return fetchJson('/api/conversations');
  },

  async getConversation(id: string): Promise<{ conversation: Conversation }> {
    return fetchJson(`/api/conversations/${id}`);
  },

  async createConversation(title?: string): Promise<{ conversation: Conversation }> {
    return fetchJson('/api/conversations', {
      method: 'POST',
      body: JSON.stringify({ title }),
    });
  },

  async clearConversation(id: string): Promise<{ success: boolean }> {
    return fetchJson(`/api/conversations/${id}/clear`, { method: 'POST' });
  },

  async deleteConversation(id: string): Promise<{ success: boolean }> {
    return fetchJson(`/api/conversations/${id}`, { method: 'DELETE' });
  },

  // Persons / Leadership
  async listPersons(params?: { search?: string; role?: string; institutionId?: string }): Promise<{ persons: Person[] }> {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.role) query.set('role', params.role);
    if (params?.institutionId) query.set('institutionId', params.institutionId);
    return fetchJson(`/api/persons?${query.toString()}`);
  },

  async createPerson(data: Partial<Person>): Promise<{ person: Person }> {
    return fetchJson('/api/persons', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updatePerson(id: string, data: Partial<Person>): Promise<{ person: Person }> {
    return fetchJson(`/api/persons/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deletePerson(id: string): Promise<{ success: boolean }> {
    return fetchJson(`/api/persons/${id}`, { method: 'DELETE' });
  },

  // Faculty
  async listFaculty(params?: { search?: string; department?: string; designation?: string; institutionId?: string }): Promise<{ faculty: FacultyMember[]; total: number }> {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.department) query.set('department', params.department);
    if (params?.designation) query.set('designation', params.designation);
    if (params?.institutionId) query.set('institutionId', params.institutionId);
    return fetchJson(`/api/faculty?${query.toString()}`);
  },

  async createFaculty(data: Partial<FacultyMember>): Promise<{ faculty: FacultyMember }> {
    return fetchJson('/api/faculty', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateFaculty(id: string, data: Partial<FacultyMember>): Promise<{ faculty: FacultyMember }> {
    return fetchJson(`/api/faculty/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteFaculty(id: string): Promise<{ success: boolean }> {
    return fetchJson(`/api/faculty/${id}`, { method: 'DELETE' });
  },

  // Departments
  async listDepartments(params?: { search?: string; institutionId?: string }): Promise<{ departments: Department[] }> {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.institutionId) query.set('institutionId', params.institutionId);
    return fetchJson(`/api/departments?${query.toString()}`);
  },

  async createDepartment(data: Partial<Department>): Promise<{ department: Department }> {
    return fetchJson('/api/departments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateDepartment(id: string, data: Partial<Department>): Promise<{ department: Department }> {
    return fetchJson(`/api/departments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Courses
  async listCourses(params?: { search?: string; department?: string; level?: string; institutionId?: string }): Promise<{ courses: Course[] }> {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.department) query.set('department', params.department);
    if (params?.level) query.set('level', params.level);
    if (params?.institutionId) query.set('institutionId', params.institutionId);
    return fetchJson(`/api/courses?${query.toString()}`);
  },

  async createCourse(data: Partial<Course>): Promise<{ course: Course }> {
    return fetchJson('/api/courses', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateCourse(id: string, data: Partial<Course>): Promise<{ course: Course }> {
    return fetchJson(`/api/courses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Statistics
  async listStatistics(params?: { category?: string; academicYear?: string; institutionId?: string }): Promise<{ statistics: InstitutionalStatistic[] }> {
    const query = new URLSearchParams();
    if (params?.category) query.set('category', params.category);
    if (params?.academicYear) query.set('academicYear', params.academicYear);
    if (params?.institutionId) query.set('institutionId', params.institutionId);
    return fetchJson(`/api/statistics?${query.toString()}`);
  },

  async createStatistic(data: Partial<InstitutionalStatistic>): Promise<{ statistic: InstitutionalStatistic }> {
    return fetchJson('/api/statistics', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateStatistic(id: string, data: Partial<InstitutionalStatistic>): Promise<{ statistic: InstitutionalStatistic }> {
    return fetchJson(`/api/statistics/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteStatistic(id: string): Promise<{ success: boolean }> {
    return fetchJson(`/api/statistics/${id}`, { method: 'DELETE' });
  },

  // Institutions
  async listInstitutions(): Promise<{ institutions: Institution[] }> {
    return fetchJson('/api/institutions');
  },

  // Knowledge Items
  async listKnowledge(params?: {
    search?: string;
    category?: string;
    status?: string;
    publishedOnly?: boolean;
  }): Promise<{ items: KnowledgeItem[]; total: number }> {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.category) query.set('category', params.category);
    if (params?.status) query.set('status', params.status);
    if (params?.publishedOnly) query.set('publishedOnly', 'true');
    return fetchJson(`/api/knowledge?${query.toString()}`);
  },

  async createKnowledge(data: Partial<KnowledgeItem>): Promise<{ item: KnowledgeItem }> {
    return fetchJson('/api/knowledge', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateKnowledge(id: string, data: Partial<KnowledgeItem>): Promise<{ item: KnowledgeItem }> {
    return fetchJson(`/api/knowledge/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteKnowledge(id: string): Promise<{ success: boolean }> {
    return fetchJson(`/api/knowledge/${id}`, { method: 'DELETE' });
  },

  // Events
  async listEvents(params?: {
    search?: string;
    eventType?: string;
    status?: string;
    filterDate?: string;
    targetMonth?: number;
    targetYear?: number;
  }): Promise<{ events: CollegeEvent[]; total: number }> {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.eventType) query.set('eventType', params.eventType);
    if (params?.status) query.set('status', params.status);
    if (params?.filterDate) query.set('filterDate', params.filterDate);
    if (params?.targetMonth) query.set('targetMonth', params.targetMonth.toString());
    if (params?.targetYear) query.set('targetYear', params.targetYear.toString());
    return fetchJson(`/api/events?${query.toString()}`);
  },

  async createEvent(data: Partial<CollegeEvent>): Promise<{ event: CollegeEvent }> {
    return fetchJson('/api/events', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateEvent(id: string, data: Partial<CollegeEvent>): Promise<{ event: CollegeEvent }> {
    return fetchJson(`/api/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteEvent(id: string): Promise<{ success: boolean }> {
    return fetchJson(`/api/events/${id}`, { method: 'DELETE' });
  },

  // Clubs
  async listClubs(params?: { search?: string; category?: string }): Promise<{ clubs: Club[]; total: number }> {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.category) query.set('category', params.category);
    return fetchJson(`/api/clubs?${query.toString()}`);
  },

  async createClub(data: Partial<Club>): Promise<{ club: Club }> {
    return fetchJson('/api/clubs', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateClub(id: string, data: Partial<Club>): Promise<{ club: Club }> {
    return fetchJson(`/api/clubs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteClub(id: string): Promise<{ success: boolean }> {
    return fetchJson(`/api/clubs/${id}`, { method: 'DELETE' });
  },

  // Teach the AI
  async teachAiExtract(rawText: string): Promise<{ detected: DetectedEntity }> {
    return fetchJson('/api/teach-ai/extract', {
      method: 'POST',
      body: JSON.stringify({ rawText }),
    });
  },

  async teachAiPublish(detected: DetectedEntity): Promise<{ success: boolean; type: string; item: any }> {
    return fetchJson('/api/teach-ai/publish', {
      method: 'POST',
      body: JSON.stringify({ detected }),
    });
  },

  // Documents
  async listDocuments(): Promise<{ documents: DocumentItem[] }> {
    return fetchJson('/api/documents');
  },

  async uploadDocument(data: {
    filename: string;
    fileType: string;
    textContent: string;
    category: string;
    source?: string;
  }): Promise<{ document: DocumentItem; knowledgeItem: KnowledgeItem }> {
    return fetchJson('/api/documents/upload', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async deleteDocument(id: string): Promise<{ success: boolean }> {
    return fetchJson(`/api/documents/${id}`, { method: 'DELETE' });
  },

  // Unanswered Questions
  async listUnansweredQuestions(): Promise<{ questions: UnansweredQuestion[] }> {
    return fetchJson('/api/unanswered-questions');
  },

  async resolveQuestion(
    id: string,
    adminAnswer: string,
    createKnowledgeItem = true
  ): Promise<{ question: UnansweredQuestion; knowledgeItem?: KnowledgeItem }> {
    return fetchJson(`/api/unanswered-questions/${id}/resolve`, {
      method: 'POST',
      body: JSON.stringify({ adminAnswer, createKnowledgeItem }),
    });
  },

  async ignoreQuestion(id: string): Promise<{ success: boolean }> {
    return fetchJson(`/api/unanswered-questions/${id}/ignore`, { method: 'POST' });
  },

  async deleteQuestion(id: string): Promise<{ success: boolean }> {
    return fetchJson(`/api/unanswered-questions/${id}`, { method: 'DELETE' });
  },

  // Feedback
  async sendFeedback(data: {
    messageId: string;
    question: string;
    answer: string;
    rating: 'helpful' | 'unhelpful';
    reason?: string;
    comment?: string;
  }): Promise<{ feedback: FeedbackItem }> {
    return fetchJson('/api/feedback', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async listFeedback(): Promise<{ feedbacks: FeedbackItem[] }> {
    return fetchJson('/api/feedback');
  },

  // Website Sync
  async syncWebsite(): Promise<{ report: SyncReport }> {
    return fetchJson('/api/sync-website', { method: 'POST' });
  },

  // Analytics & Audits
  async getAnalytics(): Promise<{ analytics: AnalyticsData }> {
    return fetchJson('/api/analytics');
  },

  async getAuditLogs(): Promise<{ logs: AuditLog[] }> {
    return fetchJson('/api/audit-logs');
  },

  async globalSearch(q: string): Promise<{ results: any }> {
    return fetchJson(`/api/global-search?q=${encodeURIComponent(q)}`);
  },
};
