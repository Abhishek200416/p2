import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Ruler, 
  Move, 
  RotateCw, 
  Square, 
  Circle,
  ArrowUpDown,
  ArrowLeftRight,
  Grid,
  AlignCenter,
  AlignLeft,
  AlignRight,
  Maximize
} from 'lucide-react';

const AdvancedRealTimeDimensions = ({ 
  selectedElement, 
  onDimensionChange, 
  isEditMode,
  showGrid = true 
}) => {
  const [dimensions, setDimensions] = useState({
    x: 0, y: 0, width: 0, height: 0, rotation: 0
  });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [snapGuides, setSnapGuides] = useState([]);
  const [showMeasurements, setShowMeasurements] = useState(true);
  
  const overlayRef = useRef(null);
  const guidesRef = useRef([]);

  // Track mouse movement for real-time measurements
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
      
      if (selectedElement && isEditMode) {
        // Calculate real-time distances to other elements
        updateSnapGuides(e.clientX, e.clientY);
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, [selectedElement, isEditMode]);

  // Update dimensions when selected element changes
  useEffect(() => {
    if (selectedElement) {
      const rect = selectedElement.getBoundingClientRect();
      const newDimensions = {
        x: rect.left,
        y: rect.top,
        width: rect.width,
        height: rect.height,
        rotation: getElementRotation(selectedElement)
      };
      setDimensions(newDimensions);
    }
  }, [selectedElement]);

  // Get element rotation from transform
  const getElementRotation = (element) => {
    const style = window.getComputedStyle(element);
    const transform = style.transform;
    
    if (transform && transform !== 'none') {
      const matrix = transform.match(/matrix\(([^)]+)\)/);
      if (matrix) {
        const values = matrix[1].split(',').map(parseFloat);
        const angle = Math.round(Math.atan2(values[1], values[0]) * (180 / Math.PI));
        return angle;
      }
    }
    return 0;
  };

  // Update snap guides for alignment
  const updateSnapGuides = useCallback((mouseX, mouseY) => {
    if (!selectedElement) return;

    const allElements = document.querySelectorAll('[data-editable="true"]');
    const guides = [];
    const snapThreshold = 10;

    allElements.forEach(element => {
      if (element === selectedElement) return;

      const rect = element.getBoundingClientRect();
      const selectedRect = selectedElement.getBoundingClientRect();

      // Horizontal alignment guides
      if (Math.abs(rect.left - selectedRect.left) < snapThreshold) {
        guides.push({
          type: 'vertical',
          position: rect.left,
          color: '#ff6b6b'
        });
      }
      
      if (Math.abs(rect.right - selectedRect.right) < snapThreshold) {
        guides.push({
          type: 'vertical',
          position: rect.right,
          color: '#4ecdc4'
        });
      }

      // Vertical alignment guides
      if (Math.abs(rect.top - selectedRect.top) < snapThreshold) {
        guides.push({
          type: 'horizontal',
          position: rect.top,
          color: '#45b7d1'
        });
      }

      if (Math.abs(rect.bottom - selectedRect.bottom) < snapThreshold) {
        guides.push({
          type: 'horizontal',
          position: rect.bottom,
          color: '#96ceb4'
        });
      }
    });

    setSnapGuides(guides);
  }, [selectedElement]);

  // Handle element dragging
  const handleMouseDown = (e) => {
    if (!selectedElement || !isEditMode) return;

    setIsDragging(true);
    setDragStart({
      x: e.clientX - dimensions.x,
      y: e.clientY - dimensions.y
    });

    const handleMouseMove = (e) => {
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;
      
      const newDimensions = { ...dimensions, x: newX, y: newY };
      setDimensions(newDimensions);
      
      // Apply transform to element
      selectedElement.style.transform = `translate(${newX - dimensions.x}px, ${newY - dimensions.y}px) rotate(${dimensions.rotation}deg)`;
      
      if (onDimensionChange) {
        onDimensionChange(newDimensions);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // Handle element resizing
  const handleResizeStart = (e, corner) => {
    e.stopPropagation();
    setIsResizing(corner);

    const startRect = selectedElement.getBoundingClientRect();
    const startMouseX = e.clientX;
    const startMouseY = e.clientY;

    const handleMouseMove = (e) => {
      const deltaX = e.clientX - startMouseX;
      const deltaY = e.clientY - startMouseY;

      let newDimensions = { ...dimensions };

      switch (corner) {
        case 'se': // Southeast
          newDimensions.width = Math.max(20, startRect.width + deltaX);
          newDimensions.height = Math.max(20, startRect.height + deltaY);
          break;
        case 'sw': // Southwest
          newDimensions.width = Math.max(20, startRect.width - deltaX);
          newDimensions.height = Math.max(20, startRect.height + deltaY);
          newDimensions.x = startRect.left + deltaX;
          break;
        case 'ne': // Northeast
          newDimensions.width = Math.max(20, startRect.width + deltaX);
          newDimensions.height = Math.max(20, startRect.height - deltaY);
          newDimensions.y = startRect.top + deltaY;
          break;
        case 'nw': // Northwest
          newDimensions.width = Math.max(20, startRect.width - deltaX);
          newDimensions.height = Math.max(20, startRect.height - deltaY);
          newDimensions.x = startRect.left + deltaX;
          newDimensions.y = startRect.top + deltaY;
          break;
        default:
          break;
      }

      setDimensions(newDimensions);
      
      // Apply styles to element
      selectedElement.style.width = `${newDimensions.width}px`;
      selectedElement.style.height = `${newDimensions.height}px`;
      
      if (onDimensionChange) {
        onDimensionChange(newDimensions);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // Handle rotation
  const handleRotate = (delta) => {
    const newRotation = (dimensions.rotation + delta) % 360;
    const newDimensions = { ...dimensions, rotation: newRotation };
    setDimensions(newDimensions);
    
    selectedElement.style.transform = `rotate(${newRotation}deg)`;
    
    if (onDimensionChange) {
      onDimensionChange(newDimensions);
    }
  };

  // Render measurement lines
  const renderMeasurements = () => {
    if (!selectedElement || !showMeasurements) return null;

    return (
      <div className="absolute inset-0 pointer-events-none">
        {/* Width measurement */}
        <div
          className="absolute bg-blue-500 text-white text-xs px-1 rounded z-50"
          style={{
            left: dimensions.x + dimensions.width / 2 - 20,
            top: dimensions.y - 25
          }}
        >
          {Math.round(dimensions.width)}px
        </div>
        
        {/* Height measurement */}
        <div
          className="absolute bg-blue-500 text-white text-xs px-1 rounded z-50"
          style={{
            left: dimensions.x - 40,
            top: dimensions.y + dimensions.height / 2 - 8
          }}
        >
          {Math.round(dimensions.height)}px
        </div>
        
        {/* Position indicators */}
        <div
          className="absolute bg-gray-800 text-white text-xs px-1 rounded z-50"
          style={{
            left: mousePosition.x + 10,
            top: mousePosition.y - 20
          }}
        >
          x: {Math.round(mousePosition.x)}, y: {Math.round(mousePosition.y)}
        </div>
      </div>
    );
  };

  // Render snap guides
  const renderSnapGuides = () => (
    <div className="absolute inset-0 pointer-events-none">
      {snapGuides.map((guide, index) => (
        <div
          key={index}
          className="absolute z-40"
          style={{
            [guide.type === 'vertical' ? 'left' : 'top']: `${guide.position}px`,
            [guide.type === 'vertical' ? 'width' : 'height']: '1px',
            [guide.type === 'vertical' ? 'height' : 'width']: '100%',
            backgroundColor: guide.color,
            boxShadow: `0 0 2px ${guide.color}`
          }}
        />
      ))}
    </div>
  );

  // Render grid
  const renderGrid = () => {
    if (!showGrid || !isEditMode) return null;

    return (
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <svg width="100%" height="100%" className="absolute inset-0">
          <defs>
            <pattern
              id="grid"
              width="20"
              height="20"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 20 0 L 0 0 0 20"
                fill="none"
                stroke="#ddd"
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>
    );
  };

  // Render selection overlay
  const renderSelectionOverlay = () => {
    if (!selectedElement || !isEditMode) return null;

    return (
      <div
        className="absolute border-2 border-blue-500 pointer-events-none z-30"
        style={{
          left: dimensions.x,
          top: dimensions.y,
          width: dimensions.width,
          height: dimensions.height,
          transform: `rotate(${dimensions.rotation}deg)`,
          boxShadow: '0 0 0 1px rgba(59, 130, 246, 0.5)'
        }}
      >
        {/* Resize handles */}
        {['nw', 'ne', 'sw', 'se'].map((corner) => (
          <div
            key={corner}
            className="absolute w-3 h-3 bg-blue-500 border border-white cursor-pointer pointer-events-auto"
            style={{
              [corner.includes('n') ? 'top' : 'bottom']: '-6px',
              [corner.includes('w') ? 'left' : 'right']: '-6px',
              cursor: `${corner}-resize`
            }}
            onMouseDown={(e) => handleResizeStart(e, corner)}
          />
        ))}
        
        {/* Rotation handle */}
        <div
          className="absolute w-3 h-3 bg-green-500 border border-white rounded-full cursor-pointer pointer-events-auto"
          style={{
            top: '-20px',
            left: '50%',
            transform: 'translateX(-50%)',
            cursor: 'grab'
          }}
          onMouseDown={handleMouseDown}
        />
      </div>
    );
  };

  if (!isEditMode) return null;

  return (
    <>
      {/* Grid overlay */}
      {renderGrid()}
      
      {/* Snap guides */}
      {renderSnapGuides()}
      
      {/* Measurements */}
      {renderMeasurements()}
      
      {/* Selection overlay */}
      {renderSelectionOverlay()}
      
      {/* Floating toolbar */}
      {selectedElement && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-white border border-gray-200 rounded-lg shadow-lg p-2 flex items-center space-x-2 z-50"
        >
          <button
            onClick={() => handleRotate(-15)}
            className="p-2 hover:bg-gray-100 rounded"
            title="Rotate Left"
          >
            <RotateCw className="w-4 h-4 transform scale-x-[-1]" />
          </button>
          
          <button
            onClick={() => handleRotate(15)}
            className="p-2 hover:bg-gray-100 rounded"
            title="Rotate Right"
          >
            <RotateCw className="w-4 h-4" />
          </button>
          
          <div className="w-px h-6 bg-gray-300" />
          
          <button
            onClick={() => setShowMeasurements(!showMeasurements)}
            className={`p-2 rounded ${showMeasurements ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
            title="Toggle Measurements"
          >
            <Ruler className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => setShowGrid(!showGrid)}
            className={`p-2 rounded ${showGrid ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
            title="Toggle Grid"
          >
            <Grid className="w-4 h-4" />
          </button>
          
          <div className="w-px h-6 bg-gray-300" />
          
          <div className="text-xs text-gray-600">
            {Math.round(dimensions.width)} × {Math.round(dimensions.height)}
          </div>
        </motion.div>
      )}
    </>
  );
};

export default AdvancedRealTimeDimensions;