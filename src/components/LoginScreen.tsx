import { motion } from 'motion/react';
import { LogIn } from 'lucide-react';
import { signInWithGoogle } from '../supabase/auth';
import { APP_DISPLAY_NAME } from '../lib/appMeta';

export function LoginScreen() {
  return (
    <div className="min-h-screen bg-paper flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white p-10 rounded-3xl shadow-2xl border border-stone-100 text-center space-y-8"
      >
        <div className="w-20 h-20 bg-brand rounded-full flex items-center justify-center text-white text-2xl font-serif mx-auto shadow-lg shadow-brand/20">
          {APP_DISPLAY_NAME.charAt(0)}
        </div>
        <div>
          <h1 className="text-3xl font-serif text-ink">{APP_DISPLAY_NAME}</h1>
          <p className="text-stone-500 mt-2">
            Sign in to manage your salon startup and sync your data to the cloud.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void signInWithGoogle()}
          className="w-full flex items-center justify-center gap-3 bg-brand text-white py-4 rounded-2xl font-medium hover:scale-[1.02] transition-all shadow-xl shadow-brand/20"
        >
          <LogIn className="w-5 h-5" />
          Sign in with Google
        </button>
        <p className="text-[10px] text-stone-400 uppercase tracking-widest">
          Secure Cloud Database Integration
        </p>
      </motion.div>
    </div>
  );
}
