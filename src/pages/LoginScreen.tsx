import { Mail, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';

interface LoginScreenProps {
  onLogin: () => void;
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center p-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md w-full text-center space-y-8">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-orange-500/10 rounded-2xl flex items-center justify-center border border-orange-500/20">
            <Mail className="w-8 h-8 text-orange-500" />
          </div>
        </div>
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">DevMail Hub</h1>
          <p className="text-zinc-400">Gérez vos adresses mail de test en un seul endroit. Simplifiez vos workflows QA et Dev.</p>
        </div>
        <button
          onClick={onLogin}
          className="w-full py-3 px-4 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 group"
        >
          <ShieldCheck className="w-5 h-5" />
          Se connecter avec Google
        </button>
        <div className="grid grid-cols-3 gap-4 pt-8 border-t border-zinc-800/50">
          <div className="space-y-1">
            <div className="text-orange-500 font-bold">∞</div>
            <div className="text-xs text-zinc-500 uppercase tracking-wider">Adresses</div>
          </div>
          <div className="space-y-1">
            <div className="text-orange-500 font-bold">100%</div>
            <div className="text-xs text-zinc-500 uppercase tracking-wider">Gratuit</div>
          </div>
          <div className="space-y-1">
            <div className="text-orange-500 font-bold">API</div>
            <div className="text-xs text-zinc-500 uppercase tracking-wider">Ready</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
