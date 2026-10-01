import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  BrainCircuit,
  BookOpen,
  Calendar,
  Users,
  FileText,
  HelpCircle,
  ThumbsDown,
  Globe,
  History,
  Search,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Lock,
  ArrowRight,
  RefreshCw,
  Upload,
  Eye,
  Check,
  X,
  GraduationCap,
  Award,
  BarChart3,
  Layers,
} from 'lucide-react';
import {
  api,
  User,
  KnowledgeItem,
  CollegeEvent,
  Club,
  DocumentItem,
  UnansweredQuestion,
  FeedbackItem,
  AuditLog,
  AnalyticsData,
  DetectedEntity,
  SyncReport,
  Person,
  FacultyMember,
  Department,
  Course,
  InstitutionalStatistic,
} from '../api.js';

interface AdminPortalProps {
  currentUser: User | null;
  onLoginSuccess: (user: User) => void;
  onLogout: () => void;
  onSwitchToChatWithPrompt?: (prompt: string) => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  currentUser,
  onLoginSuccess,
  onLogout,
  onSwitchToChatWithPrompt,
}) => {
  // Navigation
  const [activeSection, setActiveSection] = useState<
    | 'overview'
    | 'teach-ai'
    | 'leadership'
    | 'faculty'
    | 'departments'
    | 'statistics'
    | 'knowledge'
    | 'events'
    | 'clubs'
    | 'documents'
    | 'questions'
    | 'feedback'
    | 'website-sync'
    | 'audit-logs'
  >('overview');

  // Auth State
  const [email, setEmail] = useState('admin@srit.ac.in');
  const [password, setPassword] = useState('Admin@SRIT2026');
  const [loginError, setLoginError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  // Data States
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [knowledgeList, setKnowledgeList] = useState<KnowledgeItem[]>([]);
  const [eventsList, setEventsList] = useState<CollegeEvent[]>([]);
  const [clubsList, setClubsList] = useState<Club[]>([]);
  const [documentsList, setDocumentsList] = useState<DocumentItem[]>([]);
  const [questionsList, setQuestionsList] = useState<UnansweredQuestion[]>([]);
  const [feedbackList, setFeedbackList] = useState<FeedbackItem[]>([]);
  const [auditLogsList, setAuditLogsList] = useState<AuditLog[]>([]);
  const [personsList, setPersonsList] = useState<Person[]>([]);
  const [facultyList, setFacultyList] = useState<FacultyMember[]>([]);
  const [departmentsList, setDepartmentsList] = useState<Department[]>([]);
  const [coursesList, setCoursesList] = useState<Course[]>([]);
  const [statisticsList, setStatisticsList] = useState<InstitutionalStatistic[]>([]);
  const [loading, setLoading] = useState(false);

  // Teach the AI state
  const [teachInput, setTeachInput] = useState(
    'AI Innovation & Robotics Workshop will be conducted on 20 November 2026 in Seminar Hall 2 from 10:00 AM to 04:00 PM. Open to all B.Tech and MCA students. Registration deadline is 16 November 2026.'
  );
  const [detecting, setDetecting] = useState(false);
  const [detectedEntity, setDetectedEntity] = useState<DetectedEntity | null>(null);
  const [publishSuccess, setPublishSuccess] = useState<string | null>(null);

  // Modals & Form states
  const [knowledgeModalOpen, setKnowledgeModalOpen] = useState(false);
  const [editingKnowledge, setEditingKnowledge] = useState<Partial<KnowledgeItem> | null>(null);

  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Partial<CollegeEvent> | null>(null);

  const [clubModalOpen, setClubModalOpen] = useState(false);
  const [editingClub, setEditingClub] = useState<Partial<Club> | null>(null);

  const [personModalOpen, setPersonModalOpen] = useState(false);
  const [editingPerson, setEditingPerson] = useState<Partial<Person> | null>(null);

  const [facultyModalOpen, setFacultyModalOpen] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState<Partial<FacultyMember> | null>(null);

  const [answerModalOpen, setAnswerModalOpen] = useState(false);
  const [targetQuestion, setTargetQuestion] = useState<UnansweredQuestion | null>(null);
  const [adminAnswerText, setAdminAnswerText] = useState('');

  // Document upload state
  const [docUploadModalOpen, setDocUploadModalOpen] = useState(false);
  const [docFilename, setDocFilename] = useState('');
  const [docContent, setDocContent] = useState('');
  const [docCategory, setDocCategory] = useState('Academics');

  // Website sync state
  const [syncing, setSyncing] = useState(false);
  const [syncReport, setSyncReport] = useState<SyncReport | null>(null);

  // Search filter
  const [adminSearch, setAdminSearch] = useState('');

  useEffect(() => {
    if (currentUser) {
      loadSectionData();
    }
  }, [currentUser, activeSection]);

  const loadSectionData = async () => {
    setLoading(true);
    try {
      if (activeSection === 'overview') {
        const res = await api.getAnalytics();
        setAnalytics(res.analytics);
      } else if (activeSection === 'leadership') {
        const res = await api.listPersons({ search: adminSearch });
        setPersonsList(res.persons || []);
      } else if (activeSection === 'faculty') {
        const res = await api.listFaculty({ search: adminSearch });
        setFacultyList(res.faculty || []);
      } else if (activeSection === 'departments') {
        const [dRes, cRes] = await Promise.all([
          api.listDepartments({ search: adminSearch }),
          api.listCourses({ search: adminSearch }),
        ]);
        setDepartmentsList(dRes.departments || []);
        setCoursesList(cRes.courses || []);
      } else if (activeSection === 'statistics') {
        const res = await api.listStatistics();
        setStatisticsList(res.statistics || []);
      } else if (activeSection === 'knowledge') {
        const res = await api.listKnowledge({ search: adminSearch });
        setKnowledgeList(res.items || []);
      } else if (activeSection === 'events') {
        const res = await api.listEvents({ search: adminSearch });
        setEventsList(res.events || []);
      } else if (activeSection === 'clubs') {
        const res = await api.listClubs({ search: adminSearch });
        setClubsList(res.clubs || []);
      } else if (activeSection === 'documents') {
        const res = await api.listDocuments();
        setDocumentsList(res.documents || []);
      } else if (activeSection === 'questions') {
        const res = await api.listUnansweredQuestions();
        setQuestionsList(res.questions || []);
      } else if (activeSection === 'feedback') {
        const res = await api.listFeedback();
        setFeedbackList(res.feedbacks || []);
      } else if (activeSection === 'audit-logs') {
        const res = await api.getAuditLogs();
        setAuditLogsList(res.logs || []);
      }
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoggingIn(true);
    setLoginError('');
    try {
      const res = await api.login(email, password);
      onLoginSuccess(res.user);
    } catch (err: any) {
      setLoginError(err.message || 'Invalid login credentials');
    } finally {
      setLoggingIn(false);
    }
  };

  // Teach the AI handlers
  const handleExtractEntity = async () => {
    if (!teachInput.trim()) return;
    setDetecting(true);
    setPublishSuccess(null);
    try {
      const res = await api.teachAiExtract(teachInput.trim());
      setDetectedEntity(res.detected);
    } catch (err) {
      console.error('Extraction error:', err);
    } finally {
      setDetecting(false);
    }
  };

  const handlePublishDetected = async () => {
    if (!detectedEntity) return;
    try {
      const res = await api.teachAiPublish(detectedEntity);
      setPublishSuccess(
        `Successfully published! The chatbot can now answer questions about "${detectedEntity.titleOrName}".`
      );
      setDetectedEntity(null);
    } catch (err: any) {
      console.error('Publish error:', err);
    }
  };

  // Knowledge handlers
  const handleSaveKnowledge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingKnowledge || !editingKnowledge.title || !editingKnowledge.content) return;
    try {
      if (editingKnowledge.id) {
        await api.updateKnowledge(editingKnowledge.id, editingKnowledge);
      } else {
        await api.createKnowledge(editingKnowledge);
      }
      setKnowledgeModalOpen(false);
      setEditingKnowledge(null);
      loadSectionData();
    } catch (err) {
      console.error('Failed to save knowledge item:', err);
    }
  };

  const handleDeleteKnowledge = async (id: string) => {
    if (!confirm('Are you sure you want to delete this knowledge item?')) return;
    try {
      await api.deleteKnowledge(id);
      loadSectionData();
    } catch (err) {
      console.error('Failed to delete knowledge item:', err);
    }
  };

  // Person handlers
  const handleSavePerson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPerson || !editingPerson.fullName || !editingPerson.designation) return;
    try {
      if (editingPerson.id) {
        await api.updatePerson(editingPerson.id, editingPerson);
      } else {
        await api.createPerson(editingPerson);
      }
      setPersonModalOpen(false);
      setEditingPerson(null);
      loadSectionData();
    } catch (err) {
      console.error('Failed to save leadership person:', err);
    }
  };

  // Faculty handlers
  const handleSaveFaculty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFaculty || !editingFaculty.fullName || !editingFaculty.department) return;
    try {
      if (editingFaculty.id) {
        await api.updateFaculty(editingFaculty.id, editingFaculty);
      } else {
        await api.createFaculty(editingFaculty);
      }
      setFacultyModalOpen(false);
      setEditingFaculty(null);
      loadSectionData();
    } catch (err) {
      console.error('Failed to save faculty member:', err);
    }
  };

  // Event handlers
  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent || !editingEvent.eventName || !editingEvent.date) return;
    try {
      if (editingEvent.id) {
        await api.updateEvent(editingEvent.id, editingEvent);
      } else {
        await api.createEvent(editingEvent);
      }
      setEventModalOpen(false);
      setEditingEvent(null);
      loadSectionData();
    } catch (err) {
      console.error('Failed to save event:', err);
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;
    try {
      await api.deleteEvent(id);
      loadSectionData();
    } catch (err) {
      console.error('Failed to delete event:', err);
    }
  };

  // Unanswered Question resolver
  const handleResolveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetQuestion || !adminAnswerText.trim()) return;
    try {
      await api.resolveQuestion(targetQuestion.id, adminAnswerText.trim(), true);
      setAnswerModalOpen(false);
      setTargetQuestion(null);
      setAdminAnswerText('');
      loadSectionData();
    } catch (err) {
      console.error('Failed to resolve question:', err);
    }
  };

  // Document Upload handler
  const handleUploadDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docFilename || !docContent.trim()) return;
    try {
      await api.uploadDocument({
        filename: docFilename,
        fileType: docFilename.endsWith('.csv') ? 'csv' : docFilename.endsWith('.pdf') ? 'pdf' : 'txt',
        textContent: docContent,
        category: docCategory,
        source: 'Admin Document Ingestion',
      });
      setDocUploadModalOpen(false);
      setDocFilename('');
      setDocContent('');
      loadSectionData();
    } catch (err) {
      console.error('Failed to upload document:', err);
    }
  };

  // Website Sync handler
  const handleWebsiteSync = async () => {
    setSyncing(true);
    try {
      const res = await api.syncWebsite();
      setSyncReport(res.report);
    } catch (err) {
      console.error('Sync failed:', err);
    } finally {
      setSyncing(false);
    }
  };

  // If not logged in, render the Admin Login Screen
  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto my-12 p-6 sm:p-8 bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 animate-in fade-in duration-200">
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-4 shadow-xs">
          <ShieldCheck className="w-7 h-7" />
        </div>

        <h3 className="text-xl font-extrabold text-center text-slate-900 dark:text-white mb-1">
          SRIT Administrator Access
        </h3>
        <p className="text-xs text-center text-slate-500 dark:text-slate-400 mb-6">
          Sign in to teach the AI, manage events, update leadership/faculty, and answer student questions.
        </p>

        {loginError && (
          <div className="p-3 mb-4 text-xs rounded-xl bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-900 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{loginError}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              College Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={loggingIn}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loggingIn ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Verifying...</span>
              </>
            ) : (
              <>
                <Lock className="w-3.5 h-3.5" />
                <span>Secure Sign In</span>
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Credentials */}
        <div className="mt-8 pt-5 border-t border-slate-100 dark:border-slate-800">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 text-center mb-3">
            Quick Testing Accounts
          </p>
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => {
                setEmail('admin@srit.ac.in');
                setPassword('Admin@SRIT2026');
              }}
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-left text-xs transition-colors flex items-center justify-between cursor-pointer"
            >
              <div>
                <p className="font-bold text-slate-800 dark:text-slate-200">
                  Full Administrator
                </p>
                <p className="text-[11px] text-slate-400">admin@srit.ac.in</p>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 font-semibold">
                ADMIN
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setEmail('editor@srit.ac.in');
                setPassword('Editor@SRIT2026');
              }}
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-left text-xs transition-colors flex items-center justify-between cursor-pointer"
            >
              <div>
                <p className="font-bold text-slate-800 dark:text-slate-200">
                  Content Editor
                </p>
                <p className="text-[11px] text-slate-400">editor@srit.ac.in</p>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 font-semibold">
                CONTENT_EDITOR
              </span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const navItems = [
    { id: 'overview', label: 'Overview & Coverage', icon: History },
    { id: 'teach-ai', label: 'Teach the AI', icon: BrainCircuit, highlight: true },
    { id: 'leadership', label: 'Leadership', icon: GraduationCap },
    { id: 'faculty', label: 'Faculty Directory', icon: Award },
    { id: 'departments', label: 'Departments & Courses', icon: Layers },
    { id: 'statistics', label: 'Institutional Stats (NIRF)', icon: BarChart3 },
    { id: 'knowledge', label: 'Knowledge Base', icon: BookOpen },
    { id: 'events', label: 'Events & Fests', icon: Calendar },
    { id: 'clubs', label: 'Clubs & Societies', icon: Users },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'questions', label: 'Unanswered Questions', icon: HelpCircle },
    { id: 'feedback', label: 'Student Feedback', icon: ThumbsDown },
    { id: 'website-sync', label: 'Website Sync', icon: Globe },
    { id: 'audit-logs', label: 'Audit Trail', icon: ShieldCheck },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 mb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              SRIT Admin Command Center
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 font-bold">
              {currentUser.role}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Welcome, {currentUser.name}. Database records serve as the authoritative truth for the AI chatbot.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSection('teach-ai')}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <BrainCircuit className="w-4 h-4" />
            <span>Teach the AI</span>
          </button>
        </div>
      </div>

      {/* Admin Navigation Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-4 mb-6 border-b border-slate-100 dark:border-slate-800/80">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white shadow-xs'
                  : item.highlight
                  ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60 hover:bg-blue-100'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* ==============================================================
          1. OVERVIEW & KNOWLEDGE COVERAGE (Section 12, 33 & 42)
      ============================================================== */}
      {activeSection === 'overview' && (
        <div className="space-y-6">
          {analytics ? (
            <>
              {/* Knowledge Coverage Dashboard Card (Section 42 requirement) */}
              <div className="p-5 rounded-3xl bg-gradient-to-br from-blue-50/80 via-white to-indigo-50/80 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 border border-blue-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span>Knowledge Coverage Status</span>
                  </h3>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                    All Core Domains Covered
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
                  <div className="p-3 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-[10px]">Leadership</p>
                      <p className="font-bold text-slate-900 dark:text-white">
                        {analytics.coverage.leadershipCount} Profiles
                      </p>
                    </div>
                    <span className="text-emerald-600 font-bold text-sm">✓</span>
                  </div>

                  <div className="p-3 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-[10px]">Faculty</p>
                      <p className="font-bold text-slate-900 dark:text-white">
                        {analytics.coverage.facultyCount} Members
                      </p>
                    </div>
                    <span className="text-emerald-600 font-bold text-sm">✓</span>
                  </div>

                  <div className="p-3 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-[10px]">Departments</p>
                      <p className="font-bold text-slate-900 dark:text-white">
                        {analytics.coverage.departmentsCount} Depts
                      </p>
                    </div>
                    <span className="text-emerald-600 font-bold text-sm">✓</span>
                  </div>

                  <div className="p-3 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-[10px]">Courses</p>
                      <p className="font-bold text-slate-900 dark:text-white">
                        {analytics.coverage.coursesCount} Programs
                      </p>
                    </div>
                    <span className="text-emerald-600 font-bold text-sm">✓</span>
                  </div>

                  <div className="p-3 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-[10px]">Statistics</p>
                      <p className="font-bold text-slate-900 dark:text-white">
                        {analytics.coverage.statisticsCount} Metrics
                      </p>
                    </div>
                    <span className="text-emerald-600 font-bold text-sm">✓</span>
                  </div>

                  <div className="p-3 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-[10px]">Facilities</p>
                      <p className="font-bold text-slate-900 dark:text-white">Verified</p>
                    </div>
                    <span className="text-emerald-600 font-bold text-sm">✓</span>
                  </div>

                  <div className="p-3 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-[10px]">Clubs</p>
                      <p className="font-bold text-slate-900 dark:text-white">
                        {analytics.coverage.clubsCount} Societies
                      </p>
                    </div>
                    <span className="text-emerald-600 font-bold text-sm">✓</span>
                  </div>

                  <div className="p-3 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-[10px]">Events & Fests</p>
                      <p className="font-bold text-slate-900 dark:text-white">
                        {analytics.coverage.eventsCount} Events
                      </p>
                    </div>
                    <span className="text-emerald-600 font-bold text-sm">✓</span>
                  </div>

                  <div className="p-3 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-[10px]">Documents</p>
                      <p className="font-bold text-slate-900 dark:text-white">
                        {analytics.coverage.documentsCount} Indexed
                      </p>
                    </div>
                    <span className="text-emerald-600 font-bold text-sm">✓</span>
                  </div>

                  <div className="p-3 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-[10px]">Unanswered</p>
                      <p className="font-bold text-amber-600">
                        {analytics.coverage.unansweredQuestions}
                      </p>
                    </div>
                    <span className="text-amber-500 font-bold text-sm">!</span>
                  </div>
                </div>
              </div>

              {/* Stat Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                  <p className="text-xs font-medium text-slate-400">Total Knowledge Items</p>
                  <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                    {analytics.totalKnowledge}
                  </p>
                  <p className="text-[11px] text-emerald-600 font-semibold mt-1">
                    {analytics.publishedKnowledge} Published
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                  <p className="text-xs font-medium text-slate-400">Events & Fests</p>
                  <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                    {analytics.totalEvents}
                  </p>
                  <p className="text-[11px] text-blue-600 font-semibold mt-1">
                    {analytics.upcomingEvents} Upcoming
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                  <p className="text-xs font-medium text-slate-400">Unanswered Questions</p>
                  <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
                    {analytics.unansweredQuestionsCount}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">Needs admin review</p>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                  <p className="text-xs font-medium text-slate-400">Helpful Rating</p>
                  <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                    {analytics.helpfulFeedbacks + analytics.unhelpfulFeedbacks > 0
                      ? `${Math.round(
                          (analytics.helpfulFeedbacks /
                            (analytics.helpfulFeedbacks + analytics.unhelpfulFeedbacks)) *
                            100
                        )}%`
                      : '100%'}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    {analytics.helpfulFeedbacks} positive / {analytics.unhelpfulFeedbacks} flagged
                  </p>
                </div>
              </div>

              {/* Top Questions & Category Distribution */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center justify-between">
                    <span>Questions Students Are Asking</span>
                    <button
                      onClick={() => setActiveSection('questions')}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      View All
                    </button>
                  </h4>
                  {analytics.mostAskedQuestions.length === 0 ? (
                    <p className="text-xs text-slate-400">All questions currently answered!</p>
                  ) : (
                    <div className="space-y-2.5">
                      {analytics.mostAskedQuestions.map((q) => (
                        <div
                          key={q.id}
                          className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2"
                        >
                          <span className="text-xs font-medium text-slate-800 dark:text-slate-200">
                            "{q.question}"
                          </span>
                          <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-bold shrink-0">
                            Asked {q.frequency}x
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
                    Knowledge Base Categories
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {Object.entries(analytics.categoryCounts).map(([cat, count]) => (
                      <div
                        key={cat}
                        className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between"
                      >
                        <span className="text-slate-600 dark:text-slate-300">{cat}</span>
                        <span className="font-bold text-blue-600">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="py-20 text-center text-sm text-slate-400">Loading analytics...</div>
          )}
        </div>
      )}

      {/* ==============================================================
          2. LEADERSHIP & DIRECTORS (Section 4 & 6)
      ============================================================== */}
      {activeSection === 'leadership' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500">
              Verified directors and executive leadership profiles for Shri Ram Group and SRIT.
            </p>
            <button
              onClick={() => {
                setEditingPerson({
                  fullName: '',
                  designation: '',
                  role: 'LEADERSHIP',
                  institution: 'Shri Ram Group',
                  institutionId: 'SHRI_RAM_GROUP',
                  biography: '',
                  status: 'Verified',
                  source: 'Official Website',
                  sourceUrl: 'https://sritgroup.net/',
                });
                setPersonModalOpen(true);
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Leadership Person</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {personsList.map((p) => (
              <div
                key={p.id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-semibold border border-blue-200">
                      {p.institution} ({p.institutionId})
                    </span>
                    <h4 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                      {p.fullName}
                    </h4>
                    <p className="text-xs text-blue-600 font-semibold">{p.designation}</p>
                  </div>
                  <button
                    onClick={() => {
                      setEditingPerson(p);
                      setPersonModalOpen(true);
                    }}
                    className="p-1.5 text-slate-400 hover:text-blue-600"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 mb-3 leading-relaxed">
                  {p.biography}
                </p>
                <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span>Source: {p.source}</span>
                  <span className="text-emerald-600 font-semibold">✓ {p.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==============================================================
          3. FACULTY MEMBERS (Section 7, 8 & 9)
      ============================================================== */}
      {activeSection === 'faculty' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={adminSearch}
                onChange={(e) => setAdminSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && loadSectionData()}
                placeholder="Search faculty name, department..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl"
              />
            </div>

            <button
              onClick={() => {
                setEditingFaculty({
                  fullName: '',
                  designation: 'Professor',
                  department: 'Computer Science & Engineering',
                  qualification: 'B.E., M.Tech, Ph.D.',
                  institution: 'Shri Ram Institute of Technology',
                  institutionId: 'SRIT',
                  status: 'Verified',
                  source: 'Official SRIT Faculty Table',
                });
                setFacultyModalOpen(true);
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Faculty Member</span>
            </button>
          </div>

          <div className="overflow-x-auto bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 text-slate-400 font-semibold">
                  <th className="p-3.5">Faculty Member</th>
                  <th className="p-3.5">Department</th>
                  <th className="p-3.5">Designation</th>
                  <th className="p-3.5">Qualifications</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {facultyList.map((f) => (
                  <tr key={f.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="p-3.5 font-bold text-slate-900 dark:text-white">
                      {f.fullName}
                    </td>
                    <td className="p-3.5 text-slate-700 dark:text-slate-300">
                      {f.department}
                    </td>
                    <td className="p-3.5 text-blue-600 font-semibold">
                      {f.designation}
                    </td>
                    <td className="p-3.5 text-slate-600 dark:text-slate-300">
                      {f.qualification}
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold">
                        {f.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => {
                          setEditingFaculty(f);
                          setFacultyModalOpen(true);
                        }}
                        className="p-1.5 text-slate-400 hover:text-blue-600"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==============================================================
          4. DEPARTMENTS & COURSES (Section 10 & 11)
      ============================================================== */}
      {activeSection === 'departments' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {departmentsList.map((d) => (
              <div
                key={d.id}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs"
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-semibold">
                      {d.abbreviation}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                      {d.name}
                    </h4>
                  </div>
                  <span className="text-xs text-slate-500 font-medium">
                    {d.facultyCount} Faculty
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 mb-2">
                  {d.description}
                </p>
                <p className="text-[11px] text-blue-600 font-semibold mb-1">
                  HOD: {d.HOD || 'Department Convener'}
                </p>
                <p className="text-[11px] text-slate-400">
                  Courses: {d.courses.join(', ')}
                </p>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
              Approved Courses & Intakes ({coursesList.length})
            </h4>
            <div className="overflow-x-auto bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 text-slate-400 font-semibold">
                    <th className="p-3">Course Name</th>
                    <th className="p-3">Level</th>
                    <th className="p-3">Duration</th>
                    <th className="p-3">Approved Intake</th>
                    <th className="p-3">Affiliation / Approval</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {coursesList.map((c) => (
                    <tr key={c.id}>
                      <td className="p-3 font-bold text-slate-900 dark:text-white">
                        {c.name}
                      </td>
                      <td className="p-3">{c.level}</td>
                      <td className="p-3 text-slate-600">{c.duration}</td>
                      <td className="p-3 font-semibold text-blue-600">{c.intake} seats</td>
                      <td className="p-3 text-slate-500">{c.affiliation} ({c.approval})</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==============================================================
          5. INSTITUTIONAL STATISTICS (Section 12, 13 & 14)
      ============================================================== */}
      {activeSection === 'statistics' && (
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-950/40 rounded-2xl border border-blue-200 dark:border-blue-900 text-xs text-blue-800 dark:text-blue-200">
            <p className="font-bold">Institutional vs Group Scope Rule</p>
            <p className="mt-0.5">
              Statistics are tagged by Scope (<span className="font-bold">Shri Ram Group</span> vs <span className="font-bold">SRIT</span>) and Academic Reporting Year (e.g. NIRF 2025 submission vs Group-wide metrics). The chatbot will explain the scope clearly rather than mixing numbers.
            </p>
          </div>

          <div className="overflow-x-auto bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 text-slate-400 font-semibold">
                  <th className="p-3.5">Metric Name</th>
                  <th className="p-3.5">Value</th>
                  <th className="p-3.5">Institution Scope</th>
                  <th className="p-3.5">Reporting Period</th>
                  <th className="p-3.5">Source</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {statisticsList.map((s) => (
                  <tr key={s.id}>
                    <td className="p-3.5 font-bold text-slate-900 dark:text-white">
                      {s.statisticName}
                    </td>
                    <td className="p-3.5 font-extrabold text-blue-600 text-sm">
                      {s.value} {s.unit || ''}
                    </td>
                    <td className="p-3.5 font-semibold text-slate-800 dark:text-slate-200">
                      {s.institution} ({s.institutionId})
                    </td>
                    <td className="p-3.5 text-slate-500">{s.academicYear}</td>
                    <td className="p-3.5 text-slate-500 max-w-xs truncate">{s.source}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==============================================================
          6. TEACH THE AI (Interactive Learning Demo - Section 14 & 35)
      ============================================================== */}
      {activeSection === 'teach-ai' && (
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm mb-2">
              <BrainCircuit className="w-5 h-5" />
              <span>Instant AI Knowledge Training</span>
            </div>

            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mb-2">
              Tell the AI Something New
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
              Type or paste any college announcement, event circular, or policy update. Our structured engine extracts the details so you can review and publish it immediately. The chatbot uses the new information right away with zero model retraining!
            </p>

            <textarea
              value={teachInput}
              onChange={(e) => setTeachInput(e.target.value)}
              placeholder="e.g. AI Innovation Workshop will be conducted on 20 November 2026 at Seminar Hall 2. Open to all B.Tech students..."
              rows={4}
              className="w-full text-xs sm:text-sm p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
            />

            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setTeachInput(
                      'AI Innovation Workshop will be conducted on 20 November 2026 at Seminar Hall 2. Open to all B.Tech students. Registration deadline is 16 November 2026.'
                    )
                  }
                  className="text-[11px] text-blue-600 hover:underline"
                >
                  Load Demo Prompt 1 (AI Workshop)
                </button>
              </div>

              <button
                type="button"
                onClick={handleExtractEntity}
                disabled={detecting || !teachInput.trim()}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {detecting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Analyzing Text...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Extract & Detect Information</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {publishSuccess && (
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span className="font-semibold">{publishSuccess}</span>
              </div>
              {onSwitchToChatWithPrompt && (
                <button
                  onClick={() => onSwitchToChatWithPrompt('Are there any AI workshops coming up?')}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-colors cursor-pointer shrink-0"
                >
                  Test in Chat Now →
                </button>
              )}
            </div>
          )}

          {detectedEntity && (
            <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-900 border-2 border-blue-500/40 shadow-md animate-in fade-in duration-200">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                  Detected Structure ({detectedEntity.entityType.toUpperCase()})
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 font-semibold">
                  {detectedEntity.categoryOrType}
                </span>
              </div>

              <h4 className="text-lg font-extrabold text-slate-900 dark:text-white mb-2">
                {detectedEntity.titleOrName}
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4 text-xs">
                {detectedEntity.date && (
                  <div className="p-2.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                    <span className="text-slate-400">Date & Time:</span>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">
                      {detectedEntity.date} {detectedEntity.startTime}
                    </p>
                  </div>
                )}
                {detectedEntity.venue && (
                  <div className="p-2.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                    <span className="text-slate-400">Venue:</span>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">
                      {detectedEntity.venue}
                    </p>
                  </div>
                )}
                {detectedEntity.eligibility && (
                  <div className="p-2.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                    <span className="text-slate-400">Eligibility:</span>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">
                      {detectedEntity.eligibility}
                    </p>
                  </div>
                )}
                {detectedEntity.registrationDeadline && (
                  <div className="p-2.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                    <span className="text-slate-400">Registration Deadline:</span>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">
                      {detectedEntity.registrationDeadline}
                    </p>
                  </div>
                )}
              </div>

              <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 mb-6 text-xs text-slate-600 dark:text-slate-300">
                <span className="font-semibold text-slate-400 block mb-1">
                  Extracted Content:
                </span>
                <p>{detectedEntity.descriptionOrContent}</p>
              </div>

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setDetectedEntity(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handlePublishDetected}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Review & Publish to Database</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ==============================================================
          7. KNOWLEDGE BASE MANAGER
      ============================================================== */}
      {activeSection === 'knowledge' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={adminSearch}
                onChange={(e) => setAdminSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && loadSectionData()}
                placeholder="Search knowledge items..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl"
              />
            </div>

            <button
              onClick={() => {
                setEditingKnowledge({
                  title: '',
                  category: 'College',
                  content: '',
                  sourceType: 'Admin',
                  status: 'Published',
                  published: true,
                });
                setKnowledgeModalOpen(true);
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Knowledge Item</span>
            </button>
          </div>

          <div className="overflow-x-auto bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-400 font-semibold">
                  <th className="p-3.5">Title & Source</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Updated</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {knowledgeList.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="p-3.5 max-w-sm">
                      <p className="font-bold text-slate-900 dark:text-white truncate">
                        {item.title}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate">
                        {item.sourceType} {item.sourceUrl ? `• ${item.sourceUrl}` : ''}
                      </p>
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                        {item.category}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`px-2 py-0.5 rounded-full font-semibold ${
                          item.published
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-400">
                      {new Date(item.updatedAt).toLocaleDateString()}
                    </td>
                    <td className="p-3.5 text-right space-x-1">
                      <button
                        onClick={() => {
                          setEditingKnowledge(item);
                          setKnowledgeModalOpen(true);
                        }}
                        className="p-1.5 text-slate-500 hover:text-blue-600 rounded-lg cursor-pointer"
                        title="Edit"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      {currentUser.role === 'ADMIN' && (
                        <button
                          onClick={() => handleDeleteKnowledge(item.id)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 rounded-lg cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==============================================================
          8. EVENTS MANAGER
      ============================================================== */}
      {activeSection === 'events' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={adminSearch}
                onChange={(e) => setAdminSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && loadSectionData()}
                placeholder="Search events..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl"
              />
            </div>

            <button
              onClick={() => {
                setEditingEvent({
                  eventName: '',
                  eventType: 'Technical Fest',
                  description: '',
                  date: new Date().toISOString().split('T')[0],
                  startTime: '10:00 AM',
                  venue: 'Main Auditorium',
                  organizer: 'Shri Ram Institute of Technology',
                  eligibility: 'All SRIT Students',
                  status: 'Published',
                });
                setEventModalOpen(true);
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add College Event</span>
            </button>
          </div>

          <div className="overflow-x-auto bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-400 font-semibold">
                  <th className="p-3.5">Event Name</th>
                  <th className="p-3.5">Date & Time</th>
                  <th className="p-3.5">Venue</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {eventsList.map((evt) => (
                  <tr key={evt.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="p-3.5">
                      <p className="font-bold text-slate-900 dark:text-white">
                        {evt.eventName}
                      </p>
                      <p className="text-[11px] text-slate-400">{evt.eventType}</p>
                    </td>
                    <td className="p-3.5 text-slate-600 dark:text-slate-300">
                      {evt.date} at {evt.startTime}
                    </td>
                    <td className="p-3.5 text-slate-600 dark:text-slate-300 max-w-xs truncate">
                      {evt.venue}
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`px-2 py-0.5 rounded-full font-semibold ${
                          evt.status === 'Cancelled'
                            ? 'bg-rose-100 text-rose-800'
                            : evt.status === 'Completed'
                            ? 'bg-slate-100 text-slate-600'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {evt.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-right space-x-1">
                      <button
                        onClick={() => {
                          setEditingEvent(evt);
                          setEventModalOpen(true);
                        }}
                        className="p-1.5 text-slate-500 hover:text-blue-600 rounded-lg cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      {currentUser.role === 'ADMIN' && (
                        <button
                          onClick={() => handleDeleteEvent(evt.id)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 rounded-lg cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==============================================================
          9. UNANSWERED QUESTIONS RESOLVER (Section 19 & 37)
      ============================================================== */}
      {activeSection === 'questions' && (
        <div className="space-y-4">
          <div className="p-4 bg-amber-50 dark:bg-amber-950/40 rounded-2xl border border-amber-200 dark:border-amber-900 text-xs text-amber-800 dark:text-amber-200 flex items-center justify-between">
            <div>
              <p className="font-bold">Student Question Feedback Loop</p>
              <p>
                When students ask a question that lacks verified SRIT knowledge, it is logged here. Answering a question creates a new knowledge item so the chatbot can answer future students instantly.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-400 font-semibold">
                  <th className="p-3.5">Student Question</th>
                  <th className="p-3.5">Frequency</th>
                  <th className="p-3.5">Last Asked</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {questionsList.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-400">
                      No unanswered questions logged yet.
                    </td>
                  </tr>
                ) : (
                  questionsList.map((q) => (
                    <tr key={q.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <td className="p-3.5 font-bold text-slate-900 dark:text-white">
                        "{q.question}"
                        {q.adminAnswer && (
                          <p className="text-[11px] font-normal text-emerald-600 mt-1">
                            Official Answer: {q.adminAnswer}
                          </p>
                        )}
                      </td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 font-bold">
                          {q.frequency} times
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-400">
                        {new Date(q.lastAskedAt).toLocaleDateString()}
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 rounded-full font-semibold ${
                            q.status === 'Answered'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {q.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-right space-x-2">
                        {q.status !== 'Answered' && (
                          <button
                            onClick={() => {
                              setTargetQuestion(q);
                              setAdminAnswerText('');
                              setAnswerModalOpen(true);
                            }}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors cursor-pointer"
                          >
                            Add Official Answer
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==============================================================
          10. DOCUMENT INGESTION
      ============================================================== */}
      {activeSection === 'documents' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500">
              Upload event circulars, department brochures, or student handbooks (.txt, .csv, .pdf, .docx).
            </p>
            <button
              onClick={() => setDocUploadModalOpen(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>Upload Document</span>
            </button>
          </div>

          <div className="overflow-x-auto bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 text-slate-400 font-semibold">
                  <th className="p-3.5">Filename</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5">Size</th>
                  <th className="p-3.5">Uploaded</th>
                  <th className="p-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {documentsList.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-400">
                      No documents uploaded yet. Click "Upload Document" to index circulars.
                    </td>
                  </tr>
                ) : (
                  documentsList.map((doc) => (
                    <tr key={doc.id}>
                      <td className="p-3.5 font-bold text-slate-900 dark:text-white">
                        {doc.filename}
                      </td>
                      <td className="p-3.5">{doc.category}</td>
                      <td className="p-3.5 text-slate-400">
                        {(doc.fileSize / 1024).toFixed(1)} KB
                      </td>
                      <td className="p-3.5 text-slate-400">
                        {new Date(doc.uploadDate).toLocaleDateString()}
                      </td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold">
                          {doc.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==============================================================
          11. WEBSITE KNOWLEDGE SYNC
      ============================================================== */}
      {activeSection === 'website-sync' && (
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-center">
            <Globe className="w-12 h-12 text-blue-600 dark:text-blue-400 mx-auto mb-3" />
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mb-2">
              Sync with Official SRIT Website
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-6">
              Crawls publicly accessible pages on <span className="font-semibold text-blue-600">https://sritgroup.net/</span>, extracts updated text, removes headers/footers, and refreshes the knowledge database.
            </p>

            <button
              onClick={handleWebsiteSync}
              disabled={syncing}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 mx-auto cursor-pointer disabled:opacity-50"
            >
              {syncing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Connecting & Crawling sritgroup.net...</span>
                </>
              ) : (
                <>
                  <Globe className="w-4 h-4" />
                  <span>Sync Official Website Now</span>
                </>
              )}
            </button>
          </div>

          {syncReport && (
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm animate-in fade-in duration-200">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Website Sync Report</span>
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-4 text-center">
                <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <p className="text-[10px] text-slate-400 uppercase">Discovered</p>
                  <p className="text-base font-bold text-slate-900 dark:text-white">
                    {syncReport.pagesDiscovered}
                  </p>
                </div>
                <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <p className="text-[10px] text-slate-400 uppercase">Processed</p>
                  <p className="text-base font-bold text-blue-600">
                    {syncReport.pagesProcessed}
                  </p>
                </div>
                <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <p className="text-[10px] text-slate-400 uppercase">Updated</p>
                  <p className="text-base font-bold text-indigo-600">
                    {syncReport.updated}
                  </p>
                </div>
                <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <p className="text-[10px] text-slate-400 uppercase">New</p>
                  <p className="text-base font-bold text-emerald-600">
                    {syncReport.createdNew}
                  </p>
                </div>
                <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <p className="text-[10px] text-slate-400 uppercase">Skipped</p>
                  <p className="text-base font-bold text-slate-400">
                    {syncReport.skipped}
                  </p>
                </div>
              </div>

              <div className="space-y-1.5 max-h-60 overflow-y-auto text-xs">
                {syncReport.pages.map((p, idx) => (
                  <div
                    key={idx}
                    className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-between text-[11px]"
                  >
                    <span className="truncate max-w-sm text-slate-700 dark:text-slate-300">
                      {p.title} ({p.url})
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full font-semibold ${
                        p.status === 'updated'
                          ? 'bg-indigo-100 text-indigo-800'
                          : p.status === 'new'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {p.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ==============================================================
          12. FEEDBACK
      ============================================================== */}
      {activeSection === 'feedback' && (
        <div className="space-y-4">
          <div className="overflow-x-auto bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 text-slate-400 font-semibold">
                  <th className="p-3.5">Question</th>
                  <th className="p-3.5">Rating</th>
                  <th className="p-3.5">Reason</th>
                  <th className="p-3.5">Comment</th>
                  <th className="p-3.5">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {feedbackList.map((fb) => (
                  <tr key={fb.id}>
                    <td className="p-3.5 font-bold text-slate-900 dark:text-white max-w-xs truncate">
                      "{fb.question}"
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`px-2 py-0.5 rounded-full font-semibold ${
                          fb.rating === 'helpful'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {fb.rating}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-600 dark:text-slate-300">
                      {fb.reason || 'N/A'}
                    </td>
                    <td className="p-3.5 text-slate-500 max-w-xs truncate">
                      {fb.comment || '—'}
                    </td>
                    <td className="p-3.5 text-slate-400">
                      {new Date(fb.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==============================================================
          13. AUDIT TRAIL
      ============================================================== */}
      {activeSection === 'audit-logs' && (
        <div className="space-y-4">
          <div className="overflow-x-auto bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 text-slate-400 font-semibold">
                  <th className="p-3.5">Action</th>
                  <th className="p-3.5">Entity</th>
                  <th className="p-3.5">Details</th>
                  <th className="p-3.5">Performed By</th>
                  <th className="p-3.5">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {auditLogsList.map((log) => (
                  <tr key={log.id}>
                    <td className="p-3.5 font-bold text-slate-900 dark:text-white">
                      {log.action}
                    </td>
                    <td className="p-3.5 text-slate-600 dark:text-slate-300">
                      {log.entityType} ({log.entityTitle})
                    </td>
                    <td className="p-3.5 text-slate-500 max-w-sm truncate">{log.details}</td>
                    <td className="p-3.5 font-semibold text-blue-600">{log.performedBy}</td>
                    <td className="p-3.5 text-slate-400">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==============================================================
          14. CLUBS
      ============================================================== */}
      {activeSection === 'clubs' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500">
              Manage student clubs: EPL cricket, Occulus music band, Vahini women empowerment forum, and cultural societies.
            </p>
            <button
              onClick={() => {
                setEditingClub({
                  name: '',
                  category: 'Sports',
                  description: '',
                  activities: ['Annual Tournament'],
                  eligibility: 'Open to all SRIT students',
                  published: true,
                });
                setClubModalOpen(true);
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Club</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {clubsList.map((club) => (
              <div
                key={club.id}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-semibold">
                      {club.category}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                      {club.name}
                    </h4>
                  </div>
                  <button
                    onClick={() => {
                      setEditingClub(club);
                      setClubModalOpen(true);
                    }}
                    className="p-1.5 text-slate-400 hover:text-blue-600"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 mb-2">
                  {club.description}
                </p>
                <p className="text-[11px] text-slate-400">
                  Eligibility: {club.eligibility}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==============================================================
          MODALS
      ============================================================== */}

      {/* 1. Person Modal */}
      {personModalOpen && editingPerson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
              {editingPerson.id ? 'Edit Leadership Profile' : 'Add Leadership Person'}
            </h3>
            <form onSubmit={handleSavePerson} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold">Full Name (with title)</label>
                <input
                  type="text"
                  value={editingPerson.fullName || ''}
                  onChange={(e) =>
                    setEditingPerson({ ...editingPerson, fullName: e.target.value })
                  }
                  required
                  placeholder="e.g. Dr. S. P. Kosta"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold">Designation</label>
                  <input
                    type="text"
                    value={editingPerson.designation || ''}
                    onChange={(e) =>
                      setEditingPerson({ ...editingPerson, designation: e.target.value })
                    }
                    required
                    placeholder="e.g. Group Director / Principal"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 mt-1"
                  />
                </div>
                <div>
                  <label className="font-semibold">Institution Scope</label>
                  <select
                    value={editingPerson.institutionId || 'SHRI_RAM_GROUP'}
                    onChange={(e) =>
                      setEditingPerson({
                        ...editingPerson,
                        institutionId: e.target.value as any,
                        institution:
                          e.target.value === 'SRIT'
                            ? 'Shri Ram Institute of Technology'
                            : 'Shri Ram Group',
                      })
                    }
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 mt-1"
                  >
                    <option value="SHRI_RAM_GROUP">Shri Ram Group</option>
                    <option value="SRIT">Shri Ram Institute of Technology (SRIT)</option>
                    <option value="SRIST">Shri Ram Institute of Science & Technology</option>
                    <option value="SRIT_PHARMACY">Shri Ram Institute of Pharmacy</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold">Qualifications & Background</label>
                <input
                  type="text"
                  value={editingPerson.qualifications || ''}
                  onChange={(e) =>
                    setEditingPerson({ ...editingPerson, qualifications: e.target.value })
                  }
                  placeholder="e.g. Ph.D., Space Scientist, Former VC"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 mt-1"
                />
              </div>

              <div>
                <label className="font-semibold">Biography & Official Roles</label>
                <textarea
                  value={editingPerson.biography || ''}
                  onChange={(e) =>
                    setEditingPerson({ ...editingPerson, biography: e.target.value })
                  }
                  required
                  rows={4}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 mt-1"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setPersonModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Faculty Modal */}
      {facultyModalOpen && editingFaculty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
              {editingFaculty.id ? 'Edit Faculty Record' : 'Add Faculty Member'}
            </h3>
            <form onSubmit={handleSaveFaculty} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold">Full Name (with title)</label>
                <input
                  type="text"
                  value={editingFaculty.fullName || ''}
                  onChange={(e) =>
                    setEditingFaculty({ ...editingFaculty, fullName: e.target.value })
                  }
                  required
                  placeholder="e.g. Dr. Reeta Malviya"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold">Department</label>
                  <select
                    value={editingFaculty.department || 'Computer Science & Engineering'}
                    onChange={(e) =>
                      setEditingFaculty({ ...editingFaculty, department: e.target.value })
                    }
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 mt-1"
                  >
                    <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                    <option value="Artificial Intelligence & Machine Learning">AIML</option>
                    <option value="Data Science">Data Science</option>
                    <option value="Electronics & Communication Engineering">ECE</option>
                    <option value="Mechanical Engineering">Mechanical Engineering</option>
                    <option value="Civil Engineering">Civil Engineering</option>
                    <option value="Electrical Engineering">Electrical Engineering</option>
                    <option value="Engineering Mathematics">Engineering Mathematics</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold">Designation</label>
                  <select
                    value={editingFaculty.designation || 'Professor'}
                    onChange={(e) =>
                      setEditingFaculty({ ...editingFaculty, designation: e.target.value })
                    }
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 mt-1"
                  >
                    <option value="Professor">Professor</option>
                    <option value="Professor & HOD">Professor & HOD</option>
                    <option value="Associate Professor">Associate Professor</option>
                    <option value="Assistant Professor">Assistant Professor</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold">Qualifications</label>
                <input
                  type="text"
                  value={editingFaculty.qualification || ''}
                  onChange={(e) =>
                    setEditingFaculty({ ...editingFaculty, qualification: e.target.value })
                  }
                  required
                  placeholder="e.g. BSc, MSc, MPhil, PhD"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 mt-1"
                />
              </div>

              <div>
                <label className="font-semibold">Specialization (optional)</label>
                <input
                  type="text"
                  value={editingFaculty.specialization || ''}
                  onChange={(e) =>
                    setEditingFaculty({ ...editingFaculty, specialization: e.target.value })
                  }
                  placeholder="e.g. Differential Equations / Deep Learning"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 mt-1"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setFacultyModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl"
                >
                  Save Faculty
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Knowledge Item Modal */}
      {knowledgeModalOpen && editingKnowledge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
              {editingKnowledge.id ? 'Edit Knowledge Item' : 'Add Knowledge Item'}
            </h3>
            <form onSubmit={handleSaveKnowledge} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold">Title</label>
                <input
                  type="text"
                  value={editingKnowledge.title || ''}
                  onChange={(e) =>
                    setEditingKnowledge({ ...editingKnowledge, title: e.target.value })
                  }
                  required
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold">Category</label>
                  <select
                    value={editingKnowledge.category || 'College'}
                    onChange={(e) =>
                      setEditingKnowledge({
                        ...editingKnowledge,
                        category: e.target.value as any,
                      })
                    }
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 mt-1"
                  >
                    <option value="College">College</option>
                    <option value="Leadership">Leadership</option>
                    <option value="Faculty">Faculty</option>
                    <option value="Academics">Academics</option>
                    <option value="Admissions">Admissions</option>
                    <option value="Student Services">Student Services</option>
                    <option value="Facilities">Facilities</option>
                    <option value="Clubs">Clubs</option>
                    <option value="Activities">Activities</option>
                    <option value="Events">Events</option>
                    <option value="Placements">Placements</option>
                    <option value="General">General</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold">Status</label>
                  <select
                    value={editingKnowledge.status || 'Published'}
                    onChange={(e) =>
                      setEditingKnowledge({
                        ...editingKnowledge,
                        status: e.target.value as any,
                        published: e.target.value === 'Published',
                      })
                    }
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 mt-1"
                  >
                    <option value="Published">Published</option>
                    <option value="Draft">Draft</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold">Content</label>
                <textarea
                  value={editingKnowledge.content || ''}
                  onChange={(e) =>
                    setEditingKnowledge({ ...editingKnowledge, content: e.target.value })
                  }
                  required
                  rows={5}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 mt-1"
                />
              </div>

              <div>
                <label className="font-semibold">Source URL (optional)</label>
                <input
                  type="text"
                  value={editingKnowledge.sourceUrl || ''}
                  onChange={(e) =>
                    setEditingKnowledge({ ...editingKnowledge, sourceUrl: e.target.value })
                  }
                  placeholder="https://sritgroup.net/..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 mt-1"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setKnowledgeModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl"
                >
                  Save Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Event Modal */}
      {eventModalOpen && editingEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
              {editingEvent.id ? 'Edit Event' : 'Add College Event'}
            </h3>
            <form onSubmit={handleSaveEvent} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold">Event Name</label>
                <input
                  type="text"
                  value={editingEvent.eventName || ''}
                  onChange={(e) =>
                    setEditingEvent({ ...editingEvent, eventName: e.target.value })
                  }
                  required
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold">Event Type</label>
                  <input
                    type="text"
                    value={editingEvent.eventType || ''}
                    onChange={(e) =>
                      setEditingEvent({ ...editingEvent, eventType: e.target.value })
                    }
                    placeholder="e.g. Technical Fest, Workshop"
                    required
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 mt-1"
                  />
                </div>
                <div>
                  <label className="font-semibold">Date (YYYY-MM-DD)</label>
                  <input
                    type="date"
                    value={editingEvent.date || ''}
                    onChange={(e) =>
                      setEditingEvent({ ...editingEvent, date: e.target.value })
                    }
                    required
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold">Start Time</label>
                  <input
                    type="text"
                    value={editingEvent.startTime || '10:00 AM'}
                    onChange={(e) =>
                      setEditingEvent({ ...editingEvent, startTime: e.target.value })
                    }
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 mt-1"
                  />
                </div>
                <div>
                  <label className="font-semibold">Venue</label>
                  <input
                    type="text"
                    value={editingEvent.venue || 'Main Auditorium'}
                    onChange={(e) =>
                      setEditingEvent({ ...editingEvent, venue: e.target.value })
                    }
                    required
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 mt-1"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold">Description</label>
                <textarea
                  value={editingEvent.description || ''}
                  onChange={(e) =>
                    setEditingEvent({ ...editingEvent, description: e.target.value })
                  }
                  rows={3}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 mt-1"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setEventModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl"
                >
                  Save Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Resolve Question Modal */}
      {answerModalOpen && targetQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
              Add Official College Answer
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Question asked: <span className="font-bold text-slate-800 dark:text-slate-200">"{targetQuestion.question}"</span>
            </p>
            <form onSubmit={handleResolveQuestion} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold">Official Answer</label>
                <textarea
                  value={adminAnswerText}
                  onChange={(e) => setAdminAnswerText(e.target.value)}
                  placeholder="e.g. Yes, SRIT has an active Robotics & Autonomous Systems Club..."
                  required
                  rows={4}
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 mt-1"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAnswerModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl"
                >
                  Publish Answer & Resolve
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Document Upload Modal */}
      {docUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
              Ingest Document Content
            </h3>
            <form onSubmit={handleUploadDoc} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold">Document Title / Filename</label>
                <input
                  type="text"
                  value={docFilename}
                  onChange={(e) => setDocFilename(e.target.value)}
                  placeholder="e.g. NIRF_2025_Summary.txt"
                  required
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 mt-1"
                />
              </div>

              <div>
                <label className="font-semibold">Category</label>
                <select
                  value={docCategory}
                  onChange={(e) => setDocCategory(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 mt-1"
                >
                  <option value="Academics">Academics</option>
                  <option value="Student Statistics">Student Statistics</option>
                  <option value="Events">Events</option>
                  <option value="Student Services">Student Services</option>
                  <option value="General">General</option>
                </select>
              </div>

              <div>
                <label className="font-semibold">Document Text Content</label>
                <textarea
                  value={docContent}
                  onChange={(e) => setDocContent(e.target.value)}
                  placeholder="Paste notice text, NIRF summary, or circular content here..."
                  required
                  rows={6}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 mt-1"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDocUploadModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl"
                >
                  Upload & Index
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
