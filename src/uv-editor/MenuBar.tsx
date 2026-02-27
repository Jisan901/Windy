export function MenuBar() {
  return (
    <div className="h-7 bg-[#1c1c1c] border-b border-[#111] flex items-center px-4 text-[11px] text-[#b3b3b3] select-none shrink-0 z-50 relative">
      <div className="flex gap-4">
        <span className="hover:text-white cursor-pointer transition-colors">File</span>
        <span className="hover:text-white cursor-pointer transition-colors">Edit</span>
        <span className="hover:text-white cursor-pointer transition-colors">View</span>
        <span className="hover:text-white cursor-pointer transition-colors">UV</span>
        <span className="hover:text-white cursor-pointer transition-colors">Help</span>
      </div>
    </div>
  );
}
