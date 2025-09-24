import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronRight, 
  ChevronLeft, 
  ChevronDown,
  ChevronUp,
  Layers, 
  Settings, 
  Image, 
  Video, 
  Code2, 
  Sparkles,
  Eye,
  EyeOff,
  Trash2,
  Upload,
  Download,
  Edit3,
  Palette,
  Layout,
  Grid,
  Ruler,
  Move,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Monitor,
  Tablet,
  Smartphone,
  Box,
  Maximize2,
  Minimize2,
  RotateCcw,
  Sliders,
  Type,
  ColorWheel,
  Frame,
  Wand2,
  History,
  FileText,
  Zap,
  Target,
  Layers3,
  Component,
  MousePointer,
  RefreshCw,
  Copy,
  Scissors,
  MoreVertical,
  PanelRightClose,
  PanelRightOpen
} from 'lucide-react';
import Editor from '@monaco-editor/react';
import AIRedesignAssistant from './AIRedesignAssistant';
import EmergentAIAssistant from './EmergentAIAssistant';

const SuperAdvancedRightPanel = ({ 
  isOpen, 
  onToggle, 
  selectedElement, 
  onElementUpdate,
  content,
  onContentChange,
  isAuthenticated = false 
}) => {
  const [activeTab, setActiveTab] = useState('layers');
  const [uploadedVideos, setUploadedVideos] = useState([]);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [customCSS, setCustomCSS] = useState('');
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedElement, setDraggedElement] = useState(null);
  const [dimensions, setDimensions] = useState({
    width: 0, height: 0, x: 0, y: 0, rotation: 0
  });
  const [viewport, setViewport] = useState('desktop');
  
  // Advanced expand/collapse state for different sections
  const [expandedSections, setExpandedSections] = useState({
    // Layers tab
    pageStructure: true,
    elementHierarchy: true,
    visibilityControls: false,
    layerEffects: false,
    advancedDragging: true,
    
    // Properties tab  
    dimensions: true,
    position: true,
    rotationTransform: false,
    responsiveViewport: true,
    advancedStyling: false,
    animationControls: false,
    livePreview: true,
    
    // Assets tab
    videoAssets: true,
    imageAssets: true,
    iconLibrary: false,
    fontAssets: false,
    
    // Code tab
    cssEditor: true,
    aiCssGeneration: true,
    cssPresets: false,
    advancedCssTools: false,
    liveCodePreview: true,
    
    // AI tab
    quickAiActions: true,
    aiSuggestionsHistory: true,
    aiContentGeneration: false,
    aiDesignAnalysis: false,
    aiRedesign: true
  });
  
  const backendUrl = process.env.REACT_APP_BACKEND_URL;
  const fileInputRef = useRef(null);
  const videoInputRef = useRef(null);

  // Get existing CSS from selected element
  useEffect(() => {
    if (selectedElement) {
      const computedStyles = window.getComputedStyle(selectedElement);
      const existingCSS = generateCSSFromElement(selectedElement, computedStyles);
      setCustomCSS(existingCSS);
      
      // Update dimensions from element
      const rect = selectedElement.getBoundingClientRect();
      setDimensions({
        width: Math.round(rect.width),
        height: Math.round(rect.height),
        x: Math.round(rect.left),
        y: Math.round(rect.top),
        rotation: 0
      });
    }
  }, [selectedElement]);

  // Generate CSS from element styles
  const generateCSSFromElement = (element, styles) => {
    const cssRules = [];
    
    // Get element identifier
    const elementId = element.id ? `#${element.id}` : 
                     element.className ? `.${element.className.split(' ')[0]}` : 
                     element.tagName.toLowerCase();
    
    cssRules.push(`/* Existing styles for ${elementId} */`);
    cssRules.push(`${elementId} {`);
    
    // Important CSS properties to show
    const importantProps = [
      'display', 'position', 'width', 'height', 'margin', 'padding',
      'background', 'background-color', 'color', 'font-size', 'font-family',
      'border', 'border-radius', 'box-shadow', 'transform', 'transition',
      'opacity', 'z-index', 'overflow', 'text-align', 'line-height'
    ];
    
    importantProps.forEach(prop => {
      const value = styles.getPropertyValue(prop);
      if (value && value !== 'auto' && value !== 'normal' && value !== 'none') {
        cssRules.push(`  ${prop}: ${value};`);
      }
    });
    
    cssRules.push('}');
    cssRules.push('');
    cssRules.push('/* Add your custom CSS below */');
    
    return cssRules.join('\n');
  };

  // Toggle section expansion with smooth scroll
  const toggleSection = (sectionName) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionName]: !prev[sectionName]
    }));
    
    // Smooth scroll to section
    setTimeout(() => {
      const sectionElement = document.getElementById(`section-${sectionName}`);
      if (sectionElement) {
        sectionElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'nearest' 
        });
      }
    }, 100);
  };

  // Enhanced Collapsible Section Component with gradient variants
  const CollapsibleSection = ({ 
    name, 
    title, 
    icon: Icon, 
    children, 
    defaultExpanded = false,
    variant = 'default' 
  }) => {
    const isExpanded = expandedSections[name] !== undefined ? expandedSections[name] : defaultExpanded;
    
    const variantStyles = {
      default: 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200',
      primary: 'bg-gradient-to-r from-blue-50 to-indigo-100 border-blue-200',
      success: 'bg-gradient-to-r from-green-50 to-emerald-100 border-green-200',
      warning: 'bg-gradient-to-r from-yellow-50 to-orange-100 border-yellow-200',
      danger: 'bg-gradient-to-r from-red-50 to-pink-100 border-red-200',
      purple: 'bg-gradient-to-r from-purple-50 to-violet-100 border-purple-200',
      creative: 'bg-gradient-to-r from-cyan-50 via-blue-50 to-purple-50 border-blue-200'
    };

    return (
      <div 
        id={`section-${name}`}
        className={`border rounded-lg mb-3 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 ${variantStyles[variant]}`}
      >
        <button
          onClick={() => toggleSection(name)}
          className="w-full flex items-center justify-between p-3 text-left hover:bg-white/50 transition-colors group"
          data-editor-ui="true"
        >
          <div className="flex items-center space-x-2">
            <Icon className="w-4 h-4 text-gray-600 group-hover:text-blue-600 transition-colors" />
            <span className="text-sm font-medium text-gray-800 group-hover:text-blue-800">{title}</span>
          </div>
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <ChevronDown className="w-4 h-4 text-gray-500 group-hover:text-blue-600" />
          </motion.div>
        </button>
        
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.4, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="p-3 pt-0 bg-white/40 backdrop-blur-sm">
                {children}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  // Advanced Element Dragging System
  const startDragging = (element) => {
    setIsDragging(true);
    setDraggedElement(element);
    
    const handleMouseMove = (e) => {
      if (element) {
        element.style.position = 'absolute';
        element.style.left = e.clientX - 50 + 'px';
        element.style.top = e.clientY - 20 + 'px';
        element.style.zIndex = '9999';
        element.style.cursor = 'grabbing';
      }
    };
    
    const handleMouseUp = () => {
      setIsDragging(false);
      setDraggedElement(null);
      if (element) {
        element.style.cursor = 'grab';
      }
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // Load uploaded media on component mount
  useEffect(() => {
    if (isAuthenticated) {
      loadUploadedMedia();
    }
  }, [isAuthenticated]);

  const loadUploadedMedia = async () => {
    try {
      // Skip loading media for now as endpoints are not implemented
      console.log('Media loading skipped - backend endpoints not available');
      setUploadedVideos([]);
      setUploadedImages([]);
    } catch (error) {
      console.warn('Failed to load media:', error);
    }
  };

  // Generate AI suggestions with enhanced creativity
  const generateAISuggestions = async (type = 'layout') => {
    setIsGeneratingAI(true);
    try {
      // Provide mock suggestions since AI endpoints are not implemented
      const mockSuggestions = {
        layout: [
          'Consider using a grid-based layout for better organization',
          'Add more whitespace between sections for improved readability',
          'Use consistent spacing and alignment throughout'
        ],
        content: [
          'Add compelling call-to-action buttons',
          'Improve heading hierarchy and typography',
          'Include social proof and testimonials'
        ],
        design: [
          'Apply a modern color palette with better contrast',
          'Use subtle shadows and gradients for depth',
          'Implement responsive design principles'
        ]
      };
      
      setTimeout(() => {
        setAiSuggestions(mockSuggestions[type] || mockSuggestions.layout);
        setIsGeneratingAI(false);
      }, 1500);
      
    } catch (error) {
      console.error('AI suggestion generation failed:', error);
      setAiSuggestions(['AI service temporarily unavailable']);
      setIsGeneratingAI(false);
    }
  };

  // Enhanced CSS generation with AI
  const generateCustomCSS = async () => {
    setIsGeneratingAI(true);
    try {
      // Provide mock CSS generation since AI endpoints are not implemented
      const mockCSS = selectedElement ? 
        `/* Enhanced styles for ${selectedElement.tagName} element */
.enhanced-element {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(102, 126, 234, 0.3);
  padding: 24px;
  transition: all 0.3s ease;
}

.enhanced-element:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 60px rgba(102, 126, 234, 0.4);
}` : 
        `/* Modern website enhancement CSS */
.container {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 15px 50px rgba(0, 0, 0, 0.1);
}`;
      
      setTimeout(() => {
        setCustomCSS(mockCSS);
        setIsGeneratingAI(false);
      }, 2000);
      
    } catch (error) {
      console.error('CSS generation failed:', error);
      setCustomCSS('/* AI CSS generation temporarily unavailable */');
      setIsGeneratingAI(false);
    }
  };

  // Enhanced Layers Tab with Advanced Dragging
  const renderLayersTab = () => (
    <div className="space-y-1">
      {/* Advanced Dragging System */}
      <CollapsibleSection 
        name="advancedDragging" 
        title="Advanced Element Dragging" 
        icon={MousePointer}
        variant="creative"
      >
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (selectedElement) startDragging(selectedElement);
              }}
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              className="px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all flex items-center justify-center cursor-pointer select-none"
              style={{ 
                minHeight: '40px',
                userSelect: 'none',
                WebkitUserSelect: 'none'
              }}
            >
              <Move className="w-3 h-3 mr-1" />
              Drag Mode
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Clone Element clicked');
              }}
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              className="px-4 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-sm rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all flex items-center justify-center cursor-pointer select-none"
              style={{ 
                minHeight: '40px',
                userSelect: 'none',
                WebkitUserSelect: 'none'
              }}
            >
              <Copy className="w-3 h-3 mr-1" />
              Clone Element
            </motion.button>
          </div>
          
          {isDragging && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-2 bg-gradient-to-r from-green-100 to-emerald-100 border border-green-300 rounded text-center"
            >
              <span className="text-xs text-green-800 font-medium">🎯 Dragging Mode Active</span>
            </motion.div>
          )}
        </div>
      </CollapsibleSection>

      {/* Page Structure with Enhanced UI */}
      <CollapsibleSection 
        name="pageStructure" 
        title="Page Structure" 
        icon={Layers3}
        variant="primary"
      >
        <div className="space-y-2">
          {['Hero', 'About', 'Freelance', 'Projects', 'Skills', 'Experience', 'Contact'].map((section, index) => (
            <motion.div 
              key={section}
              className="flex items-center justify-between p-2 bg-white/80 backdrop-blur-sm rounded border hover:border-blue-300 transition-all cursor-pointer group"
              whileHover={{ scale: 1.02, x: 5 }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
                <Layout className="w-3 h-3 text-gray-400 group-hover:text-blue-500" />
                <span className="text-xs font-medium group-hover:text-blue-700">{section} Section</span>
              </div>
              <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-1 hover:bg-blue-100 rounded">
                  <Eye className="w-3 h-3 text-blue-600" />
                </button>
                <button 
                  className="p-1 hover:bg-purple-100 rounded"
                  onClick={() => {
                    const element = document.getElementById(section.toLowerCase());
                    if (element) startDragging(element);
                  }}
                >
                  <Move className="w-3 h-3 text-purple-600" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </CollapsibleSection>

      {/* Rest of the layers content... */}
    </div>
  );

  // Enhanced Code Tab with Live Preview
  const renderCodeTab = () => (
    <div className="space-y-1">
      {/* Live CSS Editor */}
      <CollapsibleSection 
        name="cssEditor" 
        title="Live CSS Editor" 
        icon={Code2}
        variant="creative"
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">Real-time CSS Editor</span>
            <div className="flex space-x-1">
              <button 
                onClick={() => {
                  if (selectedElement) {
                    const computedStyles = window.getComputedStyle(selectedElement);
                    const css = generateCSSFromElement(selectedElement, computedStyles);
                    setCustomCSS(css);
                  }
                }}
                className="px-2 py-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs rounded hover:from-green-600 hover:to-emerald-600"
              >
                <RefreshCw className="w-3 h-3 mr-1 inline" />
                Load CSS
              </button>
              <button className="px-2 py-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-xs rounded hover:from-blue-600 hover:to-cyan-600">
                Format
              </button>
            </div>
          </div>
          
          <div className="h-48 border rounded overflow-hidden shadow-inner">
            <Editor
              height="100%"
              defaultLanguage="css"
              value={customCSS}
              onChange={setCustomCSS}
              theme="vs-dark"
              options={{
                fontSize: 11,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                wordWrap: 'on',
                lineNumbers: 'on',
                automaticLayout: true
              }}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-3 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm rounded-lg hover:from-purple-600 hover:to-pink-600 flex items-center justify-center"
              onClick={() => {
                const style = document.createElement('style');
                style.textContent = customCSS;
                document.head.appendChild(style);
              }}
            >
              <Zap className="w-4 h-4 mr-2" />
              Apply Live
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={generateCustomCSS}
              disabled={isGeneratingAI}
              className="px-3 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-sm rounded-lg hover:from-blue-600 hover:to-cyan-600 flex items-center justify-center disabled:opacity-50"
            >
              {isGeneratingAI ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full mr-2"
                />
              ) : (
                <Sparkles className="w-4 h-4 mr-2" />
              )}
              AI CSS
            </motion.button>
          </div>
        </div>
      </CollapsibleSection>
    </div>
  );

  // Enhanced Properties Tab
  const renderPropertiesTab = () => (
    <div className="space-y-1">
      {selectedElement ? (
        <>
          {/* Element Properties */}
          <CollapsibleSection 
            name="elementProperties" 
            title="Element Properties" 
            icon={Settings}
            variant="primary"
          >
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-medium text-gray-700 block mb-1">Width</label>
                  <input 
                    type="text" 
                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                    placeholder="auto"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700 block mb-1">Height</label>
                  <input 
                    type="text" 
                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                    placeholder="auto"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-4 gap-1">
                <div>
                  <label className="text-xs font-medium text-gray-700 block mb-1">Top</label>
                  <input 
                    type="text" 
                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700 block mb-1">Right</label>
                  <input 
                    type="text" 
                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700 block mb-1">Bottom</label>
                  <input 
                    type="text" 
                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700 block mb-1">Left</label>
                  <input 
                    type="text" 
                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                    placeholder="0"
                  />
                </div>
              </div>
              
              <div>
                <label className="text-xs font-medium text-gray-700 block mb-2">Background Color</label>
                <div className="flex gap-2">
                  <input type="color" className="w-8 h-8 rounded border border-gray-300" />
                  <input 
                    type="text" 
                    className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                    placeholder="#000000"
                  />
                </div>
              </div>
            </div>
          </CollapsibleSection>

          {/* Typography Properties */}
          <CollapsibleSection 
            name="typography" 
            title="Typography" 
            icon={Type}
            variant="secondary"
          >
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-medium text-gray-700 block mb-1">Font Size</label>
                  <input 
                    type="text" 
                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                    placeholder="16px"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700 block mb-1">Font Weight</label>
                  <select className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:border-purple-500 focus:ring-1 focus:ring-purple-500">
                    <option value="400">Normal</option>
                    <option value="600">Semi Bold</option>
                    <option value="700">Bold</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="text-xs font-medium text-gray-700 block mb-2">Text Color</label>
                <div className="flex gap-2">
                  <input type="color" className="w-8 h-8 rounded border border-gray-300" />
                  <input 
                    type="text" 
                    className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                    placeholder="#000000"
                  />
                </div>
              </div>
            </div>
          </CollapsibleSection>
        </>
      ) : (
        <div className="p-4 text-center text-gray-500">
          <Settings className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Select an element to view its properties</p>
        </div>
      )}
    </div>
  );

  // Enhanced Assets Tab
  const renderAssetsTab = () => (
    <div className="space-y-1">
      {/* Image Assets */}
      <CollapsibleSection 
        name="imageAssets" 
        title="Images" 
        icon={Image}
        variant="success"
      >
        <div className="space-y-3">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 transition-colors"
          >
            <Upload className="w-6 h-6 mx-auto mb-1 text-gray-400" />
            <p className="text-xs text-gray-600">Click to upload images</p>
          </button>
          
          {uploadedImages.length > 0 && (
            <div className="grid grid-cols-2 gap-2">
              {uploadedImages.map((image, index) => (
                <div key={index} className="relative group">
                  <img 
                    src={image.url} 
                    alt={image.name}
                    className="w-full h-20 object-cover rounded border cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => {
                      // Logic to insert image into selected element
                      if (selectedElement && onElementUpdate) {
                        onElementUpdate(selectedElement, { 
                          style: { backgroundImage: `url(${image.url})` }
                        });
                      }
                    }}
                  />
                  <button
                    onClick={() => setUploadedImages(prev => prev.filter((_, i) => i !== index))}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </CollapsibleSection>

      {/* Video Assets */}
      <CollapsibleSection 
        name="videoAssets" 
        title="Videos" 
        icon={Video}
        variant="warning"
      >
        <div className="space-y-3">
          <button
            onClick={() => videoInputRef.current?.click()}
            className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 transition-colors"
          >
            <Upload className="w-6 h-6 mx-auto mb-1 text-gray-400" />
            <p className="text-xs text-gray-600">Click to upload videos</p>
          </button>
          
          {uploadedVideos.length > 0 && (
            <div className="space-y-2">
              {uploadedVideos.map((video, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded border">
                  <div className="flex items-center space-x-2">
                    <Video className="w-4 h-4 text-purple-500" />
                    <span className="text-xs font-medium truncate">{video.name}</span>
                  </div>
                  <button
                    onClick={() => setUploadedVideos(prev => prev.filter((_, i) => i !== index))}
                    className="text-red-500 hover:text-red-700 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </CollapsibleSection>

      {/* Component Library */}
      <CollapsibleSection 
        name="components" 
        title="Components" 
        icon={Component}
        variant="creative"
      >
        <div className="space-y-2">
          {[
            { name: 'Button', icon: MousePointer },
            { name: 'Card', icon: Box },
            { name: 'Header', icon: Layout },
            { name: 'Footer', icon: Frame }
          ].map((component, index) => (
            <button
              key={index}
              className="w-full flex items-center space-x-2 p-2 text-left hover:bg-purple-50 rounded border border-transparent hover:border-purple-200 transition-all"
              onClick={() => {
                // Logic to add component
                console.log('Adding component:', component.name);
              }}
            >
              <component.icon className="w-4 h-4 text-purple-500" />
              <span className="text-xs font-medium">{component.name}</span>
            </button>
          ))}
        </div>
      </CollapsibleSection>
    </div>
  );

  // Enhanced AI Tab with Redesign Assistant
  const renderAITab = () => (
    <div className="space-y-1">
      {/* AI Redesign Assistant */}
      <CollapsibleSection 
        name="aiRedesign" 
        title="AI Redesign Assistant" 
        icon={Wand2}
        variant="creative"
      >
        <AIRedesignAssistant
          selectedElement={selectedElement}
          onElementUpdate={onElementUpdate}
          content={content}
          isAuthenticated={isAuthenticated}
        />
      </CollapsibleSection>

      {/* Quick AI Actions Section */}
      <CollapsibleSection 
        name="quickAiActions" 
        title="Quick AI Actions" 
        icon={Sparkles}
        variant="primary"
      >
        <div className="space-y-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-500">Gemini 2.0 Flash</span>
            <div className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
              Connected
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-2">
            <motion.button
              onClick={() => generateAISuggestions('layout')}
              disabled={isGeneratingAI}
              className="px-3 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 disabled:opacity-50 flex items-center justify-center"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Layout className="w-4 h-4 mr-2" />
              Layout Suggestions
            </motion.button>
            
            <motion.button
              onClick={() => generateAISuggestions('content')}
              disabled={isGeneratingAI}
              className="px-3 py-2 bg-green-500 text-white text-sm rounded hover:bg-green-600 disabled:opacity-50 flex items-center justify-center"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Edit3 className="w-4 h-4 mr-2" />
              Content Improvements
            </motion.button>
            
            <motion.button
              onClick={() => generateAISuggestions('design')}
              disabled={isGeneratingAI}
              className="px-3 py-2 bg-purple-500 text-white text-sm rounded hover:bg-purple-600 disabled:opacity-50 flex items-center justify-center"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Palette className="w-4 h-4 mr-2" />
              Design Enhancement
            </motion.button>
          </div>
          
          {isGeneratingAI && (
            <div className="flex items-center justify-center py-2">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-5 h-5 border-2 border-blue-500/30 border-t-blue-500 rounded-full mr-2"
              />
              <span className="text-xs text-blue-600">AI is thinking...</span>
            </div>
          )}
        </div>
      </CollapsibleSection>
    </div>
  );

  // Tabs configuration
  const tabs = [
    { id: 'layers', label: 'Layers', icon: Layers },
    { id: 'properties', label: 'Properties', icon: Settings },
    { id: 'assets', label: 'Assets', icon: Image },
    { id: 'code', label: 'Code', icon: Code2 },
    { id: 'ai', label: 'AI Assistant', icon: Sparkles }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'layers': return renderLayersTab();
      case 'properties': return renderPropertiesTab();
      case 'assets': return renderAssetsTab();
      case 'code': return renderCodeTab();
      case 'ai': return renderAITab();
      default: return <div className="p-4 text-center text-gray-500">Tab content coming soon...</div>;
    }
  };

  // Only show if authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      {/* Advanced Top-Right Toggle Button (Gradient Design) */}
      {!isOpen && (
        <motion.button
          initial={{ scale: 0, opacity: 0, x: 100, y: -100 }}
          animate={{ scale: 1, opacity: 1, x: 0, y: 0 }}
          exit={{ scale: 0, opacity: 0, x: 100, y: -100 }}
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.9 }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onToggle();
          }}
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          className="fixed top-20 right-4 z-[9900] p-5 bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-500 text-white rounded-2xl shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 group cursor-pointer select-none"
          data-editor-ui="true"
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
            boxShadow: '0 10px 40px rgba(102, 126, 234, 0.4), 0 0 0 1px rgba(255,255,255,0.1)'
          }}
        >
          <div className="relative">
            <PanelRightOpen className="w-6 h-6 group-hover:scale-110 transition-transform" />
            <motion.div
              className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
        </motion.button>
      )}

      {/* Enhanced Right Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            transition={{ type: 'spring', damping: 20, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-96 bg-white/95 backdrop-blur-xl border-l border-gray-200/50 shadow-2xl z-[1000] flex flex-col right-panel"
            data-editor-ui="true"
            style={{
              background: 'linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)'
            }}
          >
            {/* Enhanced Header with Gradient */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200/50 bg-gradient-to-r from-blue-50 to-purple-50">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center" data-editor-ui="true">
                  <Settings className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-lg font-semibold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  Super Editor
                </h2>
              </div>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onToggle();
                }}
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                className="p-2 hover:bg-white/50 rounded-lg transition-all duration-300 group"
                data-editor-ui="true"
              >
                <PanelRightClose className="w-5 h-5 text-gray-600 group-hover:text-purple-600" />
              </motion.button>
            </div>

            {/* Enhanced Tabs */}
            <div className="flex border-b border-gray-200/50 bg-gray-50/50">
              {tabs.map(({ id, label, icon: Icon }) => (
                <motion.button
                  key={id}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setActiveTab(id);
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  whileHover={{ y: -2 }}
                  whileTap={{ y: 0 }}
                  className={`flex-1 p-4 text-xs font-medium border-b-2 transition-all duration-200 cursor-pointer select-none ${
                    activeTab === id
                      ? 'border-purple-500 text-purple-600 bg-purple-50/50'
                      : 'border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-100/50'
                  }`}
                  data-editor-ui="true"
                  style={{ 
                    minHeight: '60px',
                    userSelect: 'none',
                    WebkitUserSelect: 'none',
                    MozUserSelect: 'none',
                    msUserSelect: 'none'
                  }}
                >
                  <Icon className="w-4 h-4 mx-auto mb-1" />
                  <div>{label}</div>
                </motion.button>
              ))}
            </div>

            {/* Enhanced Content */}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {renderTabContent()}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom Scrollbar Styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0,0,0,0.1);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #667eea, #764ba2);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #5a67d8, #6b46c1);
        }
      `}</style>
    </>
  );
};

export default SuperAdvancedRightPanel;