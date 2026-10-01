export type Role = 'ADMIN' | 'CONTENT_EDITOR';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
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
  establishmentDate: string; // e.g. "9 July 2001" or "2001"
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
  title?: string; // Dr., Prof., Shri
  designation: string; // e.g. "Group Director", "Director General", "Principal", "TPO"
  role: string; // "GROUP_DIRECTOR" | "DIRECTOR_GENERAL" | "PRINCIPAL" | "TPO" | "CHAIRMAN" | "LEADERSHIP"
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
  designation: string; // "Professor", "Associate Professor", "Assistant Professor", "HOD"
  department: string;
  qualification: string; // "BSc, MSc, MPhil, PhD", "B.Tech, M.Tech, Ph.D"
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
  duration: string; // e.g. "4 Years", "2 Years"
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
  academicYear: string; // e.g. "2023-24", "2024-25", "Overall"
  institution: string;
  institutionId: InstitutionScope;
  category: 'Student Strength' | 'Staff Strength' | 'Placement' | 'Intake' | 'Campus';
  source: string; // e.g. "NIRF 2025 Submission", "Official SRIT Website"
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
  | 'Student Statistics'
  | 'Staff Statistics'
  | 'College'
  | 'Academics'
  | 'Admissions'
  | 'Student Services'
  | 'Departments'
  | 'Facilities'
  | 'Clubs'
  | 'Activities'
  | 'Events'
  | 'Placements'
  | 'Training'
  | 'Contact'
  | 'General';

export type SourceType =
  | 'Official Website'
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
  sourceType: SourceType;
  sourceUrl?: string;
  status: 'Draft' | 'Published';
  published: boolean;
  effectiveFrom?: string;
  effectiveUntil?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export type EventStatus =
  | 'Draft'
  | 'Published'
  | 'Upcoming'
  | 'Ongoing'
  | 'Completed'
  | 'Cancelled';

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
  status: EventStatus;
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
