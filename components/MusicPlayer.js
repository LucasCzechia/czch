import { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2 } from 'lucide-react';

export default function MusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(213); // 3:33 in seconds
  const [volume, setVolume] = useState(50);
  const audioRef = useRef(null);

  // Audio player controls
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const handleEnded = () => setIsPlaying(false);
    const handleLoadedMetadata = () => setDuration(audio.duration);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, []);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(console.error);
    }
    setIsPlaying(!isPlaying);
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseInt(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume / 100;
    }
  };

  const handleProgressClick = (e) => {
    const audio = audioRef.current;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newTime = (clickX / rect.width) * duration;
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="mt-6">
      <p className="text-xs text-gray-400 mb-1">
        currently in rotation — a personal collection of music i've been listening to lately
      </p>
      <div className="space-y-2 p-3 music-card">
        <div className="flex items-center gap-2">
          <div className="cursor-pointer">
            <img 
              src="https://i.scdn.co/image/ab67616d0000b273e5a25ed08d1e7e0fdd82ac29" 
              alt="Album Cover" 
              className="w-7 h-7 rounded"
            />
          </div>
          <div className="flex-1 cursor-pointer group">
            <h3 className="text-xs font-medium text-gray-300 group-hover:text-white transition-colors">
              Track from Spotify
            </h3>
            <p className="text-xs text-gray-500 group-hover:text-gray-400 transition-colors">
              Artist Name
            </p>
          </div>
        </div>

        {/* Player Controls */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button className="text-gray-500 hover:text-white transition-colors">
              <SkipBack size={14} />
            </button>
            <button 
              onClick={togglePlay}
              className="text-white hover:text-gray-200 transition-colors"
            >
              {isPlaying ? <Pause size={16} /> : <Play size={16} />}
            </button>
            <button className="text-gray-500 hover:text-white transition-colors">
              <SkipForward size={14} />
            </button>
          </div>

          {/* Volume Control */}
          <div className="flex items-center gap-2">
            <Volume2 size={14} className="text-gray-500" />
            <div className="w-12 h-0.5 bg-gray-800 rounded-full overflow-hidden cursor-pointer relative group">
              <div 
                className="h-full bg-gray-400 rounded-full absolute top-0 left-0 group-hover:bg-white transition-colors"
                style={{ width: `${volume}%` }}
              ></div>
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={handleVolumeChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
            <span className="text-xs text-gray-500 w-6">{volume}%</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="relative">
          <div 
            className="h-0.5 bg-gray-800 rounded-full overflow-hidden cursor-pointer relative group"
            onClick={handleProgressClick}
          >
            <div 
              className="h-full bg-gray-400 rounded-full absolute top-0 left-0 group-hover:bg-white transition-colors"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          <div className="flex justify-between mt-0.5">
            <span className="text-xs text-gray-500">{formatTime(currentTime)}</span>
            <span className="text-xs text-gray-500">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Audio Element */}
        <audio 
          ref={audioRef}
          preload="auto"
          src="/sounds/track.mp3" // Replace with your actual audio file
        />
      </div>
    </div>
  );
}
