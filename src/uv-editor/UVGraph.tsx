export function UVGraph() {
  return (
    <div className="w-full h-full bg-[#1a1a1a] relative overflow-hidden flex items-center justify-center">
      {/* Grid background */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: 'linear-gradient(#444 1px, transparent 1px), linear-gradient(90deg, #444 1px, transparent 1px)',
          backgroundSize: '20px 20px',
          backgroundPosition: 'center center'
        }}
      />
      
      {/* UV Canvas Area */}
      <div className="relative z-10 w-64 h-64 border-2 border-[#555] bg-[#222] flex items-center justify-center shadow-lg">
        <div className="w-full h-full relative">
          {/* Placeholder UV island */}
          <svg className="w-full h-full overflow-visible" viewBox="0 0 100 100">
            {/* Grid inside UV space */}
            <g opacity="0.1">
              <line x1="25" y1="0" x2="25" y2="100" stroke="#fff" strokeWidth="0.5" />
              <line x1="50" y1="0" x2="50" y2="100" stroke="#fff" strokeWidth="0.5" />
              <line x1="75" y1="0" x2="75" y2="100" stroke="#fff" strokeWidth="0.5" />
              <line x1="0" y1="25" x2="100" y2="25" stroke="#fff" strokeWidth="0.5" />
              <line x1="0" y1="50" x2="100" y2="50" stroke="#fff" strokeWidth="0.5" />
              <line x1="0" y1="75" x2="100" y2="75" stroke="#fff" strokeWidth="0.5" />
            </g>
            
            {/* UV Face */}
            <polygon points="10,10 90,10 90,90 10,90" fill="rgba(68, 170, 136, 0.2)" stroke="#44aa88" strokeWidth="1" />
            
            {/* UV Vertices */}
            <circle cx="10" cy="10" r="2" fill="#fff" className="cursor-pointer hover:fill-[#44aa88] transition-colors" />
            <circle cx="90" cy="10" r="2" fill="#fff" className="cursor-pointer hover:fill-[#44aa88] transition-colors" />
            <circle cx="90" cy="90" r="2" fill="#fff" className="cursor-pointer hover:fill-[#44aa88] transition-colors" />
            <circle cx="10" cy="90" r="2" fill="#fff" className="cursor-pointer hover:fill-[#44aa88] transition-colors" />
          </svg>
        </div>
      </div>
      
      {/* Overlay Info */}
      <div className="absolute bottom-4 left-4 text-[10px] text-[#888] font-mono select-none">
        UV Space (0,1)
      </div>
    </div>
  );
}
