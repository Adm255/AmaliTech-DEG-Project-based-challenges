import { useMemo, useState } from 'react';
import vaultData from '../../data.json';
import PropertiesPanel from './PropertiesPanel';
import TreeNode from './TreeNode';

function filterTree(nodes, query) {
  if (!query.trim()) {
    return nodes;
  }

  const normalizedQuery = query.toLowerCase().trim();

  return nodes
    .map((node) => {
      const nodeMatches = node.name.toLowerCase().includes(normalizedQuery);

      if (node.type === 'folder' && node.children) {
        const filteredChildren = filterTree(node.children, query);

        if (nodeMatches || filteredChildren.length > 0) {
          return {
            ...node,
            children: filteredChildren,
          };
        }

        return null;
      }

      return nodeMatches ? node : null;
    })
    .filter(Boolean);
}

export default function FileExplorer() {
  const [selectedItem, setSelectedItem] = useState(null);
  const [breadcrumbPath, setBreadcrumbPath] = useState(['SecureVault']);
  const [activeId, setActiveId] = useState(vaultData[0]?.id ?? null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredData = useMemo(
    () => filterTree(vaultData, searchQuery),
    [searchQuery]
  );

  const handleSelectWithBreadcrumb = (node, pathArray) => {
    setSelectedItem(node);
    setBreadcrumbPath(['SecureVault', ...pathArray]);
  };

  return (
    <div className="w-full max-w-4xl bg-slate-900/90 border border-slate-800 rounded-xl shadow-2xl overflow-hidden backdrop-blur-md grid grid-cols-1 md:grid-cols-5 min-h-145">
      <div className="md:col-span-3 flex flex-col border-b md:border-b-0 md:border-r border-slate-800">

        <div className="bg-slate-950/70 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-lg">🛡️</span>
            <h2 className="text-emerald-400 font-semibold text-sm tracking-wide">
              SecureVault Explorer
            </h2>
          </div>

          <span className="text-xs text-slate-500 font-mono">
            v1.0.0
          </span>
        </div>

        <div className="bg-slate-900/80 px-4 py-2 border-b border-slate-800/80 flex items-center space-x-2 text-xs font-mono text-slate-400 overflow-x-auto">
          <span className="text-slate-600">PATH:</span>

          {breadcrumbPath.map((crumb, index) => (
            <div
              key={index}
              className="flex items-center space-x-2 whitespace-nowrap"
            >
              {index > 0 && (
                <span className="text-slate-600">/</span>
              )}

              <span
                className={
                  index === breadcrumbPath.length - 1
                    ? 'text-emerald-400 font-medium'
                    : 'text-slate-400'
                }
              >
                {crumb}
              </span>
            </div>
          ))}
        </div>

        <div className="px-4 py-3 border-b border-slate-800 bg-slate-950/30">
          <label
            htmlFor="vault-search"
            className="sr-only"
          >
            Search files and folders
          </label>

          <input
            id="vault-search"
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search files and folders..."
            className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-200 placeholder-slate-500 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30"
          />
        </div>

        <div
          className="p-3 overflow-y-auto flex-1 max-h-115"
          role="tree"
          aria-label="SecureVault file explorer"
        >
          {filteredData.length > 0 ? (
            filteredData.map((rootNode) => (
             <TreeNode
  key={rootNode.id}
  node={rootNode}
  selectedItem={selectedItem}
  onSelect={handleSelectWithBreadcrumb}
  currentPath={[rootNode.name]}
  level={1}
  activeId={activeId}
  setActiveId={setActiveId}
  searchQuery={searchQuery}
/>
            ))
          ) : (
            <div className="p-6 text-center text-sm text-slate-500">
              No matching files or folders found.
            </div>
          )}
        </div>
      </div>

      <div className="md:col-span-2 bg-slate-950/40">
        <PropertiesPanel item={selectedItem} />
      </div>
    </div>
  );
}