// Utility functions for Lanyard API

export const fetchLanyardData = async (userId) => {
  try {
    const response = await fetch(`https://api.lanyard.rest/v1/users/${userId}`);
    const data = await response.json();
    return data.success ? data.data : null;
  } catch (error) {
    console.error('Failed to fetch Lanyard data:', error);
    return null;
  }
};

export const getStatusColor = (status) => {
  switch (status) {
    case 'online': return 'bg-green-500';
    case 'idle': return 'bg-yellow-500';
    case 'dnd': return 'bg-red-500';
    default: return 'bg-gray-500';
  }
};

export const getActivityIcon = (activity) => {
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

export const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const formatElapsedTime = (startTime) => {
  const elapsed = Math.floor((Date.now() - startTime) / 1000);
  return formatTime(elapsed);
};

export const getSpotifyProgress = (timestamps) => {
  if (!timestamps?.start || !timestamps?.end) return 0;
  const now = Date.now();
  const total = timestamps.end - timestamps.start;
  const elapsed = now - timestamps.start;
  return Math.min(100, Math.max(0, (elapsed / total) * 100));
};
