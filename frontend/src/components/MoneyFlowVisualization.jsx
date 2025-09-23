import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as d3 from 'd3';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  ArrowRight, 
  ArrowLeft,
  Circle,
  Play,
  Pause,
  RefreshCw,
  Settings,
  Filter,
  BarChart3,
  PieChart,
  LineChart,
  Zap,
  Target,
  Wallet,
  CreditCard,
  Banknote,
  Coins,
  Calculator,
  Globe,
  Building,
  User,
  Users,
  Clock,
  Calendar,
  Eye,
  EyeOff,
  Maximize2,
  Minimize2,
  Download,
  Upload,
  Share2,
  MoreHorizontal,
  Layers,
  Grid3X3,
  Crosshair
} from 'lucide-react';

const MoneyFlowVisualization = ({ 
  isEditMode, 
  data = null,
  onDataChange,
  theme = 'dark',
  interactive = true,
  realTime = true 
}) => {
  const [viewMode, setViewMode] = useState('flow'); // flow, sankey, network, timeline
  const [isPlaying, setIsPlaying] = useState(true);
  const [selectedNode, setSelectedNode] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [timeRange, setTimeRange] = useState('month');
  const [showSettings, setShowSettings] = useState(false);
  const [flowData, setFlowData] = useState([]);
  const [animationSpeed, setAnimationSpeed] = useState(1);
  const [nodeSize, setNodeSize] = useState(1);
  const [showLabels, setShowLabels] = useState(true);
  const [gridSnap, setGridSnap] = useState(false);

  // Generate realistic money flow data
  const generateFlowData = useCallback(() => {
    const categories = [
      { id: 'income', name: 'Income', type: 'source', color: '#10b981', icon: Wallet },
      { id: 'expenses', name: 'Expenses', type: 'sink', color: '#ef4444', icon: CreditCard },
      { id: 'investments', name: 'Investments', type: 'flow', color: '#3b82f6', icon: TrendingUp },
      { id: 'savings', name: 'Savings', type: 'flow', color: '#8b5cf6', icon: Banknote },
      { id: 'business', name: 'Business', type: 'flow', color: '#f59e0b', icon: Building },
      { id: 'freelance', name: 'Freelance', type: 'source', color: '#06b6d4', icon: User },
      { id: 'education', name: 'Education', type: 'sink', color: '#ec4899', icon: Calculator },
    ];

    const connections = [
      { from: 'income', to: 'expenses', amount: 3500, label: 'Living Costs' },
      { from: 'income', to: 'savings', amount: 1500, label: 'Emergency Fund' },
      { from: 'income', to: 'investments', amount: 2000, label: 'Portfolio' },
      { from: 'freelance', to: 'business', amount: 1200, label: 'Reinvestment' },
      { from: 'investments', to: 'savings', amount: 300, label: 'Dividends' },
      { from: 'business', to: 'expenses', amount: 800, label: 'Operations' },
      { from: 'savings', to: 'education', amount: 500, label: 'Courses' }
    ];

    return { categories, connections };
  }, []);

  const { categories, connections } = useMemo(() => generateFlowData(), [generateFlowData]);

  // Real-time animation effect
  useEffect(() => {
    if (!isPlaying || !realTime) return;

    const interval = setInterval(() => {
      setFlowData(prev => [
        ...prev.slice(-50), // Keep last 50 flow particles
        {
          id: Date.now(),
          from: Math.random() > 0.7 ? 'freelance' : 'income',
          to: ['expenses', 'savings', 'investments'][Math.floor(Math.random() * 3)],
          amount: Math.random() * 1000 + 100,
          timestamp: Date.now(),
          speed: animationSpeed
        }
      ]);
    }, 1000 / animationSpeed);

    return () => clearInterval(interval);
  }, [isPlaying, realTime, animationSpeed]);

  // Interactive Flow Diagram Component
  const FlowDiagram = () => (
    <div className="relative w-full h-96 bg-gray-900/50 rounded-xl border border-gray-700 overflow-hidden">
      <svg className="w-full h-full" viewBox="0 0 800 400">
        {/* Grid Background */}
        {gridSnap && (
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(123,223,255,0.1)" strokeWidth="0.5"/>
            </pattern>
          </defs>
        )}
        {gridSnap && <rect width="100%" height="100%" fill="url(#grid)" />}

        {/* Connection Lines */}
        {connections.map((conn, i) => {
          const fromNode = categories.find(c => c.id === conn.from);
          const toNode = categories.find(c => c.id === conn.to);
          const fromIndex = categories.indexOf(fromNode);
          const toIndex = categories.indexOf(toNode);
          
          const fromX = 150 + (fromIndex % 3) * 200;
          const fromY = 100 + Math.floor(fromIndex / 3) * 150;
          const toX = 150 + (toIndex % 3) * 200;
          const toY = 100 + Math.floor(toIndex / 3) * 150;

          return (
            <g key={i}>
              <motion.line
                x1={fromX}
                y1={fromY}
                x2={toX}
                y2={toY}
                stroke={fromNode?.color || '#7bdfff'}
                strokeWidth={Math.max(1, conn.amount / 500)}
                strokeOpacity={0.7}
                initial={{ strokeDasharray: "0,1000" }}
                animate={{ strokeDasharray: isPlaying ? "5,5" : "0,0" }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              
              {/* Flow Particles */}
              <AnimatePresence>
                {flowData
                  .filter(f => f.from === conn.from && f.to === conn.to)
                  .slice(-3)
                  .map(flow => (
                    <motion.circle
                      key={flow.id}
                      r="3"
                      fill={fromNode?.color || '#7bdfff'}
                      initial={{ 
                        cx: fromX, 
                        cy: fromY,
                        opacity: 0,
                        scale: 0
                      }}
                      animate={{ 
                        cx: toX, 
                        cy: toY,
                        opacity: [0, 1, 1, 0],
                        scale: [0, 1.5, 1, 0]
                      }}
                      exit={{ opacity: 0, scale: 0 }}
                      transition={{ 
                        duration: 3 / flow.speed,
                        ease: "easeInOut"
                      }}
                    />
                  ))
                }
              </AnimatePresence>

              {/* Amount Label */}
              {showLabels && (
                <text
                  x={(fromX + toX) / 2}
                  y={(fromY + toY) / 2 - 10}
                  fill="#fff"
                  fontSize="12"
                  textAnchor="middle"
                  className="font-medium"
                >
                  ${conn.amount.toLocaleString()}
                </text>
              )}
            </g>
          );
        })}

        {/* Category Nodes */}
        {categories.map((category, i) => {
          const x = 150 + (i % 3) * 200;
          const y = 100 + Math.floor(i / 3) * 150;
          const IconComponent = category.icon;
          
          return (
            <g key={category.id}>
              <motion.circle
                cx={x}
                cy={y}
                r={30 * nodeSize}
                fill={category.color}
                stroke="#fff"
                strokeWidth="3"
                className="cursor-pointer"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedNode(category)}
                animate={{
                  r: selectedNode?.id === category.id ? 35 * nodeSize : 30 * nodeSize,
                  strokeWidth: selectedNode?.id === category.id ? 4 : 3
                }}
              />
              
              {/* Icon */}
              <foreignObject
                x={x - 12}
                y={y - 12}
                width="24"
                height="24"
                className="pointer-events-none"
              >
                <IconComponent className="w-6 h-6 text-white" />
              </foreignObject>
              
              {/* Label */}
              {showLabels && (
                <text
                  x={x}
                  y={y + 50}
                  fill="#fff"
                  fontSize="14"
                  textAnchor="middle"
                  className="font-semibold pointer-events-none"
                >
                  {category.name}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {/* Floating Details Panel */}
      <AnimatePresence>
        {selectedNode && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="absolute top-4 right-4 bg-gray-800/95 backdrop-blur-xl border border-gray-600 rounded-xl p-4 min-w-64"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <div 
                  className="w-4 h-4 rounded-full mr-2" 
                  style={{ backgroundColor: selectedNode.color }}
                />
                <span className="font-semibold text-white">{selectedNode.name}</span>
              </div>
              <button
                onClick={() => setSelectedNode(null)}
                className="text-gray-400 hover:text-white"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Type:</span>
                <span className="text-white capitalize">{selectedNode.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Total Flow:</span>
                <span className="text-green-400 font-medium">
                  ${connections
                    .filter(c => c.from === selectedNode.id || c.to === selectedNode.id)
                    .reduce((sum, c) => sum + c.amount, 0)
                    .toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Connections:</span>
                <span className="text-blue-400">
                  {connections.filter(c => c.from === selectedNode.id || c.to === selectedNode.id).length}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  // Advanced Control Panel
  const ControlPanel = () => (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl p-4"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-white flex items-center">
          <Settings className="w-4 h-4 mr-2" />
          Flow Controls
        </h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`p-2 rounded-lg transition-colors ${isPlaying ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setFlowData([])}
            className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* View Mode Selector */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-300 mb-2">View Mode</label>
        <div className="grid grid-cols-2 gap-2">
          {[
            { id: 'flow', name: 'Flow', icon: ArrowRight },
            { id: 'network', name: 'Network', icon: Globe },
            { id: 'timeline', name: 'Timeline', icon: Clock },
            { id: 'chart', name: 'Chart', icon: BarChart3 }
          ].map(mode => (
            <button
              key={mode.id}
              onClick={() => setViewMode(mode.id)}
              className={`flex items-center justify-center p-2 rounded-lg transition-colors ${
                viewMode === mode.id 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <mode.icon className="w-4 h-4 mr-1" />
              <span className="text-xs">{mode.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Animation Controls */}
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Animation Speed</label>
          <input
            type="range"
            min="0.5"
            max="3"
            step="0.1"
            value={animationSpeed}
            onChange={(e) => setAnimationSpeed(parseFloat(e.target.value))}
            className="w-full accent-blue-600"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>Slow</span>
            <span>{animationSpeed}x</span>
            <span>Fast</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Node Size</label>
          <input
            type="range"
            min="0.5"
            max="2"
            step="0.1"
            value={nodeSize}
            onChange={(e) => setNodeSize(parseFloat(e.target.value))}
            className="w-full accent-purple-600"
          />
        </div>

        {/* Toggle Controls */}
        <div className="space-y-2">
          {[
            { key: 'showLabels', label: 'Show Labels', state: showLabels, setState: setShowLabels },
            { key: 'gridSnap', label: 'Grid Snap', state: gridSnap, setState: setGridSnap },
            { key: 'realTime', label: 'Real-time', state: realTime, setState: () => {} }
          ].map(toggle => (
            <label key={toggle.key} className="flex items-center justify-between">
              <span className="text-sm text-gray-300">{toggle.label}</span>
              <button
                onClick={() => toggle.setState(!toggle.state)}
                className={`relative w-10 h-5 rounded-full transition-colors ${
                  toggle.state ? 'bg-blue-600' : 'bg-gray-600'
                }`}
              >
                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                  toggle.state ? 'translate-x-5' : 'translate-x-0.5'
                }`} />
              </button>
            </label>
          ))}
        </div>
      </div>

      {/* Filter Controls */}
      <div className="mt-4 pt-4 border-t border-gray-700">
        <label className="block text-sm font-medium text-gray-300 mb-2">Filter Type</label>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
        >
          <option value="all">All Flows</option>
          <option value="source">Sources Only</option>
          <option value="sink">Expenses Only</option>
          <option value="flow">Transfers Only</option>
        </select>
      </div>
    </motion.div>
  );

  return (
    <div className="w-full max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl mr-4">
            <DollarSign className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Money Flow Visualization</h2>
            <p className="text-gray-400">Real-time financial flow analysis</p>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center space-x-4">
          <div className="bg-gray-800/50 rounded-xl px-4 py-2 border border-gray-700">
            <div className="text-sm text-gray-400">Total Flow</div>
            <div className="text-xl font-bold text-green-400">
              ${connections.reduce((sum, c) => sum + c.amount, 0).toLocaleString()}
            </div>
          </div>
          <div className="bg-gray-800/50 rounded-xl px-4 py-2 border border-gray-700">
            <div className="text-sm text-gray-400">Active Flows</div>
            <div className="text-xl font-bold text-blue-400">{flowData.length}</div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Flow Visualization */}
        <div className="lg:col-span-3">
          <FlowDiagram />
          
          {/* Quick Actions */}
          <div className="flex items-center justify-between mt-4 p-3 bg-gray-800/30 rounded-xl border border-gray-700">
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-400">Quick Actions:</span>
              <button className="flex items-center px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded-lg text-white text-sm transition-colors">
                <Download className="w-3 h-3 mr-1" />
                Export
              </button>
              <button className="flex items-center px-3 py-1.5 bg-green-600 hover:bg-green-700 rounded-lg text-white text-sm transition-colors">
                <Share2 className="w-3 h-3 mr-1" />
                Share
              </button>
              <button className="flex items-center px-3 py-1.5 bg-purple-600 hover:bg-purple-700 rounded-lg text-white text-sm transition-colors">
                <Zap className="w-3 h-3 mr-1" />
                Analyze
              </button>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="flex items-center text-xs text-gray-400">
                <Circle className="w-2 h-2 fill-green-400 text-green-400 mr-1 animate-pulse" />
                Live Updates Active
              </div>
            </div>
          </div>
        </div>

        {/* Control Panel */}
        <div className="lg:col-span-1">
          <ControlPanel />
        </div>
      </div>

      {/* Edit Mode Overlay */}
      {isEditMode && (
        <div className="absolute inset-0 bg-blue-500/10 border-2 border-dashed border-blue-500 rounded-xl pointer-events-none">
          <div className="absolute top-2 left-2 bg-blue-500 text-white px-2 py-1 rounded text-xs font-medium">
            Money Flow Component - Click to Edit
          </div>
        </div>
      )}
    </div>
  );
};

export default MoneyFlowVisualization;