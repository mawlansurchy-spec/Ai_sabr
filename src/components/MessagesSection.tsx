import { useState } from "react";
import { MessageSquare, Send, Image as ImageIcon, Mic, Phone, Video, Search, CheckCheck, X, Crown, Sparkles } from "lucide-react";

interface Contact {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  online: boolean;
  unread: number;
}

interface ChatMessage {
  id: string;
  sender: "user" | "other";
  text: string;
  time: string;
  type?: "text" | "image" | "voice";
  mediaUrl?: string;
}

export function MessagesSection() {
  const [contacts, setContacts] = useState<Contact[]>([
    { id: "1", name: "دکتۆر قەیس (بەڕێوەبەر)", avatar: "https://i.ibb.co/JRfHmTpT/file-00000000d7c481f49c480f9092004daf.png", lastMessage: "سڵاو، کەیلس پێشبینی زێڕت بینی؟", time: "١٢:٣٠ پ.ن", online: true, unread: 2 },
    { id: "2", name: "ئارام مەجید (ئەندام)", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80", lastMessage: "سێتئەپی FVG زۆر سەرکەوتوو بوو!", time: "١١:١٥ پ.ن", online: true, unread: 0 },
    { id: "3", name: "ڕێناس حەسەن", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80", lastMessage: "سپاس بۆ ڕێنماییەکانت براکەم", time: "دوێنێ", online: false, unread: 0 },
  ]);

  const [activeContact, setActiveContact] = useState<Contact>(contacts[0]);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: "m1", sender: "other", text: "سڵاو! بەخێربێیت بۆ بەشی نامە تایبەتەکانی DEVAN PRO.", time: "١٢:٢٥ پ.ن" },
    { id: "m2", sender: "user", text: "سڵاو براکەم، سوپاس. سیستەمەکە زۆر ناوازەیە.", time: "١٢:٢٨ پ.ن" },
    { id: "m3", sender: "other", text: "سڵاو، کەیلس پێشبینی زێڕت بینی؟", time: "١٢:٣٠ پ.ن" }
  ]);
  const [input, setInput] = useState("");
  const [callActive, setCallActive] = useState<"voice" | "video" | null>(null);

  const handleSend = () => {
    if (!input.trim()) return;
    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: "user",
      text: input,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, newMsg]);
    setInput("");
  };

  return (
    <div className="max-w-6xl mx-auto w-full h-[calc(100vh-140px)] bg-[#080a0f] border border-[#d4af37]/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row backdrop-blur-xl" dir="rtl">
      {/* Sidebar Contacts */}
      <div className="w-full md:w-80 border-l border-white/10 bg-black/60 flex flex-col">
        <div className="p-4 border-b border-white/10">
          <h2 className="text-base font-extrabold text-white mb-3 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-[#d4af37]" /> نامە تایبەتەکان
          </h2>
          <div className="relative">
            <Search className="absolute right-3 top-3 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="گەڕان لە نامەکان..."
              className="w-full bg-white/5 border border-white/10 rounded-xl pr-9 pl-3 py-2 text-xs text-white focus:outline-none focus:border-[#d4af37]"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-white/5">
          {contacts.map(c => (
            <div
              key={c.id}
              onClick={() => setActiveContact(c)}
              className={`p-3.5 flex items-center gap-3 cursor-pointer transition-all ${
                activeContact.id === c.id ? "bg-[#d4af37]/15 border-r-4 border-[#d4af37]" : "hover:bg-white/5"
              }`}
            >
              <div className="relative">
                <img src={c.avatar} alt={c.name} className="w-11 h-11 rounded-2xl object-cover border border-white/10" />
                {c.online && <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-black"></span>}
              </div>
              <div className="flex-1 min-w-0 text-right">
                <div className="flex justify-between items-center mb-1">
                  <h4 className="text-xs font-bold text-white truncate">{c.name}</h4>
                  <span className="text-[10px] text-zinc-500 font-mono">{c.time}</span>
                </div>
                <p className="text-[11px] text-zinc-400 truncate">{c.lastMessage}</p>
              </div>
              {c.unread > 0 && (
                <span className="w-5 h-5 rounded-full bg-[#d4af37] text-black font-bold text-[10px] flex items-center justify-center">
                  {c.unread}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-black/30">
        {/* Chat Header */}
        <div className="p-4 border-b border-white/10 bg-black/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img src={activeContact.avatar} alt={activeContact.name} className="w-10 h-10 rounded-xl object-cover border border-[#d4af37]/30" />
              {activeContact.online && <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-black"></span>}
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">{activeContact.name}</h3>
              <p className="text-[10px] text-emerald-400">{activeContact.online ? "online ئێستا" : "offline"}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCallActive("voice")}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 hover:text-white transition-all cursor-pointer"
              title="پەیوەندی دەنگی"
            >
              <Phone className="w-4 h-4 text-[#d4af37]" />
            </button>
            <button
              onClick={() => setCallActive("video")}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 hover:text-white transition-all cursor-pointer"
              title="پەیوەندی ڤیدیۆیی"
            >
              <Video className="w-4 h-4 text-emerald-400" />
            </button>
          </div>
        </div>

        {/* Messages Feed */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3">
          {messages.map(m => (
            <div key={m.id} className={`flex ${m.sender === "user" ? "justify-start" : "justify-end"}`}>
              <div className={`max-w-[70%] rounded-2xl p-3.5 text-xs sm:text-sm ${
                m.sender === "user"
                  ? "bg-[#d4af37]/20 border border-[#d4af37]/40 text-white rounded-tr-none"
                  : "bg-white/5 border border-white/10 text-zinc-200 rounded-tl-none"
              }`}>
                <p className="leading-relaxed">{m.text}</p>
                <div className="flex items-center justify-end gap-1 mt-1 text-[9px] text-zinc-400 font-mono">
                  <span>{m.time}</span>
                  {m.sender === "user" && <CheckCheck className="w-3 h-3 text-[#d4af37]" />}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 border-t border-white/10 bg-black/60 flex items-center gap-2">
          <button className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white cursor-pointer" title="ناردنی وێنە">
            <ImageIcon className="w-5 h-5" />
          </button>
          <button className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white cursor-pointer" title="ناردنی دەنگ">
            <Mic className="w-5 h-5" />
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="نامەیەک بنووسە..."
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

      {/* Call Modal Simulation */}
      {callActive && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-xl p-4">
          <div className="w-full max-w-md p-8 bg-[#0c0f17] border border-[#d4af37]/40 rounded-3xl text-center shadow-[0_0_50px_rgba(212,175,55,0.2)] flex flex-col items-center">
            <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-[#d4af37] mb-4 shadow-[0_0_20px_rgba(212,175,55,0.4)]">
              <img src={activeContact.avatar} alt="" className="w-full h-full object-cover" />
            </div>
            <h3 className="text-xl font-extrabold text-white mb-1">{activeContact.name}</h3>
            <p className="text-xs text-[#d4af37] mb-8 animate-pulse">
              {callActive === "video" ? "📹 پەیوەندی ڤیدیۆیی چالاکە..." : "📞 پەیوەندی دەنگی چالاکە..."}
            </p>

            <div className="flex items-center gap-4">
              <button
                onClick={() => setCallActive(null)}
                className="px-6 py-3 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition-all shadow-[0_0_15px_rgba(239,68,68,0.4)] cursor-pointer"
              >
                پچڕاندنی پەیوەندی
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
