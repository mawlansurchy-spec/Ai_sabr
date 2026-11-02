import React from "react";
import { 
  Shield, 
  Sparkles, 
  TrendingUp, 
  Activity, 
  Zap, 
  Lock, 
  CheckCircle, 
  ArrowRight, 
  BarChart3, 
  Layers, 
  Eye, 
  Target,
  Send,
  Cpu
} from "lucide-react";

interface LandingPageProps {
  onOpenLogin: () => void;
  onOpenRegister: () => void;
  onOpenAdminModal: () => void;
}

export function LandingPage({
  onOpenLogin,
  onOpenRegister,
  onOpenAdminModal,
}: LandingPageProps) {
  const logoImg = "https://i.ibb.co/JRfHmTpT/file-00000000d7c481f49c480f9092004daf.png";

  return (
    <div className="min-h-screen bg-[#07090e] text-white flex flex-col selection:bg-[#d4af37]/30 selection:text-white font-sans antialiased overflow-x-hidden">
      {/* Background Decorative Gradients */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-gradient-to-b from-[#d4af37]/10 via-[#1a2333]/20 to-transparent blur-3xl opacity-70"></div>
        <div className="absolute top-1/3 -left-40 w-96 h-96 bg-blue-950/20 rounded-full blur-3xl"></div>
        <div className="absolute top-2/3 -right-40 w-96 h-96 bg-[#d4af37]/5 rounded-full blur-3xl"></div>
      </div>

      {/* Modern Header */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-[#07090e]/80 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="relative group cursor-pointer">
              <div className="w-11 h-11 rounded-2xl overflow-hidden border border-[#d4af37]/40 p-0.5 bg-gradient-to-br from-[#d4af37]/20 to-black shadow-[0_0_15px_rgba(212,175,55,0.2)]">
                <img
                  src={logoImg}
                  alt="DEVAN"
                  className="w-full h-full object-cover rounded-xl"
                />
              </div>
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-wider bg-gradient-to-r from-white via-zinc-200 to-[#d4af37] bg-clip-text text-transparent">
                DEVAN
              </span>
              <span className="block text-[10px] tracking-widest text-[#d4af37] uppercase font-mono font-medium">
                Institutional Intelligence
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm text-zinc-400">
            <a href="#features" className="hover:text-[#d4af37] transition-colors">
              Features
            </a>
            <a href="#smc" className="hover:text-[#d4af37] transition-colors">
              SMC & ICT Engine
            </a>
            <a href="#subscriptions" className="hover:text-[#d4af37] transition-colors">
              Subscriptions
            </a>
            <a
              href="https://t.me/qaesarr88"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#d4af37] transition-colors flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5 text-[#d4af37]" />
              <span>Contact Desk</span>
            </a>
          </nav>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenLogin}
              className="px-4 py-2 text-xs sm:text-sm font-medium text-zinc-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all"
            >
              Sign In
            </button>
            <button
              onClick={onOpenRegister}
              className="px-4 py-2 text-xs sm:text-sm font-semibold text-[#07090e] bg-gradient-to-r from-[#d4af37] via-[#e5c158] to-[#b38e22] hover:brightness-110 rounded-xl shadow-[0_0_20px_rgba(212,175,55,0.25)] transition-all flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Get Access</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 pt-16 pb-20 sm:pt-24 sm:pb-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        {/* Institutional Pill Tag */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#d4af37]/30 bg-[#d4af37]/10 text-[#d4af37] text-xs font-mono tracking-wide mb-6 backdrop-blur-md shadow-[0_0_20px_rgba(212,175,55,0.15)]">
          <Activity className="w-3.5 h-3.5 animate-pulse text-[#d4af37]" />
          <span>PRECISION ICT / SMC ALGORITHMIC TERMINAL</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight max-w-5xl mx-auto leading-[1.15]">
          Institutional Market Structure &{" "}
          <span className="bg-gradient-to-r from-[#d4af37] via-[#f3e5ab] to-[#aa8010] bg-clip-text text-transparent">
            Precision AI Signatures
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
          Engineered for serious operators. Identify institutional liquidity sweeps, order blocks, fair value gaps, and execute with calculated, disciplined stop-loss boundaries.
        </p>

        {/* CTAs */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={onOpenRegister}
            className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-[#d4af37] via-[#e5c158] to-[#b38e22] text-[#07090e] font-bold text-sm sm:text-base rounded-2xl shadow-[0_4px_30px_rgba(212,175,55,0.35)] hover:shadow-[0_4px_40px_rgba(212,175,55,0.5)] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Create DEVAN Account</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={onOpenLogin}
            className="w-full sm:w-auto px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold text-sm sm:text-base rounded-2xl transition-all flex items-center justify-center gap-2"
          >
            <Lock className="w-4 h-4 text-[#d4af37]" />
            <span>Member Login</span>
          </button>
        </div>

        {/* Trust Badges */}
        <div className="mt-14 pt-8 border-t border-white/5 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto text-left">
          <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
            <div className="text-xl font-bold text-white font-mono">0 ms</div>
            <div className="text-xs text-zinc-400 mt-1">Live TradingView Feed</div>
          </div>
          <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
            <div className="text-xl font-bold text-[#d4af37] font-mono">1:3.5+</div>
            <div className="text-xs text-zinc-400 mt-1">Optimal Risk-Reward Ratio</div>
          </div>
          <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
            <div className="text-xl font-bold text-white font-mono">Strict SL</div>
            <div className="text-xs text-zinc-400 mt-1">Institutional Invalidation</div>
          </div>
          <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
            <div className="text-xl font-bold text-[#d4af37] font-mono">100% Real</div>
            <div className="text-xs text-zinc-400 mt-1">Verified Market Data Only</div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 py-20 bg-black/40 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-mono uppercase tracking-widest text-[#d4af37] mb-3">
              Platform Architecture
            </h2>
            <h3 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Built for Technical Discretion & Algorithmic Rigor
            </h3>
            <p className="mt-3 text-sm text-zinc-400">
              Every signal generated is backed by structural liquidity validation and clear invalidation criteria.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="p-8 bg-[#0c0f17] border border-white/10 rounded-3xl hover:border-[#d4af37]/40 transition-all shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
              <div className="w-12 h-12 rounded-2xl bg-[#d4af37]/10 border border-[#d4af37]/30 flex items-center justify-center text-[#d4af37] mb-6">
                <Target className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-white mb-2">Calculated Tight Stop-Loss</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                No arbitrary or excessively distant stops. Every Stop Loss is anchored to true institutional structural levels (Liquidity Pools, Order Block high/low, or MSS swing points).
              </p>
            </div>

            {/* Card 2 */}
            <div className="p-8 bg-[#0c0f17] border border-white/10 rounded-3xl hover:border-[#d4af37]/40 transition-all shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
              <div className="w-12 h-12 rounded-2xl bg-[#d4af37]/10 border border-[#d4af37]/30 flex items-center justify-center text-[#d4af37] mb-6">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-white mb-2">Live Embedded TradingView</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Connect directly with real-time multi-asset market data across Forex, Crypto, and Indices with native TradingView charting controls and indicators.
              </p>
            </div>

            {/* Card 3 */}
            <div className="p-8 bg-[#0c0f17] border border-white/10 rounded-3xl hover:border-[#d4af37]/40 transition-all shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
              <div className="w-12 h-12 rounded-2xl bg-[#d4af37]/10 border border-[#d4af37]/30 flex items-center justify-center text-[#d4af37] mb-6">
                <Cpu className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-white mb-2">MT5 Visual Chart Analyzer</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Upload your MT4/MT5 charts or mobile screenshots. The multimodal neural vision detects FVG, BOS, and high-probability entry targets instantly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SMC & ICT Engine Showcase */}
      <section id="smc" className="relative z-10 py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#d4af37]/10 border border-[#d4af37]/20 text-[#d4af37] text-xs font-mono mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              <span>THE DARK SIDE OF ICT</span>
            </div>
            <h3 className="text-3xl sm:text-4xl font-bold leading-tight mb-4">
              Master Institutional Mechanics Before They Trigger
            </h3>
            <p className="text-sm text-zinc-400 leading-relaxed mb-6">
              DEVAN filters out retail noise. We identify where institutional orders reside, detect breaker blocks, and provide high-confluence confirmation triggers.
            </p>

            <div className="space-y-3">
              {[
                "Break of Structure (BOS) & Change of Character (CHoCH)",
                "Buy-Side & Sell-Side Liquidity (BSL / SSL) Sweeps",
                "Fair Value Gap (FVG) and Imbalance Rebalances",
                "Order Block (OB) mitigation & displacement verification",
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-sm text-zinc-300">
                  <CheckCircle className="w-4 h-4 text-[#d4af37] shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>

            <div className="mt-8">
              <button
                onClick={onOpenRegister}
                className="px-6 py-3 bg-[#d4af37] hover:bg-[#e5c158] text-[#07090e] font-bold text-sm rounded-xl transition-all flex items-center gap-2"
              >
                <span>Request Activation</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Visual Showcase Card */}
          <div className="p-6 bg-[#0c0f17] border border-[#d4af37]/30 rounded-3xl shadow-[0_0_50px_rgba(212,175,55,0.1)] relative">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                <span className="font-mono font-bold text-white">XAUUSD • 15M Institutional Setup</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-500/30 font-mono text-[10px]">
                HIGH PROBABILITY
              </span>
            </div>

            <div className="space-y-3 text-xs font-mono">
              <div className="flex justify-between p-3 bg-black/40 rounded-xl border border-white/5">
                <span className="text-zinc-400">Order Block Mitigation:</span>
                <span className="text-[#d4af37] font-bold">2,654.20 - 2,652.80</span>
              </div>
              <div className="flex justify-between p-3 bg-black/40 rounded-xl border border-white/5">
                <span className="text-zinc-400">Calculated Stop-Loss:</span>
                <span className="text-red-400 font-bold">2,651.10 (Strict Invalidation)</span>
              </div>
              <div className="flex justify-between p-3 bg-black/40 rounded-xl border border-white/5">
                <span className="text-zinc-400">Liquidity Target 1:</span>
                <span className="text-emerald-400 font-bold">2,664.00 (BSL Sweep)</span>
              </div>
              <div className="flex justify-between p-3 bg-black/40 rounded-xl border border-white/5">
                <span className="text-zinc-400">Risk : Reward Confluence:</span>
                <span className="text-white font-bold">1 : 3.82</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Subscriptions Section */}
      <section id="subscriptions" className="relative z-10 py-20 bg-black/50 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-mono uppercase tracking-widest text-[#d4af37] mb-3">
              Membership Tiers
            </h2>
            <h3 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Institutional Access Plans
            </h3>
            <p className="mt-3 text-sm text-zinc-400">
              Direct manual activation via Telegram (@qaesarr88). No bots, pure high-touch service.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Weekly */}
            <div className="p-8 bg-[#0c0f17] border border-white/10 rounded-3xl flex flex-col justify-between hover:border-[#d4af37]/30 transition-all">
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-zinc-400">Starter</span>
                <h4 className="text-2xl font-bold text-white mt-1">Weekly Access</h4>
                <div className="mt-4 mb-6">
                  <span className="text-4xl font-extrabold text-white">7 Days</span>
                  <span className="text-xs text-zinc-400 block mt-1">Full terminal access</span>
                </div>
                <ul className="space-y-3 text-xs text-zinc-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-[#d4af37]" />
                    <span>Live TradingView chart feed</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-[#d4af37]" />
                    <span>ICT/SMC algorithmic setups</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-[#d4af37]" />
                    <span>Precision SL/TP targets</span>
                  </li>
                </ul>
              </div>
              <button
                onClick={onOpenRegister}
                className="mt-8 w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold text-xs rounded-xl transition-all"
              >
                Choose 1 Week
              </button>
            </div>

            {/* Monthly (Recommended) */}
            <div className="p-8 bg-[#0e1320] border-2 border-[#d4af37] rounded-3xl flex flex-col justify-between shadow-[0_0_40px_rgba(212,175,55,0.2)] relative">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[#d4af37] text-[#07090e] text-[10px] font-bold uppercase tracking-widest shadow-md">
                Most Popular
              </div>
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-[#d4af37]">Recommended</span>
                <h4 className="text-2xl font-bold text-white mt-1">Monthly Pro</h4>
                <div className="mt-4 mb-6">
                  <span className="text-4xl font-extrabold text-white">30 Days</span>
                  <span className="text-xs text-zinc-400 block mt-1">Complete suite & MT5 scanner</span>
                </div>
                <ul className="space-y-3 text-xs text-zinc-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-[#d4af37]" />
                    <span>Everything in Weekly</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-[#d4af37]" />
                    <span>MT5 visual screenshot scanner</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-[#d4af37]" />
                    <span>Priority direct activation desk</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-[#d4af37]" />
                    <span>Multi-asset coverage (Gold, US30, EURUSD)</span>
                  </li>
                </ul>
              </div>
              <button
                onClick={onOpenRegister}
                className="mt-8 w-full py-3 bg-gradient-to-r from-[#d4af37] via-[#e5c158] to-[#b38e22] text-[#07090e] font-bold text-xs rounded-xl shadow-[0_4px_20px_rgba(212,175,55,0.3)] hover:brightness-110 transition-all"
              >
                Choose 1 Month
              </button>
            </div>

            {/* Yearly */}
            <div className="p-8 bg-[#0c0f17] border border-white/10 rounded-3xl flex flex-col justify-between hover:border-[#d4af37]/30 transition-all">
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-zinc-400">Elite</span>
                <h4 className="text-2xl font-bold text-white mt-1">Yearly VIP</h4>
                <div className="mt-4 mb-6">
                  <span className="text-4xl font-extrabold text-white">365 Days</span>
                  <span className="text-xs text-zinc-400 block mt-1">Unrestricted 1-year institutional tier</span>
                </div>
                <ul className="space-y-3 text-xs text-zinc-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-[#d4af37]" />
                    <span>Full 1-Year VIP Licensing</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-[#d4af37]" />
                    <span>Direct priority operator support</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-[#d4af37]" />
                    <span>All future model upgrades included</span>
                  </li>
                </ul>
              </div>
              <button
                onClick={onOpenRegister}
                className="mt-8 w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold text-xs rounded-xl transition-all"
              >
                Choose 1 Year VIP
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer with Discreet Hidden Admin Shield Icon */}
      <footer className="relative z-10 mt-auto bg-[#05070a] border-t border-white/5 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl overflow-hidden border border-[#d4af37]/30 p-0.5 bg-black">
                <img src={logoImg} alt="DEVAN" className="w-full h-full object-cover rounded-lg" />
              </div>
              <span className="text-lg font-bold text-white tracking-wider">DEVAN</span>
            </div>

            <div className="flex items-center gap-6 text-xs text-zinc-400">
              <a href="https://t.me/qaesarr88" target="_blank" rel="noopener noreferrer" className="hover:text-[#d4af37] transition-colors">
                Telegram: @qaesarr88
              </a>
              <button onClick={onOpenLogin} className="hover:text-white transition-colors">
                Member Portal
              </button>
              <button onClick={onOpenRegister} className="hover:text-white transition-colors">
                Register
              </button>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-zinc-400">
            <p>© {new Date().getFullYear()} DEVAN. All rights reserved. Precision Market Intelligence.</p>

            <div className="flex items-center gap-4">
              <span>Risk Warning: Forex and CFD trading involves significant risk of loss.</span>

              {/* HIDDEN ADMINISTRATOR ACCESS POINT */}
              {/* Positioned discreetly in the footer corner with minimal styling */}
              <button
                onClick={onOpenAdminModal}
                className="text-zinc-600 hover:text-[#d4af37] transition-colors p-1.5 rounded-lg hover:bg-white/5 cursor-pointer opacity-40 hover:opacity-100"
                title="System Verification"
                aria-label="Admin Verification"
              >
                <Shield className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
