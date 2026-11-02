import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, UploadCloud, Music, ListMusic, Trash2 } from 'lucide-react';
import kurdishBg from '../assets/images/kurdish_nature_background_1782770514782.jpg';

interface Track {
  id: string;
  name: string;
  url: string;
}

export const MusicPlayer: React.FC = () => {
  const [playlist, setPlaylist] = useState<Track[]>(() => {
    const saved = localStorage.getItem('dr_devan_playlist');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [];
  });
  
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem('dr_devan_playlist', JSON.stringify(playlist));
    } catch (e) {
      console.warn("Could not save playlist to LocalStorage (possibly exceeded quota).", e);
    }
    
    // Auto-select first track if playlist goes from empty to having items, but index is out of bounds
    if (playlist.length > 0 && currentTrackIndex >= playlist.length) {
      setCurrentTrackIndex(0);
    }
  }, [playlist, currentTrackIndex]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  useEffect(() => {
    if (audioRef.current && isPlaying) {
      audioRef.current.play().catch(() => setIsPlaying(false));
    }
  }, [currentTrackIndex]);

  const currentTrack = playlist[currentTrackIndex];

  const handlePlayPause = () => {
    if (!audioRef.current || !currentTrack) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(e => console.error(e));
    }
    setIsPlaying(!isPlaying);
  };

  const handleNext = () => {
    if (playlist.length === 0) return;
    setCurrentTrackIndex((prev) => (prev + 1) % playlist.length);
    setIsPlaying(true);
  };

  const handlePrev = () => {
    if (playlist.length === 0) return;
    setCurrentTrackIndex((prev) => (prev - 1 + playlist.length) % playlist.length);
    setIsPlaying(true);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setProgress(audioRef.current.currentTime);
      setDuration(audioRef.current.duration || 0);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setProgress(time);
    }
  };

  const handleVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setVolume(val);
    if (val > 0) setIsMuted(false);
  };

  const handleTrackEnd = () => {
    handleNext();
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const processFiles = (files: FileList | null) => {
    if (!files) return;
    
    Array.from(files).forEach((file) => {
      if (file.type.startsWith('audio/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const dataUrl = e.target?.result as string;
          setPlaylist(prev => {
            const newTrack = {
              id: Math.random().toString(36).substring(7),
              name: file.name.replace(/\.[^/.]+$/, ""),
              url: dataUrl
            };
            return [...prev, newTrack];
          });
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    processFiles(e.target.files);
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    processFiles(e.dataTransfer.files);
  };

  const removeTrack = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    const newPlaylist = [...playlist];
    newPlaylist.splice(index, 1);
    
    setPlaylist(newPlaylist);
    
    if (index === currentTrackIndex) {
      setIsPlaying(false);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      if (newPlaylist.length > 0) {
        setCurrentTrackIndex(Math.min(index, newPlaylist.length - 1));
      } else {
        setCurrentTrackIndex(0);
      }
    } else if (index < currentTrackIndex) {
      setCurrentTrackIndex(prev => prev - 1);
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 h-[calc(100vh-180px)] min-h-[500px]">
      
      {/* Player Main Section */}
      <div className="flex-1 flex flex-col bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] relative overflow-hidden group">
        
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none rounded-3xl">
          <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/10 blur-[80px] rounded-full group-hover:bg-emerald-500/20 transition-colors duration-1000"></div>
          <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-teal-500/10 blur-[80px] rounded-full group-hover:bg-teal-500/20 transition-colors duration-1000"></div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center z-10 w-full max-w-md mx-auto">
          {/* Album Art Placeholder */}
          <div 
            className="w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-full border-4 border-white/10 shadow-2xl flex items-center justify-center mb-10 overflow-hidden relative group-hover:border-emerald-500/30 transition-all duration-700 bg-cover bg-center"
            style={{ backgroundImage: `url(${kurdishBg})` }}
          >
            {isPlaying ? (
              <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/40 backdrop-blur-sm">
                <div className="w-2 h-8 bg-emerald-400 rounded-full animate-[bounce_1s_infinite_0.1s]"></div>
                <div className="w-2 h-12 bg-emerald-400 rounded-full animate-[bounce_1s_infinite_0.3s]"></div>
                <div className="w-2 h-6 bg-emerald-400 rounded-full animate-[bounce_1s_infinite_0.5s]"></div>
                <div className="w-2 h-10 bg-emerald-400 rounded-full animate-[bounce_1s_infinite_0.2s]"></div>
              </div>
            ) : (
              <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px] flex items-center justify-center">
                <Music className="w-24 h-24 text-white/50 drop-shadow-lg" />
              </div>
            )}
            {/* Spinning effect when playing */}
            <div className={`absolute inset-0 rounded-full border-[2px] border-dashed border-emerald-500/50 ${isPlaying ? 'animate-[spin_10s_linear_infinite]' : ''}`}></div>
          </div>

          <div className="text-center w-full px-4 mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 truncate">
              {currentTrack ? currentTrack.name : "No Track Selected"}
            </h2>
            <p className="text-emerald-400/80 font-medium">
              {currentTrack ? "Dr.Devan Player" : "Upload music to start"}
            </p>
          </div>

          {/* Progress Bar */}
          <div className="w-full flex items-center gap-3 mb-8">
            <span className="text-xs text-gray-400 font-mono w-10 text-right">{formatTime(progress)}</span>
            <div className="relative flex-1 h-1.5 bg-white/10 rounded-full group/slider cursor-pointer flex items-center">
              <input
                type="range"
                min="0"
                max={duration || 100}
                value={progress}
                onChange={handleSeek}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div 
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                style={{ width: `${duration ? (progress / duration) * 100 : 0}%` }}
              ></div>
              <div 
                className="absolute h-3 w-3 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.8)] opacity-0 group-hover/slider:opacity-100 transition-opacity transform -translate-y-1/2 -translate-x-1/2 pointer-events-none"
                style={{ left: `${duration ? (progress / duration) * 100 : 0}%`, top: '50%' }}
              ></div>
            </div>
            <span className="text-xs text-gray-400 font-mono w-10">{formatTime(duration)}</span>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-8 w-full">
            <button 
              onClick={handlePrev}
              disabled={playlist.length === 0}
              className="text-gray-300 hover:text-white disabled:opacity-30 transition-colors p-2"
            >
              <SkipBack className="w-6 h-6 md:w-8 md:h-8" />
            </button>
            <button 
              onClick={handlePlayPause}
              disabled={!currentTrack}
              className="w-16 h-16 md:w-20 md:h-20 flex items-center justify-center bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full text-white shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] transform hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100"
            >
              {isPlaying ? (
                <Pause className="w-8 h-8 md:w-10 md:h-10 fill-current" />
              ) : (
                <Play className="w-8 h-8 md:w-10 md:h-10 fill-current ml-1" />
              )}
            </button>
            <button 
              onClick={handleNext}
              disabled={playlist.length === 0}
              className="text-gray-300 hover:text-white disabled:opacity-30 transition-colors p-2"
            >
              <SkipForward className="w-6 h-6 md:w-8 md:h-8" />
            </button>
          </div>
          
          {/* Volume */}
          <div className="flex items-center justify-center gap-3 w-full max-w-[200px] mt-8">
            <button onClick={() => setIsMuted(!isMuted)} className="text-gray-400 hover:text-white transition-colors">
              {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
            <div className="relative flex-1 h-1 bg-white/10 rounded-full group/vol flex items-center">
               <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolume}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div 
                  className="absolute top-0 left-0 h-full bg-emerald-400 rounded-full"
                  style={{ width: `${(isMuted ? 0 : volume) * 100}%` }}
                ></div>
            </div>
          </div>

        </div>

        {audioRef && currentTrack && (
          <audio
            ref={audioRef}
            src={currentTrack.url}
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleTrackEnd}
            onLoadedMetadata={handleTimeUpdate}
          />
        )}
      </div>

      {/* Playlist Sidebar */}
      <div className="w-full md:w-80 flex flex-col bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl shadow-xl h-[400px] md:h-auto overflow-hidden">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
            <ListMusic className="w-5 h-5" />
          </div>
          <h3 className="text-xl font-bold text-white tracking-tight">Playlist</h3>
          <span className="ml-auto bg-white/10 px-2 py-1 rounded-md text-xs font-medium text-gray-300">
            {playlist.length} {playlist.length === 1 ? 'Track' : 'Tracks'}
          </span>
        </div>

        {/* Drag & Drop Upload Zone */}
        <label 
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`relative flex items-center justify-center w-full h-24 mb-6 rounded-2xl border-2 border-dashed cursor-pointer transition-all ${
            isDragging ? 'border-emerald-400 bg-emerald-400/10' : 'border-white/20 bg-white/5 hover:border-white/40 hover:bg-white/10'
          }`}
        >
          <div className="flex flex-col items-center gap-1 text-gray-400 pointer-events-none">
            <UploadCloud className={`w-6 h-6 ${isDragging ? 'text-emerald-400' : ''}`} />
            <span className="text-xs font-medium px-2 text-center">Drop MP3 files here or click</span>
          </div>
          <input 
            type="file" 
            accept="audio/*" 
            multiple 
            onChange={handleFileUpload} 
            className="hidden" 
          />
        </label>

        {/* Tracks List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
          {playlist.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 text-sm gap-2">
              <Music className="w-8 h-8 opacity-20" />
              <span>Your playlist is empty</span>
            </div>
          ) : (
            playlist.map((track, index) => (
              <div 
                key={track.id}
                onClick={() => {
                  setCurrentTrackIndex(index);
                  setIsPlaying(true);
                }}
                className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all group ${
                  index === currentTrackIndex 
                    ? 'bg-emerald-500/20 border border-emerald-500/30' 
                    : 'hover:bg-white/10 border border-transparent'
                }`}
              >
                <div className={`w-8 h-8 flex items-center justify-center rounded-lg flex-shrink-0 ${
                  index === currentTrackIndex ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' : 'bg-white/10 text-gray-400 group-hover:bg-white/20 group-hover:text-white'
                }`}>
                  {index === currentTrackIndex && isPlaying ? (
                    <div className="flex gap-0.5 items-end h-3">
                      <div className="w-0.5 bg-white h-full animate-[bounce_0.8s_infinite]"></div>
                      <div className="w-0.5 bg-white h-2/3 animate-[bounce_0.8s_infinite_0.2s]"></div>
                      <div className="w-0.5 bg-white h-1/2 animate-[bounce_0.8s_infinite_0.4s]"></div>
                    </div>
                  ) : (
                    <Play className="w-3.5 h-3.5 ml-0.5" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${index === currentTrackIndex ? 'text-emerald-400' : 'text-gray-200 group-hover:text-white'}`}>
                    {track.name}
                  </p>
                </div>
                <button 
                  onClick={(e) => removeTrack(e, index)}
                  className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all focus:opacity-100"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
