import { Router, Request, Response, NextFunction } from 'express';
import { db } from './db.js';
import { aiService } from './aiService.js';
import { syncService } from './syncService.js';
import { User } from './types.js';

export const apiRouter = Router();

function getUserFromRequest(req: Request): User | null {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.substring(7);
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const [userId] = decoded.split(':');
    return db.findUserById(userId) || null;
  } catch {
    return null;
  }
}

function requireAuth(req: Request, res: Response, next: NextFunction) {
  const user = getUserFromRequest(req);
  if (!user) {
    res.status(401).json({ error: 'Unauthorized: Admin authentication required.' });
    return;
  }
  (req as any).user = user;
  next();
}

function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const user = (req as any).user as User;
  if (!user || user.role !== 'ADMIN') {
    res.status(403).json({ error: 'Forbidden: Super Administrator role required.' });
    return;
  }
  next();
}

// ==========================================
// 1. AUTHENTICATION ROUTES
// ==========================================

apiRouter.post('/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required' });
    return;
  }

  const user = db.findUserByEmail(email);
  if (!user || user.passwordHash !== password) {
    res.status(401).json({ error: 'Invalid email or password' });
    return;
  }

  const token = Buffer.from(`${user.id}:${user.email}:${Date.now()}`).toString('base64');
  const { passwordHash, ...safeUser } = user;

  db.recordAuditLog({
    action: 'USER_LOGIN',
    entityType: 'User',
    entityId: user.id,
    entityTitle: user.name,
    details: `User ${user.email} (${user.role}) logged in`,
    performedBy: user.name,
  });

  res.json({ token, user: safeUser });
});

apiRouter.get('/auth/me', (req, res) => {
  const user = getUserFromRequest(req);
  if (!user) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }
  res.json({ user });
});

// ==========================================
// 2. CHAT & CONVERSATION ROUTES
// ==========================================

apiRouter.post('/chat', async (req, res) => {
  try {
    const { message, conversationId, roleMode } = req.body;
    if (!message || typeof message !== 'string' || !message.trim()) {
      res.status(400).json({ error: 'Message text is required' });
      return;
    }

    let convId = conversationId;
    let conv = convId ? db.getConversation(convId) : null;
    if (!conv) {
      conv = db.createConversation(message.trim().slice(0, 35));
      convId = conv.id;
    }

    // Save user message to database
    db.addMessageToConversation(convId, {
      role: 'user',
      content: message.trim(),
    });

    // Call AI Service with conversational history, persistent student context, and role mode
    const aiResult = await aiService.generateChatResponse(
      message.trim(),
      conv.messages,
      conv.studentContext,
      roleMode || 'general'
    );

    // If student context updated, persist it to the conversation
    if (aiResult.extractedContext) {
      conv = db.updateConversationContext(convId, aiResult.extractedContext) || conv;
    }

    // Save AI message to database
    const assistantMessage = db.addMessageToConversation(convId, {
      role: 'assistant',
      content: aiResult.answer,
      sources: aiResult.sources,
      matchedEvents: aiResult.matchedEvents,
      matchedClubs: aiResult.matchedClubs,
      matchedPersons: aiResult.matchedPersons,
      matchedFaculty: aiResult.matchedFaculty,
      matchedStatistics: aiResult.matchedStatistics,
      matchedSubjects: aiResult.matchedSubjects,
      matchedAffiliations: aiResult.matchedAffiliations,
      matchedPlacements: aiResult.matchedPlacements,
      matchedAttendanceRules: aiResult.matchedAttendanceRules,
      matchedAchievements: aiResult.matchedAchievements,
      matchedFees: aiResult.matchedFees,
      matchedScholarships: aiResult.matchedScholarships,
      matchedAdmissions: aiResult.matchedAdmissions,
      isUnknownQuestion: aiResult.isUnknownQuestion,
      ticketId: aiResult.ticketId,
      needsClarification: aiResult.needsClarification,
      clarificationPrompt: aiResult.clarificationPrompt,
    });

    res.json({
      conversationId: convId,
      studentContext: conv.studentContext,
      message: assistantMessage,
      sources: aiResult.sources,
      matchedEvents: aiResult.matchedEvents,
      matchedClubs: aiResult.matchedClubs,
      matchedPersons: aiResult.matchedPersons,
      matchedFaculty: aiResult.matchedFaculty,
      matchedStatistics: aiResult.matchedStatistics,
      matchedSubjects: aiResult.matchedSubjects,
      matchedAffiliations: aiResult.matchedAffiliations,
      matchedPlacements: aiResult.matchedPlacements,
      matchedAttendanceRules: aiResult.matchedAttendanceRules,
      matchedAchievements: aiResult.matchedAchievements,
      matchedFees: aiResult.matchedFees,
      matchedScholarships: aiResult.matchedScholarships,
      matchedAdmissions: aiResult.matchedAdmissions,
      isUnknownQuestion: aiResult.isUnknownQuestion,
      ticketId: aiResult.ticketId,
      needsClarification: aiResult.needsClarification,
      clarificationPrompt: aiResult.clarificationPrompt,
    });
  } catch (error: any) {
    console.error('Chat endpoint error:', error);
    res.status(500).json({
      error: 'Something went wrong while retrieving that information. Please try again.',
    });
  }
});

apiRouter.post('/chat/summarize', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || typeof text !== 'string') {
      res.status(400).json({ error: 'Text content is required' });
      return;
    }
    const summary = await aiService.summarizeResponse(text);
    res.json({ summary });
  } catch (err: any) {
    console.error('Summarize error:', err);
    res.status(500).json({ error: 'Failed to summarize' });
  }
});

// ==========================================
// 2B. ADVANCED AI CAMPUS SUITE ENDPOINTS
// ==========================================

// AI Feature 1: RGPV Exam Revision & Study Schedule Planner
apiRouter.post('/ai/study-plan', async (req, res) => {
  try {
    const { branch, semester, weeksUntilExam, targetTopics } = req.body;
    if (!branch || !semester) {
      res.status(400).json({ error: 'Branch and semester are required.' });
      return;
    }
    const result = await aiService.generateStudyPlan({
      branch: String(branch),
      semester: Number(semester),
      weeksUntilExam: weeksUntilExam ? Number(weeksUntilExam) : 4,
      targetTopics: targetTopics ? String(targetTopics) : undefined,
    });
    res.json(result);
  } catch (err: any) {
    console.error('AI Study Plan error:', err);
    res.status(500).json({ error: 'Failed to generate study plan.' });
  }
});

// AI Feature 2: Placement & Interview Coach
apiRouter.post('/ai/placement-prep', async (req, res) => {
  try {
    const { targetCompany, branch, targetRole } = req.body;
    if (!targetCompany) {
      res.status(400).json({ error: 'Target company name is required.' });
      return;
    }
    const result = await aiService.generatePlacementPrep({
      targetCompany: String(targetCompany),
      branch: branch ? String(branch) : 'Computer Science & Engineering',
      targetRole: targetRole ? String(targetRole) : 'Software Engineer',
    });
    res.json(result);
  } catch (err: any) {
    console.error('AI Placement Prep error:', err);
    res.status(500).json({ error: 'Failed to generate placement preparation guide.' });
  }
});

// AI Feature 3: Attendance Condonation & Medical Application Drafter
apiRouter.post('/ai/condonation-letter', async (req, res) => {
  try {
    const {
      studentName,
      enrollmentNo,
      branch,
      semester,
      attendancePercent,
      medicalReason,
      startDate,
      endDate,
      doctorName,
    } = req.body;

    if (!studentName || !branch || !semester || attendancePercent === undefined || !medicalReason) {
      res.status(400).json({
        error: 'Student name, branch, semester, attendance percentage, and medical reason are required.',
      });
      return;
    }

    const result = await aiService.generateCondonationLetter({
      studentName: String(studentName),
      enrollmentNo: enrollmentNo ? String(enrollmentNo) : '',
      branch: String(branch),
      semester: Number(semester),
      attendancePercent: Number(attendancePercent),
      medicalReason: String(medicalReason),
      startDate: startDate ? String(startDate) : undefined,
      endDate: endDate ? String(endDate) : undefined,
      doctorName: doctorName ? String(doctorName) : undefined,
    });
    res.json(result);
  } catch (err: any) {
    console.error('AI Condonation Letter error:', err);
    res.status(500).json({ error: 'Failed to generate condonation letter.' });
  }
});

// AI Feature 4: Academic Concept & Code Explainer
apiRouter.post('/ai/explain-concept', async (req, res) => {
  try {
    const { concept, subject, semester } = req.body;
    if (!concept || typeof concept !== 'string' || !concept.trim()) {
      res.status(400).json({ error: 'Academic concept query is required.' });
      return;
    }
    const result = await aiService.explainAcademicConcept({
      concept: concept.trim(),
      subject: subject ? String(subject) : undefined,
      semester: semester ? Number(semester) : undefined,
    });
    res.json(result);
  } catch (err: any) {
    console.error('AI Concept Explainer error:', err);
    res.status(500).json({ error: 'Failed to explain academic concept.' });
  }
});

// AI Feature 5: Notice & Circular Analyzer
apiRouter.post('/ai/analyze-notice', async (req, res) => {
  try {
    const { noticeText } = req.body;
    if (!noticeText || typeof noticeText !== 'string' || !noticeText.trim()) {
      res.status(400).json({ error: 'Notice text is required for analysis.' });
      return;
    }
    const result = await aiService.analyzeNotice({
      noticeText: noticeText.trim(),
    });
    res.json(result);
  } catch (err: any) {
    console.error('AI Notice Analyzer error:', err);
    res.status(500).json({ error: 'Failed to analyze campus notice.' });
  }
});

// AI Feature 6: Smart Attendance & Recovery Calculator
apiRouter.post('/ai/attendance-calc', (req, res) => {
  try {
    const { totalClasses, attendedClasses } = req.body;
    if (totalClasses === undefined || attendedClasses === undefined) {
      res.status(400).json({ error: 'Total classes and attended classes are required.' });
      return;
    }
    const result = aiService.calculateAttendance({
      totalClasses: Number(totalClasses),
      attendedClasses: Number(attendedClasses),
    });
    res.json(result);
  } catch (err: any) {
    console.error('AI Attendance Calc error:', err);
    res.status(500).json({ error: 'Failed to calculate attendance.' });
  }
});

// AI Feature 7: Google Maps Grounded Location & Directions Intelligence
apiRouter.post('/ai/maps-query', async (req, res) => {
  try {
    const { query, userLocation } = req.body;
    if (!query || typeof query !== 'string' || !query.trim()) {
      res.status(400).json({ error: 'Query text is required.' });
      return;
    }
    const result = await aiService.queryMapsGrounding(
      query.trim(),
      userLocation ? String(userLocation) : undefined
    );
    res.json(result);
  } catch (err: any) {
    console.error('AI Maps Query error:', err);
    res.status(500).json({ error: 'Failed to resolve location and directions.' });
  }
});

apiRouter.get('/conversations', (req, res) => {
  const conversations = db.listConversations();
  res.json({ conversations });
});

apiRouter.get('/conversations/:id', (req, res) => {
  const conv = db.getConversation(req.params.id);
  if (!conv) {
    res.status(404).json({ error: 'Conversation not found' });
    return;
  }
  res.json({ conversation: conv });
});

apiRouter.post('/conversations', (req, res) => {
  const { title } = req.body;
  const conv = db.createConversation(title || 'New Conversation');
  res.json({ conversation: conv });
});

apiRouter.post('/conversations/:id/clear', (req, res) => {
  const ok = db.clearConversation(req.params.id);
  if (!ok) {
    res.status(404).json({ error: 'Conversation not found' });
    return;
  }
  res.json({ success: true });
});

apiRouter.delete('/conversations/:id', (req, res) => {
  const ok = db.deleteConversation(req.params.id);
  res.json({ success: ok });
});

// ==========================================
// 3. INSTITUTION & LEADERSHIP ROUTES
// ==========================================

apiRouter.get('/institutions', (_req, res) => {
  res.json({ institutions: db.listInstitutions() });
});

apiRouter.get('/institutions/:id', (req, res) => {
  const inst = db.getInstitutionById(req.params.id);
  if (!inst) {
    res.status(404).json({ error: 'Institution not found' });
    return;
  }
  res.json({ institution: inst });
});

apiRouter.get('/persons', (req, res) => {
  const { search, role, institutionId } = req.query;
  const persons = db.listPersons({
    search: search as string,
    role: role as string,
    institutionId: institutionId as string,
  });
  res.json({ persons });
});

apiRouter.get('/persons/:id', (req, res) => {
  const p = db.getPersonById(req.params.id);
  if (!p) {
    res.status(404).json({ error: 'Person not found' });
    return;
  }
  res.json({ person: p });
});

apiRouter.post('/persons', requireAuth, (req, res) => {
  const user = (req as any).user as User;
  const newPerson = db.createPerson(req.body, user.name);
  res.status(201).json({ person: newPerson });
});

apiRouter.put('/persons/:id', requireAuth, (req, res) => {
  const user = (req as any).user as User;
  const updated = db.updatePerson(req.params.id, req.body, user.name);
  if (!updated) {
    res.status(404).json({ error: 'Person not found' });
    return;
  }
  res.json({ person: updated });
});

apiRouter.delete('/persons/:id', requireAuth, requireAdmin, (req, res) => {
  const user = (req as any).user as User;
  const ok = db.deletePerson(req.params.id, user.name);
  res.json({ success: ok });
});

// ==========================================
// 4. FACULTY ROUTES
// ==========================================

apiRouter.get('/faculty', (req, res) => {
  const { search, department, designation, institutionId } = req.query;
  const faculty = db.listFaculty({
    search: search as string,
    department: department as string,
    designation: designation as string,
    institutionId: institutionId as string,
  });
  res.json({ faculty, total: faculty.length });
});

apiRouter.get('/faculty/:id', (req, res) => {
  const f = db.getFacultyById(req.params.id);
  if (!f) {
    res.status(404).json({ error: 'Faculty member not found' });
    return;
  }
  res.json({ faculty: f });
});

apiRouter.post('/faculty', requireAuth, (req, res) => {
  const user = (req as any).user as User;
  const newFaculty = db.createFaculty(req.body, user.name);
  res.status(201).json({ faculty: newFaculty });
});

apiRouter.put('/faculty/:id', requireAuth, (req, res) => {
  const user = (req as any).user as User;
  const updated = db.updateFaculty(req.params.id, req.body, user.name);
  if (!updated) {
    res.status(404).json({ error: 'Faculty member not found' });
    return;
  }
  res.json({ faculty: updated });
});

apiRouter.delete('/faculty/:id', requireAuth, requireAdmin, (req, res) => {
  const user = (req as any).user as User;
  const ok = db.deleteFaculty(req.params.id, user.name);
  res.json({ success: ok });
});

// ==========================================
// 5. DEPARTMENTS & COURSES
// ==========================================

apiRouter.get('/departments', (req, res) => {
  const { search, institutionId } = req.query;
  const departments = db.listDepartments({
    search: search as string,
    institutionId: institutionId as string,
  });
  res.json({ departments });
});

apiRouter.post('/departments', requireAuth, (req, res) => {
  const user = (req as any).user as User;
  const newDept = db.createDepartment(req.body, user.name);
  res.status(201).json({ department: newDept });
});

apiRouter.put('/departments/:id', requireAuth, (req, res) => {
  const user = (req as any).user as User;
  const updated = db.updateDepartment(req.params.id, req.body, user.name);
  res.json({ department: updated });
});

apiRouter.get('/courses', (req, res) => {
  const { search, department, level, institutionId } = req.query;
  const courses = db.listCourses({
    search: search as string,
    department: department as string,
    level: level as string,
    institutionId: institutionId as string,
  });
  res.json({ courses });
});

apiRouter.post('/courses', requireAuth, (req, res) => {
  const user = (req as any).user as User;
  const newCourse = db.createCourse(req.body, user.name);
  res.status(201).json({ course: newCourse });
});

apiRouter.put('/courses/:id', requireAuth, (req, res) => {
  const user = (req as any).user as User;
  const updated = db.updateCourse(req.params.id, req.body, user.name);
  res.json({ course: updated });
});

// ==========================================
// 6. INSTITUTIONAL STATISTICS (NIRF & GROUP)
// ==========================================

apiRouter.get('/statistics', (req, res) => {
  const { category, academicYear, institutionId } = req.query;
  const statistics = db.listStatistics({
    category: category as string,
    academicYear: academicYear as string,
    institutionId: institutionId as string,
  });
  res.json({ statistics });
});

apiRouter.post('/statistics', requireAuth, (req, res) => {
  const user = (req as any).user as User;
  const newStat = db.createStatistic(req.body, user.name);
  res.status(201).json({ statistic: newStat });
});

apiRouter.put('/statistics/:id', requireAuth, (req, res) => {
  const user = (req as any).user as User;
  const updated = db.updateStatistic(req.params.id, req.body, user.name);
  res.json({ statistic: updated });
});

apiRouter.delete('/statistics/:id', requireAuth, requireAdmin, (req, res) => {
  const user = (req as any).user as User;
  const ok = db.deleteStatistic(req.params.id, user.name);
  res.json({ success: ok });
});

// ==========================================
// 7. KNOWLEDGE BASE ROUTES
// ==========================================

apiRouter.get('/knowledge', (req, res) => {
  const { search, category, status, publishedOnly } = req.query;
  const items = db.listKnowledge({
    search: search as string,
    category: category as string,
    status: status as string,
    publishedOnly: publishedOnly === 'true',
  });
  res.json({ items, total: items.length });
});

apiRouter.get('/knowledge/:id', (req, res) => {
  const item = db.getKnowledgeById(req.params.id);
  if (!item) {
    res.status(404).json({ error: 'Knowledge item not found' });
    return;
  }
  res.json({ item });
});

apiRouter.post('/knowledge', requireAuth, (req, res) => {
  const user = (req as any).user as User;
  const { title, content, category, subcategory, sourceType, sourceUrl, status } = req.body;

  if (!title || !content || !category) {
    res.status(400).json({ error: 'Title, content, and category are required' });
    return;
  }

  const isPublished = status !== 'Draft';
  const newItem = db.createKnowledge({
    title,
    content,
    category,
    subcategory,
    sourceType: sourceType || 'Admin',
    sourceUrl: sourceUrl || '',
    status: isPublished ? 'Published' : 'Draft',
    published: isPublished,
    createdBy: user.name,
  });

  res.status(201).json({ item: newItem });
});

apiRouter.put('/knowledge/:id', requireAuth, (req, res) => {
  const user = (req as any).user as User;
  const updated = db.updateKnowledge(req.params.id, req.body, user.name);
  if (!updated) {
    res.status(404).json({ error: 'Knowledge item not found' });
    return;
  }
  res.json({ item: updated });
});

apiRouter.delete('/knowledge/:id', requireAuth, requireAdmin, (req, res) => {
  const user = (req as any).user as User;
  const ok = db.deleteKnowledge(req.params.id, user.name);
  if (!ok) {
    res.status(404).json({ error: 'Knowledge item not found' });
    return;
  }
  res.json({ success: true });
});

// ==========================================
// 8. EVENT MANAGEMENT ROUTES
// ==========================================

apiRouter.get('/events', (req, res) => {
  const user = getUserFromRequest(req);
  const { search, eventType, status, filterDate, targetMonth, targetYear } = req.query;

  const events = db.listEvents({
    search: search as string,
    eventType: eventType as string,
    status: status as string,
    publishedOnly: !user,
    filterDate: filterDate as any,
    targetMonth: targetMonth ? parseInt(targetMonth as string, 10) : undefined,
    targetYear: targetYear ? parseInt(targetYear as string, 10) : undefined,
  });

  res.json({ events, total: events.length });
});

apiRouter.get('/events/:id', (req, res) => {
  const event = db.getEventById(req.params.id);
  if (!event) {
    res.status(404).json({ error: 'Event not found' });
    return;
  }
  res.json({ event });
});

apiRouter.post('/events', requireAuth, (req, res) => {
  const user = (req as any).user as User;
  const {
    eventName,
    eventType,
    description,
    date,
    startTime,
    endTime,
    venue,
    organizer,
    department,
    eligibility,
    registrationUrl,
    registrationDeadline,
    contactPerson,
    contactPhone,
    contactEmail,
    poster,
    status,
  } = req.body;

  if (!eventName || !date || !venue) {
    res.status(400).json({ error: 'Event name, date, and venue are required' });
    return;
  }

  const newEvent = db.createEvent({
    eventName,
    eventType: eventType || 'College Event',
    description: description || '',
    date,
    startTime: startTime || '10:00 AM',
    endTime,
    venue,
    organizer: organizer || 'Shri Ram Institute of Technology',
    department,
    eligibility: eligibility || 'Open to all SRIT students',
    registrationUrl,
    registrationDeadline,
    contactPerson,
    contactPhone,
    contactEmail,
    poster,
    status: status || 'Published',
    year: new Date(date).getFullYear() || 2026,
    publishedBy: user.name,
  });

  res.status(201).json({ event: newEvent });
});

apiRouter.put('/events/:id', requireAuth, (req, res) => {
  const user = (req as any).user as User;
  const updated = db.updateEvent(req.params.id, req.body, user.name);
  if (!updated) {
    res.status(404).json({ error: 'Event not found' });
    return;
  }
  res.json({ event: updated });
});

apiRouter.delete('/events/:id', requireAuth, requireAdmin, (req, res) => {
  const user = (req as any).user as User;
  const ok = db.deleteEvent(req.params.id, user.name);
  if (!ok) {
    res.status(404).json({ error: 'Event not found' });
    return;
  }
  res.json({ success: true });
});

// ==========================================
// 9. CLUBS & ACTIVITIES ROUTES
// ==========================================

apiRouter.get('/clubs', (req, res) => {
  const user = getUserFromRequest(req);
  const { search, category } = req.query;
  const clubs = db.listClubs({
    search: search as string,
    category: category as string,
    publishedOnly: !user,
  });
  res.json({ clubs, total: clubs.length });
});

apiRouter.get('/clubs/:id', (req, res) => {
  const club = db.getClubById(req.params.id);
  if (!club) {
    res.status(404).json({ error: 'Club not found' });
    return;
  }
  res.json({ club });
});

apiRouter.post('/clubs', requireAuth, (req, res) => {
  const user = (req as any).user as User;
  const {
    name,
    category,
    description,
    activities,
    eligibility,
    meetingInformation,
    contactPerson,
    contactEmail,
    contactPhone,
    source,
  } = req.body;

  if (!name || !description) {
    res.status(400).json({ error: 'Club name and description are required' });
    return;
  }

  const newClub = db.createClub(
    {
      name,
      category: category || 'General',
      description,
      activities: Array.isArray(activities) ? activities : [activities || 'Student activities'],
      eligibility: eligibility || 'Open to all SRIT students',
      meetingInformation,
      contactPerson,
      contactEmail,
      contactPhone,
      source: source || 'Admin Created',
      published: true,
    },
    user.name
  );

  res.status(201).json({ club: newClub });
});

apiRouter.put('/clubs/:id', requireAuth, (req, res) => {
  const user = (req as any).user as User;
  const updated = db.updateClub(req.params.id, req.body, user.name);
  if (!updated) {
    res.status(404).json({ error: 'Club not found' });
    return;
  }
  res.json({ club: updated });
});

apiRouter.delete('/clubs/:id', requireAuth, requireAdmin, (req, res) => {
  const user = (req as any).user as User;
  const ok = db.deleteClub(req.params.id, user.name);
  if (!ok) {
    res.status(404).json({ error: 'Club not found' });
    return;
  }
  res.json({ success: true });
});

// ==========================================
// 10. "TEACH THE AI" ROUTES
// ==========================================

apiRouter.post('/teach-ai/extract', requireAuth, async (req, res) => {
  try {
    const { rawText } = req.body;
    if (!rawText || typeof rawText !== 'string' || !rawText.trim()) {
      res.status(400).json({ error: 'Raw text description is required' });
      return;
    }

    const detected = await aiService.extractEntityFromText(rawText.trim());
    res.json({ detected });
  } catch (err: any) {
    console.error('Error in teach-ai extract:', err);
    res.status(500).json({ error: 'Failed to extract structured information' });
  }
});

apiRouter.post('/teach-ai/publish', requireAuth, (req, res) => {
  const user = (req as any).user as User;
  const { detected } = req.body;

  if (!detected || !detected.entityType) {
    res.status(400).json({ error: 'Detected entity payload is required' });
    return;
  }

  if (detected.entityType === 'event') {
    const event = db.createEvent({
      eventName: detected.titleOrName,
      eventType: detected.categoryOrType || 'Workshop',
      description: detected.descriptionOrContent,
      date: detected.date || new Date().toISOString().split('T')[0],
      startTime: detected.startTime || '10:00 AM',
      venue: detected.venue || 'SRIT Campus',
      organizer: 'Shri Ram Institute of Technology',
      eligibility: detected.eligibility || 'All SRIT Students',
      registrationDeadline: detected.registrationDeadline,
      status: 'Published',
      year: detected.date ? new Date(detected.date).getFullYear() : 2026,
      publishedBy: user.name,
    });

    db.createKnowledge({
      title: detected.titleOrName,
      content: `${detected.descriptionOrContent}. Date: ${detected.date || 'TBD'}. Venue: ${detected.venue || 'Campus'}. Eligibility: ${detected.eligibility || 'All students'}.`,
      category: 'Events',
      sourceType: 'Admin',
      sourceUrl: 'Admin Teach AI Feature',
      status: 'Published',
      published: true,
      createdBy: user.name,
    });

    res.json({ success: true, type: 'event', item: event });
  } else if (detected.entityType === 'club') {
    const club = db.createClub(
      {
        name: detected.titleOrName,
        category: detected.categoryOrType || 'Activity',
        description: detected.descriptionOrContent,
        activities: [detected.summary],
        eligibility: detected.eligibility || 'All SRIT Students',
        source: 'Admin Teach AI',
        published: true,
      },
      user.name
    );
    res.json({ success: true, type: 'club', item: club });
  } else {
    const item = db.createKnowledge({
      title: detected.titleOrName,
      category: (detected.categoryOrType as any) || 'General',
      content: detected.descriptionOrContent,
      sourceType: 'Admin',
      sourceUrl: 'Admin Teach AI Feature',
      status: 'Published',
      published: true,
      createdBy: user.name,
    });
    res.json({ success: true, type: 'knowledge', item });
  }
});

// ==========================================
// 11. DOCUMENT UPLOAD & INGESTION
// ==========================================

apiRouter.get('/documents', requireAuth, (req, res) => {
  const documents = db.listDocuments();
  res.json({ documents });
});

apiRouter.post('/documents/upload', requireAuth, (req, res) => {
  const user = (req as any).user as User;
  const { filename, fileType, textContent, category, source } = req.body;

  if (!filename || !textContent || !textContent.trim()) {
    res.status(400).json({ error: 'Filename and document text content are required' });
    return;
  }

  const doc = db.createDocument({
    filename,
    fileType: fileType || 'txt',
    extractedText: textContent.trim(),
    category: (category as any) || 'General',
    source: source || 'Uploaded Circular',
    fileSize: Buffer.byteLength(textContent, 'utf-8'),
    uploader: user.name,
    status: 'Indexed',
  });

  const knowledgeItem = db.createKnowledge({
    title: filename.replace(/\.[^/.]+$/, ''),
    content: textContent.trim(),
    category: (category as any) || 'General',
    subcategory: 'Uploaded Document',
    sourceType: 'Uploaded Document',
    sourceUrl: `Document: ${filename}`,
    status: 'Published',
    published: true,
    createdBy: user.name,
  });

  res.status(201).json({ document: doc, knowledgeItem });
});

apiRouter.delete('/documents/:id', requireAuth, requireAdmin, (req, res) => {
  const user = (req as any).user as User;
  const ok = db.deleteDocument(req.params.id, user.name);
  if (!ok) {
    res.status(404).json({ error: 'Document not found' });
    return;
  }
  res.json({ success: true });
});

// ==========================================
// 12. UNANSWERED QUESTIONS
// ==========================================

apiRouter.get('/unanswered-questions', requireAuth, (req, res) => {
  const questions = db.listUnansweredQuestions();
  res.json({ questions });
});

apiRouter.post('/unanswered-questions/:id/resolve', requireAuth, (req, res) => {
  const user = (req as any).user as User;
  const { adminAnswer, createKnowledgeItem } = req.body;

  if (!adminAnswer || !adminAnswer.trim()) {
    res.status(400).json({ error: 'Official admin answer is required' });
    return;
  }

  const result = db.resolveQuestion(
    req.params.id,
    adminAnswer.trim(),
    user.name,
    createKnowledgeItem !== false
  );

  if (!result) {
    res.status(404).json({ error: 'Question not found' });
    return;
  }

  res.json(result);
});

apiRouter.post('/unanswered-questions/:id/ignore', requireAuth, (req, res) => {
  const ok = db.ignoreQuestion(req.params.id);
  res.json({ success: ok });
});

apiRouter.delete('/unanswered-questions/:id', requireAuth, (req, res) => {
  const ok = db.deleteQuestion(req.params.id);
  res.json({ success: ok });
});

// ==========================================
// 13. FEEDBACK ROUTES
// ==========================================

apiRouter.post('/feedback', (req, res) => {
  const { messageId, question, answer, rating, reason, comment } = req.body;
  if (!rating || !messageId) {
    res.status(400).json({ error: 'Rating and message ID are required' });
    return;
  }

  const feedback = db.recordFeedback({
    messageId,
    question: question || 'Student Inquiry',
    answer: answer || '',
    rating,
    reason,
    comment,
  });

  res.status(201).json({ feedback });
});

apiRouter.get('/feedback', requireAuth, (req, res) => {
  const feedbacks = db.listFeedbacks();
  res.json({ feedbacks });
});

// ==========================================
// 14. OFFICIAL WEBSITE SYNC
// ==========================================

apiRouter.post('/sync-website', requireAuth, async (req, res) => {
  const user = (req as any).user as User;
  try {
    const report = await syncService.syncWebsite(user.name);
    res.json({ report });
  } catch (err: any) {
    console.error('Website sync error:', err);
    res.status(500).json({
      error: `Sync failed: ${err.message || 'Could not connect to sritgroup.net'}`,
    });
  }
});

// ==========================================
// 15. ANALYTICS & AUDIT LOGS & SEARCH
// ==========================================

apiRouter.get('/analytics', requireAuth, (req, res) => {
  const stats = db.getAnalytics();
  res.json({ analytics: stats });
});

apiRouter.get('/audit-logs', requireAuth, (req, res) => {
  const logs = db.listAuditLogs();
  res.json({ logs });
});

apiRouter.get('/global-search', requireAuth, (req, res) => {
  const q = (req.query.q as string) || '';
  const results = db.globalSearch(q);
  res.json({ results });
});

// ==========================================
// 16. KNOWLEDGE HEALTH & SYNC DASHBOARD
// ==========================================

apiRouter.get('/sync-status', requireAuth, (req, res) => {
  const status = syncService.getSyncStatus();
  res.json({ status });
});

apiRouter.post('/sync-interval', requireAuth, (req, res) => {
  const { hours } = req.body;
  if (!hours || isNaN(Number(hours))) {
    res.status(400).json({ error: 'Valid hours number required (e.g. 6, 12, 24)' });
    return;
  }
  syncService.setSyncInterval(Number(hours));
  res.json({ success: true, intervalHours: Number(hours) });
});

apiRouter.get('/knowledge-health', requireAuth, (req, res) => {
  const health = db.getKnowledgeHealth();
  res.json({ health });
});

apiRouter.get('/source-pages', requireAuth, (req, res) => {
  const pages = db.listSourcePages();
  res.json({ pages });
});

apiRouter.get('/source-versions', requireAuth, (req, res) => {
  const versions = db.listSourceVersions(req.query.sourceId as string | undefined);
  res.json({ versions });
});

// ==========================================
// 17. STRUCTURED KNOWLEDGE ENTITIES ROUTES
// ==========================================

// --- Subject Schemes (RGPV & RDVV) ---
apiRouter.get('/subject-schemes', (req, res) => {
  const { branch, semester, year, course, search } = req.query;
  const schemes = db.listSubjectSchemes({
    branch: branch as string,
    semester: semester ? Number(semester) : undefined,
    year: year ? Number(year) : undefined,
    course: course as string,
    search: search as string,
  });
  res.json({ schemes });
});

apiRouter.post('/subject-schemes', requireAuth, (req, res) => {
  const user = (req as any).user as User;
  const newScheme = db.createSubjectScheme(req.body, user.name);
  res.status(201).json({ scheme: newScheme });
});

apiRouter.put('/subject-schemes/:id', requireAuth, (req, res) => {
  const user = (req as any).user as User;
  const updated = db.updateSubjectScheme(req.params.id, req.body, user.name);
  if (!updated) {
    res.status(404).json({ error: 'Subject scheme not found' });
    return;
  }
  res.json({ scheme: updated });
});

apiRouter.delete('/subject-schemes/:id', requireAuth, (req, res) => {
  const user = (req as any).user as User;
  const ok = db.deleteSubjectScheme(req.params.id, user.name);
  if (!ok) {
    res.status(404).json({ error: 'Subject scheme not found' });
    return;
  }
  res.json({ success: true });
});

// --- Affiliation Intelligence ---
apiRouter.get('/affiliations', (req, res) => {
  const { institutionId, university, search } = req.query;
  const affiliations = db.listAffiliations({
    institutionId: institutionId as string,
    university: university as string,
    search: search as string,
  });
  res.json({ affiliations });
});

apiRouter.post('/affiliations', requireAuth, (req, res) => {
  const user = (req as any).user as User;
  const newAff = db.createAffiliation(req.body, user.name);
  res.status(201).json({ affiliation: newAff });
});

apiRouter.put('/affiliations/:id', requireAuth, (req, res) => {
  const user = (req as any).user as User;
  const updated = db.updateAffiliation(req.params.id, req.body, user.name);
  if (!updated) {
    res.status(404).json({ error: 'Affiliation not found' });
    return;
  }
  res.json({ affiliation: updated });
});

apiRouter.delete('/affiliations/:id', requireAuth, (req, res) => {
  const user = (req as any).user as User;
  const ok = db.deleteAffiliation(req.params.id, user.name);
  if (!ok) {
    res.status(404).json({ error: 'Affiliation not found' });
    return;
  }
  res.json({ success: true });
});

// --- Attendance Rules ---
apiRouter.get('/attendance-rules', (req, res) => {
  const rules = db.listAttendanceRules();
  res.json({ rules });
});

apiRouter.post('/attendance-rules', requireAuth, (req, res) => {
  const user = (req as any).user as User;
  const newRule = db.createAttendanceRule(req.body, user.name);
  res.status(201).json({ rule: newRule });
});

apiRouter.put('/attendance-rules/:id', requireAuth, (req, res) => {
  const user = (req as any).user as User;
  const updated = db.updateAttendanceRule(req.params.id, req.body, user.name);
  if (!updated) {
    res.status(404).json({ error: 'Rule not found' });
    return;
  }
  res.json({ rule: updated });
});

// --- Placement Intelligence ---
apiRouter.get('/placements', (req, res) => {
  const placements = db.listPlacements();
  res.json({ placements });
});

apiRouter.post('/placements', requireAuth, (req, res) => {
  const user = (req as any).user as User;
  const newP = db.createPlacement(req.body, user.name);
  res.status(201).json({ placement: newP });
});

apiRouter.put('/placements/:id', requireAuth, (req, res) => {
  const user = (req as any).user as User;
  const updated = db.updatePlacement(req.params.id, req.body, user.name);
  if (!updated) {
    res.status(404).json({ error: 'Placement record not found' });
    return;
  }
  res.json({ placement: updated });
});

// --- Companies ---
apiRouter.get('/companies', (req, res) => {
  const companies = db.listCompanies();
  res.json({ companies });
});

apiRouter.post('/companies', requireAuth, (req, res) => {
  const newC = db.createCompany(req.body);
  res.status(201).json({ company: newC });
});

// --- Teach AI System (Requirement 16) ---
apiRouter.post('/teach-ai', requireAuth, (req, res) => {
  const user = (req as any).user as User;
  const {
    question,
    answer,
    category,
    institution,
    department,
    course,
    academicYear,
    effectiveDate,
    source,
    sourceUrl,
    notes,
    verificationStatus,
  } = req.body;

  if (!question || !answer) {
    res.status(400).json({ error: 'Question and Answer are required to teach the AI' });
    return;
  }

  // Create authoritative knowledge item
  const knowledgeItem = db.createKnowledge({
    title: question.trim(),
    content: answer.trim(),
    category: (category as any) || 'General',
    subcategory: department || course || 'Staff Taught',
    institutionId: (institution as any) || 'SRIT',
    academicYear: academicYear || '2026-27',
    sourceType: 'Admin',
    sourceUrl: sourceUrl || source || 'Staff Verified Knowledge',
    status: 'Published',
    published: true,
    createdBy: `${user.name} (${user.role})`,
    effectiveFrom: effectiveDate,
  });

  // If there was an unanswered question matching this, resolve it
  const matchingQuestion = db.listUnansweredQuestions().find(
    (uq) => uq.question.toLowerCase().trim() === question.toLowerCase().trim()
  );
  if (matchingQuestion) {
    db.resolveQuestion(matchingQuestion.id, answer.trim(), user.name, false);
  }

  db.recordAuditLog({
    action: 'TEACH_AI_AUTHORITATIVE',
    entityType: 'KnowledgeItem',
    entityId: knowledgeItem.id,
    entityTitle: question.slice(0, 50),
    details: `Staff member taught verified QA for ${category || 'General'} (${institution || 'SRIT'})`,
    performedBy: user.name,
  });

  res.status(201).json({ success: true, knowledgeItem });
});

apiRouter.post('/teach-ai/extract', requireAuth, async (req, res) => {
  const { text } = req.body;
  if (!text) {
    res.status(400).json({ error: 'Text is required for entity extraction' });
    return;
  }
  try {
    const detected = await aiService.extractEntityFromText(text);
    res.json({ detected });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Extraction failed' });
  }
});

apiRouter.post('/teach-ai/publish', requireAuth, (req, res) => {
  const user = (req as any).user as User;
  const entity = req.body;
  if (!entity || !entity.titleOrName) {
    res.status(400).json({ error: 'Entity data required' });
    return;
  }
  let result: any;
  if (entity.entityType === 'event') {
    result = db.createEvent({
      eventName: entity.titleOrName,
      eventType: entity.categoryOrType || 'Workshop',
      description: entity.descriptionOrContent || entity.summary || '',
      date: entity.date || new Date().toISOString().split('T')[0],
      startTime: entity.startTime || '10:00 AM',
      venue: entity.venue || 'SRIT Campus',
      organizer: 'SRIT Staff',
      eligibility: entity.eligibility || 'Open to all SRIT students',
      registrationDeadline: entity.registrationDeadline,
      status: 'Upcoming',
      year: new Date().getFullYear(),
      publishedBy: user.name,
    });
  } else if (entity.entityType === 'club') {
    result = db.createClub({
      name: entity.titleOrName,
      category: entity.categoryOrType || 'Student Society',
      description: entity.descriptionOrContent || '',
      activities: [entity.summary || 'Campus activities'],
      eligibility: entity.eligibility || 'Open to all students',
      published: true,
      source: 'Staff Ingested',
    });
  } else {
    result = db.createKnowledge({
      title: entity.titleOrName,
      content: entity.descriptionOrContent || entity.summary || '',
      category: (entity.categoryOrType as any) || 'General',
      sourceType: 'Admin',
      status: 'Published',
      published: true,
      createdBy: user.name,
    });
  }
  res.status(201).json({ success: true, item: result });
});

// ==========================================
// 18. HIERARCHICAL KNOWLEDGE ENDPOINTS
// ==========================================

// --- Institution Groups ---
apiRouter.get('/groups', (req, res) => {
  res.json({ groups: db.listGroups() });
});

// --- Universities ---
apiRouter.get('/universities', (req, res) => {
  res.json({ universities: db.listUniversities() });
});

// --- Academic Achievements ---
apiRouter.get('/achievements', (req, res) => {
  const institutionId = req.query.institutionId as string | undefined;
  res.json({ achievements: db.listAchievements(institutionId) });
});

apiRouter.post('/achievements', requireAuth, (req, res) => {
  const user = (req as any).user as User;
  const item = db.createAchievement(req.body, user.name);
  res.status(201).json({ achievement: item });
});

// --- Student Strength ---
apiRouter.get('/student-strength', (req, res) => {
  const institutionId = req.query.institutionId as string | undefined;
  res.json({ studentStrength: db.listStudentStrength(institutionId) });
});

// --- Admissions ---
apiRouter.get('/admissions', (req, res) => {
  const institutionId = req.query.institutionId as string | undefined;
  res.json({ admissions: db.listAdmissions(institutionId) });
});

// --- Fees ---
apiRouter.get('/fees', (req, res) => {
  const institutionId = req.query.institutionId as string | undefined;
  res.json({ fees: db.listFees(institutionId) });
});

// --- Scholarships ---
apiRouter.get('/scholarships', (req, res) => {
  const institutionId = req.query.institutionId as string | undefined;
  res.json({ scholarships: db.listScholarships(institutionId) });
});

// --- Academic Rules ---
apiRouter.get('/academic-rules', (req, res) => {
  const institutionId = req.query.institutionId as string | undefined;
  res.json({ rules: db.listAcademicRules(institutionId) });
});

// --- Conversation Context Update / Clear ---
apiRouter.post('/conversations/:id/context', (req, res) => {
  const { context } = req.body;
  const updated = db.updateConversationContext(req.params.id, context || {});
  if (!updated) {
    res.status(404).json({ error: 'Conversation not found' });
    return;
  }
  res.json({ conversation: updated });
});



