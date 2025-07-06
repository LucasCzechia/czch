import { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, X, Download, Share2, Check } from 'lucide-react';

const PLAYLIST = [
  {
    title: 'пачка сигарет - instrumental',
    artist: 'operra, verana',
    folder: 'pachka-sigaret',
    spotifyUrl: 'https://open.spotify.com/track/6pBMgg8fbrhNjUTVWbearS?si=U-G2Lw0PRDeTAzWNAj51Dw'
  }
];

export default function MusicPlayer() {
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(50);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showCopiedNotification, setShowCopiedNotification] = useState(false);
  const [copiedAnimatingOut, setCopiedAnimatingOut] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const audioRef = useRef(null);

  const currentSong = PLAYLIST[currentSongIndex];
  const audioSrc = `/assets/audio/${currentSong.folder}/${currentSong.folder}.mp3`;
  const thumbnailSrc = `/assets/audio/${currentSong.folder}/thumbnail.png`;

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const handleEnded = () => {
      setIsPlaying(false);
      playNextSong();
    };
    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setIsLoaded(true);
      setLoadError(false);
    };
    const handleCanPlay = () => {
      setIsLoaded(true);
      setLoadError(false);
    };
    const handleError = () => {
      setLoadError(true);
      setIsLoaded(false);
    };
    const handleLoadStart = () => {
      setIsLoaded(false);
      setLoadError(false);
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('error', handleError);
    audio.addEventListener('loadstart', handleLoadStart);

    audio.volume = volume / 100;
    audio.load();

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('loadstart', handleLoadStart);
    };
  }, [volume, currentSongIndex]);

  const playNextSong = () => {
    const nextIndex = (currentSongIndex + 1) % PLAYLIST.length;
    setCurrentSongIndex(nextIndex);
    setCurrentTime(0);
  };

  const playPrevSong = () => {
    if (currentTime > 3) {
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
    } else {
      const prevIndex = currentSongIndex === 0 ? PLAYLIST.length - 1 : currentSongIndex - 1;
      setCurrentSongIndex(prevIndex);
      setCurrentTime(0);
    }
  };

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio || !isLoaded || loadError) return;

    try {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        await audio.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Error playing audio:', error);
      setLoadError(true);
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
    if (!audio || !isLoaded || loadError) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newTime = (clickX / rect.width) * duration;
    audio.currentTime = newTime;
    setCurrentTime(newTime);
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
    link.href = audioSrc;
    link.download = `${currentSong.artist} - ${currentSong.title}.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(currentSong.spotifyUrl);
      setShowCopiedNotification(true);
      setCopiedAnimatingOut(false);
      
      setTimeout(() => {
        setCopiedAnimatingOut(true);
        setTimeout(() => {
          setShowCopiedNotification(false);
          setCopiedAnimatingOut(false);
        }, 300);
      }, 1700);
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
                src={thumbnailSrc}
                alt="Album Cover" 
                className="w-7 h-7 rounded"
                onError={(e) => {
                  e.target.src = 'https://i.scdn.co/image/ab67616d0000b273e5a25ed08d1e7e0fdd82ac29';
                }}
              />
            </div>
            <div className="flex-1 cursor-pointer group">
              <h3 className="text-xs font-medium text-gray-300 group-hover:text-white transition-colors">
                {currentSong.title}
              </h3>
              <p className="text-xs text-gray-500 group-hover:text-gray-400 transition-colors">
                {currentSong.artist}
              </p>
            </div>
            {PLAYLIST.length > 1 && (
              <div className="text-xs text-gray-500">
                {currentSongIndex + 1}/{PLAYLIST.length}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button 
                onClick={playPrevSong}
                className="text-gray-500 hover:text-white transition-colors"
                disabled={loadError}
              >
                <SkipBack size={14} />
              </button>
              <button 
                onClick={togglePlay}
                className="text-white hover:text-gray-200 transition-colors disabled:opacity-50"
                disabled={!isLoaded || loadError}
              >
                {isPlaying ? <Pause size={16} /> : <Play size={16} />}
              </button>
              <button 
                onClick={playNextSong}
                className="text-gray-500 hover:text-white transition-colors"
                disabled={loadError}
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
            {loadError && (
              <div className="text-xs text-red-400 mt-1">Failed to load audio</div>
            )}
          </div>

          <audio 
            ref={audioRef}
            preload="metadata"
            src={audioSrc}
          />
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-black/90 border border-zinc-800/30 rounded-lg p-4 max-w-xs w-full relative overflow-visible">
            <button 
              onClick={() => setShowModal(false)}
              className="absolute top-2 right-2 text-gray-400 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
            <div className="flex gap-4 items-start pt-2">
              <div className="cursor-pointer">
                <img 
                  src={thumbnailSrc}
                  alt={currentSong.title}
                  className="w-14 h-14 rounded"
                  onError={(e) => {
                    e.target.src = 'https://i.scdn.co/image/ab67616d0000b273e5a25ed08d1e7e0fdd82ac29';
                  }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium">{currentSong.title}</h3>
                <p className="text-xs text-gray-400">{currentSong.artist}</p>
                <p className="text-xs text-gray-500 mb-3">{formatDuration(duration)}</p>
                <div className="flex gap-4 items-center relative">
                  <button 
                    onClick={handleDownload}
                    className="text-white hover:text-gray-200 transition-colors" 
                    title="Download"
                  >
                    <Download size={20} />
                  </button>
                  <div className="relative">
                    <button 
                      onClick={handleShare}
                      className="text-white hover:text-gray-200 transition-colors" 
                      title="Share"
                    >
                      <Share2 size={20} />
                    </button>
                    {showCopiedNotification && (
                      <div className={`absolute left-full top-1/2 ml-2 transform -translate-y-1/2 bg-black/80 border border-zinc-800/30 rounded-lg px-3 py-1 flex items-center gap-2 whitespace-nowrap z-10 ${copiedAnimatingOut ? 'animate-slide-down' : 'animate-bounce-slide'}`}>
                        <Check size={14} className="text-green-400" />
                        <span className="text-xs">Copied!</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {PLAYLIST.length > 1 && (
              <div className="mt-4 pt-3 border-t border-zinc-800/30">
                <div className="text-xs text-gray-400 mb-2">Playlist ({PLAYLIST.length} songs)</div>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {PLAYLIST.map((song, index) => (
                    <div 
                      key={index}
                      className={`flex items-center gap-2 p-1 rounded text-xs cursor-pointer transition-colors ${
                        index === currentSongIndex 
                          ? 'bg-zinc-800/50 text-white' 
                          : 'text-gray-400 hover:text-white hover:bg-zinc-800/30'
                      }`}
                      onClick={() => {
                        setCurrentSongIndex(index);
                        setCurrentTime(0);
                      }}
                    >
                      <span className="w-4 text-center">{index + 1}</span>
                      <div className="flex-1 truncate">
                        <div className="truncate">{song.title}</div>
                        <div className="truncate text-gray-500">{song.artist}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
