import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bold, 
  Italic, 
  Underline, 
  Type, 
  Palette, 
  AlignLeft, 
  AlignCenter, 
  AlignRight,
  Undo,
  Redo,
  Save,
  Eye,
  Code,
  Link,
  Image as ImageIcon,
  MousePointer
} from 'lucide-react';

const RealTimeEditor = ({ 
  isEditMode, 
  element, 
  onContentChange, 
  onStyleChange,
  className = ''
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState('');
  const [originalContent, setOriginalContent] = useState('');
  const [showToolbar, setShowToolbar] = useState(false);
  const [toolbarPosition, setToolbarPosition] = useState({ x: 0, y: 0 });
  const [selectedText, setSelectedText] = useState('');
  const [editHistory, setEditHistory] = useState([]);
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState(-1);
  
  const editorRef = useRef(null);
  const toolbarRef = useRef(null);

  useEffect(() => {
    if (element && element.textContent) {
      setContent(element.textContent);
      setOriginalContent(element.textContent);
    }
  }, [element]);

  const startEditing = useCallback((e) => {
    if (!isEditMode) return;
    
    e.stopPropagation();
    setIsEditing(true);
    setOriginalContent(content);
    
    // Add to history
    const newHistory = editHistory.slice(0, currentHistoryIndex + 1);
    newHistory.push(content);
    setEditHistory(newHistory);
    setCurrentHistoryIndex(newHistory.length - 1);

    setTimeout(() => {
      if (editorRef.current) {
        editorRef.current.focus();
      }
    }, 100);
  }, [isEditMode, content, editHistory, currentHistoryIndex]);

  const stopEditing = useCallback(() => {
    setIsEditing(false);
    setShowToolbar(false);
    if (onContentChange && content !== originalContent) {
      onContentChange(content);
    }
  }, [content, originalContent, onContentChange]);

  const handleTextSelection = useCallback(() => {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const selectedText = selection.toString();
      setSelectedText(selectedText);
      
      if (selectedText.length > 0 && isEditMode) {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        
        setToolbarPosition({
          x: rect.left + (rect.width / 2),
          y: rect.top - 10
        });
        setShowToolbar(true);
      } else {
        setShowToolbar(false);
      }
    }
  }, [isEditMode]);

  const applyFormat = useCallback((command, value = null) => {
    document.execCommand(command, false, value);
    handleTextSelection();
  }, [handleTextSelection]);

  const undo = useCallback(() => {
    if (currentHistoryIndex > 0) {
      const newIndex = currentHistoryIndex - 1;
      setCurrentHistoryIndex(newIndex);
      setContent(editHistory[newIndex]);
    }
  }, [currentHistoryIndex, editHistory]);

  const redo = useCallback(() => {
    if (currentHistoryIndex < editHistory.length - 1) {
      const newIndex = currentHistoryIndex + 1;
      setCurrentHistoryIndex(newIndex);
      setContent(editHistory[newIndex]);
    }
  }, [currentHistoryIndex, editHistory]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      stopEditing();
    } else if (e.key === 'Escape') {
      setContent(originalContent);
      stopEditing();
    } else if (e.ctrlKey && e.key === 'z') {
      e.preventDefault();
      undo();
    } else if (e.ctrlKey && e.key === 'y') {
      e.preventDefault();
      redo();
    }
  }, [stopEditing, originalContent, undo, redo]);

  if (!isEditMode) {
    return (
      <div className={className}>
        {element?.textContent || content}
      </div>
    );
  }

  return (
    <div className={`relative group ${className}`}>
      {/* Edit indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isEditing ? 0 : 1 }}
        className="absolute -top-2 -right-2 bg-blue-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-10"
        onClick={startEditing}
        title="Click to edit"
      >
        <Type size={12} />
      </motion.div>

      {/* Editable content */}
      <div
        ref={editorRef}
        contentEditable={isEditing}
        suppressContentEditableWarning={true}
        className={`
          ${isEditing 
            ? 'outline-none ring-2 ring-blue-500 ring-opacity-50 bg-gray-900/50 rounded px-2 py-1' 
            : 'hover:outline hover:outline-2 hover:outline-blue-500/30 hover:outline-dashed rounded cursor-pointer'
          }
          transition-all duration-200
        `}
        onClick={!isEditing ? startEditing : undefined}
        onBlur={stopEditing}
        onKeyDown={handleKeyDown}
        onMouseUp={handleTextSelection}
        onInput={(e) => setContent(e.target.textContent)}
        dangerouslySetInnerHTML={isEditing ? { __html: content } : undefined}
      >
        {!isEditing && (content || element?.textContent || 'Click to edit')}
      </div>

      {/* Floating toolbar */}
      <AnimatePresence>
        {showToolbar && selectedText && (
          <motion.div
            ref={toolbarRef}
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            className="fixed z-[9999] bg-gray-900/95 backdrop-blur-xl border border-gray-700 rounded-lg shadow-2xl px-2 py-2 flex items-center gap-1"
            style={{
              left: toolbarPosition.x,
              top: toolbarPosition.y,
              transform: 'translateX(-50%)'
            }}
          >
            <button
              onClick={() => applyFormat('bold')}
              className="p-2 hover:bg-gray-700 rounded text-gray-300 hover:text-white transition-colors"
              title="Bold"
            >
              <Bold size={14} />
            </button>
            
            <button
              onClick={() => applyFormat('italic')}
              className="p-2 hover:bg-gray-700 rounded text-gray-300 hover:text-white transition-colors"
              title="Italic"
            >
              <Italic size={14} />
            </button>
            
            <button
              onClick={() => applyFormat('underline')}
              className="p-2 hover:bg-gray-700 rounded text-gray-300 hover:text-white transition-colors"
              title="Underline"
            >
              <Underline size={14} />
            </button>

            <div className="w-px h-6 bg-gray-700 mx-1"></div>

            <button
              onClick={() => applyFormat('justifyLeft')}
              className="p-2 hover:bg-gray-700 rounded text-gray-300 hover:text-white transition-colors"
              title="Align Left"
            >
              <AlignLeft size={14} />
            </button>
            
            <button
              onClick={() => applyFormat('justifyCenter')}
              className="p-2 hover:bg-gray-700 rounded text-gray-300 hover:text-white transition-colors"
              title="Align Center"
            >
              <AlignCenter size={14} />
            </button>
            
            <button
              onClick={() => applyFormat('justifyRight')}
              className="p-2 hover:bg-gray-700 rounded text-gray-300 hover:text-white transition-colors"
              title="Align Right"
            >
              <AlignRight size={14} />
            </button>

            <div className="w-px h-6 bg-gray-700 mx-1"></div>

            <button
              onClick={() => {
                const url = prompt('Enter URL:');
                if (url) applyFormat('createLink', url);
              }}
              className="p-2 hover:bg-gray-700 rounded text-gray-300 hover:text-white transition-colors"
              title="Add Link"
            >
              <Link size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit controls */}
      <AnimatePresence>
        {isEditing && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute -bottom-12 left-0 bg-gray-800/95 backdrop-blur-xl border border-gray-700 rounded-lg px-3 py-2 flex items-center gap-2 z-10"
          >
            <button
              onClick={undo}
              disabled={currentHistoryIndex <= 0}
              className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Undo"
            >
              <Undo size={14} />
            </button>
            
            <button
              onClick={redo}
              disabled={currentHistoryIndex >= editHistory.length - 1}
              className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Redo"
            >
              <Redo size={14} />
            </button>

            <div className="w-px h-4 bg-gray-700 mx-1"></div>

            <span className="text-xs text-gray-500">
              Press Enter to save, Esc to cancel
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RealTimeEditor;