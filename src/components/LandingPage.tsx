import React from "react";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Wand2,
  Image as ImageIcon,
  Crop,
  Layers,
  Palette,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";

interface LandingPageProps {
  onStartFree: () => void;
  onLogin: () => void;
  onSignUp: () => void;
  onExploreServices: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartFree,
  onLogin,
  onSignUp,
  onExploreServices,
}) => {
  const { t, direction } = useLanguage();
  const { user } = useAuth();

  const services = [
    {
      icon: <Wand2 className="w-6 h-6 text-emerald-500" />,
      title: t("service_image_gen_name"),
      desc: t("service_image_gen_desc"),
      tag: "Popular",
    },
    {
      icon: <ImageIcon className="w-6 h-6 text-cyan-500" />,
      title: t("service_enhancement_name"),
      desc: t("service_enhancement_desc"),
      tag: "HD Upscale",
    },
    {
      icon: <Crop className="w-6 h-6 text-teal-500" />,
      title: t("service_bg_removal_name"),
      desc: t("service_bg_removal_desc"),
      tag: "AI Precision",
    },
    {
      icon: <Layers className="w-6 h-6 text-indigo-500" />,
      title: t("service_ai_design_name"),
      desc: t("service_ai_design_desc"),
      tag: "Creative",
    },
    {
      icon: <Palette className="w-6 h-6 text-purple-500" />,
      title: t("service_logo_design_name"),
      desc: t("service_logo_design_desc"),
      tag: "Vector Grade",
    },
  ];

  const steps = [
    {
      num: "01",
      title: t("step_1_title"),
      desc: t("step_1_desc"),
      icon: <ShieldCheck className="w-5 h-5 text-emerald-400" />,
    },
    {
      num: "02",
      title: t("step_2_title"),
      desc: t("step_2_desc"),
      icon: <Sparkles className="w-5 h-5 text-amber-400" />,
    },
    {
      num: "03",
      title: t("step_3_title"),
      desc: t("step_3_desc"),
      icon: <Wand2 className="w-5 h-5 text-teal-400" />,
    },
    {
      num: "04",
      title: t("step_4_title"),
      desc: t("step_4_desc"),
      icon: <Zap className="w-5 h-5 text-indigo-400" />,
    },
  ];

  return (
    <div className="flex flex-col gap-16 sm:gap-24 py-8 sm:py-16">
      {/* Hero Section */}
      <section className="relative px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full text-center">
        {/* Ambient background glows */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] sm:w-[600px] h-[350px] sm:h-[600px] bg-gradient-to-tr from-emerald-500/15 via-teal-500/10 to-indigo-500/15 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold mb-6 backdrop-blur-md shadow-sm">
          <Sparkles className="w-4 h-4 animate-pulse" />
          <span>4 Free AI Generations Included</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white max-w-4xl mx-auto leading-[1.15]">
          {t("hero_title")}
        </h1>

        <p className="mt-6 text-base sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
          {t("hero_subtitle")}
        </p>

        {/* Hero CTAs */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <button
            id="btn-hero-start-free"
            onClick={onStartFree}
            className="px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-white font-extrabold text-sm sm:text-base shadow-xl shadow-emerald-500/25 transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-2.5"
          >
            <span>{t("start_free")}</span>
            <ArrowRight className={`w-4 h-4 ${direction === "rtl" ? "rotate-180" : ""}`} />
          </button>

          {!user && (
            <>
              <button
                id="btn-hero-login"
                onClick={onLogin}
                className="px-7 py-4 rounded-2xl border border-slate-300 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 font-bold text-sm sm:text-base backdrop-blur-md transition-all shadow-sm"
              >
                {t("login")}
              </button>
              <button
                id="btn-hero-signup"
                onClick={onSignUp}
                className="px-7 py-4 rounded-2xl border border-slate-300 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 font-bold text-sm sm:text-base backdrop-blur-md transition-all shadow-sm"
              >
                {t("sign_up")}
              </button>
            </>
          )}
        </div>

        {/* Feature Highlights Pills */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" /> No credit card required
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Instant 4 Free Credits
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Ultra HD & Multi-Ratio
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" /> 4-Language Interface
          </span>
        </div>
      </section>

      {/* Available AI Services Showcase */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-500">
              {t("services")}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
              {t("available_services")}
            </h2>
          </div>
          <button
            id="btn-view-all-services"
            onClick={onExploreServices}
            className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 self-start sm:self-auto"
          >
            <span>{t("services_title")}</span>
            <ChevronRight className={`w-3.5 h-3.5 ${direction === "rtl" ? "rotate-180" : ""}`} />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((srv, idx) => (
            <div
              key={idx}
              id={`service-card-${idx}`}
              onClick={onStartFree}
              className="p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl shadow-lg hover:shadow-2xl hover:border-emerald-500/40 transition-all duration-300 group cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800/80 flex items-center justify-center group-hover:scale-110 transition-transform">
                    {srv.icon}
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {srv.tag}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2 group-hover:text-emerald-500 transition-colors">
                  {srv.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {srv.desc}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-xs font-bold text-emerald-600 dark:text-emerald-400">
                <span>{t("use_service")}</span>
                <ArrowRight className={`w-3.5 h-3.5 ${direction === "rtl" ? "rotate-180" : ""}`} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works (1 -> 2 -> 3 -> 4) */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="p-8 sm:p-12 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-gradient-to-b from-white via-slate-50 to-slate-100 dark:from-slate-900/90 dark:via-slate-900/50 dark:to-slate-950/90 backdrop-blur-2xl shadow-xl">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-500">
              Workflow
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mt-1">
              {t("how_it_works_title")}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            {steps.map((step, idx) => (
              <div
                key={idx}
                id={`step-card-${idx}`}
                className="relative p-6 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 bg-white/60 dark:bg-slate-950/60 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-black text-slate-300 dark:text-slate-700">
                      {step.num}
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800/70 flex items-center justify-center">
                      {step.icon}
                    </div>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">
                    {step.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ready to Create CTA */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full text-center">
        <div className="p-8 sm:p-14 rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white shadow-2xl relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              {t("ready_to_create")}
            </h2>
            <p className="mt-3 text-sm sm:text-base text-emerald-50 max-w-xl mx-auto opacity-95">
              {t("ready_desc")}
            </p>
            <button
              id="btn-cta-bottom"
              onClick={onStartFree}
              className="mt-8 px-8 py-4 rounded-2xl bg-white text-emerald-700 hover:bg-slate-50 font-extrabold text-sm sm:text-base shadow-xl transition-all duration-300 hover:scale-105 active:scale-95"
            >
              {t("start_free")}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
