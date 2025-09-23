import React, { useState, useRef, useEffect } from 'react';
import { Edit3, Type, Palette, Image as ImageIcon, Move, Settings } from 'lucide-react';

const EditableWrapper = ({ 
  children, 
  isEditMode = false, 
  elementPath, 
  elementType = 'content',
  content,
  setContent,
  className = '',
  style = {},
  ...props 
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isSelected, setIsSelected] = useState(false);
  const [contextMenu, setContextMenu] = useState({ show: false, x: 0, y: 0 });
  const elementRef = useRef(null);

  // Handle click for selection
  const handleClick = (e) => {
    if (!isEditMode) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    setIsSelected(true);
    
    // Remove selection from other elements
    document.querySelectorAll('.editable-selected').forEach(el => {
      el.classList.remove('editable-selected');
    });
    
    if (elementRef.current) {
      elementRef.current.classList.add('editable-selected');
    }
  };

  // Handle right-click context menu
  const handleRightClick = (e) => {
    if (!isEditMode) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    setContextMenu({
      show: true,
      x: e.clientX,
      y: e.clientY
    });
  };

  // Handle text editing
  const handleTextEdit = () => {
    if (!elementRef.current) return;
    
    const element = elementRef.current;
    const originalText = element.textContent || element.value || '';
    
    // Create inline editor
    const editor = document.createElement('textarea');
    editor.value = originalText;
    editor.style.position = 'absolute';
    editor.style.zIndex = '9999';
    editor.style.background = '#1a1a2e';
    editor.style.color = 'white';
    editor.style.border = '2px solid #7bdfff';
    editor.style.borderRadius = '8px';
    editor.style.padding = '8px';
    editor.style.font = window.getComputedStyle(element).font;
    editor.style.resize = 'both';
    editor.style.minWidth = '200px';
    editor.style.minHeight = '100px';
    
    // Position editor
    const rect = element.getBoundingClientRect();
    editor.style.left = `${rect.left}px`;
    editor.style.top = `${rect.top + window.scrollY}px`;
    
    document.body.appendChild(editor);
    editor.focus();
    editor.select();
    
    // Save on blur or Enter
    const saveEdit = () => {
      const newText = editor.value;
      
      // Update DOM
      if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
        element.value = newText;
      } else {
        element.textContent = newText;
      }
      
      // Update content state if path is provided
      if (elementPath && setContent) {
        const pathArray = elementPath.split('.');
        setContent(prev => {
          const updated = { ...prev };
          let current = updated;
          
          for (let i = 0; i < pathArray.length - 1; i++) {
            if (!current[pathArray[i]]) current[pathArray[i]] = {};
            current = current[pathArray[i]];
          }
          
          current[pathArray[pathArray.length - 1]] = newText;
          return updated;
        });
      }
      
      document.body.removeChild(editor);
      setContextMenu({ show: false, x: 0, y: 0 });
    };
    
    editor.addEventListener('blur', saveEdit);
    editor.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && e.ctrlKey) {
        saveEdit();
      }
      if (e.key === 'Escape') {
        document.body.removeChild(editor);
        setContextMenu({ show: false, x: 0, y: 0 });
      }
    });
  };

  // Handle image change
  const handleImageChange = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const imageUrl = URL.createObjectURL(file);
        
        if (elementRef.current) {
          // Update image source or background
          if (elementRef.current.tagName === 'IMG') {
            elementRef.current.src = imageUrl;
          } else {
            elementRef.current.style.backgroundImage = `url(${imageUrl})`;
          }
          
          // Update content state
          if (elementPath && setContent) {
            const pathArray = elementPath.split('.');
            setContent(prev => {
              const updated = { ...prev };
              let current = updated;
              
              for (let i = 0; i < pathArray.length - 1; i++) {
                if (!current[pathArray[i]]) current[pathArray[i]] = {};
                current = current[pathArray[i]];
              }
              
              current[pathArray[pathArray.length - 1]] = imageUrl;
              return updated;
            });
          }
        }
      }
      
      setContextMenu({ show: false, x: 0, y: 0 });
    };
    
    input.click();
  };

  // Handle color change
  const handleColorChange = () => {
    const input = document.createElement('input');
    input.type = 'color';
    
    input.onchange = (e) => {
      const color = e.target.value;
      
      if (elementRef.current) {
        // Apply color based on element type
        if (elementRef.current.classList.contains('cta-primary') || 
            elementRef.current.classList.contains('bg-acc-1')) {
          elementRef.current.style.backgroundColor = color;
        } else {
          elementRef.current.style.color = color;
        }
        
        // Update CSS variable if it's a theme element
        if (elementPath && elementPath.includes('theme')) {
          const colorVar = `--${elementPath.split('.').pop().replace(/([A-Z])/g, '-$1').toLowerCase()}`;
          document.documentElement.style.setProperty(colorVar, color);
        }
      }
      
      setContextMenu({ show: false, x: 0, y: 0 });
    };
    
    input.click();
  };

  // Handle element movement
  const handleMove = () => {
    if (!elementRef.current) return;
    
    const element = elementRef.current;
    element.draggable = true;
    element.style.cursor = 'move';
    
    element.addEventListener('dragstart', (e) => {
      e.dataTransfer.effectAllowed = 'move';
      element.style.opacity = '0.5';
    });
    
    element.addEventListener('dragend', (e) => {
      element.style.opacity = '1';
      element.style.cursor = 'pointer';
      element.draggable = false;
    });
    
    setContextMenu({ show: false, x: 0, y: 0 });
  };

  // Close context menu on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (contextMenu.show && elementRef.current && !elementRef.current.contains(e.target)) {
        setContextMenu({ show: false, x: 0, y: 0 });
        setIsSelected(false);
        if (elementRef.current) {
          elementRef.current.classList.remove('editable-selected');
        }
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [contextMenu.show]);

  // Render component
  const editableProps = {
    ref: elementRef,
    className: `${className} ${isEditMode ? 'editable-element' : ''} ${isHovered && isEditMode ? 'editable-hovered' : ''} ${isSelected ? 'editable-selected' : ''}`,
    style: {
      ...style,
      cursor: isEditMode ? 'pointer' : style.cursor,
      position: style.position || 'relative',
      outline: isEditMode && isHovered ? '2px dashed rgba(123, 223, 255, 0.5)' : style.outline,
      transition: 'all 0.2s ease'
    },
    onMouseEnter: isEditMode ? () => setIsHovered(true) : undefined,
    onMouseLeave: isEditMode ? () => setIsHovered(false) : undefined,
    onClick: handleClick,
    onContextMenu: handleRightClick,
    ...props
  };

  return (
    <>
      {React.isValidElement(children) ? React.cloneElement(children, editableProps) : children}
      
      {/* Edit Indicator */}
      {isEditMode && isHovered && (
        <div className="absolute top-0 right-0 z-50 bg-blue-500 text-white px-2 py-1 rounded-bl-lg text-xs font-medium pointer-events-none">
          <Edit3 className="w-3 h-3 inline mr-1" />
          {elementType}
        </div>
      )}
      
      {/* Context Menu */}
      {contextMenu.show && (
        <div
          className="fixed z-50 bg-gray-900 border border-gray-700 rounded-lg shadow-2xl py-2 min-w-48 animate-fade-in"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onMouseLeave={() => setContextMenu({ show: false, x: 0, y: 0 })}
        >
          <button
            onClick={handleTextEdit}
            className="w-full px-4 py-2 text-left text-sm text-white hover:bg-gray-800 flex items-center transition-colors"
          >
            <Type className="w-4 h-4 mr-3 text-blue-400" />
            Edit Text
          </button>
          
          <button
            onClick={handleImageChange}
            className="w-full px-4 py-2 text-left text-sm text-white hover:bg-gray-800 flex items-center transition-colors"
          >
            <ImageIcon className="w-4 h-4 mr-3 text-green-400" />
            Change Image
          </button>
          
          <button
            onClick={handleColorChange}
            className="w-full px-4 py-2 text-left text-sm text-white hover:bg-gray-800 flex items-center transition-colors"
          >
            <Palette className="w-4 h-4 mr-3 text-purple-400" />
            Change Color
          </button>
          
          <button
            onClick={handleMove}
            className="w-full px-4 py-2 text-left text-sm text-white hover:bg-gray-800 flex items-center transition-colors"
          >
            <Move className="w-4 h-4 mr-3 text-orange-400" />
            Move Element
          </button>
          
          <div className="border-t border-gray-700 my-1"></div>
          
          <button
            onClick={() => {
              if (elementRef.current) {
                elementRef.current.style.display = 'none';
              }
              setContextMenu({ show: false, x: 0, y: 0 });
            }}
            className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-gray-800 flex items-center transition-colors"
          >
            <Settings className="w-4 h-4 mr-3" />
            Hide Element
          </button>
        </div>
      )}
    </>
  );
};

// HOC to make any component editable
export const withEditable = (WrappedComponent, defaultElementType = 'content') => {
  return React.forwardRef((props, ref) => {
    const { isEditMode, elementPath, elementType = defaultElementType, content, setContent, ...otherProps } = props;
    
    if (!isEditMode) {
      return <WrappedComponent ref={ref} {...otherProps} />;
    }
    
    return (
      <EditableWrapper
        isEditMode={isEditMode}
        elementPath={elementPath}
        elementType={elementType}
        content={content}
        setContent={setContent}
      >
        <WrappedComponent ref={ref} {...otherProps} />
      </EditableWrapper>
    );
  });
};

export default EditableWrapper;