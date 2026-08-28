export default function PropertiesPanel({ item }) {
  if (!item) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500 border-l border-slate-800">
        <span className="text-3xl mb-2">🔍</span>
        <p className="text-sm">Select a file or folder to view its properties</p>
      </div>
    );
  }

  const isFolder = item.type === 'folder';

  return (
    <div className="h-full flex flex-col p-6 bg-slate-900/60 border-l border-slate-800 text-slate-300">
      <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-slate-800">
        <span className="text-3xl">{isFolder ? '📁' : '📄'}</span>
        <div className="overflow-hidden">
          <h3 className="font-semibold text-slate-100 truncate text-base">{item.name}</h3>
          <span className="text-xs uppercase tracking-wider text-emerald-400 font-mono font-semibold">
            {item.type}
          </span>
        </div>
      </div>

      <div className="space-y-4 text-xs">
        <div>
          <span className="text-slate-500 uppercase tracking-wider block mb-1">Item ID</span>
          <p className="font-mono bg-slate-950 p-2 rounded border border-slate-800 text-slate-200 break-all">
            {item.id}
          </p>
        </div>

        <div>
          <span className="text-slate-500 uppercase tracking-wider block mb-1">Size</span>
          <p className="font-mono bg-slate-950 p-2 rounded border border-slate-800 text-slate-200">
            {item.size || (isFolder ? `${item.children?.length || 0} items inside` : 'Unknown')}
          </p>
        </div>

        <div>
          <span className="text-slate-500 uppercase tracking-wider block mb-1">Security Status</span>
          <div className="flex items-center space-x-2 bg-slate-950 p-2 rounded border border-slate-800">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-emerald-400 font-medium font-mono text-xs">Encrypted (AES-256)</span>
          </div>
        </div>
      </div>
    </div>
  );
}