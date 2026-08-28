import { useState } from 'react';
import vaultData from '../../data.json';
import PropertiesPanel from './PropertiesPanel';
import TreeNode from './TreeNode';

export default function FileExplorer() {
  const [selectedItem, setSelectedItem] = useState(null);
  const [breadcrumbPath, setBreadcrumbPath] = useState(['SecureVault']);

  const handleSelectWithBreadcrumb = (node, pathArray) => {
    setSelectedItem(node);
    setBreadcrumbPath(['SecureVault', ...pathArray]);
  };

  return (
    <div className="w-full max-w-4xl bg-slate-900/90 border border-slate-800 rounded-xl shadow-2xl overflow-hidden backdrop-blur-md grid grid-cols-1 md:grid-cols-5 min-h-[580px]">
      <div className="md:col-span-3 flex flex-col border-b md:border-b-0 md:border-r border-slate-800">
        
        <div className="bg-slate-950/70 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-lg">🛡️</span>
            <h2 className="text-emerald-400 font-semibold text-sm tracking-wide">
              SecureVault Explorer
            </h2>
          </div>
          <span className="text-xs text-slate-500 font-mono">v1.0.0</span>
        </div>

        <div className="bg-slate-900/80 px-4 py-2 border-b border-slate-800/80 flex items-center space-x-2 text-xs font-mono text-slate-400 overflow-x-auto">
          <span className="text-slate-600">PATH:</span>
          {breadcrumbPath.map((crumb, index) => (
            <div key={index} className="flex items-center space-x-2 whitespace-nowrap">
              {index > 0 && <span className="text-slate-600">/</span>}
              <span className={index === breadcrumbPath.length - 1 ? 'text-emerald-400 font-medium' : 'text-slate-400'}>
                {crumb}
              </span>
            </div>
          ))}
        </div>

        <div className="p-3 overflow-y-auto flex-1 max-h-[460px]">
          {vaultData.map((rootNode) => (
            <TreeNode
              key={rootNode.id}
              node={rootNode}
              selectedItem={selectedItem}
              onSelect={handleSelectWithBreadcrumb}
              currentPath={[rootNode.name]}
            />
          ))}
        </div>
      </div>

      <div className="md:col-span-2 bg-slate-950/40">
        <PropertiesPanel item={selectedItem} />
      </div>
    </div>
  );
}