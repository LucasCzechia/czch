export default function Navbar() {
  return (
    <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-20 w-full max-w-lg px-6">
      <div className="glass-card px-4 py-3 flex justify-between items-center">
        <h1 className="font-proggy text-white text-xl">czch</h1>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-gray-400">online</span>
          </div>
          <div className="w-px h-4 bg-gray-700"></div>
          <button className="text-gray-400 hover:text-white transition-colors text-xs">
            ⚙
          </button>
        </div>
      </div>
    </div>
  );
}
