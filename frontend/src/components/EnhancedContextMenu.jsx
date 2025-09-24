import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Edit3, 
  Move, 
  Copy, 
  Trash2, 
  Eye, 
  EyeOff,
  Palette,
  Type,
  Layout,
  RotateCw,
  RotateCcw,
  Maximize2,
  Minimize2,
  Layers,
  Code2,
  Image,
  Link,
  Settings,
  Target,
  Wand2,
  Scissors,
  ClipboardCopy,
  MousePointer,
  Grid,
  Ruler,
  Zap,
  RefreshCw,
  Download,
  Upload
} from 'lucide-react';

const EnhancedContextMenu = ({ 
  isOpen, 
  position, 
  onClose, 
  selectedElement, 
  onElementUpdate,
  onAction = () => {}
}) => {
  const [subMenuOpen, setSubMenuOpen] = useState(null);
  const [elementInfo, setElementInfo] = useState(null);
  const menuRef = useRef(null);

  // Get element information
  useEffect(() => {
    if (selectedElement) {
      const rect = selectedElement.getBoundingClientRect();
      const computedStyle = window.getComputedStyle(selectedElement);
      
      setElementInfo({
        tagName: selectedElement.tagName.toLowerCase(),
        id: selectedElement.id || 'No ID',
        className: selectedElement.className || 'No classes',
        textContent: selectedElement.textContent?.slice(0, 50) + 
                    (selectedElement.textContent?.length > 50 ? '...' : ''),
        dimensions: {
          width: Math.round(rect.width),
          height: Math.round(rect.height),
          top: Math.round(rect.top),
          left: Math.round(rect.left)
        },
        styles: {
          backgroundColor: computedStyle.backgroundColor,
          color: computedStyle.color,
          fontSize: computedStyle.fontSize,
          fontFamily: computedStyle.fontFamily,
          display: computedStyle.display,
          position: computedStyle.position
        }
      });
    }
  }, [selectedElement]);

  // Position menu to stay within viewport
  const getMenuPosition = () => {
    if (!position.x || !position.y) return { x: 0, y: 0 };
    
    const menuWidth = 280;
    const menuHeight = 600;
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight
    };
    
    let x = position.x;
    let y = position.y;
    
    // Adjust horizontal position
    if (x + menuWidth > viewport.width) {
      x = viewport.width - menuWidth - 10;
    }
    
    // Adjust vertical position
    if (y + menuHeight > viewport.height) {
      y = viewport.height - menuHeight - 10;
    }
    
    return { x: Math.max(10, x), y: Math.max(10, y) };
  };

  // Handle menu actions
  const handleAction = async (action, options = {}) => {
    if (!selectedElement) return;

    try {
      switch (action) {
        case 'edit-text':
          selectedElement.contentEditable = true;
          selectedElement.focus();
          onAction('Text editing enabled', 'success');
          break;
          
        case 'copy':
          const clone = selectedElement.cloneNode(true);
          clone.style.position = 'absolute';
          clone.style.left = (selectedElement.offsetLeft + 20) + 'px';
          clone.style.top = (selectedElement.offsetTop + 20) + 'px';
          selectedElement.parentNode.appendChild(clone);
          onAction('Element duplicated', 'success');
          break;
          
        case 'delete':
          if (window.confirm('Are you sure you want to delete this element?')) {
            selectedElement.remove();
            onAction('Element deleted', 'success');
            onClose();
          }
          break;
          
        case 'hide':
          const isHidden = selectedElement.style.display === 'none';
          selectedElement.style.display = isHidden ? '' : 'none';
          onAction(isHidden ? 'Element shown' : 'Element hidden', 'success');
          break;
          
        case 'reset-styles':
          if (window.confirm('Reset all styles for this element?')) {
            selectedElement.removeAttribute('style');
            onAction('Styles reset', 'success');
          }
          break;
          
        case 'add-class':
          const className = prompt('Enter CSS class name:');
          if (className) {
            selectedElement.classList.add(className);
            onAction(`Added class: ${className}`, 'success');
          }
          break;
          
        case 'set-id':
          const id = prompt('Enter element ID:', selectedElement.id);
          if (id) {
            selectedElement.id = id;
            onAction(`ID set to: ${id}`, 'success');
          }
          break;
          
        case 'move-up':
          if (selectedElement.previousElementSibling) {
            selectedElement.parentNode.insertBefore(selectedElement, selectedElement.previousElementSibling);
            onAction('Element moved up', 'success');
          }
          break;
          
        case 'move-down':
          if (selectedElement.nextElementSibling) {
            selectedElement.parentNode.insertBefore(selectedElement.nextElementSibling, selectedElement);
            onAction('Element moved down', 'success');
          }
          break;
          
        case 'wrap-container':
          const wrapper = document.createElement('div');
          wrapper.className = 'container mx-auto px-4';
          selectedElement.parentNode.insertBefore(wrapper, selectedElement);
          wrapper.appendChild(selectedElement);
          onAction('Element wrapped in container', 'success');
          break;
          
        case 'center-element':
          selectedElement.style.margin = '0 auto';
          selectedElement.style.textAlign = 'center';
          onAction('Element centered', 'success');
          break;
          
        case 'make-responsive':
          selectedElement.style.maxWidth = '100%';
          selectedElement.style.height = 'auto';
          onAction('Element made responsive', 'success');
          break;
          
        case 'add-shadow':
          selectedElement.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
          onAction('Shadow added', 'success');
          break;
          
        case 'add-border-radius':
          selectedElement.style.borderRadius = '8px';
          onAction('Border radius added', 'success');
          break;
          
        case 'make-flex':
          selectedElement.style.display = 'flex';
          selectedElement.style.alignItems = 'center';
          selectedElement.style.justifyContent = 'center';
          onAction('Flex layout applied', 'success');
          break;
          
        case 'add-gradient':
          selectedElement.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
          selectedElement.style.color = 'white';
          onAction('Gradient background applied', 'success');
          break;
          
        case 'inspect-element':
          console.log('Element inspection:', {
            element: selectedElement,
            styles: elementInfo?.styles,
            dimensions: elementInfo?.dimensions
          });
          onAction('Element logged to console', 'info');
          break;
          
        default:
          onAction(`Action: ${action}`, 'info');
      }
      
      if (onElementUpdate) {
        onElementUpdate(selectedElement, {});
      }
      
    } catch (error) {
      console.error('Context menu action failed:', error);
      onAction('Action failed', 'error');
    }
    
    onClose();
  };

  const menuItems = [
    {
      section: 'Edit Actions',
      items: [
        { icon: Edit3, label: 'Edit Text', action: 'edit-text', shortcut: 'E' },
        { icon: Move, label: 'Enable Drag', action: 'enable-drag', shortcut: 'D' },
        { icon: Copy, label: 'Duplicate', action: 'copy', shortcut: 'Ctrl+D' },
        { icon: Scissors, label: 'Cut Element', action: 'cut', shortcut: 'Ctrl+X' }
      ]
    },
    {
      section: 'Style Actions',
      items: [
        { icon: Palette, label: 'Quick Styles', submenu: 'styles' },
        { icon: Type, label: 'Typography', submenu: 'typography' },
        { icon: Layout, label: 'Layout', submenu: 'layout' },
        { icon: Wand2, label: 'Effects', submenu: 'effects' }
      ]
    },
    {
      section: 'Transform',
      items: [
        { icon: RotateCw, label: 'Move Up', action: 'move-up' },
        { icon: RotateCcw, label: 'Move Down', action: 'move-down' },
        { icon: Maximize2, label: 'Center Element', action: 'center-element' },
        { icon: Grid, label: 'Make Responsive', action: 'make-responsive' }
      ]
    },
    {
      section: 'Advanced',
      items: [
        { icon: Code2, label: 'Set ID', action: 'set-id' },
        { icon: Layers, label: 'Add Class', action: 'add-class' },
        { icon: Eye, label: elementInfo?.styles?.display === 'none' ? 'Show' : 'Hide', action: 'hide' },
        { icon: RefreshCw, label: 'Reset Styles', action: 'reset-styles' }
      ]
    },
    {
      section: 'Danger Zone',
      items: [
        { icon: Trash2, label: 'Delete Element', action: 'delete', danger: true }
      ]
    }
  ];

  const subMenus = {
    styles: [
      { icon: Wand2, label: 'Add Gradient', action: 'add-gradient' },
      { icon: Target, label: 'Add Shadow', action: 'add-shadow' },
      { icon: Settings, label: 'Border Radius', action: 'add-border-radius' },
      { icon: Palette, label: 'Reset Styles', action: 'reset-styles' }
    ],
    typography: [
      { icon: Type, label: 'Make Bold', action: 'make-bold' },
      { icon: Type, label: 'Make Italic', action: 'make-italic' },
      { icon: Type, label: 'Center Text', action: 'center-text' },
      { icon: Type, label: 'Large Text', action: 'large-text' }
    ],
    layout: [
      { icon: Layout, label: 'Make Flex', action: 'make-flex' },
      { icon: Grid, label: 'Make Grid', action: 'make-grid' },
      { icon: Maximize2, label: 'Full Width', action: 'full-width' },
      { icon: Target, label: 'Wrap Container', action: 'wrap-container' }
    ],
    effects: [
      { icon: Zap, label: 'Hover Effects', action: 'add-hover' },
      { icon: RotateCw, label: 'Animation', action: 'add-animation' },
      { icon: Eye, label: 'Fade In', action: 'fade-in' },
      { icon: MousePointer, label: 'Interactive', action: 'make-interactive' }
    ]
  };

  if (!isOpen) return null;

  const menuPosition = getMenuPosition();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-[10000]"
            onClick={onClose}
            data-editor-ui="true"
          />
          
          {/* Main Menu */}
          <motion.div
            ref={menuRef}
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            className="fixed z-[10001] bg-white/95 backdrop-blur-xl border border-gray-200 rounded-xl shadow-2xl p-2 w-72 max-h-[80vh] overflow-y-auto custom-scrollbar"
            style={{
              left: menuPosition.x,
              top: menuPosition.y
            }}
            data-editor-ui="true"
          >
            {/* Header */}
            {elementInfo && (
              <div className="px-3 py-2 mb-2 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded flex items-center justify-center">
                      <Target className="w-3 h-3 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 text-sm">
                        {elementInfo.tagName}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {elementInfo.dimensions.width} × {elementInfo.dimensions.height}px
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleAction('inspect-element')}
                    className="p-1 hover:bg-blue-100 rounded transition-colors"
                    title="Inspect in Console"
                    data-editor-ui="true"
                    type="button"
                  >
                    <Code2 className="w-3 h-3 text-blue-600" />
                  </button>
                </div>
                
                {elementInfo.textContent && (
                  <p className="text-xs text-gray-600 mt-1 truncate">
                    "{elementInfo.textContent}"
                  </p>
                )}
              </div>
            )}

            {/* Menu Items */}
            <div className="space-y-1">
              {menuItems.map((section, sectionIndex) => (
                <div key={sectionIndex}>
                  <div className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    {section.section}
                  </div>
                  
                  {section.items.map((item, itemIndex) => (
                    <motion.button
                      key={itemIndex}
                      whileHover={{ scale: 1.02, x: 2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        if (item.submenu) {
                          setSubMenuOpen(subMenuOpen === item.submenu ? null : item.submenu);
                        } else {
                          handleAction(item.action);
                        }
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-all hover:bg-gray-100 ${
                        item.danger 
                          ? 'text-red-600 hover:bg-red-50 hover:text-red-700' 
                          : 'text-gray-700'
                      } ${
                        subMenuOpen === item.submenu ? 'bg-blue-50 text-blue-700' : ''
                      }`}
                      data-editor-ui="true"
                      type="button"
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {item.shortcut && (
                          <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                            {item.shortcut}
                          </span>
                        )}
                        {item.submenu && (
                          <motion.div
                            animate={{ rotate: subMenuOpen === item.submenu ? 90 : 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Settings className="w-3 h-3 text-gray-400" />
                          </motion.div>
                        )}
                      </div>
                    </motion.button>
                  ))}
                  
                  {/* Submenu */}
                  <AnimatePresence>
                    {section.items.some(item => subMenuOpen === item.submenu) && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="ml-4 mt-1 space-y-1 border-l-2 border-blue-100 pl-2"
                      >
                        {subMenus[subMenuOpen]?.map((subItem, subIndex) => (
                          <motion.button
                            key={subIndex}
                            whileHover={{ scale: 1.02, x: 2 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleAction(subItem.action)}
                            className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-gray-600 rounded hover:bg-blue-50 hover:text-blue-700 transition-colors"
                            data-editor-ui="true"
                            type="button"
                          >
                            <subItem.icon className="w-3 h-3" />
                            <span>{subItem.label}</span>
                          </motion.button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  {sectionIndex < menuItems.length - 1 && (
                    <div className="my-2 border-t border-gray-200" />
                  )}
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="mt-3 pt-2 border-t border-gray-200">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Right-click menu</span>
                <span>ESC to close</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default EnhancedContextMenu;