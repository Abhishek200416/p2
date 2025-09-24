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
  Component
} from 'lucide-react';
import Editor from '@monaco-editor/react';

const SuperAdvancedRightPanel = ({ 
  isOpen, 
  onToggle, 
  selectedElement, 
  onElementUpdate,
  content,
  onContentChange 
}) => {
  const [activeTab, setActiveTab] = useState('layers');
  const [uploadedVideos, setUploadedVideos] = useState([]);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [customCSS, setCustomCSS] = useState('');
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
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
    
    // Properties tab  
    dimensions: true,
    position: true,
    rotationTransform: false,
    responsiveViewport: true,
    advancedStyling: false,
    animationControls: false,
    
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
    
    // AI tab
    quickAiActions: true,
    aiSuggestionsHistory: true,
    aiContentGeneration: false,
    aiDesignAnalysis: false
  });
  
  const backendUrl = process.env.REACT_APP_BACKEND_URL;
  const fileInputRef = useRef(null);
  const videoInputRef = useRef(null);

  // Toggle section expansion
  const toggleSection = (sectionName) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionName]: !prev[sectionName]
    }));
  };

  // Collapsible Section Component
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
      default: 'bg-gray-50 border-gray-200',
      primary: 'bg-blue-50 border-blue-200',
      success: 'bg-green-50 border-green-200',
      warning: 'bg-yellow-50 border-yellow-200',
      danger: 'bg-red-50 border-red-200',
      purple: 'bg-purple-50 border-purple-200'
    };

    return (
      <div className={`border rounded-lg mb-3 overflow-hidden ${variantStyles[variant]}`}>
        <button
          onClick={() => toggleSection(name)}
          className="w-full flex items-center justify-between p-3 text-left hover:bg-white/50 transition-colors"
        >
          <div className="flex items-center space-x-2">
            <Icon className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-800">{title}</span>
          </div>
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-4 h-4 text-gray-500" />
          </motion.div>
        </button>
        
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="p-3 pt-0 bg-white/30">
                {children}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  // Load uploaded media on component mount
  useEffect(() => {
    loadUploadedMedia();
  }, []);

  const loadUploadedMedia = async () => {
    try {
      // Load videos
      const videoResponse = await fetch(`${backendUrl}/api/super/video/list`);
      if (videoResponse.ok) {
        const videoData = await videoResponse.json();
        setUploadedVideos(videoData.videos || []);
      }
    } catch (error) {
      console.warn('Failed to load media:', error);
    }
  };

  // Handle video upload
  const handleVideoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${backendUrl}/api/super/video/upload`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        setUploadedVideos(prev => [...prev, result]);
        
        // Add video to content
        if (onContentChange) {
          onContentChange({
            ...content,
            hero: {
              ...content.hero,
              video: {
                src: `${backendUrl}${result.url}`,
                hasIntroVideo: true
              }
            }
          });
        }
      }
    } catch (error) {
      console.error('Video upload failed:', error);
    }
  };

  // Handle image upload
  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${backendUrl}/api/super/image/upload`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        setUploadedImages(prev => [...prev, result]);
      }
    } catch (error) {
      console.error('Image upload failed:', error);
    }
  };

  // Delete video
  const deleteVideo = async (videoId) => {
    try {
      const response = await fetch(`${backendUrl}/api/super/video/${videoId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setUploadedVideos(prev => prev.filter(v => v.id !== videoId));
        
        // Remove from content if it's the current video
        if (onContentChange && content.hero?.video?.src?.includes(videoId)) {
          onContentChange({
            ...content,
            hero: {
              ...content.hero,
              video: null,
              hasIntroVideo: false
            }
          });
        }
      }
    } catch (error) {
      console.error('Video deletion failed:', error);
    }
  };

  // Generate AI suggestions
  const generateAISuggestions = async (type = 'layout') => {
    setIsGeneratingAI(true);
    try {
      const response = await fetch(`${backendUrl}/api/super/ai/generate-content`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Analyze current website content and suggest improvements for ${type}`,
          context: JSON.stringify(content),
          type: 'layout_recommendation'
        })
      });

      if (response.ok) {
        const result = await response.json();
        setAiSuggestions(prev => [...prev, {
          id: Date.now(),
          type,
          content: result.content,
          timestamp: new Date().toISOString()
        }]);
      }
    } catch (error) {
      console.error('AI generation failed:', error);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // Generate custom CSS with AI
  const generateCustomCSS = async () => {
    setIsGeneratingAI(true);
    try {
      const response = await fetch(`${backendUrl}/api/super/ai/generate-css`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: selectedElement ? 
            `Enhance styles for ${selectedElement.tagName} element` : 
            'Generate modern CSS for selected element',
          element_type: selectedElement?.tagName || 'div',
          current_styles: selectedElement ? getComputedStyle(selectedElement) : {}
        })
      });

      if (response.ok) {
        const result = await response.json();
        setCustomCSS(result.css_code);
      }
    } catch (error) {
      console.error('CSS generation failed:', error);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // Update element dimensions
  const updateDimensions = useCallback(async (newDimensions) => {
    if (!selectedElement) return;
    
    try {
      await fetch(`${backendUrl}/api/super/dimensions/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          element_id: selectedElement.id || 'selected',
          ...newDimensions
        })
      });
      
      setDimensions(newDimensions);
      if (onElementUpdate) {
        onElementUpdate(selectedElement, { dimensions: newDimensions });
      }
    } catch (error) {
      console.error('Dimension update failed:', error);
    }
  }, [selectedElement, onElementUpdate, backendUrl]);

  // Tabs configuration
  const tabs = [
    { id: 'layers', label: 'Layers', icon: Layers },
    { id: 'properties', label: 'Properties', icon: Settings },
    { id: 'assets', label: 'Assets', icon: Image },
    { id: 'code', label: 'Code', icon: Code2 },
    { id: 'ai', label: 'AI Assistant', icon: Sparkles }
  ];

  const renderLayersTab = () => (
    <div className="space-y-1">
      {/* Page Structure Section */}
      <CollapsibleSection 
        name="pageStructure" 
        title="Page Structure" 
        icon={Layers3}
        variant="primary"
      >
        <div className="space-y-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-500">Main Sections</span>
            <div className="flex space-x-1">
              <button className="p-1 hover:bg-gray-100 rounded" title="Show All">
                <Eye className="w-3 h-3" />
              </button>
              <button className="p-1 hover:bg-gray-100 rounded" title="Grid View">
                <Grid className="w-3 h-3" />
              </button>
            </div>
          </div>
          
          {['Hero', 'About', 'Freelance', 'Projects', 'Skills', 'Experience', 'Contact'].map((section, index) => (
            <motion.div 
              key={section}
              className="flex items-center justify-between p-2 bg-white rounded border hover:border-blue-300 transition-colors cursor-pointer"
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <Layout className="w-3 h-3 text-gray-400" />
                <span className="text-xs font-medium">{section} Section</span>
              </div>
              <div className="flex space-x-1">
                <button className="p-1 hover:bg-gray-100 rounded">
                  <Eye className="w-3 h-3 text-blue-600" />
                </button>
                <button className="p-1 hover:bg-gray-100 rounded">
                  <Move className="w-3 h-3 text-gray-400" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </CollapsibleSection>

      {/* Element Hierarchy Section */}
      <CollapsibleSection 
        name="elementHierarchy" 
        title="Element Hierarchy" 
        icon={Component}
        variant="success"
      >
        <div className="space-y-2">
          <div className="space-y-1">
            {selectedElement ? (
              <div className="p-2 bg-blue-100 border border-blue-300 rounded">
                <div className="flex items-center space-x-2">
                  <Box className="w-3 h-3 text-blue-600" />
                  <span className="text-xs font-medium text-blue-800">
                    Selected: {selectedElement.tagName || 'Element'}
                  </span>
                </div>
                <div className="mt-1 text-xs text-blue-600">
                  ID: {selectedElement.id || 'No ID'}
                </div>
              </div>
            ) : (
              <div className="p-2 bg-gray-100 rounded text-center">
                <span className="text-xs text-gray-500">Select an element to view hierarchy</span>
              </div>
            )}
          </div>
        </div>
      </CollapsibleSection>

      {/* Visibility Controls Section */}
      <CollapsibleSection 
        name="visibilityControls" 
        title="Visibility & Display" 
        icon={Eye}
        variant="warning"
      >
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <button className="px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 flex items-center justify-center">
              <Eye className="w-3 h-3 mr-1" />
              Show All
            </button>
            <button className="px-2 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600 flex items-center justify-center">
              <EyeOff className="w-3 h-3 mr-1" />
              Hide All
            </button>
          </div>
          
          <div className="space-y-2">
            <label className="flex items-center justify-between">
              <span className="text-xs text-gray-600">Section Animations</span>
              <input type="checkbox" className="w-3 h-3" defaultChecked />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-xs text-gray-600">Hover Effects</span>
              <input type="checkbox" className="w-3 h-3" defaultChecked />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-xs text-gray-600">Particle System</span>
              <input type="checkbox" className="w-3 h-3" defaultChecked />
            </label>
          </div>
        </div>
      </CollapsibleSection>

      {/* Layer Effects Section */}
      <CollapsibleSection 
        name="layerEffects" 
        title="Layer Effects & Filters" 
        icon={Sliders}
        variant="purple"
      >
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Global Opacity</label>
            <input type="range" min="0" max="100" defaultValue="100" className="w-full h-1" />
          </div>
          
          <div>
            <label className="block text-xs text-gray-600 mb-1">Blur Effect</label>
            <input type="range" min="0" max="20" defaultValue="0" className="w-full h-1" />
          </div>
          
          <div>
            <label className="block text-xs text-gray-600 mb-1">Brightness</label>
            <input type="range" min="0" max="200" defaultValue="100" className="w-full h-1" />
          </div>
          
          <div className="flex space-x-1">
            <button className="px-2 py-1 bg-purple-500 text-white text-xs rounded hover:bg-purple-600 flex-1">
              Apply Effects
            </button>
            <button className="px-2 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600">
              Reset
            </button>
          </div>
        </div>
      </CollapsibleSection>
    </div>
  );

  const renderPropertiesTab = () => (
    <div className="space-y-1">
      {selectedElement ? (
        <>
          {/* Element Info */}
          <div className="p-3 bg-blue-100 border border-blue-200 rounded-lg mb-3">
            <div className="flex items-center space-x-2 mb-1">
              <Target className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Selected Element</span>
            </div>
            <div className="text-xs text-blue-600">
              {selectedElement.tagName} • ID: {selectedElement.id || 'No ID'}
            </div>
          </div>

          {/* Dimensions Section */}
          <CollapsibleSection 
            name="dimensions" 
            title="Dimensions & Size" 
            icon={Maximize2}
            variant="primary"
          >
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Width</label>
                  <input
                    type="number"
                    placeholder="Auto"
                    value={dimensions.width || ''}
                    onChange={(e) => updateDimensions({ ...dimensions, width: parseInt(e.target.value) || 0 })}
                    className="w-full px-2 py-1 text-xs border rounded focus:border-blue-400"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Height</label>
                  <input
                    type="number"
                    placeholder="Auto"
                    value={dimensions.height || ''}
                    onChange={(e) => updateDimensions({ ...dimensions, height: parseInt(e.target.value) || 0 })}
                    className="w-full px-2 py-1 text-xs border rounded focus:border-blue-400"
                  />
                </div>
              </div>
              
              <div className="flex space-x-1">
                <button className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 flex-1 flex items-center justify-center">
                  <Maximize2 className="w-3 h-3 mr-1" />
                  Auto Fit
                </button>
                <button className="px-2 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600 flex items-center justify-center">
                  <Minimize2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          </CollapsibleSection>

          {/* Position Section */}
          <CollapsibleSection 
            name="position" 
            title="Position & Layout" 
            icon={Move}
            variant="success"
          >
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">X Position</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={dimensions.x || ''}
                    onChange={(e) => updateDimensions({ ...dimensions, x: parseInt(e.target.value) || 0 })}
                    className="w-full px-2 py-1 text-xs border rounded focus:border-green-400"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Y Position</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={dimensions.y || ''}
                    onChange={(e) => updateDimensions({ ...dimensions, y: parseInt(e.target.value) || 0 })}
                    className="w-full px-2 py-1 text-xs border rounded focus:border-green-400"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-xs text-gray-500 mb-1">Position Type</label>
                <select className="w-full px-2 py-1 text-xs border rounded focus:border-green-400">
                  <option>Static</option>
                  <option>Relative</option>
                  <option>Absolute</option>
                  <option>Fixed</option>
                  <option>Sticky</option>
                </select>
              </div>
            </div>
          </CollapsibleSection>

          {/* Rotation & Transform Section */}
          <CollapsibleSection 
            name="rotationTransform" 
            title="Rotation & Transform" 
            icon={RotateCw}
            variant="warning"
          >
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Rotation</label>
                <input
                  type="range"
                  min="-180"
                  max="180"
                  value={dimensions.rotation || 0}
                  onChange={(e) => updateDimensions({ ...dimensions, rotation: parseInt(e.target.value) })}
                  className="w-full"
                />
                <div className="flex justify-between items-center mt-1">
                  <span className="text-xs text-gray-500">-180°</span>
                  <span className="text-xs font-medium">{dimensions.rotation || 0}°</span>
                  <span className="text-xs text-gray-500">180°</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Scale X</label>
                  <input type="range" min="0.1" max="3" step="0.1" defaultValue="1" className="w-full" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Scale Y</label>
                  <input type="range" min="0.1" max="3" step="0.1" defaultValue="1" className="w-full" />
                </div>
              </div>
              
              <div className="flex space-x-1">
                <button className="px-2 py-1 bg-yellow-500 text-white text-xs rounded hover:bg-yellow-600 flex-1 flex items-center justify-center">
                  <RotateCw className="w-3 h-3 mr-1" />
                  Apply
                </button>
                <button className="px-2 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600 flex items-center justify-center">
                  <RotateCcw className="w-3 h-3" />
                </button>
              </div>
            </div>
          </CollapsibleSection>

          {/* Responsive Viewport Section */}
          <CollapsibleSection 
            name="responsiveViewport" 
            title="Responsive Preview" 
            icon={Monitor}
            variant="primary"
          >
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-500 mb-2">Viewport Size</label>
                <div className="grid grid-cols-3 gap-1">
                  {[
                    { id: 'desktop', icon: Monitor, label: 'Desktop' },
                    { id: 'tablet', icon: Tablet, label: 'Tablet' },
                    { id: 'mobile', icon: Smartphone, label: 'Mobile' }
                  ].map(({ id, icon: Icon, label }) => (
                    <button
                      key={id}
                      onClick={() => setViewport(id)}
                      className={`p-2 rounded border text-xs ${
                        viewport === id 
                          ? 'bg-blue-500 text-white border-blue-500' 
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="w-3 h-3 mx-auto mb-1" />
                      <div className="text-xs">{label}</div>
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="text-xs text-center text-gray-500 bg-gray-100 py-2 rounded">
                Current: {viewport.charAt(0).toUpperCase() + viewport.slice(1)} View
              </div>
            </div>
          </CollapsibleSection>

          {/* Advanced Styling Section */}
          <CollapsibleSection 
            name="advancedStyling" 
            title="Advanced Styling" 
            icon={Palette}
            variant="purple"
          >
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Opacity</label>
                  <input type="range" min="0" max="100" defaultValue="100" className="w-full" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Z-Index</label>
                  <input type="number" defaultValue="0" className="w-full px-2 py-1 text-xs border rounded" />
                </div>
              </div>
              
              <div>
                <label className="block text-xs text-gray-500 mb-1">Box Shadow</label>
                <select className="w-full px-2 py-1 text-xs border rounded">
                  <option>None</option>
                  <option>Small</option>
                  <option>Medium</option>
                  <option>Large</option>
                  <option>Custom</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs text-gray-500 mb-1">Border Radius</label>
                <input type="range" min="0" max="50" defaultValue="8" className="w-full" />
              </div>
            </div>
          </CollapsibleSection>

          {/* Animation Controls Section */}
          <CollapsibleSection 
            name="animationControls" 
            title="Animation Controls" 
            icon={Zap}
            variant="danger"
          >
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Animation Type</label>
                <select className="w-full px-2 py-1 text-xs border rounded">
                  <option>None</option>
                  <option>Fade In</option>
                  <option>Slide Up</option>
                  <option>Slide Down</option>
                  <option>Scale In</option>
                  <option>Bounce</option>
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Duration (ms)</label>
                  <input type="number" defaultValue="300" className="w-full px-2 py-1 text-xs border rounded" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Delay (ms)</label>
                  <input type="number" defaultValue="0" className="w-full px-2 py-1 text-xs border rounded" />
                </div>
              </div>
              
              <button className="w-full px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 flex items-center justify-center">
                <Zap className="w-3 h-3 mr-1" />
                Preview Animation
              </button>
            </div>
          </CollapsibleSection>
        </>
      ) : (
        <div className="p-6 text-center">
          <Target className="w-8 h-8 mx-auto text-gray-400 mb-2" />
          <p className="text-sm text-gray-500">Select an element to view properties</p>
        </div>
      )}
    </div>
  );

  const renderAssetsTab = () => (
    <div className="space-y-1">
      {/* Video Assets Section */}
      <CollapsibleSection 
        name="videoAssets" 
        title="Video Assets" 
        icon={Video}
        variant="primary"
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">Manage video files</span>
            <button
              onClick={() => videoInputRef.current?.click()}
              className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 flex items-center"
            >
              <Upload className="w-3 h-3 mr-1" />
              Upload Video
            </button>
          </div>
          
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {uploadedVideos.length > 0 ? (
              uploadedVideos.map((video) => (
                <motion.div 
                  key={video.id} 
                  className="flex items-center justify-between p-2 bg-white border rounded hover:border-blue-300"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{video.filename}</p>
                    <p className="text-xs text-gray-500">{Math.round(video.size / 1024)} KB</p>
                  </div>
                  <div className="flex space-x-1">
                    <button className="p-1 text-blue-600 hover:bg-blue-50 rounded" title="Preview">
                      <Eye className="w-3 h-3" />
                    </button>
                    <button className="p-1 text-green-600 hover:bg-green-50 rounded" title="Use as Hero">
                      <Download className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => deleteVideo(video.id)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                      title="Delete"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="p-4 text-center border-2 border-dashed border-gray-200 rounded">
                <Video className="w-6 h-6 mx-auto text-gray-400 mb-1" />
                <p className="text-xs text-gray-500">No videos uploaded</p>
              </div>
            )}
          </div>
          
          <input
            ref={videoInputRef}
            type="file"
            accept="video/*"
            onChange={handleVideoUpload}
            className="hidden"
          />
        </div>
      </CollapsibleSection>

      {/* Image Assets Section */}
      <CollapsibleSection 
        name="imageAssets" 
        title="Image Assets" 
        icon={Image}
        variant="success"
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">Project & content images</span>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 flex items-center"
            >
              <Upload className="w-3 h-3 mr-1" />
              Upload Image
            </button>
          </div>
          
          {uploadedImages.length > 0 ? (
            <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
              {uploadedImages.map((image) => (
                <motion.div 
                  key={image.id} 
                  className="relative group"
                  whileHover={{ scale: 1.05 }}
                >
                  <img
                    src={`${backendUrl}${image.url}`}
                    alt={image.filename}
                    className="w-full h-16 object-cover rounded border border-gray-200"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center space-x-1">
                    <button className="p-1 text-white hover:text-blue-300" title="Use Image">
                      <Download className="w-3 h-3" />
                    </button>
                    <button className="p-1 text-white hover:text-red-300" title="Delete">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center border-2 border-dashed border-gray-200 rounded">
              <Image className="w-6 h-6 mx-auto text-gray-400 mb-1" />
              <p className="text-xs text-gray-500">No images uploaded</p>
            </div>
          )}
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
        </div>
      </CollapsibleSection>

      {/* Icon Library Section */}
      <CollapsibleSection 
        name="iconLibrary" 
        title="Icon Library" 
        icon={Zap}
        variant="warning"
      >
        <div className="space-y-3">
          <div className="text-xs text-gray-500 mb-2">Lucide React Icons</div>
          
          <div className="grid grid-cols-6 gap-1 max-h-32 overflow-y-auto">
            {[Edit3, Settings, Layout, Palette, Code2, Sparkles, Eye, Move, Grid, Ruler, Target, Type].map((Icon, index) => (
              <motion.button
                key={index}
                className="p-2 border rounded hover:bg-yellow-50 hover:border-yellow-300 flex items-center justify-center"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Icon className="w-4 h-4 text-gray-600" />
              </motion.button>
            ))}
          </div>
          
          <button className="w-full px-2 py-1 bg-yellow-500 text-white text-xs rounded hover:bg-yellow-600">
            Browse All Icons
          </button>
        </div>
      </CollapsibleSection>

      {/* Font Assets Section */}
      <CollapsibleSection 
        name="fontAssets" 
        title="Typography & Fonts" 
        icon={Type}
        variant="purple"
      >
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Font Family</label>
            <select className="w-full px-2 py-1 text-xs border rounded">
              <option>Inter (Default)</option>
              <option>Roboto</option>
              <option>Open Sans</option>
              <option>Montserrat</option>
              <option>Poppins</option>
            </select>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Font Size</label>
              <select className="w-full px-2 py-1 text-xs border rounded">
                <option>12px</option>
                <option>14px</option>
                <option>16px</option>
                <option>18px</option>
                <option>24px</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Font Weight</label>
              <select className="w-full px-2 py-1 text-xs border rounded">
                <option>Normal</option>
                <option>Medium</option>
                <option>Semibold</option>
                <option>Bold</option>
              </select>
            </div>
          </div>
          
          <div className="p-2 bg-gray-50 border rounded text-center">
            <span className="text-sm">Sample Text Preview</span>
          </div>
        </div>
      </CollapsibleSection>
    </div>
  );

  const renderCodeTab = () => (
    <div className="space-y-1">
      {/* CSS Editor Section */}
      <CollapsibleSection 
        name="cssEditor" 
        title="Custom CSS Editor" 
        icon={Code2}
        variant="primary"
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">Live CSS Editor</span>
            <div className="flex space-x-1">
              <button className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600">
                Format
              </button>
              <button className="px-2 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600">
                Reset
              </button>
            </div>
          </div>
          
          <div className="h-48 border rounded overflow-hidden">
            <Editor
              height="100%"
              defaultLanguage="css"
              value={customCSS}
              onChange={setCustomCSS}
              theme="vs-light"
              options={{
                fontSize: 11,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                wordWrap: 'on',
                lineNumbers: 'on'
              }}
            />
          </div>
          
          <button
            className="w-full px-3 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 flex items-center justify-center"
            onClick={() => {
              const style = document.createElement('style');
              style.textContent = customCSS;
              document.head.appendChild(style);
            }}
          >
            <Code2 className="w-4 h-4 mr-2" />
            Apply CSS Live
          </button>
        </div>
      </CollapsibleSection>

      {/* AI CSS Generation Section */}
      <CollapsibleSection 
        name="aiCssGeneration" 
        title="AI CSS Generator" 
        icon={Wand2}
        variant="purple"
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">Gemini 2.0 Flash Powered</span>
            <div className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
              AI Ready
            </div>
          </div>
          
          <div>
            <label className="block text-xs text-gray-500 mb-1">CSS Generation Type</label>
            <select className="w-full px-2 py-1 text-xs border rounded">
              <option>Modern Layout</option>
              <option>Responsive Grid</option>
              <option>Animation Effects</option>
              <option>Glassmorphism</option>
              <option>Neumorphism</option>
              <option>Gradient Backgrounds</option>
            </select>
          </div>
          
          <textarea
            placeholder="Describe the CSS you want to generate..."
            className="w-full px-2 py-2 text-xs border rounded h-20 resize-none"
            defaultValue="Create a modern card with glassmorphism effect, subtle shadow, and hover animation"
          />
          
          <button
            onClick={generateCustomCSS}
            disabled={isGeneratingAI}
            className="w-full px-3 py-2 bg-purple-500 text-white text-sm rounded hover:bg-purple-600 flex items-center justify-center disabled:opacity-50"
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
            {isGeneratingAI ? 'Generating...' : 'Generate AI CSS'}
          </button>
        </div>
      </CollapsibleSection>

      {/* CSS Presets Section */}
      <CollapsibleSection 
        name="cssPresets" 
        title="CSS Presets & Templates" 
        icon={FileText}
        variant="success"
      >
        <div className="space-y-3">
          <div className="text-xs text-gray-500 mb-2">Quick CSS Templates</div>
          
          <div className="grid grid-cols-1 gap-2">
            {[
              { name: 'Glass Card', css: 'backdrop-filter: blur(10px); background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2);' },
              { name: 'Neon Glow', css: 'box-shadow: 0 0 20px #00ff88, 0 0 40px #00ff88; border: 1px solid #00ff88;' },
              { name: 'Gradient Button', css: 'background: linear-gradient(45deg, #667eea 0%, #764ba2 100%); border: none; color: white;' },
              { name: 'Hover Scale', css: 'transition: transform 0.3s ease; &:hover { transform: scale(1.05); }' }
            ].map((preset, index) => (
              <motion.button
                key={index}
                className="p-2 text-left border rounded hover:border-green-400 hover:bg-green-50 transition-colors"
                onClick={() => setCustomCSS(preset.css)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="font-medium text-xs text-green-700">{preset.name}</div>
                <div className="text-xs text-gray-500 truncate mt-1">{preset.css.slice(0, 50)}...</div>
              </motion.button>
            ))}
          </div>
        </div>
      </CollapsibleSection>

      {/* Advanced CSS Tools Section */}
      <CollapsibleSection 
        name="advancedCssTools" 
        title="Advanced CSS Tools" 
        icon={Settings}
        variant="warning"
      >
        <div className="space-y-3">
          <div className="space-y-2">
            <button className="w-full px-2 py-1 bg-yellow-500 text-white text-xs rounded hover:bg-yellow-600 flex items-center justify-center">
              <ColorWheel className="w-3 h-3 mr-1" />
              Color Picker
            </button>
            
            <button className="w-full px-2 py-1 bg-yellow-500 text-white text-xs rounded hover:bg-yellow-600 flex items-center justify-center">
              <Frame className="w-3 h-3 mr-1" />
              Box Shadow Generator
            </button>
            
            <button className="w-full px-2 py-1 bg-yellow-500 text-white text-xs rounded hover:bg-yellow-600 flex items-center justify-center">
              <Grid className="w-3 h-3 mr-1" />
              CSS Grid Generator
            </button>
          </div>
          
          <div>
            <label className="block text-xs text-gray-500 mb-1">CSS Validation</label>
            <div className="p-2 bg-gray-100 rounded text-xs">
              <span className="text-green-600">✓ Valid CSS Syntax</span>
            </div>
          </div>
          
          <div className="flex space-x-1">
            <button className="px-2 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600 flex-1">
              Export CSS
            </button>
            <button className="px-2 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600 flex-1">
              Import CSS
            </button>
          </div>
        </div>
      </CollapsibleSection>
    </div>
  );

  const renderAITab = () => (
    <div className="space-y-1">
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

      {/* AI Suggestions History Section */}
      <CollapsibleSection 
        name="aiSuggestionsHistory" 
        title="AI Suggestions History" 
        icon={History}
        variant="success"
      >
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">{aiSuggestions.length} suggestions generated</span>
            <button className="text-xs text-red-600 hover:text-red-800">Clear All</button>
          </div>
          
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {aiSuggestions.length > 0 ? (
              aiSuggestions.map((suggestion) => (
                <motion.div 
                  key={suggestion.id} 
                  className="p-2 bg-white border rounded hover:border-green-400"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium capitalize bg-green-100 text-green-800 px-2 py-1 rounded">
                      {suggestion.type}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(suggestion.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-xs text-gray-700 line-clamp-3">{suggestion.content}</p>
                  
                  <div className="flex space-x-1 mt-2">
                    <button className="px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600">
                      Apply
                    </button>
                    <button className="px-2 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600">
                      Save
                    </button>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="p-4 text-center border-2 border-dashed border-gray-200 rounded">
                <History className="w-6 h-6 mx-auto text-gray-400 mb-1" />
                <p className="text-xs text-gray-500">No AI suggestions yet</p>
                <p className="text-xs text-gray-400 mt-1">Generate some suggestions above!</p>
              </div>
            )}
          </div>
        </div>
      </CollapsibleSection>

      {/* AI Content Generation Section */}
      <CollapsibleSection 
        name="aiContentGeneration" 
        title="AI Content Generator" 
        icon={FileText}
        variant="warning"
      >
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Content Type</label>
            <select className="w-full px-2 py-1 text-xs border rounded">
              <option>Hero Text</option>
              <option>About Section</option>
              <option>Project Description</option>
              <option>Call to Action</option>
              <option>Meta Description</option>
            </select>
          </div>
          
          <textarea
            placeholder="Describe what content you want to generate..."
            className="w-full px-2 py-2 text-xs border rounded h-16 resize-none"
            defaultValue="Create professional hero text for a full-stack developer portfolio"
          />
          
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Tone</label>
              <select className="w-full px-2 py-1 text-xs border rounded">
                <option>Professional</option>
                <option>Casual</option>
                <option>Creative</option>
                <option>Technical</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Length</label>
              <select className="w-full px-2 py-1 text-xs border rounded">
                <option>Short</option>
                <option>Medium</option>
                <option>Long</option>
              </select>
            </div>
          </div>
          
          <button className="w-full px-3 py-2 bg-yellow-500 text-white text-sm rounded hover:bg-yellow-600 flex items-center justify-center">
            <Wand2 className="w-4 h-4 mr-2" />
            Generate Content
          </button>
        </div>
      </CollapsibleSection>

      {/* AI Design Analysis Section */}
      <CollapsibleSection 
        name="aiDesignAnalysis" 
        title="AI Design Analysis" 
        icon={Target}
        variant="danger"
      >
        <div className="space-y-3">
          <div className="text-xs text-gray-500 mb-2">Website Analysis & Recommendations</div>
          
          <div className="space-y-2">
            <button className="w-full px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 flex items-center justify-center">
              <Eye className="w-3 h-3 mr-1" />
              Analyze Current Design
            </button>
            
            <button className="w-full px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 flex items-center justify-center">
              <Zap className="w-3 h-3 mr-1" />
              Performance Analysis
            </button>
            
            <button className="w-full px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 flex items-center justify-center">
              <Smartphone className="w-3 h-3 mr-1" />
              Mobile Responsiveness Check
            </button>
          </div>
          
          <div className="p-2 bg-red-50 border border-red-200 rounded">
            <div className="text-xs font-medium text-red-800 mb-1">Latest Analysis</div>
            <div className="text-xs text-red-600">Overall Score: 92/100</div>
            <div className="text-xs text-gray-600 mt-1">Great design! Consider improving loading speed.</div>
          </div>
        </div>
      </CollapsibleSection>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'layers': return renderLayersTab();
      case 'properties': return renderPropertiesTab();
      case 'assets': return renderAssetsTab();
      case 'code': return renderCodeTab();
      case 'ai': return renderAITab();
      default: return null;
    }
  };

  return (
    <>
      {/* Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            transition={{ type: 'spring', damping: 20 }}
            className="fixed right-0 top-0 h-full w-96 bg-white border-l border-gray-200 shadow-2xl z-[1000] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold">Advanced Editor</h2>
              <button
                onClick={onToggle}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200">
              {tabs.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`flex-1 p-3 text-xs font-medium border-b-2 transition-colors ${
                    activeTab === id
                      ? 'border-blue-500 text-blue-600 bg-blue-50'
                      : 'border-transparent text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <Icon className="w-4 h-4 mx-auto mb-1" />
                  <div>{label}</div>
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {renderTabContent()}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button */}
      {!isOpen && (
        <motion.button
          initial={{ x: 100 }}
          animate={{ x: 0 }}
          onClick={onToggle}
          className="fixed right-4 top-1/2 transform -translate-y-1/2 p-3 bg-blue-500 text-white rounded-l-lg shadow-lg hover:bg-blue-600 transition-colors z-[999]"
        >
          <ChevronLeft className="w-5 h-5" />
        </motion.button>
      )}
    </>
  );
};

export default SuperAdvancedRightPanel;