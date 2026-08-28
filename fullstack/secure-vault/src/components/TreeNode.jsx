import { useState } from 'react';

export default function TreeNode({ node, selectedItem, onSelect }) {
  const [isOpen, setIsOpen] = useState(false);
  const isFolder = node.type === 'folder';
  const isSelected = selectedItem?.id === node.id;

  const handleClick = (e) => {
    e.stopPropagation();
    onSelect(node);
    if (isFolder) {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div className="pl-3 mt-0.5 select-none">
      <div
        onClick={handleClick}
        className={`flex items-center space-x-2 px-2.5 py-1.5 rounded-md cursor-pointer transition-all duration-150 text-sm ${
          isSelected
            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
            : 'text-slate-300 hover:bg-slate-800/60'
        }`}
      >
        <span className="text-base">
          {isFolder ? (isOpen ? '📂' : '📁') : '📄'}
        </span>
        <span className={`truncate ${isFolder ? 'font-medium text-slate-100' : 'text-slate-300'}`}>
          {node.name}
        </span>
        {node.size && (
          <span className="ml-auto text-xs text-slate-500 font-mono">
            {node.size}
          </span>
        )}
      </div>

      {isFolder && isOpen && node.children && (
        <div className="border-l border-slate-700/70 ml-3.5 pl-1">
          {node.children.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              selectedItem={selectedItem}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}