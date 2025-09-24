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
  
  const backendUrl = process.env.REACT_APP_BACKEND_URL;
  const fileInputRef = useRef(null);
  const videoInputRef = useRef(null);

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
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Page Elements</h3>
        <div className="flex space-x-1">
          <button className="p-1 hover:bg-gray-100 rounded">
            <Eye className="w-4 h-4" />
          </button>
          <button className="p-1 hover:bg-gray-100 rounded">
            <Grid className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {/* Layer items would be dynamically generated here */}
        <div className="p-2 bg-blue-50 border border-blue-200 rounded text-sm">
          <div className="flex items-center justify-between">
            <span className="flex items-center">
              <Layout className="w-4 h-4 mr-2" />
              Hero Section
            </span>
            <Eye className="w-4 h-4 text-blue-600" />
          </div>
        </div>
        
        <div className="p-2 hover:bg-gray-50 border rounded text-sm">
          <div className="flex items-center justify-between">
            <span className="flex items-center">
              <Layout className="w-4 h-4 mr-2" />
              About Section
            </span>
            <Eye className="w-4 h-4" />
          </div>
        </div>
      </div>
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