import React, { useState, useEffect } from "react";
import { useLanguage } from "../context/LanguageContext";
import { useToast } from "../context/ToastContext";
import { Generation } from "../types";
import {
  History,
  Download,
  Trash2,
  Maximize2,
  Search,
  Filter,
  Sparkles,
  Calendar,
  AlertCircle,
  Copy,
  Check,
} from "lucide-react";

export const HistoryPage: React.FC = () => {
  const { t } = useLanguage();
  const { showToast } = useToast();

  const [generations, setGenerations] = useState<Generation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStyleFilter, setSelectedStyleFilter] = useState("ALL");
  const [activeZoomImage, setActiveZoomImage] = useState<Generation | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    async function loadHistory() {
      try {
        const res = await fetch("/api/user/generations");
        if (res.ok) {
          const data = await res.json();
          setGenerations(data.generations || []);
        }
      } catch (e) {
        console.error("Failed to load generations:", e);
      } finally {
        setLoading(false);
      }
    }
    loadHistory();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/user/generations/${id}`, { method: "DELETE" });
      if (res.ok) {
        setGenerations((prev) => prev.filter((g) => g.id !== id));
        showToast(t("delete"), "Generation deleted from history", "success");
      } else {
        showToast(t("error"), "Failed to delete generation", "error");
      }
    } catch {
      showToast(t("error"), "Network error", "error");
    } finally {
      setDeletingId(null);
    }
  };

  const filteredGenerations = generations.filter((g) => {
    const matchesSearch =
      g.prompt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.style.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStyle =
      selectedStyleFilter === "ALL" || g.style.toUpperCase() === selectedStyleFilter.toUpperCase();
    return matchesSearch && matchesStyle;
  });

  return (
    <div className="flex flex-col gap-8 pb-16">
      {/* Header */}
      <div className="p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-500">
            {t("my_history")}
          </span>
          <h1 className="text-xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
            {t("history_title")}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
            {t("history_subtitle")}
          </p>
        </div>

        <div className="px-4 py-2 rounded-2xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300">
          Total: {generations.length} Artworks
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <input
            id="input-search-history"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("search_by_prompt")}
            className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 backdrop-blur-md"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            id="select-style-filter"
            value={selectedStyleFilter}
            onChange={(e) => setSelectedStyleFilter(e.target.value)}
            className="w-full sm:w-auto px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/50 backdrop-blur-md"
          >
            <option value="ALL">{t("all_styles")}</option>
            <option value="Realistic">{t("style_realistic")}</option>
            <option value="Cinematic">{t("style_cinematic")}</option>
            <option value="Anime">{t("style_anime")}</option>
            <option value="3D Render">{t("style_3d_render")}</option>
            <option value="Cyberpunk">{t("style_cyberpunk")}</option>
            <option value="Fantasy">{t("style_fantasy")}</option>
            <option value="Digital Art">{t("style_digital_art")}</option>
            <option value="Watercolor">{t("style_watercolor")}</option>
          </select>
        </div>
      </div>

      {/* Gallery Grid */}
      {loading ? (
        <div className="py-20 text-center text-xs font-bold text-slate-500">
          Loading history...
        </div>
      ) : filteredGenerations.length === 0 ? (
        <div className="py-20 text-center p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50">
          <History className="w-10 h-10 text-slate-400 mx-auto mb-3" />
          <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
            {t("no_generations_found")}
          </p>
          <p className="text-xs text-slate-500 mt-1">{t("empty_history_desc")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGenerations.map((gen) => (
            <div
              key={gen.id}
              id={`history-item-${gen.id}`}
              className="rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl shadow-lg overflow-hidden flex flex-col justify-between group hover:shadow-2xl transition-all duration-300"
            >
              <div>
                {/* Image Container */}
                <div className="relative aspect-video sm:aspect-square bg-slate-950 overflow-hidden">
                  <img
                    src={gen.image_url}
                    alt={gen.prompt}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-3">
                    <button
                      onClick={() => setActiveZoomImage(gen)}
                      className="p-2 rounded-xl bg-slate-900/80 text-white hover:bg-slate-900 transition-colors"
                      title={t("view")}
                    >
                      <Maximize2 className="w-4 h-4" />
                    </button>
                    <a
                      href={gen.image_url}
                      download={`drdevan-ai-${gen.id}.jpg`}
                      className="p-2 rounded-xl bg-emerald-500 text-white hover:bg-emerald-400 transition-colors"
                      title={t("download_image")}
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  </div>
                </div>

                {/* Info */}
                <div className="p-4">
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 line-clamp-2 leading-relaxed">
                    "{gen.prompt}"
                  </p>

                  <div className="flex flex-wrap items-center gap-1.5 mt-3 text-[10px] font-bold">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {gen.style}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {gen.aspect_ratio}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                      {t("credit_used")}: {gen.credit_used}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="p-4 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{new Date(gen.created_at).toLocaleDateString()}</span>
                </div>

                <div className="flex items-center gap-1">
                  <a
                    href={gen.image_url}
                    download={`drdevan-ai-${gen.id}.jpg`}
                    className="p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:text-emerald-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title={t("download_image")}
                  >
                    <Download className="w-4 h-4" />
                  </a>
                  <button
                    onClick={() => setDeletingId(gen.id)}
                    className="p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                    title={t("delete")}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl text-center">
            <Trash2 className="w-10 h-10 text-rose-500 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {t("confirm_delete_generation")}
            </h3>
            <p className="text-xs text-slate-500 mt-1">This action cannot be undone.</p>
            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setDeletingId(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300"
              >
                {t("cancel")}
              </button>
              <button
                onClick={() => handleDelete(deletingId)}
                className="flex-1 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold shadow-md shadow-rose-500/20"
              >
                {t("delete")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox Zoom Modal */}
      {activeZoomImage && (
        <div
          onClick={() => setActiveZoomImage(null)}
          className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in"
        >
          <div className="relative max-w-4xl max-h-[90vh] overflow-hidden rounded-3xl">
            <img
              src={activeZoomImage.image_url}
              alt={activeZoomImage.prompt}
              className="max-h-[85vh] w-auto rounded-3xl object-contain mx-auto shadow-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
};
