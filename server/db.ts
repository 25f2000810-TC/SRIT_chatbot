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
  Person,
  FacultyMember,
  Department,
  Course,
  InstitutionalStatistic,
} from './types.js';
import {
  initialUsers,
  initialKnowledge,
  initialClubs,
  initialEvents,
  initialInstitutions,
  initialPersons,
  initialFaculty,
  initialDepartments,
  initialCourses,
  initialStatistics,
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
  institutions: Institution[];
  persons: Person[];
  faculty: FacultyMember[];
  departments: Department[];
  courses: Course[];
  statistics: InstitutionalStatistic[];
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
      unansweredQuestions: loaded?.unansweredQuestions || [],
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
      persons: mergeById(loaded?.persons, initialPersons),
      faculty: mergeById(loaded?.faculty, initialFaculty),
      departments: mergeById(loaded?.departments, initialDepartments),
      courses: mergeById(loaded?.courses, initialCourses),
      statistics: mergeById(loaded?.statistics, initialStatistics),
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

  // --- Institutions ---
  listInstitutions(): Institution[] {
    return this.data.institutions;
  }

  getInstitutionById(id: string): Institution | undefined {
    return this.data.institutions.find(
      (i) => i.id === id || i.shortName.toLowerCase() === id.toLowerCase()
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
      q.includes('who runs') ||
      q.includes('founder') ||
      q.includes('owner') ||
      q.includes('owns')
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

    // 3. Substring match fallback
    return this.data.persons.find(
      (p) =>
        q.includes(p.fullName.toLowerCase()) ||
        p.fullName.toLowerCase().includes(q)
    );
  }

  findPersons(query: string): Person[] {
    const q = query.toLowerCase().trim();
    const list: Person[] = [];

    const kosta = this.data.persons.find((p) => p.fullName.toLowerCase().includes('kosta'));
    const gupta = this.data.persons.find((p) => p.designation.toLowerCase().includes('principal'));
    const tpo = this.data.persons.find((p) => p.role === 'TPO' || p.designation.toLowerCase().includes('tpo'));

    if (
      q.includes('founder') ||
      q.includes('owner') ||
      q.includes('owns') ||
      q.includes('who runs') ||
      q.includes('who heads') ||
      q.includes('leadership') ||
      q.includes('administration') ||
      q.includes('directors')
    ) {
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

  // --- Unanswered Questions ---
  recordUnansweredQuestion(questionText: string, category: string = 'General'): UnansweredQuestion {
    const trimmed = questionText.trim().toLowerCase();
    const existing = this.data.unansweredQuestions.find(
      (q) => q.question.trim().toLowerCase() === trimmed
    );

    if (existing) {
      existing.frequency += 1;
      existing.lastAskedAt = new Date().toISOString();
      if (existing.status === 'Ignored') existing.status = 'Unanswered';
      this.saveData();
      return existing;
    }

    const newQuestion: UnansweredQuestion = {
      id: `uq-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      question: questionText.trim(),
      category,
      frequency: 1,
      lastAskedAt: new Date().toISOString(),
      status: 'Unanswered',
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
    createKnowledgeItem = true
  ): { question: UnansweredQuestion; knowledgeItem?: KnowledgeItem } | null {
    const item = this.data.unansweredQuestions.find((q) => q.id === id);
    if (!item) return null;

    item.status = 'Answered';
    item.adminAnswer = adminAnswer;
    item.resolvedAt = new Date().toISOString();
    item.resolvedBy = resolvedBy;

    let knowledgeItem: KnowledgeItem | undefined;
    if (createKnowledgeItem) {
      knowledgeItem = this.createKnowledge({
        title: item.question,
        content: adminAnswer,
        category: (item.category as any) || 'General',
        sourceType: 'Admin',
        sourceUrl: 'Admin Answer to Student Question',
        status: 'Published',
        published: true,
        createdBy: resolvedBy,
      });
    }

    this.saveData();

    this.recordAuditLog({
      action: 'RESOLVE_UNANSWERED_QUESTION',
      entityType: 'UnansweredQuestion',
      entityId: item.id,
      entityTitle: item.question,
      details: `Answered question: "${item.question}". Published new knowledge item.`,
      performedBy: resolvedBy,
    });

    return { question: item, knowledgeItem };
  }

  ignoreQuestion(id: string): boolean {
    const item = this.data.unansweredQuestions.find((q) => q.id === id);
    if (!item) return false;
    item.status = 'Ignored';
    this.saveData();
    return true;
  }

  deleteQuestion(id: string): boolean {
    const index = this.data.unansweredQuestions.findIndex((q) => q.id === id);
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
      (q) => q.status === 'Unanswered'
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
    };
  }
}

export const db = new Database();
