import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BeautifulPasswordCard from './BeautifulPasswordCard';
import SuperAdvancedRightPanel from './SuperAdvancedRightPanel';
import AdvancedRealTimeDimensions from './AdvancedRealTimeDimensions';
import EnhancedContextMenu from './EnhancedContextMenu';
import AdvancedElementSelector from './AdvancedElementSelector';
import AIRedesignAssistant from './AIRedesignAssistant';
import { 
  Settings, 
  Eye, 
  EyeOff, 
  Save, 
  Undo, 
  Redo, 
  Layout, 
  Palette, 
  Type,
  Grid,
  Layers,
  MousePointer,
  Code,
  Download,
  Upload,
  Sparkles,
  Wand2,
  PanelRight,
  PanelRightOpen,
  Video,
  Image,
  Ruler
} from 'lucide-react';

const SuperWebsiteEditor = ({ children, onContentChange, content, setContent }) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [showPasswordCard, setShowPasswordCard] = useState(false);
  const [showToolbar, setShowToolbar] = useState(false);
  const [editHistory, setEditHistory] = useState([]);
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState(-1);
  const [lastSaved, setLastSaved] = useState(null);
  const [selectedElement, setSelectedElement] = useState(null);
  const [hoverElement, setHoverElement] = useState(null);
  const [rightPanelOpen, setRightPanelOpen] = useState(false);
  const [contextMenu, setContextMenu] = useState({ isOpen: false, position: { x: 0, y: 0 } });
  const [showGrid, setShowGrid] = useState(false);
  const [showRulers, setShowRulers] = useState(true);

  const contentRef = useRef(content);

  // Update content ref when content changes
  useEffect(() => {
    contentRef.current = content;
  }, [content]);

  // Auto-save functionality - optimized to prevent panel reloads
  useEffect(() => {
    if (!isEditMode) return;

    let hasChanges = false;
    let lastContentSnapshot = JSON.stringify(contentRef.current);

    const autoSaveInterval = setInterval(() => {
      if (contentRef.current) {
        const currentContentSnapshot = JSON.stringify(contentRef.current);
        
        // Only auto-save if there are actual changes
        if (currentContentSnapshot !== lastContentSnapshot) {
          hasChanges = true;
          lastContentSnapshot = currentContentSnapshot;
          
          // Use a less intrusive auto-save that doesn't trigger UI re-renders
          const savedIndicator = document.getElementById('auto-save-indicator');
          if (savedIndicator) {
            savedIndicator.textContent = 'Saving...';
            savedIndicator.className = 'text-yellow-400 text-xs';
          }
          
          // Simulate save without state changes that cause re-renders
          setTimeout(() => {
            if (savedIndicator) {
              savedIndicator.textContent = `Saved at ${new Date().toLocaleTimeString()}`;
              savedIndicator.className = 'text-green-400 text-xs';
              // Save to localStorage as backup
              localStorage.setItem('portfolio-backup', JSON.stringify(contentRef.current));
              localStorage.setItem('portfolio-backup-timestamp', new Date().toISOString());
            }
          }, 300);
        }
      }
    }, 10000); // Auto-save every 10 seconds instead of 5 (less frequent)

    return () => clearInterval(autoSaveInterval);
  }, [isEditMode]);

  // Handle login
  const handleLogin = async (password) => {
    if (password === 'shipfast') {
      setIsEditMode(true);
      setShowPasswordCard(false);
      setShowToolbar(true);
      setRightPanelOpen(true);
      
      // Initialize edit history
      setEditHistory([JSON.parse(JSON.stringify(content))]);
      setCurrentHistoryIndex(0);
      
      // Add editing attributes to elements
      addEditingAttributes();
      
      return Promise.resolve();
    } else {
      return Promise.reject(new Error('Invalid password'));
    }
  };

  // Add editing attributes to all elements
  const addEditingAttributes = () => {
    const elements = document.querySelectorAll('section, div[class*="section"], header, main, footer, article');
    elements.forEach((element, index) => {
      element.setAttribute('data-editable', 'true');
      element.setAttribute('data-element-id', `element-${index}`);
    });
  };

  // Handle logout
  const handleLogout = () => {
    setIsEditMode(false);
    setShowToolbar(false);
    setRightPanelOpen(false);
    setSelectedElement(null);
    setHoverElement(null);
    setContextMenu({ isOpen: false, position: { x: 0, y: 0 } });
  };

  // Handle right-click context menu
  const handleRightClick = (e) => {
    if (!isEditMode) return;
    
    // Don't show context menu for UI elements
    const isUIElement = e.target.closest(`
      button,
      [data-editor-ui="true"], 
      .fixed,
      [role="button"], 
      .edit-toolbar, 
      .right-panel, 
      .context-menu,
      .bg-gray-900,
      .bg-white,
      .border-gray-200,
      input,
      textarea,
      select,
      .monaco-editor
    `.replace(/\s+/g, ''));
    
    const isInPanel = e.target.closest('[class*="fixed"], [class*="z-["], .edit-toolbar, .right-panel');
    
    if (isUIElement || isInPanel) {
      return; // Don't show context menu for UI elements
    }
    
    e.preventDefault();
    const target = e.target.closest('[data-editable="true"]');
    
    if (target) {
      setSelectedElement(target);
      setContextMenu({
        isOpen: true,
        position: { x: e.clientX, y: e.clientY }
      });
    }
  };

  // Handle element click
  const handleElementClick = (e) => {
    if (!isEditMode) return;
    
    // Comprehensive UI element exclusion
    const isUIElement = e.target.closest(`
      button,
      [data-editor-ui="true"], 
      .fixed,
      [role="button"], 
      .edit-toolbar, 
      .right-panel, 
      .context-menu,
      .bg-gray-900,
      .bg-white,
      .border-gray-200,
      .z-\\[1000\\],
      .z-\\[9900\\],
      .z-\\[9950\\],
      .p-2,
      .p-3,
      .p-4,
      .hover\\:bg-gray-700,
      .hover\\:bg-purple-50,
      .hover\\:bg-gray-100,
      .transition-colors,
      .cursor-pointer,
      .select-none,
      input,
      textarea,
      select,
      .monaco-editor,
      .overflow-hidden,
      .backdrop-blur-xl,
      .shadow-2xl
    `.replace(/\s+/g, ''));
    
    // Also check if the click is within any panel or toolbar containers
    const isInPanel = e.target.closest('[class*="fixed"], [class*="z-["], .edit-toolbar, .right-panel');
    const isInModal = e.target.closest('[class*="backdrop"], [class*="modal"]');
    
    if (isUIElement || isInPanel || isInModal) {
      return; // Let the UI element handle its own click
    }
    
    const target = e.target.closest('[data-editable="true"]');
    if (target) {
      setSelectedElement(target);
      setContextMenu({ isOpen: false, position: { x: 0, y: 0 } });
    }
  };

  // Handle element updates
  const handleElementUpdate = (element, updates) => {
    if (updates.styles) {
      Object.entries(updates.styles).forEach(([property, value]) => {
        element.style[property] = value;
      });
    }
    
    if (updates.dimensions) {
      // Handle dimension updates if needed
    }
    
    // Add to edit history
    addToHistory();
  };

  // Add to edit history
  const addToHistory = () => {
    const newContent = JSON.parse(JSON.stringify(content));
    const newHistory = editHistory.slice(0, currentHistoryIndex + 1);
    newHistory.push(newContent);
    setEditHistory(newHistory);
    setCurrentHistoryIndex(newHistory.length - 1);
  };

  // Handle element actions from context menu
  const handleElementAction = useCallback((action, elementData) => {
    switch (action) {
      case 'edit':
        setSelectedElement(elementData);
        break;
      case 'editText':
        // Enable inline editing for text elements
        if (elementData.element) {
          elementData.element.contentEditable = true;
          elementData.element.focus();
        }
        break;
      case 'style':
        // Open style editor
        console.log('Open style editor for:', elementData);
        break;
      case 'move':
        // Enable drag mode
        console.log('Enable move mode for:', elementData);
        break;
      case 'duplicate':
        // Duplicate element
        console.log('Duplicate element:', elementData);
        break;
      case 'delete':
        // Delete element
        // eslint-disable-next-line no-undef
        if (confirm('Are you sure you want to delete this element?')) {
          console.log('Delete element:', elementData);
        }
        break;
      default:
        console.log('Unknown action:', action, elementData);
    }
  }, []);

  // Handle section movements
  const handleSectionMove = useCallback((fromIndex, toIndex) => {
    console.log('Move section from', fromIndex, 'to', toIndex);
    // Implement section reordering logic here
  }, []);

  // Handle adding new sections
  const handleSectionAdd = useCallback((sectionType, position) => {
    console.log('Add section', sectionType, 'at position', position);
    // Implement new section addition logic here
  }, []);

  // Handle undo/redo
  const handleUndo = useCallback(() => {
    if (currentHistoryIndex > 0) {
      const newIndex = currentHistoryIndex - 1;
      setCurrentHistoryIndex(newIndex);
      setContent(editHistory[newIndex]);
    }
  }, [currentHistoryIndex, editHistory, setContent]);

  const handleRedo = useCallback(() => {
    if (currentHistoryIndex < editHistory.length - 1) {
      const newIndex = currentHistoryIndex + 1;
      setCurrentHistoryIndex(newIndex);
      setContent(editHistory[newIndex]);
    }
  }, [currentHistoryIndex, editHistory, setContent]);

  // Handle save
  const handleSave = useCallback(async () => {
    const savedIndicator = document.getElementById('auto-save-indicator');
    if (savedIndicator) {
      savedIndicator.textContent = 'Saving...';
      savedIndicator.className = 'text-yellow-400 text-xs';
    }
    
    try {
      if (onContentChange) {
        await onContentChange(content);
      }
      setLastSaved(new Date());
      
      if (savedIndicator) {
        savedIndicator.textContent = `Saved at ${new Date().toLocaleTimeString()}`;
        savedIndicator.className = 'text-green-400 text-xs';
      }
    } catch (error) {
      console.error('Save failed:', error);
      if (savedIndicator) {
        savedIndicator.textContent = 'Save failed';
        savedIndicator.className = 'text-red-400 text-xs';
      }
    }
  }, [content, onContentChange]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isEditMode) return;

      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'z':
            e.preventDefault();
            if (e.shiftKey) {
              handleRedo();
            } else {
              handleUndo();
            }
            break;
          case 's':
            e.preventDefault();
            handleSave();
            break;
          case 'e':
            e.preventDefault();
            setIsEditMode(false);
            break;
        }
      }

      if (e.key === 'Escape') {
        setSelectedElement(null);
        setHoverElement(null);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isEditMode, handleUndo, handleRedo, handleSave]);

  // Set up event listeners for editing
  useEffect(() => {
    if (isEditMode) {
      document.addEventListener('contextmenu', handleRightClick);
      document.addEventListener('click', handleElementClick);
    }

    return () => {
      document.removeEventListener('contextmenu', handleRightClick);
      document.removeEventListener('click', handleElementClick);
    };
  }, [isEditMode]);

  return (
    <div className="relative min-h-screen">
      {/* Advanced Element Selector */}
      <AdvancedElementSelector
        isEditMode={isEditMode}
        selectedElement={selectedElement}
        onElementSelect={setSelectedElement}
        onElementUpdate={handleElementUpdate}
        isAuthenticated={isEditMode}
      />

      {/* Advanced Real-time Dimensions */}
      <AdvancedRealTimeDimensions
        selectedElement={selectedElement}
        onDimensionChange={(dims) => handleElementUpdate(selectedElement, { dimensions: dims })}
        isEditMode={isEditMode}
        showGrid={showGrid}
      />

      {/* Enhanced Context Menu */}
      <EnhancedContextMenu
        isOpen={contextMenu.isOpen}
        position={contextMenu.position}
        onClose={() => setContextMenu({ isOpen: false, position: { x: 0, y: 0 } })}
        selectedElement={selectedElement}
        onElementUpdate={handleElementUpdate}
      />

      {/* Super Advanced Right Panel */}
      <SuperAdvancedRightPanel
        isOpen={rightPanelOpen}
        onToggle={() => setRightPanelOpen(!rightPanelOpen)}
        selectedElement={selectedElement}
        onElementUpdate={handleElementUpdate}
        content={content}
        onContentChange={onContentChange}
        isAuthenticated={isEditMode}
      />

      {/* Floating Edit Button */}
      {!isEditMode && (
        <motion.button
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="fixed bottom-6 right-6 z-[10000] bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 text-white p-4 rounded-full shadow-2xl shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300"
          onClick={() => setShowPasswordCard(true)}
          title="Enter Edit Mode"
            >
              <Wand2 size={24} />
            </motion.button>
          )}

          {/* Edit Mode Toolbar */}
          <AnimatePresence>
            {showToolbar && isEditMode && (
              <motion.div
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -100, opacity: 0 }}
                className="fixed top-0 left-0 right-0 z-[9950] bg-gray-900/95 backdrop-blur-xl border-b border-gray-700/50 shadow-2xl edit-toolbar"
                data-editor-ui="true"
              >
                <div className="container mx-auto px-4 py-3">
                  <div className="flex items-center justify-between">
                    {/* Left side - Edit controls */}
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 bg-gray-800/50 rounded-lg p-1" data-editor-ui="true">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleUndo();
                          }}
                          disabled={currentHistoryIndex <= 0}
                          className="p-2 hover:bg-gray-700 rounded text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          title="Undo (Ctrl+Z)"
                          data-editor-ui="true"
                        >
                          <Undo size={16} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleRedo();
                          }}
                          disabled={currentHistoryIndex >= editHistory.length - 1}
                          className="p-2 hover:bg-gray-700 rounded text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          title="Redo (Ctrl+Shift+Z)"
                          data-editor-ui="true"
                        >
                          <Redo size={16} />
                        </button>
                      </div>

                      <div className="flex items-center gap-1 bg-gray-800/50 rounded-lg p-1" data-editor-ui="true">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                          className="p-2 hover:bg-gray-700 rounded text-gray-400 hover:text-white transition-colors"
                          title="Layout Tools"
                          data-editor-ui="true"
                        >
                          <Layout size={16} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                          className="p-2 hover:bg-gray-700 rounded text-gray-400 hover:text-white transition-colors"
                          title="Style Editor"
                          data-editor-ui="true"
                        >
                          <Palette size={16} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                          className="p-2 hover:bg-gray-700 rounded text-gray-400 hover:text-white transition-colors"
                          title="Typography"
                          data-editor-ui="true"
                        >
                          <Type size={16} />
                        </button>
                      </div>

                      <div className="flex items-center gap-1 bg-gray-800/50 rounded-lg p-1" data-editor-ui="true">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            console.log('Grid toggle clicked, current:', showGrid);
                            setShowGrid(!showGrid);
                          }}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                          className={`p-3 hover:bg-gray-700 rounded transition-colors cursor-pointer select-none ${showGrid ? 'text-blue-400 bg-blue-500/20' : 'text-gray-400 hover:text-white'}`}
                          title="Toggle Grid"
                          data-editor-ui="true"
                          style={{ 
                            minWidth: '40px',
                            minHeight: '40px',
                            userSelect: 'none',
                            WebkitUserSelect: 'none'
                          }}
                        >
                          <Grid size={16} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            console.log('Rulers toggle clicked, current:', showRulers);
                            setShowRulers(!showRulers);
                          }}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                          className={`p-3 hover:bg-gray-700 rounded transition-colors cursor-pointer select-none ${showRulers ? 'text-blue-400 bg-blue-500/20' : 'text-gray-400 hover:text-white'}`}
                          title="Toggle Rulers"
                          data-editor-ui="true"
                          style={{ 
                            minWidth: '40px',
                            minHeight: '40px',
                            userSelect: 'none',
                            WebkitUserSelect: 'none'
                          }}
                        >
                          <Ruler size={16} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            console.log('Right panel toggle clicked, current:', rightPanelOpen);
                            setRightPanelOpen(!rightPanelOpen);
                          }}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                          className={`p-2 hover:bg-gray-700 rounded transition-colors ${rightPanelOpen ? 'text-blue-400 bg-blue-500/20' : 'text-gray-400 hover:text-white'}`}
                          title="Advanced Panel"
                          data-editor-ui="true"
                        >
                          {rightPanelOpen ? <PanelRightOpen size={16} /> : <PanelRight size={16} />}
                        </button>
                      </div>

                      <div className="flex items-center gap-1 bg-gray-800/50 rounded-lg p-1">
                        <button
                          className="p-2 hover:bg-gray-700 rounded text-gray-400 hover:text-white transition-colors"
                          title="Upload Video"
                        >
                          <Video size={16} />
                        </button>
                        <button
                          className="p-2 hover:bg-gray-700 rounded text-gray-400 hover:text-white transition-colors"
                          title="Upload Image"
                        >
                          <Image size={16} />
                        </button>
                        <button
                          className="p-2 hover:bg-gray-700 rounded text-gray-400 hover:text-white transition-colors"
                          title="AI Assistant"
                        >
                          <Sparkles size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Center - Status */}
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-sm text-green-400 font-medium">
                          Edit Mode Active
                        </span>
                      </div>

                      {/* Auto-save status - non-reactive indicator */}
                      <div id="auto-save-indicator" className="text-gray-400 text-xs">
                        Ready to save
                      </div>

                      {lastSaved && (
                        <span className="text-xs text-gray-500">
                          Last saved: {lastSaved.toLocaleTimeString()}
                        </span>
                      )}
                    </div>

                    {/* Right side - Actions */}
                    <div className="flex items-center gap-3">
                      <button
                        onClick={handleSave}
                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                        title="Save Changes (Ctrl+S)"
                      >
                        <Save size={16} />
                        Save
                      </button>
                      
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                        title="Exit Edit Mode (Ctrl+E)"
                      >
                        <EyeOff size={16} />
                        Exit
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Content with editing capabilities */}
          <div 
            className={`
              ${isEditMode ? 'pt-16' : ''} 
              ${isEditMode ? 'edit-mode-active' : ''}
              ${isEditMode ? 'relative z-20' : ''}
            `}
          >
            {children}
          </div>

          {/* Edit Mode Overlay Styles */}
          {isEditMode && (
            <style>{`
              .edit-mode-active .editable-element {
                position: relative;
              }
              
              .edit-mode-active *:hover {
                outline: 2px dashed rgba(59, 130, 246, 0.5) !important;
                outline-offset: 2px;
              }
              
              .edit-mode-active [contenteditable="true"] {
                outline: 2px solid rgba(59, 130, 246, 0.8) !important;
                outline-offset: 2px;
                background: rgba(59, 130, 246, 0.1) !important;
              }
            `}</style>
          )}

          {/* Password Card */}
          <BeautifulPasswordCard
            isOpen={showPasswordCard}
            onClose={() => setShowPasswordCard(false)}
            onLogin={handleLogin}
          />

          {/* Edit Mode Help */}
          <AnimatePresence>
            {isEditMode && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="fixed bottom-6 left-6 bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-lg p-4 max-w-sm z-30"
              >
                <h3 className="text-white font-medium mb-2 flex items-center gap-2">
                  <Sparkles size={16} className="text-blue-400" />
                  Edit Mode Tips
                </h3>
                <ul className="text-sm text-gray-400 space-y-1">
                  <li>• Right-click any element to edit</li>
                  <li>• Click text to edit inline</li>
                  <li>• Drag sections to reorder</li>
                  <li>• Ctrl+Z to undo, Ctrl+Y to redo</li>
                  <li>• Ctrl+S to save manually</li>
                  <li>• ESC to exit selection</li>
                </ul>
              </motion.div>
            )}
          </AnimatePresence>
    </div>
  );
};

export default SuperWebsiteEditor;