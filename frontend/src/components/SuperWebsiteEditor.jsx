import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BeautifulPasswordCard from './BeautifulPasswordCard';
import SuperAdvancedRightPanel from './SuperAdvancedRightPanel';
import AdvancedRealTimeDimensions from './AdvancedRealTimeDimensions';
import EnhancedContextMenu from './EnhancedContextMenu';
import AdvancedElementSelector from './AdvancedElementSelector';
import AIRedesignAssistant from './AIRedesignAssistant';
import AdvancedGridOverlay from './AdvancedGridOverlay';
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
  Ruler,
  RotateCcw,
  CheckCircle,
  XCircle,
  Clock,
  Zap,
  Target,
  Move,
  Copy,
  Scissors,
  Maximize2,
  Minimize2,
  RotateCw,
  RefreshCw,
  AlertCircle,
  Info
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
  const [gridSize, setGridSize] = useState(20);
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [autoSaveStatus, setAutoSaveStatus] = useState('ready');
  const [showNotifications, setShowNotifications] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [dragMode, setDragMode] = useState(false);
  const [showHelpPanel, setShowHelpPanel] = useState(true);

  const contentRef = useRef(content);
  const notificationIdRef = useRef(0);

  // Update content ref when content changes
  useEffect(() => {
    contentRef.current = content;
  }, [content]);

  // Enhanced notification system
  const addNotification = useCallback((message, type = 'info', duration = 3000) => {
    const id = ++notificationIdRef.current;
    const notification = { id, message, type, timestamp: Date.now() };
    
    setNotifications(prev => [...prev, notification]);
    
    if (duration > 0) {
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== id));
      }, duration);
    }
    
    return id;
  }, []);

  // Enhanced auto-save functionality with better status tracking
  useEffect(() => {
    if (!isEditMode) return;

    let hasChanges = false;
    let lastContentSnapshot = JSON.stringify(contentRef.current);

    const autoSaveInterval = setInterval(async () => {
      if (contentRef.current) {
        const currentContentSnapshot = JSON.stringify(contentRef.current);
        
        // Only auto-save if there are actual changes
        if (currentContentSnapshot !== lastContentSnapshot) {
          hasChanges = true;
          lastContentSnapshot = currentContentSnapshot;
          
          setAutoSaveStatus('saving');
          addNotification('Auto-saving changes...', 'info', 1000);
          
          try {
            if (onContentChange) {
              await onContentChange(contentRef.current);
            }
            
            // Save to localStorage as backup
            localStorage.setItem('portfolio-backup', JSON.stringify(contentRef.current));
            localStorage.setItem('portfolio-backup-timestamp', new Date().toISOString());
            
            setAutoSaveStatus('saved');
            setLastSaved(new Date());
            addNotification('Changes auto-saved successfully', 'success', 2000);
            
          } catch (error) {
            console.error('Auto-save failed:', error);
            setAutoSaveStatus('error');
            addNotification('Auto-save failed - changes saved locally', 'error', 4000);
          }
        }
      }
    }, 8000); // Auto-save every 8 seconds (optimized)

    return () => clearInterval(autoSaveInterval);
  }, [isEditMode, onContentChange, addNotification]);

  // Handle login with enhanced feedback
  const handleLogin = async (password) => {
    console.log('handleLogin called with password:', password);
    try {
      if (password === 'shipfast') {
        console.log('Password correct, activating edit mode');
        setIsEditMode(true);
        setShowPasswordCard(false);
        setShowToolbar(true);
        setRightPanelOpen(true);
        
        // Initialize edit history
        setEditHistory([JSON.parse(JSON.stringify(content))]);
        setCurrentHistoryIndex(0);
        
        // Add editing attributes to elements
        addEditingAttributes();
        
        // Show welcome notification
        addNotification('🚀 Super Edit Mode Activated!', 'success', 5000);
        addNotification('Right-click elements to edit, use toolbar for advanced features', 'info', 7000);
        
        console.log('Edit mode activated successfully');
        return Promise.resolve();
      } else {
        console.log('Password incorrect:', password);
        return Promise.reject(new Error('Invalid password'));
      }
    } catch (error) {
      console.error('Error in handleLogin:', error);
      return Promise.reject(error);
    }
  };

  // Add editing attributes to all elements with enhanced detection
  const addEditingAttributes = () => {
    const elements = document.querySelectorAll('section, div[class*="section"], header, main, footer, article, h1, h2, h3, h4, h5, h6, p, span, a, img');
    elements.forEach((element, index) => {
      // Skip editor UI elements
      if (element.closest('[data-editor-ui="true"]') || element.closest('.fixed')) {
        return;
      }
      
      element.setAttribute('data-editable', 'true');
      element.setAttribute('data-element-id', `element-${index}`);
      element.setAttribute('data-original-styles', JSON.stringify({
        position: element.style.position,
        left: element.style.left,
        top: element.style.top,
        transform: element.style.transform
      }));
    });
  };

  // Enhanced logout with cleanup
  const handleLogout = () => {
    console.log('handleLogout called - starting exit process');
    
    // Show confirmation for unsaved changes
    if (autoSaveStatus === 'saving') {
      if (!window.confirm('Auto-save is in progress. Are you sure you want to exit?')) {
        console.log('User cancelled exit due to auto-save in progress');
        return;
      }
    }
    
    console.log('Proceeding with logout - setting states');
    setIsEditMode(false);
    setShowToolbar(false);
    setRightPanelOpen(false);
    setSelectedElement(null);
    setHoverElement(null);
    setContextMenu({ isOpen: false, position: { x: 0, y: 0 } });
    setDragMode(false);
    setShowGrid(false);
    
    console.log('Cleaning up element attributes');
    // Clean up element attributes
    const elements = document.querySelectorAll('[data-editable="true"]');
    elements.forEach(element => {
      element.removeAttribute('data-editable');
      element.removeAttribute('data-element-id');
      element.removeAttribute('data-selected');
      element.removeAttribute('contenteditable');
      element.style.outline = '';
      element.style.outlineOffset = '';
      element.style.cursor = '';
    });
    
    console.log('Exit completed successfully');
    addNotification('Edit mode deactivated', 'info', 2000);
  };

  // Enhanced right-click context menu with better targeting
  const handleRightClick = (e) => {
    if (!isEditMode) return;
    
    // Always allow UI elements to handle right-clicks normally
    const editorUIElement = e.target.closest('[data-editor-ui="true"]');
    if (editorUIElement) {
      return;
    }
    
    // Allow normal right-click on form elements and interactive items
    const interactiveElement = e.target.closest('button, input, textarea, select, a[href], [contenteditable="true"]');
    if (interactiveElement) {
      return;
    }
    
    // Only show custom context menu on editable content
    const editableTarget = e.target.closest('[data-editable="true"]') || e.target;
    if (editableTarget && !editableTarget.closest('[data-editor-ui="true"]')) {
      e.preventDefault();
      setSelectedElement(editableTarget);
      setContextMenu({
        isOpen: true,
        position: { x: e.clientX, y: e.clientY }
      });
      addNotification('Right-click menu opened', 'info', 1500);
    }
  };

  // Enhanced element click with better interaction handling
  const handleElementClick = (e) => {
    if (!isEditMode) return;
    
    // Priority 1: Always allow data-editor-ui elements to work - MOST IMPORTANT
    const editorUIElement = e.target.closest('[data-editor-ui="true"]');
    if (editorUIElement) {
      console.log('Editor UI element clicked, allowing normal behavior');
      return; // Let the UI element handle its own click completely
    }
    
    // Priority 2: Allow buttons, inputs, and interactive elements
    const interactiveElement = e.target.closest('button, input, textarea, select, a[href], [role="button"], [tabindex]');
    if (interactiveElement) {
      console.log('Interactive element clicked, allowing normal behavior');
      return; // Let interactive elements work normally
    }
    
    // Priority 3: Allow panel and toolbar interactions - EXPLICIT CHECK
    const panelElement = e.target.closest('.edit-toolbar, .right-panel, .context-menu, .monaco-editor, .fixed');
    if (panelElement) {
      console.log('Panel/toolbar element clicked, allowing normal behavior');
      return; // Let panels and toolbars handle their own clicks
    }
    
    // Only handle element selection for actual page content
    const editableTarget = e.target.closest('[data-editable="true"]');
    if (editableTarget && !editableTarget.closest('[data-editor-ui="true"]')) {
      console.log('Selecting page element:', editableTarget.tagName);
      
      // Clear previous selection
      if (selectedElement && selectedElement !== editableTarget) {
        selectedElement.style.outline = '';
        selectedElement.style.outlineOffset = '';
        selectedElement.removeAttribute('data-selected');
      }
      
      setSelectedElement(editableTarget);
      setContextMenu({ isOpen: false, position: { x: 0, y: 0 } });
      
      // Highlight selected element
      editableTarget.style.outline = '3px solid rgba(139, 92, 246, 0.8)';
      editableTarget.style.outlineOffset = '2px';
      editableTarget.setAttribute('data-selected', 'true');
      
      addNotification(`Selected: ${editableTarget.tagName.toLowerCase()}`, 'info', 2000);
    }
  };

  // Enhanced element updates with grid snapping
  const handleElementUpdate = (element, updates) => {
    if (!element) return;
    
    if (updates.styles) {
      Object.entries(updates.styles).forEach(([property, value]) => {
        if (snapToGrid && (property === 'left' || property === 'top')) {
          const numValue = parseFloat(value);
          const snappedValue = Math.round(numValue / gridSize) * gridSize;
          element.style[property] = snappedValue + 'px';
        } else {
          element.style[property] = value;
        }
      });
    }
    
    if (updates.attributes) {
      Object.entries(updates.attributes).forEach(([attr, value]) => {
        element.setAttribute(attr, value);
      });
    }
    
    // Add to edit history
    addToHistory();
    addNotification('Element updated', 'success', 1500);
  };

  // Enhanced history management
  const addToHistory = () => {
    const newContent = JSON.parse(JSON.stringify(content));
    const newHistory = editHistory.slice(0, currentHistoryIndex + 1);
    newHistory.push(newContent);
    
    // Limit history to prevent memory issues
    if (newHistory.length > 50) {
      newHistory.shift();
    } else {
      setCurrentHistoryIndex(newHistory.length - 1);
    }
    
    setEditHistory(newHistory);
  };

  // Enhanced undo/redo with notifications
  const handleUndo = useCallback(() => {
    if (currentHistoryIndex > 0) {
      const newIndex = currentHistoryIndex - 1;
      setCurrentHistoryIndex(newIndex);
      setContent(editHistory[newIndex]);
      addNotification('Undid last change', 'info', 1500);
    } else {
      addNotification('Nothing to undo', 'warning', 2000);
    }
  }, [currentHistoryIndex, editHistory, setContent, addNotification]);

  const handleRedo = useCallback(() => {
    if (currentHistoryIndex < editHistory.length - 1) {
      const newIndex = currentHistoryIndex + 1;
      setCurrentHistoryIndex(newIndex);
      setContent(editHistory[newIndex]);
      addNotification('Redid last change', 'info', 1500);
    } else {
      addNotification('Nothing to redo', 'warning', 2000);
    }
  }, [currentHistoryIndex, editHistory, setContent, addNotification]);

  // Enhanced save with better feedback
  const handleSave = useCallback(async () => {
    setAutoSaveStatus('saving');
    addNotification('Saving changes manually...', 'info');
    
    try {
      if (onContentChange) {
        await onContentChange(content);
      }
      setLastSaved(new Date());
      setAutoSaveStatus('saved');
      addNotification('✅ Changes saved successfully!', 'success', 3000);
    } catch (error) {
      console.error('Save failed:', error);
      setAutoSaveStatus('error');
      addNotification('❌ Save failed - please try again', 'error', 5000);
    }
  }, [content, onContentChange, addNotification]);

  // Enhanced grid toggle
  const toggleGrid = () => {
    const newGridState = !showGrid;
    setShowGrid(newGridState);
    addNotification(
      newGridState ? 'Grid overlay enabled' : 'Grid overlay disabled', 
      'info', 
      2000
    );
  };

  // Enhanced rulers toggle
  const toggleRulers = () => {
    const newRulersState = !showRulers;
    setShowRulers(newRulersState);
    addNotification(
      newRulersState ? 'Rulers enabled' : 'Rulers disabled', 
      'info', 
      2000
    );
  };

  // Enhanced keyboard shortcuts
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
            handleLogout();
            break;
          case 'g':
            e.preventDefault();
            toggleGrid();
            break;
          case 'r':
            e.preventDefault();
            toggleRulers();
            break;
          case 'd':
            e.preventDefault();
            setDragMode(!dragMode);
            addNotification(
              dragMode ? 'Drag mode disabled' : 'Drag mode enabled', 
              'info', 
              2000
            );
            break;
        }
      }

      if (e.key === 'Escape') {
        setSelectedElement(null);
        setHoverElement(null);
        setContextMenu({ isOpen: false, position: { x: 0, y: 0 } });
        setDragMode(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isEditMode, handleUndo, handleRedo, handleSave, showGrid, showRulers, dragMode, addNotification]);

  // Enhanced event listeners for editing
  useEffect(() => {
    if (isEditMode) {
      document.addEventListener('contextmenu', handleRightClick, false);
      document.addEventListener('click', handleElementClick, false);
    }

    return () => {
      document.removeEventListener('contextmenu', handleRightClick, false);
      document.removeEventListener('click', handleElementClick, false);
    };
  }, [isEditMode]);

  // Auto-save status component
  const AutoSaveIndicator = () => (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1">
        {autoSaveStatus === 'saving' && (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-3 h-3"
          >
            <RefreshCw className="w-3 h-3 text-blue-400" />
          </motion.div>
        )}
        {autoSaveStatus === 'saved' && <CheckCircle className="w-3 h-3 text-green-400" />}
        {autoSaveStatus === 'error' && <XCircle className="w-3 h-3 text-red-400" />}
        {autoSaveStatus === 'ready' && <Clock className="w-3 h-3 text-gray-400" />}
        
        <span className={`text-xs ${
          autoSaveStatus === 'saved' ? 'text-green-400' :
          autoSaveStatus === 'saving' ? 'text-blue-400' :
          autoSaveStatus === 'error' ? 'text-red-400' :
          'text-gray-400'
        }`}>
          {autoSaveStatus === 'saving' ? 'Saving...' :
           autoSaveStatus === 'saved' ? 'Auto-saved' :
           autoSaveStatus === 'error' ? 'Save failed' :
           'Ready to save'}
        </span>
      </div>
      
      {lastSaved && (
        <span className="text-xs text-gray-500">
          {lastSaved.toLocaleTimeString()}
        </span>
      )}
    </div>
  );

  // Enhanced notification component
  const NotificationCenter = () => (
    <AnimatePresence>
      {showNotifications && notifications.length > 0 && (
        <div className="fixed top-20 right-4 z-[10000] space-y-2" data-editor-ui="true">
          {notifications.slice(-3).map((notification) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, x: 100, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.9 }}
              className={`px-4 py-2 rounded-lg shadow-lg backdrop-blur-sm max-w-xs ${
                notification.type === 'success' ? 'bg-green-600/90 text-white' :
                notification.type === 'error' ? 'bg-red-600/90 text-white' :
                notification.type === 'warning' ? 'bg-yellow-600/90 text-white' :
                'bg-blue-600/90 text-white'
              }`}
            >
              <div className="flex items-center gap-2">
                {notification.type === 'success' && <CheckCircle className="w-4 h-4" />}
                {notification.type === 'error' && <XCircle className="w-4 h-4" />}
                {notification.type === 'warning' && <AlertCircle className="w-4 h-4" />}
                {notification.type === 'info' && <Info className="w-4 h-4" />}
                <span className="text-sm">{notification.message}</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </AnimatePresence>
  );

  return (
    <div className="relative min-h-screen">
      {/* Enhanced Grid Overlay */}
      {showGrid && isEditMode && (
        <AdvancedGridOverlay
          gridSize={gridSize}
          snapToGrid={snapToGrid}
          onGridSizeChange={setGridSize}
          onSnapToggle={setSnapToGrid}
        />
      )}

      {/* Advanced Element Selector */}
      <AdvancedElementSelector
        isEditMode={isEditMode}
        selectedElement={selectedElement}
        onElementSelect={setSelectedElement}
        onElementUpdate={handleElementUpdate}
        isAuthenticated={isEditMode}
        dragMode={dragMode}
        snapToGrid={snapToGrid}
        gridSize={gridSize}
      />

      {/* Advanced Real-time Dimensions */}
      <AdvancedRealTimeDimensions
        selectedElement={selectedElement}
        onDimensionChange={(dims) => handleElementUpdate(selectedElement, { dimensions: dims })}
        isEditMode={isEditMode}
        showGrid={showGrid}
        showRulers={showRulers}
      />

      {/* Enhanced Context Menu */}
      <EnhancedContextMenu
        isOpen={contextMenu.isOpen}
        position={contextMenu.position}
        onClose={() => setContextMenu({ isOpen: false, position: { x: 0, y: 0 } })}
        selectedElement={selectedElement}
        onElementUpdate={handleElementUpdate}
        onAction={addNotification}
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
        gridSize={gridSize}
        snapToGrid={snapToGrid}
        onNotification={addNotification}
      />

      {/* Notification Center */}
      <NotificationCenter />

      {/* Floating Edit Button */}
      {!isEditMode && (
        <motion.button
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.9 }}
          className="fixed bottom-6 right-6 z-[10000] bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 text-white p-4 rounded-full shadow-2xl shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300 group"
          onClick={() => setShowPasswordCard(true)}
          title="Enter Edit Mode"
        >
          <div className="relative">
            <Wand2 size={24} />
            <motion.div
              className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full"
              animate={{ scale: [1, 1.2, 1], opacity: [0.8, 1, 0.8] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
        </motion.button>
      )}

      {/* Enhanced Edit Mode Toolbar */}
      <AnimatePresence>
        {showToolbar && isEditMode && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="fixed top-0 left-0 right-0 z-[9950] bg-gradient-to-r from-gray-900/95 via-slate-900/95 to-gray-900/95 backdrop-blur-xl border-b border-gray-700/50 shadow-2xl edit-toolbar"
            data-editor-ui="true"
          >
            <div className="container mx-auto px-4 py-3">
              <div className="flex items-center justify-between">
                {/* Left side - Edit controls */}
                <div className="flex items-center gap-3">
                  {/* History Controls */}
                  <div className="flex items-center gap-1 bg-gray-800/50 rounded-lg p-1" data-editor-ui="true">
                    <button
                      onClick={handleUndo}
                      disabled={currentHistoryIndex <= 0}
                      className="p-2 hover:bg-gray-700 rounded text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      title="Undo (Ctrl+Z)"
                      data-editor-ui="true"
                      type="button"
                    >
                      <Undo size={16} />
                    </button>
                    <button
                      onClick={handleRedo}
                      disabled={currentHistoryIndex >= editHistory.length - 1}
                      className="p-2 hover:bg-gray-700 rounded text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      title="Redo (Ctrl+Shift+Z)"
                      data-editor-ui="true"
                      type="button"
                    >
                      <Redo size={16} />
                    </button>
                  </div>

                  {/* Layout Tools */}
                  <div className="flex items-center gap-1 bg-gray-800/50 rounded-lg p-1" data-editor-ui="true">
                    <button
                      onClick={() => setRightPanelOpen(true)}
                      className="p-2 hover:bg-gray-700 rounded text-gray-400 hover:text-white transition-colors"
                      title="Layout Tools"
                      data-editor-ui="true"
                      type="button"
                    >
                      <Layout size={16} />
                    </button>
                    <button
                      onClick={() => setRightPanelOpen(true)}
                      className="p-2 hover:bg-gray-700 rounded text-gray-400 hover:text-white transition-colors"
                      title="Style Editor"
                      data-editor-ui="true"
                      type="button"
                    >
                      <Palette size={16} />
                    </button>
                    <button
                      onClick={() => setRightPanelOpen(true)}
                      className="p-2 hover:bg-gray-700 rounded text-gray-400 hover:text-white transition-colors"
                      title="Typography"
                      data-editor-ui="true"
                      type="button"
                    >
                      <Type size={16} />
                    </button>
                  </div>

                  {/* Grid and View Controls */}
                  <div className="flex items-center gap-1 bg-gray-800/50 rounded-lg p-1" data-editor-ui="true">
                    <button
                      onClick={toggleGrid}
                      className={`p-2 hover:bg-gray-700 rounded transition-colors ${showGrid ? 'text-blue-400 bg-blue-500/20' : 'text-gray-400 hover:text-white'}`}
                      title="Toggle Grid (Ctrl+G)"
                      data-editor-ui="true"
                      type="button"
                    >
                      <Grid size={16} />
                    </button>
                    <button
                      onClick={toggleRulers}
                      className={`p-2 hover:bg-gray-700 rounded transition-colors ${showRulers ? 'text-blue-400 bg-blue-500/20' : 'text-gray-400 hover:text-white'}`}
                      title="Toggle Rulers (Ctrl+R)"
                      data-editor-ui="true"
                      type="button"
                    >
                      <Ruler size={16} />
                    </button>
                    <button
                      onClick={() => setRightPanelOpen(!rightPanelOpen)}
                      className={`p-2 hover:bg-gray-700 rounded transition-colors ${rightPanelOpen ? 'text-blue-400 bg-blue-500/20' : 'text-gray-400 hover:text-white'}`}
                      title="Advanced Panel"
                      data-editor-ui="true"
                      type="button"
                    >
                      {rightPanelOpen ? <PanelRightOpen size={16} /> : <PanelRight size={16} />}
                    </button>
                  </div>

                  {/* Upload Tools */}
                  <div className="flex items-center gap-1 bg-gray-800/50 rounded-lg p-1" data-editor-ui="true">
                    <button
                      onClick={() => {
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.accept = 'video/*';
                        input.multiple = true;
                        input.click();
                      }}
                      className="p-2 hover:bg-gray-700 rounded text-gray-400 hover:text-white transition-colors"
                      title="Upload Video"
                      data-editor-ui="true"
                      type="button"
                    >
                      <Video size={16} />
                    </button>
                    <button
                      onClick={() => {
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.accept = 'image/*';
                        input.multiple = true;
                        input.click();
                      }}
                      className="p-2 hover:bg-gray-700 rounded text-gray-400 hover:text-white transition-colors"
                      title="Upload Image"
                      data-editor-ui="true"
                      type="button"
                    >
                      <Image size={16} />
                    </button>
                    <button
                      onClick={() => {
                        setRightPanelOpen(true);
                        setTimeout(() => {
                          const aiTab = document.querySelector('[data-tab="ai"]');
                          if (aiTab) aiTab.click();
                        }, 300);
                      }}
                      className="p-2 hover:bg-gray-700 rounded text-gray-400 hover:text-white transition-colors"
                      title="AI Assistant"
                      data-editor-ui="true"
                      type="button"
                    >
                      <Sparkles size={16} />
                    </button>
                  </div>
                </div>

                {/* Center - Status */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <motion.div 
                      className="w-2 h-2 bg-green-500 rounded-full"
                      animate={{ scale: [1, 1.2, 1], opacity: [0.8, 1, 0.8] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    <span className="text-sm text-green-400 font-medium">
                      Edit Mode Active
                    </span>
                  </div>

                  <AutoSaveIndicator />
                </div>

                {/* Right side - Actions */}
                <div className="flex items-center gap-3" data-editor-ui="true">
                  {/* Quick Actions */}
                  <div className="flex items-center gap-1 bg-gray-800/50 rounded-lg p-1">
                    <button
                      onClick={() => setDragMode(!dragMode)}
                      className={`p-2 hover:bg-gray-700 rounded transition-colors ${dragMode ? 'text-purple-400 bg-purple-500/20' : 'text-gray-400 hover:text-white'}`}
                      title="Toggle Drag Mode (Ctrl+D)"
                      data-editor-ui="true"
                      type="button"
                    >
                      <Move size={16} />
                    </button>
                    <button
                      onClick={() => setShowNotifications(!showNotifications)}
                      className={`p-2 hover:bg-gray-700 rounded transition-colors ${showNotifications ? 'text-blue-400 bg-blue-500/20' : 'text-gray-400 hover:text-white'}`}
                      title="Toggle Notifications"
                      data-editor-ui="true"
                      type="button"
                    >
                      {showNotifications ? <Eye size={16} /> : <EyeOff size={16} />}
                    </button>
                  </div>
                  
                  {/* Main Actions */}
                  <button
                    onClick={handleSave}
                    disabled={autoSaveStatus === 'saving'}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-green-800 text-white px-4 py-2 rounded-lg transition-colors"
                    title="Save Changes (Ctrl+S)"
                    data-editor-ui="true"
                    type="button"
                  >
                    {autoSaveStatus === 'saving' ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      >
                        <RefreshCw size={16} />
                      </motion.div>
                    ) : (
                      <Save size={16} />
                    )}
                    Save
                  </button>
                  
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log('Exit button clicked - calling handleLogout');
                      handleLogout();
                    }}
                    className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                    title="Exit Edit Mode (Ctrl+E)"
                    data-editor-ui="true"
                    type="button"
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
          ${dragMode && isEditMode ? 'drag-mode-active' : ''}
        `}
      >
        {children}
      </div>

      {/* Enhanced Edit Mode Overlay Styles */}
      {isEditMode && (
        <style>{`
          .edit-mode-active .editable-element {
            position: relative;
          }
          
          .edit-mode-active *:hover {
            outline: 2px dashed rgba(59, 130, 246, 0.5) !important;
            outline-offset: 2px;
            cursor: pointer;
          }
          
          .edit-mode-active [contenteditable="true"] {
            outline: 2px solid rgba(59, 130, 246, 0.8) !important;
            outline-offset: 2px;
            background: rgba(59, 130, 246, 0.1) !important;
          }
          
          .edit-mode-active [data-selected="true"] {
            outline: 3px solid rgba(139, 92, 246, 0.8) !important;
            outline-offset: 2px;
            animation: selectedPulse 2s ease-in-out infinite;
          }
          
          .drag-mode-active [data-editable="true"]:hover {
            cursor: grab !important;
            transform: scale(1.02);
            transition: transform 0.2s ease;
          }
          
          .drag-mode-active [data-editable="true"]:active {
            cursor: grabbing !important;
            transform: scale(1.05) rotate(2deg);
            z-index: 9999;
            box-shadow: 0 20px 40px rgba(139, 92, 246, 0.3);
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
      )}

      {/* Password Card */}
      <BeautifulPasswordCard
        isOpen={showPasswordCard}
        onClose={() => setShowPasswordCard(false)}
        onLogin={handleLogin}
      />

      {/* Enhanced Edit Mode Help */}
      <AnimatePresence>
        {isEditMode && showHelpPanel && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="fixed bottom-6 left-6 bg-gradient-to-br from-gray-900/95 to-slate-900/95 backdrop-blur-xl border border-gray-700/50 rounded-xl p-4 max-w-sm z-30 shadow-2xl"
            data-editor-ui="true"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Sparkles size={16} className="text-white" />
                </div>
                <h3 className="text-white font-medium">Super Edit Mode</h3>
              </div>
              <button
                onClick={() => setShowHelpPanel(false)}
                className="p-1 hover:bg-gray-700/50 rounded transition-colors"
                data-editor-ui="true"
                type="button"
              >
                <XCircle size={16} className="text-gray-400" />
              </button>
            </div>
            
            <div className="space-y-2 text-sm text-gray-400">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <h4 className="text-xs font-semibold text-blue-400 mb-1">Mouse Actions</h4>
                  <ul className="text-xs space-y-1">
                    <li>• Right-click to edit</li>
                    <li>• Click to select</li>
                    <li>• Drag to move</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-purple-400 mb-1">Keyboard</h4>
                  <ul className="text-xs space-y-1">
                    <li>• Ctrl+S = Save</li>
                    <li>• Ctrl+Z = Undo</li>
                    <li>• Ctrl+G = Grid</li>
                    <li>• ESC = Deselect</li>
                  </ul>
                </div>
              </div>
              
              <div className="pt-2 border-t border-gray-700/50">
                <div className="flex items-center gap-2 text-xs">
                  <Target size={12} className="text-green-400" />
                  <span>
                    {selectedElement ? 
                      `Selected: ${selectedElement.tagName.toLowerCase()}` : 
                      'Select an element to start editing'
                    }
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SuperWebsiteEditor;