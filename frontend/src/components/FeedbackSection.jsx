import React, { useState } from 'react';
import { MessageSquare, Send, Star, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '../hooks/use-toast';

const FeedbackSection = ({ content }) => {
  const [feedback, setFeedback] = useState({
    name: '',
    email: '',
    rating: 5,
    message: '',
    type: 'general'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  const feedbackTypes = [
    { value: 'general', label: 'General Feedback', icon: MessageSquare },
    { value: 'project', label: 'Project Inquiry', icon: CheckCircle },
    { value: 'hiring', label: 'Hiring/Collaboration', icon: Star },
    { value: 'improvement', label: 'Suggestion', icon: AlertCircle }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!feedback.name || !feedback.email || !feedback.message) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Save to localStorage
      const savedFeedback = JSON.parse(localStorage.getItem('portfolio-feedback') || '[]');
      const newFeedback = {
        ...feedback,
        timestamp: new Date().toISOString(),
        id: Date.now()
      };
      savedFeedback.push(newFeedback);
      localStorage.setItem('portfolio-feedback', JSON.stringify(savedFeedback));

      // Try to send to backend if available
      const token = sessionStorage.getItem('portfolio-token');
      if (token) {
        try {
          const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/feedback`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(newFeedback)
          });
          
          if (response.ok) {
            toast({
              title: "Feedback Sent! 🎉",
              description: "Thank you for your feedback. I'll get back to you soon!",
            });
          }
        } catch (backendError) {
          // Fallback to email
          const emailSubject = `Portfolio Feedback: ${feedback.type}`;
          const emailBody = `Name: ${feedback.name}
Email: ${feedback.email}
Rating: ${feedback.rating}/5 stars
Type: ${feedback.type}
Message: ${feedback.message}`;
          
          window.open(`mailto:abhishekollurii@gmail.com?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`);
        }
      } else {
        // Email fallback
        const emailSubject = `Portfolio Feedback: ${feedback.type}`;
        const emailBody = `Name: ${feedback.name}
Email: ${feedback.email}
Rating: ${feedback.rating}/5 stars
Type: ${feedback.type}
Message: ${feedback.message}`;
        
        window.open(`mailto:abhishekollurii@gmail.com?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`);
      }

      setSubmitted(true);
      toast({
        title: "Feedback Recorded! 📝",
        description: "Your feedback has been saved. Email client opened for direct contact.",
      });
      
      // Reset form after success
      setTimeout(() => {
        setFeedback({
          name: '',
          email: '',
          rating: 5,
          message: '',
          type: 'general'
        });
        setSubmitted(false);
      }, 3000);

    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again or contact directly via email.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFeedback(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (submitted) {
    return (
      <section id="feedback" className="section">
        <div className="portfolio-container">
          <div className="glass-card section-content animate-slide-up text-center">
            <div className="mb-6">
              <CheckCircle className="w-16 h-16 mx-auto text-ok mb-4" />
              <h2 className="heading-xl mb-4 text-ok font-display">
                Thank You! 🎉
              </h2>
              <p className="text-lg text-muted mb-6">
                Your feedback has been received. I appreciate you taking the time to share your thoughts!
              </p>
              <p className="text-sm text-muted">
                I'll review your message and get back to you within 24 hours.
              </p>
            </div>
            
            <div className="flex justify-center gap-4 flex-wrap">
              <a 
                href="mailto:abhishekollurii@gmail.com"
                className="cta-secondary px-6 py-3"
              >
                Email Directly
              </a>
              <button 
                onClick={() => setSubmitted(false)}
                className="cta-primary px-6 py-3"
              >
                Send Another Message
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="feedback" className="section">
      <div className="portfolio-container">
        <div className="glass-card section-content animate-slide-up">
          <h2 className="heading-xl mb-4 text-acc-1 font-display flex items-center">
            <MessageSquare className="inline w-8 h-8 mr-4" />
            Share Your Thoughts
          </h2>
          <p className="heading-md text-muted mb-8 font-display">
            Got feedback, a project idea, or just want to connect? I'd love to hear from you!
          </p>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Feedback Type Selection */}
            <div>
              <label className="block text-sm font-semibold mb-3 text-ink">
                What's this about? *
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {feedbackTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => handleInputChange('type', type.value)}
                      className={`p-4 rounded-xl border-2 transition-all text-left ${
                        feedback.type === type.value
                          ? 'border-acc-1 bg-acc-1/10 text-acc-1'
                          : 'border-glass-border bg-glass-bg text-muted hover:border-acc-1/50'
                      }`}
                    >
                      <Icon className="w-5 h-5 mb-2" />
                      <div className="text-sm font-medium">{type.label}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Personal Info */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold mb-2 text-ink">
                  Your Name *
                </label>
                <input
                  type="text"
                  value={feedback.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full p-4 bg-panel-2/50 border border-glass-border rounded-xl text-ink placeholder-muted focus:border-acc-1 focus:ring-1 focus:ring-acc-1 transition-colors"
                  placeholder="John Doe"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2 text-ink">
                  Your Email *
                </label>
                <input
                  type="email"
                  value={feedback.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full p-4 bg-panel-2/50 border border-glass-border rounded-xl text-ink placeholder-muted focus:border-acc-1 focus:ring-1 focus:ring-acc-1 transition-colors"
                  placeholder="john@example.com"
                  required
                />
              </div>
            </div>

            {/* Rating */}
            <div>
              <label className="block text-sm font-semibold mb-3 text-ink">
                Rate this portfolio experience
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => handleInputChange('rating', star)}
                    className="transition-colors"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        star <= feedback.rating
                          ? 'fill-acc-2 text-acc-2'
                          : 'text-muted hover:text-acc-2'
                      }`}
                    />
                  </button>
                ))}
                <span className="ml-3 text-sm text-muted">
                  {feedback.rating}/5 stars
                </span>
              </div>
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-ink">
                Your Message *
              </label>
              <textarea
                value={feedback.message}
                onChange={(e) => handleInputChange('message', e.target.value)}
                rows={5}
                className="w-full p-4 bg-panel-2/50 border border-glass-border rounded-xl text-ink placeholder-muted focus:border-acc-1 focus:ring-1 focus:ring-acc-1 transition-colors resize-vertical"
                placeholder="Share your thoughts, project ideas, or any questions you might have..."
                required
              />
              <div className="text-xs text-muted mt-2">
                {feedback.message.length}/500 characters
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="cta-primary flex-1 min-h-[3rem] flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-bg border-t-transparent rounded-full animate-spin"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Send Feedback
                  </>
                )}
              </button>
              
              <a
                href="mailto:abhishekollurii@gmail.com"
                className="cta-secondary flex-1 min-h-[3rem] flex items-center justify-center gap-3"
              >
                Email Directly
              </a>
            </div>
          </form>

          {/* Quick Contact Info */}
          <div className="mt-8 pt-8 border-t border-glass-border/30">
            <div className="grid md:grid-cols-3 gap-4 text-sm text-muted">
              <div className="text-center">
                <div className="font-semibold text-ink mb-1">Response Time</div>
                <div>Usually within 24 hours</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-ink mb-1">Project Availability</div>
                <div>Available for freelance work</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-ink mb-1">Timezone</div>
                <div>IST (UTC+5:30)</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeedbackSection;