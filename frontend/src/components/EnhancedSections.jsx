import React from 'react';
import { 
  Award, 
  GraduationCap, 
  Trophy, 
  Mail,
  Phone,
  MapPin,
  Calendar,
  IndianRupee,
  Zap,
  Target,
  Clock,
  CheckCircle,
  Github,
  Linkedin,
  Download,
  Eye,
  Star,
  TrendingUp,
  ArrowRight,
  ExternalLink
} from 'lucide-react';

export const SkillsSection = React.forwardRef(({ content }, ref) => (
  <section ref={ref} id="skills" className="section">
    <div className="portfolio-container">
      <div className="glass-card section-content animate-slide-up">
        <h2 className="heading-xl mb-8 text-acc-1 font-display">
          Skills & Tech Stack
        </h2>
        
        <div className="skill-pills">
          {content.skills?.map((skill, index) => (
            <span key={index} className="skill-pill group">
              {skill}
            </span>
          ))}
        </div>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          <div className="text-center p-4 bg-glass-bg/30 rounded-xl border border-glass-border/20">
            <div className="text-2xl font-bold text-acc-1 mb-1">8+</div>
            <div className="text-sm text-muted">Languages & Frameworks</div>
          </div>
          <div className="text-center p-4 bg-glass-bg/30 rounded-xl border border-glass-border/20">
            <div className="text-2xl font-bold text-acc-2 mb-1">5+</div>
            <div className="text-sm text-muted">Cloud & DevOps Tools</div>
          </div>
          <div className="text-center p-4 bg-glass-bg/30 rounded-xl border border-glass-border/20">
            <div className="text-2xl font-bold text-ok mb-1">10+</div>
            <div className="text-sm text-muted">AI & ML Technologies</div>
          </div>
        </div>
      </div>
    </div>
  </section>
));

SkillsSection.displayName = 'SkillsSection';

export const ExperienceSection = React.forwardRef(({ content }, ref) => (
  <section ref={ref} id="experience" className="section">
    <div className="portfolio-container">
      <div className="glass-card section-content animate-slide-up">
        <h2 className="heading-xl mb-8 text-acc-1 font-display flex items-center">
          <Award className="inline w-8 h-8 mr-4" />
          Experience & Internships
        </h2>
        
        <div className="space-y-6">
          {content.experience?.map((exp, index) => (
            <div key={index} className="glass-card p-6 group hover:border-acc-1/40 transition-all">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="heading-md text-acc-1 mb-1 group-hover:text-acc-2 transition-colors font-display">
                    {exp.org}
                  </h3>
                  <p className="text-base text-acc-2 font-medium mb-2">
                    {exp.role}
                  </p>
                </div>
                <span className="text-sm text-muted bg-panel-2/30 px-3 py-1 rounded-full">
                  {exp.period}
                </span>
              </div>
              <p className="text-sm text-muted leading-relaxed mb-3">
                {exp.impact}
              </p>
              {exp.skills && (
                <div className="flex flex-wrap gap-2">
                  {exp.skills.map((skill, skillIndex) => (
                    <span key={skillIndex} className="text-xs bg-acc-1/10 text-acc-1 px-2 py-1 rounded-md">
                      {skill}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
));

ExperienceSection.displayName = 'ExperienceSection';

export const HackathonsSection = React.forwardRef(({ content }, ref) => (
  <section ref={ref} id="hackathons" className="section">
    <div className="portfolio-container">
      <div className="glass-card section-content animate-slide-up">
        <h2 className="heading-xl mb-8 text-acc-1 font-display flex items-center">
          <Trophy className="inline w-8 h-8 mr-4" />
          Hackathons & Sprints
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {content.hackathons.map((hackathon, index) => (
            <div key={index} className="glass-card p-6 group">
              <div className="flex items-start justify-between mb-4">
                <h3 className="heading-md text-acc-1 mb-2 font-display group-hover:text-acc-2 transition-colors">
                  {hackathon.name}
                </h3>
                <span className="text-xs bg-ok/20 text-ok px-2 py-1 rounded-full font-medium">
                  {hackathon.year}
                </span>
              </div>
              
              <div className="space-y-3">
                <p className="text-sm text-acc-2 font-medium flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  {hackathon.duration} sprint • {hackathon.shipped}
                </p>
                
                {hackathon.achievement && (
                  <p className="text-sm text-ok flex items-center">
                    <Star className="w-4 h-4 mr-2" />
                    {hackathon.achievement}
                  </p>
                )}
                
                <p className="text-sm text-muted leading-relaxed">
                  <strong className="text-ink">Lesson:</strong> {hackathon.lesson}
                </p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-8">
          <a 
            href="mailto:abhishekollurii@gmail.com?subject=Sprint Team Collaboration&body=Hi Abhi,%0A%0AI'd like to discuss bringing you onto our hackathon/sprint team..."
            className="cta-secondary px-6 py-3 group"
          >
            <Trophy className="inline w-4 h-4 mr-2 group-hover:rotate-12 transition-transform" />
            Book me for your sprint team
          </a>
        </div>
      </div>
    </div>
  </section>
));

HackathonsSection.displayName = 'HackathonsSection';

export const CertificationsSection = React.forwardRef(({ content }, ref) => (
  <section ref={ref} id="certifications" className="section">
    <div className="portfolio-container">
      <div className="glass-card section-content animate-slide-up">
        <h2 className="heading-xl mb-8 text-acc-1 font-display flex items-center">
          <GraduationCap className="inline w-8 h-8 mr-4" />
          Certifications & Education
        </h2>
        
        {/* Certifications */}
        <div className="mb-8">
          <h3 className="heading-lg mb-6 font-display">Professional Certifications</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {content.certs.map((cert, index) => (
              <div key={index} className="group relative overflow-hidden bg-glass-bg/50 backdrop-blur-xl border border-glass-border rounded-xl p-4 transition-all hover:border-acc-2 hover:shadow-lg hover:shadow-acc-2/20 hover:scale-105">
                {/* Certificate Background Image */}
                {cert.image && (
                  <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity">
                    <img 
                      src={cert.image} 
                      alt={cert.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-panel via-transparent to-transparent"></div>
                  </div>
                )}
                
                {/* Content */}
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-3">
                    <Award className="w-6 h-6 text-acc-2 group-hover:text-acc-1 transition-colors flex-shrink-0" />
                    {cert.count && (
                      <span className="bg-acc-2/20 text-acc-2 px-2 py-1 rounded-full text-xs font-semibold">
                        ×{cert.count}
                      </span>
                    )}
                  </div>
                  
                  <h4 className="font-semibold text-ink group-hover:text-acc-1 transition-colors mb-2 text-sm leading-snug">
                    {cert.name || cert}
                  </h4>
                  
                  <div className="space-y-1 text-xs text-muted">
                    {cert.issuer && (
                      <p className="flex items-center">
                        <span className="w-1 h-1 bg-acc-2 rounded-full mr-2"></span>
                        {cert.issuer}
                      </p>
                    )}
                    {cert.year && (
                      <p className="flex items-center">
                        <span className="w-1 h-1 bg-acc-1 rounded-full mr-2"></span>
                        {cert.year}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Education */}
        <div className="glass-card p-6 border-2 border-glass-border/30">
          <h3 className="heading-lg text-acc-1 mb-2 font-display">
            {content.education.school}
          </h3>
          <p className="text-base text-muted mb-2">
            {content.education.degree} • {content.education.years}
          </p>
          <p className="text-sm text-ink mb-3">
            📍 {content.education.location}
          </p>
          <div className="flex items-center gap-4 text-sm">
            <span className="bg-ok/20 text-ok px-3 py-1 rounded-full">
              GPA: {content.education.gpa}
            </span>
            <span className="text-muted">
              Focus: {content.education.focus}
            </span>
          </div>
        </div>
      </div>
    </div>
  </section>
));

CertificationsSection.displayName = 'CertificationsSection';

export const ContactSection = React.forwardRef(({ content }, ref) => (
  <section ref={ref} id="contact" className="section">
    <div className="portfolio-container">
      <div className="glass-card section-content animate-slide-up">
        <h2 className="heading-xl mb-8 text-acc-1 font-display flex items-center">
          <Mail className="inline w-8 h-8 mr-4" />
          Contact & Mini-FAQ
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Contact Info */}
          <div>
            <h3 className="heading-lg mb-6 font-display">Get in Touch</h3>
            
            <div className="space-y-4 mb-6">
              <div className="flex items-center p-4 bg-glass-bg/30 rounded-xl border border-glass-border/20 group">
                <Mail className="w-5 h-5 mr-4 text-acc-1 group-hover:rotate-12 transition-transform" />
                <div>
                  <p className="text-sm text-muted">Email</p>
                  <a href={`mailto:${content.contact.email}`} className="text-base text-acc-1 hover:text-acc-2 transition-colors">
                    {content.contact.email}
                  </a>
                </div>
              </div>
              
              <div className="flex items-center p-4 bg-glass-bg/30 rounded-xl border border-glass-border/20">
                <Phone className="w-5 h-5 mr-4 text-acc-1" />
                <div>
                  <p className="text-sm text-muted">Phone</p>
                  <p className="text-base text-ink">{content.contact.phone}</p>
                </div>
              </div>
              
              <div className="flex items-center p-4 bg-glass-bg/30 rounded-xl border border-glass-border/20">
                <MapPin className="w-5 h-5 mr-4 text-acc-1" />
                <div>
                  <p className="text-sm text-muted">Location</p>
                  <p className="text-base text-ink">{content.contact.city}</p>
                </div>
              </div>
              
              <div className="flex items-center p-4 bg-glass-bg/30 rounded-xl border border-glass-border/20">
                <Clock className="w-5 h-5 mr-4 text-acc-1" />
                <div>
                  <p className="text-sm text-muted">Timezone & Response</p>
                  <p className="text-base text-ink">{content.contact.timezone} • {content.contact.response_time}</p>
                </div>
              </div>
            </div>
            
            {/* Social Links */}
            <div className="flex gap-4">
              <a 
                href={content.contact.github} 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-12 h-12 bg-glass-bg backdrop-blur-xl border border-glass-border hover:border-acc-1 rounded-xl flex items-center justify-center transition-all hover:scale-110 hover:shadow-lg hover:shadow-acc-1/25 group"
                aria-label="GitHub Profile"
              >
                <Github className="w-6 h-6 text-ink group-hover:text-acc-1 transition-colors" />
              </a>
              
              <a 
                href={content.contact.linkedin} 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-12 h-12 bg-glass-bg backdrop-blur-xl border border-glass-border hover:border-acc-1 rounded-xl flex items-center justify-center transition-all hover:scale-110 hover:shadow-lg hover:shadow-acc-1/25 group"
                aria-label="LinkedIn Profile"
              >
                <Linkedin className="w-6 h-6 text-ink group-hover:text-acc-1 transition-colors" />
              </a>
            </div>
          </div>
          
          {/* Mini FAQ */}
          <div>
            <h3 className="heading-lg mb-6 font-display">Mini-FAQ</h3>
            
            <div className="space-y-4">
              <div className="p-4 bg-panel-2/30 rounded-xl border border-glass-border/20">
                <h4 className="text-base font-semibold mb-2 text-acc-1">
                  How quickly can you start?
                </h4>
                <p className="text-sm text-muted">
                  Usually within 24 hours for new projects. I maintain a lean schedule to ensure quick turnaround.
                </p>
              </div>
              
              <div className="p-4 bg-panel-2/30 rounded-xl border border-glass-border/20">
                <h4 className="text-base font-semibold mb-2 text-acc-1">
                  Code ownership & handoff?
                </h4>
                <p className="text-sm text-muted">
                  Complete handoff — you own all code, repositories, documentation, and deployment credentials. Clean, commented code included.
                </p>
              </div>
              
              <div className="p-4 bg-panel-2/30 rounded-xl border border-glass-border/20">
                <h4 className="text-base font-semibold mb-2 text-acc-1">
                  Typical project timeline?
                </h4>
                <p className="text-sm text-muted">
                  MVPs: 1 day • Landing pages: 2-3 days • Full-stack apps: 3-5 days • Complex AI integrations: 1-2 weeks
                </p>
              </div>
              
              <div className="p-4 bg-panel-2/30 rounded-xl border border-glass-border/20">
                <h4 className="text-base font-semibold mb-2 text-acc-1">
                  Pricing transparency?
                </h4>
                <p className="text-sm text-muted">
                  ₹3K for simple automations up to ₹30K+ for full AI platforms. Fixed-price preferred, hourly available.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
));

ContactSection.displayName = 'ContactSection';

export const Footer = React.forwardRef(({ content, isEditMode, saveContent, exportJSON }, ref) => (
  <footer ref={ref} className="section border-t border-glass-border/30 bg-panel/50">
    <div className="portfolio-container">
      <div className="text-center py-8">
        <p className="text-lg text-acc-1 font-semibold mb-2 font-display">
          "{content.meta?.footer_oath || 'Less talk. More shipping.'}"
        </p>
        <p className="text-sm text-muted mb-4">
          © 2024 Abhishek Kolluri • Built with React & FastAPI • Deployed fast • Last updated: {content.meta?.last_updated || 'Today'}
        </p>
        
        {isEditMode && (
          <div className="flex justify-center gap-4 mt-6">
            <button onClick={saveContent} className="cta-secondary px-4 py-2 text-sm group">
              <Download className="inline w-4 h-4 mr-2 group-hover:translate-y-1 transition-transform" />
              Save Content
            </button>
            <button onClick={exportJSON} className="cta-secondary px-4 py-2 text-sm group">
              <Download className="inline w-4 h-4 mr-2 group-hover:translate-y-1 transition-transform" />
              Export JSON
            </button>
          </div>
        )}
        
        <p className="text-xs text-muted mt-4 opacity-60">
          {content.meta.value_prop}
        </p>
      </div>
    </div>
  </footer>
));

Footer.displayName = 'Footer';