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
    const { message, conversationId } = req.body;
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

    // Call AI Service with conversational history
    const aiResult = await aiService.generateChatResponse(
      message.trim(),
      conv.messages
    );

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
    });

    res.json({
      conversationId: convId,
      message: assistantMessage,
      sources: aiResult.sources,
      matchedEvents: aiResult.matchedEvents,
      matchedClubs: aiResult.matchedClubs,
      matchedPersons: aiResult.matchedPersons,
      matchedFaculty: aiResult.matchedFaculty,
      matchedStatistics: aiResult.matchedStatistics,
      isUnknownQuestion: aiResult.isUnknownQuestion,
    });
  } catch (error: any) {
    console.error('Chat endpoint error:', error);
    res.status(500).json({
      error: 'Something went wrong while retrieving that information. Please try again.',
    });
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
