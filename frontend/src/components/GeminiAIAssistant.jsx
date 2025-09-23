import React, { useState } from 'react';
import { Sparkles, Wand2, Palette, Type, Layout, Image as ImageIcon, Zap } from 'lucide-react';

const GeminiAIAssistant = ({ content, setContent, onApplyChanges }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastCommand, setLastCommand] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  const GEMINI_API_KEY = 'AIzaSyDt0rQzPkFtAdMJcd7nLNEYTXfJjmgSVfc';
  const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`;

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
      const prompt = `
You are a UI/UX expert helping to modify a portfolio website. The user wants: "${command}"

Based on this request, provide specific CSS and content changes in JSON format. Consider:
1. Color schemes and themes
2. Typography improvements
3. Layout and spacing
4. Animation and interaction enhancements
5. Content structure changes

Current content structure includes: hero, about, freelance, projects, skills, experience, hackathons, certs, contact sections.

Respond with a JSON object containing:
{
  "changes": {
    "theme": { "primary": "#color", "secondary": "#color", "accent": "#color" },
    "typography": { "fontFamily": "font name", "fontSize": "adjustments", "lineHeight": "value" },
    "layout": { "spacing": "adjustments", "borderRadius": "value", "shadows": "enhancements" },
    "animations": { "duration": "ms", "easing": "function", "effects": ["list of effects"] },
    "content": { "section": "modifications" }
  },
  "explanation": "Brief explanation of changes made",
  "cssUpdates": {
    "--variable-name": "new-value"
  }
}

Make changes that align with modern design trends and the user's specific request.
`;

      const response = await fetch(GEMINI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }]
        })
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data = await response.json();
      const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (aiResponse) {
        try {
          // Extract JSON from the response
          const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const aiChanges = JSON.parse(jsonMatch[0]);
            await applyAIChanges(aiChanges, command);
          } else {
            // Fallback: Apply predefined changes based on command keywords
            await applyPresetChanges(command);
          }
        } catch (parseError) {
          console.error('Failed to parse AI response:', parseError);
          await applyPresetChanges(command);
        }
      }

    } catch (error) {
      console.error('AI processing failed:', error);
      // Fallback to preset changes
      await applyPresetChanges(command);
    } finally {
      setIsProcessing(false);
    }
  };

  const applyAIChanges = async (changes, command) => {
    try {
      // Apply CSS variable updates
      if (changes.cssUpdates) {
        const root = document.documentElement;
        Object.entries(changes.cssUpdates).forEach(([variable, value]) => {
          root.style.setProperty(variable, value);
        });
      }

      // Apply theme changes
      if (changes.changes?.theme) {
        const root = document.documentElement;
        const theme = changes.changes.theme;
        
        if (theme.primary) root.style.setProperty('--acc-1', theme.primary);
        if (theme.secondary) root.style.setProperty('--acc-2', theme.secondary);
        if (theme.accent) root.style.setProperty('--acc-3', theme.accent);
      }

      // Apply typography changes
      if (changes.changes?.typography) {
        const root = document.documentElement;
        const typography = changes.changes.typography;
        
        if (typography.fontFamily) {
          root.style.setProperty('--font-display', typography.fontFamily);
        }
      }

      // Apply layout changes
      if (changes.changes?.layout) {
        const root = document.documentElement;
        const layout = changes.changes.layout;
        
        if (layout.borderRadius) {
          root.style.setProperty('--border-radius', layout.borderRadius);
        }
        if (layout.spacing) {
          root.style.setProperty('--card-spacing', layout.spacing);
        }
      }

      // Apply animation changes
      if (changes.changes?.animations) {
        const root = document.documentElement;
        const animations = changes.changes.animations;
        
        if (animations.duration) {
          root.style.setProperty('--transition-duration', animations.duration);
        }
        if (animations.easing) {
          root.style.setProperty('--transition-smooth', animations.easing);
        }
      }

      // Save changes to localStorage
      const currentTheme = {
        primary: getComputedStyle(document.documentElement).getPropertyValue('--acc-1').trim(),
        secondary: getComputedStyle(document.documentElement).getPropertyValue('--acc-2').trim(),
        accent: getComputedStyle(document.documentElement).getPropertyValue('--acc-3').trim(),
        ...changes.changes
      };
      
      localStorage.setItem('ai-applied-theme', JSON.stringify({
        theme: currentTheme,
        command: command,
        timestamp: new Date().toISOString(),
        explanation: changes.explanation
      }));

      // Notify parent component
      if (onApplyChanges) {
        onApplyChanges({
          type: 'ai-changes',
          changes: changes,
          command: command
        });
      }

    } catch (error) {
      console.error('Failed to apply AI changes:', error);
    }
  };

  const applyPresetChanges = async (command) => {
    const commandLower = command.toLowerCase();
    const root = document.documentElement;

    // Preset change patterns based on command keywords
    if (commandLower.includes('dark') || commandLower.includes('purple')) {
      root.style.setProperty('--acc-1', '#9333ea');
      root.style.setProperty('--acc-2', '#7c3aed');
      root.style.setProperty('--bg', '#0a0a0f');
      root.style.setProperty('--panel', '#1a1a2e');
    } else if (commandLower.includes('modern') || commandLower.includes('gradient')) {
      root.style.setProperty('--acc-1', '#06b6d4');
      root.style.setProperty('--acc-2', '#0891b2');
      root.style.setProperty('--bg', 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)');
    } else if (commandLower.includes('spacing') || commandLower.includes('layout')) {
      root.style.setProperty('--card-spacing', '3rem');
      root.style.setProperty('--border-radius', '16px');
    } else if (commandLower.includes('animation') || commandLower.includes('smooth')) {
      root.style.setProperty('--transition-duration', '300ms');
      
      // Add animation classes to elements
      document.querySelectorAll('.glass-card').forEach(card => {
        card.style.transition = 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)';
      });
    }

    // Save preset changes
    localStorage.setItem('ai-applied-theme', JSON.stringify({
      preset: commandLower,
      command: command,
      timestamp: new Date().toISOString()
    }));
  };

  const handleQuickSuggestion = (suggestion) => {
    processAICommand(suggestion.command);
  };

  return (
    <div className="space-y-4">
      {/* AI Status */}
      {isProcessing && (
        <div className="p-4 bg-purple-900/20 border border-purple-600/30 rounded-lg">
          <div className="flex items-center text-purple-400">
            <div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin mr-3"></div>
            <span className="text-sm">AI is analyzing and applying changes...</span>
          </div>
          {lastCommand && (
            <p className="text-xs text-purple-300 mt-2">Command: "{lastCommand}"</p>
          )}
        </div>
      )}

      {/* Quick Suggestions */}
      <div>
        <h4 className="text-sm font-semibold text-white mb-3 flex items-center">
          <Wand2 className="w-4 h-4 mr-2 text-purple-400" />
          Quick AI Suggestions
        </h4>
        
        <div className="grid grid-cols-2 gap-2">
          {quickSuggestions.map((suggestion, index) => {
            const Icon = suggestion.icon;
            return (
              <button
                key={index}
                onClick={() => handleQuickSuggestion(suggestion)}
                disabled={isProcessing}
                className="p-3 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700 rounded-lg text-left transition-colors disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                <div className="flex items-center mb-2">
                  <Icon className="w-4 h-4 text-purple-400 mr-2 group-hover:text-purple-300" />
                  <span className="text-xs font-medium text-white group-hover:text-purple-100">
                    {suggestion.label}
                  </span>
                </div>
                <p className="text-xs text-gray-400 line-clamp-2">
                  {suggestion.command}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom AI Command */}
      <div className="p-4 bg-gray-800/30 rounded-lg border border-gray-700">
        <h4 className="text-sm font-semibold text-white mb-3 flex items-center">
          <Sparkles className="w-4 h-4 mr-2 text-purple-400" />
          Custom AI Command
        </h4>
        
        <div className="space-y-2">
          <textarea
            placeholder="Describe what you want to change... (e.g., 'Make the hero section more vibrant with orange accents and larger typography')"
            rows="3"
            className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white text-sm placeholder-gray-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 resize-none"
            onKeyPress={(e) => {
              if (e.key === 'Enter' && e.ctrlKey) {
                processAICommand(e.target.value);
                e.target.value = '';
              }
            }}
            onChange={(e) => setLastCommand(e.target.value)}
            disabled={isProcessing}
          />
          
          <button
            onClick={() => {
              const textarea = document.querySelector('textarea');
              if (textarea.value.trim()) {
                processAICommand(textarea.value);
                textarea.value = '';
              }
            }}
            disabled={isProcessing}
            className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center"
          >
            {isProcessing ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
            ) : (
              <Sparkles className="w-4 h-4 mr-2" />
            )}
            Apply AI Changes
          </button>
          
          <p className="text-xs text-gray-400">
            Ctrl + Enter to apply quickly • AI will modify colors, layout, typography, and more
          </p>
        </div>
      </div>

      {/* Applied Changes History */}
      <div className="p-3 bg-gray-800/20 rounded-lg border border-gray-700">
        <h5 className="text-xs font-semibold text-gray-300 mb-2">Last AI Action</h5>
        {lastCommand ? (
          <p className="text-xs text-gray-400 italic">"{lastCommand}"</p>
        ) : (
          <p className="text-xs text-gray-500">No AI commands applied yet</p>
        )}
      </div>
    </div>
  );
};

export default GeminiAIAssistant;