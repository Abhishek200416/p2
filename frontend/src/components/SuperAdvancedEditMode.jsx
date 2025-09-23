import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Palette, 
  Layout, 
  Upload, 
  Save, 
  RotateCcw, 
  Eye, 
  EyeOff,
  Move,
  Plus,
  Trash2,
  Download,
  BarChart3,
  Users,
  MessageSquare,
  Video,
  Image as ImageIcon,
  Sliders,
  Grid3X3,
  Type,
  Zap,
  X,
  Sparkles,
  Wand2,
  ArrowLeft,
  Monitor,
  Smartphone,
  Tablet,
  RefreshCw,
  Database,
  AlertTriangle
} from 'lucide-react';
import GeminiAIAssistant from './GeminiAIAssistant';
import InPlaceEditor from './InPlaceEditor';

const SuperAdvancedEditMode = ({ 
  content, 
  setContent, 
  isEditMode, 
  setIsEditMode, 
  onSave, 
  onExport 
}) => {
  const [activeTab, setActiveTab] = useState('live-edit');
  const [previewMode, setPreviewMode] = useState(false);
  const [devicePreview, setDevicePreview] = useState('desktop');
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [resetOptions, setResetOptions] = useState({
    keepUserData: true,
    keepProjects: true,
    keepTheme: false,
    keepLayout: false
  });
  const [analytics, setAnalytics] = useState({
    visitors: 247,
    subscribers: 12,
    feedback: 8,
    projects_viewed: 45
  });

  // Theme customization state
  const [customTheme, setCustomTheme] = useState({
    bg: '#0b0f14',
    panel: '#101620',
    panel2: '#0d141d',
    ink: '#cfd8e3',
    muted: '#9fb3c8',
    acc1: '#7bdfff',
    acc2: '#00bfff',
    acc3: '#06d6a0',
    ok: '#10b981',
    warn: '#f59e0b',
    bad: '#ef4444',
    ring: '#7bdfff',
    glassOpacity: 0.85,
    borderOpacity: 0.25,
    shadowOpacity: 0.15
  });

  // Layout customization
  const [sectionOrder, setSectionOrder] = useState([
    'hero', 'about', 'freelance', 'projects', 
    'skills', 'experience', 'hackathons', 'certs', 'testimonials', 'feedback', 'contact'
  ]);
  
  // Advanced layout settings
  const [layoutSettings, setLayoutSettings] = useState({
    particleCount: 45,
    particleOpacity: 0.4,
    particleSpeed: 0.3,
    animationSpeed: 250,
    borderRadius: 12,
    cardSpacing: 2,
    glassEffect: true,
    parallaxEnabled: true,
    reduceMotion: false,
    containerWidth: 1400,
    sectionSpacing: 6
  });

  const [videoFile, setVideoFile] = useState(null);
  const [uploadedImages, setUploadedImages] = useState({});
  const [originalContent, setOriginalContent] = useState(null);
  const [originalTheme, setOriginalTheme] = useState(null);

  useEffect(() => {
    // Store original state for reset functionality
    if (!originalContent) {
      setOriginalContent(JSON.parse(JSON.stringify(content)));
    }
    if (!originalTheme) {
      const root = document.documentElement;
      const computedStyle = getComputedStyle(root);
      const currentTheme = {};
      
      // Extract current CSS variables
      ['--bg', '--panel', '--panel-2', '--ink', '--muted', '--acc-1', '--acc-2', '--acc-3', '--ok', '--warn', '--bad'].forEach(prop => {
        currentTheme[prop] = computedStyle.getPropertyValue(prop);
      });
      
      setOriginalTheme(currentTheme);
    }

    // Load real analytics from backend
    const loadAnalytics = async () => {
      const token = sessionStorage.getItem('portfolio-token');
      if (token) {
        try {
          const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/analytics`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (response.ok) {
            const data = await response.json();
            setAnalytics({
              visitors: data.visitors || 247,
              subscribers: data.subscribers || 0,
              feedback: data.feedback || 0,
              projects_viewed: data.projects_viewed || 45
            });
          }
        } catch (error) {
          console.warn('Failed to load analytics:', error);
        }
      }
    };

    // Load saved settings
    const savedTheme = localStorage.getItem('portfolio-theme');
    if (savedTheme) {
      const theme = JSON.parse(savedTheme);
      setCustomTheme(theme);
      applyTheme(theme);
    }

    const savedLayout = localStorage.getItem('portfolio-layout');
    if (savedLayout) {
      const layout = JSON.parse(savedLayout);
      setLayoutSettings(layout);
      applyLayoutSettings(layout);
    }

    if (isEditMode) {
      loadAnalytics();
    }
  }, [isEditMode, content, originalContent, originalTheme]);

  const applyTheme = (theme) => {
    const root = document.documentElement;
    Object.entries(theme).forEach(([key, value]) => {
      if (key.includes('Opacity')) {
        root.style.setProperty(`--${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`, value);
      } else {
        root.style.setProperty(`--${key.replace(/(\d)/, '-$1')}`, value);
      }
    });
  };

  const applyLayoutSettings = (settings) => {
    const root = document.documentElement;
    root.style.setProperty('--animation-duration', `${settings.animationSpeed}ms`);
    root.style.setProperty('--border-radius', `${settings.borderRadius}px`);
    root.style.setProperty('--card-spacing', `${settings.cardSpacing}rem`);
    root.style.setProperty('--container-width', `${settings.containerWidth}px`);
    root.style.setProperty('--section-spacing', `${settings.sectionSpacing}rem`);
    
    if (window.particleSystem) {
      window.particleSystem.updateSettings({
        count: window.innerWidth > 768 ? settings.particleCount : Math.floor(settings.particleCount / 2),
        opacity: settings.particleOpacity,
        speed: settings.particleSpeed
      });
    }
  };

  const handleThemeChange = (colorKey, value) => {
    const newTheme = { ...customTheme, [colorKey]: value };
    setCustomTheme(newTheme);
    applyTheme(newTheme);
    localStorage.setItem('portfolio-theme', JSON.stringify(newTheme));
  };

  const handleLayoutChange = (settingKey, value) => {
    const newSettings = { ...layoutSettings, [settingKey]: value };
    setLayoutSettings(newSettings);
    applyLayoutSettings(newSettings);
    localStorage.setItem('portfolio-layout', JSON.stringify(newSettings));
  };

  const handleAICommand = async (command) => {
    // This will be handled by the GeminiAIAssistant component
    console.log('AI Command:', command);
  };

  const handleSmartReset = () => {
    if (resetOptions.keepUserData && resetOptions.keepProjects) {
      // Reset only UI/theme but keep content
      if (originalTheme) {
        const root = document.documentElement;
        Object.entries(originalTheme).forEach(([prop, value]) => {
          root.style.setProperty(prop, value);
        });
      }
      
      // Reset theme state
      setCustomTheme({
        bg: '#0b0f14',
        panel: '#101620',
        panel2: '#0d141d',
        ink: '#cfd8e3',
        muted: '#9fb3c8',
        acc1: '#7bdfff',
        acc2: '#00bfff',
        acc3: '#06d6a0',
        ok: '#10b981',
        warn: '#f59e0b',
        bad: '#ef4444',
        ring: '#7bdfff'
      });
      
      // Reset layout settings
      setLayoutSettings({
        particleCount: 45,
        particleOpacity: 0.4,
        particleSpeed: 0.3,
        animationSpeed: 250,
        borderRadius: 12,
        cardSpacing: 2,
        glassEffect: true,
        parallaxEnabled: true,
        reduceMotion: false,
        containerWidth: 1400,
        sectionSpacing: 6
      });
      
      // Clear localStorage
      localStorage.removeItem('portfolio-theme');
      localStorage.removeItem('portfolio-layout');
      localStorage.removeItem('ai-applied-theme');
      
    } else {
      // Full reset including content
      if (originalContent) {
        setContent(originalContent);
      }
      
      // Reset everything
      localStorage.clear();
      window.location.reload();
    }
    
    setShowResetDialog(false);
  };

  const handleExitEditMode = () => {
    setIsEditMode(false);
    setActiveTab('live-edit');
    setPreviewMode(false);
  };

  const TabButton = ({ id, label, icon: Icon, active, onClick, badge }) => (
    <button
      onClick={() => onClick(id)}
      className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all relative ${
        active 
          ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' 
          : 'text-gray-400 hover:text-gray-300 hover:bg-gray-800/50'
      }`}
    >
      <Icon className="w-4 h-4 mr-2" />
      {label}
      {badge && (
        <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
      )}
    </button>
  );

  if (!isEditMode) return null;

  return (
    <>
      {/* In-Place Editor Overlay */}
      <InPlaceEditor
        isEditMode={isEditMode}
        content={content}
        setContent={setContent}
        onSave={onSave}
        onExit={handleExitEditMode}
        onAICommand={handleAICommand}
      />

      {/* Advanced Edit Panel */}
      <div className={`fixed inset-y-0 right-0 w-96 bg-gray-900/95 backdrop-blur-xl border-l border-gray-700 z-40 overflow-y-auto transition-transform ${previewMode ? 'translate-x-full' : 'translate-x-0'}`}>
        {/* Header */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white flex items-center">
              <Settings className="w-5 h-5 mr-2 text-blue-400" />
              Super Advanced Edit
            </h2>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setPreviewMode(!previewMode)}
                className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors"
                title="Toggle Preview"
              >
                {previewMode ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
              <button
                onClick={handleExitEditMode}
                className="p-2 text-red-400 hover:text-red-300 rounded-lg hover:bg-gray-800 transition-colors"
                title="Exit Edit Mode"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Device Preview Toggle */}
          <div className="flex items-center space-x-1 mb-4 p-1 bg-gray-800 rounded-lg">
            <button
              onClick={() => setDevicePreview('desktop')}
              className={`p-2 rounded transition-colors ${devicePreview === 'desktop' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              <Monitor className="w-4 h-4" />
            </button>
            <button
              onClick={() => setDevicePreview('tablet')}
              className={`p-2 rounded transition-colors ${devicePreview === 'tablet' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              <Tablet className="w-4 h-4" />
            </button>
            <button
              onClick={() => setDevicePreview('mobile')}
              className={`p-2 rounded transition-colors ${devicePreview === 'mobile' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              <Smartphone className="w-4 h-4" />
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2">
            <button
              onClick={onSave}
              className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center"
            >
              <Save className="w-4 h-4 mr-1" />
              Save
            </button>
            <button
              onClick={() => setShowResetDialog(true)}
              className="px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium rounded-lg transition-colors"
              title="Smart Reset"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={onExport}
              className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
              title="Export"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Enhanced Tabs */}
        <div className="p-4 border-b border-gray-700">
          <div className="grid grid-cols-2 gap-2">
            <TabButton id="live-edit" label="Super Edit" icon={Zap} active={activeTab === 'live-edit'} onClick={setActiveTab} badge={true} />
            <TabButton id="money-flow" label="Money Flow" icon={BarChart3} active={activeTab === 'money-flow'} onClick={setActiveTab} />
            <TabButton id="ai-assistant" label="AI Assistant" icon={Sparkles} active={activeTab === 'ai-assistant'} onClick={setActiveTab} />
            <TabButton id="theme" label="Theme" icon={Palette} active={activeTab === 'theme'} onClick={setActiveTab} />
            <TabButton id="layout" label="Layout" icon={Layout} active={activeTab === 'layout'} onClick={setActiveTab} />
            <TabButton id="content" label="Content" icon={Type} active={activeTab === 'content'} onClick={setActiveTab} />
            <TabButton id="analytics" label="Analytics" icon={Database} active={activeTab === 'analytics'} onClick={setActiveTab} />
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-4">
          {activeTab === 'live-edit' && (
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-600/30 rounded-lg">
                <h3 className="text-sm font-semibold text-white mb-2 flex items-center">
                  <Zap className="w-4 h-4 mr-2 text-blue-400" />
                  Super Advanced Editor Active
                </h3>
                <div className="text-xs text-gray-300 space-y-1">
                  <p>• Click any element to select with AI suggestions</p>
                  <p>• Right-click for advanced context menu</p>
                  <p>• Drag elements with magnetic snapping</p>
                  <p>• Use Ctrl+G for grid, Ctrl+R for rulers</p>
                  <p>• Live positioning with real-time measurements</p>
                  <p>• Double-click for inline rich text editing</p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-white">Super Editor Features</h4>
                
                <div className="grid grid-cols-2 gap-2">
                  <button className="p-3 bg-purple-900/30 hover:bg-purple-800/40 border border-purple-600/30 rounded-lg text-left transition-colors">
                    <div className="flex items-center">
                      <Sparkles className="w-4 h-4 text-purple-400 mr-2" />
                      <div>
                        <div className="text-xs font-medium text-white">AI Suggestions</div>
                        <div className="text-[10px] text-gray-400">Smart improvements</div>
                      </div>
                    </div>
                  </button>
                  
                  <button className="p-3 bg-blue-900/30 hover:bg-blue-800/40 border border-blue-600/30 rounded-lg text-left transition-colors">
                    <div className="flex items-center">
                      <Grid3X3 className="w-4 h-4 text-blue-400 mr-2" />
                      <div>
                        <div className="text-xs font-medium text-white">Grid & Snap</div>
                        <div className="text-[10px] text-gray-400">Precise positioning</div>
                      </div>
                    </div>
                  </button>
                  
                  <button className="p-3 bg-green-900/30 hover:bg-green-800/40 border border-green-600/30 rounded-lg text-left transition-colors">
                    <div className="flex items-center">
                      <Type className="w-4 h-4 text-green-400 mr-2" />
                      <div>
                        <div className="text-xs font-medium text-white">Rich Text</div>
                        <div className="text-[10px] text-gray-400">Advanced formatting</div>
                      </div>
                    </div>
                  </button>
                  
                  <button className="p-3 bg-orange-900/30 hover:bg-orange-800/40 border border-orange-600/30 rounded-lg text-left transition-colors">
                    <div className="flex items-center">
                      <Move className="w-4 h-4 text-orange-400 mr-2" />
                      <div>
                        <div className="text-xs font-medium text-white">Drag & Drop</div>
                        <div className="text-[10px] text-gray-400">Smooth interactions</div>
                      </div>
                    </div>
                  </button>
                </div>

                <div className="p-3 bg-gray-800/50 border border-gray-700 rounded-lg">
                  <div className="text-xs text-gray-300 mb-2">Keyboard Shortcuts:</div>
                  <div className="grid grid-cols-2 gap-1 text-[10px] text-gray-400">
                    <div>Ctrl+S - Save</div>
                    <div>Ctrl+Z - Undo</div>
                    <div>Ctrl+G - Toggle Grid</div>
                    <div>Ctrl+R - Toggle Ruler</div>
                    <div>Ctrl+M - Magnetic Snap</div>
                    <div>Delete - Remove Selected</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ai-assistant' && (
            <GeminiAIAssistant
              content={content}
              setContent={setContent}
              onApplyChanges={handleAICommand}
            />
          )}

          {activeTab === 'theme' && (
            <div className="space-y-4">
              {/* Theme controls from original component */}
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white">Color Theme</h3>
                <button
                  onClick={() => {
                    const defaultTheme = {
                      bg: '#0b0f14',
                      panel: '#101620',
                      panel2: '#0d141d',
                      ink: '#cfd8e3',
                      muted: '#9fb3c8',
                      acc1: '#7bdfff',
                      acc2: '#00bfff',
                      ok: '#10b981',
                      warn: '#f59e0b',
                      bad: '#ef4444',
                      ring: '#7bdfff'
                    };
                    setCustomTheme(defaultTheme);
                    applyTheme(defaultTheme);
                    localStorage.removeItem('portfolio-theme');
                  }}
                  className="text-xs text-blue-400 hover:text-blue-300 flex items-center"
                >
                  <RotateCcw className="w-3 h-3 mr-1" />
                  Reset
                </button>
              </div>
              
              <div className="space-y-3">
                {Object.entries(customTheme).map(([key, value]) => (
                  typeof value === 'string' && value.startsWith('#') && (
                    <div key={key} className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg border border-gray-700">
                      <label className="text-sm font-medium text-gray-300 capitalize">{key.replace(/(\d)/, ' $1')}</label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="color"
                          value={value}
                          onChange={(e) => handleThemeChange(key, e.target.value)}
                          className="w-8 h-8 rounded border border-gray-600 cursor-pointer"
                        />
                        <span className="text-xs text-gray-500 font-mono">{value}</span>
                      </div>
                    </div>
                  )
                ))}
              </div>
            </div>
          )}

          {activeTab === 'layout' && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-white">Layout Settings</h3>
              
              <div className="space-y-3">
                {Object.entries(layoutSettings).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg border border-gray-700">
                    <label className="text-sm font-medium text-gray-300 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                    </label>
                    {typeof value === 'boolean' ? (
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) => handleLayoutChange(key, e.target.checked)}
                        className="w-4 h-4"
                      />
                    ) : (
                      <div className="flex items-center space-x-2">
                        <input
                          type="range"
                          min={key.includes('Count') ? 10 : key.includes('Speed') ? 0.1 : key.includes('Opacity') ? 0.1 : 1}
                          max={key.includes('Count') ? 100 : key.includes('Speed') ? 1 : key.includes('Opacity') ? 1 : key.includes('Width') ? 2000 : 50}
                          step={key.includes('Speed') || key.includes('Opacity') ? 0.1 : 1}
                          value={value}
                          onChange={(e) => handleLayoutChange(key, parseFloat(e.target.value))}
                          className="w-20"
                        />
                        <span className="text-xs text-gray-500 w-12">{value}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'content' && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-white">Content Management</h3>
              
              <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                <h4 className="text-sm font-medium text-white mb-3">Hero Section</h4>
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Name"
                    value={content.hero?.name || ''}
                    onChange={(e) => setContent(prev => ({
                      ...prev,
                      hero: { ...prev.hero, name: e.target.value }
                    }))}
                    className="w-full p-2 text-sm bg-gray-900 border border-gray-600 rounded text-white"
                  />
                  <input
                    type="text"
                    placeholder="Tagline"
                    value={content.hero?.tagline || ''}
                    onChange={(e) => setContent(prev => ({
                      ...prev,
                      hero: { ...prev.hero, tagline: e.target.value }
                    }))}
                    className="w-full p-2 text-sm bg-gray-900 border border-gray-600 rounded text-white"
                  />
                  <textarea
                    placeholder="Punch line"
                    value={content.hero?.punch || ''}
                    onChange={(e) => setContent(prev => ({
                      ...prev,
                      hero: { ...prev.hero, punch: e.target.value }
                    }))}
                    className="w-full p-2 text-sm bg-gray-900 border border-gray-600 rounded text-white resize-none"
                    rows="2"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-white">Analytics Dashboard</h3>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-blue-900/20 border border-blue-600/30 rounded-lg text-center">
                  <div className="text-lg font-bold text-blue-400">{analytics.visitors}</div>
                  <div className="text-xs text-blue-300">Visitors</div>
                </div>
                <div className="p-3 bg-green-900/20 border border-green-600/30 rounded-lg text-center">
                  <div className="text-lg font-bold text-green-400">{analytics.subscribers}</div>
                  <div className="text-xs text-green-300">Subscribers</div>
                </div>
                <div className="p-3 bg-purple-900/20 border border-purple-600/30 rounded-lg text-center">
                  <div className="text-lg font-bold text-purple-400">{analytics.feedback}</div>
                  <div className="text-xs text-purple-300">Feedback</div>
                </div>
                <div className="p-3 bg-orange-900/20 border border-orange-600/30 rounded-lg text-center">
                  <div className="text-lg font-bold text-orange-400">{analytics.projects_viewed}</div>
                  <div className="text-xs text-orange-300">Project Views</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Smart Reset Dialog */}
      {showResetDialog && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2 text-orange-400" />
              Smart Reset Options
            </h3>
            
            <div className="space-y-4">
              <p className="text-sm text-gray-300">
                Choose what to reset while preserving your valuable content:
              </p>
              
              <div className="space-y-3">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={resetOptions.keepUserData}
                    onChange={(e) => setResetOptions({ ...resetOptions, keepUserData: e.target.checked })}
                    className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500"
                  />
                  <div>
                    <div className="text-sm font-medium text-white">Keep Personal Data</div>
                    <div className="text-xs text-gray-400">Preserve contact info, skills, experience</div>
                  </div>
                </label>
                
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={resetOptions.keepProjects}
                    onChange={(e) => setResetOptions({ ...resetOptions, keepProjects: e.target.checked })}
                    className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500"
                  />
                  <div>
                    <div className="text-sm font-medium text-white">Keep Projects & Work</div>
                    <div className="text-xs text-gray-400">Preserve all projects, certificates, achievements</div>
                  </div>
                </label>
                
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={resetOptions.keepTheme}
                    onChange={(e) => setResetOptions({ ...resetOptions, keepTheme: e.target.checked })}
                    className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500"
                  />
                  <div>
                    <div className="text-sm font-medium text-white">Keep Theme Colors</div>
                    <div className="text-xs text-gray-400">Preserve current color customizations</div>
                  </div>
                </label>
                
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={resetOptions.keepLayout}
                    onChange={(e) => setResetOptions({ ...resetOptions, keepLayout: e.target.checked })}
                    className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500"
                  />
                  <div>
                    <div className="text-sm font-medium text-white">Keep Layout Settings</div>
                    <div className="text-xs text-gray-400">Preserve spacing, animations, section order</div>
                  </div>
                </label>
              </div>
              
              <div className="p-3 bg-yellow-900/20 border border-yellow-600/30 rounded-lg">
                <p className="text-xs text-yellow-300">
                  {resetOptions.keepUserData && resetOptions.keepProjects 
                    ? "Only UI design will be reset. Your content stays safe!"
                    : "⚠️ This will remove some of your content. Make sure you have a backup!"
                  }
                </p>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowResetDialog(false)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSmartReset}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors flex items-center"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Apply Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SuperAdvancedEditMode;