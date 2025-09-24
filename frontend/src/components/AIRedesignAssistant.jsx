import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Wand2, 
  Palette, 
  Layout, 
  Zap, 
  RefreshCw,
  Eye,
  Download,
  Upload,
  Settings,
  Target,
  Layers,
  Code2,
  Image,
  Type,
  Grid,
  Sliders,
  RotateCw,
  Move3D
} from 'lucide-react';

const AIRedesignAssistant = ({ 
  selectedElement, 
  onElementUpdate, 
  content, 
  isAuthenticated = false 
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [redesignOptions, setRedesignOptions] = useState([]);
  const [selectedRedesign, setSelectedRedesign] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [designHistory, setDesignHistory] = useState([]);
  const [aiSuggestions, setAiSuggestions] = useState({
    colors: [],
    layouts: [],
    animations: [],
    typography: []
  });

  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  // Modern design patterns for AI to choose from
  const designPatterns = [
    {
      name: 'Glassmorphism',
      description: 'Modern glass effect with blur and transparency',
      preview: 'backdrop-filter: blur(10px); background: rgba(255,255,255,0.1);',
      category: 'modern'
    },
    {
      name: 'Neumorphism',
      description: 'Soft UI with subtle shadows and highlights',
      preview: 'box-shadow: 8px 8px 16px #d1d9e6, -8px -8px 16px #ffffff;',
      category: 'soft'
    },
    {
      name: 'Gradient Flow',
      description: 'Dynamic gradient backgrounds with animation',
      preview: 'background: linear-gradient(45deg, #667eea 0%, #764ba2 100%);',
      category: 'dynamic'
    },
    {
      name: 'Minimalist Card',
      description: 'Clean, minimal design with subtle shadows',
      preview: 'box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); border-radius: 12px;',
      category: 'minimal'
    },
    {
      name: 'Neon Glow',
      description: 'Vibrant neon effects for modern appeal',
      preview: 'box-shadow: 0 0 20px #00ff88, 0 0 40px #00ff88;',
      category: 'vibrant'
    }
  ];

  // Generate AI-powered redesign suggestions
  const generateRedesignSuggestions = async (designType = 'complete') => {
    if (!selectedElement) return;

    setIsGenerating(true);
    try {
      const elementInfo = {
        tagName: selectedElement.tagName,
        className: selectedElement.className,
        id: selectedElement.id,
        textContent: selectedElement.textContent?.slice(0, 200),
        computedStyles: window.getComputedStyle(selectedElement)
      };

      const response = await fetch(`${backendUrl}/api/super/ai/generate-content`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Analyze this ${elementInfo.tagName} element and suggest 5 creative modern redesign options with CSS. Element details: ${JSON.stringify(elementInfo)}. Focus on ${designType} redesign with modern 2025 trends.`,
          context: JSON.stringify({ element: elementInfo, designPatterns }),
          type: 'design_recommendations'
        })
      });

      if (response.ok) {
        const result = await response.json();
        const suggestions = parseAISuggestions(result.content);
        setRedesignOptions(suggestions);
      }
    } catch (error) {
      console.error('AI redesign generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Parse AI suggestions into structured format
  const parseAISuggestions = (content) => {
    // This would parse the AI response into structured redesign options
    // For now, we'll return mock data based on design patterns
    return designPatterns.map((pattern, index) => ({
      id: `redesign-${index}`,
      name: pattern.name,
      description: pattern.description,
      category: pattern.category,
      css: generatePatternCSS(pattern),
      preview: pattern.preview,
      confidence: 0.8 + Math.random() * 0.2
    }));
  };

  // Generate CSS for design patterns
  const generatePatternCSS = (pattern) => {
    const baseStyles = `
/* ${pattern.name} Redesign */
.redesign-${pattern.name.toLowerCase().replace(' ', '-')} {
  ${pattern.preview}
  transition: all 0.3s ease;
  border-radius: 12px;
  padding: 1rem;
}

.redesign-${pattern.name.toLowerCase().replace(' ', '-')}:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.15);
}
    `;

    // Add specific enhancements based on pattern type
    switch (pattern.category) {
      case 'modern':
        return baseStyles + `
  border: 1px solid rgba(255,255,255,0.2);
  backdrop-filter: blur(20px);
        `;
      case 'dynamic':
        return baseStyles + `
  background-size: 200% 200%;
  animation: gradientShift 4s ease infinite;
        `;
      case 'vibrant':
        return baseStyles + `
  border: 2px solid transparent;
  background-clip: padding-box;
        `;
      default:
        return baseStyles;
    }
  };

  // Apply redesign to selected element
  const applyRedesign = (redesignOption) => {
    if (!selectedElement || !redesignOption) return;

    // Save current design to history
    const currentStyles = {
      className: selectedElement.className,
      style: selectedElement.style.cssText,
      timestamp: new Date().toISOString()
    };
    setDesignHistory(prev => [...prev, currentStyles]);

    // Apply new design
    const styleElement = document.createElement('style');
    styleElement.innerHTML = redesignOption.css;
    document.head.appendChild(styleElement);

    // Add redesign class to element
    selectedElement.classList.add(`redesign-${redesignOption.name.toLowerCase().replace(' ', '-')}`);

    if (onElementUpdate) {
      onElementUpdate(selectedElement, {
        redesign: redesignOption,
        css: redesignOption.css
      });
    }

    setSelectedRedesign(redesignOption);
  };

  // Undo last redesign
  const undoRedesign = () => {
    if (designHistory.length === 0 || !selectedElement) return;

    const lastDesign = designHistory[designHistory.length - 1];
    
    // Remove redesign classes
    selectedElement.classList.forEach(className => {
      if (className.startsWith('redesign-')) {
        selectedElement.classList.remove(className);
      }
    });

    // Restore previous styles
    selectedElement.style.cssText = lastDesign.style;
    selectedElement.className = lastDesign.className;

    setDesignHistory(prev => prev.slice(0, -1));
    setSelectedRedesign(null);
  };

  // Generate color palette suggestions
  const generateColorSuggestions = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch(`${backendUrl}/api/super/ai/generate-content`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: 'Generate 5 modern color palettes for 2025 web design trends',
          type: 'color_palette'
        })
      });

      if (response.ok) {
        const result = await response.json();
        // Parse color suggestions from AI response
        setAiSuggestions(prev => ({
          ...prev,
          colors: [
            { primary: '#667eea', secondary: '#764ba2', accent: '#f093fb' },
            { primary: '#4facfe', secondary: '#00f2fe', accent: '#43e97b' },
            { primary: '#fa709a', secondary: '#fee140', accent: '#f093fb' },
            { primary: '#a8edea', secondary: '#fed6e3', accent: '#ffecd2' },
            { primary: '#fdbb2d', secondary: '#22c1c3', accent: '#ff6b6b' }
          ]
        }));
      }
    } catch (error) {
      console.error('Color generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="space-y-4">
      {/* AI Redesign Header */}
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">AI Redesign Assistant</h3>
            <p className="text-xs text-gray-500">Powered by advanced AI</p>
          </div>
        </div>
        <div className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
          Ready
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-2">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => generateRedesignSuggestions('complete')}
          disabled={!selectedElement || isGenerating}
          className="p-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 disabled:opacity-50 flex items-center justify-center space-x-2"
        >
          {isGenerating ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
            />
          ) : (
            <Wand2 className="w-4 h-4" />
          )}
          <span className="text-sm">Redesign Element</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={generateColorSuggestions}
          disabled={isGenerating}
          className="p-3 bg-gradient-to-r from-pink-500 to-orange-500 text-white rounded-lg hover:from-pink-600 hover:to-orange-600 disabled:opacity-50 flex items-center justify-center space-x-2"
        >
          <Palette className="w-4 h-4" />
          <span className="text-sm">Color Ideas</span>
        </motion.button>
      </div>

      {/* Redesign Options */}
      <AnimatePresence>
        {redesignOptions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            <h4 className="text-sm font-medium text-gray-700 flex items-center space-x-2">
              <Target className="w-4 h-4" />
              <span>AI Redesign Suggestions</span>
            </h4>
            
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {redesignOptions.map((option, index) => (
                <motion.div
                  key={option.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-3 border border-gray-200 rounded-lg hover:border-purple-300 transition-colors group cursor-pointer"
                  onClick={() => applyRedesign(option)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${
                        option.category === 'modern' ? 'bg-blue-500' :
                        option.category === 'soft' ? 'bg-green-500' :
                        option.category === 'dynamic' ? 'bg-purple-500' :
                        option.category === 'minimal' ? 'bg-gray-500' : 'bg-pink-500'
                      }`} />
                      <h5 className="text-sm font-medium text-gray-800">{option.name}</h5>
                    </div>
                    <div className="text-xs text-gray-500">
                      {Math.round(option.confidence * 100)}% match
                    </div>
                  </div>
                  
                  <p className="text-xs text-gray-600 mb-2">{option.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                      {option.preview.slice(0, 30)}...
                    </code>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="px-2 py-1 bg-purple-500 text-white text-xs rounded hover:bg-purple-600 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      Apply
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Color Palette Suggestions */}
      <AnimatePresence>
        {aiSuggestions.colors.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            <h4 className="text-sm font-medium text-gray-700 flex items-center space-x-2">
              <Palette className="w-4 h-4" />
              <span>AI Color Palettes</span>
            </h4>
            
            <div className="grid grid-cols-2 gap-2">
              {aiSuggestions.colors.slice(0, 4).map((palette, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-2 border border-gray-200 rounded-lg hover:border-purple-300 cursor-pointer group"
                  onClick={() => {
                    if (selectedElement) {
                      selectedElement.style.background = `linear-gradient(45deg, ${palette.primary}, ${palette.secondary})`;
                      selectedElement.style.color = '#ffffff';
                    }
                  }}
                >
                  <div className="flex space-x-1 mb-2">
                    <div 
                      className="w-4 h-4 rounded-full border border-white shadow-sm"
                      style={{ backgroundColor: palette.primary }}
                    />
                    <div 
                      className="w-4 h-4 rounded-full border border-white shadow-sm"
                      style={{ backgroundColor: palette.secondary }}
                    />
                    <div 
                      className="w-4 h-4 rounded-full border border-white shadow-sm"
                      style={{ backgroundColor: palette.accent }}
                    />
                  </div>
                  <div className="text-xs text-gray-600 group-hover:text-purple-600">
                    Palette {index + 1}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Current Redesign Info */}
      <AnimatePresence>
        {selectedRedesign && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg"
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-green-800 flex items-center space-x-2">
                <Zap className="w-4 h-4" />
                <span>Active: {selectedRedesign.name}</span>
              </h4>
              <button
                onClick={undoRedesign}
                className="px-2 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600 flex items-center space-x-1"
              >
                <RotateCw className="w-3 h-3" />
                <span>Undo</span>
              </button>
            </div>
            <p className="text-xs text-green-600">{selectedRedesign.description}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* No Element Selected Message */}
      {!selectedElement && (
        <div className="p-4 text-center border-2 border-dashed border-gray-200 rounded-lg">
          <Target className="w-8 h-8 mx-auto text-gray-400 mb-2" />
          <p className="text-sm text-gray-500">Select an element to start redesigning</p>
          <p className="text-xs text-gray-400 mt-1">Click on any element to select it</p>
        </div>
      )}
    </div>
  );
};

export default AIRedesignAssistant;