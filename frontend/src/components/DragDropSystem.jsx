import React, { useState, createContext, useContext } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { motion, AnimatePresence } from 'framer-motion';
import { GripVertical, Move, ArrowUp, ArrowDown, Plus } from 'lucide-react';

const DragDropContext = createContext();

export const useDragDrop = () => {
  const context = useContext(DragDropContext);
  if (!context) {
    throw new Error('useDragDrop must be used within a DragDropProvider');
  }
  return context;
};

const DragDropProvider = ({ children, isEditMode, onSectionMove, onSectionAdd }) => {
  const [draggedItem, setDraggedItem] = useState(null);
  const [dropZones, setDropZones] = useState([]);
  const [showAddButtons, setShowAddButtons] = useState(false);

  const value = {
    draggedItem,
    setDraggedItem,
    dropZones,
    setDropZones,
    isEditMode,
    onSectionMove,
    onSectionAdd,
    showAddButtons,
    setShowAddButtons
  };

  return (
    <DragDropContext.Provider value={value}>
      <DndProvider backend={HTML5Backend}>
        <div className={`relative ${isEditMode ? 'drag-drop-enabled' : ''}`}>
          {children}
          {isEditMode && <DragDropOverlay />}
        </div>
      </DndProvider>
    </DragDropContext.Provider>
  );
};

const DragDropOverlay = () => {
  const { draggedItem, showAddButtons } = useDragDrop();

  return (
    <AnimatePresence>
      {draggedItem && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-blue-500/10 pointer-events-none z-40"
        >
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg">
            Moving: {draggedItem.type}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const DraggableSection = ({ 
  id, 
  type, 
  index, 
  children, 
  className = '',
  canDrag = true 
}) => {
  const { isEditMode, onSectionMove, setDraggedItem } = useDragDrop();
  
  const [{ isDragging }, drag, preview] = useDrag({
    type: 'section',
    item: { id, type, index },
    canDrag: canDrag && isEditMode,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    begin: () => {
      setDraggedItem({ id, type, index });
    },
    end: () => {
      setDraggedItem(null);
    }
  });

  const [{ isOver }, drop] = useDrop({
    accept: 'section',
    drop: (item) => {
      if (item.index !== index) {
        onSectionMove(item.index, index);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  const ref = React.useRef(null);
  drag(drop(ref));

  if (!isEditMode) {
    return (
      <div className={className}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      ref={ref}
      className={`
        relative group
        ${className}
        ${isDragging ? 'opacity-50 scale-95 z-50' : ''}
        ${isOver ? 'ring-2 ring-blue-500 ring-opacity-50' : ''}
      `}
      whileHover={{ scale: isDragging ? 0.95 : 1 }}
      transition={{ duration: 0.2 }}
    >
      {/* Drop indicator */}
      {isOver && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 4 }}
          className="absolute -top-2 left-0 right-0 bg-blue-500 rounded-full z-10"
        />
      )}

      {/* Drag handle */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: isEditMode ? 1 : 0, x: 0 }}
        className="absolute left-2 top-4 z-10 bg-gray-800/90 backdrop-blur-sm rounded-lg p-2 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-all duration-200"
        title="Drag to reorder section"
      >
        <GripVertical size={16} className="text-gray-400" />
      </motion.div>

      {/* Section controls */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: isEditMode ? 1 : 0, y: 0 }}
        className="absolute right-2 top-4 z-10 flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200"
      >
        <button
          className="bg-gray-800/90 backdrop-blur-sm rounded-lg p-2 hover:bg-gray-700/90 transition-colors"
          title="Move section up"
          onClick={() => index > 0 && onSectionMove(index, index - 1)}
        >
          <ArrowUp size={14} className="text-gray-400" />
        </button>
        <button
          className="bg-gray-800/90 backdrop-blur-sm rounded-lg p-2 hover:bg-gray-700/90 transition-colors"
          title="Move section down"
          onClick={() => onSectionMove(index, index + 1)}
        >
          <ArrowDown size={14} className="text-gray-400" />
        </button>
      </motion.div>

      {/* Section type label */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: isEditMode ? 1 : 0, scale: 1 }}
        className="absolute left-2 bottom-4 z-10 bg-blue-600/90 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-medium text-white opacity-0 group-hover:opacity-100 transition-all duration-200"
      >
        {type}
      </motion.div>

      {children}
    </motion.div>
  );
};

const AddSectionButton = ({ 
  position, 
  onAdd, 
  className = '' 
}) => {
  const { isEditMode } = useDragDrop();
  const [showOptions, setShowOptions] = useState(false);

  const sectionTypes = [
    { type: 'hero', label: 'Hero Section', icon: '🎯' },
    { type: 'about', label: 'About Section', icon: '👋' },
    { type: 'projects', label: 'Projects', icon: '💼' },
    { type: 'skills', label: 'Skills', icon: '⚡' },
    { type: 'experience', label: 'Experience', icon: '🏢' },
    { type: 'testimonials', label: 'Testimonials', icon: '💬' },
    { type: 'contact', label: 'Contact', icon: '📧' },
    { type: 'custom', label: 'Custom Section', icon: '✨' }
  ];

  if (!isEditMode) return null;

  return (
    <div className={`relative ${className}`}>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="w-full py-8 border-2 border-dashed border-gray-600 hover:border-blue-500 rounded-xl bg-gray-900/50 hover:bg-blue-500/10 transition-all duration-200 group"
        onClick={() => setShowOptions(!showOptions)}
      >
        <div className="flex flex-col items-center gap-2">
          <Plus size={24} className="text-gray-500 group-hover:text-blue-500 transition-colors" />
          <span className="text-gray-500 group-hover:text-blue-500 font-medium transition-colors">
            Add Section Here
          </span>
        </div>
      </motion.button>

      <AnimatePresence>
        {showOptions && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute top-full left-0 right-0 mt-2 bg-gray-800/95 backdrop-blur-xl border border-gray-700 rounded-xl shadow-2xl z-50 overflow-hidden"
          >
            <div className="p-2 space-y-1">
              {sectionTypes.map((section) => (
                <motion.button
                  key={section.type}
                  whileHover={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-blue-500/10 transition-colors text-left"
                  onClick={() => {
                    onAdd(section.type, position);
                    setShowOptions(false);
                  }}
                >
                  <span className="text-xl">{section.icon}</span>
                  <span className="text-gray-200 font-medium">{section.label}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const DropZone = ({ 
  id, 
  onDrop, 
  className = '',
  children,
  acceptTypes = ['section', 'component'] 
}) => {
  const { isEditMode } = useDragDrop();

  const [{ isOver, canDrop }, drop] = useDrop({
    accept: acceptTypes,
    drop: (item) => {
      onDrop(item, id);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  if (!isEditMode) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div
      ref={drop}
      className={`
        relative
        ${className}
        ${canDrop ? 'drop-zone-active' : ''}
        ${isOver ? 'drop-zone-hover' : ''}
      `}
    >
      {children}
      
      {isOver && canDrop && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-blue-500/20 border-2 border-blue-500 border-dashed rounded-lg flex items-center justify-center z-10"
        >
          <div className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg">
            Drop here
          </div>
        </motion.div>
      )}
    </div>
  );
};

export { DragDropProvider, DraggableSection, AddSectionButton, DropZone };
export default DragDropProvider;