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
  EyeOff,
  MousePointer,
  Layers,
  Maximize,
  Minimize,
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  Lock,
  Unlock,
  Grid3X3,
  Ruler,
  Crosshair,
  Target,
  Zap,
  Wand2,
  PaintBucket,
  Scissors,
  Magnet,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify
} from 'lucide-react';

const AdvancedInPlaceEditor = ({ 
  isEditMode, 
  content, 
  setContent, 
  onSave, 
  onExit,
  onAICommand 
}) => {
  const [selectedElement, setSelectedElement] = useState(null);
  const [multiSelectedElements, setMultiSelectedElements] = useState([]);
  const [contextMenu, setContextMenu] = useState({ show: false, x: 0, y: 0, element: null });
  const [editingText, setEditingText] = useState({ active: false, element: null, value: '' });
  const [draggedElement, setDraggedElement] = useState(null);
  const [dragPreview, setDragPreview] = useState({ show: false, x: 0, y: 0 });
  const [selectionBox, setSelectionBox] = useState({ show: false, startX: 0, startY: 0, endX: 0, endY: 0 });
  const [isSelecting, setIsSelecting] = useState(false);
  const [hoveredElement, setHoveredElement] = useState(null);
  const [editMode, setEditMode] = useState('select'); // select, text, image, color, move
  const [aiCommand, setAiCommand] = useState('');
  const [isAIProcessing, setIsAIProcessing] = useState(false);
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [showGrid, setShowGrid] = useState(false);
  const [showRuler, setShowRuler] = useState(false);
  const [editHistory, setEditHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const canvasRef = useRef(null);
  const isDragging = useRef(false);
  const startPos = useRef({ x: 0, y: 0 });

  // Enhanced element interaction
  const handleElementInteraction = (e, elementPath, elementType, action = 'select') => {
    if (!isEditMode) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    const rect = e.target.getBoundingClientRect();
    const elementData = {
      path: elementPath,
      type: elementType,
      element: e.target,
      rect: rect,
      styles: window.getComputedStyle(e.target),
      id: `element-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };

    switch (action) {
      case 'select':
        handleElementSelect(elementData, e.ctrlKey || e.metaKey);
        break;
      case 'context':
        handleContextMenu(e, elementData);
        break;
      case 'hover':
        setHoveredElement(elementData);
        break;
      case 'unhover':
        setHoveredElement(null);
        break;
    }
  };

  // Enhanced element selection with multi-select
  const handleElementSelect = (elementData, addToSelection = false) => {
    if (addToSelection) {
      setMultiSelectedElements(prev => {
        const existing = prev.find(el => el.id === elementData.id);
        if (existing) {
          return prev.filter(el => el.id !== elementData.id);
        }
        return [...prev, elementData];
      });
    } else {
      setSelectedElement(elementData);
      setMultiSelectedElements([elementData]);
    }

    // Add visual selection indicator
    elementData.element.classList.add('element-selected');
    
    // Remove previous selections if not multi-selecting
    if (!addToSelection) {
      document.querySelectorAll('.element-selected').forEach(el => {
        if (el !== elementData.element) {
          el.classList.remove('element-selected');
        }
      });
    }
  };

  // Enhanced context menu with more options
  const handleContextMenu = (e, elementData) => {
    setContextMenu({
      show: true,
      x: e.clientX,
      y: e.clientY,
      element: elementData,
      multiSelect: multiSelectedElements.length > 1
    });
  };

  // Advanced drag and drop system
  const handleDragStart = (elementData, e) => {
    if (!isEditMode || editMode !== 'move') return;
    
    isDragging.current = true;
    setDraggedElement(elementData);
    
    const rect = elementData.element.getBoundingClientRect();
    startPos.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
    
    // Create drag preview
    const preview = elementData.element.cloneNode(true);
    preview.style.position = 'fixed';
    preview.style.zIndex = '10000';
    preview.style.opacity = '0.7';
    preview.style.pointerEvents = 'none';
    preview.style.transform = 'rotate(5deg) scale(0.95)';
    preview.style.boxShadow = '0 20px 40px rgba(0,0,0,0.4)';
    preview.id = 'drag-preview';
    
    document.body.appendChild(preview);
    
    // Add drag effects to original element
    elementData.element.style.opacity = '0.3';
    elementData.element.style.transform = 'scale(0.98)';
    
    setDragPreview({ show: true, x: e.clientX, y: e.clientY });
    
    document.addEventListener('mousemove', handleDragMove);
    document.addEventListener('mouseup', handleDragEnd);
  };

  const handleDragMove = (e) => {
    if (!isDragging.current) return;
    
    // Update drag preview position
    const preview = document.getElementById('drag-preview');
    if (preview) {
      let x = e.clientX - startPos.current.x;
      let y = e.clientY - startPos.current.y;
      
      // Snap to grid if enabled
      if (snapToGrid) {
        x = Math.round(x / 20) * 20;
        y = Math.round(y / 20) * 20;
      }
      
      preview.style.left = x + 'px';
      preview.style.top = y + 'px';
    }
    
    setDragPreview({ show: true, x: e.clientX, y: e.clientY });
    
    // Highlight drop zones
    const elementsBelow = document.elementsFromPoint(e.clientX, e.clientY);
    document.querySelectorAll('.drop-zone-active').forEach(el => {
      el.classList.remove('drop-zone-active');
    });
    
    elementsBelow.forEach(el => {
      if (el.classList.contains('editable-element') && el !== draggedElement?.element) {
        el.classList.add('drop-zone-active');
      }
    });
  };

  const handleDragEnd = (e) => {
    if (!isDragging.current) return;
    
    isDragging.current = false;
    
    // Remove drag preview
    const preview = document.getElementById('drag-preview');
    if (preview) {
      document.body.removeChild(preview);
    }
    
    // Reset original element
    if (draggedElement) {
      draggedElement.element.style.opacity = '1';
      draggedElement.element.style.transform = 'none';
      
      // Find drop target
      const elementsBelow = document.elementsFromPoint(e.clientX, e.clientY);
      const dropTarget = elementsBelow.find(el => 
        el.classList.contains('editable-element') && 
        el !== draggedElement.element
      );
      
      if (dropTarget) {
        // Perform element reordering
        const rect = dropTarget.getBoundingClientRect();
        const midpoint = rect.top + rect.height / 2;
        
        if (e.clientY < midpoint) {
          dropTarget.parentNode.insertBefore(draggedElement.element, dropTarget);
        } else {
          dropTarget.parentNode.insertBefore(draggedElement.element, dropTarget.nextSibling);
        }
        
        // Add success animation
        draggedElement.element.style.animation = 'dropSuccess 0.5s ease-out';
        setTimeout(() => {
          if (draggedElement.element) {
            draggedElement.element.style.animation = '';
          }
        }, 500);
      }
    }
    
    // Clean up
    document.querySelectorAll('.drop-zone-active').forEach(el => {
      el.classList.remove('drop-zone-active');
    });
    
    setDraggedElement(null);
    setDragPreview({ show: false, x: 0, y: 0 });
    
    document.removeEventListener('mousemove', handleDragMove);
    document.removeEventListener('mouseup', handleDragEnd);
  };

  // Selection box for multi-select
  const handleCanvasMouseDown = (e) => {
    if (!isEditMode || editMode !== 'select') return;
    
    setIsSelecting(true);
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      setSelectionBox({
        show: true,
        startX: e.clientX - rect.left,
        startY: e.clientY - rect.top,
        endX: e.clientX - rect.left,
        endY: e.clientY - rect.top
      });
    }
  };

  const handleCanvasMouseMove = (e) => {
    if (!isSelecting) return;
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      setSelectionBox(prev => ({
        ...prev,
        endX: e.clientX - rect.left,
        endY: e.clientY - rect.top
      }));
    }
  };

  const handleCanvasMouseUp = () => {
    if (!isSelecting) return;
    
    setIsSelecting(false);
    
    // Find elements within selection box
    const box = selectionBox;
    const elements = document.querySelectorAll('.editable-element');
    const selectedInBox = [];
    
    elements.forEach(element => {
      const rect = element.getBoundingClientRect();
      const canvasRect = canvasRef.current?.getBoundingClientRect();
      
      if (canvasRect) {
        const elX = rect.left - canvasRect.left;
        const elY = rect.top - canvasRect.top;
        const elRight = elX + rect.width;
        const elBottom = elY + rect.height;
        
        const boxLeft = Math.min(box.startX, box.endX);
        const boxTop = Math.min(box.startY, box.endY);
        const boxRight = Math.max(box.startX, box.endX);
        const boxBottom = Math.max(box.startY, box.endY);
        
        if (elX < boxRight && elRight > boxLeft && elY < boxBottom && elBottom > boxTop) {
          selectedInBox.push({
            element: element,
            path: element.dataset.elementPath || '',
            type: element.dataset.elementType || 'element',
            rect: rect,
            id: `multi-${Date.now()}-${selectedInBox.length}`
          });
        }
      }
    });
    
    setMultiSelectedElements(selectedInBox);
    setSelectionBox({ show: false, startX: 0, startY: 0, endX: 0, endY: 0 });
    
    // Add visual feedback
    selectedInBox.forEach(item => {
      item.element.classList.add('element-selected');
    });
  };

  // Enhanced text editing with rich options
  const handleAdvancedTextEdit = (elementData) => {
    const element = elementData.element;
    const originalText = element.textContent || element.value || '';
    
    // Create advanced text editor overlay
    const editorOverlay = document.createElement('div');
    editorOverlay.className = 'advanced-text-editor-overlay';
    editorOverlay.innerHTML = `
      <div class="text-editor-panel">
        <div class="text-editor-toolbar">
          <button class="toolbar-btn" data-action="bold"><strong>B</strong></button>
          <button class="toolbar-btn" data-action="italic"><em>I</em></button>
          <button class="toolbar-btn" data-action="underline"><u>U</u></button>
          <div class="toolbar-divider"></div>
          <button class="toolbar-btn" data-action="align-left">⬅</button>
          <button class="toolbar-btn" data-action="align-center">⬌</button>
          <button class="toolbar-btn" data-action="align-right">➡</button>
          <div class="toolbar-divider"></div>
          <input type="color" class="color-picker" data-action="color" value="#cfd8e3">
          <input type="range" class="size-slider" data-action="size" min="10" max="72" value="16">
        </div>
        <textarea class="rich-text-area">${originalText}</textarea>
        <div class="text-editor-actions">
          <button class="cancel-btn">Cancel</button>
          <button class="save-btn">Save Changes</button>
        </div>
      </div>
    `;
    
    // Position editor
    const rect = element.getBoundingClientRect();
    editorOverlay.style.position = 'fixed';
    editorOverlay.style.left = rect.left + 'px';
    editorOverlay.style.top = rect.top + 'px';
    editorOverlay.style.zIndex = '10000';
    
    document.body.appendChild(editorOverlay);
    
    const textarea = editorOverlay.querySelector('.rich-text-area');
    textarea.focus();
    textarea.select();
    
    // Handle toolbar actions
    editorOverlay.addEventListener('click', (e) => {
      const action = e.target.dataset.action;
      if (action) {
        switch (action) {
          case 'bold':
            element.style.fontWeight = element.style.fontWeight === 'bold' ? 'normal' : 'bold';
            break;
          case 'italic':
            element.style.fontStyle = element.style.fontStyle === 'italic' ? 'normal' : 'italic';
            break;
          case 'underline':
            element.style.textDecoration = element.style.textDecoration === 'underline' ? 'none' : 'underline';
            break;
          case 'align-left':
            element.style.textAlign = 'left';
            break;
          case 'align-center':
            element.style.textAlign = 'center';
            break;
          case 'align-right':
            element.style.textAlign = 'right';
            break;
          case 'color':
            element.style.color = e.target.value;
            break;
          case 'size':
            element.style.fontSize = e.target.value + 'px';
            break;
        }
      }
    });
    
    // Save functionality
    const saveChanges = () => {
      const newText = textarea.value;
      
      if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
        element.value = newText;
      } else {
        element.textContent = newText;
      }
      
      // Update content state
      if (elementData.path && setContent) {
        updateContentByPath(elementData.path, newText);
      }
      
      document.body.removeChild(editorOverlay);
      setContextMenu({ show: false, x: 0, y: 0, element: null });
    };
    
    // Event handlers
    editorOverlay.querySelector('.save-btn').addEventListener('click', saveChanges);
    editorOverlay.querySelector('.cancel-btn').addEventListener('click', () => {
      document.body.removeChild(editorOverlay);
      setContextMenu({ show: false, x: 0, y: 0, element: null });
    });
    
    textarea.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && e.ctrlKey) {
        saveChanges();
      }
      if (e.key === 'Escape') {
        document.body.removeChild(editorOverlay);
        setContextMenu({ show: false, x: 0, y: 0, element: null });
      }
    });
  };

  // Advanced image editing
  const handleAdvancedImageEdit = (elementData) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = false;
    
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const imageUrl = event.target.result;
          
          // Create image editor overlay
          const editorOverlay = document.createElement('div');
          editorOverlay.className = 'image-editor-overlay';
          editorOverlay.innerHTML = `
            <div class="image-editor-panel">
              <div class="image-preview">
                <img src="${imageUrl}" alt="Preview" class="preview-image">
              </div>
              <div class="image-controls">
                <div class="control-group">
                  <label>Brightness</label>
                  <input type="range" class="brightness-slider" min="0" max="200" value="100">
                </div>
                <div class="control-group">
                  <label>Contrast</label>
                  <input type="range" class="contrast-slider" min="0" max="200" value="100">
                </div>
                <div class="control-group">
                  <label>Saturation</label>
                  <input type="range" class="saturation-slider" min="0" max="200" value="100">
                </div>
                <div class="control-group">
                  <label>Blur</label>
                  <input type="range" class="blur-slider" min="0" max="10" value="0">
                </div>
              </div>
              <div class="image-actions">
                <button class="flip-h-btn">Flip H</button>
                <button class="flip-v-btn">Flip V</button>
                <button class="rotate-btn">Rotate</button>
                <button class="reset-btn">Reset</button>
              </div>
              <div class="editor-actions">
                <button class="cancel-btn">Cancel</button>
                <button class="apply-btn">Apply Changes</button>
              </div>
            </div>
          `;
          
          document.body.appendChild(editorOverlay);
          
          const previewImg = editorOverlay.querySelector('.preview-image');
          let filters = { brightness: 100, contrast: 100, saturate: 100, blur: 0 };
          let transforms = { scaleX: 1, scaleY: 1, rotate: 0 };
          
          const updateFilters = () => {
            previewImg.style.filter = `brightness(${filters.brightness}%) contrast(${filters.contrast}%) saturate(${filters.saturate}%) blur(${filters.blur}px)`;
            previewImg.style.transform = `scaleX(${transforms.scaleX}) scaleY(${transforms.scaleY}) rotate(${transforms.rotate}deg)`;
          };
          
          // Control handlers
          editorOverlay.querySelector('.brightness-slider').addEventListener('input', (e) => {
            filters.brightness = e.target.value;
            updateFilters();
          });
          
          editorOverlay.querySelector('.contrast-slider').addEventListener('input', (e) => {
            filters.contrast = e.target.value;
            updateFilters();
          });
          
          editorOverlay.querySelector('.saturation-slider').addEventListener('input', (e) => {
            filters.saturate = e.target.value;
            updateFilters();
          });
          
          editorOverlay.querySelector('.blur-slider').addEventListener('input', (e) => {
            filters.blur = e.target.value;
            updateFilters();
          });
          
          editorOverlay.querySelector('.flip-h-btn').addEventListener('click', () => {
            transforms.scaleX *= -1;
            updateFilters();
          });
          
          editorOverlay.querySelector('.flip-v-btn').addEventListener('click', () => {
            transforms.scaleY *= -1;
            updateFilters();
          });
          
          editorOverlay.querySelector('.rotate-btn').addEventListener('click', () => {
            transforms.rotate += 90;
            updateFilters();
          });
          
          editorOverlay.querySelector('.reset-btn').addEventListener('click', () => {
            filters = { brightness: 100, contrast: 100, saturate: 100, blur: 0 };
            transforms = { scaleX: 1, scaleY: 1, rotate: 0 };
            updateFilters();
          });
          
          // Apply changes
          editorOverlay.querySelector('.apply-btn').addEventListener('click', () => {
            if (elementData.element.tagName === 'IMG') {
              elementData.element.src = imageUrl;
              elementData.element.style.filter = previewImg.style.filter;
              elementData.element.style.transform = previewImg.style.transform;
            } else {
              elementData.element.style.backgroundImage = `url(${imageUrl})`;
              elementData.element.style.filter = previewImg.style.filter;
              elementData.element.style.transform = previewImg.style.transform;
            }
            
            document.body.removeChild(editorOverlay);
          });
          
          editorOverlay.querySelector('.cancel-btn').addEventListener('click', () => {
            document.body.removeChild(editorOverlay);
          });
        };
        
        reader.readAsDataURL(file);
      }
      
      setContextMenu({ show: false, x: 0, y: 0, element: null });
    };
    
    input.click();
  };

  // Update content by path helper
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

  if (!isEditMode) return null;

  return (
    <>
      {/* Advanced Edit Canvas Overlay */}
      <div 
        ref={canvasRef}
        className="fixed inset-0 z-30 pointer-events-none"
        style={{ pointerEvents: editMode === 'select' ? 'auto' : 'none' }}
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={handleCanvasMouseMove}
        onMouseUp={handleCanvasMouseUp}
      >
        {/* Grid Overlay */}
        {showGrid && (
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <svg width="100%" height="100%">
              <defs>
                <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#7bdfff" strokeWidth="0.5"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>
        )}
        
        {/* Ruler */}
        {showRuler && (
          <>
            <div className="absolute top-0 left-0 right-0 h-6 bg-gray-900/90 border-b border-gray-700 flex">
              {Array.from({ length: Math.ceil(window.innerWidth / 50) }, (_, i) => (
                <div key={i} className="flex-shrink-0 w-12 text-xs text-gray-400 text-center">
                  {i * 50}
                </div>
              ))}
            </div>
            <div className="absolute top-0 left-0 bottom-0 w-6 bg-gray-900/90 border-r border-gray-700 flex flex-col">
              {Array.from({ length: Math.ceil(window.innerHeight / 50) }, (_, i) => (
                <div key={i} className="flex-shrink-0 h-12 text-xs text-gray-400 writing-mode-vertical">
                  {i * 50}
                </div>
              ))}
            </div>
          </>
        )}
        
        {/* Selection Box */}
        {selectionBox.show && (
          <div
            className="absolute border-2 border-dashed border-blue-500 bg-blue-500/10 pointer-events-none"
            style={{
              left: Math.min(selectionBox.startX, selectionBox.endX),
              top: Math.min(selectionBox.startY, selectionBox.endY),
              width: Math.abs(selectionBox.endX - selectionBox.startX),
              height: Math.abs(selectionBox.endY - selectionBox.startY),
            }}
          />
        )}
      </div>

      {/* Super Advanced Toolbar */}
      <div className="fixed top-4 left-4 z-50 bg-gray-900/95 backdrop-blur-xl border border-gray-700 rounded-xl p-3 shadow-2xl">
        <div className="flex items-center space-x-2 mb-3">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium text-white">Super Edit Mode</span>
          <div className="w-px h-6 bg-gray-600"></div>
          <span className="text-xs text-gray-400">Rich Editing Active</span>
        </div>
        
        {/* Mode Selector */}
        <div className="flex items-center space-x-1 mb-3 p-1 bg-gray-800 rounded-lg">
          <button
            onClick={() => setEditMode('select')}
            className={`p-2 rounded transition-colors ${editMode === 'select' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
            title="Select Mode"
          >
            <MousePointer className="w-4 h-4" />
          </button>
          <button
            onClick={() => setEditMode('text')}
            className={`p-2 rounded transition-colors ${editMode === 'text' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
            title="Text Edit Mode"
          >
            <Type className="w-4 h-4" />
          </button>
          <button
            onClick={() => setEditMode('move')}
            className={`p-2 rounded transition-colors ${editMode === 'move' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
            title="Move Mode"
          >
            <Move className="w-4 h-4" />
          </button>
          <button
            onClick={() => setEditMode('image')}
            className={`p-2 rounded transition-colors ${editMode === 'image' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
            title="Image Edit Mode"
          >
            <ImageIcon className="w-4 h-4" />
          </button>
        </div>
        
        {/* Tools */}
        <div className="flex items-center space-x-2 mb-3">
          <button
            onClick={() => setShowGrid(!showGrid)}
            className={`p-2 rounded transition-colors ${showGrid ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
            title="Toggle Grid"
          >
            <Grid3X3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowRuler(!showRuler)}
            className={`p-2 rounded transition-colors ${showRuler ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
            title="Toggle Ruler"
          >
            <Ruler className="w-4 h-4" />
          </button>
          <button
            onClick={() => setSnapToGrid(!snapToGrid)}
            className={`p-2 rounded transition-colors ${snapToGrid ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
            title="Snap to Grid"
          >
            <Magnet className="w-4 h-4" />
          </button>
        </div>
        
        {/* Action Buttons */}
        <div className="flex space-x-2">
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
      </div>

      {/* Enhanced Context Menu */}
      {contextMenu.show && (
        <div
          className="fixed z-50 bg-gray-900/95 backdrop-blur-xl border border-gray-700 rounded-xl shadow-2xl py-2 min-w-64 animate-fade-in"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          <div className="px-4 py-2 border-b border-gray-700">
            <div className="text-xs font-medium text-blue-400 uppercase tracking-wide">
              {contextMenu.element?.type || 'Element'} Actions
            </div>
            {contextMenu.multiSelect && (
              <div className="text-xs text-gray-400 mt-1">
                {multiSelectedElements.length} elements selected
              </div>
            )}
          </div>
          
          <button
            onClick={() => handleAdvancedTextEdit(contextMenu.element)}
            className="w-full px-4 py-3 text-left text-sm text-white hover:bg-gray-800 flex items-center transition-colors group"
          >
            <Type className="w-5 h-5 mr-3 text-blue-400 group-hover:text-blue-300" />
            <div>
              <div className="font-medium">Advanced Text Edit</div>
              <div className="text-xs text-gray-400">Rich formatting & styling</div>
            </div>
          </button>
          
          <button
            onClick={() => handleAdvancedImageEdit(contextMenu.element)}
            className="w-full px-4 py-3 text-left text-sm text-white hover:bg-gray-800 flex items-center transition-colors group"
          >
            <ImageIcon className="w-5 h-5 mr-3 text-green-400 group-hover:text-green-300" />
            <div>
              <div className="font-medium">Advanced Image Edit</div>
              <div className="text-xs text-gray-400">Filters, rotate, flip</div>
            </div>
          </button>
          
          <button
            onClick={() => {
              const input = document.createElement('input');
              input.type = 'color';
              input.onchange = (e) => {
                if (contextMenu.element?.element) {
                  contextMenu.element.element.style.color = e.target.value;
                }
              };
              input.click();
              setContextMenu({ show: false, x: 0, y: 0, element: null });
            }}
            className="w-full px-4 py-3 text-left text-sm text-white hover:bg-gray-800 flex items-center transition-colors group"
          >
            <Palette className="w-5 h-5 mr-3 text-purple-400 group-hover:text-purple-300" />
            <div>
              <div className="font-medium">Color Picker</div>
              <div className="text-xs text-gray-400">Change text & background</div>
            </div>
          </button>
          
          <button
            onClick={() => {
              if (contextMenu.element) {
                handleDragStart(contextMenu.element, { 
                  clientX: contextMenu.x, 
                  clientY: contextMenu.y 
                });
              }
              setContextMenu({ show: false, x: 0, y: 0, element: null });
            }}
            className="w-full px-4 py-3 text-left text-sm text-white hover:bg-gray-800 flex items-center transition-colors group"
          >
            <Move className="w-5 h-5 mr-3 text-orange-400 group-hover:text-orange-300" />
            <div>
              <div className="font-medium">Drag & Reposition</div>
              <div className="text-xs text-gray-400">Move element around</div>
            </div>
          </button>
          
          <div className="border-t border-gray-700 my-2"></div>
          
          <button
            onClick={() => {
              if (contextMenu.element?.element) {
                const el = contextMenu.element.element;
                const clone = el.cloneNode(true);
                el.parentNode.insertBefore(clone, el.nextSibling);
              }
              setContextMenu({ show: false, x: 0, y: 0, element: null });
            }}
            className="w-full px-4 py-3 text-left text-sm text-white hover:bg-gray-800 flex items-center transition-colors group"
          >
            <Copy className="w-5 h-5 mr-3 text-cyan-400 group-hover:text-cyan-300" />
            <div className="font-medium">Duplicate Element</div>
          </button>
          
          <button
            onClick={() => {
              if (contextMenu.element?.element) {
                contextMenu.element.element.style.display = 'none';
              }
              setContextMenu({ show: false, x: 0, y: 0, element: null });
            }}
            className="w-full px-4 py-3 text-left text-sm text-red-400 hover:bg-gray-800 flex items-center transition-colors group"
          >
            <Trash2 className="w-5 h-5 mr-3 group-hover:text-red-300" />
            <div className="font-medium">Hide Element</div>
          </button>
        </div>
      )}

      {/* Selection Indicators */}
      {multiSelectedElements.map((element, index) => (
        <div
          key={element.id}
          className="fixed border-2 border-blue-500 bg-blue-500/10 pointer-events-none z-40 rounded animate-pulse"
          style={{
            left: element.rect.left,
            top: element.rect.top,
            width: element.rect.width,
            height: element.rect.height,
          }}
        >
          <div className="absolute -top-6 left-0 bg-blue-500 text-white px-2 py-1 rounded text-xs font-medium">
            {element.type} #{index + 1}
          </div>
        </div>
      ))}

      {/* Hover Indicator */}
      {hoveredElement && (
        <div
          className="fixed border-2 border-dashed border-cyan-400 pointer-events-none z-35 rounded"
          style={{
            left: hoveredElement.rect.left,
            top: hoveredElement.rect.top,
            width: hoveredElement.rect.width,
            height: hoveredElement.rect.height,
          }}
        >
          <div className="absolute -top-6 left-0 bg-cyan-400 text-black px-2 py-1 rounded text-xs font-medium">
            Hover: {hoveredElement.type}
          </div>
        </div>
      )}

      {/* Drag Preview Ghost */}
      {dragPreview.show && (
        <div
          className="fixed pointer-events-none z-50 text-white text-sm bg-gray-900 px-3 py-2 rounded-lg shadow-xl"
          style={{ left: dragPreview.x + 10, top: dragPreview.y + 10 }}
        >
          <Move className="w-4 h-4 inline mr-2" />
          Dragging {draggedElement?.type}
        </div>
      )}

      {/* Instructions Panel */}
      <div className="fixed top-4 right-96 z-40 bg-gray-900/95 backdrop-blur-xl border border-gray-700 rounded-xl p-4 max-w-xs">
        <h4 className="font-semibold text-white mb-3 flex items-center">
          <Sparkles className="w-4 h-4 mr-2 text-purple-400" />
          Super Edit Guide
        </h4>
        <ul className="space-y-2 text-xs text-gray-300">
          <li className="flex items-center">
            <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
            <strong>Select:</strong> Click elements to select
          </li>
          <li className="flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            <strong>Multi-select:</strong> Ctrl+click or drag selection box
          </li>
          <li className="flex items-center">
            <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
            <strong>Move:</strong> Switch to move mode & drag
          </li>
          <li className="flex items-center">
            <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
            <strong>Rich Edit:</strong> Right-click for advanced options
          </li>
          <li className="flex items-center">
            <div className="w-2 h-2 bg-cyan-500 rounded-full mr-2"></div>
            <strong>Grid Snap:</strong> Enable for precise positioning
          </li>
        </ul>
      </div>

      {/* CSS for Animations */}
      <style jsx>{`
        @keyframes dropSuccess {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
        
        .element-selected {
          outline: 3px solid #7bdfff !important;
          outline-offset: 2px;
          box-shadow: 0 0 0 6px rgba(123, 223, 255, 0.2) !important;
          position: relative !important;
          z-index: 100 !important;
        }
        
        .drop-zone-active {
          outline: 3px solid #10b981 !important;
          outline-offset: 2px;
          background: rgba(16, 185, 129, 0.1) !important;
        }
        
        .advanced-text-editor-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
        }
        
        .text-editor-panel {
          background: #1a1a2e;
          border: 2px solid #7bdfff;
          border-radius: 12px;
          padding: 20px;
          min-width: 400px;
          max-width: 600px;
        }
        
        .image-editor-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.9);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
        }
        
        .image-editor-panel {
          background: #1a1a2e;
          border: 2px solid #7bdfff;
          border-radius: 12px;
          padding: 20px;
          max-width: 80vw;
          max-height: 80vh;
          overflow-y: auto;
        }
      `}</style>
    </>
  );
};

export default AdvancedInPlaceEditor;