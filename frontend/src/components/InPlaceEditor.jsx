import React, { useState, useRef, useEffect } from 'react';
import { 
  Edit3, 
  Save, 
  X, 
  Type, 
  Image as ImageIcon, 
  Palette, 
  Move, 
  Settings,
  Sparkles,
  RotateCcw,
  Trash2,
  Plus,
  Copy,
  Eye,
  EyeOff
} from 'lucide-react';

const InPlaceEditor = ({ 
  isEditMode, 
  content, 
  setContent, 
  onSave, 
  onExit,
  onAICommand 
}) => {
  const [selectedElement, setSelectedElement] = useState(null);
  const [contextMenu, setContextMenu] = useState({ show: false, x: 0, y: 0, element: null });
  const [editingText, setEditingText] = useState({ active: false, element: null, value: '' });
  const [draggedElement, setDraggedElement] = useState(null);
  const [aiCommand, setAiCommand] = useState('');
  const [isAIProcessing, setIsAIProcessing] = useState(false);

  // Live editing overlay for any element
  const handleElementClick = (e, elementPath, elementType) => {
    if (!isEditMode) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    setSelectedElement({
      path: elementPath,
      type: elementType,
      element: e.target,
      rect: e.target.getBoundingClientRect()
    });
  };

  // Right-click context menu
  const handleRightClick = (e, elementPath, elementType) => {
    if (!isEditMode) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    setContextMenu({
      show: true,
      x: e.clientX,
      y: e.clientY,
      element: { path: elementPath, type: elementType, target: e.target }
    });
  };

  // Start text editing
  const startTextEdit = (element) => {
    const currentValue = element.target.textContent || element.target.value || '';
    setEditingText({
      active: true,
      element: element,
      value: currentValue
    });
    setContextMenu({ show: false, x: 0, y: 0, element: null });
  };

  // Save text edit with live update
  const saveTextEdit = () => {
    if (editingText.element) {
      // Update the actual DOM element immediately for live preview
      if (editingText.element.target.tagName === 'INPUT' || editingText.element.target.tagName === 'TEXTAREA') {
        editingText.element.target.value = editingText.value;
      } else {
        editingText.element.target.textContent = editingText.value;
      }

      // Update the content state
      updateContentByPath(editingText.element.path, editingText.value);
      
      setEditingText({ active: false, element: null, value: '' });
    }
  };

  // Update content by path (helper function)
  const updateContentByPath = (path, value) => {
    const pathArray = path.split('.');
    setContent(prev => {
      const updated = { ...prev };
      let current = updated;
      
      for (let i = 0; i < pathArray.length - 1; i++) {
        if (!current[pathArray[i]]) current[pathArray[i]] = {};
        current = current[pathArray[i]];
      }
      
      current[pathArray[pathArray.length - 1]] = value;
      return updated;
    });
  };

  // Handle image upload with live preview
  const handleImageUpload = (element, file) => {
    if (file && file.type.startsWith('image/')) {
      const imageUrl = URL.createObjectURL(file);
      
      // Update DOM immediately
      if (element.target.tagName === 'IMG') {
        element.target.src = imageUrl;
      } else {
        element.target.style.backgroundImage = `url(${imageUrl})`;
      }
      
      // Update content state
      updateContentByPath(element.path, imageUrl);
    }
  };

  // Handle color change with live preview
  const handleColorChange = (element, color) => {
    // Apply color immediately to DOM
    if (element.target.tagName === 'BUTTON' || element.target.classList.contains('cta-primary')) {
      element.target.style.backgroundColor = color;
    } else {
      element.target.style.color = color;
    }
    
    // Update CSS variables if it's a theme color
    if (element.path.includes('theme')) {
      const colorVar = `--${element.path.split('.').pop()}`;
      document.documentElement.style.setProperty(colorVar, color);
    }
  };

  // AI Command Processing
  const handleAICommand = async () => {
    if (!aiCommand.trim()) return;
    
    setIsAIProcessing(true);
    try {
      await onAICommand(aiCommand);
      setAiCommand('');
    } catch (error) {
      console.error('AI command failed:', error);
    } finally {
      setIsAIProcessing(false);
    }
  };

  // Drag and drop for moving elements
  const handleDragStart = (e, element) => {
    setDraggedElement(element);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, targetElement) => {
    e.preventDefault();
    if (draggedElement && targetElement && draggedElement !== targetElement) {
      // Implement element reordering logic
      console.log('Moving element:', draggedElement, 'to:', targetElement);
    }
    setDraggedElement(null);
  };

  // Close context menu on outside click
  useEffect(() => {
    const handleClickOutside = () => {
      setContextMenu({ show: false, x: 0, y: 0, element: null });
      setSelectedElement(null);
    };

    if (contextMenu.show || selectedElement) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [contextMenu.show, selectedElement]);

  if (!isEditMode) return null;

  return (
    <>
      {/* Advanced Edit Toolbar */}
      <div className="fixed top-4 left-4 z-50 flex items-center space-x-2 bg-gray-900/95 backdrop-blur-xl border border-gray-700 rounded-xl p-3 shadow-2xl">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium text-white">Live Edit Mode</span>
        </div>
        
        <div className="w-px h-6 bg-gray-600"></div>
        
        <button
          onClick={onSave}
          className="flex items-center px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <Save className="w-4 h-4 mr-1" />
          Save
        </button>
        
        <button
          onClick={onExit}
          className="flex items-center px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <X className="w-4 h-4 mr-1" />
          Exit
        </button>
      </div>

      {/* AI Command Interface */}
      <div className="fixed bottom-4 left-4 right-4 z-50 max-w-md mx-auto">
        <div className="bg-gray-900/95 backdrop-blur-xl border border-gray-700 rounded-xl p-4 shadow-2xl">
          <div className="flex items-center mb-3">
            <Sparkles className="w-5 h-5 text-purple-400 mr-2" />
            <span className="text-sm font-medium text-white">AI Assistant</span>
          </div>
          
          <div className="flex space-x-2">
            <input
              type="text"
              value={aiCommand}
              onChange={(e) => setAiCommand(e.target.value)}
              placeholder="Tell AI what to change... (e.g., 'make the hero section more modern' or 'change colors to purple theme')"
              className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm placeholder-gray-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
              onKeyPress={(e) => e.key === 'Enter' && handleAICommand()}
              disabled={isAIProcessing}
            />
            <button
              onClick={handleAICommand}
              disabled={isAIProcessing || !aiCommand.trim()}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              {isAIProcessing ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
            </button>
          </div>
          
          <div className="mt-2 text-xs text-gray-400">
            Try: "Change hero background to gradient", "Make buttons more rounded", "Add more spacing between sections"
          </div>
        </div>
      </div>

      {/* Context Menu */}
      {contextMenu.show && (
        <div
          className="fixed z-50 bg-gray-900 border border-gray-700 rounded-lg shadow-2xl py-2 min-w-48"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          <button
            onClick={() => startTextEdit(contextMenu.element)}
            className="w-full px-4 py-2 text-left text-sm text-white hover:bg-gray-800 flex items-center"
          >
            <Type className="w-4 h-4 mr-3" />
            Edit Text
          </button>
          
          <button
            onClick={() => {
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = 'image/*';
              input.onchange = (e) => handleImageUpload(contextMenu.element, e.target.files[0]);
              input.click();
            }}
            className="w-full px-4 py-2 text-left text-sm text-white hover:bg-gray-800 flex items-center"
          >
            <ImageIcon className="w-4 h-4 mr-3" />
            Change Image
          </button>
          
          <button
            onClick={() => {
              const input = document.createElement('input');
              input.type = 'color';
              input.onchange = (e) => handleColorChange(contextMenu.element, e.target.value);
              input.click();
            }}
            className="w-full px-4 py-2 text-left text-sm text-white hover:bg-gray-800 flex items-center"
          >
            <Palette className="w-4 h-4 mr-3" />
            Change Color
          </button>
          
          <button
            onClick={() => {
              contextMenu.element.target.draggable = true;
              setContextMenu({ show: false, x: 0, y: 0, element: null });
            }}
            className="w-full px-4 py-2 text-left text-sm text-white hover:bg-gray-800 flex items-center"
          >
            <Move className="w-4 h-4 mr-3" />
            Move Element
          </button>
          
          <div className="border-t border-gray-700 my-1"></div>
          
          <button
            onClick={() => {
              if (confirm('Delete this element?')) {
                contextMenu.element.target.style.display = 'none';
              }
              setContextMenu({ show: false, x: 0, y: 0, element: null });
            }}
            className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-gray-800 flex items-center"
          >
            <Trash2 className="w-4 h-4 mr-3" />
            Hide Element
          </button>
        </div>
      )}

      {/* Text Edit Modal */}
      {editingText.active && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-lg">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Type className="w-5 h-5 mr-2" />
              Edit Text
            </h3>
            
            <textarea
              value={editingText.value}
              onChange={(e) => setEditingText({ ...editingText, value: e.target.value })}
              className="w-full h-32 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white resize-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              autoFocus
            />
            
            <div className="flex justify-end space-x-3 mt-4">
              <button
                onClick={() => setEditingText({ active: false, element: null, value: '' })}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveTextEdit}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Selection Overlay */}
      {selectedElement && (
        <div
          className="fixed border-2 border-blue-500 bg-blue-500/10 pointer-events-none z-40 rounded"
          style={{
            left: selectedElement.rect.left,
            top: selectedElement.rect.top,
            width: selectedElement.rect.width,
            height: selectedElement.rect.height,
          }}
        >
          <div className="absolute -top-8 left-0 bg-blue-500 text-white px-2 py-1 rounded text-xs font-medium">
            {selectedElement.type} - Click to edit
          </div>
        </div>
      )}

      {/* Editing Instructions Overlay */}
      <div className="fixed top-20 right-4 z-40 bg-gray-900/95 backdrop-blur-xl border border-gray-700 rounded-xl p-4 max-w-xs text-sm text-gray-300">
        <h4 className="font-semibold text-white mb-2 flex items-center">
          <Settings className="w-4 h-4 mr-2" />
          Live Edit Guide
        </h4>
        <ul className="space-y-1 text-xs">
          <li>• <strong>Left-click</strong> any element to select</li>
          <li>• <strong>Right-click</strong> for quick edit menu</li>
          <li>• <strong>Drag</strong> to move elements around</li>
          <li>• Use <strong>AI commands</strong> for smart editing</li>
          <li>• Changes preview <strong>instantly</strong></li>
        </ul>
      </div>
    </>
  );
};

// HOC to make any element editable
export const makeEditable = (Component, elementPath, elementType) => {
  return React.forwardRef((props, ref) => {
    const { isEditMode, onElementClick, onElementRightClick, ...otherProps } = props;
    
    if (!isEditMode) {
      return <Component ref={ref} {...otherProps} />;
    }

    return (
      <Component
        ref={ref}
        {...otherProps}
        onClick={(e) => {
          if (onElementClick) onElementClick(e, elementPath, elementType);
          if (otherProps.onClick) otherProps.onClick(e);
        }}
        onContextMenu={(e) => {
          if (onElementRightClick) onElementRightClick(e, elementPath, elementType);
          if (otherProps.onContextMenu) otherProps.onContextMenu(e);
        }}
        style={{
          ...otherProps.style,
          cursor: isEditMode ? 'pointer' : otherProps.style?.cursor,
          position: 'relative',
        }}
        className={`${otherProps.className || ''} ${isEditMode ? 'editable-element' : ''}`}
      />
    );
  });
};

export default InPlaceEditor;