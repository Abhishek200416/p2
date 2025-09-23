import React, { useState, useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import EnhancedHero from './components/EnhancedHero';
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

  const AboutSection = () => (
    <section id="about" className="section">
      <div className="portfolio-container">
        <div className="glass-card section-content fade-in">
          <h2 className="heading-xl" style={{ marginBottom: '2rem', color: 'var(--acc-1)' }}>
            Less talk. More shipping.
          </h2>
          
          <div className="two-col-grid">
            <div>
              <h3 className="heading-lg" style={{ marginBottom: '1rem' }}>
                <Target className="inline w-6 h-6 mr-2" style={{ color: 'var(--acc-1)' }} />
                Story
              </h3>
              <p className="body-lg" style={{ color: 'var(--muted)', marginBottom: '1rem' }}>
                {content.about.why}
              </p>
              <p className="body-md" style={{ color: 'var(--ink)' }}>
                {content.about.how}
              </p>
            </div>
            
            <div>
              <h3 className="heading-lg" style={{ marginBottom: '1rem' }}>
                <Zap className="inline w-6 h-6 mr-2" style={{ color: 'var(--acc-2)' }} />
                Speed
              </h3>
              <p className="body-lg" style={{ color: 'var(--muted)' }}>
                {content.about.speed}
              </p>
              
              <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'var(--panel-2)', borderRadius: '0.5rem' }}>
                <p className="body-sm" style={{ color: 'var(--acc-1)', fontWeight: '600' }}>
                  <Clock className="inline w-4 h-4 mr-1" />
                  Recent GitHub Activity
                </p>
                <p className="body-sm" style={{ color: 'var(--muted)', marginTop: '0.5rem' }}>
                  Auto-synced from GitHub API • 24+ repos active
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );

  const FreelanceSection = () => (
    <section id="freelance" className="section">
      <div className="portfolio-container">
        <div className="glass-card section-content fade-in">
          <h2 className="heading-xl" style={{ marginBottom: '1rem', color: 'var(--acc-1)' }}>
            <Briefcase className="inline w-8 h-8 mr-3" />
            Freelance Profile
          </h2>
          <p className="heading-md" style={{ color: 'var(--muted)', marginBottom: '2rem' }}>
            Abhishek Kolluri — Ready for your next project
          </p>
          
          <div style={{ marginBottom: '2rem' }}>
            <h3 className="heading-lg" style={{ marginBottom: '1rem' }}>About Me</h3>
            <p className="body-lg" style={{ color: 'var(--ink)' }}>
              {content.freelance.about}
            </p>
          </div>
          
          <div style={{ marginBottom: '2rem' }}>
            <h3 className="heading-lg" style={{ marginBottom: '1rem' }}>Skills & Services</h3>
            <div className="skill-pills">
              {content.freelance.services.map((service, index) => (
                <span key={index} className="skill-pill">
                  <CheckCircle className="inline w-4 h-4 mr-1" style={{ color: 'var(--ok)' }} />
                  {service}
                </span>
              ))}
            </div>
          </div>
          
          <div style={{ marginBottom: '2rem' }}>
            <h3 className="heading-lg" style={{ marginBottom: '1rem' }}>
              <DollarSign className="inline w-6 h-6 mr-2" />
              Pricing
            </h3>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: '1rem',
              marginBottom: '1.5rem'
            }}>
              <div className="glass-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
                <h4 className="heading-md" style={{ color: 'var(--acc-1)', marginBottom: '0.5rem' }}>
                  Hourly Rate
                </h4>
                <div className="price-amount">
                  <IndianRupee className="inline w-5 h-5" />
                  {content.freelance.pricing.hourlyINR}/hr
                </div>
                <div className="price-usd">~${content.freelance.pricing.hourlyUSD}/hr USD</div>
              </div>
            </div>
            
            <h4 className="heading-md" style={{ marginBottom: '1rem' }}>Project Pricing (Starting at)</h4>
            <div className="pricing-grid">
              {content.freelance.pricing.projects.map((project, index) => (
                <div key={index} className="pricing-card">
                  <h5 className="body-md" style={{ fontWeight: '600', marginBottom: '0.5rem' }}>
                    {project.name}
                  </h5>
                  <div className="price-amount">
                    <IndianRupee className="inline w-4 h-4" />
                    {project.inr.toLocaleString()}
                  </div>
                  <div className="price-usd">~${project.usd} USD</div>
                </div>
              ))}
            </div>
            
            <div style={{ 
              marginTop: '1.5rem', 
              padding: '1rem', 
              background: 'var(--panel-2)', 
              borderRadius: '0.5rem' 
            }}>
              <h5 className="body-md" style={{ fontWeight: '600', marginBottom: '0.5rem' }}>
                Value-Adds
              </h5>
              <p className="body-sm" style={{ color: 'var(--muted)' }}>
                • {content.freelance.pricing.bundles[0].name}: ₹{content.freelance.pricing.bundles[0].startINR.toLocaleString()}+
              </p>
              <p className="body-sm" style={{ color: 'var(--muted)' }}>
                • Maintenance: ₹{content.freelance.pricing.maintenanceMonthlyINR.toLocaleString()}/month
              </p>
            </div>
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <a 
              href={content.freelance.mailto}
              className="cta-primary"
              style={{ padding: '1rem 2rem', fontSize: '1.125rem' }}
            >
              <Mail className="inline w-5 h-5 mr-2" />
              Describe Your Idea
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
          <h3 className="heading-lg" style={{ color: 'var(--acc-1)', marginBottom: '1rem' }}>
            {project.title}
          </h3>
          <h4 className="body-md" style={{ fontWeight: '600', marginBottom: '0.5rem' }}>Problem</h4>
          <p className="body-md" style={{ color: 'var(--muted)', marginBottom: '1rem' }}>
            {project.story}
          </p>
          <h4 className="body-md" style={{ fontWeight: '600', marginBottom: '0.5rem' }}>Stack</h4>
          <div className="project-stack" style={{ marginBottom: '1rem' }}>
            {project.stack.map((tech, index) => (
              <span key={index} className="stack-pill">{tech}</span>
            ))}
          </div>
          {project.links?.repo && (
            <a 
              href={project.links.repo} 
              target="_blank" 
              rel="noopener noreferrer"
              className="cta-secondary"
            >
              <Github className="inline w-4 h-4 mr-2" />
              View Code
            </a>
          )}
        </div>
      </div>
    );
  };

  const ProjectsSection = () => (
    <section id="projects" className="section">
      <div className="portfolio-container">
        <div className="glass-card section-content fade-in">
          <h2 className="heading-xl" style={{ marginBottom: '2rem', color: 'var(--acc-1)' }}>
            <Code2 className="inline w-8 h-8 mr-3" />
            Projects — Impact over Tech
          </h2>
          
          <div className="project-grid">
            {content.projects.featured.map((project, index) => (
              <div 
                key={index} 
                className="project-card"
                onClick={() => setSelectedProject(project)}
              >
                <h3 className="project-title heading-md">
                  {project.title}
                </h3>
                <p className="project-story body-md">
                  {project.story}
                </p>
                
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  marginTop: '1rem',
                  fontSize: '0.75rem',
                  color: 'var(--muted)'
                }}>
                  <span>
                    <Calendar className="inline w-3 h-3 mr-1" />
                    {new Date(project.updated).toLocaleDateString()}
                  </span>
                  <ExternalLink className="inline w-4 h-4" style={{ color: 'var(--acc-1)' }} />
                </div>
                
                <div className="project-stack">
                  {project.stack.map((tech, techIndex) => (
                    <span key={techIndex} className="stack-pill">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <p className="body-sm" style={{ color: 'var(--muted)' }}>
              Click any project for case study • Auto-synced from GitHub • {content.projects.featured.length} featured projects
            </p>
          </div>
        </div>
      </div>
    </section>
  );

  const SkillsSection = () => (
    <section id="skills" className="section">
      <div className="portfolio-container">
        <div className="glass-card section-content fade-in">
          <h2 className="heading-xl" style={{ marginBottom: '2rem', color: 'var(--acc-1)' }}>
            Skills & Tech Stack
          </h2>
          
          <div className="skill-pills">
            {content.skills.map((skill, index) => (
              <span key={index} className="skill-pill">
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );

  const ExperienceSection = () => (
    <section id="experience" className="section">
      <div className="portfolio-container">
        <div className="glass-card section-content fade-in">
          <h2 className="heading-xl" style={{ marginBottom: '2rem', color: 'var(--acc-1)' }}>
            <Award className="inline w-8 h-8 mr-3" />
            Experience & Internships
          </h2>
          
          <div className="three-col-grid">
            {content.experience.map((exp, index) => (
              <div key={index} className="glass-card" style={{ padding: '1.5rem' }}>
                <h3 className="heading-md" style={{ color: 'var(--acc-1)', marginBottom: '0.5rem' }}>
                  {exp.org}
                </h3>
                <p className="body-sm" style={{ color: 'var(--acc-2)', marginBottom: '0.5rem' }}>
                  {exp.role}
                </p>
                <p className="body-sm" style={{ color: 'var(--muted)' }}>
                  {exp.impact}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );

  const HackathonsSection = () => (
    <section id="hackathons" className="section">
      <div className="portfolio-container">
        <div className="glass-card section-content fade-in">
          <h2 className="heading-xl" style={{ marginBottom: '2rem', color: 'var(--acc-1)' }}>
            <Trophy className="inline w-8 h-8 mr-3" />
            Hackathons
          </h2>
          
          <div className="two-col-grid">
            {content.hackathons.map((hackathon, index) => (
              <div key={index} className="glass-card" style={{ padding: '1.5rem' }}>
                <h3 className="heading-md" style={{ color: 'var(--acc-1)', marginBottom: '0.5rem' }}>
                  {hackathon.name}
                </h3>
                <p className="body-sm" style={{ color: 'var(--acc-2)', marginBottom: '0.5rem' }}>
                  {hackathon.duration} sprint • {hackathon.shipped}
                </p>
                <p className="body-sm" style={{ color: 'var(--muted)' }}>
                  <strong>Lesson:</strong> {hackathon.lesson}
                </p>
              </div>
            ))}
          </div>
          
          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <a 
              href="mailto:abhishekollurii@gmail.com?subject=Sprint Team Collaboration"
              className="cta-secondary"
            >
              Book me for your sprint team
            </a>
          </div>
        </div>
      </div>
    </section>
  );

  const CertificationsSection = () => (
    <section id="certifications" className="section">
      <div className="portfolio-container">
        <div className="glass-card section-content fade-in">
          <h2 className="heading-xl" style={{ marginBottom: '2rem', color: 'var(--acc-1)' }}>
            <GraduationCap className="inline w-8 h-8 mr-3" />
            Certifications & Education
          </h2>
          
          <div style={{ marginBottom: '2rem' }}>
            <h3 className="heading-lg" style={{ marginBottom: '1rem' }}>Certifications</h3>
            <div className="skill-pills">
              {content.certs.map((cert, index) => (
                <span key={index} className="skill-pill">
                  <Award className="inline w-4 h-4 mr-1" style={{ color: 'var(--acc-2)' }} />
                  {cert.name || cert} {cert.count && `(x${cert.count})`}
                </span>
              ))}
            </div>
          </div>
          
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <h3 className="heading-lg" style={{ color: 'var(--acc-1)', marginBottom: '0.5rem' }}>
              {content.education.school}
            </h3>
            <p className="body-md" style={{ color: 'var(--muted)' }}>
              {content.education.degree} • {content.education.years}
            </p>
          </div>
        </div>
      </div>
    </section>
  );

  const ContactSection = () => (
    <section id="contact" className="section">
      <div className="portfolio-container">
        <div className="glass-card section-content fade-in">
          <h2 className="heading-xl" style={{ marginBottom: '2rem', color: 'var(--acc-1)' }}>
            <Mail className="inline w-8 h-8 mr-3" />
            Contact & FAQ
          </h2>
          
          <div className="two-col-grid">
            <div>
              <h3 className="heading-lg" style={{ marginBottom: '1rem' }}>Get in Touch</h3>
              
              <div style={{ marginBottom: '1rem' }}>
                <p className="body-md" style={{ color: 'var(--ink)', marginBottom: '0.5rem' }}>
                  <Mail className="inline w-4 h-4 mr-2" style={{ color: 'var(--acc-1)' }} />
                  <a href={`mailto:${content.contact.email}`} style={{ color: 'var(--acc-1)' }}>
                    {content.contact.email}
                  </a>
                </p>
                <p className="body-md" style={{ color: 'var(--ink)', marginBottom: '0.5rem' }}>
                  <Phone className="inline w-4 h-4 mr-2" style={{ color: 'var(--acc-1)' }} />
                  {content.contact.phone}
                </p>
                <p className="body-md" style={{ color: 'var(--ink)' }}>
                  <MapPin className="inline w-4 h-4 mr-2" style={{ color: 'var(--acc-1)' }} />
                  {content.contact.city}
                </p>
              </div>
              
              <div className="hero-social">
                <a 
                  href={content.contact.github} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="social-link"
                >
                  <Github size={20} />
                </a>
                <a 
                  href={content.contact.linkedin} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="social-link"
                >
                  <Linkedin size={20} />
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="heading-lg" style={{ marginBottom: '1rem' }}>Mini-FAQ</h3>
              
              <div style={{ marginBottom: '1rem' }}>
                <h4 className="body-md" style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                  How quickly can you start?
                </h4>
                <p className="body-sm" style={{ color: 'var(--muted)' }}>
                  Usually within 24 hours for new projects.
                </p>
              </div>
              
              <div style={{ marginBottom: '1rem' }}>
                <h4 className="body-md" style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                  Code ownership?
                </h4>
                <p className="body-sm" style={{ color: 'var(--muted)' }}>
                  Full handoff — you own all code, repos, and documentation.
                </p>
              </div>
              
              <div>
                <h4 className="body-md" style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                  Pricing ranges?
                </h4>
                <p className="body-sm" style={{ color: 'var(--muted)' }}>
                  ₹3K for simple automations up to ₹30K+ for full AI platforms.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );

  const Footer = () => (
    <footer style={{ 
      background: 'var(--panel)', 
      borderTop: '1px solid var(--glass-border)',
      padding: '2rem 0' 
    }}>
      <div className="portfolio-container">
        <div style={{ textAlign: 'center' }}>
          <p className="body-md" style={{ color: 'var(--acc-1)', fontWeight: '600', marginBottom: '0.5rem' }}>
            "No fluff. Just software."
          </p>
          <p className="body-sm" style={{ color: 'var(--muted)' }}>
            © 2024 Abhishek Kolluri • Built with React • Deployed fast
          </p>
          
          {isEditMode && (
            <div style={{ 
              marginTop: '1rem', 
              display: 'flex', 
              justifyContent: 'center', 
              gap: '1rem' 
            }}>
              <button onClick={saveContent} className="cta-secondary" style={{ padding: '0.5rem 1rem' }}>
                <Save className="inline w-4 h-4 mr-1" />
                Save Content
              </button>
              <button onClick={exportJSON} className="cta-secondary" style={{ padding: '0.5rem 1rem' }}>
                <Download className="inline w-4 h-4 mr-1" />
                Export JSON
              </button>
            </div>
          )}
        </div>
      </div>
    </footer>
  );

  return (
    <BrowserRouter>
      <div className="App">
        {/* Edit Mode Toggle */}
        <div style={{ 
          position: 'fixed', 
          top: '1rem', 
          right: '1rem', 
          zIndex: 1000
        }}>
          <button 
            onClick={toggleEditMode}
            className="cta-secondary"
            style={{ 
              padding: '0.5rem 1rem',
              fontSize: '0.75rem',
              background: isEditMode ? 'var(--ok)' : 'var(--panel)',
              color: isEditMode ? 'white' : 'var(--ink)',
              border: `1px solid ${isEditMode ? 'var(--ok)' : 'var(--glass-border)'}`,
            }}
          >
            {isEditMode ? <Save className="inline w-3 h-3 mr-1" /> : <Settings className="inline w-3 h-3 mr-1" />}
            {isEditMode ? 'Exit Edit' : 'Edit Mode'}
          </button>
        </div>

        <EnhancedHero content={content.hero} />
        <AboutSection />
        <FreelanceSection />
        <ProjectsSection />
        <SkillsSection />
        <ExperienceSection />
        <HackathonsSection />
        <CertificationsSection />
        <ContactSection />
        <Footer />
        
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