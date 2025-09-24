import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Edit3, 
  Code2, 
  Palette, 
  Image, 
  Copy, 
  Trash2, 
  Move, 
  Layers,
  Sparkles,
  Eye,
  EyeOff,
  RotateCw,
  Maximize,
  Minimize,
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Italic,
  Underline,
  Type,
  Grid
} from 'lucide-react';
import Editor from '@monaco-editor/react';

const EnhancedContextMenu = ({ 
  isOpen, 
  position, 
  onClose, 
  selectedElement, 
  onElementUpdate 
}) => {
  const [activeSubmenu, setActiveSubmenu] = useState(null);
  const [showCodeEditor, setShowCodeEditor] = useState(false);
  const [customCSS, setCustomCSS] = useState('');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [elementStyles, setElementStyles] = useState({});
  
  const menuRef = useRef(null);
  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    if (selectedElement) {
      const computedStyles = window.getComputedStyle(selectedElement);
      setElementStyles({
        backgroundColor: computedStyles.backgroundColor,
        color: computedStyles.color,
        fontSize: computedStyles.fontSize,
        fontWeight: computedStyles.fontWeight,
        textAlign: computedStyles.textAlign,
        padding: computedStyles.padding,
        margin: computedStyles.margin,
        borderRadius: computedStyles.borderRadius,
        border: computedStyles.border
      });
      
      // Extract existing custom styles
      const existingCSS = selectedElement.style.cssText;
      setCustomCSS(existingCSS);
    }
  }, [selectedElement]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Generate AI-enhanced CSS
  const generateAICSS = async (type) => {
    setIsGeneratingAI(true);
    try {
      const response = await fetch(`${backendUrl}/api/super/ai/generate-css`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: `Create modern, professional ${type} styling for ${selectedElement?.tagName || 'element'}`,
          element_type: selectedElement?.tagName || 'div',
          current_styles: elementStyles
        })
      });

      if (response.ok) {
        const result = await response.json();
        setCustomCSS(result.css_code);
        setShowCodeEditor(true);
      }
    } catch (error) {
      console.error('AI CSS generation failed:', error);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // Apply styles to element
  const applyStyles = (styles) => {
    if (!selectedElement) return;
    
    Object.entries(styles).forEach(([property, value]) => {
      selectedElement.style[property] = value;
    });
    
    if (onElementUpdate) {
      onElementUpdate(selectedElement, { styles });
    }
  };

  // Quick style presets
  const stylePresets = {
    modern: {
      backgroundColor: '#ffffff',
      borderRadius: '12px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      padding: '20px'
    },
    gradient: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: '#ffffff',
      borderRadius: '8px',
      padding: '16px'
    },
    neon: {
      backgroundColor: '#000000',
      color: '#00ff41',
      border: '2px solid #00ff41',
      boxShadow: '0 0 20px #00ff41',
      borderRadius: '4px'
    },
    glass: {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(10px)',
      borderRadius: '16px',
      border: '1px solid rgba(255, 255, 255, 0.2)'
    }
  };

  const menuItems = [
    {
      id: 'edit',
      label: 'Edit Content',
      icon: Edit3,
      submenu: [
        { 
          id: 'edit-text', 
          label: 'Edit Text', 
          icon: Type,
          action: () => {
            if (selectedElement) {
              selectedElement.contentEditable = true;
              selectedElement.focus();
            }
          }
        },
        { 
          id: 'bold', 
          label: 'Bold', 
          icon: Bold,
          action: () => applyStyles({ fontWeight: 'bold' })
        },
        { 
          id: 'italic', 
          label: 'Italic', 
          icon: Italic,
          action: () => applyStyles({ fontStyle: 'italic' })
        },
        { 
          id: 'underline', 
          label: 'Underline', 
          icon: Underline,
          action: () => applyStyles({ textDecoration: 'underline' })
        }
      ]
    },
    {
      id: 'style',
      label: 'Quick Styles',
      icon: Palette,
      submenu: [
        { 
          id: 'modern', 
          label: 'Modern Card', 
          icon: Grid,
          action: () => applyStyles(stylePresets.modern)
        },
        { 
          id: 'gradient', 
          label: 'Gradient', 
          icon: Palette,
          action: () => applyStyles(stylePresets.gradient)
        },
        { 
          id: 'neon', 
          label: 'Neon Glow', 
          icon: Sparkles,
          action: () => applyStyles(stylePresets.neon)
        },
        { 
          id: 'glass', 
          label: 'Glassmorphism', 
          icon: Eye,
          action: () => applyStyles(stylePresets.glass)
        }
      ]
    },
    {
      id: 'ai',
      label: 'AI Enhance',
      icon: Sparkles,
      submenu: [
        { 
          id: 'ai-modern', 
          label: 'Modern Design', 
          icon: Sparkles,
          action: () => generateAICSS('modern design')
        },
        { 
          id: 'ai-animated', 
          label: 'Add Animations', 
          icon: Move,
          action: () => generateAICSS('smooth animations and transitions')
        },
        { 
          id: 'ai-responsive', 
          label: 'Responsive Design', 
          icon: Maximize,
          action: () => generateAICSS('responsive mobile-first design')
        },
        { 
          id: 'ai-accessibility', 
          label: 'Accessibility', 
          icon: Eye,
          action: () => generateAICSS('accessibility-friendly styling')
        }
      ]
    },
    {
      id: 'layout',
      label: 'Layout',
      icon: Layers,
      submenu: [
        { 
          id: 'align-left', 
          label: 'Align Left', 
          icon: AlignLeft,
          action: () => applyStyles({ textAlign: 'left' })
        },
        { 
          id: 'align-center', 
          label: 'Align Center', 
          icon: AlignCenter,
          action: () => applyStyles({ textAlign: 'center' })
        },
        { 
          id: 'align-right', 
          label: 'Align Right', 
          icon: AlignRight,
          action: () => applyStyles({ textAlign: 'right' })
        }
      ]
    },
    {
      id: 'code',
      label: 'Custom CSS',
      icon: Code2,
      action: () => setShowCodeEditor(true)
    },
    {
      id: 'copy',
      label: 'Duplicate',
      icon: Copy,
      action: () => {
        if (selectedElement) {
          const clone = selectedElement.cloneNode(true);
          selectedElement.parentNode.insertBefore(clone, selectedElement.nextSibling);
        }
      }
    },
    {
      id: 'delete',
      label: 'Delete',
      icon: Trash2,
      action: () => {
        if (selectedElement && confirm('Are you sure you want to delete this element?')) {
          selectedElement.remove();
          onClose();
        }
      }
    }
  ];

  const handleItemClick = (item) => {
    if (item.submenu) {
      setActiveSubmenu(activeSubmenu === item.id ? null : item.id);
    } else if (item.action) {
      item.action();
      onClose();
    }
  };

  const applyCustomCSS = () => {
    if (selectedElement && customCSS) {
      // Parse and apply CSS
      const rules = customCSS.split(';').filter(rule => rule.trim());
      rules.forEach(rule => {
        const [property, value] = rule.split(':').map(s => s.trim());
        if (property && value) {
          selectedElement.style[property] = value;
        }
      });
      
      setShowCodeEditor(false);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Context Menu */}
      <motion.div
        ref={menuRef}
        initial={{ opacity: 0, scale: 0.95, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -10 }}
        className="fixed z-[9999] bg-white border border-gray-200 rounded-lg shadow-2xl py-2 min-w-[200px]"
        style={{
          left: Math.min(position.x, window.innerWidth - 220),
          top: Math.min(position.y, window.innerHeight - 400)
        }}
      >
        {menuItems.map((item) => (
          <div key={item.id} className="relative">
            <button
              onClick={() => handleItemClick(item)}
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center justify-between"
            >
              <div className="flex items-center">
                <item.icon className="w-4 h-4 mr-3 text-gray-500" />
                {item.label}
              </div>
              {item.submenu && (
                <motion.div
                  animate={{ rotate: activeSubmenu === item.id ? 90 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </motion.div>
              )}
            </button>
            
            {/* Submenu */}
            <AnimatePresence>
              {activeSubmenu === item.id && item.submenu && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="absolute left-full top-0 ml-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[180px] z-10"
                >
                  {item.submenu.map((subItem) => (
                    <button
                      key={subItem.id}
                      onClick={() => {
                        subItem.action();
                        onClose();
                      }}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center"
                    >
                      <subItem.icon className="w-4 h-4 mr-3 text-gray-500" />
                      {subItem.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
        
        {isGeneratingAI && (
          <div className="px-4 py-2 text-sm text-blue-600 flex items-center">
            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600 mr-2"></div>
            Generating AI styles...
          </div>
        )}
      </motion.div>

      {/* Custom CSS Editor Modal */}
      <AnimatePresence>
        {showCodeEditor && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10000]"
            onClick={() => setShowCodeEditor(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-lg shadow-2xl w-[600px] h-[500px] flex flex-col"
            >
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="text-lg font-medium">Custom CSS Editor</h3>
                <button
                  onClick={() => setShowCodeEditor(false)}
                  className="p-2 hover:bg-gray-100 rounded"
                >
                  ✕
                </button>
              </div>
              
              <div className="flex-1 p-4">
                <div className="h-full border rounded overflow-hidden">
                  <Editor
                    height="100%"
                    defaultLanguage="css"
                    value={customCSS}
                    onChange={setCustomCSS}
                    theme="vs-light"
                    options={{
                      fontSize: 14,
                      minimap: { enabled: false },
                      scrollBeyondLastLine: false,
                      wordWrap: 'on',
                      automaticLayout: true
                    }}
                  />
                </div>
              </div>
              
              <div className="flex justify-between items-center p-4 border-t bg-gray-50">
                <button
                  onClick={() => generateAICSS('enhanced styling')}
                  disabled={isGeneratingAI}
                  className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50 flex items-center"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  {isGeneratingAI ? 'Generating...' : 'AI Enhance'}
                </button>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => setShowCodeEditor(false)}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={applyCustomCSS}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Apply CSS
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

const ChevronRight = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

export default EnhancedContextMenu;