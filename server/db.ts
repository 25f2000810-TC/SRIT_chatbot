import fs from 'fs';
import path from 'path';
import {
  User,
  KnowledgeItem,
  CollegeEvent,
  Club,
  DocumentItem,
  UnansweredQuestion,
  FeedbackItem,
  AuditLog,
  Conversation,
  ChatMessage,
  Institution,
  InstitutionGroup,
  University,
  CourseHierarchy,
  BranchHierarchy,
  AcademicAchievement,
  StudentStrengthRecord,
  AdmissionInformation,
  FeeStructure,
  Scholarship,
  AcademicRule,
  StudentContext,
  Person,
  FacultyMember,
  Department,
  Course,
  InstitutionalStatistic,
  SubjectScheme,
  AffiliationRecord,
  AttendanceRule,
  PlacementRecord,
  Company,
  KnowledgeRelationship,
  SourcePageRecord,
  SourceVersion,
  KnowledgeHealthItem,
} from './types.js';
import {
  initialUsers,
  initialKnowledge,
  initialClubs,
  initialEvents,
  initialInstitutions,
  initialInstitutionGroups,
  initialUniversities,
  initialCoursesHierarchy,
  initialBranchesHierarchy,
  initialAchievements,
  initialStudentStrength,
  initialAdmissions,
  initialFeeStructures,
  initialScholarships,
  initialAcademicRules,
  initialPersons,
  initialFaculty,
  initialDepartments,
  initialCourses,
  initialStatistics,
  initialSubjectSchemes,
  initialAffiliations,
  initialAttendanceRules,
  initialPlacements,
  initialCompanies,
  initialRelationships,
  initialSourcePages,
  initialUnansweredQuestions,
} from './seedData.js';

interface DatabaseSchema {
  users: (User & { passwordHash: string })[];
  conversations: Conversation[];
  knowledge: KnowledgeItem[];
  events: CollegeEvent[];
  clubs: Club[];
  documents: DocumentItem[];
  unansweredQuestions: UnansweredQuestion[];
  feedbacks: FeedbackItem[];
  auditLogs: AuditLog[];
  groups: InstitutionGroup[];
  institutions: Institution[];
  universities: University[];
  coursesHierarchy: CourseHierarchy[];
  branchesHierarchy: BranchHierarchy[];
  achievements: AcademicAchievement[];
  studentStrength: StudentStrengthRecord[];
  admissions: AdmissionInformation[];
  feeStructures: FeeStructure[];
  scholarships: Scholarship[];
  academicRules: AcademicRule[];
  persons: Person[];
  faculty: FacultyMember[];
  departments: Department[];
  courses: Course[];
  statistics: InstitutionalStatistic[];
  subjectSchemes: SubjectScheme[];
  affiliations: AffiliationRecord[];
  attendanceRules: AttendanceRule[];
  placements: PlacementRecord[];
  companies: Company[];
  relationships: KnowledgeRelationship[];
  sourcePages: SourcePageRecord[];
  sourceVersions: SourceVersion[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.ensureDataDir();
    this.data = this.loadData();
  }

  private ensureDataDir() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private loadData(): DatabaseSchema {
    let loaded: any = null;
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        loaded = JSON.parse(raw);
      }
    } catch (err) {
      console.error('Failed to load database file, reinitializing with seed data', err);
    }

    function mergeById<T extends { id: string }>(existing: T[] = [], seeds: T[] = []): T[] {
      const map = new Map<string, T>();
      seeds.forEach((s) => map.set(s.id, s));
      existing.forEach((e) => {
        const seed = map.get(e.id);
        map.set(e.id, seed ? { ...seed, ...e } : e);
      });
      return Array.from(map.values());
    }

    const merged: DatabaseSchema = {
      users: loaded?.users?.length ? loaded.users : initialUsers,
      conversations: loaded?.conversations || [],
      knowledge: mergeById(loaded?.knowledge, initialKnowledge),
      events: loaded?.events?.length ? loaded.events : initialEvents,
      clubs: loaded?.clubs?.length ? loaded.clubs : initialClubs,
      documents: loaded?.documents || [],
      unansweredQuestions: mergeById(loaded?.unansweredQuestions, initialUnansweredQuestions),
      feedbacks: loaded?.feedbacks || [],
      auditLogs: loaded?.auditLogs || [
        {
          id: 'log-init-1',
          action: 'SYSTEM_INIT',
          entityType: 'System',
          entityId: 'sys-1',
          entityTitle: 'SRIT Knowledge Base Initialized',
          details: 'Initialized SRIT database with official website seed data',
          performedBy: 'System',
          createdAt: new Date().toISOString(),
        },
      ],
      institutions: mergeById(loaded?.institutions, initialInstitutions),
      groups: mergeById(loaded?.groups, initialInstitutionGroups),
      universities: mergeById(loaded?.universities, initialUniversities),
      coursesHierarchy: mergeById(loaded?.coursesHierarchy, initialCoursesHierarchy),
      branchesHierarchy: mergeById(loaded?.branchesHierarchy, initialBranchesHierarchy),
      achievements: mergeById(loaded?.achievements, initialAchievements),
      studentStrength: mergeById(loaded?.studentStrength, initialStudentStrength),
      admissions: mergeById(loaded?.admissions, initialAdmissions),
      feeStructures: mergeById(loaded?.feeStructures, initialFeeStructures),
      scholarships: mergeById(loaded?.scholarships, initialScholarships),
      academicRules: mergeById(loaded?.academicRules, initialAcademicRules),
      persons: mergeById(loaded?.persons, initialPersons),
      faculty: mergeById(loaded?.faculty, initialFaculty),
      departments: mergeById(loaded?.departments, initialDepartments),
      courses: mergeById(loaded?.courses, initialCourses),
      statistics: mergeById(loaded?.statistics, initialStatistics),
      subjectSchemes: mergeById(loaded?.subjectSchemes, initialSubjectSchemes),
      affiliations: mergeById(loaded?.affiliations, initialAffiliations),
      attendanceRules: mergeById(loaded?.attendanceRules, initialAttendanceRules),
      placements: mergeById(loaded?.placements, initialPlacements),
      companies: mergeById(loaded?.companies, initialCompanies),
      relationships: mergeById(loaded?.relationships, initialRelationships),
      sourcePages: mergeById(loaded?.sourcePages, initialSourcePages),
      sourceVersions: loaded?.sourceVersions || [],
    };

    // Always persist merged state to ensure file is in sync
    this.saveData(merged);

    return merged;
  }

  private saveData(dataToSave?: DatabaseSchema) {
    const payload = dataToSave || this.data;
    try {
      const tmpFile = `${DB_FILE}.tmp.${Date.now()}`;
      fs.writeFileSync(tmpFile, JSON.stringify(payload, null, 2), 'utf-8');
      fs.renameSync(tmpFile, DB_FILE);
    } catch (err) {
      console.error('Failed to persist database file', err);
    }
  }

  // --- Users ---
  findUserByEmail(email: string) {
    return this.data.users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase().trim()
    );
  }

  findUserById(id: string) {
    return this.data.users.find((u) => u.id === id);
  }

  listUsers(): User[] {
    return this.data.users.map(({ passwordHash, ...user }) => user);
  }

  // --- Institutions & Groups ---
  listGroups(): InstitutionGroup[] {
    return this.data.groups || [];
  }

  getGroupById(id: string): InstitutionGroup | undefined {
    return (this.data.groups || []).find((g) => g.id === id || g.shortName.toLowerCase() === id.toLowerCase());
  }

  listInstitutions(): Institution[] {
    return this.data.institutions;
  }

  getInstitutionById(id: string): Institution | undefined {
    return this.data.institutions.find(
      (i) => i.id === id || i.shortName.toLowerCase() === id.toLowerCase()
    );
  }

  resolveInstitutionAlias(query: string): Institution | undefined {
    const q = query.toLowerCase().trim();
    // Specific well-known checks
    if (q.includes('shri ram commerce') || q.includes('commerce college') || q.includes('shri ram college of commerce')) {
      return this.data.institutions.find((i) => i.id === 'SHRI_RAM_COMMERCE');
    }
    if (q.includes('srist') || q.includes('science and technology') || q.includes('science & technology')) {
      return this.data.institutions.find((i) => i.id === 'SRIST');
    }
    if (q.includes('pharmacy') || q.includes('srip') || q.includes('b.pharm')) {
      return this.data.institutions.find((i) => i.id === 'SRIT_PHARMACY');
    }
    if (q.includes('law') || q.includes('ll.b') || q.includes('llb')) {
      return this.data.institutions.find((i) => i.id === 'SHRI_RAM_LAW');
    }
    if (q.includes('srit') || q.includes('institute of technology') || q.includes('engineering college')) {
      return this.data.institutions.find((i) => i.id === 'SRIT');
    }
    return this.data.institutions.find((i) => {
      const name = i.name.toLowerCase();
      const shortName = i.shortName.toLowerCase();
      return q === shortName || name.includes(q) || q.includes(name);
    });
  }

  // --- Universities ---
  listUniversities(): University[] {
    return this.data.universities || [];
  }

  getUniversityById(id: string): University | undefined {
    return (this.data.universities || []).find((u) => u.id === id || u.shortName.toLowerCase() === id.toLowerCase());
  }

  resolveUniversityAlias(query: string): University | undefined {
    const q = query.toLowerCase().trim();
    if (q.includes('rgpv') || q.includes('proudyogiki') || q.includes('technical university')) {
      return (this.data.universities || []).find((u) => u.id === 'RGPV');
    }
    if (q.includes('rdvv') || q.includes('durgavati') || q.includes('jabalpur university')) {
      return (this.data.universities || []).find((u) => u.id === 'RDVV');
    }
    return undefined;
  }

  // --- Course & Branch Hierarchy ---
  listCoursesHierarchy(institutionId?: string): CourseHierarchy[] {
    let list = this.data.coursesHierarchy || [];
    if (institutionId && institutionId !== 'ALL') {
      list = list.filter((c) => c.institutionId === institutionId);
    }
    return list;
  }

  findCoursesHierarchy(query: string, institutionId?: string): CourseHierarchy[] {
    const q = query.toLowerCase().trim();
    let list = this.listCoursesHierarchy(institutionId);
    if (!q) return list;
    return list.filter(
      (c) =>
        c.courseName.toLowerCase().includes(q) ||
        c.shortName.toLowerCase().includes(q) ||
        c.branches.some((b) => b.toLowerCase().includes(q))
    );
  }

  listBranchesHierarchy(courseId?: string): BranchHierarchy[] {
    let list = this.data.branchesHierarchy || [];
    if (courseId) {
      list = list.filter((b) => b.courseId === courseId);
    }
    return list;
  }

  findBranchesHierarchy(query: string, courseId?: string): BranchHierarchy[] {
    const q = query.toLowerCase().trim();
    let list = this.listBranchesHierarchy(courseId);
    if (!q) return list;
    return list.filter((b) => b.branchName.toLowerCase().includes(q) || b.branchCode.toLowerCase() === q);
  }

  // --- Academic Achievements ---
  listAchievements(institutionId?: string): AcademicAchievement[] {
    let list = this.data.achievements || [];
    if (institutionId && institutionId !== 'ALL') {
      list = list.filter((a) => a.institutionId === institutionId);
    }
    return list;
  }

  findAchievements(query: string, institutionId?: string): AcademicAchievement[] {
    const q = query.toLowerCase().trim();
    let list = this.listAchievements(institutionId);
    if (!q || q.length < 3) return list;
    return list.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q) ||
        a.department.toLowerCase().includes(q) ||
        (a.competition && a.competition.toLowerCase().includes(q)) ||
        (a.award && a.award.toLowerCase().includes(q)) ||
        (a.student && a.student.toLowerCase().includes(q))
    );
  }

  createAchievement(item: Omit<AcademicAchievement, 'id' | 'lastVerified'>, performedBy = 'Admin'): AcademicAchievement {
    const newA: AcademicAchievement = {
      ...item,
      id: `achieve-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      lastVerified: new Date().toISOString().split('T')[0],
      verificationStatus: 'VERIFIED',
    };
    if (!this.data.achievements) this.data.achievements = [];
    this.data.achievements.push(newA);
    this.saveData();

    this.recordAuditLog({
      action: 'CREATE_ACHIEVEMENT',
      entityType: 'AcademicAchievement',
      entityId: newA.id,
      entityTitle: newA.title,
      details: `Added achievement for ${newA.institution} (${newA.department})`,
      performedBy,
    });
    return newA;
  }

  // --- Student Strength ---
  listStudentStrength(institutionId?: string): StudentStrengthRecord[] {
    let list = this.data.studentStrength || [];
    if (institutionId && institutionId !== 'ALL') {
      list = list.filter((s) => s.institutionId === institutionId);
    }
    return list;
  }

  findStudentStrength(query: string, institutionId?: string): StudentStrengthRecord[] {
    const q = query.toLowerCase().trim();
    let list = this.listStudentStrength(institutionId);
    if (!q || q.length < 3) return list;
    return list.filter(
      (s) =>
        s.course.toLowerCase().includes(q) ||
        (s.branch && s.branch.toLowerCase().includes(q)) ||
        s.academicYear.includes(q) ||
        s.institution.toLowerCase().includes(q)
    );
  }

  // --- Admission Information ---
  listAdmissions(institutionId?: string): AdmissionInformation[] {
    let list = this.data.admissions || [];
    if (institutionId && institutionId !== 'ALL') {
      list = list.filter((a) => a.institutionId === institutionId);
    }
    return list;
  }

  findAdmissions(query: string, institutionId?: string): AdmissionInformation[] {
    const q = query.toLowerCase().trim();
    let list = this.listAdmissions(institutionId);
    if (!q || q.length < 3) return list;
    return list.filter(
      (a) =>
        a.course.toLowerCase().includes(q) ||
        (a.branch && a.branch.toLowerCase().includes(q)) ||
        a.admissionType.toLowerCase().includes(q) ||
        a.eligibility.toLowerCase().includes(q) ||
        a.counsellingProcess.toLowerCase().includes(q)
    );
  }

  // --- Fee Structures ---
  listFees(institutionId?: string): FeeStructure[] {
    let list = this.data.feeStructures || [];
    if (institutionId && institutionId !== 'ALL') {
      list = list.filter((f) => f.institutionId === institutionId);
    }
    return list;
  }

  findFees(query: string, institutionId?: string): FeeStructure[] {
    const q = query.toLowerCase().trim();
    let list = this.listFees(institutionId);
    if (!q || q.length < 3) return list;
    return list.filter(
      (f) =>
        f.course.toLowerCase().includes(q) ||
        (f.branch && f.branch.toLowerCase().includes(q)) ||
        f.feeType.toLowerCase().includes(q) ||
        f.totalEstimatedFee.toLowerCase().includes(q)
    );
  }

  // --- Scholarships ---
  listScholarships(institutionId?: string): Scholarship[] {
    let list = this.data.scholarships || [];
    if (institutionId && institutionId !== 'ALL') {
      list = list.filter((s) => s.institutionId === institutionId || s.institutionId === 'SHRI_RAM_GROUP');
    }
    return list;
  }

  findScholarships(query: string, institutionId?: string): Scholarship[] {
    const q = query.toLowerCase().trim();
    let list = this.listScholarships(institutionId);
    if (!q || q.length < 3) return list;
    return list.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.eligibleCategory.toLowerCase().includes(q) ||
        s.eligibility.toLowerCase().includes(q) ||
        s.amount.toLowerCase().includes(q)
    );
  }

  // --- Academic Rules ---
  listAcademicRules(institutionId?: string): AcademicRule[] {
    let list = this.data.academicRules || [];
    if (institutionId && institutionId !== 'ALL') {
      list = list.filter((r) => r.institutionId === institutionId || r.institutionId === 'SRIT');
    }
    return list;
  }

  findAcademicRules(query: string, institutionId?: string): AcademicRule[] {
    const q = query.toLowerCase().trim();
    let list = this.listAcademicRules(institutionId);
    if (!q || q.length < 3) return list;
    return list.filter(
      (r) =>
        r.ruleTitle.toLowerCase().includes(q) ||
        (r.condonation ? r.condonation.toLowerCase().includes(q) : false) ||
        r.shortageOutcome70.toLowerCase().includes(q) ||
        r.below65Outcome.toLowerCase().includes(q)
    );
  }

  // --- Leadership / Persons ---
  listPersons(options?: {
    search?: string;
    role?: string;
    institutionId?: string;
  }): Person[] {
    let list = [...this.data.persons];
    if (options?.institutionId && options.institutionId !== 'ALL') {
      list = list.filter((p) => p.institutionId === options.institutionId);
    }
    if (options?.role && options.role !== 'ALL') {
      list = list.filter(
        (p) =>
          p.role.toLowerCase() === options.role!.toLowerCase() ||
          p.designation.toLowerCase().includes(options.role!.toLowerCase())
      );
    }
    if (options?.search) {
      const q = options.search.toLowerCase();
      list = list.filter(
        (p) =>
          p.fullName.toLowerCase().includes(q) ||
          p.designation.toLowerCase().includes(q) ||
          p.biography.toLowerCase().includes(q) ||
          (p.qualifications && p.qualifications.toLowerCase().includes(q))
      );
    }
    return list;
  }

  getPersonById(id: string): Person | undefined {
    return this.data.persons.find((p) => p.id === id);
  }

  findPersonByNameOrRole(query: string): Person | undefined {
    const q = query.toLowerCase().trim();

    // 0. Karsoliya leadership checks
    if (q.includes('karsoliya') || q.includes('karsolia') || q.includes('karsholiya')) {
      if (q.includes('rajul')) {
        return this.data.persons.find((p) => p.fullName.toLowerCase().includes('rajul'));
      }
      if (q.includes('ramendra')) {
        return this.data.persons.find((p) => p.fullName.toLowerCase().includes('ramendra'));
      }
      if (q.includes('sonam')) {
        return this.data.persons.find((p) => p.fullName.toLowerCase().includes('sonam'));
      }
      // General "who is karsoliya sir?" or "rk karsoliya" -> Founder Chairman Er. R. K. Karsoliya
      const rk = this.data.persons.find(
        (p) => p.fullName.toLowerCase().includes('r. k. karsoliya') || p.role === 'FOUNDER_CHAIRMAN'
      );
      if (rk) return rk;
      return this.data.persons.find((p) => p.fullName.toLowerCase().includes('karsoliya'));
    }

    if (q.includes('rewa shiksha samiti')) {
      if (q.includes('vice chairman')) {
        return this.data.persons.find((p) => p.role === 'VICE_CHAIRMAN');
      }
      return this.data.persons.find((p) => p.role === 'CHAIRMAN_SOCIETY');
    }

    if (q.includes('secretary')) {
      const sec = this.data.persons.find((p) => p.role === 'SECRETARY');
      if (sec) return sec;
    }

    // 1. Direct or normalized name match
    const exact = this.data.persons.find(
      (p) =>
        p.fullName.toLowerCase() === q ||
        q.includes(p.fullName.toLowerCase()) ||
        p.fullName.toLowerCase().replace(/[^a-z]/g, '') === q.replace(/[^a-z]/g, '')
    );
    if (exact) return exact;

    // 2. Specific role / person checks
    if (
      q.includes('founder') ||
      q.includes('founder chairman') ||
      q.includes('owner') ||
      q.includes('who founded') ||
      q.includes('who started the college')
    ) {
      const founder = this.data.persons.find((p) => p.role === 'FOUNDER_CHAIRMAN');
      if (founder) return founder;
    }

    if (
      q.includes('kosta') ||
      q.includes('shiv prasad') ||
      q.includes('group director') ||
      q.includes('director general') ||
      q.includes('space scientist') ||
      q.includes('who is the director') ||
      q.includes('who is director') ||
      (q.includes('director') && !q.includes('principal') && !q.includes('placement')) ||
      q.includes('who heads') ||
      q.includes('head of shri ram group') ||
      q.includes('who runs')
    ) {
      const kosta = this.data.persons.find(
        (p) => p.fullName.toLowerCase().includes('kosta') || p.role === 'GROUP_DIRECTOR'
      );
      if (kosta) return kosta;
    }

    if (
      q.includes('principal') ||
      q.includes('shailesh') ||
      q.includes('gupta') ||
      q.includes('head of srit')
    ) {
      const principal = this.data.persons.find(
        (p) => p.role === 'PRINCIPAL' || p.designation.toLowerCase().includes('principal')
      );
      if (principal) return principal;
    }

    if (
      q.includes('tpo') ||
      q.includes('placement officer') ||
      q.includes('training and placement') ||
      q.includes('head of placement') ||
      q.includes('vivek') ||
      q.includes('rajput')
    ) {
      const tpo = this.data.persons.find(
        (p) => p.role === 'TPO' || p.designation.toLowerCase().includes('tpo')
      );
      if (tpo) return tpo;
    }

    // 3. Substring & token match fallback
    const tokens = q.split(/\s+/).filter((t) => t.length >= 4);
    for (const token of tokens) {
      const match = this.data.persons.find(
        (p) =>
          p.fullName.toLowerCase().includes(token) ||
          p.designation.toLowerCase().includes(token)
      );
      if (match) return match;
    }

    return this.data.persons.find(
      (p) =>
        q.includes(p.fullName.toLowerCase()) ||
        p.fullName.toLowerCase().includes(q)
    );
  }

  findPersons(query: string): Person[] {
    const q = query.toLowerCase().trim();
    const list: Person[] = [];

    // If asking about Karsoliya or Karsoliya team
    if (q.includes('karsoliya') || q.includes('karsolia') || q.includes('karsholiya')) {
      const karsoliyas = this.data.persons.filter((p) =>
        p.fullName.toLowerCase().includes('karsoliya')
      );
      if (karsoliyas.length > 0) return karsoliyas;
    }

    const rk = this.data.persons.find((p) => p.role === 'FOUNDER_CHAIRMAN');
    const kosta = this.data.persons.find((p) => p.fullName.toLowerCase().includes('kosta'));
    const gupta = this.data.persons.find((p) => p.designation.toLowerCase().includes('principal'));
    const tpo = this.data.persons.find((p) => p.role === 'TPO' || p.designation.toLowerCase().includes('tpo'));
    const rajul = this.data.persons.find((p) => p.fullName.toLowerCase().includes('rajul'));
    const ramendra = this.data.persons.find((p) => p.fullName.toLowerCase().includes('ramendra'));
    const sonam = this.data.persons.find((p) => p.fullName.toLowerCase().includes('sonam'));

    if (
      q.includes('founder') ||
      q.includes('owner') ||
      q.includes('owns') ||
      q.includes('who runs') ||
      q.includes('who heads') ||
      q.includes('leadership') ||
      q.includes('administration') ||
      q.includes('directors') ||
      q.includes('team') ||
      q.includes('our team')
    ) {
      if (rk) list.push(rk);
      if (rajul) list.push(rajul);
      if (ramendra) list.push(ramendra);
      if (sonam) list.push(sonam);
      if (kosta) list.push(kosta);
      if (gupta) list.push(gupta);
      if (tpo) list.push(tpo);
      return list;
    }

    const single = this.findPersonByNameOrRole(query);
    if (single) list.push(single);
    return list;
  }

  createPerson(person: Omit<Person, 'id'>, performedBy = 'Admin'): Person {
    const newPerson: Person = {
      ...person,
      id: `person-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      lastVerified: new Date().toISOString().split('T')[0],
    };
    this.data.persons.push(newPerson);
    this.saveData();

    this.recordAuditLog({
      action: 'CREATE_PERSON',
      entityType: 'Person',
      entityId: newPerson.id,
      entityTitle: newPerson.fullName,
      details: `Added ${newPerson.designation} (${newPerson.institution})`,
      performedBy,
    });

    return newPerson;
  }

  updatePerson(id: string, updates: Partial<Person>, performedBy = 'Admin'): Person | null {
    const index = this.data.persons.findIndex((p) => p.id === id);
    if (index === -1) return null;

    const old = this.data.persons[index];
    const updated: Person = {
      ...old,
      ...updates,
      lastVerified: new Date().toISOString().split('T')[0],
    };
    this.data.persons[index] = updated;
    this.saveData();

    this.recordAuditLog({
      action: 'UPDATE_PERSON',
      entityType: 'Person',
      entityId: updated.id,
      entityTitle: updated.fullName,
      details: `Updated leadership profile: ${Object.keys(updates).join(', ')}`,
      performedBy,
    });

    return updated;
  }

  deletePerson(id: string, performedBy = 'Admin'): boolean {
    const index = this.data.persons.findIndex((p) => p.id === id);
    if (index === -1) return false;

    const [deleted] = this.data.persons.splice(index, 1);
    this.saveData();

    this.recordAuditLog({
      action: 'DELETE_PERSON',
      entityType: 'Person',
      entityId: deleted.id,
      entityTitle: deleted.fullName,
      details: `Deleted person ${deleted.fullName}`,
      performedBy,
    });

    return true;
  }

  // --- Faculty Members ---
  listFaculty(options?: {
    search?: string;
    department?: string;
    designation?: string;
    institutionId?: string;
  }): FacultyMember[] {
    let list = [...this.data.faculty];
    if (options?.institutionId && options.institutionId !== 'ALL') {
      list = list.filter((f) => f.institutionId === options.institutionId);
    }
    if (options?.department && options.department !== 'ALL') {
      list = list.filter((f) =>
        f.department.toLowerCase().includes(options.department!.toLowerCase())
      );
    }
    if (options?.designation && options.designation !== 'ALL') {
      list = list.filter((f) =>
        f.designation.toLowerCase().includes(options.designation!.toLowerCase())
      );
    }
    if (options?.search) {
      const q = options.search.toLowerCase();
      list = list.filter(
        (f) =>
          f.fullName.toLowerCase().includes(q) ||
          f.department.toLowerCase().includes(q) ||
          f.qualification.toLowerCase().includes(q) ||
          (f.specialization && f.specialization.toLowerCase().includes(q))
      );
    }
    return list;
  }

  getFacultyById(id: string): FacultyMember | undefined {
    return this.data.faculty.find((f) => f.id === id);
  }

  findFacultyByNameOrDept(query: string): FacultyMember[] {
    const q = query.toLowerCase().trim();
    const cleanTokens = q
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 2);

    const stopWords = new Set([
      'who', 'what', 'which', 'where', 'when', 'does', 'belong', 'teach',
      'teaches', 'teaching', 'tell', 'about', 'the', 'for', 'faculty', 'professor', 'prof',
      'teacher', 'member', 'members', 'department', 'qualification',
      'qualifications', 'designation', 'named', 'and', 'with', 'from',
      'engineering', 'technology', 'institute', 'shri', 'ram', 'srit'
    ]);

    const meaningfulTokens = cleanTokens.filter((t) => !stopWords.has(t));

    const scored = this.data.faculty.map((f) => {
      let score = 0;
      const nameLower = f.fullName.toLowerCase();
      const deptLower = f.department.toLowerCase();
      const qualLower = f.qualification.toLowerCase();
      const desigLower = f.designation.toLowerCase();
      const specLower = (f.specialization || '').toLowerCase();

      // 1. Direct Name Match
      if (q.includes(nameLower)) score += 50;
      for (const token of meaningfulTokens) {
        if (nameLower.includes(token)) score += 30;
      }

      // 2. Department Match
      if (
        (q.includes('cse') || q.includes('computer science')) &&
        (deptLower.includes('computer science') || deptLower.includes('cse'))
      ) score += 20;

      if (
        (q.includes('aiml') || q.includes('artificial intelligence') || q.includes('machine learning')) &&
        deptLower.includes('artificial intelligence')
      ) score += 20;

      if (
        (q.includes('data science') || q.includes('in ds') || q.includes('ds dept') || q.includes('b.tech ds') || q === 'ds') &&
        deptLower.includes('data science')
      ) score += 20;

      if (
        (q.includes('ece') || q.includes('electronics') || q.includes('communication')) &&
        deptLower.includes('electronics')
      ) score += 20;

      if (
        (q.includes('mechanical') || q.includes('mech ') || q.includes('in me') || q.includes('b.tech me') || q.includes('me dept') || q.includes('me branch') || q === 'me') &&
        deptLower.includes('mechanical')
      ) score += 20;

      if (
        (q.includes('civil') || q.includes('in ce') || q.includes('ce dept') || q.includes('b.tech ce') || q === 'ce') &&
        deptLower.includes('civil')
      ) score += 20;

      if (
        (q.includes('electrical') || q.includes('in ee') || q.includes('ee dept') || q.includes('b.tech ee') || q === 'ee') &&
        deptLower.includes('electrical')
      ) score += 20;

      if (
        (q.includes('mathematics') || q.includes('math') || q.includes('maths')) &&
        deptLower.includes('mathematics')
      ) score += 20;

      if (q.includes('physics') && deptLower.includes('physics')) score += 20;
      if (q.includes('chemistry') && deptLower.includes('chemistry')) score += 20;
      if ((q.includes('humanities') || q.includes('english')) && deptLower.includes('humanities')) score += 20;
      if (q.includes('mca') && deptLower.includes('applications')) score += 20;
      if (q.includes('mba') && deptLower.includes('management')) score += 20;

      // 3. Designation / HOD Match
      if (
        (q.includes('hod') || q.includes('head of department') || q.includes('heads the')) &&
        (desigLower.includes('hod') || desigLower.includes('head') || desigLower.includes('lead'))
      ) {
        score += 25;
      }

      if (
        (q.includes('professor') || q.includes('professors')) &&
        desigLower.includes('professor')
      ) {
        score += 5;
      }

      // 4. Qualification Match
      if (
        (q.includes('phd') || q.includes('ph.d') || q.includes('doctorate')) &&
        (qualLower.includes('ph.d') || qualLower.includes('phd'))
      ) {
        score += 15;
      }

      // 5. Specialization match
      for (const token of meaningfulTokens) {
        if (specLower.includes(token)) score += 10;
      }

      return { f, score };
    });

    const matches = scored
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((entry) => entry.f);

    return matches;
  }

  createFaculty(faculty: Omit<FacultyMember, 'id'>, performedBy = 'Admin'): FacultyMember {
    const newFac: FacultyMember = {
      ...faculty,
      id: `fac-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      lastVerified: new Date().toISOString().split('T')[0],
    };
    this.data.faculty.push(newFac);
    this.saveData();

    this.recordAuditLog({
      action: 'CREATE_FACULTY',
      entityType: 'FacultyMember',
      entityId: newFac.id,
      entityTitle: newFac.fullName,
      details: `Added faculty member in ${newFac.department} (${newFac.designation})`,
      performedBy,
    });

    return newFac;
  }

  updateFaculty(id: string, updates: Partial<FacultyMember>, performedBy = 'Admin'): FacultyMember | null {
    const index = this.data.faculty.findIndex((f) => f.id === id);
    if (index === -1) return null;

    const old = this.data.faculty[index];
    const updated: FacultyMember = {
      ...old,
      ...updates,
      lastVerified: new Date().toISOString().split('T')[0],
    };
    this.data.faculty[index] = updated;
    this.saveData();

    this.recordAuditLog({
      action: 'UPDATE_FACULTY',
      entityType: 'FacultyMember',
      entityId: updated.id,
      entityTitle: updated.fullName,
      details: `Updated faculty record: ${Object.keys(updates).join(', ')}`,
      performedBy,
    });

    return updated;
  }

  deleteFaculty(id: string, performedBy = 'Admin'): boolean {
    const index = this.data.faculty.findIndex((f) => f.id === id);
    if (index === -1) return false;

    const [deleted] = this.data.faculty.splice(index, 1);
    this.saveData();

    this.recordAuditLog({
      action: 'DELETE_FACULTY',
      entityType: 'FacultyMember',
      entityId: deleted.id,
      entityTitle: deleted.fullName,
      details: `Deleted faculty ${deleted.fullName}`,
      performedBy,
    });

    return true;
  }

  // --- Departments ---
  listDepartments(options?: { search?: string; institutionId?: string }): Department[] {
    let list = [...this.data.departments];
    if (options?.institutionId && options.institutionId !== 'ALL') {
      list = list.filter((d) => d.institutionId === options.institutionId);
    }
    if (options?.search) {
      const q = options.search.toLowerCase();
      list = list.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.abbreviation.toLowerCase().includes(q) ||
          d.description.toLowerCase().includes(q) ||
          (d.HOD && d.HOD.toLowerCase().includes(q))
      );
    }
    return list;
  }

  getDepartmentById(id: string): Department | undefined {
    return this.data.departments.find((d) => d.id === id);
  }

  findDepartmentByNameOrHod(query: string): Department[] {
    const q = query.toLowerCase().trim();
    return this.data.departments.filter((d) => {
      const name = d.name.toLowerCase();
      const abbr = d.abbreviation.toLowerCase();
      const hod = (d.HOD || '').toLowerCase();
      return (
        name.includes(q) ||
        q.includes(name) ||
        abbr === q ||
        q.includes(` ${abbr} `) ||
        q.startsWith(`${abbr} `) ||
        q.endsWith(` ${abbr}`) ||
        (q.includes('cse') && abbr === 'cse') ||
        (q.includes('aiml') && abbr === 'aiml') ||
        (q.includes('data science') && abbr === 'ds') ||
        (q.includes('ece') && abbr === 'ece') ||
        (q.includes('mechanical') && abbr === 'me') ||
        (q.includes('civil') && abbr === 'ce') ||
        (q.includes('electrical') && abbr === 'ee') ||
        (q.includes('math') && abbr === 'math') ||
        (q.includes('physics') && abbr === 'physics') ||
        (q.includes('chemistry') && abbr === 'chem') ||
        (q.includes('humanities') && abbr === 'hum') ||
        (q.includes('mca') && abbr === 'mca') ||
        (q.includes('mba') && abbr === 'mba') ||
        (hod && q.includes(hod.toLowerCase()))
      );
    });
  }

  createDepartment(dept: Omit<Department, 'id'>, performedBy = 'Admin'): Department {
    const newDept: Department = {
      ...dept,
      id: `dept-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      lastVerified: new Date().toISOString().split('T')[0],
    };
    this.data.departments.push(newDept);
    this.saveData();
    return newDept;
  }

  updateDepartment(id: string, updates: Partial<Department>, performedBy = 'Admin'): Department | null {
    const index = this.data.departments.findIndex((d) => d.id === id);
    if (index === -1) return null;
    this.data.departments[index] = {
      ...this.data.departments[index],
      ...updates,
      lastVerified: new Date().toISOString().split('T')[0],
    };
    this.saveData();
    return this.data.departments[index];
  }

  deleteDepartment(id: string, performedBy = 'Admin'): boolean {
    const index = this.data.departments.findIndex((d) => d.id === id);
    if (index === -1) return false;
    this.data.departments.splice(index, 1);
    this.saveData();
    return true;
  }

  // --- Courses ---
  listCourses(options?: {
    search?: string;
    department?: string;
    level?: string;
    institutionId?: string;
  }): Course[] {
    let list = [...this.data.courses];
    if (options?.institutionId && options.institutionId !== 'ALL') {
      list = list.filter((c) => c.institutionId === options.institutionId);
    }
    if (options?.department && options.department !== 'ALL') {
      list = list.filter((c) =>
        c.department.toLowerCase().includes(options.department!.toLowerCase())
      );
    }
    if (options?.level && options.level !== 'ALL') {
      list = list.filter((c) => c.level === options.level);
    }
    if (options?.search) {
      const q = options.search.toLowerCase();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.department.toLowerCase().includes(q) ||
          c.eligibility.toLowerCase().includes(q)
      );
    }
    return list;
  }

  getCourseById(id: string): Course | undefined {
    return this.data.courses.find((c) => c.id === id);
  }

  createCourse(course: Omit<Course, 'id'>, performedBy = 'Admin'): Course {
    const newCourse: Course = {
      ...course,
      id: `course-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      lastVerified: new Date().toISOString().split('T')[0],
    };
    this.data.courses.push(newCourse);
    this.saveData();
    return newCourse;
  }

  updateCourse(id: string, updates: Partial<Course>, performedBy = 'Admin'): Course | null {
    const index = this.data.courses.findIndex((c) => c.id === id);
    if (index === -1) return null;
    this.data.courses[index] = {
      ...this.data.courses[index],
      ...updates,
      lastVerified: new Date().toISOString().split('T')[0],
    };
    this.saveData();
    return this.data.courses[index];
  }

  deleteCourse(id: string, performedBy = 'Admin'): boolean {
    const index = this.data.courses.findIndex((c) => c.id === id);
    if (index === -1) return false;
    this.data.courses.splice(index, 1);
    this.saveData();
    return true;
  }

  // --- Institutional Statistics ---
  listStatistics(options?: {
    category?: string;
    academicYear?: string;
    institutionId?: string;
  }): InstitutionalStatistic[] {
    let list = [...this.data.statistics];
    if (options?.institutionId && options.institutionId !== 'ALL') {
      list = list.filter((s) => s.institutionId === options.institutionId);
    }
    if (options?.category && options.category !== 'ALL') {
      list = list.filter((s) => s.category === options.category);
    }
    if (options?.academicYear && options.academicYear !== 'ALL') {
      list = list.filter((s) => s.academicYear === options.academicYear);
    }
    return list;
  }

  getStatisticById(id: string): InstitutionalStatistic | undefined {
    return this.data.statistics.find((s) => s.id === id);
  }

  createStatistic(
    stat: Omit<InstitutionalStatistic, 'id'>,
    performedBy = 'Admin'
  ): InstitutionalStatistic {
    const newStat: InstitutionalStatistic = {
      ...stat,
      id: `stat-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      lastVerified: new Date().toISOString().split('T')[0],
    };
    this.data.statistics.push(newStat);
    this.saveData();

    this.recordAuditLog({
      action: 'CREATE_STATISTIC',
      entityType: 'InstitutionalStatistic',
      entityId: newStat.id,
      entityTitle: newStat.statisticName,
      details: `Added ${newStat.statisticName}: ${newStat.value} (${newStat.institution})`,
      performedBy,
    });

    return newStat;
  }

  updateStatistic(
    id: string,
    updates: Partial<InstitutionalStatistic>,
    performedBy = 'Admin'
  ): InstitutionalStatistic | null {
    const index = this.data.statistics.findIndex((s) => s.id === id);
    if (index === -1) return null;
    this.data.statistics[index] = {
      ...this.data.statistics[index],
      ...updates,
      lastVerified: new Date().toISOString().split('T')[0],
    };
    this.saveData();
    return this.data.statistics[index];
  }

  deleteStatistic(id: string, performedBy = 'Admin'): boolean {
    const index = this.data.statistics.findIndex((s) => s.id === id);
    if (index === -1) return false;
    this.data.statistics.splice(index, 1);
    this.saveData();
    return true;
  }

  // --- Subject Schemes (RGPV & RDVV) ---
  listSubjectSchemes(options?: {
    branch?: string;
    semester?: number;
    year?: number;
    course?: string;
    search?: string;
  }): SubjectScheme[] {
    let list = [...this.data.subjectSchemes];
    if (options?.branch && options.branch !== 'ALL') {
      list = list.filter((s) => s.branch.toLowerCase().includes(options.branch!.toLowerCase()));
    }
    if (options?.semester) {
      list = list.filter((s) => s.semester === Number(options.semester));
    }
    if (options?.year) {
      list = list.filter((s) => s.year === Number(options.year));
    }
    if (options?.course && options.course !== 'ALL') {
      list = list.filter((s) => s.course.toLowerCase().includes(options.course!.toLowerCase()));
    }
    if (options?.search) {
      const q = options.search.toLowerCase();
      list = list.filter(
        (s) =>
          s.subjectCode.toLowerCase().includes(q) ||
          s.subjectName.toLowerCase().includes(q) ||
          s.branch.toLowerCase().includes(q) ||
          s.syllabusOverview.toLowerCase().includes(q)
      );
    }
    return list;
  }

  getSubjectSchemeById(id: string): SubjectScheme | undefined {
    return this.data.subjectSchemes.find((s) => s.id === id);
  }

  findSubjectSchemes(query: string): SubjectScheme[] {
    const q = query.toLowerCase().trim();
    let sem: number | undefined;
    if (q.includes('1st sem') || q.includes('first sem') || q.includes('semester 1') || q.includes('sem 1')) sem = 1;
    else if (q.includes('2nd sem') || q.includes('second sem') || q.includes('semester 2') || q.includes('sem 2')) sem = 2;
    else if (q.includes('3rd sem') || q.includes('third sem') || q.includes('semester 3') || q.includes('sem 3')) sem = 3;
    else if (q.includes('4th sem') || q.includes('fourth sem') || q.includes('semester 4') || q.includes('sem 4')) sem = 4;
    else if (q.includes('5th sem') || q.includes('fifth sem') || q.includes('semester 5') || q.includes('sem 5')) sem = 5;

    let yr: number | undefined;
    if (q.includes('1st year') || q.includes('first year') || q.includes('year 1')) yr = 1;
    else if (q.includes('2nd year') || q.includes('second year') || q.includes('year 2')) yr = 2;
    else if (q.includes('3rd year') || q.includes('third year') || q.includes('year 3')) yr = 3;

    let branch: string | undefined;
    if (q.includes('cse') || q.includes('computer science')) branch = 'CSE';
    else if (q.includes('aiml') || q.includes('artificial intelligence')) branch = 'AI/ML';
    else if (q.includes('data science') || q.includes('in ds')) branch = 'DS';

    let results = this.data.subjectSchemes.filter((s) => {
      // Semester match
      if (sem && s.semester !== sem) return false;
      // Year match
      if (yr && s.year !== yr) return false;
      // Branch match
      if (branch && !s.branch.toUpperCase().includes(branch) && !s.branch.includes('Common')) return false;

      // Subject code or name match (require >= 3 characters or valid branch abbreviation to avoid false positives on greetings)
      if (q.length >= 3 || ['cs', 'it', 'me', 'ce', 'ec', 'ee', 'al', 'ds'].includes(q)) {
        if (
          s.subjectCode.toLowerCase() === q ||
          s.subjectCode.toLowerCase().includes(q) ||
          q.includes(s.subjectCode.toLowerCase()) ||
          s.subjectName.toLowerCase().includes(q) ||
          q.includes(s.subjectName.toLowerCase())
        ) {
          return true;
        }
      }

      // Keywords match
      if (
        q.includes('discrete') && s.subjectName.toLowerCase().includes('discrete') ||
        q.includes('data structure') && s.subjectName.toLowerCase().includes('data structure') ||
        q.includes('digital system') && s.subjectName.toLowerCase().includes('digital system') ||
        q.includes('energy') && s.subjectName.toLowerCase().includes('energy') ||
        q.includes('oop') && s.subjectName.toLowerCase().includes('object oriented') ||
        q.includes('python') && s.subjectName.toLowerCase().includes('python') ||
        q.includes('physics') && s.subjectName.toLowerCase().includes('physics') ||
        q.includes('chemistry') && s.subjectName.toLowerCase().includes('chemistry') ||
        q.includes('math') && s.subjectName.toLowerCase().includes('math') ||
        q.includes('graphics') && s.subjectName.toLowerCase().includes('graphics') ||
        q.includes('electrical') && s.subjectName.toLowerCase().includes('electrical') ||
        q.includes('civil') && s.subjectName.toLowerCase().includes('civil') ||
        q.includes('mechanical') && s.subjectName.toLowerCase().includes('mechanical')
      ) {
        return true;
      }

      // If branch or semester was specified and no specific subject filter
      if ((sem || yr) && (branch || s.branch.includes('Common First Year'))) {
        return true;
      }

      return false;
    });

    if (results.length === 0 && (q.includes('subject') || q.includes('syllabus') || q.includes('scheme'))) {
      if (q.includes('first year') || q.includes('1st year')) {
        results = this.data.subjectSchemes.filter((s) => s.year === 1);
      } else if (q.includes('3rd') || q.includes('third')) {
        results = this.data.subjectSchemes.filter((s) => s.semester === 3);
      }
    }

    return results;
  }

  createSubjectScheme(scheme: Omit<SubjectScheme, 'id'>, performedBy = 'Admin'): SubjectScheme {
    const newScheme: SubjectScheme = {
      ...scheme,
      id: `scheme-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      lastVerified: new Date().toISOString().split('T')[0],
    };
    this.data.subjectSchemes.push(newScheme);
    this.saveData();

    this.recordAuditLog({
      action: 'CREATE_SUBJECT_SCHEME',
      entityType: 'SubjectScheme',
      entityId: newScheme.id,
      entityTitle: `${newScheme.subjectCode}: ${newScheme.subjectName}`,
      details: `Added ${newScheme.subjectCode} to ${newScheme.branch} Sem ${newScheme.semester}`,
      performedBy,
    });

    return newScheme;
  }

  updateSubjectScheme(id: string, updates: Partial<SubjectScheme>, performedBy = 'Admin'): SubjectScheme | null {
    const index = this.data.subjectSchemes.findIndex((s) => s.id === id);
    if (index === -1) return null;
    this.data.subjectSchemes[index] = {
      ...this.data.subjectSchemes[index],
      ...updates,
      lastVerified: new Date().toISOString().split('T')[0],
    };
    this.saveData();
    return this.data.subjectSchemes[index];
  }

  deleteSubjectScheme(id: string, performedBy = 'Admin'): boolean {
    const index = this.data.subjectSchemes.findIndex((s) => s.id === id);
    if (index === -1) return false;
    this.data.subjectSchemes.splice(index, 1);
    this.saveData();
    return true;
  }

  // --- Affiliation Intelligence ---
  listAffiliations(options?: {
    institutionId?: string;
    university?: string;
    search?: string;
  }): AffiliationRecord[] {
    let list = [...this.data.affiliations];
    if (options?.institutionId && options.institutionId !== 'ALL') {
      list = list.filter((a) => a.institutionId === options.institutionId);
    }
    if (options?.university && options.university !== 'ALL') {
      list = list.filter((a) => a.university.toLowerCase().includes(options.university!.toLowerCase()));
    }
    if (options?.search) {
      const q = options.search.toLowerCase();
      list = list.filter(
        (a) =>
          a.institution.toLowerCase().includes(q) ||
          a.program.toLowerCase().includes(q) ||
          a.university.toLowerCase().includes(q) ||
          a.notes.toLowerCase().includes(q)
      );
    }
    return list;
  }

  getAffiliationById(id: string): AffiliationRecord | undefined {
    return this.data.affiliations.find((a) => a.id === id);
  }

  findAffiliations(query: string): AffiliationRecord[] {
    const q = query.toLowerCase().trim();
    return this.data.affiliations.filter((a) => {
      const instLower = a.institution.toLowerCase();
      const progLower = a.program.toLowerCase();
      const uniLower = a.university.toLowerCase();
      const notesLower = a.notes.toLowerCase();

      if (
        (q.includes('srit') || q.includes('b.tech') || q.includes('engineering') || q.includes('m.tech')) &&
        (a.institutionId === 'SRIT' || progLower.includes('b.tech'))
      ) return true;

      if (
        (q.includes('commerce') || q.includes('b.com') || q.includes('bcom') || q.includes('bba') || q.includes('bca') || q.includes('shri ram college')) &&
        (a.institutionId === 'SHRI_RAM_COMMERCE' || progLower.includes('b.com') || progLower.includes('bca'))
      ) return true;

      if (
        (q.includes('law') || q.includes('ll.b') || q.includes('llb')) &&
        (a.institutionId === 'SHRI_RAM_LAW' || progLower.includes('law'))
      ) return true;

      if (
        (q.includes('pharmacy') || q.includes('pharma') || q.includes('b.pharm')) &&
        (a.institutionId === 'SRIT_PHARMACY' || progLower.includes('pharm'))
      ) return true;

      if (
        (q.includes('rgpv') && uniLower.includes('rgpv')) ||
        (q.includes('rdvv') && uniLower.includes('rdvv'))
      ) return true;

      return (
        instLower.includes(q) ||
        q.includes(instLower) ||
        progLower.includes(q) ||
        q.includes(progLower) ||
        notesLower.includes(q)
      );
    });
  }

  createAffiliation(aff: Omit<AffiliationRecord, 'id'>, performedBy = 'Admin'): AffiliationRecord {
    const newAff: AffiliationRecord = {
      ...aff,
      id: `aff-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      lastVerified: new Date().toISOString().split('T')[0],
    };
    this.data.affiliations.push(newAff);
    this.saveData();

    this.recordAuditLog({
      action: 'CREATE_AFFILIATION',
      entityType: 'AffiliationRecord',
      entityId: newAff.id,
      entityTitle: `${newAff.institution} -> ${newAff.university}`,
      details: `Added affiliation rule for ${newAff.program}`,
      performedBy,
    });

    return newAff;
  }

  updateAffiliation(id: string, updates: Partial<AffiliationRecord>, performedBy = 'Admin'): AffiliationRecord | null {
    const index = this.data.affiliations.findIndex((a) => a.id === id);
    if (index === -1) return null;
    this.data.affiliations[index] = {
      ...this.data.affiliations[index],
      ...updates,
      lastVerified: new Date().toISOString().split('T')[0],
    };
    this.saveData();
    return this.data.affiliations[index];
  }

  deleteAffiliation(id: string, performedBy = 'Admin'): boolean {
    const index = this.data.affiliations.findIndex((a) => a.id === id);
    if (index === -1) return false;
    this.data.affiliations.splice(index, 1);
    this.saveData();
    return true;
  }

  // --- Attendance Rules Intelligence ---
  listAttendanceRules(): AttendanceRule[] {
    return this.data.attendanceRules;
  }

  getAttendanceRuleById(id: string): AttendanceRule | undefined {
    return this.data.attendanceRules.find((a) => a.id === id);
  }

  findAttendanceRules(query: string): AttendanceRule[] {
    const q = query.toLowerCase().trim();
    if (
      q.includes('attendance') ||
      q.includes('condone') ||
      q.includes('condoned') ||
      q.includes('condonation') ||
      q.includes('75%') ||
      q.includes('70%') ||
      q.includes('65%') ||
      q.includes('detained') ||
      q.includes('medical') ||
      q.includes('shortage')
    ) {
      return this.data.attendanceRules;
    }
    return this.data.attendanceRules.filter(
      (a) =>
        a.ruleTitle.toLowerCase().includes(q) ||
        (a.applicableCourse ? a.applicableCourse.toLowerCase().includes(q) : false) ||
        a.medicalPolicy.toLowerCase().includes(q) ||
        a.shortageOutcome70.toLowerCase().includes(q)
    );
  }

  createAttendanceRule(rule: Omit<AttendanceRule, 'id'>, performedBy = 'Admin'): AttendanceRule {
    const newRule: AttendanceRule = {
      ...rule,
      id: `att-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      lastVerified: new Date().toISOString().split('T')[0],
    };
    this.data.attendanceRules.push(newRule);
    this.saveData();
    return newRule;
  }

  updateAttendanceRule(id: string, updates: Partial<AttendanceRule>, performedBy = 'Admin'): AttendanceRule | null {
    const index = this.data.attendanceRules.findIndex((a) => a.id === id);
    if (index === -1) return null;
    this.data.attendanceRules[index] = {
      ...this.data.attendanceRules[index],
      ...updates,
      lastVerified: new Date().toISOString().split('T')[0],
    };
    this.saveData();
    return this.data.attendanceRules[index];
  }

  // --- Placement Intelligence ---
  listPlacements(): PlacementRecord[] {
    return this.data.placements.sort((a, b) => b.graduationYear - a.graduationYear);
  }

  getPlacementById(id: string): PlacementRecord | undefined {
    return this.data.placements.find((p) => p.id === id);
  }

  findPlacements(query: string): PlacementRecord[] {
    const q = query.toLowerCase().trim();
    if (
      q.includes('placement') ||
      q.includes('package') ||
      q.includes('highest package') ||
      q.includes('average package') ||
      q.includes('salary') ||
      q.includes('recruiter') ||
      q.includes('recruiters') ||
      q.includes('placed') ||
      q.includes('companies') ||
      q.includes('recruitment')
    ) {
      if (q.includes('2024') || q.includes('last year')) {
        const p24 = this.data.placements.find((p) => p.academicYear.includes('2024'));
        if (p24) return [p24];
      }
      return this.data.placements;
    }
    return this.data.placements.filter(
      (p) =>
        p.academicYear.toLowerCase().includes(q) ||
        (p.topCompanies ? p.topCompanies.some((c) => c.toLowerCase().includes(q)) : false) ||
        p.highestPackage.toLowerCase().includes(q)
    );
  }

  createPlacement(p: Omit<PlacementRecord, 'id'>, performedBy = 'Admin'): PlacementRecord {
    const newP: PlacementRecord = {
      ...p,
      id: `placement-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      lastVerified: new Date().toISOString().split('T')[0],
    };
    this.data.placements.push(newP);
    this.saveData();
    return newP;
  }

  updatePlacement(id: string, updates: Partial<PlacementRecord>, performedBy = 'Admin'): PlacementRecord | null {
    const index = this.data.placements.findIndex((p) => p.id === id);
    if (index === -1) return null;
    this.data.placements[index] = {
      ...this.data.placements[index],
      ...updates,
      lastVerified: new Date().toISOString().split('T')[0],
    };
    this.saveData();
    return this.data.placements[index];
  }

  // --- Companies ---
  listCompanies(): Company[] {
    return this.data.companies;
  }

  findCompanies(query: string): Company[] {
    const q = query.toLowerCase().trim();
    return this.data.companies.filter(
      (c) => {
        const cName = (c.name || c.companyName || '').toLowerCase();
        const matchesName = cName.includes(q) || (cName.length > 0 && q.includes(cName));
        const matchesBranches = c.hiringBranches ? c.hiringBranches.some((b) => b.toLowerCase().includes(q) || q.includes(b.toLowerCase())) : false;
        return matchesName || matchesBranches;
      }
    );
  }

  createCompany(c: Omit<Company, 'id'>): Company {
    const newC: Company = {
      ...c,
      id: `comp-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    };
    this.data.companies.push(newC);
    this.saveData();
    return newC;
  }

  // --- Knowledge Relationships (Graph) ---
  listRelationships(): KnowledgeRelationship[] {
    return this.data.relationships;
  }

  findRelationships(entityId: string): KnowledgeRelationship[] {
    return this.data.relationships.filter(
      (r) => r.fromEntityId === entityId || r.toEntityId === entityId
    );
  }

  createRelationship(rel: Omit<KnowledgeRelationship, 'id'>): KnowledgeRelationship {
    const newRel: KnowledgeRelationship = {
      ...rel,
      id: `rel-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    };
    this.data.relationships.push(newRel);
    this.saveData();
    return newRel;
  }

  // --- Source Pages & Versioning ---
  listSourcePages(): SourcePageRecord[] {
    return this.data.sourcePages;
  }

  getSourcePageByUrl(url: string): SourcePageRecord | undefined {
    return this.data.sourcePages.find((s) => s.url === url);
  }

  upsertSourcePage(page: Partial<SourcePageRecord> & { url: string }): SourcePageRecord {
    const index = this.data.sourcePages.findIndex((s) => s.url === page.url);
    if (index >= 0) {
      this.data.sourcePages[index] = {
        ...this.data.sourcePages[index],
        ...page,
        retrievedTimestamp: new Date().toISOString(),
      };
      this.saveData();
      return this.data.sourcePages[index];
    } else {
      const newPage: SourcePageRecord = {
        id: `src-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        url: page.url,
        pageTitle: page.pageTitle || 'Official College Page',
        sourceWebsite: page.sourceWebsite || 'sritgroup.net',
        sourceType: page.sourceType || 'Official Website',
        retrievedTimestamp: new Date().toISOString(),
        contentHash: page.contentHash || 'init-hash',
        versionNumber: page.versionNumber || 1,
        academicYear: page.academicYear || '2026-27',
        institution: page.institution || 'Shri Ram Group',
        institutionScope: page.institutionScope || 'SHRI_RAM_GROUP',
        sourceReliability: page.sourceReliability || 'Official college/institution website',
        verificationStatus: page.verificationStatus || 'Verified',
      };
      this.data.sourcePages.push(newPage);
      this.saveData();
      return newPage;
    }
  }

  listSourceVersions(sourceId?: string): SourceVersion[] {
    if (sourceId) {
      return this.data.sourceVersions.filter((v) => v.sourceId === sourceId);
    }
    return this.data.sourceVersions;
  }

  addSourceVersion(version: Omit<SourceVersion, 'id' | 'createdAt'>): SourceVersion {
    const newVersion: SourceVersion = {
      ...version,
      id: `sv-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      createdAt: new Date().toISOString(),
    };
    this.data.sourceVersions.unshift(newVersion);
    this.saveData();
    return newVersion;
  }

  // --- Knowledge Health System ---
  getKnowledgeHealth(): KnowledgeHealthItem[] {
    const items: KnowledgeHealthItem[] = [
      {
        domain: 'Leadership',
        totalRecords: this.data.persons.length,
        verifiedCount: this.data.persons.filter((p) => p.status === 'Verified').length,
        needsReviewCount: this.data.persons.filter((p) => p.status === 'Needs Review').length,
        outdatedCount: 0,
        missingCount: 0,
        conflictingCount: 0,
        healthStatus: 'HEALTHY',
      },
      {
        domain: 'Faculty',
        totalRecords: this.data.faculty.length,
        verifiedCount: this.data.faculty.filter((f) => f.status === 'Verified').length,
        needsReviewCount: this.data.faculty.filter((f) => f.status !== 'Verified').length,
        outdatedCount: 0,
        missingCount: 0,
        conflictingCount: 0,
        healthStatus: 'HEALTHY',
      },
      {
        domain: 'Departments',
        totalRecords: this.data.departments.length,
        verifiedCount: this.data.departments.length,
        needsReviewCount: 0,
        outdatedCount: 0,
        missingCount: 0,
        conflictingCount: 0,
        healthStatus: 'HEALTHY',
      },
      {
        domain: 'Courses',
        totalRecords: this.data.courses.length,
        verifiedCount: this.data.courses.length,
        needsReviewCount: 0,
        outdatedCount: 0,
        missingCount: 0,
        conflictingCount: 0,
        healthStatus: 'HEALTHY',
      },
      {
        domain: 'RGPV Schemes & Subjects',
        totalRecords: this.data.subjectSchemes.length,
        verifiedCount: this.data.subjectSchemes.length,
        needsReviewCount: 0,
        outdatedCount: 0,
        missingCount: 0,
        conflictingCount: 0,
        healthStatus: 'HEALTHY',
      },
      {
        domain: 'Affiliations (RGPV & RDVV)',
        totalRecords: this.data.affiliations.length,
        verifiedCount: this.data.affiliations.length,
        needsReviewCount: 0,
        outdatedCount: 0,
        missingCount: 0,
        conflictingCount: 0,
        healthStatus: 'HEALTHY',
      },
      {
        domain: 'Attendance Rules',
        totalRecords: this.data.attendanceRules.length,
        verifiedCount: this.data.attendanceRules.length,
        needsReviewCount: 0,
        outdatedCount: 0,
        missingCount: 0,
        conflictingCount: 0,
        healthStatus: 'HEALTHY',
      },
      {
        domain: 'Placements',
        totalRecords: this.data.placements.length,
        verifiedCount: this.data.placements.length,
        needsReviewCount: 0,
        outdatedCount: 0,
        missingCount: 0,
        conflictingCount: 0,
        healthStatus: 'HEALTHY',
      },
      {
        domain: 'Companies',
        totalRecords: this.data.companies.length,
        verifiedCount: this.data.companies.length,
        needsReviewCount: 0,
        outdatedCount: 0,
        missingCount: 0,
        conflictingCount: 0,
        healthStatus: 'HEALTHY',
      },
      {
        domain: 'Events & Fests',
        totalRecords: this.data.events.length,
        verifiedCount: this.data.events.filter((e) => e.status === 'Published').length,
        needsReviewCount: this.data.events.filter((e) => e.status === 'Draft').length,
        outdatedCount: this.data.events.filter((e) => e.status === 'Completed').length,
        missingCount: 0,
        conflictingCount: 0,
        healthStatus: 'HEALTHY',
      },
      {
        domain: 'Clubs',
        totalRecords: this.data.clubs.length,
        verifiedCount: this.data.clubs.filter((c) => c.published).length,
        needsReviewCount: 0,
        outdatedCount: 0,
        missingCount: 0,
        conflictingCount: 0,
        healthStatus: 'HEALTHY',
      },
      {
        domain: 'Facilities & Campus',
        totalRecords: this.data.knowledge.filter((k) => k.category === 'Facilities').length,
        verifiedCount: this.data.knowledge.filter((k) => k.category === 'Facilities' && k.published).length,
        needsReviewCount: 0,
        outdatedCount: 0,
        missingCount: 0,
        conflictingCount: 0,
        healthStatus: 'HEALTHY',
      },
      {
        domain: 'Admissions & Eligibility',
        totalRecords: this.data.courses.length,
        verifiedCount: this.data.courses.length,
        needsReviewCount: 0,
        outdatedCount: 0,
        missingCount: 0,
        conflictingCount: 0,
        healthStatus: 'HEALTHY',
      },
      {
        domain: 'Scholarships & Concessions',
        totalRecords: this.data.knowledge.filter((k) => k.title.toLowerCase().includes('scholarship')).length,
        verifiedCount: this.data.knowledge.filter((k) => k.title.toLowerCase().includes('scholarship')).length,
        needsReviewCount: 1,
        outdatedCount: 0,
        missingCount: 0,
        conflictingCount: 0,
        healthStatus: 'NEEDS_ATTENTION',
      },
      {
        domain: 'Notices & Circulars',
        totalRecords: this.data.documents.length,
        verifiedCount: this.data.documents.filter((d) => d.status === 'Indexed').length,
        needsReviewCount: this.data.documents.filter((d) => d.status === 'Pending').length,
        outdatedCount: 0,
        missingCount: 0,
        conflictingCount: 0,
        healthStatus: 'HEALTHY',
      },
      {
        domain: 'Academic Calendar',
        totalRecords: 2,
        verifiedCount: 2,
        needsReviewCount: 0,
        outdatedCount: 0,
        missingCount: 0,
        conflictingCount: 0,
        healthStatus: 'HEALTHY',
      },
    ];
    return items;
  }

  // --- Knowledge Items ---
  listKnowledge(options?: {
    search?: string;
    category?: string;
    status?: string;
    publishedOnly?: boolean;
  }): KnowledgeItem[] {
    let list = [...this.data.knowledge];

    if (options?.publishedOnly) {
      list = list.filter((k) => k.published && k.status === 'Published');
    }
    if (options?.category && options.category !== 'All') {
      list = list.filter(
        (k) => k.category.toLowerCase() === options.category!.toLowerCase()
      );
    }
    if (options?.status && options.status !== 'All') {
      list = list.filter((k) => k.status === options.status);
    }
    if (options?.search) {
      const q = options.search.toLowerCase();
      list = list.filter(
        (k) =>
          k.title.toLowerCase().includes(q) ||
          k.content.toLowerCase().includes(q) ||
          (k.subcategory && k.subcategory.toLowerCase().includes(q))
      );
    }

    return list.sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }

  getKnowledgeById(id: string): KnowledgeItem | undefined {
    return this.data.knowledge.find((k) => k.id === id);
  }

  createKnowledge(
    item: Omit<KnowledgeItem, 'id' | 'createdAt' | 'updatedAt'>
  ): KnowledgeItem {
    const now = new Date().toISOString();
    const newItem: KnowledgeItem = {
      ...item,
      id: `k-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      createdAt: now,
      updatedAt: now,
    };
    this.data.knowledge.unshift(newItem);
    this.saveData();

    this.recordAuditLog({
      action: 'CREATE_KNOWLEDGE',
      entityType: 'KnowledgeItem',
      entityId: newItem.id,
      entityTitle: newItem.title,
      details: `Created knowledge item in ${newItem.category}`,
      performedBy: newItem.createdBy || 'Admin',
    });

    return newItem;
  }

  updateKnowledge(
    id: string,
    updates: Partial<KnowledgeItem>,
    updatedBy: string = 'Admin'
  ): KnowledgeItem | null {
    const index = this.data.knowledge.findIndex((k) => k.id === id);
    if (index === -1) return null;

    const old = this.data.knowledge[index];
    const updated: KnowledgeItem = {
      ...old,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.data.knowledge[index] = updated;
    this.saveData();

    this.recordAuditLog({
      action: 'UPDATE_KNOWLEDGE',
      entityType: 'KnowledgeItem',
      entityId: updated.id,
      entityTitle: updated.title,
      details: `Updated fields: ${Object.keys(updates).join(', ')}`,
      performedBy: updatedBy,
    });

    return updated;
  }

  deleteKnowledge(id: string, performedBy: string = 'Admin'): boolean {
    const index = this.data.knowledge.findIndex((k) => k.id === id);
    if (index === -1) return false;

    const [deleted] = this.data.knowledge.splice(index, 1);
    this.saveData();

    this.recordAuditLog({
      action: 'DELETE_KNOWLEDGE',
      entityType: 'KnowledgeItem',
      entityId: deleted.id,
      entityTitle: deleted.title,
      details: `Deleted knowledge item from ${deleted.category}`,
      performedBy,
    });

    return true;
  }

  // --- Events ---
  listEvents(options?: {
    search?: string;
    eventType?: string;
    status?: string;
    publishedOnly?: boolean;
    filterDate?: 'upcoming' | 'past' | 'month' | 'week' | 'all';
    targetMonth?: number;
    targetYear?: number;
  }): CollegeEvent[] {
    let list = [...this.data.events];

    if (options?.publishedOnly) {
      list = list.filter((e) => e.status === 'Published' || e.status === 'Upcoming');
    }
    if (options?.eventType && options.eventType !== 'All') {
      list = list.filter(
        (e) => e.eventType.toLowerCase() === options.eventType!.toLowerCase()
      );
    }
    if (options?.status && options.status !== 'All') {
      list = list.filter((e) => e.status === options.status);
    }
    if (options?.search) {
      const q = options.search.toLowerCase();
      list = list.filter(
        (e) =>
          e.eventName.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q) ||
          e.venue.toLowerCase().includes(q) ||
          e.eventType.toLowerCase().includes(q)
      );
    }

    const todayStr = new Date().toISOString().split('T')[0];

    if (options?.filterDate === 'upcoming') {
      list = list.filter((e) => e.date >= todayStr && e.status !== 'Cancelled');
    } else if (options?.filterDate === 'past') {
      list = list.filter((e) => e.date < todayStr || e.status === 'Completed');
    } else if (options?.targetMonth && options?.targetYear) {
      list = list.filter((e) => {
        const d = new Date(e.date);
        return (
          d.getFullYear() === options.targetYear &&
          d.getMonth() + 1 === options.targetMonth
        );
      });
    }

    return list.sort((a, b) => a.date.localeCompare(b.date));
  }

  getEventById(id: string): CollegeEvent | undefined {
    return this.data.events.find((e) => e.id === id);
  }

  createEvent(
    event: Omit<CollegeEvent, 'id' | 'createdAt' | 'updatedAt'>
  ): CollegeEvent {
    const now = new Date().toISOString();
    const newEvent: CollegeEvent = {
      ...event,
      id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      createdAt: now,
      updatedAt: now,
    };
    this.data.events.push(newEvent);
    this.saveData();

    this.recordAuditLog({
      action: 'CREATE_EVENT',
      entityType: 'CollegeEvent',
      entityId: newEvent.id,
      entityTitle: newEvent.eventName,
      details: `Scheduled event for date ${newEvent.date} at ${newEvent.venue}`,
      performedBy: newEvent.publishedBy || 'Admin',
    });

    return newEvent;
  }

  updateEvent(
    id: string,
    updates: Partial<CollegeEvent>,
    performedBy: string = 'Admin'
  ): CollegeEvent | null {
    const index = this.data.events.findIndex((e) => e.id === id);
    if (index === -1) return null;

    const old = this.data.events[index];
    const updated: CollegeEvent = {
      ...old,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.data.events[index] = updated;
    this.saveData();

    this.recordAuditLog({
      action: 'UPDATE_EVENT',
      entityType: 'CollegeEvent',
      entityId: updated.id,
      entityTitle: updated.eventName,
      details: `Updated event fields: ${Object.keys(updates).join(', ')}`,
      performedBy,
    });

    return updated;
  }

  deleteEvent(id: string, performedBy: string = 'Admin'): boolean {
    const index = this.data.events.findIndex((e) => e.id === id);
    if (index === -1) return false;

    const [deleted] = this.data.events.splice(index, 1);
    this.saveData();

    this.recordAuditLog({
      action: 'DELETE_EVENT',
      entityType: 'CollegeEvent',
      entityId: deleted.id,
      entityTitle: deleted.eventName,
      details: `Deleted event ${deleted.eventName}`,
      performedBy,
    });

    return true;
  }

  // --- Clubs ---
  listClubs(options?: {
    search?: string;
    category?: string;
    publishedOnly?: boolean;
  }): Club[] {
    let list = [...this.data.clubs];
    if (options?.publishedOnly) {
      list = list.filter((c) => c.published);
    }
    if (options?.category && options.category !== 'All') {
      list = list.filter(
        (c) => c.category.toLowerCase() === options.category!.toLowerCase()
      );
    }
    if (options?.search) {
      const q = options.search.toLowerCase();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.activities.some((a) => a.toLowerCase().includes(q))
      );
    }
    return list;
  }

  getClubById(id: string): Club | undefined {
    return this.data.clubs.find((c) => c.id === id);
  }

  createClub(club: Omit<Club, 'id' | 'createdAt' | 'updatedAt'>, performedBy = 'Admin'): Club {
    const now = new Date().toISOString();
    const newClub: Club = {
      ...club,
      id: `club-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      createdAt: now,
      updatedAt: now,
    };
    this.data.clubs.push(newClub);
    this.saveData();

    this.recordAuditLog({
      action: 'CREATE_CLUB',
      entityType: 'Club',
      entityId: newClub.id,
      entityTitle: newClub.name,
      details: `Created club under category ${newClub.category}`,
      performedBy,
    });

    return newClub;
  }

  updateClub(id: string, updates: Partial<Club>, performedBy = 'Admin'): Club | null {
    const index = this.data.clubs.findIndex((c) => c.id === id);
    if (index === -1) return null;

    const old = this.data.clubs[index];
    const updated: Club = {
      ...old,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.data.clubs[index] = updated;
    this.saveData();

    this.recordAuditLog({
      action: 'UPDATE_CLUB',
      entityType: 'Club',
      entityId: updated.id,
      entityTitle: updated.name,
      details: `Updated club ${updated.name}`,
      performedBy,
    });

    return updated;
  }

  deleteClub(id: string, performedBy = 'Admin'): boolean {
    const index = this.data.clubs.findIndex((c) => c.id === id);
    if (index === -1) return false;

    const [deleted] = this.data.clubs.splice(index, 1);
    this.saveData();

    this.recordAuditLog({
      action: 'DELETE_CLUB',
      entityType: 'Club',
      entityId: deleted.id,
      entityTitle: deleted.name,
      details: `Deleted club ${deleted.name}`,
      performedBy,
    });

    return true;
  }

  // --- Documents ---
  listDocuments(): DocumentItem[] {
    return this.data.documents.sort(
      (a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime()
    );
  }

  createDocument(doc: Omit<DocumentItem, 'id' | 'uploadDate'>): DocumentItem {
    const newDoc: DocumentItem = {
      ...doc,
      id: `doc-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      uploadDate: new Date().toISOString(),
    };
    this.data.documents.unshift(newDoc);
    this.saveData();

    this.recordAuditLog({
      action: 'UPLOAD_DOCUMENT',
      entityType: 'Document',
      entityId: newDoc.id,
      entityTitle: newDoc.filename,
      details: `Uploaded and indexed document: ${newDoc.filename} (${newDoc.category})`,
      performedBy: newDoc.uploader,
    });

    return newDoc;
  }

  deleteDocument(id: string, performedBy = 'Admin'): boolean {
    const index = this.data.documents.findIndex((d) => d.id === id);
    if (index === -1) return false;

    const [deleted] = this.data.documents.splice(index, 1);
    this.saveData();

    this.recordAuditLog({
      action: 'DELETE_DOCUMENT',
      entityType: 'Document',
      entityId: deleted.id,
      entityTitle: deleted.filename,
      details: `Deleted document ${deleted.filename}`,
      performedBy,
    });

    return true;
  }

  // --- Conversations & Messages ---
  listConversations(userId?: string): Conversation[] {
    let list = this.data.conversations;
    if (userId) {
      list = list.filter((c) => c.userId === userId);
    }
    return list.sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }

  getConversation(id: string): Conversation | undefined {
    return this.data.conversations.find((c) => c.id === id);
  }

  updateConversationContext(
    conversationId: string,
    context: Partial<StudentContext>
  ): Conversation | null {
    const conv = this.getConversation(conversationId);
    if (!conv) return null;
    conv.studentContext = {
      ...(conv.studentContext || {}),
      ...context,
    };
    conv.updatedAt = new Date().toISOString();
    this.saveData();
    return conv;
  }

  createConversation(title: string = 'New Conversation', userId?: string): Conversation {
    const now = new Date().toISOString();
    const conv: Conversation = {
      id: `conv-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      userId,
      title,
      messages: [],
      createdAt: now,
      updatedAt: now,
    };
    this.data.conversations.unshift(conv);
    this.saveData();
    return conv;
  }

  addMessageToConversation(
    conversationId: string,
    message: Omit<ChatMessage, 'id' | 'conversationId' | 'createdAt'>
  ): ChatMessage {
    let conv = this.getConversation(conversationId);
    if (!conv) {
      conv = this.createConversation(
        message.role === 'user'
          ? message.content.slice(0, 30) + '...'
          : 'Conversation'
      );
      conversationId = conv.id;
    }

    const newMsg: ChatMessage = {
      ...message,
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      conversationId,
      createdAt: new Date().toISOString(),
    };

    conv.messages.push(newMsg);
    conv.updatedAt = new Date().toISOString();

    if (conv.messages.length === 1 && message.role === 'user') {
      conv.title = message.content.slice(0, 40);
    }

    this.saveData();
    return newMsg;
  }

  clearConversation(conversationId: string): boolean {
    const conv = this.getConversation(conversationId);
    if (!conv) return false;
    conv.messages = [];
    conv.updatedAt = new Date().toISOString();
    this.saveData();
    return true;
  }

  deleteConversation(conversationId: string): boolean {
    const index = this.data.conversations.findIndex((c) => c.id === conversationId);
    if (index === -1) return false;
    this.data.conversations.splice(index, 1);
    this.saveData();
    return true;
  }

  // --- Feedback ---
  recordFeedback(feedback: Omit<FeedbackItem, 'id' | 'createdAt'>): FeedbackItem {
    const newFeedback: FeedbackItem = {
      ...feedback,
      id: `fb-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      createdAt: new Date().toISOString(),
    };
    this.data.feedbacks.unshift(newFeedback);

    for (const conv of this.data.conversations) {
      const msg = conv.messages.find((m) => m.id === feedback.messageId);
      if (msg) {
        msg.feedback = {
          rating: feedback.rating,
          reason: feedback.reason,
          comment: feedback.comment,
        };
        break;
      }
    }

    this.saveData();
    return newFeedback;
  }

  listFeedbacks(): FeedbackItem[] {
    return this.data.feedbacks;
  }

  // --- Unanswered Questions & Ticket System ---
  recordUnansweredQuestion(
    questionText: string,
    category: string = 'General',
    extra?: Partial<UnansweredQuestion>
  ): UnansweredQuestion {
    const trimmed = questionText.trim().toLowerCase();
    const existing = this.data.unansweredQuestions.find(
      (q) => q.question.trim().toLowerCase() === trimmed
    );

    const now = new Date().toISOString();

    if (existing) {
      existing.frequency += 1;
      existing.lastAskedAt = now;
      if (existing.status === 'REJECTED') existing.status = 'OPEN';
      if (extra?.userConversationId) existing.userConversationId = extra.userConversationId;
      if (extra?.detectedIntent) existing.detectedIntent = extra.detectedIntent;
      if (extra?.detectedEntities) existing.detectedEntities = extra.detectedEntities;
      if (extra?.possibleInstitution) existing.possibleInstitution = extra.possibleInstitution;
      if (extra?.possibleDepartment) existing.possibleDepartment = extra.possibleDepartment;
      if (extra?.searchesAttempted) existing.searchesAttempted = extra.searchesAttempted;
      if (extra?.sourcesChecked) existing.sourcesChecked = extra.sourcesChecked;
      this.saveData();
      return existing;
    }

    const newQuestion: UnansweredQuestion = {
      id: `uq-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      ticketId: extra?.ticketId || `TCK-${Date.now().toString().slice(-6)}`,
      question: questionText.trim(),
      category: extra?.category || category,
      userConversationId: extra?.userConversationId,
      detectedIntent: extra?.detectedIntent,
      detectedEntities: extra?.detectedEntities,
      possibleInstitution: extra?.possibleInstitution,
      possibleDepartment: extra?.possibleDepartment,
      searchesAttempted: extra?.searchesAttempted || ['Official Knowledge Base', 'Official Sources'],
      sourcesChecked: extra?.sourcesChecked || ['sritgroup.net', 'rgpv.ac.in'],
      frequency: 1,
      lastAskedAt: now,
      dateAsked: now,
      status: 'OPEN',
      notes: extra?.notes,
    };

    this.data.unansweredQuestions.unshift(newQuestion);
    this.saveData();
    return newQuestion;
  }

  listUnansweredQuestions(): UnansweredQuestion[] {
    return this.data.unansweredQuestions.sort(
      (a, b) => b.frequency - a.frequency || new Date(b.lastAskedAt).getTime() - new Date(a.lastAskedAt).getTime()
    );
  }

  resolveQuestion(
    id: string,
    adminAnswer: string,
    resolvedBy = 'Admin',
    createKnowledgeItem = true,
    extraKnowledgeData?: Partial<KnowledgeItem>
  ): { question: UnansweredQuestion; knowledgeItem?: KnowledgeItem } | null {
    const item = this.data.unansweredQuestions.find((q) => q.id === id || q.ticketId === id);
    if (!item) return null;

    item.status = 'ANSWERED';
    item.adminAnswer = adminAnswer;
    item.resolvedAt = new Date().toISOString();
    item.resolvedBy = resolvedBy;

    let knowledgeItem: KnowledgeItem | undefined;
    if (createKnowledgeItem) {
      knowledgeItem = this.createKnowledge({
        title: item.question,
        content: adminAnswer,
        category: (extraKnowledgeData?.category as any) || (item.category as any) || 'General',
        institutionId: extraKnowledgeData?.institutionId || 'SRIT',
        academicYear: extraKnowledgeData?.academicYear || '2026-27',
        sourceType: 'Admin',
        sourceUrl: extraKnowledgeData?.sourceUrl || 'Admin Answer to Student Question',
        status: 'Published',
        published: true,
        createdBy: resolvedBy,
      });
      item.status = 'PUBLISHED';
    }

    this.saveData();

    this.recordAuditLog({
      action: 'RESOLVE_UNANSWERED_QUESTION',
      entityType: 'UnansweredQuestion',
      entityId: item.ticketId || item.id,
      entityTitle: item.question,
      details: `Answered question ticket ${item.ticketId}: "${item.question}". Published new knowledge item.`,
      performedBy: resolvedBy,
    });

    return { question: item, knowledgeItem };
  }

  ignoreQuestion(id: string): boolean {
    const item = this.data.unansweredQuestions.find((q) => q.id === id || q.ticketId === id);
    if (!item) return false;
    item.status = 'REJECTED';
    this.saveData();
    return true;
  }

  deleteQuestion(id: string): boolean {
    const index = this.data.unansweredQuestions.findIndex((q) => q.id === id || q.ticketId === id);
    if (index === -1) return false;
    this.data.unansweredQuestions.splice(index, 1);
    this.saveData();
    return true;
  }

  // --- Audit Logs ---
  recordAuditLog(log: Omit<AuditLog, 'id' | 'createdAt'>): AuditLog {
    const newLog: AuditLog = {
      ...log,
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      createdAt: new Date().toISOString(),
    };
    this.data.auditLogs.unshift(newLog);
    if (this.data.auditLogs.length > 200) {
      this.data.auditLogs = this.data.auditLogs.slice(0, 200);
    }
    this.saveData();
    return newLog;
  }

  listAuditLogs(): AuditLog[] {
    return this.data.auditLogs;
  }

  // --- Analytics & Coverage Dashboard ---
  getAnalytics() {
    const totalKnowledge = this.data.knowledge.length;
    const publishedKnowledge = this.data.knowledge.filter((k) => k.published).length;
    const totalEvents = this.data.events.length;
    const todayStr = new Date().toISOString().split('T')[0];
    const upcomingEvents = this.data.events.filter(
      (e) => e.date >= todayStr && e.status !== 'Cancelled'
    ).length;
    const totalClubs = this.data.clubs.length;
    const totalConversations = this.data.conversations.length;
    const totalMessages = this.data.conversations.reduce(
      (acc, c) => acc + c.messages.length,
      0
    );

    const unansweredQuestionsCount = this.data.unansweredQuestions.filter(
      (q) => q.status === 'OPEN' || q.status === 'UNDER_REVIEW'
    ).length;
    const totalQuestionsAsked = this.data.unansweredQuestions.reduce(
      (acc, q) => acc + q.frequency,
      0
    );

    const helpfulFeedbacks = this.data.feedbacks.filter(
      (f) => f.rating === 'helpful'
    ).length;
    const unhelpfulFeedbacks = this.data.feedbacks.filter(
      (f) => f.rating === 'unhelpful'
    ).length;

    // Categories breakdown
    const categoryCounts: Record<string, number> = {};
    for (const k of this.data.knowledge) {
      categoryCounts[k.category] = (categoryCounts[k.category] || 0) + 1;
    }

    const mostAskedQuestions = [...this.data.unansweredQuestions]
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 5);

    // Knowledge Coverage Status (Section 42 requirement)
    const coverage = {
      leadership: this.data.persons.length > 0,
      leadershipCount: this.data.persons.length,
      faculty: this.data.faculty.length > 0,
      facultyCount: this.data.faculty.length,
      departments: this.data.departments.length > 0,
      departmentsCount: this.data.departments.length,
      courses: this.data.courses.length > 0,
      coursesCount: this.data.courses.length,
      statistics: this.data.statistics.length > 0,
      statisticsCount: this.data.statistics.length,
      facilities: this.data.knowledge.some((k) => k.category === 'Facilities'),
      clubs: this.data.clubs.length > 0,
      clubsCount: this.data.clubs.length,
      events: this.data.events.length > 0,
      eventsCount: this.data.events.length,
      documents: this.data.documents.length > 0,
      documentsCount: this.data.documents.length,
      schemesCount: (this.data.subjectSchemes || []).length,
      affiliationsCount: (this.data.affiliations || []).length,
      attendanceRulesCount: (this.data.attendanceRules || []).length,
      placementsCount: (this.data.placements || []).length,
      companiesCount: (this.data.companies || []).length,
      achievementsCount: (this.data.achievements || []).length,
      admissionsCount: (this.data.admissions || []).length,
      feesCount: (this.data.feeStructures || []).length,
      scholarshipsCount: (this.data.scholarships || []).length,
      unansweredQuestions: unansweredQuestionsCount,
    };

    return {
      totalKnowledge,
      publishedKnowledge,
      totalEvents,
      upcomingEvents,
      totalClubs,
      totalConversations,
      totalMessages,
      unansweredQuestionsCount,
      totalQuestionsAsked,
      helpfulFeedbacks,
      unhelpfulFeedbacks,
      categoryCounts,
      mostAskedQuestions,
      coverage,
      totalPersons: this.data.persons.length,
      totalFaculty: this.data.faculty.length,
      totalDepartments: this.data.departments.length,
      totalCourses: this.data.courses.length,
      totalStatistics: this.data.statistics.length,
      totalSubjectSchemes: this.data.subjectSchemes.length,
      totalAffiliations: this.data.affiliations.length,
      totalPlacements: this.data.placements.length,
      totalAttendanceRules: this.data.attendanceRules.length,
      totalCompanies: this.data.companies.length,
      totalSourcePages: this.data.sourcePages.length,
    };
  }

  // --- Global Search for Admin ---
  globalSearch(query: string) {
    const q = query.trim().toLowerCase();
    if (!q) {
      return {
        knowledge: [],
        events: [],
        clubs: [],
        documents: [],
        questions: [],
        persons: [],
        faculty: [],
        departments: [],
        courses: [],
        statistics: [],
        subjectSchemes: [],
        affiliations: [],
        placements: [],
      };
    }

    const knowledge = this.data.knowledge
      .filter(
        (k) =>
          k.title.toLowerCase().includes(q) ||
          k.content.toLowerCase().includes(q) ||
          k.category.toLowerCase().includes(q)
      )
      .slice(0, 10);

    const persons = this.data.persons
      .filter(
        (p) =>
          p.fullName.toLowerCase().includes(q) ||
          p.designation.toLowerCase().includes(q) ||
          p.biography.toLowerCase().includes(q)
      )
      .slice(0, 5);

    const faculty = this.data.faculty
      .filter(
        (f) =>
          f.fullName.toLowerCase().includes(q) ||
          f.department.toLowerCase().includes(q) ||
          f.qualification.toLowerCase().includes(q)
      )
      .slice(0, 10);

    const departments = this.data.departments
      .filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.abbreviation.toLowerCase().includes(q) ||
          d.description.toLowerCase().includes(q)
      )
      .slice(0, 5);

    const courses = this.data.courses
      .filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.department.toLowerCase().includes(q)
      )
      .slice(0, 5);

    const statistics = this.data.statistics
      .filter(
        (s) =>
          s.statisticName.toLowerCase().includes(q) ||
          s.category.toLowerCase().includes(q)
      )
      .slice(0, 5);

    const events = this.data.events
      .filter(
        (e) =>
          e.eventName.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q) ||
          e.eventType.toLowerCase().includes(q) ||
          e.venue.toLowerCase().includes(q)
      )
      .slice(0, 10);

    const clubs = this.data.clubs
      .filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.category.toLowerCase().includes(q)
      )
      .slice(0, 5);

    const documents = this.data.documents
      .filter(
        (d) =>
          d.filename.toLowerCase().includes(q) ||
          d.extractedText.toLowerCase().includes(q)
      )
      .slice(0, 5);

    const questions = this.data.unansweredQuestions
      .filter((u) => u.question.toLowerCase().includes(q))
      .slice(0, 5);

    const subjectSchemes = this.data.subjectSchemes
      .filter(
        (s) =>
          s.subjectCode.toLowerCase().includes(q) ||
          s.subjectName.toLowerCase().includes(q) ||
          s.branch.toLowerCase().includes(q)
      )
      .slice(0, 5);

    const affiliations = this.data.affiliations
      .filter(
        (a) =>
          a.institution.toLowerCase().includes(q) ||
          a.program.toLowerCase().includes(q) ||
          a.university.toLowerCase().includes(q)
      )
      .slice(0, 5);

    const placements = this.data.placements
      .filter(
        (p) =>
          p.academicYear.toLowerCase().includes(q) ||
          p.highestPackage.toLowerCase().includes(q)
      )
      .slice(0, 5);

    return {
      knowledge,
      events,
      clubs,
      documents,
      questions,
      persons,
      faculty,
      departments,
      courses,
      statistics,
      subjectSchemes,
      affiliations,
      placements,
    };
  }
}

export const db = new Database();
