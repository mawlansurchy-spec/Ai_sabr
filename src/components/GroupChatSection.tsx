import { useState } from "react";
import { Users, Plus, Send, Image as ImageIcon, Mic, UserPlus, Trash2, Crown, Sparkles, X } from "lucide-react";

interface GroupItem {
  id: string;
  name: string;
  description: string;
  avatar: string;
  membersCount: number;
  members: string[];
}

interface GroupMsg {
  id: string;
  senderName: string;
  text: string;
  time: string;
}

export function GroupChatSection() {
  const [groups, setGroups] = useState<GroupItem[]>([
    {
      id: "g1",
      name: "گرووپی تایبەتی ICT VIP Signals",
      description: "گرووپی فەرمی شیکارانی پرایس ئەکشن و Smart Money",
      avatar: "https://i.ibb.co/JRfHmTpT/file-00000000d7c481f49c480f9092004daf.png",
      membersCount: 1420,
      members: ["دکتۆر قەیس", "ئارام مەجید", "ڕێناس حەسەن", "سۆران بەختیار"]
    },
    {
      id: "g2",
      name: "مێرکاتووی زێڕ (XAUUSD Scalpers)",
      description: "دیاریکردنی خاڵی چوونەژوورەوە و ئامانجە خێراکان",
      avatar: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=100&auto=format&fit=crop&q=80",
      membersCount: 890,
      members: ["دکتۆر قەیس", "هێرش عومەر", "کاروان نەوزاد"]
    }
  ]);

  const [activeGroup, setActiveGroup] = useState<GroupItem>(groups[0]);
  const [messages, setMessages] = useState<GroupMsg[]>([
    { id: "gm1", senderName: "دکتۆر قەیس", text: "سڵاو ئەندامانی خۆشەویست. ئاستی ٢٦٥٠ی زێڕ زۆر گرنگە بۆ ئەمڕۆ.", time: "١٠:٠٠ پ.ن" },
    { id: "gm2", senderName: "ئارام مەجید", text: "دەست خۆش مامۆستا، فریمیش 1H ئۆردەر بلۆک نیشان دەدات.", time: "١٠:٠٥ پ.ن" }
  ]);
  const [input, setInput] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDesc, setNewGroupDesc] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;
    const msg: GroupMsg = {
      id: Date.now().toString(),
      senderName: "تۆ (بەڕێوەبەر)",
      text: input,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, msg]);
    setInput("");
  };

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;
    const newG: GroupItem = {
      id: Date.now().toString(),
      name: newGroupName,
      description: newGroupDesc || "گرووپی نوێ",
      avatar: "https://i.ibb.co/JRfHmTpT/file-00000000d7c481f49c480f9092004daf.png",
      membersCount: 1,
      members: ["تۆ"]
    };
    setGroups(prev => [...prev, newG]);
    setActiveGroup(newG);
    setNewGroupName("");
    setNewGroupDesc("");
    setShowCreateModal(false);
  };

  return (
    <div className="max-w-6xl mx-auto w-full h-[calc(100vh-140px)] bg-[#080a0f] border border-[#d4af37]/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row backdrop-blur-xl" dir="rtl">
      {/* Sidebar Groups */}
      <div className="w-full md:w-80 border-l border-white/10 bg-black/60 flex flex-col">
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-base font-extrabold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-[#d4af37]" /> گرووپەکان
          </h2>
          <button
            onClick={() => setShowCreateModal(true)}
            className="p-2 rounded-xl bg-[#d4af37] text-black hover:scale-105 active:scale-95 transition-all text-xs font-bold flex items-center gap-1 cursor-pointer"
            title="دروستکردنی گرووپ"
          >
            <Plus className="w-4 h-4" /> گرووپی نوێ
          </button>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-white/5">
          {groups.map(g => (
            <div
              key={g.id}
              onClick={() => setActiveGroup(g)}
              className={`p-3.5 flex items-center gap-3 cursor-pointer transition-all ${
                activeGroup.id === g.id ? "bg-[#d4af37]/15 border-r-4 border-[#d4af37]" : "hover:bg-white/5"
              }`}
            >
              <img src={g.avatar} alt={g.name} className="w-11 h-11 rounded-2xl object-cover border border-[#d4af37]/30" />
              <div className="flex-1 min-w-0 text-right">
                <h4 className="text-xs font-bold text-white truncate">{g.name}</h4>
                <p className="text-[10px] text-zinc-400">{g.membersCount} ئەندام</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Group Chat */}
      <div className="flex-1 flex flex-col bg-black/30">
        {/* Header */}
        <div className="p-4 border-b border-white/10 bg-black/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={activeGroup.avatar} alt="" className="w-10 h-10 rounded-xl object-cover border border-[#d4af37]/30" />
            <div>
              <h3 className="text-sm font-bold text-white">{activeGroup.name}</h3>
              <p className="text-[10px] text-zinc-400">{activeGroup.description} • {activeGroup.membersCount} ئەندام</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => alert(`ئەندامانی گرووپ: ${activeGroup.members.join(", ")}`)}
              className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-zinc-300 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Users className="w-4 h-4 text-[#d4af37]" /> بەڕێوەبردنی ئەندامان
            </button>
          </div>
        </div>

        {/* Feed */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3">
          {messages.map(m => (
            <div key={m.id} className="flex flex-col items-start bg-white/5 border border-white/10 rounded-2xl p-3.5 max-w-[75%]">
              <div className="flex items-center justify-between w-full mb-1">
                <span className="text-xs font-bold text-[#d4af37] flex items-center gap-1">
                  <Crown className="w-3 h-3" /> {m.senderName}
                </span>
                <span className="text-[9px] text-zinc-500 font-mono">{m.time}</span>
              </div>
              <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed">{m.text}</p>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="p-3 border-t border-white/10 bg-black/60 flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="نامەیەک بۆ گرووپ بنووسە..."
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-[#d4af37]"
          />
          <button
            onClick={handleSend}
            className="p-2.5 rounded-xl bg-[#d4af37] text-black font-bold hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <Send className="w-4 h-4 fill-black" />
          </button>
        </div>
      </div>

      {/* Create Group Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4" dir="rtl">
          <div className="w-full max-w-md p-6 bg-[#0c0f17] border border-[#d4af37]/40 rounded-3xl shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white">دروستکردنی گرووپی نوێ</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateGroup} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">ناوی گرووپ</label>
                <input
                  type="text"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="بۆ نموونە: شیکارانی سەرکەوتوو"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#d4af37]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">پێناسەی گرووپ</label>
                <textarea
                  value={newGroupDesc}
                  onChange={(e) => setNewGroupDesc(e.target.value)}
                  placeholder="کورتەیەک لەسەر ئامانجی گرووپەکە..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#d4af37] h-20 resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 text-zinc-300 text-xs hover:bg-white/10 cursor-pointer"
                >
                  پاشگەزبوونەوە
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#d4af37] text-black font-bold text-xs hover:scale-105 transition-all cursor-pointer shadow-[0_0_15px_rgba(212,175,55,0.3)]"
                >
                  دروستکردن
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
