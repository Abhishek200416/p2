import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BeautifulPasswordCard from './BeautifulPasswordCard';
import SuperAdvancedRightPanel from './SuperAdvancedRightPanel';
import AdvancedRealTimeDimensions from './AdvancedRealTimeDimensions';
import EnhancedContextMenu from './EnhancedContextMenu';
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
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [selectedElement, setSelectedElement] = useState(null);
  const [hoverElement, setHoverElement] = useState(null);
  const [rightPanelOpen, setRightPanelOpen] = useState(false);
  const [contextMenu, setContextMenu] = useState({ isOpen: false, position: { x: 0, y: 0 } });
  const [showGrid, setShowGrid] = useState(true);
  const [showRulers, setShowRulers] = useState(true);

  const contentRef = useRef(content);

  // Update content ref when content changes
  useEffect(() => {
    contentRef.current = content;
  }, [content]);

  // Auto-save functionality
  useEffect(() => {
    if (!isEditMode) return;

    const autoSaveInterval = setInterval(() => {
      if (contentRef.current) {
        setIsAutoSaving(true);
        // Simulate save
        setTimeout(() => {
          setIsAutoSaving(false);
          setLastSaved(new Date());
        }, 500);
      }
    }, 5000); // Auto-save every 5 seconds

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
    setSelectedElement(null);
    setHoverElement(null);
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
    setIsAutoSaving(true);
    try {
      if (onContentChange) {
        await onContentChange(content);
      }
      setLastSaved(new Date());
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      setIsAutoSaving(false);
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

  return (
    <DragDropProvider
      isEditMode={isEditMode}
      onSectionMove={handleSectionMove}
      onSectionAdd={handleSectionAdd}
    >
      <ContextMenuProvider
        isEditMode={isEditMode}
        onElementAction={handleElementAction}
      >
        <div className="relative min-h-screen">
          {/* Floating Edit Button */}
          {!isEditMode && (
            <motion.button
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 text-white p-4 rounded-full shadow-2xl shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300"
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
                className="fixed top-0 left-0 right-0 z-40 bg-gray-900/95 backdrop-blur-xl border-b border-gray-700/50 shadow-2xl"
              >
                <div className="container mx-auto px-4 py-3">
                  <div className="flex items-center justify-between">
                    {/* Left side - Edit controls */}
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 bg-gray-800/50 rounded-lg p-1">
                        <button
                          onClick={handleUndo}
                          disabled={currentHistoryIndex <= 0}
                          className="p-2 hover:bg-gray-700 rounded text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          title="Undo (Ctrl+Z)"
                        >
                          <Undo size={16} />
                        </button>
                        <button
                          onClick={handleRedo}
                          disabled={currentHistoryIndex >= editHistory.length - 1}
                          className="p-2 hover:bg-gray-700 rounded text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          title="Redo (Ctrl+Shift+Z)"
                        >
                          <Redo size={16} />
                        </button>
                      </div>

                      <div className="flex items-center gap-1 bg-gray-800/50 rounded-lg p-1">
                        <button
                          className="p-2 hover:bg-gray-700 rounded text-gray-400 hover:text-white transition-colors"
                          title="Layout Tools"
                        >
                          <Layout size={16} />
                        </button>
                        <button
                          className="p-2 hover:bg-gray-700 rounded text-gray-400 hover:text-white transition-colors"
                          title="Style Editor"
                        >
                          <Palette size={16} />
                        </button>
                        <button
                          className="p-2 hover:bg-gray-700 rounded text-gray-400 hover:text-white transition-colors"
                          title="Typography"
                        >
                          <Type size={16} />
                        </button>
                      </div>

                      <div className="flex items-center gap-1 bg-gray-800/50 rounded-lg p-1">
                        <button
                          className="p-2 hover:bg-gray-700 rounded text-gray-400 hover:text-white transition-colors"
                          title="Grid View"
                        >
                          <Grid size={16} />
                        </button>
                        <button
                          className="p-2 hover:bg-gray-700 rounded text-gray-400 hover:text-white transition-colors"
                          title="Layers"
                        >
                          <Layers size={16} />
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

                      {isAutoSaving && (
                        <div className="flex items-center gap-2">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-4 h-4 border-2 border-blue-400/30 border-t-blue-400 rounded-full"
                          />
                          <span className="text-sm text-blue-400">Auto-saving...</span>
                        </div>
                      )}

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
            `}
          >
            {children}
          </div>

          {/* Edit Mode Overlay Styles */}
          {isEditMode && (
            <style jsx>{`
              .edit-mode-active * {
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
      </ContextMenuProvider>
    </DragDropProvider>
  );
};

export default SuperWebsiteEditor;