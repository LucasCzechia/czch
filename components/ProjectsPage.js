import { ExternalLink } from 'lucide-react';
import MusicPlayer from './MusicPlayer';

export default function ProjectsPage() {
  return (
    <div className="p-4">
      <div className="space-y-3 animate-slide-up">
        <h2 className="text-lg font-semibold mb-3">projects</h2>
        
        <div className="flex items-start gap-3 bg-zinc-900/20 rounded p-3 hover:bg-zinc-900/40 transition-colors">
          <img 
            src="https://cdn.discordapp.com/avatars/1250114494081007697/04cad5a420ee2399dc59235893a7b668.webp?size=1024" 
            alt="BoltBot Logo" 
            className="w-8 h-8 rounded"
          />
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-medium">BoltBot⚡</h3>
                <span className="text-xs bg-neutral-900 text-neutral-300 px-1.5 py-0.5 rounded-full border border-white/10">
                  250k+ users
                </span>
              </div>
              <a 
                href="https://discord.com/oauth2/authorize?client_id=1250114494081007697&permissions=8&scope=bot+applications.commands"
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
            <p className="text-xs text-gray-400">
              Discord chatbot focused on features & intelligence.
            </p>
            <div className="flex gap-1 mt-2">
              <span className="text-xs bg-zinc-800/50 text-gray-300 px-1.5 py-0.5 rounded border border-white/5">
                Node.js
              </span>
              <span className="text-xs bg-zinc-800/50 text-gray-300 px-1.5 py-0.5 rounded border border-white/5">
                NextJS
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <MusicPlayer />
    </div>
  );
}
