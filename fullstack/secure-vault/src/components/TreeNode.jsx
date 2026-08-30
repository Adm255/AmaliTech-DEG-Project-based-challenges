import { useState } from 'react';

export default function TreeNode({
  node,
  selectedItem,
  onSelect,
  currentPath = [],
  level = 1,
  activeId,
  setActiveId,
  searchQuery = '',
}) {
  const [isOpen, setIsOpen] = useState(false);

  const isFolder = node.type === 'folder';
  const isSelected = selectedItem?.id === node.id;
  const isActive = activeId === node.id;
  const hasSearchQuery = searchQuery.trim().length > 0;

  const handleClick = (e) => {
    if (e) e.stopPropagation();

    onSelect(node, currentPath);
    setActiveId?.(node.id);

    if (isFolder) {
      setIsOpen(!isOpen);
    }
  };

  const handleKeyDown = (e) => {
    if (
      [
        'ArrowUp',
        'ArrowDown',
        'ArrowLeft',
        'ArrowRight',
        'Enter',
        ' ',
      ].includes(e.key)
    ) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (e.key === 'Enter' || e.key === ' ') {
      handleClick();
    } else if (
      e.key === 'ArrowRight' &&
      isFolder &&
      !isOpen
    ) {
      setIsOpen(true);
    } else if (
      e.key === 'ArrowLeft' &&
      isFolder &&
      isOpen
    ) {
      setIsOpen(false);
    } else if (
      e.key === 'ArrowDown' ||
      e.key === 'ArrowUp'
    ) {
      const focusableNodes = Array.from(
        document.querySelectorAll('.tree-node-focusable')
      );

      const currentIndex =
        focusableNodes.indexOf(document.activeElement);

      if (currentIndex !== -1) {
        const nextIndex =
          e.key === 'ArrowDown'
            ? currentIndex + 1
            : currentIndex - 1;

        const nextNode = focusableNodes[nextIndex];

        if (nextNode) {
          nextNode.focus();
          setActiveId?.(nextNode.dataset.nodeId);
        }
      }
    }
  };

  return (
    <div className="pl-3 mt-0.5 select-none">
      <div
        role="treeitem"
        aria-selected={isSelected}
        aria-expanded={isFolder ? isOpen || hasSearchQuery : undefined}
        aria-level={level}
        data-node-id={node.id}
        tabIndex={isActive ? 0 : -1}
        onClick={handleClick}
        onFocus={() => setActiveId?.(node.id)}
        onKeyDown={handleKeyDown}
        className={`tree-node-focusable flex items-center space-x-2 px-2.5 py-1.5 rounded-md cursor-pointer transition-all duration-150 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1 focus:ring-offset-slate-900 ${
          isSelected
            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
            : 'text-slate-300 hover:bg-slate-800/60'
        }`}
      >
        <span className="text-base">
          {isFolder
            ? isOpen || hasSearchQuery
              ? '📂'
              : '📁'
            : '📄'}
        </span>

        <span
          className={`truncate ${
            isFolder
              ? 'font-medium text-slate-100'
              : 'text-slate-300'
          }`}
        >
          {node.name}
        </span>

        {node.size && (
          <span className="ml-auto text-xs text-slate-500 font-mono">
            {node.size}
          </span>
        )}
      </div>

      {isFolder &&
        (isOpen || hasSearchQuery) &&
        node.children && (
          <div
            role="group"
            className="border-l border-slate-700/70 ml-3.5 pl-1"
          >
            {node.children.map((child) => (
              <TreeNode
                key={child.id}
                node={child}
                selectedItem={selectedItem}
                onSelect={onSelect}
                currentPath={[
                  ...currentPath,
                  child.name,
                ]}
                level={level + 1}
                activeId={activeId}
                setActiveId={setActiveId}
                searchQuery={searchQuery}
              />
            ))}
          </div>
        )}
    </div>
  );
}