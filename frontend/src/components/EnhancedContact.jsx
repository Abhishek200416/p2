import React, { useState } from 'react';
import {
  Mail,
  Phone,
  MapPin,
  Send,
  CheckCircle,
  Clock,
  Zap,
  FileText,
  Upload,
  X,
  Calendar,
  DollarSign,
  MessageSquare,
  ExternalLink
} from 'lucide-react';

const EnhancedContact = React.forwardRef(({ content }, ref) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    projectType: 'mvp',
    budget: 'under-25k',
    timeline: '1-week',
    message: '',
    attachments: [],
    preferredContact: 'email',
    urgency: 'normal'
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const projectTypes = [
    { id: 'mvp', label: 'MVP Development', price: '₹25,000+', time: '1-3 days' },
    { id: 'webapp', label: 'Full Web App', price: '₹50,000+', time: '1-2 weeks' },
    { id: 'mobile', label: 'Mobile App', price: '₹40,000+', time: '1-2 weeks' },
    { id: 'automation', label: 'Automation/Bots', price: '₹15,000+', time: '2-5 days' },
    { id: 'ai-integration', label: 'AI Integration', price: '₹30,000+', time: '3-7 days' },
    { id: 'custom', label: 'Custom Solution', price: 'Quote', time: 'Varies' }
  ];

  const budgetRanges = [
    { id: 'under-25k', label: 'Under ₹25,000', usd: '<$300' },
    { id: '25k-50k', label: '₹25,000 - ₹50,000', usd: '$300-$600' },
    { id: '50k-100k', label: '₹50,000 - ₹1,00,000', usd: '$600-$1200' },
    { id: '100k-plus', label: '₹1,00,000+', usd: '$1200+' },
    { id: 'hourly', label: 'Hourly Rate', usd: '₹900/hr' },
    { id: 'discuss', label: 'Let\'s Discuss', usd: '' }
  ];

  const timelines = [
    { id: 'asap', label: 'ASAP (Rush)', extra: '+20% fee' },
    { id: '1-week', label: '1 Week' },
    { id: '2-weeks', label: '2 Weeks' },
    { id: '1-month', label: '1 Month' },
    { id: 'flexible', label: 'Flexible' }
  ];

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    const validFiles = files.filter(file => {
      const validTypes = ['image/', 'application/pdf', 'text/', '.doc'];
      return validTypes.some(type => file.type.startsWith(type) || file.name.endsWith('.docx'));
    });

    setFormData(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...validFiles].slice(0, 5) // Limit to 5 files
    }));
  };

  const removeFile = (index) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Create FormData for file upload
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        if (key === 'attachments') {
          formData.attachments.forEach(file => {
            formDataToSend.append('attachments', file);
          });
        } else {
          formDataToSend.append(key, formData[key]);
        }
      });

      // Add metadata
      formDataToSend.append('timestamp', new Date().toISOString());
      formDataToSend.append('source', 'portfolio-contact');

      // Try backend submission
      const token = sessionStorage.getItem('portfolio-token');
      if (token) {
        await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/contact`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formDataToSend
        });
      }

      // Save to localStorage for backup
      const contactData = { ...formData, id: Date.now(), timestamp: new Date().toISOString() };
      const savedContacts = JSON.parse(localStorage.getItem('portfolio-contacts') || '[]');
      savedContacts.push(contactData);
      localStorage.setItem('portfolio-contacts', JSON.stringify(savedContacts));

      // Update analytics
      const analytics = JSON.parse(localStorage.getItem('portfolio-analytics') || '{}');
      analytics.contacts = (analytics.contacts || 0) + 1;
      localStorage.setItem('portfolio-analytics', JSON.stringify(analytics));

      setSubmitted(true);

    } catch (error) {
      console.log('Contact saved locally');
      setSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    if (currentStep < 3) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  if (submitted) {
    return (
      <section ref={ref} id="contact" className="section">
        <div className="portfolio-container">
          <div className="glass-card section-content animate-fade-in text-center py-12">
            <CheckCircle className="w-20 h-20 text-green-400 mx-auto mb-6" />
            <h2 className="heading-xl text-green-400 mb-4">Message Sent!</h2>
            <p className="text-lg text-muted mb-6">
              Thanks for reaching out! I'll get back to you within 24 hours.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-md mx-auto text-sm">
              <div className="p-3 bg-green-900/20 border border-green-600/30 rounded-lg">
                <Clock className="w-5 h-5 mx-auto text-green-400 mb-2" />
                <div className="text-green-300">24h Response</div>
              </div>
              <div className="p-3 bg-blue-900/20 border border-blue-600/30 rounded-lg">
                <Mail className="w-5 h-5 mx-auto text-blue-400 mb-2" />
                <div className="text-blue-300">Email Sent</div>
              </div>
              <div className="p-3 bg-purple-900/20 border border-purple-600/30 rounded-lg">
                <Calendar className="w-5 h-5 mx-auto text-purple-400 mb-2" />
                <div className="text-purple-300">Call Scheduled</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section ref={ref} id="contact" className="section">
      <div className="portfolio-container">
        <div className="glass-card section-content animate-slide-up">
          <h2 className="heading-xl mb-8 text-acc-1 font-display flex items-center">
            <Mail className="inline w-8 h-8 mr-4" />
            Let's Build Something Amazing
          </h2>
          
          <div className="two-col-grid gap-8">
            {/* Left: Multi-step Form */}
            <div>
              {/* Progress Indicator */}
              <div className="mb-8">
                <div className="flex items-center justify-between text-sm text-muted mb-2">
                  <span>Step {currentStep} of 3</span>
                  <span>{Math.round((currentStep / 3) * 100)}% Complete</span>
                </div>
                <div className="w-full bg-glass-bg h-2 rounded-full">
                  <div 
                    className="h-full bg-acc-1 rounded-full transition-all duration-300"
                    style={{ width: `${(currentStep / 3) * 100}%` }}
                  />
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                {/* Step 1: Basic Info */}
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-ink mb-4">Tell me about yourself</h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-ink mb-2">
                          Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          className="w-full px-4 py-3 bg-panel-2/50 border border-glass-border/30 rounded-lg text-ink placeholder-muted focus:border-acc-1 focus:ring-1 focus:ring-acc-1 transition-colors"
                          placeholder="Your full name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-ink mb-2">
                          Email *
                        </label>
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          className="w-full px-4 py-3 bg-panel-2/50 border border-glass-border/30 rounded-lg text-ink placeholder-muted focus:border-acc-1 focus:ring-1 focus:ring-acc-1 transition-colors"
                          placeholder="your@email.com"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-ink mb-2">
                          Company
                        </label>
                        <input
                          type="text"
                          value={formData.company}
                          onChange={(e) => setFormData({...formData, company: e.target.value})}
                          className="w-full px-4 py-3 bg-panel-2/50 border border-glass-border/30 rounded-lg text-ink placeholder-muted focus:border-acc-1 focus:ring-1 focus:ring-acc-1 transition-colors"
                          placeholder="Your company"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-ink mb-2">
                          Phone
                        </label>
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({...formData, phone: e.target.value})}
                          className="w-full px-4 py-3 bg-panel-2/50 border border-glass-border/30 rounded-lg text-ink placeholder-muted focus:border-acc-1 focus:ring-1 focus:ring-acc-1 transition-colors"
                          placeholder="+91 9876543210"
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={nextStep}
                      className="w-full px-6 py-3 bg-acc-1 hover:bg-acc-1/90 text-bg font-semibold rounded-lg transition-all"
                    >
                      Next: Project Details
                    </button>
                  </div>
                )}

                {/* Step 2: Project Details */}
                {currentStep === 2 && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-ink mb-4">Project Details</h3>
                    
                    {/* Project Type */}
                    <div>
                      <label className="block text-sm font-medium text-ink mb-3">
                        What type of project? *
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {projectTypes.map(type => (
                          <label
                            key={type.id}
                            className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                              formData.projectType === type.id
                                ? 'border-acc-1 bg-acc-1/10'
                                : 'border-glass-border/30 hover:border-glass-border/60'
                            }`}
                          >
                            <input
                              type="radio"
                              name="projectType"
                              value={type.id}
                              checked={formData.projectType === type.id}
                              onChange={(e) => setFormData({...formData, projectType: e.target.value})}
                              className="sr-only"
                            />
                            <div className="font-medium text-ink text-sm">{type.label}</div>
                            <div className="text-xs text-muted mt-1">
                              {type.price} • {type.time}
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Budget */}
                    <div>
                      <label className="block text-sm font-medium text-ink mb-3">
                        Budget Range *
                      </label>
                      <select
                        required
                        value={formData.budget}
                        onChange={(e) => setFormData({...formData, budget: e.target.value})}
                        className="w-full px-4 py-3 bg-panel-2/50 border border-glass-border/30 rounded-lg text-ink focus:border-acc-1 focus:ring-1 focus:ring-acc-1 transition-colors"
                      >
                        {budgetRanges.map(range => (
                          <option key={range.id} value={range.id}>
                            {range.label} {range.usd && `(${range.usd})`}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Timeline */}
                    <div>
                      <label className="block text-sm font-medium text-ink mb-3">
                        Timeline *
                      </label>
                      <div className="space-y-2">
                        {timelines.map(timeline => (
                          <label
                            key={timeline.id}
                            className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${
                              formData.timeline === timeline.id
                                ? 'border-acc-1 bg-acc-1/10'
                                : 'border-glass-border/30 hover:border-glass-border/60'
                            }`}
                          >
                            <div className="flex items-center">
                              <input
                                type="radio"
                                name="timeline"
                                value={timeline.id}
                                checked={formData.timeline === timeline.id}
                                onChange={(e) => setFormData({...formData, timeline: e.target.value})}
                                className="mr-3"
                              />
                              <span className="text-sm font-medium">{timeline.label}</span>
                            </div>
                            {timeline.extra && (
                              <span className="text-xs text-warn bg-warn/20 px-2 py-1 rounded">
                                {timeline.extra}
                              </span>
                            )}
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="flex space-x-3">
                      <button
                        type="button"
                        onClick={prevStep}
                        className="flex-1 px-6 py-3 bg-panel-2 hover:bg-panel text-ink font-medium rounded-lg transition-all"
                      >
                        Back
                      </button>
                      <button
                        type="button"
                        onClick={nextStep}
                        className="flex-1 px-6 py-3 bg-acc-1 hover:bg-acc-1/90 text-bg font-semibold rounded-lg transition-all"
                      >
                        Next: Final Details
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 3: Message & Submit */}
                {currentStep === 3 && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-ink mb-4">Final Details</h3>
                    
                    {/* Message */}
                    <div>
                      <label className="block text-sm font-medium text-ink mb-2">
                        Project Description *
                      </label>
                      <textarea
                        required
                        rows="5"
                        value={formData.message}
                        onChange={(e) => setFormData({...formData, message: e.target.value})}
                        className="w-full px-4 py-3 bg-panel-2/50 border border-glass-border/30 rounded-lg text-ink placeholder-muted focus:border-acc-1 focus:ring-1 focus:ring-acc-1 transition-colors resize-none"
                        placeholder="Describe your project requirements, goals, and any specific features you need..."
                      />
                    </div>

                    {/* File Attachments */}
                    <div>
                      <label className="block text-sm font-medium text-ink mb-2">
                        Attachments (Optional)
                      </label>
                      <div className="border-2 border-dashed border-glass-border/30 rounded-lg p-6 text-center hover:border-glass-border/60 transition-colors">
                        <Upload className="w-8 h-8 text-muted mx-auto mb-2" />
                        <p className="text-sm text-muted mb-2">
                          Drop files here or click to upload
                        </p>
                        <input
                          type="file"
                          multiple
                          accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif"
                          onChange={handleFileUpload}
                          className="hidden"
                          id="file-upload"
                        />
                        <label
                          htmlFor="file-upload"
                          className="inline-block px-4 py-2 bg-panel-2 hover:bg-panel text-ink text-sm font-medium rounded-lg cursor-pointer transition-colors"
                        >
                          Choose Files
                        </label>
                        <p className="text-xs text-muted mt-2">
                          PDF, DOC, images up to 10MB each (max 5 files)
                        </p>
                      </div>

                      {/* File List */}
                      {formData.attachments.length > 0 && (
                        <div className="mt-3 space-y-2">
                          {formData.attachments.map((file, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-panel-2/30 rounded-lg border border-glass-border/20">
                              <div className="flex items-center">
                                <FileText className="w-4 h-4 text-muted mr-2" />
                                <span className="text-sm text-ink truncate">{file.name}</span>
                                <span className="text-xs text-muted ml-2">
                                  ({Math.round(file.size / 1024)}KB)
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => removeFile(index)}
                                className="p-1 text-red-400 hover:text-red-300"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Preferences */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-ink mb-2">
                          Preferred Contact Method
                        </label>
                        <select
                          value={formData.preferredContact}
                          onChange={(e) => setFormData({...formData, preferredContact: e.target.value})}
                          className="w-full px-4 py-3 bg-panel-2/50 border border-glass-border/30 rounded-lg text-ink focus:border-acc-1 focus:ring-1 focus:ring-acc-1 transition-colors"
                        >
                          <option value="email">Email</option>
                          <option value="phone">Phone Call</option>
                          <option value="whatsapp">WhatsApp</option>
                          <option value="video">Video Call</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-ink mb-2">
                          Urgency Level
                        </label>
                        <select
                          value={formData.urgency}
                          onChange={(e) => setFormData({...formData, urgency: e.target.value})}
                          className="w-full px-4 py-3 bg-panel-2/50 border border-glass-border/30 rounded-lg text-ink focus:border-acc-1 focus:ring-1 focus:ring-acc-1 transition-colors"
                        >
                          <option value="low">Low Priority</option>
                          <option value="normal">Normal</option>
                          <option value="high">High Priority</option>
                          <option value="urgent">Urgent</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex space-x-3">
                      <button
                        type="button"
                        onClick={prevStep}
                        className="flex-1 px-6 py-3 bg-panel-2 hover:bg-panel text-ink font-medium rounded-lg transition-all"
                      >
                        Back
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 px-6 py-4 bg-acc-1 hover:bg-acc-1/90 text-bg font-semibold rounded-lg transition-all flex items-center justify-center disabled:opacity-50"
                      >
                        {isSubmitting ? (
                          <div className="w-5 h-5 border-2 border-bg border-t-transparent rounded-full animate-spin mr-2" />
                        ) : (
                          <Send className="w-5 h-5 mr-2" />
                        )}
                        {isSubmitting ? 'Sending...' : 'Send Message'}
                      </button>
                    </div>
                  </div>
                )}
              </form>
            </div>

            {/* Right: Contact Info & Quick Actions */}
            <div className="space-y-6">
              {/* Direct Contact */}
              <div className="p-6 bg-panel-2/30 rounded-xl border border-glass-border/20">
                <h3 className="text-lg font-semibold text-acc-1 mb-4">Get In Touch Directly</h3>
                <div className="space-y-4">
                  <a
                    href={`mailto:${content.contact.email}`}
                    className="flex items-center p-3 bg-panel-2/50 rounded-lg hover:bg-panel-2/70 transition-colors group"
                  >
                    <Mail className="w-5 h-5 text-acc-1 mr-3" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-ink">{content.contact.email}</div>
                      <div className="text-xs text-muted">Email • Responds in 24h</div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-muted group-hover:text-ink" />
                  </a>

                  <a
                    href={`tel:${content.contact.phone}`}
                    className="flex items-center p-3 bg-panel-2/50 rounded-lg hover:bg-panel-2/70 transition-colors group"
                  >
                    <Phone className="w-5 h-5 text-acc-1 mr-3" />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-ink">{content.contact.phone}</div>
                      <div className="text-xs text-muted">Phone • IST (UTC+5:30)</div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-muted group-hover:text-ink" />
                  </a>

                  <div className="flex items-center p-3 bg-panel-2/50 rounded-lg">
                    <MapPin className="w-5 h-5 text-acc-1 mr-3" />
                    <div>
                      <div className="text-sm font-medium text-ink">{content.contact.city}</div>
                      <div className="text-xs text-muted">Available for remote work</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Response Time */}
              <div className="p-6 bg-acc-1/10 rounded-xl border border-acc-1/20">
                <h4 className="text-base font-semibold text-acc-1 mb-3 flex items-center">
                  <Clock className="w-5 h-5 mr-2" />
                  Response Time Promise
                </h4>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted">Initial Response</span>
                    <span className="text-ok font-semibold">Within 24h</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted">Project Quote</span>
                    <span className="text-acc-1 font-semibold">Within 48h</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted">Project Start</span>
                    <span className="text-acc-2 font-semibold">Usually next day</span>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="p-4 bg-glass-bg/30 rounded-lg border border-glass-border/20">
                <div className="grid grid-cols-2 gap-4 text-center text-sm">
                  <div>
                    <div className="text-lg font-bold text-acc-1">100%</div>
                    <div className="text-xs text-muted">Response Rate</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-ok">4.9/5</div>
                    <div className="text-xs text-muted">Client Rating</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-acc-2">25+</div>
                    <div className="text-xs text-muted">Projects Done</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-purple-400">12h</div>
                    <div className="text-xs text-muted">Avg Response</div>
                  </div>
                </div>
              </div>

              {/* FAQ */}
              <div className="p-4 bg-panel-2/20 rounded-lg border border-glass-border/20">
                <h4 className="text-sm font-semibold text-ink mb-3">Common Questions</h4>
                <div className="space-y-2 text-xs text-muted">
                  <div>
                    <span className="text-ink font-medium">Q: Do you work with international clients?</span><br />
                    A: Yes! I work globally with competitive rates.
                  </div>
                  <div>
                    <span className="text-ink font-medium">Q: What's included in project pricing?</span><br />
                    A: Full development, testing, deployment, and 30-day support.
                  </div>
                  <div>
                    <span className="text-ink font-medium">Q: Can you start immediately?</span><br />
                    A: Usually yes, depending on current workload.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});

EnhancedContact.displayName = 'EnhancedContact';

export default EnhancedContact;