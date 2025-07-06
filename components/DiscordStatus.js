import { useState, useEffect } from 'react';

export default function DiscordStatus({ userId }) {
  const [discordData, setDiscordData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const timeInterval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => clearInterval(timeInterval);
  }, []);

  useEffect(() => {
    const fetchDiscordStatus = async () => {
      try {
        const response = await fetch(`https://api.lanyard.rest/v1/users/${userId}`);
        const data = await response.json();
        if (data.success) {
          setDiscordData(prevData => {
            if (JSON.stringify(prevData) !== JSON.stringify(data.data)) {
              return data.data;
            }
            return prevData;
          });
          setHasError(false);
        } else {
          setHasError(true);
        }
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch Discord status:', error);
        setHasError(true);
        setLoading(false);
      }
    };

    fetchDiscordStatus();
    const interval = setInterval(fetchDiscordStatus, 1000);

    return () => clearInterval(interval);
  }, [userId]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'idle': return 'bg-yellow-500';
      case 'dnd': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getActivityIcon = (activity) => {
    if (activity?.name?.toLowerCase().includes('spotify')) {
      return 'https://i.scdn.co/image/ab67616d0000b273e5a25ed08d1e7e0fdd82ac29';
    }
    if (activity?.name?.toLowerCase().includes('roblox')) {
      return 'https://dcdn.dstn.to/app-icons/1005469189907173486';
    }
    if (activity?.name?.toLowerCase().includes('visual studio code')) {
      return 'https://cdn.discordapp.com/app-assets/383226320970055681/1359299282380918886.png';
    }
    if (activity?.application_id && activity?.assets?.large_image) {
      return `https://cdn.discordapp.com/app-assets/${activity.application_id}/${activity.assets.large_image}.png`;
    }
    return null;
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getCustomStatus = () => {
    const customStatus = discordData?.activities?.find(a => a.type === 4)?.state;
    const isOffline = discordData?.discord_status === 'offline' || !discordData?.discord_status;
    
    if (isOffline || !customStatus) {
      return null;
    }
    
    return customStatus;
  };

  if (loading || hasError || !discordData) {
    return (
      <div className="status-card mb-6 p-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-zinc-800 rounded-full animate-pulse"></div>
          <div className="flex flex-col flex-1">
            <div className="w-20 h-3 bg-zinc-800 rounded animate-pulse mb-1"></div>
            <div className="w-32 h-2 bg-zinc-800 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  const customStatus = getCustomStatus();

  return (
    <div className="status-card mb-6 p-2">
      <div className="flex items-center gap-2">
        <div className="relative">
          <div className="relative">
            <img 
              src={discordData?.discord_user?.avatar ? 
                `https://cdn.discordapp.com/avatars/${discordData.discord_user.id}/${discordData.discord_user.avatar}.png` :
                `https://cdn.discordapp.com/embed/avatars/${(parseInt(discordData?.discord_user?.discriminator || '0') % 5)}.png`
              }
              alt="Discord Avatar" 
              className="w-7 h-7 rounded-full"
            />
          </div>
          <div className={`absolute bottom-0 right-0 w-2 h-2 rounded-full border border-zinc-900 ${getStatusColor(discordData?.discord_status)}`}></div>
        </div>
        {customStatus ? (
          <div className="flex flex-col justify-center">
            <a 
              href={`https://discord.com/users/${discordData?.discord_user?.id || userId}`}
              target="_blank" 
              rel="noopener noreferrer" 
              className="group text-xs text-gray-200 w-fit leading-tight"
            >
              <span className="relative">
                {discordData?.discord_user?.username || 'czch'}
                <span className="absolute bottom-0 left-0 w-full h-px bg-gray-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
              </span>
            </a>
            <span className="text-xs text-gray-400 truncate max-w-[180px] leading-tight">
              {customStatus}
            </span>
          </div>
        ) : (
          <a 
            href={`https://discord.com/users/${discordData?.discord_user?.id || userId}`}
            target="_blank" 
            rel="noopener noreferrer" 
            className="group text-xs text-gray-200 w-fit"
          >
            <span className="relative">
              {discordData?.discord_user?.username || 'czch'}
              <span className="absolute bottom-0 left-0 w-full h-px bg-gray-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
            </span>
          </a>
        )}
      </div>

      {(discordData?.listening_to_spotify || discordData?.activities?.filter(activity => activity.type === 0).length > 0) && (
        <div className="mt-2 space-y-2">
          {discordData?.listening_to_spotify && (
            <div className="flex items-center gap-2">
              <div className="relative">
                <img 
                  src={discordData.spotify?.album_art_url || "https://i.scdn.co/image/ab67616d0000b273e5a25ed08d1e7e0fdd82ac29"}
                  alt="Album Art" 
                  className="w-7 h-7 rounded-sm"
                />
              </div>
              <div className="text-xs text-gray-500 flex-1 min-w-0">
                <div className="truncate">
                  <a 
                    href="https://open.spotify.com/track/6pBMgg8fbrhNjUTVWbearS"
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-gray-400 hover:text-green-400 transition-colors"
                  >
                    {discordData.spotify?.song || 'Loading...'}
                  </a> • {discordData.spotify?.artist || 'Artist'}
                </div>
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-[0.7rem] text-gray-500">
                    {formatTime((currentTime - discordData.spotify?.timestamps?.start) / 1000)}
                  </span>
                  <div className="flex-1 bg-gray-800 rounded-full h-1">
                    <div 
                      className="bg-green-500 h-1 rounded-full" 
                      style={{
                        width: `${Math.min(100, Math.max(0, ((currentTime - discordData.spotify?.timestamps?.start) / (discordData.spotify?.timestamps?.end - discordData.spotify?.timestamps?.start)) * 100))}%`
                      }}
                    ></div>
                  </div>
                  <span className="text-[0.7rem] text-gray-500">
                    {formatTime((discordData.spotify?.timestamps?.end - discordData.spotify?.timestamps?.start) / 1000)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {discordData?.activities?.filter(activity => activity.type === 0).map((activity, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className="relative">
                <img 
                  src={getActivityIcon(activity) || `https://cdn.discordapp.com/app-assets/${activity.application_id}/${activity.assets?.large_image}.png`}
                  alt={activity.name}
                  className="w-7 h-7 rounded-sm"
                  onError={(e) => {
                    e.target.src = 'https://cdn.discordapp.com/embed/avatars/0.png';
                  }}
                />
                {activity.assets?.small_image && (
                  <img 
                    src={`https://cdn.discordapp.com/app-assets/${activity.application_id}/${activity.assets.small_image}.png`}
                    alt="Small icon" 
                    className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border border-zinc-900"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                )}
              </div>
              <div className="text-xs text-gray-500 flex-1 min-w-0">
                <div className="truncate">
                  <span className="text-gray-400">{activity.details || activity.name}</span>
                  {activity.state && <span> • {activity.state}</span>}
                </div>
                {activity.timestamps?.start && (
                  <div className="text-gray-500 text-[0.7rem] mt-1">
                    {formatTime((currentTime - activity.timestamps.start) / 1000)} elapsed
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
