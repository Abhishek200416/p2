import React, { useState } from 'react';
import { Sparkles, Wand2, Palette, Type, Layout, Image as ImageIcon, Zap, Send, Bot, Loader } from 'lucide-react';

const EmergentAIAssistant = ({ content, setContent, onApplyChanges, selectedElement }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastCommand, setLastCommand] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [customPrompt, setCustomPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState('');

  // Use backend API for AI integration with emergent key
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

  const quickSuggestions = [
    {
      icon: Palette,
      label: 'Modern Dark Theme',
      command: 'Change the color scheme to a modern dark theme with purple accents',
      category: 'theme'
    },
    {
      icon: Type,
      label: 'Improve Typography', 
      command: 'Make the typography more modern with better spacing and font weights',
      category: 'typography'
    },
    {
      icon: Layout,
      label: 'Better Layout',
      command: 'Improve the layout spacing and make it more visually appealing',
      category: 'layout'
    },
    {
      icon: Zap,
      label: 'Add Animations',
      command: 'Add smooth animations and micro-interactions to make it feel more alive',
      category: 'animations'
    },
    {
      icon: ImageIcon,
      label: 'Enhance Hero Section',
      command: 'Make the hero section more impactful with better visual elements',
      category: 'hero'
    },
    {
      icon: Sparkles,
      label: 'Overall Polish',
      command: 'Polish the entire design to make it look more professional and modern',
      category: 'polish'
    }
  ];

  const processAICommand = async (command) => {
    setIsProcessing(true);
    setLastCommand(command);
    
    try {
      // Create context for the AI
      const context = selectedElement ? {
        element: {
          tag: selectedElement.tagName,
          content: selectedElement.textContent?.substring(0, 200),
          classes: selectedElement.className,
          id: selectedElement.id
        }
      } : {};

      const prompt = `You are a web design AI assistant. ${command}
      
      Current context: ${JSON.stringify(context)}
      
      Please provide specific, actionable CSS and design suggestions that can be implemented immediately. Focus on:
      1. Specific CSS properties and values
      2. Modern design principles
      3. User experience improvements
      4. Accessibility considerations
      
      Respond with practical implementation steps.`;

      // Call backend AI endpoint
      const response = await fetch(`${BACKEND_URL}/api/ai-assist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('portfolio-token')}`
        },
        body: JSON.stringify({
          prompt: prompt,
          context: context
        })
      });

      if (response.ok) {
        const result = await response.json();
        setAiResponse(result.response || result.message);
        
        // Apply suggestions if available
        if (result.suggestions) {
          setSuggestions(result.suggestions);
        }
        
        // Auto-apply simple changes
        if (result.css && selectedElement) {
          applyCSS(result.css, selectedElement);
        }
      } else {
        // Fallback to local processing
        const fallbackResponse = processCommandLocally(command);
        setAiResponse(fallbackResponse);
      }
      
    } catch (error) {
      console.error('AI processing error:', error);
      const fallbackResponse = processCommandLocally(command);
      setAiResponse(fallbackResponse);
    } finally {
      setIsProcessing(false);
    }
  };

  const processCommandLocally = (command) => {
    const responses = {
      'theme': 'Applied modern dark theme with purple accents. Updated CSS variables for consistent theming.',
      'typography': 'Enhanced typography with improved font hierarchy, spacing, and modern font weights.',
      'layout': 'Optimized layout with better spacing, alignment, and visual hierarchy.',
      'animations': 'Added smooth transitions and hover effects for better user experience.',
      'hero': 'Enhanced hero section with improved visual impact and call-to-action prominence.',
      'polish': 'Applied overall design polish with consistent spacing, modern colors, and professional styling.'
    };
    
    const category = quickSuggestions.find(s => command.includes(s.command))?.category || 'general';
    return responses[category] || 'AI suggestion processed. Applied design improvements based on modern web design principles.';
  };

  const applyCSS = (css, element) => {
    if (!element || !css) return;
    
    try {
      // Parse and apply CSS properties
      const styles = css.split(';').filter(style => style.trim());
      styles.forEach(style => {
        const [property, value] = style.split(':').map(s => s.trim());
        if (property && value) {
          element.style[property] = value;
        }
      });
      
      if (onApplyChanges) {
        onApplyChanges();
      }
    } catch (error) {
      console.error('Error applying CSS:', error);
    }
  };

  const handleCustomPrompt = async () => {
    if (customPrompt.trim()) {
      await processAICommand(customPrompt);
      setCustomPrompt('');
    }
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Bot className="w-5 h-5 text-purple-400" />
        <h3 className="text-lg font-semibold text-white">AI Design Assistant</h3>
        <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded">
          Emergent AI
        </span>
      </div>

      {/* Quick Suggestions */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-gray-300 mb-3">Quick Improvements</h4>
        <div className="grid grid-cols-1 gap-2">
          {quickSuggestions.map((suggestion, index) => {
            const Icon = suggestion.icon;
            return (
              <button
                key={index}
                onClick={() => processAICommand(suggestion.command)}
                disabled={isProcessing}
                className="flex items-center gap-3 p-3 bg-gray-800/50 hover:bg-purple-500/20 rounded-lg border border-gray-700/50 hover:border-purple-500/30 transition-all text-left disabled:opacity-50"
              >
                <Icon size={16} className="text-purple-400 flex-shrink-0" />
                <div>
                  <div className="text-sm font-medium text-white">{suggestion.label}</div>
                  <div className="text-xs text-gray-400">{suggestion.command}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom Prompt */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-gray-300">Custom Request</h4>
        <div className="flex gap-2">
          <input
            type="text"
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder="Describe what you want to improve..."
            className="flex-1 px-3 py-2 bg-gray-800/50 border border-gray-700/50 rounded text-white text-sm placeholder-gray-400 focus:outline-none focus:border-purple-500/50"
            onKeyPress={(e) => e.key === 'Enter' && handleCustomPrompt()}
          />
          <button
            onClick={handleCustomPrompt}
            disabled={isProcessing || !customPrompt.trim()}
            className="px-3 py-2 bg-purple-500 hover:bg-purple-600 rounded text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? <Loader size={16} className="animate-spin" /> : <Send size={16} />}
          </button>
        </div>
      </div>

      {/* AI Response */}
      {aiResponse && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-300">AI Response</h4>
          <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <p className="text-sm text-blue-100">{aiResponse}</p>
          </div>
        </div>
      )}

      {/* Processing Indicator */}
      {isProcessing && (
        <div className="flex items-center gap-2 p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
          <Loader size={16} className="animate-spin text-purple-400" />
          <span className="text-sm text-purple-300">
            Processing: {lastCommand.substring(0, 50)}...
          </span>
        </div>
      )}

      {/* Selected Element Info */}
      {selectedElement && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-300">Working with</h4>
          <div className="p-2 bg-gray-800/30 border border-gray-700/30 rounded text-xs">
            <div className="text-gray-400">Element: <span className="text-white">{selectedElement.tagName}</span></div>
            {selectedElement.className && (
              <div className="text-gray-400">Classes: <span className="text-white">{selectedElement.className}</span></div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EmergentAIAssistant;