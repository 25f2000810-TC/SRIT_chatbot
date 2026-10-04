import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Briefcase,
  FileText,
  Lightbulb,
  FileCheck,
  Calculator,
  Sparkles,
  X,
  Copy,
  Check,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  Send,
  BookOpen,
  Cloud,
  BookmarkCheck,
} from 'lucide-react';
import { api } from '../api.js';
import { saveToolItem, getSavedToolItems, SavedToolItem } from '../firebase.js';

export type AIToolType =
  | 'study-plan'
  | 'placement-coach'
  | 'condonation-letter'
  | 'concept-explainer'
  | 'notice-analyzer'
  | 'attendance-calc'
  | 'saved-items';

interface AIToolsModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTool?: AIToolType;
  onSendToChat?: (prompt: string) => void;
  firebaseUser?: any;
}

export const AIToolsModal: React.FC<AIToolsModalProps> = ({
  isOpen,
  onClose,
  defaultTool = 'study-plan',
  onSendToChat,
  firebaseUser,
}) => {
  const [activeTool, setActiveTool] = useState<AIToolType>(defaultTool);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saveNotice, setSaveNotice] = useState<string | null>(null);
  const [savedItems, setSavedItems] = useState<SavedToolItem[]>([]);
  const [loadingSaved, setLoadingSaved] = useState(false);

  useEffect(() => {
    if (activeTool === 'saved-items' && firebaseUser?.uid) {
      setLoadingSaved(true);
      getSavedToolItems(firebaseUser.uid)
        .then((items) => setSavedItems(items || []))
        .catch(console.error)
        .finally(() => setLoadingSaved(false));
    }
  }, [activeTool, firebaseUser]);

  const handleSaveToCloud = async (toolType: string, title: string, data: any) => {
    if (!firebaseUser?.uid) {
      setSaveNotice('Please sign in with Google (top right) to save items to your cloud account.');
      setTimeout(() => setSaveNotice(null), 4000);
      return;
    }
    try {
      await saveToolItem(firebaseUser.uid, toolType, title, data);
      setSaveNotice('Saved to your Firebase Cloud database!');
      setTimeout(() => setSaveNotice(null), 3000);
    } catch {
      setSaveNotice('Could not save item to cloud.');
      setTimeout(() => setSaveNotice(null), 3000);
    }
  };

  // Tool 1: Study Plan State
  const [spBranch, setSpBranch] = useState('Computer Science & Engineering');
  const [spSemester, setSpSemester] = useState(3);
  const [spWeeks, setSpWeeks] = useState(4);
  const [spFocus, setSpFocus] = useState('Data Structures & OOPM Java');
  const [spResult, setSpResult] = useState<{ plan: string; subjects: string[] } | null>(null);

  // Tool 2: Placement Prep State
  const [ppCompany, setPpCompany] = useState('TCS');
  const [ppBranch, setPpBranch] = useState('Computer Science & Engineering');
  const [ppRole, setPpRole] = useState('Software Engineer / Digital Cadre');
  const [ppResult, setPpResult] = useState<{ guide: string; topTopics: string[] } | null>(null);

  // Tool 3: Condonation Letter State
  const [clName, setClName] = useState('Aman Sharma');
  const [clEnroll, setClEnroll] = useState('0205CS221045');
  const [clBranch, setClBranch] = useState('Computer Science & Engineering');
  const [clSem, setClSem] = useState(3);
  const [clPercent, setClPercent] = useState(70);
  const [clReason, setClReason] = useState('Severe viral fever with gastroenteritis');
  const [clStartDate, setClStartDate] = useState('2026-09-12');
  const [clEndDate, setClEndDate] = useState('2026-09-22');
  const [clDoctor, setClDoctor] = useState('City Care Hospital & Medical Center, Jabalpur');
  const [clResult, setClResult] = useState<{ letter: string; condonable: boolean; ruleNotes: string } | null>(null);

  // Tool 4: Concept Explainer State
  const [ceConcept, setCeConcept] = useState('Dijkstra Shortest Path Algorithm');
  const [ceSubject, setCeSubject] = useState('CS303 Data Structures & Algorithms');
  const [ceSem, setCeSem] = useState(3);
  const [ceResult, setCeResult] = useState<{ explanation: string; examTips: string; keyTakeaways: string[] } | null>(null);

  // Tool 5: Notice Analyzer State
  const [naText, setNaText] = useState(
    'ATTENTION ALL 3RD & 5TH SEMESTER B.TECH STUDENTS: RGPV Examination Form submission for Dec 2026 session is live. Regular exam fee is ₹1,500. Last date to submit without late fee is 15th November 2026. Minimum 75% attendance verification from respective HOD is mandatory before approval. In case of medical shortage, submit condonation applications to Principal office by 10th November.'
  );
  const [naResult, setNaResult] = useState<{
    summary: string;
    keyDates: string[];
    actionRequired: string[];
    targetAudience: string;
    urgency: 'HIGH' | 'MEDIUM' | 'LOW';
  } | null>(null);

  // Tool 6: Attendance Calculator State
  const [acTotal, setAcTotal] = useState(120);
  const [acAttended, setAcAttended] = useState(84);
  const [acResult, setAcResult] = useState<{
    currentPercentage: number;
    classesHeld: number;
    classesAttended: number;
    status: 'SAFE' | 'CONDONABLE' | 'DETAINED_DANGER';
    classesNeededFor75: number;
    canMissBefore75: number;
    recommendation: string;
    ordinanceRule: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Run Tool 1
  const handleGenerateStudyPlan = async () => {
    setLoading(true);
    try {
      const res = await api.generateStudyPlan({
        branch: spBranch,
        semester: spSemester,
        weeksUntilExam: spWeeks,
        targetTopics: spFocus,
      });
      setSpResult(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Run Tool 2
  const handleGeneratePlacementPrep = async () => {
    setLoading(true);
    try {
      const res = await api.generatePlacementPrep({
        targetCompany: ppCompany,
        branch: ppBranch,
        targetRole: ppRole,
      });
      setPpResult(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Run Tool 3
  const handleGenerateCondonation = async () => {
    setLoading(true);
    try {
      const res = await api.generateCondonationLetter({
        studentName: clName,
        enrollmentNo: clEnroll,
        branch: clBranch,
        semester: clSem,
        attendancePercent: clPercent,
        medicalReason: clReason,
        startDate: clStartDate,
        endDate: clEndDate,
        doctorName: clDoctor,
      });
      setClResult(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Run Tool 4
  const handleExplainConcept = async () => {
    if (!ceConcept.trim()) return;
    setLoading(true);
    try {
      const res = await api.explainConcept({
        concept: ceConcept,
        subject: ceSubject,
        semester: ceSem,
      });
      setCeResult(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Run Tool 5
  const handleAnalyzeNotice = async () => {
    if (!naText.trim()) return;
    setLoading(true);
    try {
      const res = await api.analyzeNotice({
        noticeText: naText,
      });
      setNaResult(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Run Tool 6
  const handleCalcAttendance = async () => {
    setLoading(true);
    try {
      const res = await api.calculateAttendance({
        totalClasses: acTotal,
        attendedClasses: acAttended,
      });
      setAcResult(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-blue-50/50 via-indigo-50/30 to-purple-50/40 dark:from-slate-800/80 dark:to-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white">
                  SRIT AI Academic & Career Suite
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300">
                  Powered by Gemini
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Specialized smart tools designed for Shri Ram Institute of Technology students & faculty
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex overflow-x-auto no-scrollbar border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/50 p-1.5 gap-1 text-xs font-semibold">
          {[
            { id: 'study-plan', label: 'RGPV Exam Planner', icon: Calendar },
            { id: 'placement-coach', label: 'Placement Coach', icon: Briefcase },
            { id: 'condonation-letter', label: 'Condonation Drafter', icon: FileText },
            { id: 'concept-explainer', label: 'Concept Explainer', icon: Lightbulb },
            { id: 'notice-analyzer', label: 'Notice Analyzer', icon: FileCheck },
            { id: 'attendance-calc', label: 'Attendance Calculator', icon: Calculator },
            { id: 'saved-items', label: 'Saved in Cloud', icon: Cloud },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTool === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTool(tab.id as AIToolType)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs border border-slate-200 dark:border-slate-700'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100/60 dark:hover:bg-slate-800/40'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-blue-600 dark:text-blue-400' : ''}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Global Save Notice Banner */}
        {saveNotice && (
          <div className="px-5 py-2.5 bg-blue-600 text-white text-xs font-semibold flex items-center justify-between animate-in fade-in slide-in-from-top duration-200">
            <div className="flex items-center gap-2">
              <BookmarkCheck className="w-4 h-4" />
              <span>{saveNotice}</span>
            </div>
            <button
              onClick={() => setSaveNotice(null)}
              className="p-1 hover:bg-blue-700 rounded-md transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* TOOL 1: RGPV Exam Revision Planner */}
          {activeTool === 'study-plan' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/40 p-4 rounded-xl text-xs text-slate-700 dark:text-slate-300">
                <div className="font-semibold text-blue-900 dark:text-blue-200 mb-1 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  RGPV CBGS Semester Revision Scheduler
                </div>
                Generates a day-by-day and week-by-week study roadmap calibrated to official RGPV marks weightage, theory vs. lab credits, and recurring past-5-year exam questions.
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Branch</label>
                  <select
                    value={spBranch}
                    onChange={(e) => setSpBranch(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 font-medium"
                  >
                    <option value="Computer Science & Engineering">Computer Science & Engineering (CSE)</option>
                    <option value="Artificial Intelligence & Machine Learning">AI / ML</option>
                    <option value="Data Science">Data Science</option>
                    <option value="Electronics & Communication">Electronics & Communication (ECE)</option>
                    <option value="Mechanical Engineering">Mechanical Engineering</option>
                    <option value="Civil Engineering">Civil Engineering</option>
                    <option value="Electrical & Electronics">Electrical & Electronics (EE)</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Semester</label>
                  <select
                    value={spSemester}
                    onChange={(e) => setSpSemester(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 font-medium"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                      <option key={s} value={s}>Semester {s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Time until Exam</label>
                  <select
                    value={spWeeks}
                    onChange={(e) => setSpWeeks(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 font-medium"
                  >
                    <option value={1}>1 Week (Crash Sprint)</option>
                    <option value={2}>2 Weeks (Targeted Revision)</option>
                    <option value={4}>4 Weeks (Standard Prep)</option>
                    <option value={8}>8 Weeks (Full Semester Mastery)</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Focus Topics / Weak Areas</label>
                  <input
                    type="text"
                    value={spFocus}
                    onChange={(e) => setSpFocus(e.target.value)}
                    placeholder="e.g. Trees, Java OOPs, Discrete Math"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleGenerateStudyPlan}
                  disabled={loading}
                  className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/20 disabled:opacity-50 cursor-pointer"
                >
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  <span>{loading ? 'Synthesizing RGPV Study Plan...' : 'Generate AI Study Plan'}</span>
                </button>
              </div>

              {spResult && (
                <div className="mt-4 p-5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3">
                    <span className="font-bold text-xs uppercase tracking-wider text-slate-500">
                      Generated Revision Plan
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          handleSaveToCloud('study-plan', `Study Plan: ${spBranch} Sem ${spSemester}`, spResult)
                        }
                        className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium hover:underline cursor-pointer"
                        title="Save to your Firebase Firestore cloud account"
                      >
                        <Cloud className="w-3.5 h-3.5" />
                        <span>Save to Cloud</span>
                      </button>
                      <button
                        onClick={() => handleCopy(spResult.plan)}
                        className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 font-medium hover:underline"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copied ? 'Copied' : 'Copy Plan'}</span>
                      </button>
                      {onSendToChat && (
                        <button
                          onClick={() => {
                            onSendToChat(`Help me review this study plan for ${spBranch} Sem ${spSemester}:\n${spResult.plan.slice(0, 300)}...`);
                            onClose();
                          }}
                          className="flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 font-medium hover:underline"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Discuss in Chat</span>
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="prose prose-sm dark:prose-invert max-w-none text-xs leading-relaxed whitespace-pre-line text-slate-800 dark:text-slate-200 font-mono">
                    {spResult.plan}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TOOL 2: Placement Coach */}
          {activeTool === 'placement-coach' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40 p-4 rounded-xl text-xs text-slate-700 dark:text-slate-300">
                <div className="font-semibold text-emerald-900 dark:text-emerald-200 mb-1 flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  SRIT Campus Placement & Recruiter Intelligence
                </div>
                Tailored interview blueprints for campus recruitment drives at SRIT (TCS, Persistent, Cisco, Infosys, Jio) to target packages ranging from 4.5 LPA up to 44 LPA and 85 LPA.
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Target Recruiter</label>
                  <select
                    value={ppCompany}
                    onChange={(e) => setPpCompany(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 font-medium"
                  >
                    <option value="TCS">Tata Consultancy Services (TCS Ninja & Digital)</option>
                    <option value="Persistent Systems">Persistent Systems (₹7 - ₹12 LPA)</option>
                    <option value="Cisco">Cisco Systems (₹15 - ₹24 LPA)</option>
                    <option value="Infosys">Infosys (Specialist Programmer & DSE)</option>
                    <option value="Cognizant">Cognizant (GenC Elevate & Next)</option>
                    <option value="Jio Platforms">Jio Platforms</option>
                    <option value="Hexaware">Hexaware Technologies</option>
                    <option value="Amdocs">Amdocs</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Branch</label>
                  <select
                    value={ppBranch}
                    onChange={(e) => setPpBranch(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 font-medium"
                  >
                    <option value="Computer Science & Engineering">CSE</option>
                    <option value="Artificial Intelligence & Machine Learning">AI / ML</option>
                    <option value="Electronics & Communication">ECE</option>
                    <option value="Mechanical Engineering">Mechanical</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Target Role</label>
                  <input
                    type="text"
                    value={ppRole}
                    onChange={(e) => setPpRole(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleGeneratePlacementPrep}
                  disabled={loading}
                  className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-500/20 disabled:opacity-50 cursor-pointer"
                >
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  <span>{loading ? 'Synthesizing Placement Guide...' : 'Generate Interview Blueprint'}</span>
                </button>
              </div>

              {ppResult && (
                <div className="mt-4 p-5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3">
                    <span className="font-bold text-xs uppercase tracking-wider text-slate-500">
                      Company Interview Guide: {ppCompany}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          handleSaveToCloud('placement-coach', `Placement Guide: ${ppCompany} (${ppRole})`, ppResult)
                        }
                        className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 font-medium hover:underline cursor-pointer"
                        title="Save to your Firebase Firestore cloud account"
                      >
                        <Cloud className="w-3.5 h-3.5" />
                        <span>Save to Cloud</span>
                      </button>
                      <button
                        onClick={() => handleCopy(ppResult.guide)}
                        className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium hover:underline"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copied ? 'Copied' : 'Copy Guide'}</span>
                      </button>
                    </div>
                  </div>

                  <div className="prose prose-sm dark:prose-invert max-w-none text-xs leading-relaxed whitespace-pre-line text-slate-800 dark:text-slate-200 font-mono">
                    {ppResult.guide}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TOOL 3: Condonation Letter Drafter */}
          {activeTool === 'condonation-letter' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 p-4 rounded-xl text-xs text-slate-700 dark:text-slate-300">
                <div className="font-semibold text-amber-900 dark:text-amber-200 mb-1 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  RGPV Ordinance No. 4 Attendance Condonation Drafter
                </div>
                Generates a formal, legally grounded application letter addressed to Principal Dr. Shailesh Gupta, citing permissible 10% medical condonation bylaws (for attendance 65%-75%).
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Student Full Name</label>
                  <input
                    type="text"
                    value={clName}
                    onChange={(e) => setClName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Enrollment Number</label>
                  <input
                    type="text"
                    value={clEnroll}
                    onChange={(e) => setClEnroll(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Current Attendance: <span className="text-blue-600 font-bold">{clPercent}%</span>
                  </label>
                  <input
                    type="range"
                    min={50}
                    max={90}
                    value={clPercent}
                    onChange={(e) => setClPercent(Number(e.target.value))}
                    className="w-full accent-blue-600 mt-2"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>50% (Detained)</span>
                    <span className="font-semibold text-amber-600">65%-75% (Condonable)</span>
                    <span>90% (Safe)</span>
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Branch</label>
                  <input
                    type="text"
                    value={clBranch}
                    onChange={(e) => setClBranch(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Semester</label>
                  <select
                    value={clSem}
                    onChange={(e) => setClSem(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 font-medium"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                      <option key={s} value={s}>Semester {s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Medical/Absence Reason</label>
                  <input
                    type="text"
                    value={clReason}
                    onChange={(e) => setClReason(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Start Date</label>
                  <input
                    type="date"
                    value={clStartDate}
                    onChange={(e) => setClStartDate(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Recovery Date</label>
                  <input
                    type="date"
                    value={clEndDate}
                    onChange={(e) => setClEndDate(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Hospital / Clinic</label>
                  <input
                    type="text"
                    value={clDoctor}
                    onChange={(e) => setClDoctor(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleGenerateCondonation}
                  disabled={loading}
                  className="flex items-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-amber-500/20 disabled:opacity-50 cursor-pointer"
                >
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                  <span>{loading ? 'Drafting Official Application...' : 'Draft Condonation Application'}</span>
                </button>
              </div>

              {clResult && (
                <div className="mt-4 p-5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs uppercase tracking-wider text-slate-500">
                        Official Application Draft
                      </span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          clPercent >= 75
                            ? 'bg-emerald-100 text-emerald-800'
                            : clPercent >= 65
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {clResult.ruleNotes}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          handleSaveToCloud('condonation-letter', `Condonation Letter (${clPercent}% Attendance)`, clResult)
                        }
                        className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 font-medium hover:underline cursor-pointer"
                        title="Save to your Firebase Firestore cloud account"
                      >
                        <Cloud className="w-3.5 h-3.5" />
                        <span>Save to Cloud</span>
                      </button>
                      <button
                        onClick={() => handleCopy(clResult.letter)}
                        className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 font-medium hover:underline"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copied ? 'Copied' : 'Copy Application'}</span>
                      </button>
                    </div>
                  </div>

                  <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs leading-relaxed whitespace-pre-line text-slate-800 dark:text-slate-200 font-serif">
                    {clResult.letter}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TOOL 4: Academic Concept & Code Explainer */}
          {activeTool === 'concept-explainer' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200/60 dark:border-purple-900/40 p-4 rounded-xl text-xs text-slate-700 dark:text-slate-300">
                <div className="font-semibold text-purple-900 dark:text-purple-200 mb-1 flex items-center gap-1.5">
                  <Lightbulb className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  RGPV Technical Concept & Exam Answer Explainer
                </div>
                Turns complex theoretical and algorithmic concepts into simple real-world analogies, code implementations, and high-scoring 7-mark RGPV exam answer formats.
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Concept or Algorithm to Explain
                  </label>
                  <input
                    type="text"
                    value={ceConcept}
                    onChange={(e) => setCeConcept(e.target.value)}
                    placeholder="e.g. Red-Black Trees, Dijkstra Algorithm, Java OOP Polymorphism, Karnaugh Maps"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5"
                  />
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="text-[11px] text-slate-500 self-center mr-1">Quick Picks:</span>
                  {[
                    'Dijkstra Shortest Path',
                    'Red-Black Tree Rotations',
                    'Java Interface vs Abstract Class',
                    'Paging vs Segmentation in OS',
                    'K-Maps 4-Variable Minimization',
                    'TCP 3-Way Handshake',
                  ].map((p) => (
                    <button
                      key={p}
                      onClick={() => setCeConcept(p)}
                      className="text-[11px] px-2 py-1 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                    >
                      {p}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Subject / Course Name</label>
                    <input
                      type="text"
                      value={ceSubject}
                      onChange={(e) => setCeSubject(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Semester</label>
                    <select
                      value={ceSem}
                      onChange={(e) => setCeSem(Number(e.target.value))}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 font-medium"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                        <option key={s} value={s}>Semester {s}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleExplainConcept}
                  disabled={loading}
                  className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-purple-500/20 disabled:opacity-50 cursor-pointer"
                >
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Lightbulb className="w-4 h-4" />}
                  <span>{loading ? 'Synthesizing Explanation...' : 'Explain Academic Concept'}</span>
                </button>
              </div>

              {ceResult && (
                <div className="mt-4 p-5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3">
                    <span className="font-bold text-xs uppercase tracking-wider text-slate-500">
                      Concept Guide: {ceConcept}
                    </span>
                    <button
                      onClick={() => handleCopy(ceResult.explanation)}
                      className="flex items-center gap-1 text-xs text-purple-600 dark:text-purple-400 font-medium hover:underline"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>

                  <div className="prose prose-sm dark:prose-invert max-w-none text-xs leading-relaxed whitespace-pre-line text-slate-800 dark:text-slate-200 font-mono">
                    {ceResult.explanation}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TOOL 5: Notice Analyzer */}
          {activeTool === 'notice-analyzer' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="bg-sky-50/50 dark:bg-sky-950/20 border border-sky-200/60 dark:border-sky-900/40 p-4 rounded-xl text-xs text-slate-700 dark:text-slate-300">
                <div className="font-semibold text-sky-900 dark:text-sky-200 mb-1 flex items-center gap-1.5">
                  <FileCheck className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                  College Notice & Circular Breakdown Engine
                </div>
                Paste any complex campus notification, circular, or fee notice to instantly extract deadlines, target branches, and actionable steps.
              </div>

              <div className="space-y-2 text-xs">
                <label className="font-semibold text-slate-700 dark:text-slate-300 block">
                  Paste Circular / Notification Text
                </label>
                <textarea
                  rows={5}
                  value={naText}
                  onChange={(e) => setNaText(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 font-mono text-xs leading-relaxed"
                />
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleAnalyzeNotice}
                  disabled={loading}
                  className="flex items-center gap-2 px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-sky-500/20 disabled:opacity-50 cursor-pointer"
                >
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <FileCheck className="w-4 h-4" />}
                  <span>{loading ? 'Analyzing Circular...' : 'Extract Key Dates & Actions'}</span>
                </button>
              </div>

              {naResult && (
                <div className="mt-4 p-5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3">
                    <span className="font-bold text-xs uppercase tracking-wider text-slate-500">
                      Notice Executive Summary
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        naResult.urgency === 'HIGH'
                          ? 'bg-red-100 text-red-800'
                          : naResult.urgency === 'MEDIUM'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      Urgency: {naResult.urgency}
                    </span>
                  </div>

                  <p className="text-xs text-slate-800 dark:text-slate-200 font-medium">
                    {naResult.summary}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs">
                    <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                      <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 mb-2">
                        <Calendar className="w-3.5 h-3.5 text-blue-600" />
                        Important Dates & Deadlines
                      </span>
                      <ul className="space-y-1 text-slate-600 dark:text-slate-300">
                        {naResult.keyDates.map((d, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="text-blue-500 font-bold">•</span>
                            <span>{d}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                      <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 mb-2">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                        Action Items for Students
                      </span>
                      <ul className="space-y-1 text-slate-600 dark:text-slate-300">
                        {naResult.actionRequired.map((a, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="text-emerald-500 font-bold">✓</span>
                            <span>{a}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TOOL 6: Attendance Calculator */}
          {activeTool === 'attendance-calc' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-900/40 p-4 rounded-xl text-xs text-slate-700 dark:text-slate-300">
                <div className="font-semibold text-rose-900 dark:text-rose-200 mb-1 flex items-center gap-1.5">
                  <Calculator className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                  RGPV Attendance Shortage & Recovery Calculator
                </div>
                Calculates your exact percentage against the mandatory 75% rule, computes how many consecutive classes you must attend to cross 75%, and evaluates medical condonation eligibility.
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Total Lectures / Practicals Held
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={acTotal}
                    onChange={(e) => setAcTotal(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 font-bold text-base"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Lectures / Practicals Attended
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={acTotal}
                    value={acAttended}
                    onChange={(e) => setAcAttended(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 font-bold text-base"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleCalcAttendance}
                  disabled={loading}
                  className="flex items-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-rose-500/20 disabled:opacity-50 cursor-pointer"
                >
                  <Calculator className="w-4 h-4" />
                  <span>Calculate Attendance & Recovery</span>
                </button>
              </div>

              {acResult && (
                <div className="mt-4 p-5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-4">
                  {/* Big Percentage Header */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-16 h-16 rounded-2xl flex items-center justify-center font-extrabold text-xl shadow-md ${
                          acResult.status === 'SAFE'
                            ? 'bg-emerald-500 text-white shadow-emerald-500/20'
                            : acResult.status === 'CONDONABLE'
                            ? 'bg-amber-500 text-white shadow-amber-500/20'
                            : 'bg-rose-600 text-white shadow-rose-600/20'
                        }`}
                      >
                        {acResult.currentPercentage}%
                      </div>
                      <div>
                        <div className="font-bold text-sm text-slate-900 dark:text-white">
                          {acResult.status === 'SAFE'
                            ? 'Safe: Above 75% Requirement'
                            : acResult.status === 'CONDONABLE'
                            ? 'Attendance Shortage: Condonable on Medical Grounds'
                            : 'Critical Shortage: Below 65% Detention Floor'}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {acResult.classesAttended} attended out of {acResult.classesHeld} classes held
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      {acResult.status === 'SAFE' ? (
                        <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                          Can miss up to <span className="font-bold text-base">{acResult.canMissBefore75}</span> more classes
                        </div>
                      ) : (
                        <div className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                          Must attend next <span className="font-bold text-base">{acResult.classesNeededFor75}</span> consecutive classes
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Advice */}
                  <div className="p-4 bg-blue-50/60 dark:bg-blue-950/30 rounded-xl border border-blue-200 dark:border-blue-900/40 text-xs space-y-2">
                    <div className="font-bold text-blue-900 dark:text-blue-200 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                      AI Academic Guidance
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                      {acResult.recommendation}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 italic pt-1 border-t border-blue-200/50 dark:border-blue-900/30">
                      {acResult.ordinanceRule}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TOOL 7: Cloud Saved Items */}
          {activeTool === 'saved-items' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="bg-sky-50/50 dark:bg-sky-950/20 border border-sky-200/60 dark:border-sky-900/40 p-4 rounded-xl text-xs text-slate-700 dark:text-slate-300">
                <div className="font-semibold text-sky-900 dark:text-sky-200 mb-1 flex items-center gap-1.5">
                  <Cloud className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                  Firestore Cloud Sync & Storage
                </div>
                Your personalized saved revision plans, interview blueprints, condonation drafts, and explanations are securely stored in Firebase Firestore and accessible across all your devices.
              </div>

              {!firebaseUser ? (
                <div className="text-center py-10 px-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 mx-auto flex items-center justify-center">
                    <Cloud className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                    Sign in to Access Your Cloud Vault
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                    Sign in using your Google account in the top-right header to save, sync, and retrieve your personalized academic plans and interview guides.
                  </p>
                </div>
              ) : loadingSaved ? (
                <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-500 text-xs">
                  <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
                  <span>Loading your cloud documents...</span>
                </div>
              ) : savedItems.length === 0 ? (
                <div className="text-center py-10 px-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                  <BookmarkCheck className="w-8 h-8 text-slate-400 mx-auto" />
                  <h4 className="font-semibold text-sm text-slate-700 dark:text-slate-300">
                    No Saved Items Yet
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Use any of the AI tools and click "Save to Cloud" to keep a copy here in your Firestore database.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {savedItems.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300">
                            {item.toolType}
                          </span>
                          <h5 className="font-bold text-xs text-slate-900 dark:text-white">
                            {item.title}
                          </h5>
                        </div>
                        <span className="text-[10px] text-slate-400">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-lg text-[11px] font-mono whitespace-pre-line text-slate-700 dark:text-slate-300 max-h-40 overflow-y-auto">
                        {item.data?.plan || item.data?.guide || item.data?.letter || item.data?.explanation || JSON.stringify(item.data, null, 2)}
                      </div>
                      <div className="flex justify-end gap-2 pt-1">
                        <button
                          onClick={() => handleCopy(item.data?.plan || item.data?.guide || item.data?.letter || item.data?.explanation || '')}
                          className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 font-medium hover:underline cursor-pointer"
                        >
                          <Copy className="w-3 h-3" />
                          <span>Copy Content</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
