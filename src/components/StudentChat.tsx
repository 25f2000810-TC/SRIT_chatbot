import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Sparkles,
  Bot,
  User as UserIcon,
  ExternalLink,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  Mic,
  MicOff,
  Calendar,
  Users,
  Compass,
  BookOpen,
  HelpCircle,
  Clock,
  CheckCircle,
  GraduationCap,
  Award,
  BarChart3,
  Briefcase,
  Building2,
  Volume2,
  VolumeX,
  Copy,
  Check,
  Zap,
  Wand2,
  FileText,
  Lightbulb,
  Calculator,
  FileCheck,
} from 'lucide-react';
import {
  api,
  ChatMessage,
  CollegeEvent,
  Club,
  Person,
  FacultyMember,
  InstitutionalStatistic,
} from '../api.js';
import { EventCard } from './EventCard.js';
import { ClubCard } from './ClubCard.js';
import { FeedbackModal } from './FeedbackModal.js';
import { EventModal } from './EventModal.js';

interface StudentChatProps {
  conversationId?: string;
  initialPrompt?: string;
  onConversationCreated?: (id: string) => void;
  onViewEvent?: (event: CollegeEvent) => void;
  onOpenAITools?: (tool?: any) => void;
}

export const StudentChat: React.FC<StudentChatProps> = ({
  conversationId: propConvId,
  initialPrompt,
  onConversationCreated,
  onViewEvent,
  onOpenAITools,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentConvId, setCurrentConvId] = useState<string | undefined>(propConvId);
  const [feedbackTarget, setFeedbackTarget] = useState<{
    messageId: string;
    question: string;
    answer: string;
  } | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<CollegeEvent | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);
  const [summaries, setSummaries] = useState<Record<string, string>>({});
  const [summarizingId, setSummarizingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);

  const speakText = (msgId: string, text: string) => {
    if (!('speechSynthesis' in window)) return;
    if (speakingMsgId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingMsgId(null);
      return;
    }
    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*_#`[\]()]/g, '').trim();
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.onend = () => setSpeakingMsgId(null);
    utterance.onerror = () => setSpeakingMsgId(null);
    setSpeakingMsgId(msgId);
    window.speechSynthesis.speak(utterance);
  };

  const copyText = (msgId: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(msgId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleSummarize = async (msgId: string, text: string) => {
    if (summaries[msgId]) {
      setSummaries((prev) => {
        const next = { ...prev };
        delete next[msgId];
        return next;
      });
      return;
    }
    setSummarizingId(msgId);
    try {
      const res = await api.summarizeAnswer(text);
      if (res?.summary) {
        setSummaries((prev) => ({ ...prev, [msgId]: res.summary }));
      }
    } catch (e) {
      console.error('Error summarizing:', e);
    } finally {
      setSummarizingId(null);
    }
  };

  // Check speech recognition support
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSpeechSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-IN';
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
        setIsListening(false);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognitionRef.current = recognition;
    }
  }, []);

  const toggleListening = () => {
    if (!speechSupported || !recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error('Speech recognition error:', err);
      }
    }
  };

  // Load existing messages if conversationId changed
  useEffect(() => {
    if (propConvId) {
      setCurrentConvId(propConvId);
      api
        .getConversation(propConvId)
        .then((res) => {
          if (res.conversation) setMessages(res.conversation.messages || []);
        })
        .catch((err) => console.error('Error fetching conversation:', err));
    }
  }, [propConvId]);

  // Handle initialPrompt trigger
  useEffect(() => {
    if (initialPrompt && initialPrompt.trim()) {
      handleSend(initialPrompt);
    }
  }, [initialPrompt]);

  // Scroll to bottom on message update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || loading) return;

    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    const tempUserMsg: ChatMessage = {
      id: `temp-${Date.now()}`,
      conversationId: currentConvId || '',
      role: 'user',
      content: query,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);
    setLoading(true);

    try {
      const res = await api.sendMessage(query, currentConvId);
      if (!currentConvId && res.conversationId) {
        setCurrentConvId(res.conversationId);
        onConversationCreated?.(res.conversationId);
      }
      setMessages((prev) => {
        const withoutTemp = prev.filter((m) => m.id !== tempUserMsg.id);
        return [...withoutTemp, tempUserMsg, res.message];
      });
    } catch (err: any) {
      console.error('Failed to send message:', err);
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        conversationId: currentConvId || '',
        role: 'assistant',
        content:
          'Something went wrong while retrieving that information. Please try again or check the official website at https://sritgroup.net/',
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInputResize = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
  };

  const handleHelpful = async (msg: ChatMessage) => {
    if (!msg.feedback) {
      setMessages((prev) =>
        prev.map((m) => (m.id === msg.id ? { ...m, feedback: { rating: 'helpful' } } : m))
      );
      try {
        await api.sendFeedback({
          messageId: msg.id,
          question: 'Student question',
          answer: msg.content,
          rating: 'helpful',
        });
      } catch (err) {
        console.error('Feedback error:', err);
      }
    }
  };

  const handleUnhelpful = (msg: ChatMessage) => {
    const msgIdx = messages.findIndex((m) => m.id === msg.id);
    const prevUserMsg = msgIdx > 0 ? messages[msgIdx - 1]?.content : 'Student query';
    setFeedbackTarget({
      messageId: msg.id,
      question: prevUserMsg,
      answer: msg.content,
    });
  };

  const starterQuestions = [
    { label: 'Founder Chairman', query: 'Who is Founder Chairman Er. R. K. Karsoliya?' },
    { label: 'Executive Team', query: 'Who are the members of the Shri Ram Group leadership team?' },
    { label: 'Group Director', query: 'Who is Group Director Dr. S. P. Kosta?' },
    { label: 'HOD of CSE', query: 'Who is the HOD of CSE?' },
    { label: 'SRIT Affiliation', query: 'Which university is SRIT affiliated with?' },
    { label: 'Minimum Attendance', query: 'What is the minimum attendance required?' },
    { label: '3rd Sem Subjects', query: 'What subjects are in 3rd semester CSE?' },
    { label: 'Highest Package', query: 'What was the highest package last year?' },
    { label: 'Rewa Shiksha Samiti', query: 'What is Rewa Shiksha Samiti?' },
  ];

  const quickPromptPills = [
    'Who is Founder Chairman Er. R. K. Karsoliya?',
    'Executive Leadership Team (Our Team)',
    'Who is Group Director Dr. S. P. Kosta?',
    'Attendance 75% & Condonation Rule',
    'SRIT Highest Placement Package',
    '3rd Sem CSE Subjects',
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-5xl mx-auto w-full px-2 sm:px-4">
      {/* AI Grounding Status Bar */}
      <div className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-transparent border border-blue-500/20 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 my-2 shrink-0">
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 animate-pulse" />
          <span className="font-semibold text-slate-700 dark:text-slate-200">
            Multi-Model Gemini AI Engine
          </span>
          <span className="hidden sm:inline text-slate-400">• Grounded in verified SRIT & Rewa Shiksha Samiti intelligence</span>
        </div>
        <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200/50 dark:border-emerald-800/50">
          ● Verified Campus AI
        </span>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto py-2 space-y-6">
        {messages.length === 0 ? (
          /* Landing Experience / Empty State */
          <div className="max-w-3xl mx-auto py-6 sm:py-10 px-4 text-center animate-in fade-in duration-300">
            {/* Hero Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-xs font-semibold border border-blue-200 dark:border-blue-900/50 mb-3 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Official SRIT Knowledge Base Online</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">
              Meet SRIT AI
            </h1>

            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-xl mx-auto mb-6 font-normal leading-relaxed">
              Your intelligent guide to Shri Ram Institute of Technology — leadership, faculty, departments, courses, student statistics, fests, and campus services.
            </p>

            {/* Core Highlights Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8 text-left">
              <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-blue-300 dark:hover:border-blue-800 transition-all">
                <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-2 font-bold text-sm">
                  🏛️
                </div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-0.5">
                  Leadership & Faculty
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                  Directors, Principal, TPO & verified professors
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-indigo-300 dark:hover:border-indigo-800 transition-all">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-2 font-bold text-sm">
                  📊
                </div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-0.5">
                  NIRF & Statistics
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                  Accurate student & faculty reporting
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-emerald-300 dark:hover:border-emerald-800 transition-all">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-2 font-bold text-sm">
                  📅
                </div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-0.5">
                  Live College Events
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                  TechFest, EPL cricket & fests
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-amber-300 dark:hover:border-amber-800 transition-all">
                <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-2 font-bold text-sm">
                  🔄
                </div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-0.5">
                  Admin Updatable
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                  Instant learning with zero model retraining
                </p>
              </div>
            </div>

            {/* AI Academic & Career Suite Showcase */}
            {onOpenAITools && (
              <div className="mb-8 p-4 rounded-2xl bg-gradient-to-br from-blue-50/70 via-indigo-50/50 to-purple-50/70 dark:from-slate-900 dark:via-blue-950/20 dark:to-slate-900 border border-blue-200/80 dark:border-blue-900/40 text-left shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Wand2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span className="font-extrabold text-xs text-slate-900 dark:text-white uppercase tracking-wider">
                      Specialized AI Tools Suite
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-600 text-white shadow-xs">
                      NEW
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Click to launch smart assistant
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  <button
                    onClick={() => onOpenAITools('study-plan')}
                    className="p-3 rounded-xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-xs transition-all text-left group cursor-pointer"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <Calendar className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-bold text-xs text-slate-900 dark:text-white">RGPV Planner</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                      Structured week-by-week revision schedule & PYQs
                    </p>
                  </button>

                  <button
                    onClick={() => onOpenAITools('placement-coach')}
                    className="p-3 rounded-xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 hover:border-emerald-400 dark:hover:border-emerald-500 hover:shadow-xs transition-all text-left group cursor-pointer"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                        <Briefcase className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-bold text-xs text-slate-900 dark:text-white">Placement Coach</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                      Company patterns for TCS, Cisco, Persistent & 44 LPA prep
                    </p>
                  </button>

                  <button
                    onClick={() => onOpenAITools('condonation-letter')}
                    className="p-3 rounded-xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 hover:border-amber-400 dark:hover:border-amber-500 hover:shadow-xs transition-all text-left group cursor-pointer"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                        <FileText className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-bold text-xs text-slate-900 dark:text-white">Condonation Drafter</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                      Official RGPV Ordinance 4 medical application letter
                    </p>
                  </button>

                  <button
                    onClick={() => onOpenAITools('concept-explainer')}
                    className="p-3 rounded-xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 hover:border-purple-400 dark:hover:border-purple-500 hover:shadow-xs transition-all text-left group cursor-pointer"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className="p-1.5 rounded-lg bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                        <Lightbulb className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-bold text-xs text-slate-900 dark:text-white">Concept Explainer</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                      Analogies, code implementations & 7-mark exam answers
                    </p>
                  </button>

                  <button
                    onClick={() => onOpenAITools('attendance-calc')}
                    className="p-3 rounded-xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 hover:border-rose-400 dark:hover:border-rose-500 hover:shadow-xs transition-all text-left group cursor-pointer"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 group-hover:bg-rose-600 group-hover:text-white transition-colors">
                        <Calculator className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-bold text-xs text-slate-900 dark:text-white">Attendance Calc</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                      Recovery calculator against 75% RGPV requirement
                    </p>
                  </button>

                  <button
                    onClick={() => onOpenAITools('notice-analyzer')}
                    className="p-3 rounded-xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 hover:border-sky-400 dark:hover:border-sky-500 hover:shadow-xs transition-all text-left group cursor-pointer"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className="p-1.5 rounded-lg bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-400 group-hover:bg-sky-600 group-hover:text-white transition-colors">
                        <FileCheck className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-bold text-xs text-slate-900 dark:text-white">Notice Analyzer</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                      Extract deadlines & action items from any circular
                    </p>
                  </button>
                </div>
              </div>
            )}

            {/* Suggested Prompts */}
            <div className="text-left">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3 text-center sm:text-left">
                Common Student Inquiries
              </p>
              <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                {starterQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(q.query)}
                    className="px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 hover:bg-blue-50 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl border border-slate-200 dark:border-slate-800 transition-all shadow-2xs hover:shadow-xs cursor-pointer"
                  >
                    {q.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Conversation Thread */
          messages.map((msg, index) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id || index}
                className={`flex gap-3 sm:gap-4 max-w-4xl mx-auto ${
                  isUser ? 'justify-end' : 'justify-start'
                } animate-in fade-in duration-200`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center shrink-0 shadow-sm mt-1">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`relative max-w-[88%] sm:max-w-[80%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                    isUser
                      ? 'bg-blue-600 text-white shadow-sm rounded-tr-xs'
                      : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 shadow-xs rounded-tl-xs'
                  }`}
                >
                  {/* Message Content */}
                  <div className="whitespace-pre-wrap font-sans">
                    {msg.content}
                  </div>

                  {/* Matched Leadership Profiles */}
                  {!isUser && msg.matchedPersons && msg.matchedPersons.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-2">
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-1.5">
                        <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
                        <span>Leadership Profile</span>
                      </p>
                      {msg.matchedPersons.map((person) => (
                        <div
                          key={person.id}
                          className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-xs"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-slate-900 dark:text-white">
                              {person.fullName}
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-semibold">
                              {person.designation}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mb-1">
                            {person.institution} ({person.institutionId})
                          </p>
                          <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                            {person.biography}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Matched Faculty Members */}
                  {!isUser && msg.matchedFaculty && msg.matchedFaculty.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-2">
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-1.5">
                        <Award className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Faculty Information ({msg.matchedFaculty.length})</span>
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {msg.matchedFaculty.map((fac) => (
                          <div
                            key={fac.id}
                            className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-xs"
                          >
                            <p className="font-bold text-slate-900 dark:text-white">
                              {fac.fullName}
                            </p>
                            <p className="text-[11px] text-blue-600 font-medium">
                              {fac.designation}, {fac.department}
                            </p>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              Qualifications: {fac.qualification}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Matched Institutional Statistics */}
                  {!isUser && msg.matchedStatistics && msg.matchedStatistics.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-2">
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-1.5">
                        <BarChart3 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Official Data & NIRF Statistics</span>
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {msg.matchedStatistics.map((stat) => (
                          <div
                            key={stat.id}
                            className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-xs"
                          >
                            <p className="text-[11px] text-slate-500 font-medium">{stat.statisticName}</p>
                            <p className="text-sm font-extrabold text-slate-900 dark:text-white mt-0.5">
                              {stat.value} {stat.unit || ''}
                            </p>
                            <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                              <span>{stat.institution}</span>
                              <span className="font-semibold text-emerald-600 dark:text-emerald-400">{stat.academicYear}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Matched Event Cards */}
                  {!isUser && msg.matchedEvents && msg.matchedEvents.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-2">
                        <Calendar className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                        <span>Related College Events ({msg.matchedEvents.length})</span>
                      </p>
                      <div className="space-y-2">
                        {msg.matchedEvents.map((evt) => (
                          <EventCard
                            key={evt.id}
                            event={evt}
                            onViewDetails={(e) => setSelectedEvent(e)}
                            onRegister={(e) => setSelectedEvent(e)}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Matched Club Cards */}
                  {!isUser && msg.matchedClubs && msg.matchedClubs.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-2">
                        <Users className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                        <span>Related Student Clubs & Societies</span>
                      </p>
                      <div className="space-y-2">
                        {msg.matchedClubs.map((club) => (
                          <ClubCard key={club.id} club={club} />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* AI Summary Card (if triggered) */}
                  {!isUser && summaries[msg.id] && (
                    <div className="mt-3 p-3 rounded-xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 text-xs animate-in fade-in duration-200">
                      <div className="flex items-center justify-between gap-1.5 text-blue-700 dark:text-blue-300 font-bold mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                          <span>AI Key Takeaways</span>
                        </div>
                        <button
                          onClick={() => toggleSummarize(msg.id, msg.content)}
                          className="text-[10px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                        >
                          Dismiss
                        </button>
                      </div>
                      <div className="text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed font-sans text-xs">
                        {summaries[msg.id]}
                      </div>
                    </div>
                  )}

                  {/* Staff Verification Ticket Notification */}
                  {!isUser && msg.ticketId && (
                    <div className="mt-3 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 flex items-center justify-between text-xs text-amber-800 dark:text-amber-300">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                        <span className="font-medium">Forwarded to college academic staff for verification</span>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-900/60 font-mono font-bold">
                        Ticket: {msg.ticketId}
                      </span>
                    </div>
                  )}

                  {/* Source Transparency */}
                  {!isUser && msg.sources && msg.sources.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/60 flex flex-wrap items-center gap-2 text-[11px]">
                      <span className="font-semibold text-slate-400 dark:text-slate-500">
                        Sources:
                      </span>
                      {msg.sources.map((src, sIdx) => (
                        <a
                          key={sIdx}
                          href={src.sourceUrl || 'https://sritgroup.net/'}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-blue-700 dark:text-blue-300 hover:underline border border-slate-200 dark:border-slate-700/60"
                        >
                          <span className="truncate max-w-[220px] font-medium">{src.title}</span>
                          {src.verifiedDate && (
                            <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/60 px-1 py-0.2 rounded">
                              Verified: {src.verifiedDate}
                            </span>
                          )}
                          <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                        </a>
                      ))}
                    </div>
                  )}

                  {/* Action & Feedback Bar for Assistant */}
                  {!isUser && (
                    <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/60 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1 text-[10px]">
                        <Clock className="w-3 h-3" />
                        {new Date(msg.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>

                      <div className="flex items-center gap-1.5 flex-wrap">
                        <button
                          onClick={() => toggleSummarize(msg.id, msg.content)}
                          disabled={summarizingId === msg.id}
                          className={`p-1 px-2 rounded-md transition-colors flex items-center gap-1 cursor-pointer font-medium text-[10px] ${
                            summaries[msg.id]
                              ? 'text-amber-600 bg-amber-50 dark:bg-amber-950/50 font-bold'
                              : 'text-slate-500 hover:text-amber-600 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                          title="Generate AI summary of this answer"
                        >
                          <Zap className={`w-3 h-3 ${summarizingId === msg.id ? 'animate-bounce text-amber-500' : 'text-amber-500'}`} />
                          <span>{summarizingId === msg.id ? 'Summarizing...' : summaries[msg.id] ? 'Hide Summary' : 'AI Summary'}</span>
                        </button>

                        <button
                          onClick={() => speakText(msg.id, msg.content)}
                          className={`p-1 px-2 rounded-md transition-colors flex items-center gap-1 cursor-pointer font-medium text-[10px] ${
                            speakingMsgId === msg.id
                              ? 'text-blue-600 bg-blue-50 dark:bg-blue-950/60 font-bold'
                              : 'text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                          title={speakingMsgId === msg.id ? 'Stop audio' : 'Listen to AI answer'}
                        >
                          {speakingMsgId === msg.id ? (
                            <VolumeX className="w-3 h-3 animate-pulse text-rose-500" />
                          ) : (
                            <Volume2 className="w-3 h-3" />
                          )}
                          <span>{speakingMsgId === msg.id ? 'Stop' : 'Listen'}</span>
                        </button>

                        <button
                          onClick={() => copyText(msg.id, msg.content)}
                          className="p-1 px-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 transition-colors flex items-center gap-1 cursor-pointer font-medium text-[10px]"
                          title="Copy response"
                        >
                          {copiedId === msg.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedId === msg.id ? 'Copied!' : 'Copy'}</span>
                        </button>

                        <span className="w-px h-3 bg-slate-200 dark:bg-slate-700 mx-0.5" />

                        <button
                          onClick={() => handleHelpful(msg)}
                          className={`p-1 rounded-md transition-colors flex items-center gap-1 cursor-pointer ${
                            msg.feedback?.rating === 'helpful'
                              ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 font-bold'
                              : 'hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                          title="Helpful response"
                        >
                          <ThumbsUp className="w-3 h-3" />
                          {msg.feedback?.rating === 'helpful' && (
                            <span className="text-[10px]">Helpful</span>
                          )}
                        </button>
                        <button
                          onClick={() => handleUnhelpful(msg)}
                          className={`p-1 rounded-md transition-colors flex items-center gap-1 cursor-pointer ${
                            msg.feedback?.rating === 'unhelpful'
                              ? 'text-rose-600 bg-rose-50 dark:bg-rose-950/50 font-bold'
                              : 'hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                          title="Not helpful / incorrect"
                        >
                          <ThumbsDown className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center shrink-0 shadow-xs mt-1">
                    <UserIcon className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })
        )}

        {/* Loading Indicator */}
        {loading && (
          <div className="flex gap-3 max-w-4xl mx-auto items-center animate-in fade-in duration-200">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Bot className="w-4 h-4 animate-spin" />
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl rounded-tl-xs px-4 py-3 shadow-xs">
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-600" />
                <span>Searching verified SRIT leadership, faculty & institutional database...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Box Area */}
      <div className="py-2 bg-gradient-to-t from-slate-50 via-slate-50 to-transparent dark:from-slate-950 dark:via-slate-950 dark:to-transparent">
        {/* AI Tools Quick Bar */}
        {onOpenAITools && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-none text-[11px]">
            <span className="text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400 shrink-0 flex items-center gap-1 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-full border border-indigo-200/50 dark:border-indigo-900/50">
              <Wand2 className="w-3 h-3 text-indigo-600 dark:text-indigo-400" /> AI Tools:
            </span>
            <button
              type="button"
              onClick={() => onOpenAITools('study-plan')}
              className="shrink-0 px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-900/50 hover:bg-blue-100 dark:hover:bg-blue-900 text-blue-700 dark:text-blue-300 font-semibold cursor-pointer flex items-center gap-1 transition-all"
            >
              <Calendar className="w-3 h-3 text-blue-500" />
              <span>Exam Planner</span>
            </button>
            <button
              type="button"
              onClick={() => onOpenAITools('placement-coach')}
              className="shrink-0 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-900/50 hover:bg-emerald-100 dark:hover:bg-emerald-900 text-emerald-700 dark:text-emerald-300 font-semibold cursor-pointer flex items-center gap-1 transition-all"
            >
              <Briefcase className="w-3 h-3 text-emerald-500" />
              <span>Placement Coach</span>
            </button>
            <button
              type="button"
              onClick={() => onOpenAITools('condonation-letter')}
              className="shrink-0 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200/80 dark:border-amber-900/50 hover:bg-amber-100 dark:hover:bg-amber-900 text-amber-700 dark:text-amber-300 font-semibold cursor-pointer flex items-center gap-1 transition-all"
            >
              <FileText className="w-3 h-3 text-amber-500" />
              <span>Condonation Drafter</span>
            </button>
            <button
              type="button"
              onClick={() => onOpenAITools('concept-explainer')}
              className="shrink-0 px-2.5 py-1 rounded-full bg-purple-50 dark:bg-purple-950/60 border border-purple-200/80 dark:border-purple-900/50 hover:bg-purple-100 dark:hover:bg-purple-900 text-purple-700 dark:text-purple-300 font-semibold cursor-pointer flex items-center gap-1 transition-all"
            >
              <Lightbulb className="w-3 h-3 text-purple-500" />
              <span>Concept Explainer</span>
            </button>
            <button
              type="button"
              onClick={() => onOpenAITools('attendance-calc')}
              className="shrink-0 px-2.5 py-1 rounded-full bg-rose-50 dark:bg-rose-950/60 border border-rose-200/80 dark:border-rose-900/50 hover:bg-rose-100 dark:hover:bg-rose-900 text-rose-700 dark:text-rose-300 font-semibold cursor-pointer flex items-center gap-1 transition-all"
            >
              <Calculator className="w-3 h-3 text-rose-500" />
              <span>Attendance Calc</span>
            </button>
            <button
              type="button"
              onClick={() => onOpenAITools('notice-analyzer')}
              className="shrink-0 px-2.5 py-1 rounded-full bg-sky-50 dark:bg-sky-950/60 border border-sky-200/80 dark:border-sky-900/50 hover:bg-sky-100 dark:hover:bg-sky-900 text-sky-700 dark:text-sky-300 font-semibold cursor-pointer flex items-center gap-1 transition-all"
            >
              <FileCheck className="w-3 h-3 text-sky-500" />
              <span>Notice Analyzer</span>
            </button>
          </div>
        )}

        {/* Quick Suggestion Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none text-[11px]">
          <span className="text-[10px] uppercase font-bold text-slate-400 shrink-0 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-blue-500" /> Suggestions:
          </span>
          {quickPromptPills.map((pill, pIdx) => (
            <button
              key={pIdx}
              type="button"
              onClick={() => handleSend(pill)}
              disabled={loading}
              className="shrink-0 px-2.5 py-1 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all text-slate-600 dark:text-slate-300 shadow-2xs font-medium cursor-pointer disabled:opacity-50"
            >
              {pill}
            </button>
          ))}
        </div>

        <div className="relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-300 dark:border-slate-800 shadow-md focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all p-2">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleInputResize}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything about SRIT (leadership, faculty, courses, student strength, fests)..."
            rows={1}
            disabled={loading}
            className="w-full bg-transparent resize-none border-none outline-none text-xs sm:text-sm text-slate-900 dark:text-white px-2 py-1 placeholder-slate-400 max-h-32"
          />

          <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800/80 px-1 text-xs">
            <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
              <span className="hidden sm:inline">Press Enter to send</span>
              {speechSupported && (
                <button
                  type="button"
                  onClick={toggleListening}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    isListening
                      ? 'text-rose-600 bg-rose-50 dark:bg-rose-950 animate-pulse'
                      : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                  }`}
                  title={isListening ? 'Listening... click to stop' : 'Voice search'}
                >
                  {isListening ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5" />}
                </button>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleSend()}
                disabled={!input.trim() || loading}
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-xs flex items-center gap-1.5 shadow-xs transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <span>Ask</span>
                <Send className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {feedbackTarget && (
        <FeedbackModal
          messageId={feedbackTarget.messageId}
          question={feedbackTarget.question}
          answer={feedbackTarget.answer}
          onClose={() => setFeedbackTarget(null)}
          onSubmitted={() => {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === feedbackTarget.messageId
                  ? { ...m, feedback: { rating: 'unhelpful' } }
                  : m
              )
            );
          }}
        />
      )}

      {selectedEvent && (
        <EventModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
      )}
    </div>
  );
};
