import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  Expand,
  Target,
  Layers,
  Settings,
  Zap,
  Grid,
  Crosshair,
  Focus,
  Lock,
  Unlock,
  Maximize2,
  Square,
  Circle,
  Triangle,
  Info,
  CheckCircle
} from 'lucide-react';

const AdvancedElementSelector = ({ 
  isEditMode, 
  selectedElement, 
  onElementSelect, 
  onElementUpdate,
  isAuthenticated = false,
  dragMode = false,
  snapToGrid = true,
  gridSize = 20
}) => {
  const [hoverElement, setHoverElement] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isResizing, setIsResizing] = useState(false);
  const [showElementInfo, setShowElementInfo] = useState(true);
  const [selectionMode, setSelectionMode] = useState('click'); // 'click', 'hover', 'multi'
  const [selectedElements, setSelectedElements] = useState([]);
  const [showMeasurements, setShowMeasurements] = useState(false);
  const [elementLocked, setElementLocked] = useState(false);
  const [snapFeedback, setSnapFeedback] = useState(null);
  
  const dragRef = useRef({ isDragging: false, startPos: null });

  // Enhanced element detection with better filtering
  useEffect(() => {
    if (!isEditMode || !isAuthenticated) return;

    const handleMouseOver = (e) => {
      if (isDragging || elementLocked) return;
      
      e.stopPropagation();
      const element = e.target;
      
      // Enhanced filtering for better element selection
      if (element.closest('[data-editor-ui="true"]') || 
          element.closest('.fixed') ||
          element.closest('script') ||
          element.closest('style') ||
          element.closest('meta') ||
          element.closest('link')) {
        return;
      }

      // Skip if element is too small or not meaningful
      const rect = element.getBoundingClientRect();
      if (rect.width < 10 || rect.height < 10) {
        return;
      }

      setHoverElement(element);
      
      // Enhanced hover styling with better visibility
      element.style.outline = dragMode 
        ? '3px solid rgba(34, 197, 94, 0.6)' 
        : '2px dashed rgba(139, 92, 246, 0.6)';
      element.style.outlineOffset = '2px';
      element.style.cursor = dragMode ? 'grab' : 'pointer';
      element.style.transition = 'all 0.2s ease';
      
      // Add hover indicator
      if (!dragMode) {
        element.style.backgroundColor = 'rgba(139, 92, 246, 0.05)';
      }
    };

    const handleMouseOut = (e) => {
      const element = e.target;
      if (element !== selectedElement && !selectedElements.includes(element)) {
        element.style.outline = '';
        element.style.outlineOffset = '';
        element.style.cursor = '';
        element.style.transition = '';
        element.style.backgroundColor = '';
      }
      setHoverElement(null);
    };

    const handleClick = (e) => {
      if (isDragging) return;
      
      e.preventDefault();
      e.stopPropagation();
      
      const element = e.target;
      
      // Skip editor UI elements
      if (element.closest('[data-editor-ui="true"]') || 
          element.closest('.fixed')) {
        return;
      }

      // Handle multi-selection
      if (e.ctrlKey || e.metaKey) {
        if (selectedElements.includes(element)) {
          setSelectedElements(prev => prev.filter(el => el !== element));
        } else {
          setSelectedElements(prev => [...prev, element]);
        }
        return;
      }

      // Clear previous selections
      selectedElements.forEach(el => {
        el.style.outline = '';
        el.style.outlineOffset = '';
        el.removeAttribute('contenteditable');
        el.removeAttribute('data-selected');
      });
      
      if (selectedElement && selectedElement !== element) {
        selectedElement.style.outline = '';
        selectedElement.style.outlineOffset = '';
        selectedElement.removeAttribute('contenteditable');
        selectedElement.removeAttribute('data-selected');
      }

      // Select new element
      onElementSelect(element);
      setSelectedElements([]);
      
      // Enhanced selection highlighting
      element.style.outline = '3px solid rgba(139, 92, 246, 0.8)';
      element.style.outlineOffset = '2px';
      element.style.boxShadow = '0 0 0 1px rgba(139, 92, 246, 0.3), 0 4px 12px rgba(139, 92, 246, 0.15)';
      element.setAttribute('data-selected', 'true');
      
      // Enable text editing for text elements
      const textElements = ['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'P', 'SPAN', 'DIV', 'A', 'LI', 'TD', 'TH'];
      if (textElements.includes(element.tagName)) {
        element.setAttribute('contenteditable', 'true');
        element.style.cursor = 'text';
      }

      // Start drag mode if enabled
      if (dragMode) {
        startDragging(element, e);
      }
    };

    // Add event listeners to potential elements
    const elements = document.querySelectorAll('body *:not(script):not(style):not(meta):not(link)');
    
    elements.forEach(element => {
      element.addEventListener('mouseover', handleMouseOver, { passive: false });
      element.addEventListener('mouseout', handleMouseOut, { passive: false });
      element.addEventListener('click', handleClick, { passive: false });
    });

    return () => {
      elements.forEach(element => {
        element.removeEventListener('mouseover', handleMouseOver);
        element.removeEventListener('mouseout', handleMouseOut);
        element.removeEventListener('click', handleClick);
      });
    };
  }, [isEditMode, isAuthenticated, selectedElement, selectedElements, dragMode, isDragging, elementLocked]);

  // Enhanced dragging system with grid snapping
  const startDragging = useCallback((element, e) => {
    if (!element || !element.parentElement || elementLocked) return;

    setIsDragging(true);
    dragRef.current.isDragging = true;
    
    const rect = element.getBoundingClientRect();
    const parentRect = element.parentElement.getBoundingClientRect();
    
    const offset = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
    
    setDragOffset(offset);
    dragRef.current.startPos = { x: rect.left, y: rect.top };

    // Store original styles
    const originalStyles = {
      position: element.style.position,
      left: element.style.left,
      top: element.style.top,
      zIndex: element.style.zIndex,
      cursor: element.style.cursor,
      transform: element.style.transform,
      boxShadow: element.style.boxShadow,
      transition: element.style.transition
    };

    // Apply drag styles
    element.style.position = element.style.position || 'relative';
    element.style.zIndex = '9999';
    element.style.cursor = 'grabbing';
    element.style.transform = 'rotate(1deg) scale(1.02)';
    element.style.boxShadow = '0 20px 40px rgba(139, 92, 246, 0.3)';
    element.style.transition = 'none';

    const handleMouseMove = (e) => {
      if (!dragRef.current.isDragging || !element || !element.parentElement) return;
      
      let newX = e.clientX - parentRect.left - offset.x;
      let newY = e.clientY - parentRect.top - offset.y;
      
      // Grid snapping with visual feedback
      if (snapToGrid) {
        const snappedX = Math.round(newX / gridSize) * gridSize;
        const snappedY = Math.round(newY / gridSize) * gridSize;
        
        // Show snap feedback if close to grid
        if (Math.abs(newX - snappedX) < gridSize / 2 && Math.abs(newY - snappedY) < gridSize / 2) {
          setSnapFeedback({ x: snappedX, y: snappedY });
          newX = snappedX;
          newY = snappedY;
          element.style.outline = '3px solid rgba(34, 197, 94, 0.8)';
        } else {
          setSnapFeedback(null);
          element.style.outline = '3px solid rgba(139, 92, 246, 0.8)';
        }
      }
      
      element.style.left = newX + 'px';
      element.style.top = newY + 'px';
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      dragRef.current.isDragging = false;
      setSnapFeedback(null);
      
      if (element) {
        element.style.cursor = 'grab';
        element.style.transform = '';
        element.style.zIndex = originalStyles.zIndex || '';
        element.style.transition = originalStyles.transition || '';
        element.style.boxShadow = originalStyles.boxShadow || '';
      }
      
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [snapToGrid, gridSize, elementLocked]);

  // Enhanced element information
  const getElementInfo = (element) => {
    if (!element) return null;

    const rect = element.getBoundingClientRect();
    const computedStyle = window.getComputedStyle(element);
    
    return {
      tagName: element.tagName.toLowerCase(),
      id: element.id || 'No ID',
      classes: element.className || 'No classes',
      text: element.textContent?.slice(0, 50) + (element.textContent?.length > 50 ? '...' : ''),
      dimensions: {
        width: Math.round(rect.width),
        height: Math.round(rect.height),
        top: Math.round(rect.top + window.scrollY),
        left: Math.round(rect.left + window.scrollX)
      },
      styles: {
        position: computedStyle.position,
        display: computedStyle.display,
        backgroundColor: computedStyle.backgroundColor,
        color: computedStyle.color,
        fontSize: computedStyle.fontSize,
        fontFamily: computedStyle.fontFamily.split(',')[0].replace(/['"]/g, ''),
        margin: computedStyle.margin,
        padding: computedStyle.padding,
        zIndex: computedStyle.zIndex
      },
      accessibility: {
        hasAltText: element.hasAttribute('alt'),
        hasAriaLabel: element.hasAttribute('aria-label'),
        isInteractive: ['A', 'BUTTON', 'INPUT', 'SELECT', 'TEXTAREA'].includes(element.tagName),
        tabIndex: element.tabIndex
      }
    };
  };

  // Enhanced element actions
  const handleElementAction = (action) => {
    if (!selectedElement || elementLocked) return;

    switch (action) {
      case 'drag':
        setIsDragging(!isDragging);
        selectedElement.style.cursor = isDragging ? 'grab' : 'pointer';
        break;
        
      case 'copy':
        const clone = selectedElement.cloneNode(true);
        clone.style.position = 'absolute';
        clone.style.left = (selectedElement.offsetLeft + 20) + 'px';
        clone.style.top = (selectedElement.offsetTop + 20) + 'px';
        clone.removeAttribute('data-selected');
        selectedElement.parentNode.appendChild(clone);
        break;
        
      case 'delete':
        if (window.confirm('Are you sure you want to delete this element?')) {
          selectedElement.remove();
          onElementSelect(null);
        }
        break;
        
      case 'hide':
        const isHidden = selectedElement.style.display === 'none';
        selectedElement.style.display = isHidden ? '' : 'none';
        break;
        
      case 'edit':
        selectedElement.contentEditable = true;
        selectedElement.focus();
        break;
        
      case 'lock':
        setElementLocked(!elementLocked);
        break;
        
      case 'measurements':
        setShowMeasurements(!showMeasurements);
        break;
        
      default:
        console.log('Action not implemented:', action);
    }
  };

  if (!isEditMode || !isAuthenticated) return null;

  return (
    <>
      {/* Enhanced Hover Indicator */}
      <AnimatePresence>
        {hoverElement && hoverElement !== selectedElement && !selectedElements.includes(hoverElement) && (
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
                {hoverElement.tagName.toLowerCase()}
                {hoverElement.id && ` #${hoverElement.id}`}
                {hoverElement.className && ` .${hoverElement.className.split(' ')[0]}`}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grid Snap Feedback */}
      <AnimatePresence>
        {snapFeedback && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed z-[1002] bg-green-500 text-white px-2 py-1 rounded text-xs font-mono pointer-events-none"
            style={{
              left: snapFeedback.x + 'px',
              top: snapFeedback.y - 30 + 'px'
            }}
            data-editor-ui="true"
          >
            {snapFeedback.x}, {snapFeedback.y}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhanced Element Info Panel */}
      <AnimatePresence>
        {selectedElement && showElementInfo && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="fixed top-20 left-4 z-[1001] bg-white/95 backdrop-blur-xl border border-gray-200 rounded-2xl shadow-2xl p-4 max-w-xs"
            data-editor-ui="true"
          >
            {(() => {
              const info = getElementInfo(selectedElement);
              return (
                <div className="space-y-3">
                  {/* Enhanced Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="relative">
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                          <Layers className="w-4 h-4 text-white" />
                        </div>
                        {elementLocked && (
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
                            <Lock className="w-2 h-2 text-white" />
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800 text-sm flex items-center gap-1">
                          {info.tagName}
                          {info.id !== 'No ID' && (
                            <span className="text-xs text-blue-600">#{info.id}</span>
                          )}
                        </h3>
                        <p className="text-xs text-gray-500">
                          {info.dimensions.width} × {info.dimensions.height}px
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleElementAction('lock')}
                        className={`p-1 rounded transition-colors ${
                          elementLocked ? 'bg-red-100 text-red-600' : 'hover:bg-gray-100 text-gray-400'
                        }`}
                        title={elementLocked ? 'Unlock Element' : 'Lock Element'}
                        data-editor-ui="true"
                        type="button"
                      >
                        {elementLocked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                      </button>
                      <button
                        onClick={() => setShowElementInfo(false)}
                        className="p-1 hover:bg-gray-100 rounded transition-colors"
                        data-editor-ui="true"
                        type="button"
                      >
                        <EyeOff className="w-3 h-3 text-gray-400" />
                      </button>
                    </div>
                  </div>

                  {/* Enhanced Element Info */}
                  {info && (
                    <div className="space-y-2 text-xs">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="p-2 bg-gray-50 rounded">
                          <span className="text-gray-500 block">Position</span>
                          <p className="font-medium text-gray-700">{info.styles.position}</p>
                        </div>
                        <div className="p-2 bg-gray-50 rounded">
                          <span className="text-gray-500 block">Display</span>
                          <p className="font-medium text-gray-700">{info.styles.display}</p>
                        </div>
                      </div>
                      
                      <div className="p-2 bg-blue-50 rounded">
                        <span className="text-blue-600 block font-medium mb-1">Location</span>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <span>X: {info.dimensions.left}px</span>
                          <span>Y: {info.dimensions.top}px</span>
                        </div>
                      </div>

                      {info.styles.fontSize && (
                        <div className="p-2 bg-purple-50 rounded">
                          <span className="text-purple-600 block font-medium mb-1">Typography</span>
                          <div className="space-y-1">
                            <div>Font: {info.styles.fontFamily}</div>
                            <div>Size: {info.styles.fontSize}</div>
                          </div>
                        </div>
                      )}
                      
                      {info.text && (
                        <div className="p-2 bg-green-50 rounded">
                          <span className="text-green-600 block font-medium mb-1">Content</span>
                          <p className="text-gray-700 truncate">{info.text}</p>
                        </div>
                      )}

                      {/* Accessibility Info */}
                      <div className="p-2 bg-yellow-50 rounded">
                        <span className="text-yellow-700 block font-medium mb-1">Accessibility</span>
                        <div className="flex flex-wrap gap-1">
                          {info.accessibility.hasAltText && (
                            <span className="px-1 py-0.5 bg-green-200 text-green-800 rounded text-xs">Alt</span>
                          )}
                          {info.accessibility.hasAriaLabel && (
                            <span className="px-1 py-0.5 bg-green-200 text-green-800 rounded text-xs">ARIA</span>
                          )}
                          {info.accessibility.isInteractive && (
                            <span className="px-1 py-0.5 bg-blue-200 text-blue-800 rounded text-xs">Interactive</span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Enhanced Quick Actions */}
                  <div className="grid grid-cols-4 gap-1">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleElementAction('drag')}
                      disabled={elementLocked}
                      className="p-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 disabled:opacity-50"
                      title="Toggle Drag"
                      data-editor-ui="true"
                      type="button"
                    >
                      <Move className="w-4 h-4" />
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleElementAction('copy')}
                      disabled={elementLocked}
                      className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 disabled:opacity-50"
                      title="Duplicate"
                      data-editor-ui="true"
                      type="button"
                    >
                      <Copy className="w-4 h-4" />
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleElementAction('edit')}
                      disabled={elementLocked}
                      className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:from-blue-600 hover:to-cyan-600 disabled:opacity-50"
                      title="Edit Text"
                      data-editor-ui="true"
                      type="button"
                    >
                      <Edit3 className="w-4 h-4" />
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleElementAction('measurements')}
                      className={`p-2 rounded-lg transition-colors ${
                        showMeasurements 
                          ? 'bg-yellow-500 text-white' 
                          : 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:from-yellow-600 hover:to-orange-600'
                      }`}
                      title="Toggle Measurements"
                      data-editor-ui="true"
                      type="button"
                    >
                      <Resize className="w-4 h-4" />
                    </motion.button>
                  </div>

                  {/* Selection Mode Toggle */}
                  <div className="pt-2 border-t border-gray-200">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">Selection Mode:</span>
                      <div className="flex gap-1">
                        {['click', 'hover'].map((mode) => (
                          <button
                            key={mode}
                            onClick={() => setSelectionMode(mode)}
                            className={`px-2 py-1 rounded text-xs transition-colors ${
                              selectionMode === mode 
                                ? 'bg-blue-500 text-white' 
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                            data-editor-ui="true"
                            type="button"
                          >
                            {mode}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Multi-selection indicator */}
      <AnimatePresence>
        {selectedElements.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed top-4 right-4 z-[1001] bg-gradient-to-r from-green-600 to-emerald-600 text-white px-3 py-2 rounded-lg shadow-lg"
            data-editor-ui="true"
          >
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm font-medium">
                {selectedElements.length} elements selected
              </span>
            </div>
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
              <span className="text-sm font-medium">
                Dragging Element
                {snapToGrid && snapFeedback && (
                  <span className="ml-2 text-xs bg-green-500 px-1 rounded">
                    SNAPPED
                  </span>
                )}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Show/Hide Element Info Button */}
      {selectedElement && !showElementInfo && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          onClick={() => setShowElementInfo(true)}
          className="fixed top-32 left-4 z-[1001] p-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-full shadow-lg hover:from-purple-600 hover:to-blue-600 transition-all"
          data-editor-ui="true"
          type="button"
        >
          <Eye className="w-4 h-4" />
        </motion.button>
      )}

      {/* Enhanced Element Interaction Styles */}
      <style>{`
        [data-selected="true"] {
          animation: selectedPulse 2s ease-in-out infinite;
          position: relative;
        }
        
        [data-selected="true"]::after {
          content: '';
          position: absolute;
          top: -5px;
          left: -5px;
          right: -5px;
          bottom: -5px;
          background: linear-gradient(45deg, rgba(139, 92, 246, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%);
          border-radius: 8px;
          z-index: -1;
          animation: selectedGlow 3s ease-in-out infinite;
        }
        
        @keyframes selectedPulse {
          0%, 100% {
            outline-color: rgba(139, 92, 246, 0.8);
          }
          50% {
            outline-color: rgba(139, 92, 246, 0.4);
          }
        }
        
        @keyframes selectedGlow {
          0%, 100% {
            opacity: 0.3;
          }
          50% {
            opacity: 0.6;
          }
        }
        
        .drag-mode-hover {
          cursor: grab !important;
          transform: scale(1.02);
          transition: transform 0.2s ease;
        }
        
        .drag-mode-active {
          cursor: grabbing !important;
          transform: scale(1.05) rotate(2deg);
          z-index: 9999;
        }
      `}</style>
    </>
  );
};

export default AdvancedElementSelector;