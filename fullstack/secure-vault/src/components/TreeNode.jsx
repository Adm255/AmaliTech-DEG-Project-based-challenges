import { useState } from 'react';

export default function TreeNode({ node }) {
  // State to track if this specific folder is open or closed
  const [isOpen, setIsOpen] = useState(false);
  const isFolder = node.type === 'folder';

  // Toggle function for when a user clicks the folder
  const handleToggle = () => {
    if (isFolder) {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div className="pl-4 mt-1 select-none">
      {/* The Row representing the current File or Folder */}
      <div 
        className={`flex items-center space-x-2 p-1.5 rounded-md cursor-pointer transition-colors ${
          isFolder ? 'hover:bg-slate-800' : 'hover:bg-slate-800/50'
        }`}
        onClick={handleToggle}
      >
        {/* Render different icons based on type and open state */}
        <span className="text-lg">
          {isFolder ? (isOpen ? '📂' : '📁') : '📄'}
        </span>
        <span className={`${isFolder ? 'text-slate-200 font-medium' : 'text-slate-400'}`}>
          {node.name}
        </span>
      </div>

      {/* RECURSION HAPPENS HERE: If it's an open folder, map its children and call TreeNode again */}
      {isFolder && isOpen && node.children && (
        <div className="border-l border-slate-700 ml-3">
          {node.children.map((childNode) => (
            <TreeNode key={childNode.id} node={childNode} />
          ))}
        </div>
      )}
    </div>
  );
}