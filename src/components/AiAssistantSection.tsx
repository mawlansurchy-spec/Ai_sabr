import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { Bot, Send, Sparkles, TrendingUp, ShieldCheck, Zap, Trash2, Copy, Check } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "model";
  content: string;
  timestamp: string;
}

export function AiAssistantSection() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "model",
      content: `بەخێربێیت بۆ **یاریدەدەری زیرەکی ICT & XAUUSD** ⚡\n\nمن لێرەم بۆ یارمەتیدانت لە شیکاری زانستی بازار، دۆزینەوەی ئۆردەربلۆک، FVG، و لێکدانەوەی نرخی ڕاستەوخۆی زێڕ (XAUUSD).\n\nپرسیارەکەت بنووسە یان یەکێک لە فرۆپمپە خێراکان هەڵبژێرە!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async (customPrompt?: string) => {
    const textToSend = (customPrompt || input).trim();
    if (!textToSend) return;

    setInput("");
    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await fetch("/api/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: textToSend,
          messages: messages.slice(-6),
          marketContext: "XAUUSD Live Market Data: Price ~2650.40, Bullish ICT Order Block active at 2642.00, FVG at 2655.00."
        })
      });
      const data = await res.json();
      if (data.status === "success" && data.reply) {
        const modelMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: "model",
          content: data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, modelMsg]);
      } else {
        throw new Error(data.message || "Error");
      }
    } catch (e) {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "model",
        content: "ببورە لە پەیوەندی لەگەڵ سێرڤەری زیرەک هەڵەیەک ڕوویدا. تکایە دووبارە هەوڵ بدەرەوە.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto w-full flex flex-col h-[calc(100vh-140px)] bg-[#080a0f] border border-[#d4af37]/30 rounded-3xl shadow-2xl overflow-hidden backdrop-blur-xl" dir="rtl">
      {/* Header */}
      <div className="p-4 border-b border-white/10 bg-black/60 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#d4af37]/20 border border-[#d4af37]/40 flex items-center justify-center text-[#d4af37] shadow-[0_0_15px_rgba(212,175,55,0.2)]">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-white flex items-center gap-2">
              <span>یاریدەدەری زیرەکی ICT & XAUUSD</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#d4af37]/20 text-[#d4af37] border border-[#d4af37]/30">PRO</span>
            </h2>
            <p className="text-xs text-zinc-400">شیکاری زانستی پاشخانی مارکێت و ڕاوێژکاری Smart Money</p>
          </div>
        </div>
        <button
          onClick={() => setMessages([])}
          className="p-2 rounded-xl bg-white/5 hover:bg-red-950/40 border border-white/10 text-zinc-400 hover:text-red-300 transition-all flex items-center gap-1.5 text-xs cursor-pointer"
          title="پاککردنەوەی گفتوگۆ"
        >
          <Trash2 className="w-4 h-4" />
          <span className="hidden sm:inline">پاککردنەوە</span>
        </button>
      </div>

      {/* Quick Prompts */}
      <div className="p-3 bg-black/30 border-b border-white/5 flex gap-2 overflow-x-auto scrollbar-hide">
        <button
          onClick={() => handleSend("تکایە شیکارییەکی خێرای XAUUSD لەسەر بنەمای Order Block و FVG بۆ بکە.")}
          className="px-3 py-1.5 rounded-xl bg-[#d4af37]/10 hover:bg-[#d4af37]/20 border border-[#d4af37]/30 text-xs text-[#d4af37] whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <TrendingUp className="w-3.5 h-3.5" /> شیکاری خێرای زێڕ (XAUUSD)
        </button>
        <button
          onClick={() => handleSend("چۆن دەتوانم ستۆپ لۆسی کورت و دەقیق لە بازاڕدا دابنێم؟")}
          className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-xs text-amber-400 whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <ShieldCheck className="w-3.5 h-3.5" /> ستۆپ لۆسی کورت مەودا
        </button>
        <button
          onClick={() => handleSend("ڕوونکردنەوە لەسەر Liquidity Sweep و Stop Hunt بدە.")}
          className="px-3 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-xs text-purple-400 whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <Zap className="w-3.5 h-3.5" /> ڕاماڵینی نەختینە
        </button>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map(m => (
          <div key={m.id} className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
              m.role === "user"
                ? "bg-blue-600/20 border-blue-500/40 text-blue-400"
                : "bg-[#d4af37]/20 border-[#d4af37]/40 text-[#d4af37]"
            }`}>
              {m.role === "user" ? "تو" : <Bot className="w-4 h-4" />}
            </div>
            <div className={`max-w-[80%] rounded-2xl p-4 border text-sm leading-relaxed shadow-lg ${
              m.role === "user"
                ? "bg-blue-600/15 border-blue-500/30 text-white rounded-tr-none"
                : "bg-black/60 border-white/10 text-zinc-200 rounded-tl-none"
            }`}>
              <div className="flex items-center justify-between gap-4 mb-1 text-[10px] text-zinc-400 font-mono">
                <span>{m.role === "user" ? "بەکارهێنەر" : "دیڤان AI"}</span>
                <span>{m.timestamp}</span>
              </div>
              <div className="markdown-body prose prose-invert text-xs sm:text-sm">
                <ReactMarkdown>{m.content}</ReactMarkdown>
              </div>
              {m.role === "model" && (
                <div className="mt-3 pt-2 border-t border-white/10 flex justify-end">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(m.content);
                      setCopiedId(m.id);
                      setTimeout(() => setCopiedId(null), 2000);
                    }}
                    className="text-[11px] text-zinc-400 hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    {copiedId === m.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedId === m.id ? "کۆپیکرا" : "کۆپیکردنی وەڵام"}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-3 items-center text-zinc-400 text-xs p-3 bg-black/40 rounded-2xl border border-white/5 w-fit">
            <Sparkles className="w-4 h-4 text-[#d4af37] animate-spin" />
            <span>دیڤان AI خەریکی شیکردنەوەیە...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div className="p-4 border-t border-white/10 bg-black/80 backdrop-blur-md">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="پرسیارەکەت لەبارەی شیکاری چارت، زێڕ، یان ICT بنووسە..."
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs sm:text-sm text-white focus:outline-none focus:border-[#d4af37] transition-all"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-5 py-3 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#b38e22] hover:opacity-90 disabled:opacity-50 text-black font-extrabold text-xs sm:text-sm transition-all shadow-[0_0_15px_rgba(212,175,55,0.3)] flex items-center gap-2 cursor-pointer"
          >
            <Send className="w-4 h-4 fill-black" />
            <span className="hidden sm:inline">ناردن</span>
          </button>
        </form>
      </div>
    </div>
  );
}
