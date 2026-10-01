import { GoogleGenAI, Type } from '@google/genai';
import { db } from './db.js';
import {
  CollegeEvent,
  Club,
  KnowledgeItem,
  ChatMessage,
  Person,
  FacultyMember,
  Department,
  Course,
  InstitutionalStatistic,
  Institution,
} from './types.js';

export interface ChatResponse {
  answer: string;
  sources: Array<{
    title: string;
    sourceType: string;
    sourceUrl?: string;
  }>;
  matchedEvents?: CollegeEvent[];
  matchedClubs?: Club[];
  matchedPersons?: Person[];
  matchedFaculty?: FacultyMember[];
  matchedStatistics?: InstitutionalStatistic[];
  isUnknownQuestion?: boolean;
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

export type QuestionCategory =
  | 'LEADERSHIP'
  | 'FACULTY'
  | 'STATISTICS'
  | 'DEPARTMENT'
  | 'COURSE'
  | 'INSTITUTION'
  | 'EVENT'
  | 'CLUB'
  | 'GENERAL';

export class AIService {
  private ai: GoogleGenAI;
  private modelName = 'gemini-3.8-flash';

  constructor() {
    this.ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY || '',
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }

  /**
   * Classify user question into domain category
   */
  classifyQuestion(query: string, history: ChatMessage[] = []): QuestionCategory {
    const qLower = query.toLowerCase();

    // 1. Check statistical keywords FIRST before general faculty/student keywords
    if (
      qLower.includes('how many student') ||
      qLower.includes('student strength') ||
      qLower.includes('total student') ||
      qLower.includes('number of student') ||
      qLower.includes('ug student') ||
      qLower.includes('pg student') ||
      qLower.includes('how many faculty') ||
      qLower.includes('how many professor') ||
      qLower.includes('how many teacher') ||
      qLower.includes('how many staff') ||
      qLower.includes('faculty count') ||
      qLower.includes('staff strength') ||
      qLower.includes('intake') ||
      qLower.includes('how many seats') ||
      qLower.includes('nirf')
    ) {
      return 'STATISTICS';
    }

    // 2. Check leadership keywords
    if (
      qLower.includes('founder') ||
      qLower.includes('owner') ||
      qLower.includes('owns') ||
      qLower.includes('founded') ||
      qLower.includes('director general') ||
      qLower.includes('group director') ||
      qLower.includes('principal') ||
      qLower.includes('tpo') ||
      qLower.includes('placement officer') ||
      qLower.includes('head of placement') ||
      qLower.includes('chairman') ||
      qLower.includes('vice chairman') ||
      qLower.includes('governing body') ||
      qLower.includes('kosta') ||
      qLower.includes('shailesh') ||
      qLower.includes('vivek rajput') ||
      qLower.includes('who heads') ||
      qLower.includes('who runs') ||
      qLower.includes('who is the director') ||
      qLower.includes('who is director') ||
      qLower.includes('the director') ||
      qLower.includes('who is the head')
    ) {
      return 'LEADERSHIP';
    }

    // 3. Check faculty keywords
    if (
      qLower.includes('faculty') ||
      qLower.includes('professor') ||
      qLower.includes('prof.') ||
      qLower.includes('prof ') ||
      qLower.includes('teacher') ||
      qLower.includes('teaches') ||
      qLower.includes('teaching') ||
      qLower.includes('designation') ||
      qLower.includes('qualification') ||
      qLower.includes('qualifications') ||
      qLower.includes('belong to') ||
      qLower.includes('hod') ||
      qLower.includes('head of department') ||
      qLower.includes('phd') ||
      qLower.includes('doctorate') ||
      qLower.includes('reeta') ||
      qLower.includes('malviya') ||
      qLower.includes('sachin') ||
      qLower.includes('ankit') ||
      qLower.includes('agarwal') ||
      qLower.includes('neha') ||
      qLower.includes('rahul jain') ||
      qLower.includes('priya sen') ||
      qLower.includes('anurag rai') ||
      qLower.includes('rajesh verma') ||
      qLower.includes('manoj jain') ||
      qLower.includes('sunita jain') ||
      qLower.includes('alok kumar') ||
      qLower.includes('chouksey') ||
      qLower.includes('deepa shrivastava') ||
      qLower.includes('rohit tiwari')
    ) {
      return 'FACULTY';
    }

    // 4. Check department keywords
    if (
      qLower.includes('department') ||
      qLower.includes('departments') ||
      qLower.includes('branches') ||
      qLower.includes('what branches') ||
      qLower.includes('cse department') ||
      qLower.includes('aiml department') ||
      qLower.includes('mechanical department') ||
      qLower.includes('civil department') ||
      qLower.includes('electrical department')
    ) {
      return 'DEPARTMENT';
    }

    // 5. Check course keywords
    if (
      qLower.includes('course') ||
      qLower.includes('courses') ||
      qLower.includes('b.tech') ||
      qLower.includes('m.tech') ||
      qLower.includes('mca') ||
      qLower.includes('mba') ||
      qLower.includes('degree') ||
      qLower.includes('programs')
    ) {
      return 'COURSE';
    }

    // 6. Check institutional / history keywords
    if (
      qLower.includes('when was') ||
      qLower.includes('established') ||
      qLower.includes('establishment') ||
      qLower.includes('history') ||
      qLower.includes('institution') ||
      qLower.includes('institutions') ||
      qLower.includes('shri ram group') ||
      qLower.includes('what is srit') ||
      qLower.includes('where is srit') ||
      qLower.includes('campus size') ||
      qLower.includes('how large')
    ) {
      return 'INSTITUTION';
    }

    // 7. Check event keywords
    if (
      qLower.includes('event') ||
      qLower.includes('fest') ||
      qLower.includes('workshop') ||
      qLower.includes('seminar') ||
      qLower.includes('tournament') ||
      qLower.includes('upcoming') ||
      qLower.includes('coming up') ||
      qLower.includes('next fest') ||
      qLower.includes('registration')
    ) {
      return 'EVENT';
    }

    // 8. Check club keywords
    if (
      qLower.includes('club') ||
      qLower.includes('epl') ||
      qLower.includes('occulus') ||
      qLower.includes('vahini') ||
      qLower.includes('dance') ||
      qLower.includes('cricket') ||
      qLower.includes('activity') ||
      qLower.includes('activities')
    ) {
      return 'CLUB';
    }

    // If follow-up mentions "he", "his", "she", "her", check previous message
    if (history.length > 0) {
      const lastBotMsg = history[history.length - 1];
      if (
        (qLower.includes('he ') ||
          qLower.includes('his ') ||
          qLower.includes('she ') ||
          qLower.includes('her ') ||
          qLower.includes('it ') ||
          qLower.includes('before joining')) &&
        lastBotMsg
      ) {
        if (lastBotMsg.content.includes('Kosta') || lastBotMsg.content.includes('Gupta')) {
          return 'LEADERSHIP';
        }
        if (lastBotMsg.content.includes('Malviya') || lastBotMsg.content.includes('Professor') || lastBotMsg.content.includes('Sharma')) {
          return 'FACULTY';
        }
      }
    }

    return 'GENERAL';
  }

  /**
   * Search knowledge base, persons, faculty, departments, statistics, events, and clubs
   */
  private retrieveContext(query: string, history: ChatMessage[] = []) {
    const qLower = query.toLowerCase();
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const category = this.classifyQuestion(query, history);

    // 1. Leadership / Person Retrieval
    let matchedPersons: Person[] = [];
    if (
      category === 'LEADERSHIP' ||
      qLower.includes('kosta') ||
      qLower.includes('director') ||
      qLower.includes('principal') ||
      qLower.includes('tpo') ||
      qLower.includes('founder') ||
      qLower.includes('owner') ||
      qLower.includes('owns') ||
      qLower.includes('who runs') ||
      qLower.includes('who heads') ||
      qLower.includes('head of') ||
      qLower.includes('shailesh') ||
      qLower.includes('gupta') ||
      qLower.includes('rajput')
    ) {
      matchedPersons = db.findPersons(query);
      if (matchedPersons.length === 0) {
        const found = db.findPersonByNameOrRole(query);
        if (found) {
          matchedPersons.push(found);
        } else {
          matchedPersons = db.listPersons();
        }
      }
    }

    // 2. Faculty Retrieval
    let matchedFaculty: FacultyMember[] = db.findFacultyByNameOrDept(query);
    if (
      matchedFaculty.length === 0 &&
      (category === 'FACULTY' ||
        qLower.includes('who are the faculty') ||
        qLower.includes('faculty members') ||
        qLower.includes('who teaches'))
    ) {
      matchedFaculty = db.listFaculty().slice(0, 8);
    }

    // 3. Statistics Retrieval
    let matchedStatistics: InstitutionalStatistic[] = [];
    if (
      category === 'STATISTICS' ||
      qLower.includes('student') ||
      qLower.includes('faculty') ||
      qLower.includes('staff') ||
      qLower.includes('how many') ||
      qLower.includes('nirf') ||
      qLower.includes('intake') ||
      qLower.includes('seats') ||
      qLower.includes('salary') ||
      qLower.includes('package')
    ) {
      if (qLower.includes('faculty') || qLower.includes('staff') || qLower.includes('teacher') || qLower.includes('professor')) {
        matchedStatistics = db.listStatistics({ category: 'Staff Strength' });
      } else if (qLower.includes('intake') || qLower.includes('seats')) {
        matchedStatistics = db.listStatistics({ category: 'Intake' });
      } else if (qLower.includes('salary') || qLower.includes('placement') || qLower.includes('package')) {
        matchedStatistics = db.listStatistics({ category: 'Placement' });
      } else {
        matchedStatistics = db.listStatistics({ category: 'Student Strength' });
      }

      // If user asks broad stats or NIRF, include both student & faculty stats
      if (qLower.includes('how many') || qLower.includes('nirf') || qLower.includes('strength')) {
        const staff = db.listStatistics({ category: 'Staff Strength' });
        for (const s of staff) {
          if (!matchedStatistics.some((item) => item.id === s.id)) {
            matchedStatistics.push(s);
          }
        }
      }
    }

    // 4. Department Retrieval
    let matchedDepartments: Department[] = db.findDepartmentByNameOrHod(query);
    if (
      matchedDepartments.length === 0 &&
      (category === 'DEPARTMENT' ||
        qLower.includes('department') ||
        qLower.includes('branches') ||
        qLower.includes('what branches') ||
        qLower.includes('hod'))
    ) {
      matchedDepartments = db.listDepartments();
    }

    // If query asked about HOD, ensure HOD faculty member is added to matchedFaculty
    if (matchedDepartments.length > 0 && (qLower.includes('hod') || qLower.includes('head'))) {
      for (const dept of matchedDepartments) {
        if (dept.HOD) {
          const hodFaculty = db.findFacultyByNameOrDept(dept.HOD);
          for (const f of hodFaculty) {
            if (!matchedFaculty.some((existing) => existing.id === f.id)) {
              matchedFaculty.unshift(f);
            }
          }
        }
      }
    }

    // 5. Course Retrieval
    let matchedCourses: Course[] = [];
    if (
      category === 'COURSE' ||
      qLower.includes('course') ||
      qLower.includes('b.tech') ||
      qLower.includes('branches') ||
      qLower.includes('mca') ||
      qLower.includes('mba') ||
      qLower.includes('intake')
    ) {
      matchedCourses = db.listCourses({ search: query });
      if (matchedCourses.length === 0) {
        matchedCourses = db.listCourses();
      }
    }

    // 6. Institutions Retrieval
    let matchedInstitutions: Institution[] = [];
    if (
      category === 'INSTITUTION' ||
      qLower.includes('shri ram group') ||
      qLower.includes('established') ||
      qLower.includes('history') ||
      qLower.includes('institutions') ||
      qLower.includes('founder') ||
      qLower.includes('owner') ||
      qLower.includes('who runs')
    ) {
      matchedInstitutions = db.listInstitutions();
    }

    // 7. Events Retrieval
    let matchedEvents: CollegeEvent[] = [];
    const isEventQuery =
      category === 'EVENT' ||
      qLower.includes('event') ||
      qLower.includes('fest') ||
      qLower.includes('workshop') ||
      qLower.includes('upcoming') ||
      qLower.includes('coming up') ||
      qLower.includes('techfest');

    if (isEventQuery) {
      const querySpecific = db.listEvents({ publishedOnly: true }).filter((e) => {
        const title = e.eventName.toLowerCase();
        const desc = e.description.toLowerCase();
        return (
          (qLower.includes('ai') && (title.includes('ai') || desc.includes('ai'))) ||
          (qLower.includes('robotics') && (title.includes('robotics') || desc.includes('robotics'))) ||
          (qLower.includes('techfest') && title.includes('techfest')) ||
          (qLower.includes('cricket') && (title.includes('cricket') || title.includes('epl')))
        );
      });

      if (querySpecific.length > 0) {
        matchedEvents = querySpecific;
      } else if (qLower.includes('workshop')) {
        matchedEvents = db.listEvents({ publishedOnly: true }).filter((e) =>
          e.eventType.toLowerCase().includes('workshop') ||
          e.eventName.toLowerCase().includes('workshop') ||
          e.description.toLowerCase().includes('workshop')
        );
      } else {
        matchedEvents = db.listEvents({ publishedOnly: true, filterDate: 'upcoming' });
      }
    }

    // 8. Clubs Retrieval
    let matchedClubs: Club[] = [];
    const isClubQuery =
      category === 'CLUB' ||
      qLower.includes('club') ||
      qLower.includes('epl') ||
      qLower.includes('occulus') ||
      qLower.includes('vahini') ||
      qLower.includes('dance') ||
      qLower.includes('sports');

    if (isClubQuery) {
      if (qLower.includes('cricket') || qLower.includes('epl')) {
        matchedClubs = db.listClubs({ publishedOnly: true }).filter((c) =>
          c.name.toLowerCase().includes('epl') || c.description.toLowerCase().includes('cricket')
        );
      } else if (qLower.includes('music') || qLower.includes('band') || qLower.includes('occulus')) {
        matchedClubs = db.listClubs({ publishedOnly: true }).filter((c) =>
          c.name.toLowerCase().includes('occulus') || c.category.toLowerCase().includes('music')
        );
      } else if (qLower.includes('vahini') || qLower.includes('women')) {
        matchedClubs = db.listClubs({ publishedOnly: true }).filter((c) =>
          c.name.toLowerCase().includes('vahini')
        );
      } else if (qLower.includes('dance')) {
        matchedClubs = db.listClubs({ publishedOnly: true }).filter((c) =>
          c.name.toLowerCase().includes('dance') || c.name.toLowerCase().includes('rhythm')
        );
      } else {
        matchedClubs = db.listClubs({ publishedOnly: true });
      }
    }

    // 9. Knowledge Items Hybrid Scoring
    const publishedKnowledge = db.listKnowledge({ publishedOnly: true });
    const words = qLower
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 2);

    const scoredKnowledge = publishedKnowledge
      .map((item) => {
        let score = 0;
        const titleLower = item.title.toLowerCase();
        const contentLower = item.content.toLowerCase();
        const catLower = item.category.toLowerCase();

        if (titleLower.includes(qLower)) score += 20;
        if (contentLower.includes(qLower)) score += 10;

        for (const word of words) {
          if (titleLower.includes(word)) score += 6;
          if (catLower.includes(word)) score += 4;
          if (contentLower.includes(word)) score += 2;
        }

        if (item.sourceType === 'Admin') score += 3;
        return { item, score };
      })
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 6)
      .map((entry) => entry.item);

    return {
      category,
      persons: matchedPersons,
      faculty: matchedFaculty,
      statistics: matchedStatistics,
      departments: matchedDepartments,
      courses: matchedCourses,
      institutions: matchedInstitutions,
      events: matchedEvents.slice(0, 4),
      clubs: matchedClubs.slice(0, 4),
      knowledge: scoredKnowledge,
      todayStr,
    };
  }

  /**
   * Main Chat Generation with Conversational Grounding
   */
  async generateChatResponse(
    message: string,
    conversationHistory: ChatMessage[] = []
  ): Promise<ChatResponse> {
    const context = this.retrieveContext(message, conversationHistory);
    const sourcesMap = new Map<string, { title: string; sourceType: string; sourceUrl?: string }>();

    // Collect verified sources
    context.persons.forEach((p) => {
      sourcesMap.set(p.fullName, {
        title: `${p.fullName} (${p.designation})`,
        sourceType: p.source,
        sourceUrl: p.sourceUrl,
      });
    });

    context.faculty.forEach((f) => {
      sourcesMap.set(f.fullName, {
        title: `${f.fullName} (${f.designation}, ${f.department})`,
        sourceType: f.source,
        sourceUrl: 'https://sritgroup.net/faculty/',
      });
    });

    context.statistics.forEach((s) => {
      sourcesMap.set(s.statisticName, {
        title: `${s.statisticName} (${s.source})`,
        sourceType: s.source,
        sourceUrl: s.sourceUrl,
      });
    });

    context.institutions.forEach((i) => {
      sourcesMap.set(i.name, {
        title: `${i.name} Profile`,
        sourceType: i.source,
        sourceUrl: i.sourceUrl,
      });
    });

    context.knowledge.forEach((k) => {
      sourcesMap.set(k.title, {
        title: k.title,
        sourceType: k.sourceType,
        sourceUrl: k.sourceUrl || 'https://sritgroup.net/',
      });
    });

    context.events.forEach((e) => {
      sourcesMap.set(e.eventName, {
        title: e.eventName,
        sourceType: 'SRIT Event Database',
        sourceUrl: e.registrationUrl || 'https://sritgroup.net/',
      });
    });

    context.clubs.forEach((c) => {
      sourcesMap.set(c.name, {
        title: c.name,
        sourceType: c.source || 'Official SRIT Website',
        sourceUrl: 'https://sritgroup.net/',
      });
    });

    const sources = Array.from(sourcesMap.values());

    // Prepare structured context for Gemini
    const contextTextBlocks = [
      `TODAY'S DATE: ${context.todayStr}`,
      `QUESTION CATEGORY: ${context.category}`,
      '',
      '=== 1. VERIFIED LEADERSHIP & PERSONS ===',
      context.persons.length > 0
        ? context.persons
            .map(
              (p) =>
                `• Name: ${p.fullName} | Designation: ${p.designation} | Scope: ${p.institution} (${p.institutionId})\n  Biography & Career: ${p.biography}\n  Experience: ${p.experience || 'N/A'}\n  Qualifications: ${p.qualifications || 'N/A'}\n  Source: ${p.source}`
            )
            .join('\n\n')
        : 'None retrieved.',
      '',
      '=== 2. VERIFIED FACULTY MEMBERS ===',
      context.faculty.length > 0
        ? context.faculty
            .map(
              (f) =>
                `• Name: ${f.fullName} | Designation: ${f.designation} | Department: ${f.department} | Qualification: ${f.qualification} | Specialization: ${f.specialization || 'N/A'} | Institution: ${f.institution}`
            )
            .join('\n')
        : 'None retrieved.',
      '',
      '=== 3. VERIFIED INSTITUTIONAL STATISTICS (NIRF & GROUP REPORTING) ===',
      context.statistics.length > 0
        ? context.statistics
            .map(
              (s) =>
                `• ${s.statisticName}: ${s.value} ${s.unit || ''} [Year: ${s.academicYear}, Scope: ${s.institution} (${s.institutionId})] | Source: ${s.source}`
            )
            .join('\n')
        : 'None retrieved.',
      '',
      '=== 4. VERIFIED INSTITUTIONS & HISTORY ===',
      context.institutions.length > 0
        ? context.institutions
            .map(
              (i) =>
                `• Institution: ${i.name} (${i.shortName}) | Established: ${i.establishmentDate} | Location: ${i.location}\n  History: ${i.history}\n  Affiliation: ${i.affiliation} | Approval: ${i.approval}`
            )
            .join('\n\n')
        : 'None retrieved.',
      '',
      '=== 5. VERIFIED DEPARTMENTS & COURSES ===',
      context.departments.length > 0
        ? 'Departments:\n' +
          context.departments
            .map((d) => `- ${d.name} (${d.abbreviation}) | HOD: ${d.HOD || 'N/A'} | Faculty Count: ${d.facultyCount} | Courses: ${d.courses.join(', ')}`)
            .join('\n')
        : '',
      context.courses.length > 0
        ? '\nCourses:\n' +
          context.courses
            .map((c) => `- ${c.name} (${c.level}) | Duration: ${c.duration} | Approved Intake: ${c.intake} seats | Eligibility: ${c.eligibility}`)
            .join('\n')
        : '',
      '',
      '=== 6. VERIFIED KNOWLEDGE ARTICLES ===',
      context.knowledge.length > 0
        ? context.knowledge
            .map((k, idx) => `[${idx + 1}] Title: ${k.title}\nCategory: ${k.category}\nContent: ${k.content}`)
            .join('\n\n')
        : 'None retrieved.',
      '',
      '=== 7. EVENTS & CLUBS ===',
      context.events.length > 0
        ? 'Events:\n' +
          context.events
            .map((e) => `- ${e.eventName} (${e.eventType}) on ${e.date} at ${e.venue}`)
            .join('\n')
        : '',
      context.clubs.length > 0
        ? 'Clubs:\n' +
          context.clubs
            .map((c) => `- ${c.name} (${c.category}): ${c.description}`)
            .join('\n')
        : '',
    ].join('\n');

    const systemInstruction = `You are SRIT AI Assistant, the official and intelligent guide to Shri Ram Institute of Technology (SRIT) and the Shri Ram Group, Jabalpur (https://sritgroup.net/).

CRITICAL MANDATES:
1. FACTUAL ACCURACY: Answer strictly using the verified institutional records provided below. Never fabricate, assume, or guess.
2. SCOPE DISTINCTIONS:
   - "Shri Ram Group" is the parent educational group established on 9 July 2001.
   - "Shri Ram Institute of Technology (SRIT)" is the flagship engineering institute established in 2001.
   - For statistical questions (student strength, faculty count), EXPLICITLY state the reporting year and distinction between the Shri Ram Group (10,000+ students overall) and SRIT specifically (NIRF 2025 submission reports 2,238 UG and 251 PG students = 2,489 total for 2023–24).
3. LEADERSHIP & ROLES:
   - Group Director / Director General: Dr. S. P. Kosta (renowned Indian space scientist, former Deputy Director of ISRO's Aryabhata satellite project, former Vice-Chancellor of Jabalpur University).
   - Principal of SRIT: Dr. Shailesh Gupta.
   - Head Training & Placement / TPO: Dr. Vivek Rajput.
   - Founder / Ownership questions: If asked "Who is the founder?" or "Who owns SRIT?": State that Shri Ram Group came into existence on 9 July 2001 and identifies Dr. S. P. Kosta in its leadership information, but official records do not name a private individual as legal personal owner. Never invent an owner.
4. FACULTY QUESTIONS:
   - When asked about faculty (e.g. "Who teaches Engineering Mathematics?", "Who is Dr. Reeta Malviya?"): Mention their exact designation, department, and qualifications (e.g., Dr. Reeta Malviya is a Professor in Engineering Mathematics with BSc, MSc, MPhil, and PhD).
5. CONVERSATION CONTEXT & FOLLOW-UPS:
   - Resolve pronouns ("he", "she", "his", "her", "it") using the conversation history (e.g., if asked about Dr. S. P. Kosta, a follow-up "What did he do before joining SRIT?" refers to his career at ISRO, Dept of Electronics, and Jabalpur University).
6. IF UNVERIFIED: If a college-specific inquiry has no verified information in the provided context, state:
   "I don't currently have verified information about that in the SRIT knowledge base. Would you like me to show the relevant college contact or official page?"
   (Helpline: 0761-4001933, +91 9755042292, info@sritgroup.net).
7. Keep answers structured, concise, friendly, and authoritative. Use bolding and bullet points for readability.

${contextTextBlocks}`;

    // Build conversation history contents for Gemini
    const contents: Array<{ role: 'user' | 'model'; parts: [{ text: string }] }> = [];
    const recentHistory = conversationHistory.slice(-6);
    for (const h of recentHistory) {
      contents.push({
        role: h.role === 'user' ? 'user' : 'model',
        parts: [{ text: h.content }],
      });
    }

    contents.push({
      role: 'user',
      parts: [{ text: message }],
    });

    try {
      const response = await this.ai.models.generateContent({
        model: this.modelName,
        contents,
        config: {
          systemInstruction,
          temperature: 0.1, // Minimal temperature for ultra-high factual consistency
        },
      });

      const answerText =
        response.text?.trim() ||
        'I apologize, but I could not retrieve that information. Please try again.';

      const isUnknown =
        answerText.includes("don't currently have verified") ||
        answerText.includes("do not have verified") ||
        answerText.includes("not currently have verified");

      if (isUnknown) {
        db.recordUnansweredQuestion(message, context.category);
      }

      return {
        answer: answerText,
        sources,
        matchedEvents: context.events.length > 0 ? context.events : undefined,
        matchedClubs: context.clubs.length > 0 ? context.clubs : undefined,
        matchedPersons: context.persons.length > 0 ? context.persons : undefined,
        matchedFaculty: context.faculty.length > 0 ? context.faculty : undefined,
        matchedStatistics: context.statistics.length > 0 ? context.statistics : undefined,
        isUnknownQuestion: isUnknown,
      };
    } catch (error: any) {
      console.error('Gemini API Error in AIService:', error);
      return this.generateFallbackResponse(message, context);
    }
  }

  /**
   * Deterministic local fallback in case of transient API failure
   */
  private generateFallbackResponse(query: string, context: any): ChatResponse {
    let answer = '';
    const sources: Array<{ title: string; sourceType: string; sourceUrl?: string }> = [];
    const qLower = query.toLowerCase();

    // 1. INSTITUTION category fallback
    if (context.category === 'INSTITUTION' && context.institutions.length > 0) {
      if (qLower.includes('history') || qLower.includes('when was') || qLower.includes('established') || qLower.includes('establishment')) {
        const srit = context.institutions.find((i: any) => i.id === 'inst-srit') || context.institutions[0];
        answer = `**History & Establishment of SRIT & Shri Ram Group**:\n\n• **Shri Ram Group:** Came into existence on **9 July 2001** under the academic guidance of eminent space scientist **Dr. S. P. Kosta** (former Deputy Director of ISRO Aryabhata project).\n• **Shri Ram Institute of Technology (SRIT):** Established in **2001** as the pioneer private engineering institute in the Mahakoshal region, approved by AICTE and affiliated with RGPV Bhopal.\n• **Campus Evolution:** From its flagship engineering campus, the group expanded into pharmacy (SRIP), management, and postgraduate computer applications (MCA), now educating over 10,000+ students.`;
      } else {
        answer = `**Institutions under Shri Ram Group**:\n\n` +
          context.institutions
            .map(
              (i: any) =>
                `• **${i.name} (${i.shortName})** [Est. ${i.establishmentDate}]: ${i.description}`
            )
            .join('\n\n');
      }
      context.institutions.forEach((i: any) => sources.push({ title: i.name, sourceType: i.source, sourceUrl: i.sourceUrl }));
    }
    // 2. LEADERSHIP category fallback
    else if (context.category === 'LEADERSHIP' || qLower.includes('director') || qLower.includes('principal') || qLower.includes('kosta') || qLower.includes('tpo') || qLower.includes('founder') || qLower.includes('owner') || qLower.includes('who runs') || qLower.includes('who heads')) {
      if (qLower.includes('founder') || qLower.includes('owner') || qLower.includes('owns') || qLower.includes('who runs') || qLower.includes('who heads')) {
        const kosta = context.persons.find((p: any) => p.fullName.includes('Kosta')) || context.persons[0];
        answer = `**Governance & Leadership of Shri Ram Group / SRIT**:\n\n• **Establishment:** Shri Ram Group officially came into existence on **9 July 2001**.\n• **Academic Leadership:** Official records identify **${kosta.fullName}** as **${kosta.designation}** heading the academic vision and establishment of the group.\n• **SRIT Principal:** **Dr. Shailesh Gupta** serves as the Principal of Shri Ram Institute of Technology (SRIT).\n• **Ownership:** The institute is governed by its officially appointed Governing Body and Board of Governors under AICTE and RGPV regulatory guidelines. Official documentation does not name a private individual as legal personal owner.`;
      } else if (context.persons.length > 0) {
        answer = context.persons
          .map(
            (p: any) =>
              `**${p.fullName}** (${p.designation})\n\n• **Institution:** ${p.institution} (${p.institutionId})\n• **Role & Background:** ${p.biography}`
          )
          .join('\n\n');
      } else {
        answer = `**SRIT Leadership Overview**:\n\n• **Group Director / Director General:** Dr. S. P. Kosta (Space Scientist, former Deputy Director ISRO Aryabhata Project)\n• **Principal, SRIT:** Dr. Shailesh Gupta\n• **Head Training & Placement (TPO):** Dr. Vivek Rajput`;
      }
      context.persons.forEach((p: any) => sources.push({ title: p.fullName, sourceType: p.source, sourceUrl: p.sourceUrl }));
    }
    // 3. STATISTICS category fallback
    else if (context.category === 'STATISTICS') {
      answer = `**Verified Institutional & Statistical Data**:\n\n` +
        context.statistics.map((s: any) => `• **${s.statisticName}**: ${s.value} ${s.unit || ''} (${s.institution}, Reporting Period: ${s.academicYear})`).join('\n') +
        `\n\n*Note: Total student strength across all Shri Ram Group institutions exceeds 10,000+, while SRIT specifically reported 2,489 enrolled students (2,238 UG + 251 PG) in its NIRF 2025 submission.*`;
      sources.push({ title: 'Institutional Statistics', sourceType: 'NIRF & Official Group Data', sourceUrl: 'https://sritgroup.net/nirf/' });
    }
    // 3.5 Specific HOD query handling
    else if ((qLower.includes('hod') || qLower.includes('head of department')) && context.departments.length > 0) {
      if (context.departments.length === 1) {
        const d = context.departments[0];
        const hodFac = context.faculty.find((f: any) => d.HOD && f.fullName.includes(d.HOD.replace('Dr. ', '').replace('Prof. ', '')));
        answer = `**Head of Department (HOD) — ${d.name} (${d.abbreviation})**:\n\n• **HOD:** **${d.HOD || 'N/A'}**\n• **Department:** ${d.name}\n• **Faculty Strength:** ${d.facultyCount} faculty members\n• **Courses Offered:** ${d.courses.join(', ')}\n• **Contact:** ${d.contact || 'info@sritgroup.net'}` +
          (hodFac ? `\n• **Qualifications:** ${hodFac.qualification}\n• **Designation:** ${hodFac.designation}` : '');
      } else {
        answer = `**Heads of Departments (HODs) at SRIT**:\n\n` +
          context.departments.map((d: any) => `• **${d.name} (${d.abbreviation})**: **${d.HOD || 'N/A'}** (Faculty Count: ${d.facultyCount})`).join('\n');
      }
      sources.push({ title: 'Department Directory', sourceType: 'Official SRIT Records', sourceUrl: 'https://sritgroup.net/' });
    }
    // 4. FACULTY category fallback (prioritize if category is FACULTY or asking about a specific person/professor)
    else if (
      context.category === 'FACULTY' ||
      (context.faculty.length > 0 &&
        (qLower.includes('professor') ||
          qLower.includes('prof') ||
          qLower.includes('faculty') ||
          qLower.includes('teaches') ||
          qLower.includes('belong') ||
          qLower.includes('qualification') ||
          qLower.includes('qualifications') ||
          qLower.includes('designation')))
    ) {
      const firstFacCoreName = context.faculty[0]?.fullName?.toLowerCase().replace('prof. ', '').replace('dr. ', '').trim();
      const hasExactName = firstFacCoreName && qLower.includes(firstFacCoreName);
      if (context.faculty.length === 1 || hasExactName) {
        const f = context.faculty[0];
        answer = `**${f.fullName}**\n\n• **Department:** ${f.department}\n• **Designation:** ${f.designation}\n• **Qualifications:** ${f.qualification}\n• **Specialization:** ${f.specialization || 'Engineering Education'}\n• **Institution:** ${f.institution}`;
      } else if (context.faculty.length > 1) {
        answer = `**Faculty Members (${context.faculty.length} found)**:\n\n` +
          context.faculty
            .map(
              (f: any) =>
                `• **${f.fullName}** — ${f.designation}, ${f.department} (Qualifications: ${f.qualification})`
            )
            .join('\n');
      } else {
        answer = `SRIT features over 140+ qualified regular faculty members across Computer Science, AI & Machine Learning, Data Science, Electronics & Communication, Mechanical, Civil, Electrical, and Applied Sciences.`;
      }
      sources.push({ title: 'Faculty Directory', sourceType: 'Official SRIT Records', sourceUrl: 'https://sritgroup.net/faculty/' });
    }
    // 5. DEPARTMENT category fallback
    else if (
      context.category === 'DEPARTMENT' ||
      (context.departments.length > 0 &&
        (qLower.includes('department') || qLower.includes('branches') || qLower.includes('hod')))
    ) {
      if (qLower.includes('hod') || qLower.includes('head')) {
        answer = context.departments
          .map(
            (d: any) =>
              `• **${d.name} (${d.abbreviation})**: Head of Department (HOD) is **${d.HOD || 'N/A'}** (Faculty Count: ${d.facultyCount})`
          )
          .join('\n');
      } else {
        answer = `**Academic Departments at SRIT**:\n\n` +
          context.departments
            .map(
              (d: any) =>
                `• **${d.name} (${d.abbreviation})** — HOD: ${d.HOD || 'N/A'} | Faculty Count: ${d.facultyCount} | Courses: ${d.courses.join(', ')}`
            )
            .join('\n');
      }
      sources.push({ title: 'Academic Departments', sourceType: 'Official SRIT Directory', sourceUrl: 'https://sritgroup.net/' });
    }
    // 6. Knowledge Items fallback
    else if (context.knowledge.length > 0) {
      answer = context.knowledge[0].content;
      sources.push({ title: context.knowledge[0].title, sourceType: context.knowledge[0].sourceType, sourceUrl: context.knowledge[0].sourceUrl || 'https://sritgroup.net/' });
    }
    // 7. General contact fallback
    else {
      answer =
        "I don't currently have verified information about that in the SRIT knowledge base. Would you like me to show the relevant college contact or official page?\n\n• Phone: 9755042292, 0761-4001933\n• Email: info@sritgroup.net\n• Website: https://sritgroup.net/";
      db.recordUnansweredQuestion(query, 'General');
      return { answer, sources: [], isUnknownQuestion: true };
    }

    return {
      answer,
      sources,
      matchedEvents: context.events.length > 0 ? context.events : undefined,
      matchedClubs: context.clubs.length > 0 ? context.clubs : undefined,
      matchedPersons: context.persons.length > 0 ? context.persons : undefined,
      matchedFaculty: context.faculty.length > 0 ? context.faculty : undefined,
      matchedStatistics: context.statistics.length > 0 ? context.statistics : undefined,
    };
  }

  /**
   * "Teach the AI" entity extraction
   */
  async extractEntityFromText(rawText: string): Promise<DetectedEntity> {
    const prompt = `Analyze the following college announcement or information text for Shri Ram Institute of Technology (SRIT):
"${rawText}"

Extract structured information. Return JSON with the specified schema.`;

    try {
      const response = await this.ai.models.generateContent({
        model: this.modelName,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              entityType: {
                type: Type.STRING,
                description: "Must be 'event', 'knowledge', or 'club'",
              },
              titleOrName: {
                type: Type.STRING,
                description: 'Title of the knowledge item, event name, or club name',
              },
              categoryOrType: {
                type: Type.STRING,
                description: 'e.g. Technical Fest, Workshop, Academics, Student Services, Sports',
              },
              date: {
                type: Type.STRING,
                description: 'YYYY-MM-DD format if an event date is mentioned, or empty string',
              },
              startTime: {
                type: Type.STRING,
                description: 'Event start time if mentioned (e.g. 10:00 AM)',
              },
              venue: {
                type: Type.STRING,
                description: 'Venue/location on campus',
              },
              eligibility: {
                type: Type.STRING,
                description: 'Eligible students',
              },
              registrationDeadline: {
                type: Type.STRING,
                description: 'Registration deadline YYYY-MM-DD if mentioned',
              },
              descriptionOrContent: {
                type: Type.STRING,
                description: 'Detailed description or clean knowledge content',
              },
              summary: {
                type: Type.STRING,
                description: 'Brief 1-sentence summary',
              },
            },
            required: [
              'entityType',
              'titleOrName',
              'categoryOrType',
              'descriptionOrContent',
              'summary',
            ],
          },
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      return {
        entityType: parsed.entityType || 'knowledge',
        titleOrName: parsed.titleOrName || 'Admin Announcement',
        categoryOrType: parsed.categoryOrType || 'General',
        date: parsed.date || '',
        startTime: parsed.startTime || '',
        venue: parsed.venue || '',
        eligibility: parsed.eligibility || 'Open to all SRIT students',
        registrationDeadline: parsed.registrationDeadline || '',
        descriptionOrContent: parsed.descriptionOrContent || rawText,
        summary: parsed.summary || 'Information extracted from admin submission',
      };
    } catch (err) {
      console.error('Error in extractEntityFromText:', err);
      return {
        entityType: 'knowledge',
        titleOrName: 'Admin Update',
        categoryOrType: 'General',
        descriptionOrContent: rawText,
        summary: 'Extracted college update',
      };
    }
  }
}

export const aiService = new AIService();
