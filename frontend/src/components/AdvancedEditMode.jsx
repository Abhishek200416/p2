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
  Zap
} from 'lucide-react';

const AdvancedEditMode = ({ 
  content, 
  setContent, 
  isEditMode, 
  setIsEditMode, 
  onSave, 
  onExport 
}) => {
  const [activeTab, setActiveTab] = useState('theme');
  const [previewMode, setPreviewMode] = useState(false);
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
    'skills', 'experience', 'hackathons', 'certs', 'feedback', 'contact'
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
    reduceMotion: false
  });

  const [videoFile, setVideoFile] = useState(null);
  const [uploadedImages, setUploadedImages] = useState({});

  useEffect(() => {
    // Load saved analytics from localStorage
    const savedAnalytics = localStorage.getItem('portfolio-analytics');
    if (savedAnalytics) {
      setAnalytics(JSON.parse(savedAnalytics));
    }

    // Load custom theme
    const savedTheme = localStorage.getItem('portfolio-theme');
    if (savedTheme) {
      const theme = JSON.parse(savedTheme);
      setCustomTheme(theme);
      applyTheme(theme);
    }
  }, []);

  const applyTheme = (theme) => {
    const root = document.documentElement;
    Object.entries(theme).forEach(([key, value]) => {
      if (key.includes('Opacity')) {
        // Handle opacity values
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
    
    // Apply particle settings to particle system if it exists
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

  const handleVideoUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('video/')) {
      const videoUrl = URL.createObjectURL(file);
      setVideoFile(videoUrl);
      
      // Update content with video
      setContent(prev => ({
        ...prev,
        hero: {
          ...prev.hero,
          video: {
            src: videoUrl,
            poster: prev.hero.video?.poster || ''
          },
          hasIntroVideo: true
        }
      }));
    }
  };

  const handleImageUpload = (section, field, event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const imageUrl = URL.createObjectURL(file);
      
      setUploadedImages(prev => ({
        ...prev,
        [`${section}-${field}`]: imageUrl
      }));

      // Update content with image
      setContent(prev => {
        const updated = { ...prev };
        if (section === 'projects' && field === 'image') {
          // Handle project image upload
          const projectIndex = parseInt(event.target.dataset.index);
          updated.projects.featured[projectIndex].image = imageUrl;
        } else if (section === 'certs' && field === 'image') {
          // Handle certificate image upload
          const certIndex = parseInt(event.target.dataset.index);
          updated.certs[certIndex].image = imageUrl;
        }
        return updated;
      });
    }
  };

  const moveSection = (fromIndex, toIndex) => {
    const newOrder = [...sectionOrder];
    const [moved] = newOrder.splice(fromIndex, 1);
    newOrder.splice(toIndex, 0, moved);
    setSectionOrder(newOrder);
  };

  const resetTheme = () => {
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
  };

  const addNewProject = () => {
    const newProject = {
      slug: `project-${Date.now()}`,
      title: 'New Project',
      story: 'Project description...',
      stack: ['Tech1', 'Tech2'],
      links: { repo: '', demo: '' },
      updated: new Date().toISOString(),
      image: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDF8MHwxfHNlYXJjaHwyfHxjb2Rpbmd8ZW58MHx8fHwxNzU4NjM1NDk1fDA&ixlib=rb-4.1.0&q=85'
    };
    
    setContent(prev => ({
      ...prev,
      projects: {
        ...prev.projects,
        featured: [...prev.projects.featured, newProject]
      }
    }));
  };

  const removeProject = (index) => {
    setContent(prev => ({
      ...prev,
      projects: {
        ...prev.projects,
        featured: prev.projects.featured.filter((_, i) => i !== index)
      }
    }));
  };

  const TabButton = ({ id, label, icon: Icon, active, onClick }) => (
    <button
      onClick={() => onClick(id)}
      className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all ${
        active 
          ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' 
          : 'text-gray-400 hover:text-gray-300 hover:bg-gray-800/50'
      }`}
    >
      <Icon className="w-4 h-4 mr-2" />
      {label}
    </button>
  );

  const ColorInput = ({ label, colorKey, value }) => (
    <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg border border-gray-700">
      <label className="text-sm font-medium text-gray-300">{label}</label>
      <div className="flex items-center space-x-2">
        <input
          type="color"
          value={value}
          onChange={(e) => handleThemeChange(colorKey, e.target.value)}
          className="w-8 h-8 rounded border border-gray-600 cursor-pointer"
        />
        <span className="text-xs text-gray-500 font-mono">{value}</span>
      </div>
    </div>
  );

  if (!isEditMode) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-gray-900/95 backdrop-blur-xl border-l border-gray-700 z-50 overflow-y-auto">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white flex items-center">
            <Settings className="w-5 h-5 mr-2 text-blue-400" />
            Advanced Edit Mode
          </h2>
          <button
            onClick={() => setPreviewMode(!previewMode)}
            className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800"
          >
            {previewMode ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
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
            onClick={onExport}
            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="p-4 border-b border-gray-700">
        <div className="grid grid-cols-2 gap-2">
          <TabButton id="theme" label="Theme" icon={Palette} active={activeTab === 'theme'} onClick={setActiveTab} />
          <TabButton id="layout" label="Layout" icon={Layout} active={activeTab === 'layout'} onClick={setActiveTab} />
          <TabButton id="content" label="Content" icon={Type} active={activeTab === 'content'} onClick={setActiveTab} />
          <TabButton id="media" label="Media" icon={Video} active={activeTab === 'media'} onClick={setActiveTab} />
          <TabButton id="analytics" label="Analytics" icon={BarChart3} active={activeTab === 'analytics'} onClick={setActiveTab} />
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-4">
        {activeTab === 'theme' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">Color Theme</h3>
              <button
                onClick={resetTheme}
                className="text-xs text-blue-400 hover:text-blue-300 flex items-center"
              >
                <RotateCcw className="w-3 h-3 mr-1" />
                Reset
              </button>
            </div>
            
            <div className="space-y-3">
              <ColorInput label="Background" colorKey="bg" value={customTheme.bg} />
              <ColorInput label="Panel" colorKey="panel" value={customTheme.panel} />
              <ColorInput label="Panel 2" colorKey="panel2" value={customTheme.panel2} />
              <ColorInput label="Text" colorKey="ink" value={customTheme.ink} />
              <ColorInput label="Muted Text" colorKey="muted" value={customTheme.muted} />
              <ColorInput label="Primary Accent" colorKey="acc1" value={customTheme.acc1} />
              <ColorInput label="Secondary Accent" colorKey="acc2" value={customTheme.acc2} />
              <ColorInput label="Success" colorKey="ok" value={customTheme.ok} />
              <ColorInput label="Warning" colorKey="warn" value={customTheme.warn} />
              <ColorInput label="Error" colorKey="bad" value={customTheme.bad} />
            </div>
          </div>
        )}

        {activeTab === 'layout' && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-white">Section Order</h3>
            <div className="space-y-2">
              {sectionOrder.map((section, index) => (
                <div key={section} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                  <span className="text-sm text-gray-300 capitalize">{section}</span>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => index > 0 && moveSection(index, index - 1)}
                      disabled={index === 0}
                      className="p-1 text-gray-400 hover:text-white disabled:opacity-30"
                    >
                      ↑
                    </button>
                    <button
                      onClick={() => index < sectionOrder.length - 1 && moveSection(index, index + 1)}
                      disabled={index === sectionOrder.length - 1}
                      className="p-1 text-gray-400 hover:text-white disabled:opacity-30"
                    >
                      ↓
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'content' && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-white">Project Management</h3>
            
            <button
              onClick={addNewProject}
              className="w-full p-3 border-2 border-dashed border-gray-600 rounded-lg text-gray-400 hover:text-white hover:border-gray-500 transition-colors flex items-center justify-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add New Project
            </button>

            <div className="space-y-3 max-h-60 overflow-y-auto">
              {content.projects?.featured?.map((project, index) => (
                <div key={index} className="p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <input
                        type="text"
                        value={project.title}
                        onChange={(e) => {
                          const updated = [...content.projects.featured];
                          updated[index].title = e.target.value;
                          setContent(prev => ({
                            ...prev,
                            projects: { ...prev.projects, featured: updated }
                          }));
                        }}
                        className="w-full bg-transparent text-sm font-medium text-white border-none outline-none"
                      />
                      <textarea
                        value={project.story}
                        onChange={(e) => {
                          const updated = [...content.projects.featured];
                          updated[index].story = e.target.value;
                          setContent(prev => ({
                            ...prev,
                            projects: { ...prev.projects, featured: updated }
                          }));
                        }}
                        className="w-full mt-1 bg-transparent text-xs text-gray-400 border-none outline-none resize-none"
                        rows="2"
                      />
                    </div>
                    <button
                      onClick={() => removeProject(index)}
                      className="ml-2 p-1 text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'media' && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-white">Media Management</h3>
            
            {/* Video Upload */}
            <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
              <h4 className="text-sm font-medium text-white mb-3 flex items-center">
                <Video className="w-4 h-4 mr-2 text-blue-400" />
                Hero Video (Full-screen Intro)
              </h4>
              <input
                type="file"
                accept="video/*"
                onChange={handleVideoUpload}
                className="w-full text-sm text-gray-400 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-600 file:text-white file:cursor-pointer hover:file:bg-blue-700"
              />
              {videoFile && (
                <div className="mt-3 p-2 bg-green-900/20 border border-green-600/30 rounded text-xs text-green-400">
                  ✓ Video uploaded! Will play full-screen on site load.
                </div>
              )}
            </div>

            {/* Project Images */}
            <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
              <h4 className="text-sm font-medium text-white mb-3 flex items-center">
                <ImageIcon className="w-4 h-4 mr-2 text-green-400" />
                Project Images
              </h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {content.projects?.featured?.map((project, index) => (
                  <div key={index} className="flex items-center justify-between text-xs">
                    <span className="text-gray-400 truncate">{project.title}</span>
                    <input
                      type="file"
                      accept="image/*"
                      data-index={index}
                      onChange={(e) => handleImageUpload('projects', 'image', e)}
                      className="text-xs file:text-xs file:py-1 file:px-2 file:rounded file:border-0 file:bg-green-600 file:text-white"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Certificate Images */}
            <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
              <h4 className="text-sm font-medium text-white mb-3 flex items-center">
                <ImageIcon className="w-4 h-4 mr-2 text-yellow-400" />
                Certificate Images
              </h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {content.certs?.map((cert, index) => (
                  <div key={index} className="flex items-center justify-between text-xs">
                    <span className="text-gray-400 truncate">{cert.name}</span>
                    <input
                      type="file"
                      accept="image/*"
                      data-index={index}
                      onChange={(e) => handleImageUpload('certs', 'image', e)}
                      className="text-xs file:text-xs file:py-1 file:px-2 file:rounded file:border-0 file:bg-yellow-600 file:text-white"
                    />
                  </div>
                ))}
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
              <div className="p-3 bg-blue-900/20 border border-blue-600/30 rounded-lg text-center">
                <div className="text-lg font-bold text-blue-400">{analytics.feedback}</div>
                <div className="text-xs text-blue-300">Feedback</div>
              </div>
              <div className="p-3 bg-orange-900/20 border border-orange-600/30 rounded-lg text-center">
                <div className="text-lg font-bold text-orange-400">{analytics.projects_viewed}</div>
                <div className="text-xs text-orange-300">Project Views</div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
              <h4 className="text-sm font-medium text-white mb-3">Recent Activity</h4>
              <div className="space-y-2 text-xs text-gray-400">
                <div className="flex justify-between">
                  <span>New subscriber</span>
                  <span>2 hrs ago</span>
                </div>
                <div className="flex justify-between">
                  <span>Feedback received</span>
                  <span>5 hrs ago</span>
                </div>
                <div className="flex justify-between">
                  <span>Project viewed</span>
                  <span>1 day ago</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvancedEditMode;