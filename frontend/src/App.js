import React, { useState, useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import Hero from './components/Hero';
import { Toaster } from './components/ui/toaster';
import './styles/portfolio.css';
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
  CheckCircle
} from 'lucide-react';

function App() {
  // Default site content - moved from JSON import to avoid module loading issues
  const defaultContent = {
    "hero": {
      "name": "Abhishek Kolluri",
      "tagline": "Founder @ PromptForge • Full-Stack + AI",
      "punch": "I ship working apps fast — 1 day typical, hard in 3–4.",
      "ctaPrimary": "Hire Me",
      "ctaSecondary": "View Projects",
      "ctaDownload": "Download Resume",
      "subscribeCopy": "Rare updates, high signal only.",
      "video": { "src": "assets/infcastle-loop.mp4", "poster": "assets/infcastle-poster.jpg" },
      "social": {
        "github": "https://github.com/Abhishek200416",
        "linkedin": "https://www.linkedin.com/in/abhishek-k-0b34ba329"
      }
    },
    "about": {
      "why": "I solve practical problems by shipping software that actually works.",
      "how": "Quick scoping, daily milestones, tight feedback loops, clean handoff.",
      "speed": "25+ projects shipped quickly; MVPs in a day, complex in 3–4."
    },
    "freelance": {
      "about": "Cost-effective, scalable, production-ready builds at Indian market rates.",
      "services": [
        "Custom Software (Desktop/Web/SaaS)",
        "Mobile (Android, Flutter, Capacitor)",
        "Full-Stack Web (React, Node, Express, Tailwind, Sequelize, SQL, Firebase)",
        "Workflow Automations (bots, scripts, scraping, reporting)",
        "AI/ML Integrations (basic NLP, CNN, predictive analytics)",
        "Deployment (GitHub, Railway, Vercel, pipelines)"
      ],
      "pricing": {
        "hourlyINR": 900,
        "hourlyUSD": 11,
        "projects": [
          {"name": "Automations/Bots/Scripts", "inr": 3000, "usd": 35},
          {"name": "Landing/Small Website", "inr": 10000, "usd": 120},
          {"name": "Full-Stack Web App (MVP)", "inr": 25000, "usd": 300},
          {"name": "Mobile App (basic)", "inr": 20000, "usd": 240},
          {"name": "AI Tools/Dashboards", "inr": 30000, "usd": 360}
        ],
        "bundles": [{"name": "Website + Admin + Automation", "startINR": 15000}],
        "maintenanceMonthlyINR": 2000
      },
      "mailto": "mailto:abhishekollurii@gmail.com?subject=Project%20for%20Abhi&body=Goal%3A%0AMust-have%3A%0ADeadline%3A%0ABudget%20range%3A"
    },
    "projects": {
      "githubUser": "Abhishek200416",
      "githubAutoPull": false,
      "featured": [
        {
          "slug": "fake-news-cc-fraud-movies-ml",
          "title": "ML Notebooks: Fake News • Credit Card Fraud • Movies",
          "story": "Exploratory ML notebooks with classification and EDA for real-world datasets.",
          "stack": ["Python", "Jupyter", "Pandas", "Scikit-learn"],
          "links": {"repo": "https://github.com/Abhishek200416/Fake-News-Detection", "demo": ""},
          "updated": "2024-12-15"
        },
        {
          "slug": "civic-resilience-sdgs",
          "title": "Civic Resilience (Water/Waste/Health)",
          "story": "Community risk reporting platform with role management, email alerts, and Gemini AI assistance.",
          "stack": ["Node.js", "React", "Sequelize", "Gemini API"],
          "links": {"repo": "https://github.com/Abhishek200416/civic-resilience-based-on-sdgs-working-prototype", "demo": ""},
          "updated": "2024-12-10"
        },
        {
          "slug": "tripplanner-ai",
          "title": "TripPlanner-AI (PWA)",
          "story": "Intelligent itinerary generator with budget optimization and offline capabilities.",
          "stack": ["React", "PWA", "Google Maps", "Gemini API"],
          "links": {"repo": "https://github.com/Abhishek200416/Tripplanner-AI", "demo": ""},
          "updated": "2024-12-08"
        },
        {
          "slug": "skill-seed",
          "title": "Skill-seed Learning Platform",
          "story": "Flutter-Firebase learning platform with practical skill development paths.",
          "stack": ["Flutter", "Firebase", "Dart"],
          "links": {"repo": "https://github.com/Abhishek200416/Skill-seed", "demo": ""},
          "updated": "2024-12-05"
        },
        {
          "slug": "ai-platform-workspace",
          "title": "AI Platform Production-Grade Workspace",
          "story": "Comprehensive AI development environment with model management and deployment tools.",
          "stack": ["Python", "FastAPI", "Docker", "Redis"],
          "links": {"repo": "https://github.com/Abhishek200416/AI-Platform-Production-Grade-Workspace", "demo": ""},
          "updated": "2024-11-28"
        },
        {
          "slug": "invoice-dashboard",
          "title": "Invoice Dashboard & Management",
          "story": "Complete invoicing solution with analytics and automated workflow management.",
          "stack": ["React", "Node.js", "Express", "MongoDB"],
          "links": {"repo": "https://github.com/Abhishek200416/invoice_dashboard", "demo": ""},
          "updated": "2024-11-25"
        }
      ]
    },
    "skills": ["JavaScript/TypeScript","Node.js","Express","React","HTML/CSS","Tailwind CSS","Sequelize/SQL","Python","Streamlit","Docker","Firebase","AWS","Git/GitHub","UiPath RPA","Google Maps","Gemini AI","AI Agents"],
    "experience": [
      {"org": "UiPath RPA & ML Automation", "role": "RPA Developer Intern", "impact": "Automated repetitive operations, improved throughput and reliability by 40%"},
      {"org": "L4G — Google GenAI", "role": "AI Developer", "impact": "Integrated LLMs with safety guardrails and prompt engineering best practices"},
      {"org": "AWS Cloud Deployment", "role": "Cloud Engineer", "impact": "Implemented 8-step deployment pipeline with enhanced security and scalability"},
      {"org": "GEEPL — Visuals/Screens", "role": "UI Developer", "impact": "Developed cohesive visual systems and UI polish since 2023"}
    ],
    "hackathons": [
      {"name": "AI Innovation Challenge", "duration": "24h", "shipped": "Real-time recommendation engine", "lesson": "Scope brutally; ship the core functionality first"},
      {"name": "Smart Cities Hackathon", "duration": "48h", "shipped": "IoT traffic management system", "lesson": "Guardrails and error handling over flashy features"},
      {"name": "FinTech Innovation Sprint", "duration": "36h", "shipped": "Fraud detection ML model", "lesson": "Demo from a stable, tested branch always"},
      {"name": "Healthcare AI Challenge", "duration": "24h", "shipped": "Medical data analysis tool", "lesson": "Better documentation equals better judging scores"}
    ],
    "certs": [
      {"name": "Prompt Engineering Mastery", "issuer": "DeepLearning.AI", "count": 3},
      {"name": "Advanced Python Programming", "issuer": "Python Institute"},
      {"name": "Cloud Computing Fundamentals", "issuer": "AWS"},
      {"name": "Full-Stack Web Development", "issuer": "freeCodeCamp"},
      {"name": "UiPath RPA Developer", "issuer": "UiPath"}
    ],
    "education": {"school": "VSR & VIT College", "degree": "B.Tech in AI & Machine Learning", "years": "2022–2026"},
    "contact": {
      "email": "abhishekollurii@gmail.com", 
      "phone": "+919000327849", 
      "city": "Guntur, Andhra Pradesh, India",
      "github": "https://github.com/Abhishek200416",
      "linkedin": "https://www.linkedin.com/in/abhishek-k-0b34ba329"
    }
  };

  const [content, setContent] = useState(defaultContent);

  // Mock edit mode for demonstration - real implementation will use authentication
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    // Load any saved content from localStorage
    const savedContent = localStorage.getItem('portfolio-content');
    if (savedContent) {
      try {
        setContent(JSON.parse(savedContent));
      } catch (e) {
        console.warn('Failed to parse saved content, using default');
      }
    }
  }, []);

  const saveContent = () => {
    localStorage.setItem('portfolio-content', JSON.stringify(content));
    alert('Content saved to localStorage! Use "Export JSON" to download.');
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
  };

  const AboutSection = () => (
    <section id="about" className="section">
      <div className="portfolio-container">
        <div className="glass-card section-content">
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
                  Auto-synced from GitHub API • 25+ repos active
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
        <div className="glass-card section-content">
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

  const ProjectsSection = () => (
    <section id="projects" className="section">
      <div className="portfolio-container">
        <div className="glass-card section-content">
          <h2 className="heading-xl" style={{ marginBottom: '2rem', color: 'var(--acc-1)' }}>
            <Code2 className="inline w-8 h-8 mr-3" />
            Projects — Impact over Tech
          </h2>
          
          <div className="project-grid">
            {content.projects.featured.map((project, index) => (
              <div key={index} className="project-card">
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
                  {project.links?.repo && (
                    <a 
                      href={project.links.repo} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{ color: 'var(--acc-1)' }}
                    >
                      <ExternalLink className="inline w-4 h-4" />
                    </a>
                  )}
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
              Auto-synced from GitHub • {content.projects.featured.length} featured projects
            </p>
          </div>
        </div>
      </div>
    </section>
  );

  const SkillsSection = () => (
    <section id="skills" className="section">
      <div className="portfolio-container">
        <div className="glass-card section-content">
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
        <div className="glass-card section-content">
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
        <div className="glass-card section-content">
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
        <div className="glass-card section-content">
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
        <div className="glass-card section-content">
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
                Save to LocalStorage
              </button>
              <button onClick={exportJSON} className="cta-secondary" style={{ padding: '0.5rem 1rem' }}>
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
        {/* Edit Mode Toggle - Simplified for now */}
        {process.env.NODE_ENV === 'development' && (
          <div style={{ 
            position: 'fixed', 
            top: '1rem', 
            right: '1rem', 
            zIndex: 1000,
            background: 'var(--panel)',
            padding: '0.5rem',
            borderRadius: '0.5rem',
            border: '1px solid var(--glass-border)'
          }}>
            <button 
              onClick={() => setIsEditMode(!isEditMode)}
              style={{ 
                background: isEditMode ? 'var(--ok)' : 'var(--muted)',
                color: 'white',
                border: 'none',
                padding: '0.25rem 0.5rem',
                borderRadius: '0.25rem',
                fontSize: '0.75rem'
              }}
            >
              Edit Mode: {isEditMode ? 'ON' : 'OFF'}
            </button>
          </div>
        )}

        <Hero content={content.hero} />
        <AboutSection />
        <FreelanceSection />
        <ProjectsSection />
        <SkillsSection />
        <ExperienceSection />
        <HackathonsSection />
        <CertificationsSection />
        <ContactSection />
        <Footer />
        
        <Toaster />
      </div>
    </BrowserRouter>
  );
}

export default App;