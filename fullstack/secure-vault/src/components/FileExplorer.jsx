import vaultData from '../../data.json'; // Importing the JSON directly
import TreeNode from './TreeNode';

export default function FileExplorer() {
  return (
    <div className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-lg shadow-2xl overflow-hidden flex flex-col">
      {/* Dashboard Header */}
      <div className="bg-slate-800 px-4 py-3 border-b border-slate-700 flex items-center justify-between">
        <h2 className="text-emerald-400 font-semibold tracking-wide flex items-center space-x-2">
          <span>🛡️</span>
          <span>SecureVault Explorer</span>
        </h2>
      </div>

      {/* Dashboard Body (The Tree) */}
      <div className="p-4 overflow-y-auto max-h-[600px]">
        {vaultData.map((rootNode) => (
          <TreeNode key={rootNode.id} node={rootNode} />
        ))}
      </div>
    </div>
  );
}