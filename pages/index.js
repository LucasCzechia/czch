import { useState } from 'react';
import dynamic from 'next/dynamic';

const ParticleBackground = dynamic(() => import('../components/ParticleBackground'), {
  ssr: false
});

const DiscordStatus = dynamic(() => import('../components/DiscordStatus'), {
  ssr: false
});

const MusicPlayer = dynamic(() => import('../components/MusicPlayer'), {
  ssr: false
});

const ContactPage = dynamic(() => import('../components/ContactPage'), {
  ssr: false
});

export default function Home() {
  const [activeTab, setActiveTab] = useState('home');

  return (
    <div className="h-screen w-screen bg-black text-white relative overflow-hidden flex flex-col items-center justify-center p-6">
      <ParticleBackground />
      
      <div className="fixed top-0 left-0 right-0 z-20 flex justify-between items-center p-4">
        <h1 className="font-proggy text-white text-lg">czch</h1>
        <div className="flex items-center gap-2 text-gray-400 text-xs">
          <span>[_]</span>
          <span>[□]</span>
          <span>[×]</span>
        </div>
      </div>
      
      <div className="w-full max-w-md glass-card overflow-visible relative z-10 mt-16">
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
        
        <div className="p-4" style={{ display: activeTab === 'home' ? 'block' : 'none' }}>
          <div className="mb-6">
            <h1 className="font-proggy mb-0">czch</h1>
            <p className="text-gray-400 text-xs leading-none">
              full stack developer specializing in artifical intelligence
            </p>
          </div>
          <DiscordStatus userId="1146944562951106721" />
          <MusicPlayer />
        </div>
        
        {activeTab === 'projects' && (
          <div className="p-4 animate-slide-up">
            <div className="text-gray-400 text-xs">Projects coming soon...</div>
          </div>
        )}
        
        {activeTab === 'contact' && <ContactPage />}
      </div>
    </div>
  );
}
