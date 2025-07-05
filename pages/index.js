import { useState } from 'react';
import ParticleBackground from '../components/ParticleBackground';
import DiscordStatus from '../components/DiscordStatus';
import MusicPlayer from '../components/MusicPlayer';

export default function Home() {
  const [activeTab, setActiveTab] = useState('home');

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden flex items-center justify-center p-6">
      <ParticleBackground />
      
      <div className="w-full max-w-md bg-black/30 backdrop-blur-sm rounded-xl border border-zinc-800/30 overflow-visible relative z-10">
        {/* Header Navigation */}
        <div className="flex justify-between p-2 border-b border-zinc-800/30">
          <div className="flex gap-1">
            <button 
              className={`px-3 py-1 text-xs transition-colors ${activeTab === 'home' ? 'text-white' : 'text-gray-500'}`}
              onClick={() => setActiveTab('home')}
            >
              home
            </button>
            <button 
              className={`px-3 py-1 text-xs transition-colors ${activeTab === 'projects' ? 'text-white' : 'text-gray-500'}`}
              onClick={() => setActiveTab('projects')}
            >
              projects
            </button>
            <button 
              className={`px-3 py-1 text-xs transition-colors ${activeTab === 'contact' ? 'text-white' : 'text-gray-500'}`}
              onClick={() => setActiveTab('contact')}
            >
              contact
            </button>
          </div>
          <button className="px-2 text-xs text-gray-400 hover:text-white transition-colors">
            [?]
          </button>
        </div>

        <div className="p-4">
          {/* Main Header */}
          <div className="mb-6">
            <h1 className="text-5xl mb-0 font-mono leading-none">czch</h1>
            <p className="text-gray-400 text-xs leading-none">
              full stack developer specializing in modern web technologies
            </p>
          </div>

          {/* Discord Status Section */}
          <DiscordStatus userId="1146944562951106721" />

          {/* Music Player Section */}
          <MusicPlayer />
        </div>
      </div>
    </div>
  );
}
