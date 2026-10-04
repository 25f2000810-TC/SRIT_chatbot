import React, { useState } from 'react';
import {
  X,
  LogOut,
  Sparkles,
  ShieldCheck,
  User,
  GraduationCap,
  Cloud,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import {
  auth,
  googleProvider,
  signInWithPopup,
  signOut,
  db,
  doc,
  setDoc,
  serverTimestamp,
  FirebaseUser,
} from '../firebase.js';

interface FirebaseAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: FirebaseUser | null;
  onUserChanged: (user: FirebaseUser | null) => void;
}

export const FirebaseAuthModal: React.FC<FirebaseAuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUserChanged,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [studentBranch, setStudentBranch] = useState('Computer Science & Engineering');
  const [studentSemester, setStudentSemester] = useState(3);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Save user profile to Firestore
      try {
        await setDoc(
          doc(db, 'users', user.uid),
          {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            role: 'student',
            branch: studentBranch,
            semester: studentSemester,
            lastLoginAt: serverTimestamp(),
          },
          { merge: true }
        );
      } catch (firestoreErr) {
        console.warn('Firestore profile sync notice:', firestoreErr);
      }

      onUserChanged(user);
      onClose();
    } catch (err: any) {
      console.error('Google Sign-In error:', err);
      setError(err?.message || 'Google Sign-In failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      onUserChanged(null);
      onClose();
    } catch (err: any) {
      console.error('Sign out error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col text-center">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {currentUser ? (
          /* Profile & Sign Out View */
          <div className="space-y-5 animate-in fade-in">
            <div className="flex flex-col items-center">
              {currentUser.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt={currentUser.displayName || 'User'}
                  className="w-16 h-16 rounded-full border-2 border-blue-500 shadow-md mb-3"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xl mb-3 shadow-md">
                  {currentUser.displayName?.[0] || 'U'}
                </div>
              )}
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                {currentUser.displayName || 'SRIT Student'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {currentUser.email}
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 text-left text-xs space-y-1.5">
              <div className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                <Cloud className="w-3.5 h-3.5 text-emerald-600" />
                Firebase Cloud Sync Active
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300">
                Your chat conversations, saved study plans, and attendance letters are automatically synced to your secure Cloud Firestore database.
              </p>
            </div>

            <button
              onClick={handleSignOut}
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl border border-rose-200 hover:bg-rose-50 text-rose-600 dark:border-rose-900/60 dark:hover:bg-rose-950/40 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        ) : (
          /* Sign In View */
          <div className="space-y-5 animate-in fade-in">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center mx-auto shadow-md shadow-blue-500/20">
              <GraduationCap className="w-6 h-6" />
            </div>

            <div>
              <h3 className="font-extrabold text-xl text-slate-900 dark:text-white">
                Student & Faculty Sign-In
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Sign in with your Google account to sync chat history and save academic revision plans.
              </p>
            </div>

            <div className="space-y-3 text-left text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Your Primary Branch
                </label>
                <select
                  value={studentBranch}
                  onChange={(e) => setStudentBranch(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-medium"
                >
                  <option value="Computer Science & Engineering">CSE</option>
                  <option value="Artificial Intelligence & Machine Learning">AI / ML</option>
                  <option value="Data Science">Data Science</option>
                  <option value="Electronics & Communication">ECE</option>
                  <option value="Mechanical Engineering">Mechanical</option>
                  <option value="Civil Engineering">Civil</option>
                  <option value="Commerce & Management">Commerce & Management</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Current Semester
                </label>
                <select
                  value={studentSemester}
                  onChange={(e) => setStudentSemester(Number(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-medium"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                    <option key={s} value={s}>Semester {s}</option>
                  ))}
                </select>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 text-left flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Google Sign In Button */}
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white border border-slate-300 dark:border-slate-700 text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
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
              <span>{loading ? 'Signing in with Google...' : 'Continue with Google'}</span>
            </button>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Secured by Firebase Authentication & Firestore</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
