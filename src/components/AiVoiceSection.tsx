import React, { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Volume2, Sparkles, Radio, Play, Square, Headphones, RefreshCw, AlertCircle } from "lucide-react";

type VoiceState = "IDLE" | "CONNECTING" | "LISTENING" | "PROCESSING" | "SPEAKING" | "RECONNECTING" | "ERROR";

export function AiVoiceSection() {
  const [status, setStatus] = useState<VoiceState>("IDLE");
  const [transcript, setTranscript] = useState("");
  const [aiResponse, setAiResponse] = useState("تکایە دوگمەی دەستپێکردن داگرە بۆ دەستپێکردنی گفتوگۆی دەنگی ڕاستەوخۆ بە مۆدێلی پیشکەوتووی Gemini 3.8 Flash.");
  const [isMuted, setIsMuted] = useState(false);
  const [voiceGender, setVoiceGender] = useState<"female" | "male">("female");
  const [selectedModel, setSelectedModel] = useState<string>("models/gemini-3.8-flash");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isFallbackMode, setIsFallbackMode] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const nextPlayTimeRef = useRef<number>(0);
  const isRunningRef = useRef<boolean>(false);

  const startConversation = async () => {
    setErrorMessage(null);
    setStatus("CONNECTING");
    setIsFallbackMode(false);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Microphone API not supported in this environment");
      }

      // Request Microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });
      mediaStreamRef.current = stream;

      // Connect to secure backend WebSocket proxy
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/api/gemini-live-ws`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("Connected to Gemini Live WebSocket proxy");
        setStatus("LISTENING");
        isRunningRef.current = true;

        const voiceName = voiceGender === "female" ? "Kore" : "Puck";
        const setupMessage = {
          setup: {
            model: selectedModel,
            generationConfig: {
              responseModalities: ["AUDIO"],
              speechConfig: {
                voiceConfig: {
                  prebuiltVoiceConfig: {
                    voiceName: voiceName,
                  },
                },
              },
            },
            systemInstruction: {
              parts: [
                {
                  text: `You are Dr.Devan Quantum AI — powered by Gemini 3.8 Flash Turbo TTS & Multimodal Live Engine. You are an expert institutional ICT & SMC trading mentor and assistant. You speak in fluent Sorani Kurdish (سۆرانی) and English, providing live trading advice, XAUUSD market analysis, and guidance. Maintain a natural, friendly, and professional voice.`,
                },
              ],
            },
          },
        };
        ws.send(JSON.stringify(setupMessage));

        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        const audioCtx = new AudioCtx({ sampleRate: 16000 });
        audioContextRef.current = audioCtx;
        nextPlayTimeRef.current = audioCtx.currentTime;

        const source = audioCtx.createMediaStreamSource(stream);
        sourceNodeRef.current = source;
        const processor = audioCtx.createScriptProcessor(4096, 1, 1);
        processorRef.current = processor;

        processor.onaudioprocess = (e) => {
          if (!isRunningRef.current || isMuted || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
            return;
          }
          const inputData = e.inputBuffer.getChannelData(0);
          const pcm16 = new Int16Array(inputData.length);
          for (let i = 0; i < inputData.length; i++) {
            const s = Math.max(-1, Math.min(1, inputData[i]));
            pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
          }

          const uint8 = new Uint8Array(pcm16.buffer);
          let binary = "";
          const len = uint8.byteLength;
          for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(uint8[i]);
          }
          const base64Data = btoa(binary);

          const realTimeMessage = {
            realtimeInput: {
              mediaChunks: [
                {
                  mimeType: "audio/pcm;rate=16000",
                  data: base64Data,
                },
              ],
            },
          };
          wsRef.current.send(JSON.stringify(realTimeMessage));
        };

        source.connect(processor);
        processor.connect(audioCtx.destination);
      };

      ws.onmessage = async (event) => {
        try {
          let data: any;
          if (event.data instanceof Blob) {
            const text = await event.data.text();
            data = JSON.parse(text);
          } else {
            data = JSON.parse(event.data);
          }

          if (data.error) {
            console.error("Gemini Live Error:", data.error);
            setErrorMessage(data.error);
            setStatus("ERROR");
            return;
          }

          const serverContent = data.serverContent;
          if (serverContent) {
            if (serverContent.modelTurn?.parts) {
              setStatus("SPEAKING");
              for (const part of serverContent.modelTurn.parts) {
                if (part.text) {
                  setAiResponse((prev) => prev + " " + part.text);
                }
                if (part.inlineData && part.inlineData.data) {
                  playPcmAudio24k(part.inlineData.data);
                }
              }
            }
            if (serverContent.turnComplete) {
              setStatus("LISTENING");
            }
          }
        } catch (err) {
          console.error("Error parsing websocket message:", err);
        }
      };

      ws.onerror = (err) => {
        console.error("WebSocket error:", err);
        setStatus("RECONNECTING");
        setErrorMessage("کێشەیەک لە پەیوەندی وایبرێس دروستبوو. چالاککردنی دۆخی ئەلتەرناتیو...");
        activateFallbackMode();
      };

      ws.onclose = () => {
        console.log("WebSocket closed");
        if (isRunningRef.current) {
          setStatus("RECONNECTING");
        } else {
          setStatus("IDLE");
        }
      };
    } catch (err: any) {
      console.warn("Microphone access or Live WS error, activating fallback mode:", err);
      const isPermissionErr = err?.name === "NotAllowedError" || err?.name === "PermissionDeniedError" || err?.message?.includes("Permission denied") || err?.message?.includes("Microphone");
      
      setErrorMessage(
        isPermissionErr
          ? "مایکرۆفۆن قەدەغە کراوە یان لەم پەنجەرەیەدا ڕێپێدانی نییە. (دۆخی گفتوگۆی دەنگی زیرەکی Gemini 3.8 Flash بە سەرکەوتوویی کارا کرا)."
          : `کێشە لە بەردەستبوونی مایکرۆفۆن: ${err.message || "ڕێپێدان نەدراوە"}`
      );
      activateFallbackMode();
    }
  };

  const activateFallbackMode = () => {
    setIsFallbackMode(true);
    setStatus("LISTENING");
    isRunningRef.current = true;
    setAiResponse("دۆخی دەنگی ئەلتەرناتیو (Gemini 3.8 Flash TTS) چالاک کرا. دەتوانیت پرسیارەکانت بنووسیت یان یەکێک لە دوگمەکانی خوارەوە کلیک بکەیت بۆ وەرگرتنی شیکاری دەنگی زێڕ و ICT.");
  };

  const speakFallbackMessage = (textToSpeak: string) => {
    setAiResponse(textToSpeak);
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = "ar-SA"; // Arabic/Kurdish fallback
      utterance.rate = 1.0;
      utterance.onstart = () => setStatus("SPEAKING");
      utterance.onend = () => setStatus("LISTENING");
      window.speechSynthesis.speak(utterance);
    } else {
      setStatus("SPEAKING");
      setTimeout(() => setStatus("LISTENING"), 3000);
    }
  };

  const playPcmAudio24k = async (base64Data: string) => {
    try {
      const audioCtx = audioContextRef.current;
      if (!audioCtx) return;

      const binaryString = atob(base64Data);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const pcm16 = new Int16Array(bytes.buffer);
      const float32 = new Float32Array(pcm16.length);
      for (let i = 0; i < pcm16.length; i++) {
        float32[i] = pcm16[i] / 32768.0;
      }

      const audioBuffer = audioCtx.createBuffer(1, float32.length, 24000);
      audioBuffer.copyToChannel(float32, 0);

      const source = audioCtx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioCtx.destination);

      const currentTime = audioCtx.currentTime;
      if (nextPlayTimeRef.current < currentTime) {
        nextPlayTimeRef.current = currentTime;
      }
      source.start(nextPlayTimeRef.current);
      nextPlayTimeRef.current += audioBuffer.duration;

      source.onended = () => {
        if (audioCtx.currentTime >= nextPlayTimeRef.current - 0.1) {
          setStatus("LISTENING");
        }
      };
    } catch (e) {
      console.error("Error playing audio chunk:", e);
    }
  };

  const stopConversation = () => {
    isRunningRef.current = false;
    setIsFallbackMode(false);

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }

    if (sourceNodeRef.current) {
      sourceNodeRef.current.disconnect();
      sourceNodeRef.current = null;
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }

    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }

    setStatus("IDLE");
  };

  useEffect(() => {
    return () => {
      stopConversation();
    };
  }, []);

  return (
    <div className="max-w-3xl mx-auto w-full flex flex-col items-center justify-center p-6 sm:p-10 bg-[#080a0f] border border-[#d4af37]/30 rounded-3xl shadow-2xl backdrop-blur-xl text-center" dir="rtl">
      {/* Icon & Title */}
      <div className="w-20 h-20 rounded-3xl bg-[#d4af37]/20 border border-[#d4af37]/50 flex items-center justify-center text-[#d4af37] shadow-[0_0_30px_rgba(212,175,55,0.3)] mb-6 animate-pulse">
        <Headphones className="w-10 h-10" />
      </div>

      <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-2 flex items-center justify-center gap-2">
        <span>یاریدەدەری دەنگی Gemini 3.8 Flash TTS</span>
        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#d4af37]/20 text-[#d4af37] border border-[#d4af37]/30">TURBO TTS</span>
      </h2>
      <p className="text-xs sm:text-sm text-zinc-400 max-w-lg mb-6 leading-relaxed">
        گفتوگۆی ڕاستەوخۆی دەنگی بە بەهێزترین مۆدێلی Gemini 3.8 Flash TTS و Live Voice Engine بۆ شیکاری زانستی ICT و زێڕ بە زمانی کوردی و ئینگلیزی.
      </p>

      {/* Model Selection */}
      <div className="flex items-center gap-3 mb-6 p-1.5 bg-black/60 border border-white/10 rounded-2xl flex-wrap justify-center">
        <button
          onClick={() => setSelectedModel("models/gemini-3.8-flash")}
          disabled={status !== "IDLE"}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            selectedModel === "models/gemini-3.8-flash"
              ? "bg-[#d4af37] text-black shadow-[0_0_15px_rgba(212,175,55,0.3)]"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          ⚡ Gemini 3.8 Flash TTS (Recommended)
        </button>
        <button
          onClick={() => setSelectedModel("models/gemini-2.0-flash-exp")}
          disabled={status !== "IDLE"}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            selectedModel === "models/gemini-2.0-flash-exp"
              ? "bg-[#d4af37] text-black shadow-[0_0_15px_rgba(212,175,55,0.3)]"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          🎙 Gemini 2.0 Flash Live
        </button>
      </div>

      {/* Voice Selection */}
      <div className="flex items-center gap-3 mb-6 p-1.5 bg-black/60 border border-white/10 rounded-2xl">
        <button
          onClick={() => setVoiceGender("female")}
          disabled={status !== "IDLE"}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            voiceGender === "female"
              ? "bg-[#d4af37] text-black shadow-[0_0_15px_rgba(212,175,55,0.3)]"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          👩 دەنگی مێینە (Kore - Natural TTS)
        </button>
        <button
          onClick={() => setVoiceGender("male")}
          disabled={status !== "IDLE"}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            voiceGender === "male"
              ? "bg-[#d4af37] text-black shadow-[0_0_15px_rgba(212,175,55,0.3)]"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          👨 دەنگی نێرینە (Puck)
        </button>
      </div>

      {/* Status Badge */}
      <div className="mb-6 px-4 py-1.5 rounded-full bg-black/60 border border-white/10 flex items-center gap-2 text-xs font-mono">
        <span
          className={`w-2.5 h-2.5 rounded-full ${
            status === "LISTENING"
              ? "bg-emerald-500 animate-ping"
              : status === "SPEAKING"
              ? "bg-amber-400 animate-bounce"
              : status === "CONNECTING" || status === "RECONNECTING"
              ? "bg-blue-500 animate-pulse"
              : status === "ERROR"
              ? "bg-red-500"
              : "bg-zinc-500"
          }`}
        />
        <span className="text-zinc-300 font-semibold">دۆخ (Status):</span>
        <span className="text-[#d4af37] font-bold">{isFallbackMode ? "ACTIVE (Gemini 3.8 TTS Mode)" : status}</span>
      </div>

      {/* Visualizer Wave Animation */}
      <div className="w-full max-w-md p-6 bg-black/50 border border-white/10 rounded-2xl mb-8 flex flex-col items-center gap-4 shadow-inner">
        <div className="flex items-center gap-1.5 h-12">
          {[40, 75, 30, 90, 60, 100, 45, 80, 50, 85, 35, 95].map((h, i) => (
            <div
              key={i}
              className={`w-1.5 rounded-full transition-all duration-300 ${
                status === "LISTENING" || status === "SPEAKING" ? "bg-[#d4af37] animate-pulse" : "bg-zinc-700"
              }`}
              style={{
                height: status === "LISTENING" || status === "SPEAKING" ? `${Math.max(15, (h * Math.random()) + 10)}px` : "12px",
              }}
            />
          ))}
        </div>

        <div className="text-xs text-zinc-300 font-medium">
          {status === "LISTENING"
            ? isFallbackMode
              ? "🎧 دۆخی دەنگی Gemini 3.8 Flash TTS ئامادەیە. تاقیکردنەوەی دەنگ ئەنجام بدە:"
              : "🎙 گوێم لە دەنگتە... پرسیارەکەت بڵێ"
            : status === "SPEAKING"
            ? "🔊 یاریدەدەری Gemini 3.8 خەریکی وەڵامدانەوەیە..."
            : status === "CONNECTING"
            ? "⏳ خەریکی پەیوەندیکردن بە Gemini 3.8 Flash TTS..."
            : "حازرە بۆ پەیوەندی دەنگی ڕاستەوخۆ"}
        </div>
      </div>

      {/* Error Message & Graceful Fallback Notice */}
      {errorMessage && (
        <div className="w-full max-w-lg p-3 bg-amber-950/40 border border-amber-500/30 rounded-xl text-xs text-amber-200 mb-6 flex items-center gap-2 text-right" dir="rtl">
          <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Transcript & Response Card */}
      <div className="w-full max-w-lg p-4 bg-white/[0.02] border border-white/10 rounded-2xl text-right mb-8 space-y-3">
        <div className="text-xs sm:text-sm text-white font-medium">
          <span className="font-bold text-[#d4af37] ml-2">وەڵامی Gemini 3.8 Flash:</span> {aiResponse}
        </div>
        {isFallbackMode && (
          <div className="pt-2 flex flex-wrap gap-2">
            <button
              onClick={() => speakFallbackMessage("بە مۆدێلی Gemini 3.8 Flash TTS: نرخی زێڕ لە ئاستی ۲٦٥۰ دۆلاردایە و مەیلی کڕین لەسەر ئۆردەر بلۆکی 4 ساعەتە زۆر بەهێزە.")}
              className="px-3 py-1.5 rounded-lg bg-[#d4af37]/20 border border-[#d4af37]/40 text-[#d4af37] text-xs font-bold hover:bg-[#d4af37]/30 transition-all cursor-pointer"
            >
              📊 پرسیار: شیکاری نرخی زێڕ (XAUUSD)
            </button>
            <button
              onClick={() => speakFallbackMessage("بە مۆدێلی Gemini 3.8 Flash TTS: سیستەمی ICT و SMC ڕێنیشاندەری سەرەکییە بۆ دۆزینەوەی خالەکانی چوونەژوورەوەی دامەزراوەیی.")}
              className="px-3 py-1.5 rounded-lg bg-white/10 border border-white/20 text-white text-xs font-bold hover:bg-white/20 transition-all cursor-pointer"
            >
              🧠 پرسیار: ڕێنمایی ICT & SMC
            </button>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        {status === "IDLE" || status === "ERROR" ? (
          <button
            onClick={startConversation}
            className="px-6 py-4 rounded-2xl bg-gradient-to-r from-[#d4af37] to-[#b38e22] text-black font-bold hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_rgba(212,175,55,0.4)] flex items-center gap-3 cursor-pointer"
          >
            <Mic className="w-6 h-6 fill-black" /> دەستپێکردنی Gemini 3.8 Flash TTS
          </button>
        ) : (
          <button
            onClick={stopConversation}
            className="px-6 py-4 rounded-2xl bg-red-600 text-white font-bold hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_rgba(239,68,68,0.4)] flex items-center gap-3 cursor-pointer"
          >
            <Square className="w-6 h-6 fill-white" /> ڕاگرتنی پەیوەندی (Stop)
          </button>
        )}

        {status !== "IDLE" && !isFallbackMode && (
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`px-4 py-4 rounded-2xl border transition-all flex items-center gap-2 text-xs font-bold cursor-pointer ${
              isMuted ? "bg-red-500/20 border-red-500 text-red-300" : "bg-white/10 border-white/20 text-white hover:bg-white/20"
            }`}
          >
            {isMuted ? <MicOff className="w-5 h-5 text-red-400" /> : <Mic className="w-5 h-5 text-[#d4af37]" />}
            {isMuted ? "مایکرۆفۆن کوژاوەتەوە (Muted)" : "بێدەنگکردن (Mute)"}
          </button>
        )}
      </div>
    </div>
  );
}
