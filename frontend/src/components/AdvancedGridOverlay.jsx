import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Grid, Settings, Target, Zap, RotateCw, Move } from 'lucide-react';

const AdvancedGridOverlay = ({ 
  gridSize = 20, 
  snapToGrid = true, 
  onGridSizeChange, 
  onSnapToggle 
}) => {
  const [showGridControls, setShowGridControls] = useState(false);
  const [gridOpacity, setGridOpacity] = useState(0.3);
  const [gridColor, setGridColor] = useState('#3b82f6');
  const [showMajorLines, setShowMajorLines] = useState(true);

  // Generate grid pattern
  const generateGridPattern = () => {
    const majorGridSize = gridSize * 5; // Major grid lines every 5 units
    
    return (
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ 
          opacity: gridOpacity,
          zIndex: 1000
        }}
      >
        <defs>
          <pattern
            id="grid-pattern"
            width={gridSize}
            height={gridSize}
            patternUnits="userSpaceOnUse"
          >
            <path
              d={`M ${gridSize} 0 L 0 0 0 ${gridSize}`}
              fill="none"
              stroke={gridColor}
              strokeWidth="0.5"
              opacity="0.5"
            />
          </pattern>
          
          {showMajorLines && (
            <pattern
              id="major-grid-pattern"
              width={majorGridSize}
              height={majorGridSize}
              patternUnits="userSpaceOnUse"
            >
              <path
                d={`M ${majorGridSize} 0 L 0 0 0 ${majorGridSize}`}
                fill="none"
                stroke={gridColor}
                strokeWidth="1"
                opacity="0.8"
              />
            </pattern>
          )}
        </defs>
        
        <rect
          width="100%"
          height="100%"
          fill="url(#grid-pattern)"
        />
        
        {showMajorLines && (
          <rect
            width="100%"
            height="100%"
            fill="url(#major-grid-pattern)"
          />
        )}
        
        {/* Grid info overlay */}
        <g>
          <rect
            x="10"
            y="10"
            width="120"
            height="50"
            fill="rgba(0, 0, 0, 0.7)"
            rx="6"
          />
          <text
            x="20"
            y="30"
            fill="white"
            fontSize="12"
            fontFamily="monospace"
          >
            Grid: {gridSize}px
          </text>
          <text
            x="20"
            y="45"
            fill={snapToGrid ? '#10b981' : '#ef4444'}
            fontSize="10"
            fontFamily="monospace"
          >
            Snap: {snapToGrid ? 'ON' : 'OFF'}
          </text>
        </g>
      </svg>
    );
  };

  return (
    <>
      {/* Grid Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[999] pointer-events-none"
        data-editor-ui="true"
      >
        {generateGridPattern()}
      </motion.div>

      {/* Grid Control Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setShowGridControls(!showGridControls)}
        className="fixed bottom-20 right-6 z-[1001] p-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full shadow-lg hover:shadow-blue-500/30 transition-all duration-300"
        data-editor-ui="true"
        title="Grid Settings"
      >
        <Grid className="w-5 h-5" />
      </motion.button>

      {/* Advanced Grid Controls Panel */}
      <AnimatePresence>
        {showGridControls && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-32 right-6 z-[1001] bg-white/95 backdrop-blur-xl border border-gray-200 rounded-xl shadow-2xl p-4 w-80"
            data-editor-ui="true"
          >
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <Grid className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Grid Settings</h3>
                    <p className="text-xs text-gray-500">Customize grid overlay</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowGridControls(false)}
                  className="p-1 hover:bg-gray-100 rounded"
                  data-editor-ui="true"
                  type="button"
                >
                  <Settings className="w-4 h-4 text-gray-400" />
                </button>
              </div>

              {/* Grid Size */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Grid Size: {gridSize}px
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="10"
                    max="50"
                    value={gridSize}
                    onChange={(e) => onGridSizeChange(parseInt(e.target.value))}
                    className="flex-1"
                  />
                  <input
                    type="number"
                    value={gridSize}
                    onChange={(e) => onGridSizeChange(parseInt(e.target.value))}
                    className="w-16 px-2 py-1 text-xs border border-gray-300 rounded"
                    min="10"
                    max="100"
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Fine</span>
                  <span>Coarse</span>
                </div>
              </div>

              {/* Grid Opacity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Grid Opacity: {Math.round(gridOpacity * 100)}%
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.1"
                  value={gridOpacity}
                  onChange={(e) => setGridOpacity(parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* Grid Color */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Grid Color
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={gridColor}
                    onChange={(e) => setGridColor(e.target.value)}
                    className="w-12 h-8 rounded border border-gray-300"
                  />
                  <input
                    type="text"
                    value={gridColor}
                    onChange={(e) => setGridColor(e.target.value)}
                    className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded"
                    placeholder="#3b82f6"
                  />
                </div>
              </div>

              {/* Options */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">
                    Snap to Grid
                  </label>
                  <button
                    onClick={onSnapToggle}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      snapToGrid ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                    data-editor-ui="true"
                    type="button"
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                        snapToGrid ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">
                    Major Grid Lines
                  </label>
                  <button
                    onClick={() => setShowMajorLines(!showMajorLines)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      showMajorLines ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                    data-editor-ui="true"
                    type="button"
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                        showMajorLines ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Quick Presets */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quick Presets
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => onGridSizeChange(12)}
                    className="px-3 py-2 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                    data-editor-ui="true"
                    type="button"
                  >
                    Fine (12px)
                  </button>
                  <button
                    onClick={() => onGridSizeChange(20)}
                    className="px-3 py-2 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                    data-editor-ui="true"
                    type="button"
                  >
                    Normal (20px)
                  </button>
                  <button
                    onClick={() => onGridSizeChange(40)}
                    className="px-3 py-2 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                    data-editor-ui="true"
                    type="button"
                  >
                    Coarse (40px)
                  </button>
                </div>
              </div>

              {/* Grid Statistics */}
              <div className="pt-3 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-blue-500" />
                    <div>
                      <div className="text-xs text-gray-500">Grid Lines</div>
                      <div className="font-medium">
                        {Math.floor(window.innerWidth / gridSize)} × {Math.floor(window.innerHeight / gridSize)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-green-500" />
                    <div>
                      <div className="text-xs text-gray-500">Snapping</div>
                      <div className={`font-medium ${snapToGrid ? 'text-green-600' : 'text-red-600'}`}>
                        {snapToGrid ? 'Enabled' : 'Disabled'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    onGridSizeChange(20);
                    setGridOpacity(0.3);
                    setGridColor('#3b82f6');
                    setShowMajorLines(true);
                  }}
                  className="flex-1 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center justify-center gap-1"
                  data-editor-ui="true"
                  type="button"
                >
                  <RotateCw className="w-3 h-3" />
                  Reset
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowGridControls(false)}
                  className="flex-1 px-3 py-2 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center justify-center gap-1"
                  data-editor-ui="true"
                  type="button"
                >
                  <Settings className="w-3 h-3" />
                  Done
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grid Snap Indicator */}
      <AnimatePresence>
        {snapToGrid && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed bottom-32 left-6 z-[1001] bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-2 rounded-lg shadow-lg text-sm font-medium flex items-center gap-2"
            data-editor-ui="true"
          >
            <Target className="w-4 h-4" />
            Snap to Grid: {gridSize}px
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AdvancedGridOverlay;