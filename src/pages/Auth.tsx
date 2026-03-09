import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthContext } from '@/contexts/AuthContext';
import { Flame, Mail, Lock, User, Loader2, Swords, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

export default function Auth() {
  const { user, loading, signIn, signUp } = useAuthContext();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  if (user) return <Navigate to="/game" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    if (isLogin) {
      const { error } = await signIn(email, password);
      if (error) toast.error(error.message);
    } else {
      if (username.length < 3) {
        toast.error('Username must be at least 3 characters');
        setSubmitting(false);
        return;
      }
      const { error } = await signUp(email, password, username);
      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Account created! Check your email to confirm, or sign in directly.');
      }
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen grid-bg animate-bg-shift flex items-center justify-center px-4">
      {/* Floating particles */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 30 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-primary/20"
            style={{
              width: Math.random() * 3 + 1,
              height: Math.random() * 3 + 1,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${3 + Math.random() * 4}s ease-in-out ${Math.random() * 3}s infinite`,
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md"
      >
        <Link to="/landing" className="inline-flex items-center gap-2 text-sm font-body text-muted-foreground hover:text-primary transition-colors mb-6">
          <ArrowLeft size={16} />
          Back to Homepage
        </Link>
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-2">
            <Swords size={36} className="text-primary" />
            <h1
              className="font-display text-4xl font-bold text-foreground"
              style={{ textShadow: '0 0 30px rgba(234,179,8,0.3)' }}
            >
              HoloCards
            </h1>
          </div>
          <p className="text-muted-foreground font-body text-lg">
            {isLogin ? 'Welcome back, warrior' : 'Begin your journey'}
          </p>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl p-8 border border-border backdrop-blur-sm"
          style={{
            background: 'linear-gradient(180deg, hsl(var(--card)) 0%, hsl(222 47% 6%) 100%)',
            boxShadow: '0 0 40px rgba(234,179,8,0.1)',
          }}
        >
          {/* Tabs */}
          <div className="flex rounded-xl bg-secondary p-1 mb-6">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2.5 rounded-lg font-display text-sm font-bold transition-all ${
                isLogin ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2.5 rounded-lg font-display text-sm font-bold transition-all ${
                !isLogin ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div
                  key="username"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <label className="block text-sm font-body text-muted-foreground mb-1.5">Username</label>
                  <div className="relative">
                    <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      value={username}
                      onChange={e => setUsername(e.target.value)}
                      placeholder="Choose a username"
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-secondary border border-border text-foreground font-body placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                      required={!isLogin}
                      minLength={3}
                      maxLength={20}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label className="block text-sm font-body text-muted-foreground mb-1.5">Email</label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-secondary border border-border text-foreground font-body placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-body text-muted-foreground mb-1.5">Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-secondary border border-border text-foreground font-body placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  required
                  minLength={6}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-xl font-display font-bold text-primary-foreground relative overflow-hidden shine-sweep disabled:opacity-50 transition-all"
              style={{ background: 'linear-gradient(135deg, #EAB308, #F97316)' }}
            >
              {submitting ? (
                <Loader2 className="animate-spin mx-auto" size={20} />
              ) : isLogin ? (
                'Enter the Arena'
              ) : (
                'Create Account'
              )}
            </button>
          </form>
        </div>

        {/* Starter cards info */}
        {!isLogin && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
              <Flame size={14} className="text-primary" />
              <span className="text-xs font-body text-primary">New players get 5 starter cards + 500 gold!</span>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
