import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { useToast } from "../context/ToastContext";
import { Generation } from "../types";
import {
  Wand2,
  Sparkles,
  Download,
  Copy,
  RefreshCw,
  AlertTriangle,
  CreditCard,
  MessageSquare,
  Check,
  Maximize2,
  Image as ImageIcon,
  Sliders,
  ChevronDown,
  Layers,
  Flame,
} from "lucide-react";

interface AiImageGeneratorProps {
  onNavigate: (tab: string) => void;
}

export const AiImageGenerator: React.FC<AiImageGeneratorProps> = ({ onNavigate }) => {
  const { user, deductCreditClient, refreshUser } = useAuth();
  const { t } = useLanguage();
  const { showToast } = useToast();

  const [prompt, setPrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("Realistic");
  const [aspectRatio, setAspectRatio] = useState("1:1");
  const [isGenerating, setIsGenerating] = useState(false);
  const [latestGeneration, setLatestGeneration] = useState<Generation | null>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [previewZoom, setPreviewZoom] = useState(false);

  const hasActiveSub = !!(user?.active_subscription && user?.active_subscription.subscription_status === "ACTIVE");
  const freeCredits = user?.free_ai_credits ?? 0;
  const canGenerate = hasActiveSub || freeCredits > 0;

  const styles = [
    { name: "Realistic", icon: "📸", label: t("style_realistic") },
    { name: "Cinematic", icon: "🎬", label: t("style_cinematic") },
    { name: "Anime", icon: "🌸", label: t("style_anime") },
    { name: "3D Render", icon: "🧊", label: t("style_3d_render") },
    { name: "Cyberpunk", icon: "⚡", label: t("style_cyberpunk") },
    { name: "Fantasy", icon: "🐉", label: t("style_fantasy") },
    { name: "Digital Art", icon: "🎨", label: t("style_digital_art") },
    { name: "Watercolor", icon: "🖌️", label: t("style_watercolor") },
  ];

  const aspectRatios = [
    { ratio: "1:1", label: t("ratio_1_1"), desc: "Square (1024x1024)" },
    { ratio: "16:9", label: t("ratio_16_9"), desc: "Landscape (1280x720)" },
    { ratio: "9:16", label: t("ratio_9_16"), desc: "Story/Reel (720x1280)" },
    { ratio: "4:3", label: t("ratio_4_3"), desc: "Classic (1024x768)" },
    { ratio: "3:4", label: t("ratio_3_4"), desc: "Standard (768x1024)" },
  ];

  const promptSuggestions = [
    "A neon cyberpunk city floating above the clouds at sunset with flying vehicles",
    "Majestic mystical lion made of crystal and glowing emerald light in an enchanted forest",
    "Futuristic sleek luxury sports car cruising along a rain-slicked neon street, cinematic lighting",
    "Detailed portrait of a robotic geisha with gold filigree and delicate cherry blossom petals",
    "Hyper-realistic architectural villa surrounded by calm turquoise water and lush tropical flora",
  ];

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      showToast(t("error"), "Please enter a prompt describing your image.", "warning");
      return;
    }

    if (!canGenerate) {
      showToast(t("free_credits_finished"), t("free_credits_used_desc"), "error");
      return;
    }

    setIsGenerating(true);
    setGenerationError(null);

    try {
      const response = await fetch("/api/user/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: prompt.trim(),
          negative_prompt: negativePrompt.trim(),
          style: selectedStyle,
          aspect_ratio: aspectRatio,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to generate image.");
      }

      setLatestGeneration(data.generation);
      deductCreditClient();
      refreshUser();

      showToast(
        t("generation_success"),
        hasActiveSub ? "Generated on active subscription!" : `Remaining free generations: ${data.remaining_free_credits} / 4`,
        "success"
      );
    } catch (err: any) {
      console.error("Generation failed:", err);
      setGenerationError(err.message || "Failed to generate image. Please try again.");
      showToast(t("generation_failed"), err.message || "No credit was deducted.", "error");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyPrompt = () => {
    if (latestGeneration?.prompt) {
      navigator.clipboard.writeText(latestGeneration.prompt);
      setCopiedPrompt(true);
      setTimeout(() => setCopiedPrompt(false), 2000);
      showToast("Copied!", "Prompt copied to clipboard", "info");
    }
  };

  return (
    <div className="flex flex-col gap-8 pb-16">
      {/* Title & Credits Bar */}
      <div className="p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-md shadow-emerald-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Wand2 className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                {t("ai_generator_title")}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t("ai_generator_subtitle")}
              </p>
            </div>
          </div>
        </div>

        {/* Credits Pill */}
        <div
          id="generator-credits-indicator"
          className="flex items-center gap-3 px-4 py-2.5 rounded-2xl border bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/60 shadow-sm"
        >
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
            <Sparkles className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-500">
              {t("free_ai_generations")}
            </span>
            <div className="text-sm font-black text-slate-900 dark:text-white">
              {hasActiveSub ? (
                <span className="text-emerald-500">Active Plan (Unlimited)</span>
              ) : (
                <span className={freeCredits > 0 ? "text-emerald-500" : "text-rose-500"}>
                  {freeCredits} / 4 Remaining
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Credits Depleted Banner */}
      {!canGenerate && (
        <div
          id="generator-credits-depleted-banner"
          className="p-6 rounded-3xl border border-rose-500/50 bg-rose-500/10 dark:bg-rose-950/40 backdrop-blur-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in slide-in-from-top-2"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/20 flex items-center justify-center text-rose-500 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-rose-700 dark:text-rose-300">
                {t("free_credits_finished")}
              </h3>
              <p className="text-xs text-rose-600 dark:text-rose-400 mt-0.5">
                {t("free_credits_used_desc")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              id="btn-generator-choose-sub"
              onClick={() => onNavigate("subscriptions")}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-extrabold shadow-md shadow-emerald-500/20 hover:scale-105 transition-all flex items-center justify-center gap-1.5"
            >
              <CreditCard className="w-4 h-4" />
              <span>{t("choose_subscription")}</span>
            </button>
            <button
              id="btn-generator-contact-admin"
              onClick={() => onNavigate("contact")}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-2xl border border-rose-500/40 text-rose-600 dark:text-rose-300 text-xs font-bold hover:bg-rose-500/10 transition-all flex items-center justify-center gap-1.5"
            >
              <MessageSquare className="w-4 h-4" />
              <span>{t("contact_admin")}</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Generator Workspace: 2-Column (Controls / Preview) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Generator Controls (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Prompt Input Card */}
          <div className="p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl shadow-xl">
            <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
              {t("prompt_label")} *
            </label>
            <textarea
              id="input-prompt"
              rows={4}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={t("prompt_placeholder")}
              disabled={isGenerating}
              className="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white text-xs sm:text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none transition-all leading-relaxed"
            />

            {/* Prompt Suggestions */}
            <div className="mt-3">
              <div className="flex items-center gap-1 text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-2">
                <Flame className="w-3.5 h-3.5 text-amber-500" />
                <span>Try inspiration:</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {promptSuggestions.map((sug, i) => (
                  <button
                    key={i}
                    onClick={() => setPrompt(sug)}
                    className="text-[11px] px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-emerald-500/15 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors text-start"
                  >
                    "{sug.slice(0, 32)}..."
                  </button>
                ))}
              </div>
            </div>

            {/* Negative Prompt (Collapsible / Optional) */}
            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                {t("negative_prompt_label")} <span className="text-[10px] font-normal text-slate-400">({t("optional")})</span>
              </label>
              <input
                id="input-negative-prompt"
                type="text"
                value={negativePrompt}
                onChange={(e) => setNegativePrompt(e.target.value)}
                placeholder={t("negative_prompt_placeholder")}
                disabled={isGenerating}
                className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>
          </div>

          {/* Style Selector */}
          <div className="p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl shadow-xl">
            <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-3">
              {t("style_label")}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {styles.map((style) => (
                <button
                  key={style.name}
                  id={`style-btn-${style.name.toLowerCase().replace(/\s/g, "-")}`}
                  type="button"
                  onClick={() => setSelectedStyle(style.name)}
                  className={`p-3 rounded-2xl border text-xs font-bold transition-all flex flex-col items-center gap-1.5 text-center ${
                    selectedStyle === style.name
                      ? "border-emerald-500 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 shadow-sm ring-1 ring-emerald-500/30"
                      : "border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700"
                  }`}
                >
                  <span className="text-xl">{style.icon}</span>
                  <span>{style.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Aspect Ratio Selector */}
          <div className="p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl shadow-xl">
            <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-3">
              {t("aspect_ratio_label")}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              {aspectRatios.map((ar) => (
                <button
                  key={ar.ratio}
                  id={`ratio-btn-${ar.ratio.replace(":", "-")}`}
                  type="button"
                  onClick={() => setAspectRatio(ar.ratio)}
                  className={`p-3 rounded-2xl border text-xs font-bold transition-all flex flex-col items-center gap-1 text-center ${
                    aspectRatio === ar.ratio
                      ? "border-emerald-500 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 shadow-sm ring-1 ring-emerald-500/30"
                      : "border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700"
                  }`}
                >
                  <span className="font-extrabold">{ar.ratio}</span>
                  <span className="text-[10px] opacity-75 font-normal">{ar.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Error Message Feedback */}
          {generationError && (
            <div
              id="gen-error-message"
              className="p-4 rounded-2xl border border-rose-500/40 bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-medium flex items-center justify-between gap-3 animate-in shake"
            >
              <span>{generationError}</span>
              <button
                onClick={handleGenerate}
                className="px-3 py-1.5 rounded-xl bg-rose-500 text-white font-bold text-xs shrink-0 hover:bg-rose-600 transition-colors"
              >
                {t("retry")}
              </button>
            </div>
          )}

          {/* Generate Button */}
          <button
            id="btn-generate-image"
            onClick={handleGenerate}
            disabled={isGenerating || !canGenerate}
            className={`w-full py-4 rounded-2xl font-extrabold text-sm shadow-xl transition-all flex items-center justify-center gap-2.5 ${
              canGenerate
                ? "bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-white shadow-emerald-500/25 hover:scale-[1.01] active:scale-[0.99]"
                : "bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed shadow-none"
            }`}
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>{t("generating")}</span>
              </>
            ) : (
              <>
                <Wand2 className="w-5 h-5" />
                <span>
                  {canGenerate ? t("generate_now") : t("free_credits_finished")}
                </span>
              </>
            )}
          </button>
        </div>

        {/* Right Column: Output Showcase & Preview (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl shadow-xl flex flex-col h-full justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  {t("output_artwork")}
                </span>
                {latestGeneration && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/15 text-emerald-500">
                    {latestGeneration.status}
                  </span>
                )}
              </div>

              {/* Artwork Display Box */}
              <div
                id="generation-preview-canvas"
                className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950 flex items-center justify-center min-h-[340px] sm:min-h-[420px]"
              >
                {isGenerating ? (
                  <div className="flex flex-col items-center gap-4 text-center p-6">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 animate-spin" />
                      <Sparkles className="w-6 h-6 text-emerald-400 absolute inset-0 m-auto animate-pulse" />
                    </div>
                    <div>
                      <p className="text-sm font-extrabold text-white">Synthesizing Creative Canvas...</p>
                      <p className="text-xs text-slate-400 mt-1 max-w-xs">
                        Applying "{selectedStyle}" style with "{aspectRatio}" aspect ratio.
                      </p>
                    </div>
                  </div>
                ) : latestGeneration ? (
                  <div className="relative w-full h-full group">
                    <img
                      src={latestGeneration.image_url}
                      alt={latestGeneration.prompt}
                      className="w-full h-full object-contain max-h-[480px] mx-auto transition-transform duration-300"
                    />
                    <button
                      onClick={() => setPreviewZoom(true)}
                      className="absolute top-3 right-3 p-2 rounded-xl bg-slate-950/60 text-white backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Zoom"
                    >
                      <Maximize2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-center p-6 text-slate-500">
                    <div className="w-16 h-16 rounded-3xl bg-slate-100 dark:bg-slate-800/80 flex items-center justify-center mb-3 text-slate-400">
                      <ImageIcon className="w-8 h-8" />
                    </div>
                    <p className="text-xs font-bold text-slate-400">
                      Your generated masterpiece will appear here.
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1 max-w-xs">
                      Enter a creative prompt on the left and click "Generate Now".
                    </p>
                  </div>
                )}
              </div>

              {/* Artwork Metadata & Actions */}
              {latestGeneration && (
                <div className="mt-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800">
                  <p className="text-xs text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
                    "{latestGeneration.prompt}"
                  </p>
                  <div className="flex flex-wrap items-center gap-2 mt-2 text-[10px] font-bold text-slate-500">
                    <span className="px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                      {latestGeneration.style}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                      {latestGeneration.aspect_ratio}
                    </span>
                    <span className="text-emerald-500 flex items-center gap-1 ml-auto">
                      <Check className="w-3 h-3" /> Saved to History
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Actions: Download & Copy Prompt */}
            {latestGeneration && (
              <div className="mt-4 flex gap-2">
                <a
                  id="btn-download-generated"
                  href={latestGeneration.image_url}
                  download={`drdevan-ai-${latestGeneration.id}.jpg`}
                  className="flex-1 py-3 px-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-extrabold shadow-md shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>{t("download_image")}</span>
                </a>
                <button
                  id="btn-copy-prompt"
                  onClick={handleCopyPrompt}
                  className="py-3 px-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-700 transition-all flex items-center justify-center gap-2"
                >
                  {copiedPrompt ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedPrompt ? "Copied" : t("copy_prompt")}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Lightbox Zoom Modal */}
      {previewZoom && latestGeneration && (
        <div
          onClick={() => setPreviewZoom(false)}
          className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in"
        >
          <div className="relative max-w-4xl max-h-[90vh] overflow-hidden rounded-3xl">
            <img
              src={latestGeneration.image_url}
              alt={latestGeneration.prompt}
              className="max-h-[85vh] w-auto rounded-3xl object-contain mx-auto shadow-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
};
