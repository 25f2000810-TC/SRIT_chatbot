/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header.js';
import { StudentChat } from './components/StudentChat.js';
import { CampusExplorer } from './components/CampusExplorer.js';
import { AdminPortal } from './components/AdminPortal.js';
import { AIToolsModal, AIToolType } from './components/AIToolsModal.js';
import { authStorage, api, User } from './api.js';
import {
  auth,
  onAuthStateChanged,
  signInWithGoogle,
  signOutFirebase,
  syncUserProfile,
  FirebaseUser,
} from './firebase.js';

export default function App() {
  const [activeTab, setActiveTab] = useState<'chat' | 'explorer' | 'admin'>('chat');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [activeConvId, setActiveConvId] = useState<string | undefined>(undefined);
  const [chatInitialPrompt, setChatInitialPrompt] = useState<string | undefined>(undefined);
  const [isAIToolsOpen, setIsAIToolsOpen] = useState(false);
  const [aiToolsDefaultTab, setAiToolsDefaultTab] = useState<AIToolType>('study-plan');

  useEffect(() => {
    // Listen to Firebase Auth state
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      if (user) {
        syncUserProfile(user).catch(console.error);
      }
    });

    // Check cached staff auth
    const cached = authStorage.getUser();
    if (cached) {
      setCurrentUser(cached);
      api
        .getMe()
        .then((res) => setCurrentUser(res.user))
        .catch(() => {
          authStorage.clearAuth();
          setCurrentUser(null);
        });
    }

    return () => unsubscribe();
  }, []);

  const handleLogout = () => {
    authStorage.clearAuth();
    setCurrentUser(null);
    setActiveTab('chat');
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Failed to sign in with Google:', error);
    }
  };

  const handleGoogleSignOut = async () => {
    try {
      await signOutFirebase();
    } catch (error) {
      console.error('Failed to sign out from Firebase:', error);
    }
  };

  const handleNewChat = () => {
    setActiveConvId(undefined);
    setChatInitialPrompt(undefined);
    setActiveTab('chat');
  };

  const handleSwitchToChatWithPrompt = (prompt: string) => {
    setChatInitialPrompt(prompt);
    setActiveTab('chat');
  };

  const handleOpenAITool = (tool: AIToolType = 'study-plan') => {
    setAiToolsDefaultTab(tool);
    setIsAIToolsOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors selection:bg-blue-500 selection:text-white">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        firebaseUser={firebaseUser}
        onLogout={handleLogout}
        onGoogleSignIn={handleGoogleSignIn}
        onGoogleSignOut={handleGoogleSignOut}
        onNewChat={handleNewChat}
        onOpenStaffLogin={() => setActiveTab('admin')}
        onOpenAITools={() => handleOpenAITool('study-plan')}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col">
        {activeTab === 'chat' && (
          <StudentChat
            conversationId={activeConvId}
            initialPrompt={chatInitialPrompt}
            onConversationCreated={(id) => setActiveConvId(id)}
            onOpenAITools={handleOpenAITool}
          />
        )}

        {activeTab === 'explorer' && (
          <CampusExplorer
            onAskAboutEvent={(name) => handleSwitchToChatWithPrompt(`Tell me details and registration information about the event "${name}" at SRIT`)}
            onAskAboutClub={(name) => handleSwitchToChatWithPrompt(`What are the activities, meetings, and eligibility to join the "${name}" club at SRIT?`)}
          />
        )}

        {activeTab === 'admin' && (
          <AdminPortal
            currentUser={currentUser}
            onLoginSuccess={(user) => setCurrentUser(user)}
            onLogout={handleLogout}
            onSwitchToChatWithPrompt={handleSwitchToChatWithPrompt}
          />
        )}
      </main>

      {/* AI Tools Suite Modal */}
      <AIToolsModal
        isOpen={isAIToolsOpen}
        onClose={() => setIsAIToolsOpen(false)}
        defaultTool={aiToolsDefaultTab}
        onSendToChat={handleSwitchToChatWithPrompt}
        firebaseUser={firebaseUser}
      />

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xs py-3 px-4 text-center text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>
            © {new Date().getFullYear()} Shri Ram Institute of Technology (SRIT), Jabalpur. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <a
              href="https://sritgroup.net/"
              target="_blank"
              rel="noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              Official Website: sritgroup.net
            </a>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span>Approved by AICTE, Affiliated with RGPV Bhopal & RDVV Jabalpur</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
