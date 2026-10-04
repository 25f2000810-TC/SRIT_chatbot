import React from 'react';
import {
  GraduationCap,
  Sparkles,
  ShieldCheck,
  PlusCircle,
  LogOut,
  User as UserIcon,
  Compass,
  Wand2,
} from 'lucide-react';
import { User } from '../api.js';

interface HeaderProps {
  activeTab: 'chat' | 'explorer' | 'admin';
  setActiveTab: (tab: 'chat' | 'explorer' | 'admin') => void;
  currentUser: User | null;
  firebaseUser?: any | null;
  onLogout: () => void;
  onGoogleSignIn?: () => void;
  onGoogleSignOut?: () => void;
  onNewChat: () => void;
  onOpenStaffLogin: () => void;
  onOpenAITools?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  firebaseUser,
  onLogout,
  onGoogleSignIn,
  onGoogleSignOut,
  onNewChat,
  onOpenStaffLogin,
  onOpenAITools,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Logo & College Identity */}
        <div
          className="flex items-center gap-3 cursor-pointer select-none"
          onClick={() => setActiveTab('chat')}
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-md shadow-blue-500/20 shrink-0">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base sm:text-lg tracking-tight text-slate-900 dark:text-white">
                SRIT AI
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-semibold border border-blue-200 dark:border-blue-900/50">
                Assistant
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
              Shri Ram Institute of Technology • Smart Campus
            </p>
          </div>
        </div>

        {/* Center Navigation Tabs */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-100/90 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200/70 dark:border-slate-700/70 text-xs">
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                activeTab === 'chat'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Chat</span>
            </button>

            <button
              onClick={() => setActiveTab('explorer')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                activeTab === 'explorer'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Campus Life</span>
            </button>

            {currentUser && (
              <button
                onClick={() => setActiveTab('admin')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                  activeTab === 'admin'
                    ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Staff Portal</span>
              </button>
            )}
          </div>

          {/* Quick AI Tools Button */}
          {onOpenAITools && (
            <button
              onClick={onOpenAITools}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl transition-all shadow-sm shadow-blue-500/20 cursor-pointer"
            >
              <Wand2 className="w-3.5 h-3.5 animate-pulse" />
              <span>AI Academic Tools</span>
            </button>
          )}
        </div>

        {/* Action Controls & Top-Right Navigation */}
        <div className="flex items-center gap-2">
          {activeTab === 'chat' && (
            <button
              onClick={onNewChat}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl transition-all cursor-pointer"
              title="Start a new chat conversation"
            >
              <PlusCircle className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span className="hidden sm:inline">New Chat</span>
            </button>
          )}

          {/* Firebase Google Auth for Students */}
          {firebaseUser ? (
            <div className="flex items-center gap-2 px-2.5 py-1 bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 rounded-xl">
              {firebaseUser.photoURL ? (
                <img
                  src={firebaseUser.photoURL}
                  alt={firebaseUser.displayName || 'User'}
                  className="w-6 h-6 rounded-full border border-blue-400"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center">
                  {(firebaseUser.displayName || firebaseUser.email || 'S')[0].toUpperCase()}
                </div>
              )}
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 truncate max-w-[110px]">
                  {firebaseUser.displayName?.split(' ')[0] || 'Student'}
                </span>
                <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Cloud Synced
                </span>
              </div>
              {onGoogleSignOut && (
                <button
                  onClick={onGoogleSignOut}
                  className="p-1 text-slate-400 hover:text-rose-500 rounded-md transition-colors"
                  title="Sign out of student account"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ) : (
            onGoogleSignIn && (
              <button
                onClick={onGoogleSignIn}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 rounded-xl transition-all cursor-pointer shadow-2xs"
                title="Sign in with Google to sync notes, study plans, and history"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span className="hidden sm:inline">Student Sync</span>
              </button>
            )
          )}

          {/* Staff Login / Staff Profile */}
          {currentUser ? (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
              <div
                onClick={() => setActiveTab('admin')}
                className="hidden sm:flex flex-col text-right cursor-pointer"
              >
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate max-w-[140px]">
                  {currentUser.name}
                </span>
                <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold tracking-wide uppercase">
                  {currentUser.role}
                </span>
              </div>
              <button
                onClick={onLogout}
                className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                title="Log out of Staff Portal"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenStaffLogin}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 rounded-xl transition-all cursor-pointer shadow-xs"
            >
              <UserIcon className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span className="hidden sm:inline">STAFF PORTAL</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
