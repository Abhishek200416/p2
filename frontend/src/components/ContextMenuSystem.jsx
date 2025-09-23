import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Edit3, 
  Type, 
  Palette, 
  Move, 
  Copy, 
  Trash2, 
  Image, 
  Layout, 
  Settings,
  Layers,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  Underline,
  Link,
  RotateCcw,
  Save,
  Eye,
  EyeOff
} from 'lucide-react';

const ContextMenu = ({ 
  isOpen, 
  position, 
  onClose, 
  elementType, 
  elementData,
  onAction,
  isEditMode 
}) => {
  if (!isOpen || !isEditMode) return null;

  const menuItems = [
    {
      category: "Edit",
      items: [
        { icon: Edit3, label: "Edit Content", action: "edit", color: "text-blue-400" },
        { icon: Type, label: "Edit Text", action: "editText", color: "text-green-400" },
        { icon: Palette, label: "Change Style", action: "style", color: "text-purple-400" }
      ]
    },
    {
      category: "Layout",
      items: [
        { icon: Move, label: "Move Element", action: "move", color: "text-yellow-400" },
        { icon: Layout, label: "Change Layout", action: "layout", color: "text-cyan-400" },
        { icon: Layers, label: "Layer Order", action: "layers", color: "text-pink-400" }
      ]
    },
    {
      category: "Actions",
      items: [
        { icon: Copy, label: "Duplicate", action: "duplicate", color: "text-emerald-400" },
        { icon: Settings, label: "Properties", action: "properties", color: "text-orange-400" },
        { icon: Trash2, label: "Delete", action: "delete", color: "text-red-400" }
      ]
    }
  ];

  // Add specific options based on element type
  if (elementType === 'text') {
    menuItems[0].items.push(
      { icon: AlignLeft, label: "Align Left", action: "alignLeft", color: "text-gray-400" },
      { icon: AlignCenter, label: "Align Center", action: "alignCenter", color: "text-gray-400" },
      { icon: AlignRight, label: "Align Right", action: "alignRight", color: "text-gray-400" }
    );
  }

  if (elementType === 'image') {
    menuItems[0].items.splice(1, 0, 
      { icon: Image, label: "Change Image", action: "changeImage", color: "text-indigo-400" }
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: 10 }}
      transition={{ duration: 0.15 }}
      className="fixed z-[9999] min-w-[280px] bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-xl shadow-2xl shadow-black/50 overflow-hidden"
      style={{
        left: position.x,
        top: position.y,
        transform: 'translate(0, -10px)'
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="px-4 py-3 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-cyan-600/20 border-b border-gray-700/50">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium text-gray-200 capitalize">
            {elementType || 'Element'} Options
          </span>
        </div>
      </div>

      {/* Menu Items */}
      <div className="py-2">
        {menuItems.map((category, categoryIndex) => (
          <div key={category.category}>
            {categoryIndex > 0 && (
              <div className="mx-3 my-2 border-t border-gray-700/50"></div>
            )}
            
            <div className="px-3 py-1">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                {category.category}
              </span>
            </div>

            {category.items.map((item) => (
              <motion.button
                key={item.action}
                whileHover={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-blue-500/10 transition-colors duration-150 group"
                onClick={() => {
                  onAction(item.action, elementData);
                  onClose();
                }}
              >
                <item.icon 
                  size={16} 
                  className={`${item.color} group-hover:scale-110 transition-transform duration-150`} 
                />
                <span className="text-gray-200 text-sm font-medium">
                  {item.label}
                </span>
                
                {/* Keyboard shortcut hints */}
                {item.action === 'edit' && (
                  <span className="ml-auto text-xs text-gray-500">E</span>
                )}
                {item.action === 'delete' && (
                  <span className="ml-auto text-xs text-gray-500">Del</span>
                )}
                {item.action === 'duplicate' && (
                  <span className="ml-auto text-xs text-gray-500">Ctrl+D</span>
                )}
              </motion.button>
            ))}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="px-4 py-2 bg-gray-800/50 border-t border-gray-700/50">
        <p className="text-xs text-gray-500 text-center">
          Right-click anywhere to edit • ESC to close
        </p>
      </div>
    </motion.div>
  );
};

const ContextMenuProvider = ({ children, isEditMode, onElementAction }) => {
  const [contextMenu, setContextMenu] = useState({
    isOpen: false,
    position: { x: 0, y: 0 },
    elementType: null,
    elementData: null
  });

  const handleContextMenu = useCallback((e) => {
    if (!isEditMode) return;
    
    e.preventDefault();
    e.stopPropagation();

    // Determine element type and data from target
    const target = e.target;
    const rect = target.getBoundingClientRect();
    
    let elementType = 'element';
    let elementData = {
      element: target,
      tagName: target.tagName.toLowerCase(),
      className: target.className,
      textContent: target.textContent,
      id: target.id
    };

    // Determine specific element type
    if (target.tagName === 'IMG') {
      elementType = 'image';
      elementData.src = target.src;
      elementData.alt = target.alt;
    } else if (['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'P', 'SPAN', 'DIV'].includes(target.tagName)) {
      elementType = 'text';
    } else if (target.tagName === 'BUTTON') {
      elementType = 'button';
    } else if (target.tagName === 'A') {
      elementType = 'link';
      elementData.href = target.href;
    } else if (target.tagName === 'SECTION') {
      elementType = 'section';
    }

    // Check if target is in an editable wrapper
    const editableWrapper = target.closest('[data-editable]');
    if (editableWrapper) {
      elementData.editableType = editableWrapper.dataset.editable;
      elementData.editablePath = editableWrapper.dataset.path;
    }

    const menuX = Math.min(e.clientX, window.innerWidth - 300);
    const menuY = Math.min(e.clientY, window.innerHeight - 400);

    setContextMenu({
      isOpen: true,
      position: { x: menuX, y: menuY },
      elementType,
      elementData
    });
  }, [isEditMode]);

  const closeContextMenu = useCallback(() => {
    setContextMenu(prev => ({ ...prev, isOpen: false }));
  }, []);

  const handleAction = useCallback((action, elementData) => {
    if (onElementAction) {
      onElementAction(action, elementData);
    }
    closeContextMenu();
  }, [onElementAction, closeContextMenu]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isEditMode) return;

      if (e.key === 'Escape') {
        closeContextMenu();
      }
    };

    const handleClick = (e) => {
      if (!e.target.closest('[data-context-menu]')) {
        closeContextMenu();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('click', handleClick);
    document.addEventListener('contextmenu', handleContextMenu);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('click', handleClick);
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [isEditMode, handleContextMenu, closeContextMenu]);

  return (
    <div className="relative w-full h-full">
      {children}
      
      <AnimatePresence>
        <ContextMenu
          isOpen={contextMenu.isOpen}
          position={contextMenu.position}
          onClose={closeContextMenu}
          elementType={contextMenu.elementType}
          elementData={contextMenu.elementData}
          onAction={handleAction}
          isEditMode={isEditMode}
        />
      </AnimatePresence>
    </div>
  );
};

export default ContextMenuProvider;