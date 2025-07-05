import { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, X, Download, Share2, Check } from 'lucide-react';

const MUSIC_CONFIG = {
  title: 'пачка сигарет - instrumental',
  artist: 'operra, verana',
  audioSrc: '/assets/audio.mp3',
  thumbnailSrc: '/assets/thumbnail.jpg',
  spotifyUrl: 'https://open.spotify.com/track/6pBMgg8fbrhNjUTVWbearS?si=U-G2Lw0PRDeTAzWNAj51Dw',
  defaultVolume: 50
};

export default function MusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(MUSIC_CONFIG.defaultVolume);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showCopiedNotification, setShowCopiedNotification] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const handleEnded = () => setIsPlaying(false);
    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setIsLoaded(true);
    };
    const handleCanPlay = () => setIsLoaded(true);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('canplay', handleCanPlay);

    audio.volume = volume / 100;

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('canplay', handleCanPlay);
    };
  }, [volume]);

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio || !isLoaded) return;

    try {
      if (isPlaying) {
        audio.pause();
      } else {
        await audio.play();
      }
      setIsPlaying(!isPlaying);
    } catch (error) {
      console.error('Error playing audio:', error);
    }
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
    if (!audio || !isLoaded) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newTime = (clickX / rect.width) * duration;
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const skipBackward = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.max(0, audio.currentTime - 10);
  };

  const skipForward = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.min(duration, audio.currentTime + 10);
  };

  const formatTime = (seconds) => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDuration = (seconds) => {
    if (isNaN(seconds)) return '0 seconds';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    if (mins > 0) {
      return `${mins} minute${mins !== 1 ? 's' : ''} ${secs} second${secs !== 1 ? 's' : ''}`;
    }
    return `${secs} second${secs !== 1 ? 's' : ''}`;
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = MUSIC_CONFIG.audioSrc;
    link.download = `${MUSIC_CONFIG.artist} - ${MUSIC_CONFIG.title}.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(MUSIC_CONFIG.spotifyUrl);
      setShowCopiedNotification(true);
      
      setTimeout(() => {
        setShowCopiedNotification(false);
      }, 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <>
      <div className="mt-6">
        <p className="text-xs text-gray-400 mb-1">
          currently in rotation — a personal collection of music i've been listening to lately
        </p>
        <div className="space-y-2 p-3 music-card">
          <div className="flex items-center gap-2" onClick={() => setShowModal(true)}>
            <div className="cursor-pointer">
              <img 
                src={MUSIC_CONFIG.thumbnailSrc}
                alt="Album Cover" 
                className="w-7 h-7 rounded"
                onError={(e) => {
                  e.target.src = 'https://i.scdn.co/image/ab67616d0000b273e5a25ed08d1e7e0fdd82ac29';
                }}
              />
            </div>
            <div className="flex-1 cursor-pointer group">
              <h3 className="text-xs font-medium text-gray-300 group-hover:text-white transition-colors">
                {MUSIC_CONFIG.title}
              </h3>
              <p className="text-xs text-gray-500 group-hover:text-gray-400 transition-colors">
                {MUSIC_CONFIG.artist}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button 
                onClick={skipBackward}
                className="text-gray-500 hover:text-white transition-colors"
                disabled={!isLoaded}
              >
                <SkipBack size={14} />
              </button>
              <button 
                onClick={togglePlay}
                className="text-white hover:text-gray-200 transition-colors disabled:opacity-50"
                disabled={!isLoaded}
              >
                {isPlaying ? <Pause size={16} /> : <Play size={16} />}
              </button>
              <button 
                onClick={skipForward}
                className="text-gray-500 hover:text-white transition-colors"
                disabled={!isLoaded}
              >
                <SkipForward size={14} />
              </button>
            </div>

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

          <audio 
            ref={audioRef}
            preload="metadata"
            src={MUSIC_CONFIG.audioSrc}
          />
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-black/90 border border-zinc-800/30 rounded-lg p-4 max-w-xs w-full relative">
            <button 
              onClick={() => setShowModal(false)}
              className="absolute top-2 right-2 text-gray-400 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
            <div className="flex gap-4 items-start pt-2">
              <div className="cursor-pointer">
                <img 
                  src={MUSIC_CONFIG.thumbnailSrc}
                  alt={MUSIC_CONFIG.title}
                  className="w-14 h-14 rounded"
                  onError={(e) => {
                    e.target.src = 'https://i.scdn.co/image/ab67616d0000b273e5a25ed08d1e7e0fdd82ac29';
                  }}
                />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium">{MUSIC_CONFIG.title}</h3>
                <p className="text-xs text-gray-400">{MUSIC_CONFIG.artist}</p>
                <p className="text-xs text-gray-500 mb-3">{formatDuration(duration)}</p>
                <div className="flex gap-4">
                  <button 
                    onClick={handleDownload}
                    className="text-white hover:text-gray-200 transition-colors" 
                    title="Download"
                  >
                    <Download size={20} />
                  </button>
                  <button 
                    onClick={handleShare}
                    className="text-white hover:text-gray-200 transition-colors" 
                    title="Share"
                  >
                    <Share2 size={20} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showCopiedNotification && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/80 border border-zinc-800/30 rounded-lg px-4 py-2 flex items-center gap-2 z-50 animate-pulse">
          <Check size={16} className="text-green-400" />
          <span className="text-sm">Copied to clipboard</span>
        </div>
      )}
    </>
  );
}
