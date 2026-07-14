import React, { useState, useEffect } from 'react';
import { translations } from './translations.ts';
import { User, UserRole } from './types.ts';
import PublicPages from './components/PublicPages.tsx';
import AdminPortal from './components/AdminPortal.tsx';
import { 
  Wrench, Phone, LogIn, ChevronRight, CheckCircle2, 
  MapPin, Clock, ShieldCheck, Languages, Lock, X
} from 'lucide-react';

export default function App() {
  const [lang, setLang] = useState<'en' | 'te'>('en');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  // Login form status
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginRole, setLoginRole] = useState<UserRole>(UserRole.ADMIN);
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Global banner notification status
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState('');

  // Selected translation set
  const t = translations[lang];

  useEffect(() => {
    // Check if there was an active login session in sessionStorage
    const savedUser = sessionStorage.getItem('sr_workshop_user2026');
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (err) {
        console.error(err);
      }
    }
  }, []);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginUsername || !loginPassword) return;
    setLoginLoading(true);
    setLoginError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: loginUsername,
          password: loginPassword,
          role: loginRole
        })
      });

      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user);
        sessionStorage.setItem('sr_workshop_user2026', JSON.stringify(data.user));
        setLoginModalOpen(false);
        setLoginUsername('');
        setLoginPassword('');
        triggerNotification(`Welcome back, ${data.user.name}!`);
      } else {
        setLoginError(t.wrongCredentials);
      }
    } catch (err) {
      console.error(err);
      setLoginError('Server lookup failed. Check if server booted correctly.');
    }
    setLoginLoading(false);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    sessionStorage.removeItem('sr_workshop_user2026');
    triggerNotification('Logged out successfully.');
  };

  const triggerNotification = (msg: string) => {
    setNotificationMsg(msg);
    setShowNotification(true);
    setTimeout(() => {
      setShowNotification(false);
    }, 4000);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col justify-between selection:bg-brand-green-100 selection:text-brand-green-800">
      
      {/* GLOBAL HUD TOAST NOTIFICATION */}
      {showNotification && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-slate-700 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-amber-400" />
          <span className="text-xs font-bold font-display">{notificationMsg}</span>
        </div>
      )}

      {/* TOP COMPACT BRAND HEADER HEADER */}
      <header className="bg-brand-green-950 text-white shadow relative">
        <div className="absolute inset-x-0 bottom-0 h-1 caution-stripes no-print"></div>
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col sm:flex-row gap-3 justify-between items-center relative z-20">
          
          <div className="flex items-center gap-3">
            <span className="text-3xl">🚜</span>
            <div>
              <h1 className="font-extrabold text-white tracking-tight font-display text-sm sm:text-base leading-5 uppercase">
                {t.headerTitle}
              </h1>
              <p className="text-[10px] text-amber-400 font-mono tracking-wider">
                Kuncharapu Nagi Reddy Workshop | Khammam Cross Roads, Suryapet
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 no-print">
            {/* Call Now Shortcut */}
            <a 
              href="tel:+919866409550" 
              className="bg-amber-500 hover:bg-amber-600 font-bold text-[10.5px] text-charcoal-950 px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all"
            >
              <Phone className="w-3.5 h-3.5" /> Call: +91 9866409550
            </a>

            {/* Language Switcher Toggle */}
            <button 
              id="header-btn-lang-toggle"
              onClick={() => setLang(lang === 'en' ? 'te' : 'en')}
              className="bg-brand-green-800/80 border border-brand-green-500/30 hover:bg-brand-green-800 px-3 py-1.5 rounded-lg text-slate-100 font-bold text-[10.5px] flex items-center gap-1.5 transition-all"
            >
              <Languages className="w-3.5 h-3.5 text-amber-400" />
              {lang === 'en' ? 'తెలుగు' : 'English'}
            </button>

            {/* Portal Login Button / Logout controls */}
            {currentUser ? (
              <div className="flex items-center gap-2">
                <span className="text-[10px] bg-brand-green-800 border-brand-green-500 border px-2 py-1 rounded font-semibold text-brand-green-100 uppercase font-mono">
                  {currentUser.role}: {currentUser.name.split(' ')[0]}
                </span>
                <button 
                  id="header-btn-logout"
                  onClick={handleLogout}
                  className="bg-rose-955 border border-rose-900/40 hover:bg-rose-900 text-white font-bold text-[10.5px] px-2.5 py-1.5 rounded-lg transition-all"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button 
                id="header-btn-login-open"
                onClick={() => { setLoginError(''); setLoginModalOpen(true) }}
                className="bg-slate-100 hover:bg-white text-slate-900 font-black text-[10.5px] px-3.5 py-1.5 rounded-lg flex items-center gap-1 transition-all"
              >
                <LogIn className="w-3.5 h-3.5 text-brand-green-800" />
                {t.loginTab}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* CORE WORKSPACE PORTAL SECTIONS */}
      <main className="flex-1 flex flex-col">
        {currentUser ? (
          <AdminPortal user={currentUser} onLogout={handleLogout} lang={lang} />
        ) : (
          <PublicPages 
            lang={lang} 
            t={t} 
            onBookSuccess={() => triggerNotification('Service Request Booked Successfully!')}
            onSelectService={(n) => triggerNotification(`Intake pre-filled for: ${n}`)}
          />
        )}
      </main>

      {/* FOOTER SECTION */}
      <footer className="bg-charcoal-950 text-slate-400 border-t border-charcoal-900 py-10 text-xs no-print">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
          
          <div className="space-y-3">
            <h4 className="font-extrabold text-white font-display text-sm tracking-tight">{t.headerTitle}</h4>
            <p className="text-slate-400 text-xs leading-relaxed">
              Serving our local farm operators, tractors, and agricultural mechanics since 2012 over elite repairs, genuine lubricants and replacement gears.
            </p>
            <div className="flex items-center gap-1.5 text-[10.5px] text-amber-500 font-mono">
              <ShieldCheck className="w-4 h-4" /> Kuncharapu Nagi Reddy Enterprise
            </div>
          </div>

          <div className="space-y-2">
            <h5 className="font-bold text-white text-xs uppercase tracking-wider">Quick Action Hotline</h5>
            <p className="text-slate-450 leading-relaxed text-[11px]">Contact owner and specialists directly for on-field diagnostic breakdowns.</p>
            <div className="space-y-1.5 pt-1.5">
              <a href="tel:+919866409550" className="block text-slate-300 font-bold hover:underline">📞 +91 98664 09550</a>
              <a href="https://wa.me/919866409550" target="_blank" rel="noreferrer" className="block text-slate-300 font-bold hover:underline">💬 Chat over WhatsApp</a>
            </div>
          </div>

          <div className="space-y-2">
            <h5 className="font-bold text-white text-xs uppercase tracking-wider">{t.workingHoursLabel}</h5>
            <div className="space-y-1 leading-relaxed text-slate-405 text-[11px]">
              <p>Monday - Saturday: 08:00 AM - 08:30 PM (Continuous diagnostics)</p>
              <p className="text-amber-500 font-semibold">Sunday: Closed for mechanical rest</p>
              <p className="text-slate-500 italic mt-1">Khammam Cross Roads, Suryapet</p>
            </div>
          </div>

          <div className="space-y-3">
            <h5 className="font-bold text-white text-xs uppercase tracking-wider">Digital Workshop Suite</h5>
            <p className="text-slate-450 text-[11px] leading-relaxed">
              We resolve manual accounting issues and delayed updates using persistent cloud-linked workflow boards.
            </p>
            <span className="inline-block text-[9px] bg-slate-800 text-amber-400 px-2 py-1 rounded font-mono uppercase font-bold border border-slate-700">
              VERIFIABLE SYSTEM v2.1
            </span>
          </div>

        </div>

        <div className="max-w-7xl mx-auto px-4 mt-8 pt-6 border-t border-charcoal-900 text-center text-[11px] text-slate-500">
          <p>© {new Date().getFullYear()} Sri Reddy Tractor Mechanic Works & Automobile Shop. All Rights Reserved.</p>
          <p className="mt-1 font-mono text-[9px]">Designed with pride and precision for Andhra Pradesh Agricultural Communities.</p>
        </div>
      </footer>

      {/* SECURE BI BILINGUAL AUTHENTICATION DIALOG MODAL */}
      {loginModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-charcoal-950/65 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border rounded-3xl p-6 w-full max-w-md shadow-2xl relative">
            <div className="absolute top-0 inset-x-0 h-1.5 bg-brand-green-700/80 rounded-t-3xl"></div>
            
            <div className="flex justify-between items-center pb-3 border-b mb-4">
              <div className="flex items-center gap-2 text-slate-800">
                <Lock className="w-4.5 h-4.5 text-brand-green-700" />
                <h3 className="font-extrabold font-display text-sm text-slate-800">Sri Reddy Workspace Portal Login</h3>
              </div>
              <button 
                onClick={() => setLoginModalOpen(false)}
                className="text-slate-400 hover:text-slate-650 font-black text-xs"
              >
                ✖
              </button>
            </div>

            {loginError && (
              <div className="bg-rose-50 border border-rose-350 p-3 rounded-lg text-rose-700 text-xs font-semibold mb-4 text-center">
                ⚠ {loginError}
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs font-semibold text-slate-700">
              <div>
                <label className="block text-slate-600 mb-1">{t.roleSelect}</label>
                <select 
                  value={loginRole}
                  onChange={(e) => setLoginRole(e.target.value as UserRole)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 font-bold text-slate-805"
                >
                  <option value={UserRole.ADMIN}>Workshop Shop Owner (K. Nagi Reddy)</option>
                  <option value={UserRole.STAFF}>Workshop Staff Co-ordinator</option>
                  <option value={UserRole.MECHANIC}>Specialist Garage Mechanic</option>
                  <option value={UserRole.CUSTOMER}>Registered Farmer Customer</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 mb-1">Portal Username <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  required
                  placeholder="Enter login username" 
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-850"
                />
              </div>

              <div>
                <label className="block text-slate-600 mb-1">Access Password Code <span className="text-red-500">*</span></label>
                <input 
                  type="password" 
                  required
                  placeholder="••••" 
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-850 font-mono"
                />
              </div>

              {/* DEMO ACCOUNTS HELPER BOX (Saves user from searching or asking how to log in) */}
              <div className="bg-slate-50 p-3 rounded-lg border text-[10.5px] text-slate-500">
                <p className="font-bold text-slate-705 mb-1 bg-amber-500/10 px-1.5 py-0.5 rounded inline-block text-[9.5px]">💡 MOCK PORTAL PASSWORDS</p>
                <ul className="space-y-1 font-mono">
                  <li>• Owners (Admin): <strong className="text-slate-800">admin</strong> / password: <strong className="text-slate-850">111</strong></li>
                  <li>• Office Staff: <strong className="text-slate-800">staff</strong> / password: <strong className="text-slate-850">222</strong></li>
                  <li>• Sunil (Mechanic): <strong className="text-slate-800">mechanic</strong> / password: <strong className="text-slate-850">333</strong></li>
                  <li>• Farmer Customer: <strong className="text-slate-800">prasad</strong> / password: <strong className="text-slate-850">444</strong></li>
                </ul>
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button 
                  type="button" 
                  onClick={() => setLoginModalOpen(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-650 rounded-lg px-4 py-2"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="bg-brand-green-700 hover:bg-brand-green-800 text-white rounded-lg px-5 py-2 font-bold shadow flex items-center justify-center"
                >
                  {loginLoading ? 'Hashing...' : 'Confirm Login Key'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
