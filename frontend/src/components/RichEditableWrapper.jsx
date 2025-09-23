import React, { useState, useRef, useEffect } from 'react';
import { Edit3, Sparkles, Crosshair, Target } from 'lucide-react';

const RichEditableWrapper = ({ 
  children, 
  isEditMode = false, 
  elementPath, 
  elementType = 'content',
  content,
  setContent,
  className = '',
  style = {},
  onElementInteraction,
  ...props 
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isSelected, setIsSelected] = useState(false);
  const elementRef = useRef(null);

  // Enhanced interaction handlers
  const handleClick = (e) => {
    if (!isEditMode || !onElementInteraction) return;
    onElementInteraction(e, elementPath, elementType, 'select');
  };

  const handleRightClick = (e) => {
    if (!isEditMode || !onElementInteraction) return;
    onElementInteraction(e, elementPath, elementType, 'context');
  };

  const handleMouseEnter = (e) => {
    if (!isEditMode) return;
    setIsHovered(true);
    if (onElementInteraction) {
      onElementInteraction(e, elementPath, elementType, 'hover');
    }
  };

  const handleMouseLeave = (e) => {
    if (!isEditMode) return;
    setIsHovered(false);
    if (onElementInteraction) {
      onElementInteraction(e, elementPath, elementType, 'unhover');
    }
  };

  // Add data attributes for the advanced editor
  const enhancedProps = {
    ref: elementRef,
    'data-element-path': elementPath,
    'data-element-type': elementType,
    className: `${className} ${isEditMode ? 'editable-element rich-editable' : ''} ${isHovered && isEditMode ? 'editable-hovered' : ''} ${isSelected ? 'editable-selected' : ''}`,
    style: {
      ...style,
      position: style.position || 'relative',
      cursor: isEditMode ? 'pointer' : style.cursor,
      transition: 'all 0.2s ease',
      ...(isEditMode && {
        outline: isHovered ? '2px dashed rgba(123, 223, 255, 0.5)' : 'none',
        outlineOffset: '2px'
      })
    },
    onClick: handleClick,
    onContextMenu: handleRightClick,
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave,
    ...props
  };

  return (
    <div className="rich-editable-container" style={{ position: 'relative' }}>
      {React.isValidElement(children) ? React.cloneElement(children, enhancedProps) : children}
      
      {/* Enhanced Edit Indicator */}
      {isEditMode && isHovered && (
        <div className="edit-indicator-rich">
          <div className="indicator-content">
            <Edit3 className="w-3 h-3 mr-1" />
            <span className="text-xs font-medium uppercase tracking-wider">
              {elementType}
            </span>
          </div>
          <div className="indicator-tools">
            <button 
              className="tool-btn"
              title="Select Element"
            >
              <Target className="w-2.5 h-2.5" />
            </button>
            <button 
              className="tool-btn"
              title="Quick Edit"
            >
              <Sparkles className="w-2.5 h-2.5" />
            </button>
          </div>
        </div>
      )}

      {/* Selection Outline Enhancement */}
      {isEditMode && isSelected && (
        <div className="selection-outline">
          <div className="selection-corners">
            <div className="corner corner-tl"></div>
            <div className="corner corner-tr"></div>
            <div className="corner corner-bl"></div>
            <div className="corner corner-br"></div>
          </div>
          <div className="selection-edges">
            <div className="edge edge-top"></div>
            <div className="edge edge-right"></div>
            <div className="edge edge-bottom"></div>
            <div className="edge edge-left"></div>
          </div>
        </div>
      )}

      {/* Hover Crosshair */}
      {isEditMode && isHovered && (
        <>
          <div className="hover-crosshair-h" />
          <div className="hover-crosshair-v" />
        </>
      )}
    </div>
  );
};

// Enhanced HOC to make any component richly editable
export const withRichEditable = (WrappedComponent, defaultElementType = 'content') => {
  return React.forwardRef((props, ref) => {
    const { 
      isEditMode, 
      elementPath, 
      elementType = defaultElementType, 
      content, 
      setContent, 
      onElementInteraction,
      ...otherProps 
    } = props;
    
    if (!isEditMode) {
      return <WrappedComponent ref={ref} {...otherProps} />;
    }
    
    return (
      <RichEditableWrapper
        isEditMode={isEditMode}
        elementPath={elementPath}
        elementType={elementType}
        content={content}
        setContent={setContent}
        onElementInteraction={onElementInteraction}
      >
        <WrappedComponent ref={ref} {...otherProps} />
      </RichEditableWrapper>
    );
  });
};

export default RichEditableWrapper;