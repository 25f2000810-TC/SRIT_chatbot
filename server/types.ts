export type Role = 'ADMIN' | 'STAFF' | 'CONTENT_EDITOR';

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
  | 'SHRI_RAM_COMMERCE'
  | 'SHRI_RAM_LAW'
  | 'SHRI_RAM_MANAGEMENT'
  | 'RGPV'
  | 'RDVV'
  | 'OTHER';

export type VerificationStatus =
  | 'VERIFIED'
  | 'OFFICIAL_SOURCE'
  | 'ADMIN_VERIFIED'
  | 'UNVERIFIED'
  | 'OUTDATED'
  | 'CONFLICTING'
  | 'Verified'
  | 'Unverified'
  | 'Needs Review';

// ==========================================
// 1. TOP-LEVEL ENTITY: InstitutionGroup
// ==========================================
export interface InstitutionGroup {
  id: string;
  name: string; // "Shri Ram Group"
  shortName: string; // "SRG"
  location: string; // "Jabalpur, Madhya Pradesh, India"
  description: string;
  website: string; // "https://sritgroup.net/"
  establishedDate: string; // "9 July 2001"
  establishedYear: number; // 2001
  leadership: string; // "Dr. S. P. Kosta (Group Director / Director General)"
  chairman?: string;
  founderNote: string; // Governed by Board of Governors / not an unverified private owner
  constituentCount: number;
  totalStudents: number; // ~10,000+
  source: string;
  sourceUrl: string;
  lastVerified: string;
}

// ==========================================
// 2. COMPLETE INSTITUTION PROFILE
// ==========================================
export interface Institution {
  id: string; // e.g. "SRIT", "SHRI_RAM_COMMERCE"
  institutionId?: string; // alias
  name: string; // "Shri Ram Institute of Technology"
  shortName: string; // "SRIT"
  type: string; // "Engineering & Technical Institute" | "Commerce & Degree College" | "Pharmacy College"
  groupId?: string; // "SHRI_RAM_GROUP"
  parentGroupId?: string; // alias
  groupName?: string; // "Shri Ram Group"
  location?: string; // alias
  address?: string; // "Near I.T.I, Madhotal, Jabalpur"
  city?: string; // "Jabalpur"
  state?: string; // "Madhya Pradesh"
  country?: string; // "India"
  postalCode?: string;
  website: string;
  email: string;
  phone?: string;
  contact?: string; // alias
  affiliation?: string; // alias
  approval?: string; // alias
  history?: string; // alias
  programsOffered?: string[]; // alias
  establishedDate?: string; // "2001" or "9 July 2001"
  establishmentDate?: string; // alias
  establishedYear: number;
  affiliatingUniversity?: string; // "RGPV Bhopal" or "RDVV Jabalpur"
  regulatoryBodies?: string[]; // ["AICTE", "PCI", "UGC", "BCI"]
  accreditation?: string; // "NAAC Accredited / NBA Recognized Programs"
  recognition?: string; // "Approved by AICTE New Delhi, Directorate of Technical Education MP"
  principal?: string; // e.g. "Dr. Shailesh Gupta"
  director?: string; // e.g. "Dr. S. P. Kosta (Director General)"
  chairman?: string;
  founder?: string; // Strictly verified note or empty
  leadership?: string;
  description: string;
  vision?: string;
  mission?: string;
  campusInformation?: string;
  facilities?: string[]; // ["Central Library", "Advanced Computing Labs", "Boys & Girls Hostels", "Robotics Center", "Sports Ground"]
  studentStrength?: number;
  facultyStrength?: number;
  sourceUrls?: string[];
  sourceUrl?: string; // alias
  source: string;
  lastVerified: string;
  lastUpdated?: string;
  academicYear?: string; // "2026-27"
  isFirstInstitutionInGroup?: boolean;
}

// ==========================================
// 3. UNIVERSITY & AFFILIATIONS
// ==========================================
export interface University {
  id: string; // "RGPV" | "RDVV"
  name: string; // "Rajiv Gandhi Proudyogiki Vishwavidyalaya, Bhopal"
  shortName: string; // "RGPV"
  location: string; // "Bhopal, Madhya Pradesh"
  type: 'State Technological University' | 'State University (General & Professional)';
  website: string;
  description: string;
  schemePortalUrl?: string; // "https://www.rgpv.ac.in/uni/frm_viewscheme.aspx"
  source: string;
}

export interface AffiliationRecord {
  id: string;
  institution: string;
  institutionId: InstitutionScope;
  program: string;
  courseId?: string;
  university: string;
  universityId?: string;
  regulatoryAuthority: string;
  academicYear: string;
  notes: string;
  source: string;
  sourceUrl: string;
  lastVerified: string;
  verificationStatus?: VerificationStatus;
}

// ==========================================
// 4. COLLEGE -> COURSE -> BRANCH HIERARCHY
// ==========================================
export interface CourseHierarchy {
  id: string; // e.g. "srit-btech"
  courseName: string; // "Bachelor of Technology"
  shortName: string; // "B.Tech"
  institutionId: InstitutionScope;
  institutionName: string;
  courseType: 'Undergraduate' | 'Postgraduate' | 'Diploma';
  duration: string; // "4 Years"
  durationYears: number; // 4
  totalSemesters: number; // 8
  degree: string; // "B.Tech"
  university: string; // "RGPV, Bhopal"
  universityId: 'RGPV' | 'RDVV' | 'OTHER';
  affiliation: string; // "Affiliated to RGPV, Approved by AICTE"
  eligibility: string; // "10+2 with Physics, Mathematics, and Chemistry/Computer Science with min 45% (40% for reserved)"
  admissionMode: string; // "MP DTE Online Counselling based on JEE Main / 10+2 Merit"
  admissionAuthority: string; // "Directorate of Technical Education (DTE), M.P."
  fees: string; // "₹65,000 - ₹75,000 per year"
  seats: number; // Total approved intake across branches
  branches: string[]; // ["Computer Science & Engineering", "Artificial Intelligence & Machine Learning", "Data Science", "Cyber Security", "Mechanical", "Civil", "ECE", "Electrical"]
  specializations?: string[];
  academicYears: string[];
  syllabusOverview: string;
  scheme: string; // "AICTE Flexible Curricula / Choice Based Grading System (CBGS)"
  source: string;
  sourceUrl: string;
  lastVerified: string;
  verificationStatus?: VerificationStatus;
}

export interface BranchHierarchy {
  id: string; // e.g. "srit-btech-cse"
  branchName: string; // "Computer Science and Engineering"
  branchCode: string; // "CSE" or "CS"
  courseId: string; // "srit-btech"
  institutionId: InstitutionScope;
  approvedIntake: number; // 180 seats
  academicYears: string[];
  hodName: string; // "Dr. Sachin Sharma"
  totalSemesters: number; // 8
  subjectsBySemester: Record<number, string[]>;
  source: string;
  sourceUrl: string;
  lastVerified: string;
}

// ==========================================
// 5. SUBJECT SCHEME (RGPV / RDVV Syllabus)
// ==========================================
export interface SubjectScheme {
  id: string;
  universityId?: string;
  university?: string;
  schemeName?: string; // "AICTE Flexible Curricula / CBGS"
  course: string; // "B.Tech"
  branch: string; // "Computer Science & Engineering" | "AI/ML" | "Common First Year"
  academicYear?: string; // "2026-27"
  academicSession?: string;
  subjectsCount?: number;
  isPractical?: boolean;
  hasLab?: boolean;
  year: number; // 1, 2, 3, 4
  semester: number; // 1 to 8
  subjectCode: string; // "CS301", "BT101", "AL301"
  subjectName: string; // "Energy & Environmental Engineering"
  credits: number;
  lectureHours?: number;
  theoryHours?: number;
  tutorialHours?: number;
  practicalHours?: number;
  theoryPractical?: 'Theory' | 'Practical' | 'Theory + Practical';
  isElective: boolean;
  electiveStatus?: string;
  syllabusOverview: string;
  schemeYear?: string;
  sourceUrl: string;
  source: string;
  lastVerified: string;
  verificationStatus?: VerificationStatus;
}

// ==========================================
// 6. FACULTY DATABASE (WITH HOD HISTORY)
// ==========================================
export interface FacultyMember {
  id: string;
  facultyId?: string;
  fullName: string;
  name?: string; // alias
  title?: string; // "Dr.", "Prof."
  institution: string; // "Shri Ram Institute of Technology"
  institutionId: InstitutionScope;
  department: string; // "Computer Science & Engineering"
  designation: string; // "Professor & HOD", "Associate Professor", "Assistant Professor"
  qualification: string; // "B.E., M.Tech, Ph.D."
  specialization?: string;
  experience?: string; // "18+ Years"
  subjectsTaught?: string[];
  joiningDate?: string;
  leavingDate?: string;
  currentStatus: 'Active' | 'Relieved' | 'On Leave';
  profileUrl?: string;
  email?: string; // Only if officially published
  phone?: string; // Only if officially published
  isHOD?: boolean;
  hodStatus?: 'Current HOD' | 'Former HOD' | 'Not HOD';
  hodStartDate?: string; // e.g. "2023" or "2018"
  hodEndDate?: string; // e.g. "Present" or "2023"
  hodStartYear?: string;
  hodEndYear?: string;
  academicYear: string; // e.g. "2026-27", "2024-25"
  historicalRoles?: Array<{ role: string; department: string; academicYears: string; note?: string }>;
  previousRoles?: string[];
  source: string;
  sourceUrl?: string;
  status: VerificationStatus;
  lastVerified: string;
}

// ==========================================
// 7. ACADEMIC ACHIEVEMENTS
// ==========================================
export interface AcademicAchievement {
  id: string;
  title: string;
  description: string;
  institution: string;
  institutionId: InstitutionScope;
  department: string;
  course?: string;
  student?: string; // Name of student/team
  faculty?: string; // Name of faculty/mentor
  achievementType:
    | 'Student Achievement'
    | 'Faculty Achievement'
    | 'Research Paper'
    | 'Patent'
    | 'Competition'
    | 'Hackathon'
    | 'University Rank'
    | 'Award'
    | 'Certification'
    | 'Academic Excellence';
  competition?: string;
  award?: string;
  rank?: string;
  year: number;
  academicYear: string; // "2024-25", "2025-26"
  date?: string;
  source: string;
  sourceUrl: string;
  lastVerified: string;
  verificationStatus?: VerificationStatus;
}

// ==========================================
// 8. STUDENT STRENGTH (YEAR-WISE & SCOPED)
// ==========================================
export interface StudentStrengthRecord {
  id: string;
  institution: string;
  institutionId: InstitutionScope;
  course: string; // e.g. "B.Tech" or "All"
  branch?: string; // e.g. "CSE" or "All"
  year?: number; // 1, 2, 3, 4 or undefined for overall
  academicYear: string; // "2024-25", "2025-26"
  maleCount: number;
  femaleCount: number;
  totalCount: number;
  source: string; // e.g. "NIRF 2025 Submission", "Official SRIT Website"
  sourceDate: string;
  reportingYear: string;
  verificationStatus: VerificationStatus;
  notes?: string;
}

// ==========================================
// 9. ADMISSION INFORMATION
// ==========================================
export interface AdmissionInformation {
  id: string;
  institution: string;
  institutionId: InstitutionScope;
  course: string;
  branch?: string;
  academicYear: string; // e.g. "2026-27"
  admissionType: 'JEE Counselling' | 'DTE MP Online' | 'Direct Merit' | 'Lateral Entry (Diploma)' | 'Management' | 'University Level';
  status: 'Open' | 'Upcoming' | 'Closed' | 'Announced';
  eligibility: string;
  entranceExam: string; // "JEE Main / MP Pre-Engineering Test (PET)"
  minimumQualification: string;
  applicationStartDate?: string;
  applicationEndDate?: string;
  admissionStartDate?: string;
  admissionEndDate?: string;
  counsellingProcess: string;
  admissionAuthority: string; // "Directorate of Technical Education (DTE), Bhopal"
  seatInformation: string;
  documentsRequired: string[];
  applicationUrl: string;
  fees: string;
  source: string;
  sourceUrl: string;
  lastUpdated: string;
  verificationStatus: VerificationStatus;
}

// ==========================================
// 10. FEE STRUCTURE
// ==========================================
export interface FeeStructure {
  id: string;
  institution: string;
  institutionId: InstitutionScope;
  course: string;
  branch?: string;
  academicYear: string; // "2026-27"
  feeType: 'Tuition Fee' | 'Semester Fee' | 'Annual Fee' | 'Hostel & Mess' | 'Bus/Transportation' | 'Exam Fee';
  amount: number;
  amountFormatted: string; // "₹65,000 per year"
  frequency: 'Annual' | 'Semester-wise' | 'One-Time';
  hostelFee?: string; // "₹60,000 - ₹75,000 per year (including mess)"
  examFee?: string; // "As per RGPV / RDVV semester exam notification (~₹1,500/sem)"
  otherMandatoryFees?: string; // "Caution money (refundable): ₹5,000"
  totalEstimatedFee: string; // "₹75,000/year (excluding hostel)"
  categoryDiscounts?: string; // "Eligible MP Govt Post-Matric Scholarship fee waivers"
  source: string;
  sourceUrl: string;
  effectiveDate: string;
  lastVerified: string;
  verificationStatus: VerificationStatus;
}

// ==========================================
// 11. SCHOLARSHIP DATABASE
// ==========================================
export interface Scholarship {
  id: string;
  name: string; // "MP Post Matric Scholarship", "Mukhyamantri Medhavi Vidyarthi Yojana (MMVY)"
  institution: string;
  institutionId: InstitutionScope;
  eligibleCourse: string; // "All B.Tech, M.Tech, MCA, MBA, B.Com courses"
  eligibleCategory: string; // "SC / ST / OBC / General EWS"
  eligibility: string;
  incomeLimit: string; // "Below ₹6 Lakhs/year for MMVY, ₹3 Lakhs/year for OBC"
  academicRequirements: string; // "70%+ in 12th MP Board / 85%+ CBSE for MMVY"
  amount: string; // "Full tuition fee reimbursement / up to ₹1.5 Lakh per year"
  renewalRules: string; // "Maintain minimum 75% attendance and clear all semester subjects"
  applicationProcess: string;
  deadline?: string;
  applicationPortal: string; // "https://scholarshipportal.mp.nic.in/"
  documentsRequired: string[];
  source: string;
  sourceUrl: string;
  academicYear: string;
  verificationStatus: VerificationStatus;
}

// ==========================================
// 12. PLACEMENT DATABASE
// ==========================================
export interface PlacementRecord {
  id: string;
  institution: string;
  institutionId: InstitutionScope;
  academicYear: string; // "2024-25", "2025-26"
  graduationYear: number;
  course?: string; // "B.Tech"
  branch?: string; // "Computer Science & Engineering"
  company?: string;
  student?: string; // Privacy note: names withheld unless officially published
  package?: string; // "85 LPA"
  packageType?: 'International' | 'Domestic Top' | 'Average' | 'Median' | 'Campus';
  highestPackage: string; // "85 LPA" (International) / "44 LPA" (National)
  highestPackageDetails?: string;
  averagePackage: string; // "5.2 LPA"
  medianPackage: string; // "4.5 LPA"
  studentsEligible: number;
  studentsPlaced: number;
  placementRate: string; // "85% - 86.5%"
  companiesVisited?: number; // 120+
  recruiters?: string[]; // ["TCS", "Persistent Systems", "Infosys", "Cisco", "Cognizant", "Hexaware", "Jio Platforms"]
  recruitersCount?: number;
  topCompanies?: string[];
  cseTopPackage?: string; // "44 LPA"
  eceTopPackage?: string; // "12 LPA"
  studentNameNote: string;
  source: string;
  sourceUrl: string;
  lastVerified: string;
  verificationStatus?: VerificationStatus;
}

// ==========================================
// 13. COMPANY DATABASE
// ==========================================
export interface Company {
  id: string;
  companyName?: string;
  name?: string; // alias
  industry: string;
  website?: string;
  visitedInstitution?: string; // "Shri Ram Institute of Technology"
  recruitmentYear?: string; // "2024", "2025", "2026"
  coursesEligible?: string[]; // ["B.Tech", "MCA", "M.Tech"]
  branchesEligible?: string[]; // ["CSE", "AI/ML", "IT", "ECE"]
  jobRole?: string; // "Software Engineer", "Systems Engineer", "Cloud Associate"
  package?: string; // "₹4.5 - ₹12 LPA"
  studentsSelected?: number;
  hiringBranches?: string[];
  typicalRoles?: string[];
  visitedYears?: string[];
  source: string;
  lastVerified?: string;
}

// ==========================================
// 14. ACADEMIC RULES & ATTENDANCE
// ==========================================
export interface AcademicRule {
  id: string;
  institution?: string;
  institutionId?: InstitutionScope;
  university?: string; // "RGPV, Bhopal" | "RDVV, Jabalpur"
  course?: string; // "B.Tech, M.Tech, MCA"
  branch?: string;
  ruleType?: 'Attendance' | 'Examination' | 'Promotion' | 'Backlog' | 'Internal Assessment' | 'Condonation';
  ruleTitle: string;
  minimumAttendance?: number; // 75
  minimumPercentage?: number;
  maxCondonationPercentage?: number; // 10
  minimumWithCondonation?: number; // 65
  condonation?: string; // "Up to 10% condonation permissible strictly on medical grounds approved by Principal"
  condoningAuthority?: string;
  applicableCourse?: string;
  universityOrdinance?: string;
  effectiveDate?: string;
  academicYear?: string;
  authority?: string; // "RGPV Ordinance No. 4 / Principal SRIT"
  medicalPolicy: string;
  shortageOutcome70: string; // "70% attendance requires approved medical certificate to avoid detention"
  below65Outcome: string; // "Strictly detained, cannot be condoned"
  source: string;
  sourceUrl: string;
  document?: string;
  lastVerified: string;
  verificationStatus?: VerificationStatus;
}

// Legacy alias for backwards compatibility
export type AttendanceRule = AcademicRule;

// ==========================================
// 15. EVENTS, FESTS, CLUBS & ACTIVITIES
// ==========================================
export interface CollegeEvent {
  id: string;
  eventName: string;
  name?: string;
  eventType: 'Technical Fest' | 'Cultural Fest' | 'Sports Tournament' | 'Workshop' | 'Conference' | 'Seminar';
  description: string;
  date: string;
  startTime: string;
  endTime?: string;
  academicYear?: string;
  venue: string;
  organizer: string;
  institution?: string;
  department?: string;
  eligibility: string;
  participants?: string;
  result?: string;
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
  source?: string;
  sourceUrl?: string;
}

export interface Club {
  id: string;
  name: string;
  category: string;
  description: string;
  activities: string[];
  eligibility: string;
  institution?: string;
  department?: string;
  meetingInformation?: string;
  contactPerson?: string;
  contactEmail?: string;
  contactPhone?: string;
  source: string;
  sourceUrl?: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// 16. KNOWLEDGE & ARTICLES
// ==========================================
export type KnowledgeCategory =
  | 'InstitutionGroup'
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
  | 'Admissions'
  | 'Fees'
  | 'Scholarships'
  | 'Achievements'
  | 'Companies'
  | 'College'
  | 'Academics'
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
  | 'NIRF 2025 Submission'
  | 'Google Search Grounded';

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
  sourceId?: string;
  status: 'Draft' | 'Published';
  published: boolean;
  effectiveFrom?: string;
  effectiveUntil?: string;
  conflictDetails?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  verificationStatus?: VerificationStatus;
}

// ==========================================
// 17. SOURCE METADATA & VERSION CONTROL
// ==========================================
export interface SourceMetadata {
  sourceId: string;
  sourceUrl: string;
  sourceWebsite: string;
  sourceTitle: string;
  sourceType: SourceType;
  retrievedAt: string;
  lastVerifiedAt: string;
  publishedAt?: string;
  academicYear?: string;
  contentHash: string;
  version: number;
  verificationStatus: VerificationStatus;
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
  sourceReliability: 'Official college/institution website' | 'Official university website' | 'Official government/regulatory' | 'Official PDF/notice' | 'Search discovery';
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

// ==========================================
// 18. CONVERSATION PERSISTENT CONTEXT
// ==========================================
export interface StudentContext {
  institution?: string; // "SRIT" | "SHRI_RAM_COMMERCE"
  institutionName?: string; // "Shri Ram Institute of Technology"
  course?: string; // "B.Tech"
  branch?: string; // "CSE" | "AI/ML"
  year?: number; // 1, 2, 3, 4
  semester?: number; // 1, 2, 3, 4, 5, 6, 7, 8
  academicYear?: string; // "2026-27"
}

export interface ChatMessage {
  id?: string;
  conversationId?: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: Array<{
    title: string;
    sourceType: string;
    sourceUrl?: string;
    verifiedDate?: string;
    scope?: string;
    verificationStatus?: string;
  }>;
  matchedEvents?: CollegeEvent[];
  matchedClubs?: Club[];
  matchedPersons?: Person[];
  matchedFaculty?: FacultyMember[];
  matchedStatistics?: InstitutionalStatistic[];
  matchedSubjects?: SubjectScheme[];
  matchedAffiliations?: AffiliationRecord[];
  matchedPlacements?: PlacementRecord[];
  matchedAttendanceRules?: AcademicRule[];
  matchedAchievements?: AcademicAchievement[];
  matchedFees?: FeeStructure[];
  matchedScholarships?: Scholarship[];
  matchedAdmissions?: AdmissionInformation[];
  isUnknownQuestion?: boolean;
  ticketId?: string;
  needsClarification?: boolean;
  clarificationPrompt?: string;
  feedback?: any;
  createdAt?: string;
}

export interface Conversation {
  id: string;
  userId?: string;
  title?: string;
  studentContext?: StudentContext;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// 19. TICKETS, FEEDBACK, AUDIT & ANALYTICS
// ==========================================
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
  recentFeedbacks: FeedbackItem[];
  coverage: {
    leadershipCount: number;
    facultyCount: number;
    departmentsCount: number;
    coursesCount: number;
    statisticsCount: number;
    eventsCount: number;
    clubsCount: number;
    documentsCount: number;
    schemesCount: number;
    affiliationsCount: number;
    attendanceRulesCount: number;
    placementsCount: number;
    companiesCount: number;
    achievementsCount: number;
    admissionsCount: number;
    feesCount: number;
    scholarshipsCount: number;
    unansweredQuestions: number;
  };
}

// ==========================================
// 20. PERSON, DEPARTMENT, STATS & DOCUMENTS
// ==========================================
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

export interface Department {
  id: string;
  name: string;
  abbreviation: string;
  institution: string;
  institutionId: InstitutionScope;
  description: string;
  courses: string[];
  facultyCount: number;
  HOD?: string;
  previousHOD?: string;
  affiliatedUniversity?: string;
  vision?: string;
  mission?: string;
  labs?: string[];
  contact?: string;
  source: string;
  sourceUrl?: string;
  lastVerified?: string;
}

export interface Course {
  id: string;
  name: string;
  level: 'Undergraduate' | 'Postgraduate' | 'Diploma' | 'UG' | 'PG';
  duration: string;
  department: string;
  institution: string;
  institutionId: InstitutionScope;
  affiliation: string;
  approval: string;
  accreditation?: string;
  intake: number;
  eligibility: string;
  source: string;
  sourceUrl?: string;
  lastVerified?: string;
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

export interface KnowledgeRelationship {
  id: string;
  fromEntityId: string;
  fromEntityType: string;
  relation: string;
  toEntityId: string;
  toEntityType: string;
  description: string;
  sourceUrl?: string;
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
