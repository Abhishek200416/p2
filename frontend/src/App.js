import React, { useState, useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import EnhancedHero from './components/EnhancedHero';
import { SkillsSection, ExperienceSection, HackathonsSection, CertificationsSection, ContactSection, Footer } from './components/EnhancedSections';
import { Toaster } from './components/ui/toaster';
import { useToast } from './hooks/use-toast';
import enhancedContent from './data/enhanced-content.json';
import './styles/enhanced-portfolio.css';
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
  const { toast } = useToast();

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
          title: "Edit mode enabled! ✏️",
          description: "You can now edit content inline. Changes auto-save to server.",
        });
      } else {
        throw new Error('Authentication failed');
      }
    } catch (error) {
      // Fallback to local passphrase check
      if (passphrase === 'shipfast' || passphrase === process.env.REACT_APP_OWNER_PASS) {
        setIsEditMode(true);
        toast({
          title: "Edit mode enabled! ✏️",
          description: "Local edit mode. Changes save to localStorage only.",
        });
      } else {
        toast({
          title: "Access denied",
          description: "Incorrect passphrase",
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

  return (
    <BrowserRouter>
      <div className="App" style={{ background: 'var(--bg)', color: 'var(--ink)', minHeight: '100vh' }}>
        {/* Edit Mode Toggle */}
        <div className="fixed top-4 right-4 z-50">
          <button 
            onClick={toggleEditMode}
            className="px-4 py-2 text-sm font-medium rounded-full transition-all duration-250 ease-smooth backdrop-blur-xl border"
            style={{ 
              background: isEditMode ? 'var(--ok)' : 'var(--glass-bg)',
              color: isEditMode ? 'white' : 'var(--ink)',
              border: `1px solid ${isEditMode ? 'var(--ok)' : 'var(--glass-border)'}`,
            }}
          >
            {isEditMode ? (
              <>
                <Save className="inline w-3 h-3 mr-2" />
                Exit Edit
              </>
            ) : (
              <>
                <Settings className="inline w-3 h-3 mr-2" />
                Edit Mode
              </>
            )}
          </button>
        </div>

        <EnhancedHero content={content.hero} />
        <AboutSection />
        <FreelanceSection />
        <ProjectsSection />
        <SkillsSection content={content} />
        <ExperienceSection content={content} />
        <HackathonsSection content={content} />
        <CertificationsSection content={content} />
        <ContactSection content={content} />
        <Footer content={content} isEditMode={isEditMode} saveContent={saveContent} exportJSON={exportJSON} />
        
        <ProjectModal 
          project={selectedProject} 
          onClose={() => setSelectedProject(null)} 
        />
        
        <Toaster />
      </div>
    </BrowserRouter>
  );
}

export default App;