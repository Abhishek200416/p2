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
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium mb-2">Element Properties</h3>
        {selectedElement ? (
          <div className="space-y-3">
            {/* Dimensions */}
            <div>
              <label className="block text-xs text-gray-500 mb-1">Dimensions</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Width"
                  value={dimensions.width}
                  onChange={(e) => updateDimensions({ ...dimensions, width: parseInt(e.target.value) })}
                  className="w-full px-2 py-1 text-xs border rounded"
                />
                <input
                  type="number"
                  placeholder="Height"
                  value={dimensions.height}
                  onChange={(e) => updateDimensions({ ...dimensions, height: parseInt(e.target.value) })}
                  className="w-full px-2 py-1 text-xs border rounded"
                />
              </div>
            </div>

            {/* Position */}
            <div>
              <label className="block text-xs text-gray-500 mb-1">Position</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="X"
                  value={dimensions.x}
                  onChange={(e) => updateDimensions({ ...dimensions, x: parseInt(e.target.value) })}
                  className="w-full px-2 py-1 text-xs border rounded"
                />
                <input
                  type="number"
                  placeholder="Y"
                  value={dimensions.y}
                  onChange={(e) => updateDimensions({ ...dimensions, y: parseInt(e.target.value) })}
                  className="w-full px-2 py-1 text-xs border rounded"
                />
              </div>
            </div>

            {/* Rotation */}
            <div>
              <label className="block text-xs text-gray-500 mb-1">Rotation</label>
              <input
                type="range"
                min="-180"
                max="180"
                value={dimensions.rotation}
                onChange={(e) => updateDimensions({ ...dimensions, rotation: parseInt(e.target.value) })}
                className="w-full"
              />
              <div className="text-xs text-center text-gray-500">{dimensions.rotation}°</div>
            </div>

            {/* Viewport Preview */}
            <div>
              <label className="block text-xs text-gray-500 mb-1">Viewport</label>
              <div className="flex space-x-1">
                {[
                  { id: 'desktop', icon: Monitor },
                  { id: 'tablet', icon: Tablet },
                  { id: 'mobile', icon: Smartphone }
                ].map(({ id, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setViewport(id)}
                    className={`p-2 rounded border ${
                      viewport === id 
                        ? 'bg-blue-500 text-white border-blue-500' 
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <p className="text-xs text-gray-500">Select an element to view properties</p>
        )}
      </div>
    </div>
  );

  const renderAssetsTab = () => (
    <div className="space-y-4">
      {/* Video Assets */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium">Videos</h3>
          <button
            onClick={() => videoInputRef.current?.click()}
            className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 flex items-center"
          >
            <Upload className="w-3 h-3 mr-1" />
            Upload
          </button>
        </div>
        
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {uploadedVideos.map((video) => (
            <div key={video.id} className="flex items-center justify-between p-2 border rounded">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate">{video.filename}</p>
                <p className="text-xs text-gray-500">{Math.round(video.size / 1024)} KB</p>
              </div>
              <div className="flex space-x-1">
                <button
                  onClick={() => deleteVideo(video.id)}
                  className="p-1 text-red-600 hover:bg-red-50 rounded"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
        
        <input
          ref={videoInputRef}
          type="file"
          accept="video/*"
          onChange={handleVideoUpload}
          className="hidden"
        />
      </div>

      {/* Image Assets */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium">Images</h3>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 flex items-center"
          >
            <Upload className="w-3 h-3 mr-1" />
            Upload
          </button>
        </div>
        
        <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
          {uploadedImages.map((image) => (
            <div key={image.id} className="relative group">
              <img
                src={`${backendUrl}${image.url}`}
                alt={image.filename}
                className="w-full h-16 object-cover rounded border"
              />
              <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center">
                <button className="p-1 text-white hover:text-red-300">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
      </div>
    </div>
  );

  const renderCodeTab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Custom CSS</h3>
        <button
          onClick={generateCustomCSS}
          disabled={isGeneratingAI}
          className="px-2 py-1 bg-purple-500 text-white text-xs rounded hover:bg-purple-600 flex items-center disabled:opacity-50"
        >
          <Sparkles className="w-3 h-3 mr-1" />
          AI Generate
        </button>
      </div>
      
      <div className="h-64 border rounded overflow-hidden">
        <Editor
          height="100%"
          defaultLanguage="css"
          value={customCSS}
          onChange={setCustomCSS}
          theme="vs-light"
          options={{
            fontSize: 12,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            wordWrap: 'on'
          }}
        />
      </div>
      
      <button
        className="w-full px-3 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
        onClick={() => {
          // Apply custom CSS
          const style = document.createElement('style');
          style.textContent = customCSS;
          document.head.appendChild(style);
        }}
      >
        Apply CSS
      </button>
    </div>
  );

  const renderAITab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">AI Assistant</h3>
        <div className="text-xs text-gray-500">Gemini 2.0 Flash</div>
      </div>
      
      <div className="space-y-2">
        <button
          onClick={() => generateAISuggestions('layout')}
          disabled={isGeneratingAI}
          className="w-full px-3 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 disabled:opacity-50 flex items-center justify-center"
        >
          <Layout className="w-4 h-4 mr-2" />
          Suggest Layout Improvements
        </button>
        
        <button
          onClick={() => generateAISuggestions('content')}
          disabled={isGeneratingAI}
          className="w-full px-3 py-2 bg-green-500 text-white text-sm rounded hover:bg-green-600 disabled:opacity-50 flex items-center justify-center"
        >
          <Edit3 className="w-4 h-4 mr-2" />
          Improve Content
        </button>
        
        <button
          onClick={() => generateAISuggestions('design')}
          disabled={isGeneratingAI}
          className="w-full px-3 py-2 bg-purple-500 text-white text-sm rounded hover:bg-purple-600 disabled:opacity-50 flex items-center justify-center"
        >
          <Palette className="w-4 h-4 mr-2" />
          Enhance Design
        </button>
      </div>
      
      {/* AI Suggestions Display */}
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {aiSuggestions.map((suggestion) => (
          <div key={suggestion.id} className="p-3 bg-gray-50 rounded border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium capitalize">{suggestion.type}</span>
              <span className="text-xs text-gray-500">
                {new Date(suggestion.timestamp).toLocaleTimeString()}
              </span>
            </div>
            <p className="text-xs text-gray-700">{suggestion.content}</p>
          </div>
        ))}
      </div>
      
      {isGeneratingAI && (
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-sm text-gray-600">Generating AI suggestions...</span>
        </div>
      )}
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