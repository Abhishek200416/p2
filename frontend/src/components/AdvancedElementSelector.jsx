import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MousePointer, 
  Move, 
  Copy, 
  Trash2, 
  Edit3, 
  Eye, 
  EyeOff,
  RotateCw,
  Resize,
  Target,
  Layers,
  Settings
} from 'lucide-react';

const AdvancedElementSelector = ({ 
  isEditMode, 
  selectedElement, 
  onElementSelect, 
  onElementUpdate,
  isAuthenticated = false 
}) => {
  const [hoverElement, setHoverElement] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isResizing, setIsResizing] = useState(false);
  const [showElementInfo, setShowElementInfo] = useState(true);

  // Enhanced element detection and highlighting
  useEffect(() => {
    if (!isEditMode || !isAuthenticated) return;

    const handleMouseOver = (e) => {
      e.stopPropagation();
      const element = e.target;
      
      // Skip if it's part of the editor UI
      if (element.closest('[data-editor-ui="true"]') || 
          element.closest('.fixed')) {
        return;
      }

      setHoverElement(element);
      
      // Add hover styling
      element.style.outline = '2px dashed rgba(139, 92, 246, 0.6)';
      element.style.outlineOffset = '2px';
      element.style.cursor = 'pointer';
    };

    const handleMouseOut = (e) => {
      const element = e.target;
      if (element !== selectedElement) {
        element.style.outline = '';
        element.style.outlineOffset = '';
        element.style.cursor = '';
      }
      setHoverElement(null);
    };

    const handleClick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      const element = e.target;
      
      // Skip editor UI elements
      if (element.closest('[data-editor-ui="true"]') || 
          element.closest('.fixed')) {
        return;
      }

      // Clear previous selection
      if (selectedElement) {
        selectedElement.style.outline = '';
        selectedElement.style.outlineOffset = '';
        selectedElement.removeAttribute('contenteditable');
        selectedElement.removeAttribute('data-selected');
      }

      // Select new element
      onElementSelect(element);
      
      // Highlight selected element
      element.style.outline = '3px solid rgba(139, 92, 246, 0.8)';
      element.style.outlineOffset = '2px';
      element.setAttribute('data-selected', 'true');
      
      // Make text elements editable
      if (element.tagName === 'H1' || element.tagName === 'H2' || 
          element.tagName === 'H3' || element.tagName === 'P' || 
          element.tagName === 'SPAN' || element.tagName === 'DIV' ||
          element.tagName === 'A' || element.tagName === 'LI') {
        element.setAttribute('contenteditable', 'true');
        element.style.cursor = 'text';
      }
    };

    // Add event listeners to all potential elements
    const elements = document.querySelectorAll('body *:not(script):not(style):not(meta):not(link)');
    
    elements.forEach(element => {
      element.addEventListener('mouseover', handleMouseOver);
      element.addEventListener('mouseout', handleMouseOut);
      element.addEventListener('click', handleClick);
    });

    return () => {
      elements.forEach(element => {
        element.removeEventListener('mouseover', handleMouseOver);
        element.removeEventListener('mouseout', handleMouseOut);
        element.removeEventListener('click', handleClick);
      });
    };
  }, [isEditMode, isAuthenticated, selectedElement, onElementSelect]);

  // Advanced dragging system
  const startDragging = useCallback((element, e) => {
    if (!element || !element.parentElement) return;

    setIsDragging(true);
    const rect = element.getBoundingClientRect();
    const parentRect = element.parentElement.getBoundingClientRect();
    
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });

    // Store original position and styles
    const originalStyles = {
      position: element.style.position,
      left: element.style.left,
      top: element.style.top,
      zIndex: element.style.zIndex,
      cursor: element.style.cursor,
      transform: element.style.transform,
      boxShadow: element.style.boxShadow
    };

    // Make element draggable with relative positioning to parent
    if (element.style.position !== 'absolute') {
      element.style.position = 'relative';
    }
    element.style.zIndex = '9999';
    element.style.cursor = 'grabbing';
    element.style.transform = 'rotate(1deg) scale(1.02)';
    element.style.boxShadow = '0 20px 40px rgba(139, 92, 246, 0.3)';

    const handleMouseMove = (e) => {
      if (element && element.parentElement) {
        const newX = e.clientX - parentRect.left - dragOffset.x;
        const newY = e.clientY - parentRect.top - dragOffset.y;
        element.style.left = newX + 'px';
        element.style.top = newY + 'px';
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      if (element) {
        element.style.cursor = 'grab';
        element.style.transform = '';
        element.style.boxShadow = '';
        // Keep the new position but restore other styles
        element.style.zIndex = originalStyles.zIndex;
      }
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [dragOffset]);

  // Element information panel
  const getElementInfo = (element) => {
    if (!element) return null;

    return {
      tagName: element.tagName.toLowerCase(),
      id: element.id || 'No ID',
      classes: element.className || 'No classes',
      text: element.textContent?.slice(0, 50) + (element.textContent?.length > 50 ? '...' : ''),
      dimensions: {
        width: Math.round(element.offsetWidth),
        height: Math.round(element.offsetHeight)
      }
    };
  };

  // Enhanced element actions
  const handleElementAction = (action) => {
    if (!selectedElement) return;

    switch (action) {
      case 'drag':
        // Enable drag mode - will be handled by mouse events
        selectedElement.style.cursor = 'grab';
        break;
      case 'copy':
        const clone = selectedElement.cloneNode(true);
        clone.style.position = 'absolute';
        clone.style.left = (selectedElement.offsetLeft + 20) + 'px';
        clone.style.top = (selectedElement.offsetTop + 20) + 'px';
        selectedElement.parentNode.appendChild(clone);
        break;
      case 'delete':
        if (window.confirm('Are you sure you want to delete this element?')) {
          selectedElement.remove();
          onElementSelect(null);
        }
        break;
      case 'hide':
        selectedElement.style.display = selectedElement.style.display === 'none' ? '' : 'none';
        break;
      case 'edit':
        selectedElement.contentEditable = true;
        selectedElement.focus();
        break;
      default:
        console.log('Action not implemented:', action);
    }
  };

  if (!isEditMode || !isAuthenticated) return null;

  return (
    <>
      {/* Element Selection Indicator */}
      <AnimatePresence>
        {hoverElement && hoverElement !== selectedElement && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed top-4 left-4 z-[1001] bg-gradient-to-r from-purple-600 to-blue-600 text-white px-3 py-2 rounded-lg shadow-lg pointer-events-none"
            data-editor-ui="true"
          >
            <div className="flex items-center space-x-2">
              <Target className="w-4 h-4" />
              <span className="text-sm font-medium">
                Hover: {hoverElement.tagName.toLowerCase()}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Selected Element Info Panel */}
      <AnimatePresence>
        {selectedElement && showElementInfo && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 left-4 z-[1001] bg-white/95 backdrop-blur-xl border border-gray-200 rounded-2xl shadow-2xl p-4 max-w-sm"
            data-editor-ui="true"
          >
            {(() => {
              const info = getElementInfo(selectedElement);
              return (
                <div className="space-y-3">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                        <Layers className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">Selected Element</h3>
                        <p className="text-xs text-gray-500">Click & drag to move</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowElementInfo(false)}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <EyeOff className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>

                  {/* Element Info */}
                  {info && (
                    <div className="space-y-2 text-xs">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-gray-500">Tag:</span>
                          <p className="font-medium text-purple-600">{info.tagName}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Size:</span>
                          <p className="font-medium">{info.dimensions.width} × {info.dimensions.height}</p>
                        </div>
                      </div>
                      
                      <div>
                        <span className="text-gray-500">ID:</span>
                        <p className="font-medium text-blue-600">{info.id}</p>
                      </div>
                      
                      {info.text && (
                        <div>
                          <span className="text-gray-500">Content:</span>
                          <p className="font-medium text-gray-700">{info.text}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Quick Actions */}
                  <div className="grid grid-cols-4 gap-1">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleElementAction('drag')}
                      className="p-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:from-purple-600 hover:to-blue-600"
                      title="Drag Element"
                    >
                      <Move className="w-4 h-4" />
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleElementAction('copy')}
                      className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600"
                      title="Clone Element"
                    >
                      <Copy className="w-4 h-4" />
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleElementAction('edit')}
                      className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:from-blue-600 hover:to-cyan-600"
                      title="Edit Text"
                    >
                      <Edit3 className="w-4 h-4" />
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleElementAction('delete')}
                      className="p-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg hover:from-red-600 hover:to-pink-600"
                      title="Delete Element"
                    >
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>
              );
            })()}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dragging Indicator */}
      <AnimatePresence>
        {isDragging && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed bottom-4 right-4 z-[1001] bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-full shadow-lg"
            data-editor-ui="true"
          >
            <div className="flex items-center space-x-2">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              >
                <Move className="w-4 h-4" />
              </motion.div>
              <span className="text-sm font-medium">Dragging Element...</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Element Info Button */}
      {selectedElement && !showElementInfo && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          onClick={() => setShowElementInfo(true)}
          className="fixed top-32 left-4 z-[1001] p-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-full shadow-lg hover:from-purple-600 hover:to-blue-600"
          data-editor-ui="true"
        >
          <Eye className="w-4 h-4" />
        </motion.button>
      )}

      {/* Element Interaction Styles */}
      <style>{`
        [data-selected="true"] {
          animation: selectedPulse 2s ease-in-out infinite;
        }
        
        @keyframes selectedPulse {
          0%, 100% {
            outline-color: rgba(139, 92, 246, 0.8);
          }
          50% {
            outline-color: rgba(139, 92, 246, 0.4);
          }
        }
      `}</style>
    </>
  );
};

export default AdvancedElementSelector;