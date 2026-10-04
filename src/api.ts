export interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'STAFF' | 'CONTENT_EDITOR';
  createdAt: string;
}

export type InstitutionScope =
  | 'SHRI_RAM_GROUP'
  | 'SRIT'
  | 'SRIST'
  | 'SRIT_PHARMACY'
  | 'SRIT_MCA'
  | 'SHRI_RAM_COMMERCE'
  | 'SHRI_RAM_LAW'
  | 'SHRI_RAM_MANAGEMENT'
  | 'RGPV'
  | 'RDVV'
  | 'OTHER';

export type VerificationStatus = 'Verified' | 'Unverified' | 'Needs Review';

export interface Institution {
  id: string;
  name: string;
  shortName: string;
  type: string;
  description: string;
  establishmentDate: string;
  establishedYear: number;
  location: string;
  website: string;
  contact: string;
  email: string;
  affiliation: string;
  approval: string;
  accreditation: string;
  history: string;
  parentGroupId?: string;
  isFirstInstitutionInGroup?: boolean;
  programsOffered?: string[];
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
  startYear?: string;
  endYear?: string;
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
  subjectsTaught?: string[];
  joiningDate?: string;
  leavingDate?: string;
  currentStatus: 'Active' | 'Relieved' | 'On Leave';
  academicYear: string;
  isHOD?: boolean;
  hodStartYear?: string;
  hodEndYear?: string;
  previousRoles?: string[];
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
  previousHOD?: string;
  facultyCount: number;
  courses: string[];
  affiliatedUniversity?: string;
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
  level: 'UG' | 'PG' | 'Diploma' | 'Doctoral';
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

export interface SubjectScheme {
  id: string;
  university: 'RGPV' | 'RDVV';
  branch: string;
  course: string;
  semester: number;
  year: number;
  schemeName: string;
  academicSession: string;
  subjectsCount: number;
  subjectCode: string;
  subjectName: string;
  isPractical: boolean;
  hasLab: boolean;
  credits: number;
  theoryHours?: number;
  practicalHours?: number;
  isElective: boolean;
  syllabusOverview: string;
  sourceUrl: string;
  source: string;
  lastVerified: string;
}

export interface AffiliationRecord {
  id: string;
  institution: string;
  institutionId: InstitutionScope;
  program: string;
  university: string;
  regulatoryAuthority: string;
  academicYear: string;
  notes: string;
  source: string;
  sourceUrl: string;
  lastVerified: string;
}

export interface AttendanceRule {
  id: string;
  ruleTitle: string;
  minimumPercentage: number;
  maxCondonationPercentage: number;
  minimumWithCondonation: number;
  condoningAuthority: string;
  applicableCourse: string;
  universityOrdinance: string;
  medicalPolicy: string;
  shortageOutcome70: string;
  below65Outcome: string;
  source: string;
  sourceUrl: string;
  lastVerified: string;
}

export interface PlacementRecord {
  id: string;
  academicYear: string;
  graduationYear: number;
  institution: string;
  institutionId: InstitutionScope;
  highestPackage: string;
  highestPackageDetails: string;
  averagePackage: string;
  medianPackage: string;
  recruitersCount: number;
  studentsEligible: number;
  studentsPlaced: number;
  placementRate: string;
  topCompanies: string[];
  cseTopPackage?: string;
  eceTopPackage?: string;
  studentNameNote: string;
  source: string;
  sourceUrl: string;
  lastVerified: string;
}

export interface Company {
  id: string;
  name: string;
  industry: string;
  hiringBranches: string[];
  typicalRoles: string[];
  visitedYears: string[];
  website?: string;
  source: string;
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

export type KnowledgeCategory =
  | 'Institution'
  | 'Leadership'
  | 'Faculty'
  | 'Department'
  | 'Course'
  | 'Affiliation'
  | 'RGPV Scheme'
  | 'Attendance'
  | 'Placements'
  | 'Student Statistics'
  | 'Staff Statistics'
  | 'College'
  | 'Academics'
  | 'Admissions'
  | 'Student Services'
  | 'Facilities'
  | 'Clubs'
  | 'Activities'
  | 'Events'
  | 'Training'
  | 'Contact'
  | 'General';

export type SourceType =
  | 'Official Website'
  | 'Official University (RGPV)'
  | 'Official University (RDVV)'
  | 'Official Regulatory (AICTE/PCI)'
  | 'Admin'
  | 'Uploaded Document'
  | 'Event Database'
  | 'Announcement'
  | 'NIRF 2025 Submission';

export interface KnowledgeItem {
  id: string;
  title: string;
  content: string;
  category: KnowledgeCategory;
  subcategory?: string;
  institutionId?: InstitutionScope;
  academicYear?: string;
  sourceType: SourceType;
  sourceUrl?: string;
  status: 'Draft' | 'Published';
  published: boolean;
  effectiveFrom?: string;
  effectiveUntil?: string;
  conflictDetails?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
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

export interface DocumentItem {
  id: string;
  filename: string;
  fileType: string;
  extractedText: string;
  category: KnowledgeCategory;
  institution?: string;
  department?: string;
  source: string;
  fileSize: number;
  uploadDate: string;
  uploader: string;
  status: 'Indexed' | 'Pending' | 'Failed';
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

export type TicketStatus = 'OPEN' | 'UNDER_REVIEW' | 'ANSWERED' | 'PUBLISHED' | 'REJECTED';

export interface UnansweredQuestion {
  id: string;
  ticketId: string;
  question: string;
  userConversationId?: string;
  category: string;
  detectedIntent?: string;
  detectedEntities?: string[];
  possibleInstitution?: string;
  possibleDepartment?: string;
  searchesAttempted?: string[];
  sourcesChecked?: string[];
  frequency: number;
  lastAskedAt: string;
  dateAsked: string;
  status: TicketStatus;
  adminAnswer?: string;
  notes?: string;
  verifiedSource?: string;
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

export interface SourcePageRecord {
  id: string;
  url: string;
  pageTitle: string;
  sourceWebsite: 'sritgroup.net' | 'shriramcommercecollege.com' | 'rgpv.ac.in' | 'rgpv_scheme' | 'other';
  sourceType: SourceType;
  retrievedTimestamp: string;
  lastModifiedTimestamp?: string;
  contentHash: string;
  previousContentHash?: string;
  versionNumber: number;
  academicYear: string;
  publicationDate?: string;
  effectiveDate?: string;
  institution: string;
  institutionScope: InstitutionScope;
  department?: string;
  course?: string;
  sourceReliability: string;
  verificationStatus: VerificationStatus;
}

export interface SourceVersion {
  id: string;
  sourceId: string;
  url: string;
  versionNumber: number;
  contentHash: string;
  title: string;
  contentSummary: string;
  changedDetails?: string;
  createdAt: string;
}

export interface KnowledgeHealthItem {
  domain: string;
  totalRecords: number;
  verifiedCount: number;
  needsReviewCount: number;
  outdatedCount: number;
  missingCount: number;
  conflictingCount: number;
  healthStatus: 'HEALTHY' | 'NEEDS_ATTENTION' | 'CRITICAL';
}

export interface SyncStatusInfo {
  lastSyncTimestamp: string;
  nextScheduledSyncTimestamp: string;
  intervalHours: number;
  isSyncing: boolean;
  totalMonitoredPages: number;
  sources: Array<{
    sourceWebsite: string;
    name: string;
    url: string;
    status: 'Healthy' | 'Needs Attention' | 'Offline';
    lastChecked: string;
    pagesCount: number;
    changedCount: number;
  }>;
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
    status: 'new' | 'updated' | 'unchanged' | 'skipped' | 'failed';
    sourceWebsite: string;
    version?: number;
    hash?: string;
    reason?: string;
  }>;
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
    verifiedDate?: string;
    scope?: string;
  }>;
  matchedEvents?: CollegeEvent[];
  matchedClubs?: Club[];
  matchedPersons?: Person[];
  matchedFaculty?: FacultyMember[];
  matchedStatistics?: InstitutionalStatistic[];
  matchedSubjects?: SubjectScheme[];
  matchedAffiliations?: AffiliationRecord[];
  matchedPlacements?: PlacementRecord[];
  matchedAttendanceRules?: AttendanceRule[];
  isUnknownQuestion?: boolean;
  ticketId?: string;
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
  coverage: Record<string, any>;
  totalPersons?: number;
  totalFaculty?: number;
  totalDepartments?: number;
  totalCourses?: number;
  totalStatistics?: number;
  totalSubjectSchemes?: number;
  totalAffiliations?: number;
  totalPlacements?: number;
  totalAttendanceRules?: number;
  totalCompanies?: number;
  totalSourcePages?: number;
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

// Local Auth Token Storage
const TOKEN_KEY = 'srit_admin_token';
const USER_KEY = 'srit_admin_user';

export const authStorage = {
  getToken: (): string | null => localStorage.getItem(TOKEN_KEY),
  getUser: (): User | null => {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
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
  headers.set('Content-Type', 'application/json');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(url, { ...options, headers });
  if (!response.ok) {
    let errorMsg = `HTTP Error ${response.status}`;
    try {
      const errorData = await response.json();
      if (errorData.error) errorMsg = errorData.error;
    } catch {
      // ignore
    }
    throw new Error(errorMsg);
  }
  return response.json();
}

export const api = {
  // Auth
  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    const data = await fetchJson<{ token: string; user: User }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    authStorage.setAuth(data.token, data.user);
    return data;
  },

  async getMe(): Promise<{ user: User }> {
    return fetchJson('/api/auth/me');
  },

  // Chat
  async sendMessage(
    message: string,
    conversationId?: string,
    roleMode: 'general' | 'fast' | 'complex' | 'maps' = 'general'
  ): Promise<{
    conversationId: string;
    message: ChatMessage;
    sources: any[];
    matchedEvents?: CollegeEvent[];
    matchedClubs?: Club[];
    matchedPersons?: Person[];
    matchedFaculty?: FacultyMember[];
    matchedStatistics?: InstitutionalStatistic[];
    matchedSubjects?: SubjectScheme[];
    matchedAffiliations?: AffiliationRecord[];
    matchedPlacements?: PlacementRecord[];
    matchedAttendanceRules?: AttendanceRule[];
    isUnknownQuestion?: boolean;
    ticketId?: string;
  }> {
    return fetchJson('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ message, conversationId, roleMode }),
    });
  },

  async queryMaps(data: { query: string; userLocation?: string }): Promise<{
    answer: string;
    groundingMetadata?: any;
    locationContext: {
      campusName: string;
      address: string;
      landmark: string;
      city: string;
      railwayDistance: string;
      airportDistance: string;
      googleMapsUrl: string;
    };
  }> {
    return fetchJson('/api/ai/maps-query', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getConversation(id: string): Promise<{ conversation: Conversation }> {
    return fetchJson(`/api/conversations/${id}`);
  },

  async listConversations(): Promise<{ conversations: Conversation[] }> {
    return fetchJson('/api/conversations');
  },

  // Institutions
  async listInstitutions(): Promise<{ institutions: Institution[] }> {
    return fetchJson('/api/institutions');
  },

  // Persons / Leadership
  async listPersons(options?: { search?: string; role?: string; institutionId?: string }): Promise<{ persons: Person[] }> {
    const params = new URLSearchParams();
    if (options?.search) params.set('search', options.search);
    if (options?.role) params.set('role', options.role);
    if (options?.institutionId) params.set('institutionId', options.institutionId);
    return fetchJson(`/api/persons?${params.toString()}`);
  },

  async createPerson(person: Omit<Person, 'id' | 'lastVerified'>): Promise<{ person: Person }> {
    return fetchJson('/api/persons', {
      method: 'POST',
      body: JSON.stringify(person),
    });
  },

  async updatePerson(id: string, updates: Partial<Person>): Promise<{ person: Person }> {
    return fetchJson(`/api/persons/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  async deletePerson(id: string): Promise<{ success: boolean }> {
    return fetchJson(`/api/persons/${id}`, { method: 'DELETE' });
  },

  // Faculty
  async listFaculty(options?: { search?: string; department?: string; designation?: string; institutionId?: string }): Promise<{ faculty: FacultyMember[] }> {
    const params = new URLSearchParams();
    if (options?.search) params.set('search', options.search);
    if (options?.department) params.set('department', options.department);
    if (options?.designation) params.set('designation', options.designation);
    if (options?.institutionId) params.set('institutionId', options.institutionId);
    return fetchJson(`/api/faculty?${params.toString()}`);
  },

  async createFaculty(fac: Omit<FacultyMember, 'id' | 'lastVerified'>): Promise<{ faculty: FacultyMember }> {
    return fetchJson('/api/faculty', {
      method: 'POST',
      body: JSON.stringify(fac),
    });
  },

  async updateFaculty(id: string, updates: Partial<FacultyMember>): Promise<{ faculty: FacultyMember }> {
    return fetchJson(`/api/faculty/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  async deleteFaculty(id: string): Promise<{ success: boolean }> {
    return fetchJson(`/api/faculty/${id}`, { method: 'DELETE' });
  },

  // Departments
  async listDepartments(options?: { search?: string; institutionId?: string }): Promise<{ departments: Department[] }> {
    const params = new URLSearchParams();
    if (options?.search) params.set('search', options.search);
    if (options?.institutionId) params.set('institutionId', options.institutionId);
    return fetchJson(`/api/departments?${params.toString()}`);
  },

  async createDepartment(dept: Omit<Department, 'id' | 'lastVerified'>): Promise<{ department: Department }> {
    return fetchJson('/api/departments', {
      method: 'POST',
      body: JSON.stringify(dept),
    });
  },

  async updateDepartment(id: string, updates: Partial<Department>): Promise<{ department: Department }> {
    return fetchJson(`/api/departments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  async deleteDepartment(id: string): Promise<{ success: boolean }> {
    return fetchJson(`/api/departments/${id}`, { method: 'DELETE' });
  },

  // Courses
  async listCourses(options?: { search?: string; department?: string; level?: string }): Promise<{ courses: Course[] }> {
    const params = new URLSearchParams();
    if (options?.search) params.set('search', options.search);
    if (options?.department) params.set('department', options.department);
    if (options?.level) params.set('level', options.level);
    return fetchJson(`/api/courses?${params.toString()}`);
  },

  async createCourse(course: Omit<Course, 'id' | 'lastVerified'>): Promise<{ course: Course }> {
    return fetchJson('/api/courses', {
      method: 'POST',
      body: JSON.stringify(course),
    });
  },

  async updateCourse(id: string, updates: Partial<Course>): Promise<{ course: Course }> {
    return fetchJson(`/api/courses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  async deleteCourse(id: string): Promise<{ success: boolean }> {
    return fetchJson(`/api/courses/${id}`, { method: 'DELETE' });
  },

  // Statistics
  async listStatistics(options?: { category?: string; search?: string }): Promise<{ statistics: InstitutionalStatistic[] }> {
    const params = new URLSearchParams();
    if (options?.category) params.set('category', options.category);
    if (options?.search) params.set('search', options.search);
    return fetchJson(`/api/statistics?${params.toString()}`);
  },

  async createStatistic(stat: Omit<InstitutionalStatistic, 'id' | 'lastVerified'>): Promise<{ statistic: InstitutionalStatistic }> {
    return fetchJson('/api/statistics', {
      method: 'POST',
      body: JSON.stringify(stat),
    });
  },

  async updateStatistic(id: string, updates: Partial<InstitutionalStatistic>): Promise<{ statistic: InstitutionalStatistic }> {
    return fetchJson(`/api/statistics/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  async deleteStatistic(id: string): Promise<{ success: boolean }> {
    return fetchJson(`/api/statistics/${id}`, { method: 'DELETE' });
  },

  // Subject Schemes (RGPV & RDVV)
  async listSubjectSchemes(options?: { branch?: string; semester?: number; year?: number; course?: string; search?: string }): Promise<{ schemes: SubjectScheme[] }> {
    const params = new URLSearchParams();
    if (options?.branch) params.set('branch', options.branch);
    if (options?.semester) params.set('semester', String(options.semester));
    if (options?.year) params.set('year', String(options.year));
    if (options?.course) params.set('course', options.course);
    if (options?.search) params.set('search', options.search);
    return fetchJson(`/api/subject-schemes?${params.toString()}`);
  },

  async createSubjectScheme(scheme: Omit<SubjectScheme, 'id' | 'lastVerified'>): Promise<{ scheme: SubjectScheme }> {
    return fetchJson('/api/subject-schemes', {
      method: 'POST',
      body: JSON.stringify(scheme),
    });
  },

  async updateSubjectScheme(id: string, updates: Partial<SubjectScheme>): Promise<{ scheme: SubjectScheme }> {
    return fetchJson(`/api/subject-schemes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  async deleteSubjectScheme(id: string): Promise<{ success: boolean }> {
    return fetchJson(`/api/subject-schemes/${id}`, { method: 'DELETE' });
  },

  // Affiliations
  async listAffiliations(options?: { institutionId?: string; university?: string; search?: string }): Promise<{ affiliations: AffiliationRecord[] }> {
    const params = new URLSearchParams();
    if (options?.institutionId) params.set('institutionId', options.institutionId);
    if (options?.university) params.set('university', options.university);
    if (options?.search) params.set('search', options.search);
    return fetchJson(`/api/affiliations?${params.toString()}`);
  },

  async createAffiliation(aff: Omit<AffiliationRecord, 'id' | 'lastVerified'>): Promise<{ affiliation: AffiliationRecord }> {
    return fetchJson('/api/affiliations', {
      method: 'POST',
      body: JSON.stringify(aff),
    });
  },

  async updateAffiliation(id: string, updates: Partial<AffiliationRecord>): Promise<{ affiliation: AffiliationRecord }> {
    return fetchJson(`/api/affiliations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  async deleteAffiliation(id: string): Promise<{ success: boolean }> {
    return fetchJson(`/api/affiliations/${id}`, { method: 'DELETE' });
  },

  // Attendance Rules
  async listAttendanceRules(): Promise<{ rules: AttendanceRule[] }> {
    return fetchJson('/api/attendance-rules');
  },

  async createAttendanceRule(rule: Omit<AttendanceRule, 'id' | 'lastVerified'>): Promise<{ rule: AttendanceRule }> {
    return fetchJson('/api/attendance-rules', {
      method: 'POST',
      body: JSON.stringify(rule),
    });
  },

  async updateAttendanceRule(id: string, updates: Partial<AttendanceRule>): Promise<{ rule: AttendanceRule }> {
    return fetchJson(`/api/attendance-rules/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  // Placements
  async listPlacements(): Promise<{ placements: PlacementRecord[] }> {
    return fetchJson('/api/placements');
  },

  async createPlacement(p: Omit<PlacementRecord, 'id' | 'lastVerified'>): Promise<{ placement: PlacementRecord }> {
    return fetchJson('/api/placements', {
      method: 'POST',
      body: JSON.stringify(p),
    });
  },

  async updatePlacement(id: string, updates: Partial<PlacementRecord>): Promise<{ placement: PlacementRecord }> {
    return fetchJson(`/api/placements/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  // Companies
  async listCompanies(): Promise<{ companies: Company[] }> {
    return fetchJson('/api/companies');
  },

  // Teach AI System (Requirement 16)
  async teachAI(data: {
    question: string;
    answer: string;
    category?: string;
    institution?: string;
    department?: string;
    course?: string;
    academicYear?: string;
    effectiveDate?: string;
    source?: string;
    sourceUrl?: string;
    notes?: string;
    verificationStatus?: string;
  }): Promise<{ success: boolean; knowledgeItem: KnowledgeItem }> {
    return fetchJson('/api/teach-ai', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Knowledge Health
  async getKnowledgeHealth(): Promise<{ health: KnowledgeHealthItem[] }> {
    return fetchJson('/api/knowledge-health');
  },

  // Sync Dashboard & Status
  async getSyncStatus(): Promise<{ status: SyncStatusInfo }> {
    return fetchJson('/api/sync-status');
  },

  async setSyncInterval(hours: number): Promise<{ success: boolean; intervalHours: number }> {
    return fetchJson('/api/sync-interval', {
      method: 'POST',
      body: JSON.stringify({ hours }),
    });
  },

  async listSourcePages(): Promise<{ pages: SourcePageRecord[] }> {
    return fetchJson('/api/source-pages');
  },

  async listSourceVersions(sourceId?: string): Promise<{ versions: SourceVersion[] }> {
    const url = sourceId ? `/api/source-versions?sourceId=${encodeURIComponent(sourceId)}` : '/api/source-versions';
    return fetchJson(url);
  },

  // Knowledge Base
  async listKnowledge(options?: { search?: string; category?: string; status?: string }): Promise<{ knowledge: KnowledgeItem[] }> {
    const params = new URLSearchParams();
    if (options?.search) params.set('search', options.search);
    if (options?.category) params.set('category', options.category);
    if (options?.status) params.set('status', options.status);
    return fetchJson(`/api/knowledge?${params.toString()}`);
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
  async listEvents(options?: { filterDate?: string; search?: string }): Promise<{ events: CollegeEvent[] }> {
    const params = new URLSearchParams();
    if (options?.filterDate) params.set('filterDate', options.filterDate);
    if (options?.search) params.set('search', options.search);
    return fetchJson(`/api/events?${params.toString()}`);
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
  async listClubs(): Promise<{ clubs: Club[] }> {
    return fetchJson('/api/clubs');
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

  // Document Upload
  async listDocuments(): Promise<{ documents: DocumentItem[] }> {
    return fetchJson('/api/documents');
  },

  async uploadDocument(data: {
    filename: string;
    fileType: string;
    textContent: string;
    category?: string;
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
    createKnowledgeItem = true,
    extraKnowledgeData?: Partial<KnowledgeItem>
  ): Promise<{ question: UnansweredQuestion; knowledgeItem?: KnowledgeItem }> {
    return fetchJson(`/api/unanswered-questions/${id}/resolve`, {
      method: 'POST',
      body: JSON.stringify({ adminAnswer, createKnowledgeItem, ...extraKnowledgeData }),
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

  // Teach the AI extraction & publishing
  async teachAiExtract(text: string): Promise<{ detected: DetectedEntity }> {
    return fetchJson('/api/teach-ai/extract', {
      method: 'POST',
      body: JSON.stringify({ text }),
    });
  },

  async teachAiPublish(entity: DetectedEntity): Promise<{ success: boolean; item: any }> {
    return fetchJson('/api/teach-ai/publish', {
      method: 'POST',
      body: JSON.stringify(entity),
    });
  },

  async summarizeAnswer(text: string): Promise<{ summary: string }> {
    return fetchJson('/api/chat/summarize', {
      method: 'POST',
      body: JSON.stringify({ text }),
    });
  },

  // Advanced AI Campus Tools Suite
  async generateStudyPlan(data: {
    branch: string;
    semester: number;
    weeksUntilExam?: number;
    targetTopics?: string;
  }): Promise<{ plan: string; subjects: string[] }> {
    return fetchJson('/api/ai/study-plan', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async generatePlacementPrep(data: {
    targetCompany: string;
    branch?: string;
    targetRole?: string;
  }): Promise<{ guide: string; topTopics: string[] }> {
    return fetchJson('/api/ai/placement-prep', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async generateCondonationLetter(data: {
    studentName: string;
    enrollmentNo?: string;
    branch: string;
    semester: number;
    attendancePercent: number;
    medicalReason: string;
    startDate?: string;
    endDate?: string;
    doctorName?: string;
  }): Promise<{ letter: string; condonable: boolean; ruleNotes: string }> {
    return fetchJson('/api/ai/condonation-letter', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async explainConcept(data: {
    concept: string;
    subject?: string;
    semester?: number;
  }): Promise<{ explanation: string; examTips: string; keyTakeaways: string[] }> {
    return fetchJson('/api/ai/explain-concept', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async analyzeNotice(data: {
    noticeText: string;
  }): Promise<{
    summary: string;
    keyDates: string[];
    actionRequired: string[];
    targetAudience: string;
    urgency: 'HIGH' | 'MEDIUM' | 'LOW';
  }> {
    return fetchJson('/api/ai/analyze-notice', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async calculateAttendance(data: {
    totalClasses: number;
    attendedClasses: number;
  }): Promise<{
    currentPercentage: number;
    classesHeld: number;
    classesAttended: number;
    status: 'SAFE' | 'CONDONABLE' | 'DETAINED_DANGER';
    classesNeededFor75: number;
    canMissBefore75: number;
    recommendation: string;
    ordinanceRule: string;
  }> {
    return fetchJson('/api/ai/attendance-calc', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};
