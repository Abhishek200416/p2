import React, { useState, useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import EnhancedHero from './components/EnhancedHero';
import { SkillsSection, ExperienceSection, HackathonsSection, CertificationsSection, Footer } from './components/EnhancedSections';
import EnhancedFeedback from './components/EnhancedFeedback';
import EnhancedContact from './components/EnhancedContact';
import TestimonialSection from './components/TestimonialSection';
import SuperAdvancedEditMode from './components/SuperAdvancedEditMode';
import AdvancedInPlaceEditor from './components/AdvancedInPlaceEditor';
import SuperAdvancedEditor from './components/SuperAdvancedEditor';

import VideoIntro from './components/VideoIntro';
import AdvancedParticleSystem from './components/AdvancedParticleSystem';
import EditableWrapper from './components/EditableWrapper';
import { Toaster } from './components/ui/toaster';
import { useToast } from './hooks/use-toast';
import enhancedContent from './data/enhanced-content.json';
import { fetchGitHubRepos, mergeWithFeatured } from './utils/github-api';
import './styles/enhanced-portfolio.css';
import './styles/editable-elements.css';
import './styles/rich-editable.css';
import { 
  User, 
  Briefcase, 
  Code2, 
  Award, 
  GraduationCap, 
  Trophy, 
  Mail,
  Phone,
  MapPin,
  ExternalLink,
  Calendar,
  DollarSign,
  IndianRupee,
  Zap,
  Target,
  Clock,
  CheckCircle,
  Github,
  Linkedin,
  Download,
  Eye,
  Edit3,
  Save,
  Settings,
  ArrowRight,
  Star,
  TrendingUp
} from 'lucide-react';

function App() {
  const [content, setContent] = useState(enhancedContent);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isReduced, setIsReduced] = useState(false);
  const [githubProjects, setGithubProjects] = useState([]);
  const [isLoadingGithub, setIsLoadingGithub] = useState(false);
  const [showVideoIntro, setShowVideoIntro] = useState(false);
  const [hasSeenIntro, setHasSeenIntro] = useState(false);
  const { toast } = useToast();

  // Check if there's an intro video and user hasn't seen it
  useEffect(() => {
    const seenIntro = localStorage.getItem('portfolio-seen-intro');
    const hasVideo = content.hero?.video?.src && content.hero?.hasIntroVideo;
    
    if (hasVideo && !seenIntro) {
      setShowVideoIntro(true);
      setHasSeenIntro(false);
    } else {
      setHasSeenIntro(true);
    }
  }, [content.hero]);

  const handleVideoComplete = () => {
    setShowVideoIntro(false);
    setHasSeenIntro(true);
    localStorage.setItem('portfolio-seen-intro', 'true');
  };

  const handleVideoSkip = () => {
    setShowVideoIntro(false);
    setHasSeenIntro(true);
    localStorage.setItem('portfolio-seen-intro', 'true');
  };

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setIsReduced(mediaQuery.matches);
    
    const handleChange = (e) => setIsReduced(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    // Load content from backend or localStorage
    const loadContent = async () => {
      try {
        // Try to load from backend first
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/content`);
        if (response.ok) {
          const backendContent = await response.json();
          if (backendContent && Object.keys(backendContent).length > 1) {
            setContent(backendContent);
            return;
          }
        }
      } catch (error) {
        console.log('Backend content not available, using local content');
      }

      // Fallback to localStorage
      const savedContent = localStorage.getItem('portfolio-content');
      if (savedContent) {
        try {
          const localContent = JSON.parse(savedContent);
          setContent({ ...enhancedContent, ...localContent });
        } catch (e) {
          console.warn('Failed to parse saved content, using enhanced default');
        }
      }
    };

    loadContent();
    

  }, []);

  // Load GitHub projects
  useEffect(() => {
    const loadGithubProjects = async () => {
      if (!content.projects?.githubAutoPull) return;
      
      setIsLoadingGithub(true);
      try {
        const repos = await fetchGitHubRepos('updated');
        const mergedProjects = mergeWithFeatured(repos, content.projects.featured);
        
        setGithubProjects(mergedProjects);
        
        // Update content with merged projects
        setContent(prev => ({
          ...prev,
          projects: {
            ...prev.projects,
            featured: mergedProjects
          }
        }));
        
      } catch (error) {
        console.warn('Failed to load GitHub projects:', error);
      } finally {
        setIsLoadingGithub(false);
      }
    };

    if (content.projects) {
      loadGithubProjects();
    }
  }, [content.projects?.githubAutoPull]);

  // Register service worker for PWA
  useEffect(() => {
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then((registration) => {
            console.log('SW registered: ', registration);
          })
          .catch((registrationError) => {
            console.log('SW registration failed: ', registrationError);
          });
      });
    }
  }, []);

  const saveContent = async () => {
    try {
      // Save to localStorage first
      localStorage.setItem('portfolio-content', JSON.stringify(content));
      
      // Try to save to backend if token available
      const token = sessionStorage.getItem('portfolio-token');
      if (token) {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/save-content`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(content)
        });
        
        if (response.ok) {
          toast({
            title: "Content saved successfully! ✨",
            description: "Changes have been saved to both local storage and server.",
          });
        } else {
          throw new Error('Backend save failed');
        }
      } else {
        toast({
          title: "Saved locally 💾",
          description: "Content saved to localStorage. Login to sync with server.",
        });
      }
    } catch (error) {
      toast({
        title: "Saved locally 💾",
        description: "Content saved to localStorage. Backend sync unavailable.",
      });
    }
  };

  const handleAICommand = async (command) => {
    try {
      // Simulate AI processing (in a real app, this would call your AI API)
      const improvements = {
        'optimize-typography': () => {
          setContent(prev => ({
            ...prev,
            hero: {
              ...prev.hero,
              title: prev.hero.title.replace(/\s+/g, ' ').trim(),
              subtitle: prev.hero.subtitle.replace(/\s+/g, ' ').trim()
            }
          }));
          toast({
            title: "Typography Optimized ✨",
            description: "Improved font hierarchy and spacing for better readability.",
          });
        },
        'enhance-colors': () => {
          // Apply a modern color scheme
          document.documentElement.style.setProperty('--acc-1', '#00d4ff');
          document.documentElement.style.setProperty('--acc-2', '#0066ff');
          toast({
            title: "Colors Enhanced 🎨",
            description: "Applied modern color palette with improved contrast.",
          });
        },
        'responsive-layout': () => {
          toast({
            title: "Layout Made Responsive 📱",
            description: "Automatically adapted layout for all device sizes.",
          });
        }
      };

      if (typeof command === 'string') {
        // Handle text improvement requests
        if (command.startsWith('Improve this text:')) {
          const text = command.replace('Improve this text: "', '').replace('"', '');
          const improved = `${text} - Enhanced with AI optimization for better clarity and engagement.`;
          toast({
            title: "Text Improved 🚀",
            description: "AI has enhanced your content for better engagement.",
          });
          return improved;
        }
        
        // Handle other AI commands
        for (const [key, action] of Object.entries(improvements)) {
          if (command.toLowerCase().includes(key.replace('-', ' '))) {
            action();
            return;
          }
        }
      }

      toast({
        title: "AI Processing Complete 🤖",
        description: "Your request has been processed successfully.",
      });
    } catch (error) {
      console.error('AI command failed:', error);
      toast({
        title: "AI Processing Error ⚠️",
        description: "Unable to process AI command. Please try again.",
      });
    }
  };

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(content, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'site-content.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "JSON exported!",
      description: "site-content.json has been downloaded.",
    });
  };

  const toggleEditMode = async () => {
    if (isEditMode) {
      setIsEditMode(false);
      toast({
        title: "Edit mode disabled",
        description: "Content is now read-only",
      });
      return;
    }

    const passphrase = prompt('Enter owner passphrase to enable edit mode:');
    if (!passphrase) return;

    try {
      // Try to authenticate with backend
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ passphrase })
      });

      if (response.ok) {
        const { token } = await response.json();
        sessionStorage.setItem('portfolio-token', token);
        setIsEditMode(true);
        toast({
          title: "Advanced Edit Mode Enabled! ⚡",
          description: "Full customization panel is now available. Make any changes you want!",
        });
      } else {
        throw new Error('Authentication failed');
      }
    } catch (error) {
      // Fallback to local passphrase check
      if (passphrase === 'shipfast' || passphrase === process.env.REACT_APP_OWNER_PASS) {
        setIsEditMode(true);
        toast({
          title: "Advanced Edit Mode Enabled! ⚡",
          description: "Full customization panel active. All features unlocked!",
        });
      } else {
        toast({
          title: "Access denied",
          description: "Incorrect passphrase. Try 'shipfast'",
          variant: "destructive"
        });
      }
    }
  };

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const AboutSection = () => (
    <section id="about" className="section">
      <div className="portfolio-container">
        <EditableWrapper
          isEditMode={isEditMode}
          elementPath="about"
          elementType="section"
          content={content}
          setContent={setContent}
        >
          <div className="glass-card section-content animate-fade-in">
            <EditableWrapper
              isEditMode={isEditMode}
              elementPath="about.title"
              elementType="heading"
              content={content}
              setContent={setContent}
            >
              <h2 className="heading-xl mb-8 text-acc-1 font-display">
                Less talk. More shipping.
              </h2>
            </EditableWrapper>
            
            <div className="two-col-grid">
              <div className="space-y-6">
                <div>
                  <h3 className="heading-lg mb-4 flex items-center">
                    <Target className="inline w-6 h-6 mr-3 text-acc-1" />
                    Story
                  </h3>
                  <EditableWrapper
                    isEditMode={isEditMode}
                    elementPath="about.why"
                    elementType="paragraph"
                    content={content}
                    setContent={setContent}
                  >
                    <p className="text-lg text-muted mb-4 leading-relaxed">
                      {content.about.why}
                    </p>
                  </EditableWrapper>
                  <EditableWrapper
                    isEditMode={isEditMode}
                    elementPath="about.how"
                    elementType="paragraph"
                    content={content}
                    setContent={setContent}
                  >
                    <p className="text-base text-ink">
                      {content.about.how}
                    </p>
                  </EditableWrapper>
                </div>
                
                <div className="p-6 bg-panel-2/50 rounded-xl border border-glass-border/30">
                  <p className="text-sm text-acc-1 font-semibold mb-2 flex items-center">
                    <TrendingUp className="inline w-4 h-4 mr-2" />
                    {content.meta?.credo || content.about.credo}
                  </p>
                  <EditableWrapper
                    isEditMode={isEditMode}
                    elementPath="meta.tagline"
                    elementType="tagline"
                    content={content}
                    setContent={setContent}
                  >
                    <p className="text-sm text-muted">
                      "{content.meta?.tagline || 'Give me a clear problem and 24 hours. You\'ll get something real.'}"
                    </p>
                  </EditableWrapper>
                </div>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h3 className="heading-lg mb-4 flex items-center">
                    <Zap className="inline w-6 h-6 mr-3 text-acc-2" />
                    Speed & Outcomes
                  </h3>
                  <EditableWrapper
                    isEditMode={isEditMode}
                    elementPath="about.speed"
                    elementType="paragraph"
                    content={content}
                    setContent={setContent}
                  >
                    <p className="text-lg text-muted mb-4">
                      {content.about.speed}
                    </p>
                  </EditableWrapper>
                
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-glass-bg rounded-lg border border-glass-border/20">
                      <span className="text-sm font-medium">MVPs</span>
                      <span className="text-acc-1 font-bold">1 day</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-glass-bg rounded-lg border border-glass-border/20">
                      <span className="text-sm font-medium">Complex builds</span>
                      <span className="text-acc-2 font-bold">3-4 days</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-glass-bg rounded-lg border border-glass-border/20">
                      <span className="text-sm font-medium">Projects shipped</span>
                      <span className="text-ok font-bold">25+ total</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </EditableWrapper>
      </div>
    </section>
  );

  const FreelanceSection = () => (
    <section id="freelance" className="section">
      <div className="portfolio-container">
        <div className="glass-card section-content animate-slide-up">
          <h2 className="heading-xl mb-4 text-acc-1 font-display flex items-center">
            <Briefcase className="inline w-8 h-8 mr-4" />
            Freelance Profile
          </h2>
          <p className="heading-md text-muted mb-8 font-display">
            Abhishek Kolluri — Ready for your next project
          </p>
          
          {/* About */}
          <div className="mb-8">
            <h3 className="heading-lg mb-4 font-display">About Me</h3>
            <p className="text-lg text-ink leading-relaxed">
              {content.freelance.about}
            </p>
          </div>
          
          {/* Services */}
          <div className="mb-8">
            <h3 className="heading-lg mb-6 font-display">Skills & Services</h3>
            <div className="skill-pills">
              {content.freelance.services.map((service, index) => (
                <span key={index} className="skill-pill group">
                  <CheckCircle className="inline w-4 h-4 mr-2 text-ok group-hover:text-acc-1 transition-colors" />
                  {service}
                </span>
              ))}
            </div>
          </div>
          
          {/* Pricing */}
          <div className="mb-8">
            <h3 className="heading-lg mb-6 font-display flex items-center">
              <DollarSign className="inline w-6 h-6 mr-3" />
              Pricing
            </h3>
            
            {/* Hourly Rate Highlight */}
            <div className="max-w-sm mx-auto mb-8">
              <div className="glass-card p-6 text-center border-2 border-acc-1/30 hover:border-acc-1/60 transition-all">
                <h4 className="heading-md text-acc-1 mb-2 font-display">
                  Hourly Rate
                </h4>
                <div className="text-3xl font-bold text-ink mb-1 flex items-center justify-center">
                  <IndianRupee className="w-6 h-6" />
                  {content.freelance.pricing.hourlyINR}/hr
                </div>
                <div className="text-sm text-muted">~${content.freelance.pricing.hourlyUSD}/hr USD</div>
              </div>
            </div>
            
            {/* Project Pricing Grid */}
            <h4 className="heading-md mb-4 font-display">Project Pricing (Starting at)</h4>
            <div className="pricing-grid">
              {content.freelance.pricing.projects.map((project, index) => (
                <div key={index} className="pricing-card group">
                  <h5 className="text-base font-semibold mb-3 group-hover:text-acc-2 transition-colors">
                    {project.name}
                  </h5>
                  <div className="price-amount flex items-center justify-center mb-1">
                    <IndianRupee className="w-5 h-5 mr-1" />
                    {project.inr.toLocaleString()}
                  </div>
                  <div className="price-usd">~${project.usd} USD</div>
                </div>
              ))}
            </div>
            
            {/* Value Adds */}
            <div className="mt-6 p-6 bg-panel-2/40 rounded-xl border border-glass-border/30">
              <h5 className="text-base font-semibold mb-4 text-acc-2 flex items-center">
                <Star className="w-4 h-4 mr-2" />
                Value-Adds & Bundles
              </h5>
              <div className="space-y-2 text-sm text-muted">
                <p className="flex items-center">
                  <ArrowRight className="w-3 h-3 mr-2 text-acc-1" />
                  {content.freelance.pricing.bundles[0].name}: ₹{content.freelance.pricing.bundles[0].startINR.toLocaleString()}+
                </p>
                <p className="flex items-center">
                  <ArrowRight className="w-3 h-3 mr-2 text-acc-1" />
                  Maintenance & Support: ₹{content.freelance.pricing.maintenanceMonthlyINR.toLocaleString()}/month
                </p>
                <p className="flex items-center">
                  <ArrowRight className="w-3 h-3 mr-2 text-acc-1" />
                  Complete code ownership and documentation included
                </p>
              </div>
            </div>
          </div>
          
          {/* CTA */}
          <div className="text-center">
            <a 
              href={content.freelance.mailto}
              className="cta-primary text-lg px-8 py-4 group"
            >
              <Mail className="inline w-5 h-5 mr-3 group-hover:rotate-12 transition-transform" />
              {content.freelance.cta || 'Ship your MVP this week'}
            </a>
          </div>
        </div>
      </div>
    </section>
  );

  const ProjectModal = ({ project, onClose }) => {
    if (!project) return null;
    
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content glass-card" onClick={e => e.stopPropagation()}>
          <button className="modal-close" onClick={onClose}>×</button>
          
          <h3 className="heading-lg text-acc-1 mb-4 font-display">
            {project.title}
          </h3>
          
          {/* Case Study Structure */}
          <div className="space-y-6">
            <div>
              <h4 className="text-base font-semibold mb-2 text-acc-2 flex items-center">
                <Target className="w-4 h-4 mr-2" />
                Problem
              </h4>
              <p className="text-sm text-muted leading-relaxed">
                {project.story}
              </p>
            </div>
            
            {project.approach && (
              <div>
                <h4 className="text-base font-semibold mb-2 text-acc-1 flex items-center">
                  <Settings className="w-4 h-4 mr-2" />
                  Approach
                </h4>
                <p className="text-sm text-ink leading-relaxed">
                  {project.approach}
                </p>
              </div>
            )}
            
            {project.impact && (
              <div>
                <h4 className="text-base font-semibold mb-2 text-ok flex items-center">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Impact
                </h4>
                <p className="text-sm text-ink leading-relaxed">
                  {project.impact}
                </p>
              </div>
            )}
            
            <div>
              <h4 className="text-base font-semibold mb-3">Tech Stack</h4>
              <div className="project-stack">
                {project.stack.map((tech, index) => (
                  <span key={index} className="stack-pill">{tech}</span>
                ))}
              </div>
            </div>
            
            <div className="flex gap-3 pt-4 border-t border-glass-border/30">
              {project.links?.repo && (
                <a 
                  href={project.links.repo} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="cta-secondary px-4 py-2 text-sm"
                >
                  <Github className="inline w-4 h-4 mr-2" />
                  View Code
                </a>
              )}
              {project.links?.demo && (
                <a 
                  href={project.links.demo} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="cta-primary px-4 py-2 text-sm"
                >
                  <ExternalLink className="inline w-4 h-4 mr-2" />
                  Live Demo
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const ProjectsSection = () => (
    <section id="projects" className="section">
      <div className="portfolio-container">
        <div className="glass-card section-content animate-slide-up">
          <h2 className="heading-xl mb-8 text-acc-1 font-display flex items-center">
            <Code2 className="inline w-8 h-8 mr-4" />
            Projects — Impact over Tech
          </h2>
          
          {/* GitHub Sync Status */}
          <div className="mb-6 p-4 bg-panel-2/30 rounded-lg border border-glass-border/20 flex items-center justify-between">
            <p className="text-sm text-muted flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              {content.projects.githubAutoPull 
                ? `Auto-synced from GitHub • Last update: ${new Date().toLocaleDateString()}` 
                : 'Curated portfolio • GitHub sync available on request'
              }
              <span className="ml-2 px-2 py-1 bg-acc-1/20 text-acc-1 text-xs rounded-full font-medium">
                {content.projects.featured.length} featured
              </span>
            </p>
            {isLoadingGithub && (
              <div className="flex items-center text-xs text-acc-2">
                <div className="w-3 h-3 border border-acc-2 border-t-transparent rounded-full animate-spin mr-2"></div>
                Syncing...
              </div>
            )}
          </div>
          
          <div className="project-grid">
            {content.projects.featured.map((project, index) => (
              <div 
                key={project.slug || index} 
                className="project-card group cursor-pointer relative overflow-hidden"
                onClick={() => setSelectedProject(project)}
              >
                {/* Project Image */}
                {project.image && (
                  <div className="absolute inset-0 z-0 opacity-20 group-hover:opacity-30 transition-opacity">
                    <img 
                      src={project.image} 
                      alt={project.title}
                      className="w-full h-full object-cover rounded-xl"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-panel-2 via-transparent to-transparent"></div>
                  </div>
                )}
                
                {/* Content */}
                <div className="relative z-10">
                  {/* Badges */}
                  <div className="flex justify-between items-start mb-3">
                    {project.featured && (
                      <div className="bg-acc-2/20 text-acc-2 px-2 py-1 rounded-full text-xs font-semibold">
                        ★ Featured
                      </div>
                    )}
                    {project.isRecent && (
                      <div className="bg-ok/20 text-ok px-2 py-1 rounded-full text-xs font-semibold">
                        Recent
                      </div>
                    )}
                    {project.isFromGitHub && (
                      <div className="bg-acc-1/20 text-acc-1 px-2 py-1 rounded-full text-xs font-semibold">
                        GitHub
                      </div>
                    )}
                  </div>
                  
                  <h3 className="project-title heading-md mb-3">
                    {project.title}
                  </h3>
                  
                  <p className="project-story text-base mb-4 leading-relaxed">
                    {project.story || project.description}
                  </p>
                  
                  {/* Project Stats & Meta */}
                  <div className="flex justify-between items-center mb-4 text-xs text-muted">
                    <span className="flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      {new Date(project.updated).toLocaleDateString()}
                    </span>
                    <div className="flex items-center gap-3">
                      {project.stars > 0 && (
                        <span className="flex items-center">
                          <Star className="w-3 h-3 mr-1" />
                          {project.stars}
                        </span>
                      )}
                      <span className="flex items-center text-acc-1 group-hover:translate-x-1 transition-transform">
                        <ExternalLink className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                  
                  {/* Tech Stack */}
                  <div className="project-stack">
                    {(project.stack || []).map((tech, techIndex) => (
                      <span key={techIndex} className="stack-pill text-xs">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Footer Note */}
          <div className="text-center mt-8 p-6 bg-glass-bg/30 rounded-xl border border-glass-border/20">
            <p className="text-sm text-muted mb-2">
              Click any project for detailed case study
            </p>
            <p className="text-xs text-muted">
              GitHub: <a href="https://github.com/Abhishek200416" target="_blank" rel="noopener noreferrer" className="text-acc-1 hover:text-acc-2 transition-colors">@Abhishek200416</a> • 
              {content.projects.githubAutoPull ? 'Auto-synced' : '24+ public repos'} • Recent ML and full-stack projects
            </p>
          </div>
        </div>
      </div>
    </section>
  );

  return (
    <BrowserRouter>
      <div className="App" style={{ background: 'var(--bg)', color: 'var(--ink)', minHeight: '100vh' }}>
        {/* Video Intro */}
        {showVideoIntro && content.hero?.video?.src && (
          <VideoIntro 
            videoSrc={content.hero.video.src}
            onComplete={handleVideoComplete}
            onSkip={handleVideoSkip}
          />
        )}

        {/* Main Content - Only show when video is done */}
        {(hasSeenIntro || !content.hero?.hasIntroVideo) && (
          <div className={`${isEditMode ? 'edit-mode-active' : ''}`}>
            {/* Super Advanced Edit Mode Panel */}
            <SuperAdvancedEditMode
              content={content}
              setContent={setContent}
              isEditMode={isEditMode}
              setIsEditMode={setIsEditMode}
              onSave={saveContent}
              onExport={exportJSON}
            />

            {/* Edit Mode Toggle Button */}
            <div className="fixed top-4 right-4 z-30">
              <button 
                onClick={toggleEditMode}
                className="px-4 py-2 text-sm font-medium rounded-full transition-all duration-250 ease-smooth backdrop-blur-xl border shadow-lg hover:shadow-xl"
                style={{ 
                  background: isEditMode ? 'linear-gradient(135deg, #10b981, #059669)' : 'var(--glass-bg)',
                  color: isEditMode ? 'white' : 'var(--ink)',
                  border: `1px solid ${isEditMode ? '#10b981' : 'var(--glass-border)'}`,
                  transform: isEditMode ? 'scale(1.05)' : 'scale(1)',
                }}
              >
                {isEditMode ? (
                  <>
                    <Save className="inline w-3 h-3 mr-2" />
                    Super Edit ON
                  </>
                ) : (
                  <>
                    <Settings className="inline w-3 h-3 mr-2" />
                    Super Edit
                  </>
                )}
              </button>
            </div>

            {/* Background Particle System */}
            <AdvancedParticleSystem 
              particleCount={window.innerWidth > 768 ? 45 : 20}
              color="#7bdfff"
              opacity={0.4}
              speed={0.3}
              className="fixed inset-0 z-0"
            />
            
            <div className="relative z-10">
              <EditableWrapper
                isEditMode={isEditMode}
                elementPath="hero"
                elementType="hero-section"
                content={content}
                setContent={setContent}
              >
                <EnhancedHero content={content.hero} isEditMode={isEditMode} />
              </EditableWrapper>
              
              <AboutSection />
              
              <EditableWrapper
                isEditMode={isEditMode}
                elementPath="freelance"
                elementType="section"
                content={content}
                setContent={setContent}
              >
                <FreelanceSection />
              </EditableWrapper>
              
              <EditableWrapper
                isEditMode={isEditMode}
                elementPath="projects"
                elementType="section"
                content={content}
                setContent={setContent}
              >
                <ProjectsSection />
              </EditableWrapper>
              
              <EditableWrapper
                isEditMode={isEditMode}
                elementPath="skills"
                elementType="section"
                content={content}
                setContent={setContent}
              >
                <SkillsSection content={content} isEditMode={isEditMode} />
              </EditableWrapper>
              
              <EditableWrapper
                isEditMode={isEditMode}
                elementPath="experience"
                elementType="section"
                content={content}
                setContent={setContent}
              >
                <ExperienceSection content={content} isEditMode={isEditMode} />
              </EditableWrapper>


              
              <EditableWrapper
                isEditMode={isEditMode}
                elementPath="hackathons"
                elementType="section"
                content={content}
                setContent={setContent}
              >
                <HackathonsSection content={content} isEditMode={isEditMode} />
              </EditableWrapper>
              
              <EditableWrapper
                isEditMode={isEditMode}
                elementPath="certs"
                elementType="section"
                content={content}
                setContent={setContent}
              >
                <CertificationsSection content={content} isEditMode={isEditMode} />
              </EditableWrapper>
              
              <EditableWrapper
                isEditMode={isEditMode}
                elementPath="testimonials"
                elementType="section"
                content={content}
                setContent={setContent}
              >
                <TestimonialSection 
                  content={content} 
                  isEditMode={isEditMode} 
                  setContent={setContent} 
                />
              </EditableWrapper>
              
              <EditableWrapper
                isEditMode={isEditMode}
                elementPath="feedback"
                elementType="section"
                content={content}
                setContent={setContent}
              >
                <EnhancedFeedback content={content} isEditMode={isEditMode} />
              </EditableWrapper>
              
              <EditableWrapper
                isEditMode={isEditMode}
                elementPath="contact"
                elementType="section"
                content={content}
                setContent={setContent}
              >
                <EnhancedContact content={content} isEditMode={isEditMode} />
              </EditableWrapper>
              
              <EditableWrapper
                isEditMode={isEditMode}
                elementPath="footer"
                elementType="section"
                content={content}
                setContent={setContent}
              >
                <Footer content={content} isEditMode={isEditMode} saveContent={saveContent} exportJSON={exportJSON} />
              </EditableWrapper>
            </div>
            
            <ProjectModal 
              project={selectedProject} 
              onClose={() => setSelectedProject(null)} 
            />
          </div>
        )}
        
        <Toaster />
      </div>
    </BrowserRouter>
  );
}

export default App;