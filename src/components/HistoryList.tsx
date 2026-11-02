import { HistoryItem } from "../types";
import { ArrowLeft, Clock } from "lucide-react";

interface HistoryListProps {
  items: HistoryItem[];
  onSelect: (id: string) => void;
}

export function HistoryList({ items, onSelect }: HistoryListProps) {
  if (items.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        هیچ شیکارییەکی پێشوو بوونی نییە.
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
      {items.map((item) => (
        <div
          key={item.id}
          onClick={() => onSelect(item.id)}
          className="bg-white/[0.03] rounded-[32px] border border-white/5 overflow-hidden cursor-pointer hover:border-emerald-500/30 transition-all group hover:bg-white/[0.05]"
        >
          <div className="h-40 overflow-hidden bg-black/40 relative border-b border-white/5">
            <img
              src={item.imagePreview}
              alt="Chart preview"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#050608] via-transparent to-transparent"></div>
            <div className="absolute bottom-3 left-3 text-white text-xs flex items-center gap-1 font-medium bg-black/60 px-2 py-1 rounded-md backdrop-blur-sm">
               <Clock className="w-3 h-3 text-emerald-400" />
               {new Date(item.timestamp).toLocaleDateString("ku-IQ")}
            </div>
          </div>
          <div className="p-6">
            <p className="text-sm text-gray-400 line-clamp-3 leading-relaxed" dir="rtl">
              {item.reportSummary}
            </p>
            <div className="mt-4 flex items-center gap-2 text-emerald-400 text-sm font-medium">
               <ArrowLeft className="w-4 h-4" /> پیشاندانی تەواو
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
