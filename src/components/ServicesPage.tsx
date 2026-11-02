import React from "react";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import {
  Wand2,
  Image as ImageIcon,
  Crop,
  Layers,
  Palette,
  CheckCircle2,
  ArrowRight,
  Sparkles,
} from "lucide-react";

interface ServicesPageProps {
  onSelectService: (serviceKey: string) => void;
}

export const ServicesPage: React.FC<ServicesPageProps> = ({ onSelectService }) => {
  const { t, direction } = useLanguage();
  const { user } = useAuth();

  const services = [
    {
      id: "image_gen",
      icon: <Wand2 className="w-7 h-7 text-emerald-500" />,
      title: t("service_image_gen_name"),
      desc: t("service_image_gen_desc"),
      features: [
        "Text to high-resolution visual art",
        "Multiple aesthetic styles (Realistic, Anime, 3D, etc.)",
        "5 aspect ratios for social media, print & web",
        "Negative prompt support for strict filtering",
      ],
      tag: "Flagship",
    },
    {
      id: "photo_enhancement",
      icon: <ImageIcon className="w-7 h-7 text-cyan-500" />,
      title: t("service_enhancement_name"),
      desc: t("service_enhancement_desc"),
      features: [
        "Super-resolution up to 4K clarity",
        "Facial and landscape feature de-blurring",
        "Color temperature and exposure balancing",
        "Artifact noise reduction",
      ],
      tag: "HD Upscale",
    },
    {
      id: "bg_removal",
      icon: <Crop className="w-7 h-7 text-teal-500" />,
      title: t("service_bg_removal_name"),
      desc: t("service_bg_removal_desc"),
      features: [
        "Automatic edge hair & fur segmentation",
        "Transparent PNG export with alpha mask",
        "Studio backdrop replacement",
        "E-commerce product ready",
      ],
      tag: "AI Precision",
    },
    {
      id: "ai_design",
      icon: <Layers className="w-7 h-7 text-indigo-500" />,
      title: t("service_ai_design_name"),
      desc: t("service_ai_design_desc"),
      features: [
        "Social media banners & flyers",
        "Typographic layout balancing",
        "Brand visual continuity",
        "Commercial marketing assets",
      ],
      tag: "Creative",
    },
    {
      id: "logo_design",
      icon: <Palette className="w-7 h-7 text-purple-500" />,
      title: t("service_logo_design_name"),
      desc: t("service_logo_design_desc"),
      features: [
        "Minimalist & geometric vector concepts",
        "Monograms, crests & modern emblems",
        "High-contrast brand marks",
        "Custom palette iterations",
      ],
      tag: "Vector Grade",
    },
  ];

  return (
    <div className="flex flex-col gap-8 pb-16">
      {/* Header */}
      <div className="p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-500">
            {t("services")}
          </span>
          <h1 className="text-xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
            {t("available_services")}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
            {t("services_subtitle")}
          </p>
        </div>

        <div className="px-4 py-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          <span>All 5 Services Included with Subscription</span>
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((srv) => (
          <div
            key={srv.id}
            id={`card-srv-${srv.id}`}
            className="p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl shadow-lg hover:shadow-2xl hover:border-emerald-500/40 transition-all duration-300 flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800/80 flex items-center justify-center group-hover:scale-110 transition-transform">
                  {srv.icon}
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                    {t("active_status")}
                  </span>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {srv.tag}
                  </span>
                </div>
              </div>

              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white mb-2 group-hover:text-emerald-500 transition-colors">
                {srv.title}
              </h2>

              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
                {srv.desc}
              </p>

              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800/60 mb-6">
                {srv.features.map((feat, i) => (
                  <div key={i} className="flex items-center gap-2 text-[11px] text-slate-600 dark:text-slate-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">
                  {t("price_credit")}
                </span>
                <p className="text-xs font-black text-slate-900 dark:text-white">
                  {user?.active_subscription && user?.active_subscription.subscription_status === "ACTIVE"
                    ? "Included in Plan"
                    : "1 Credit per run"}
                </p>
              </div>

              <button
                id={`btn-use-service-${srv.id}`}
                onClick={() => onSelectService(srv.id)}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-extrabold shadow-md shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5"
              >
                <span>{t("use_service")}</span>
                <ArrowRight className={`w-3 h-3 ${direction === "rtl" ? "rotate-180" : ""}`} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
