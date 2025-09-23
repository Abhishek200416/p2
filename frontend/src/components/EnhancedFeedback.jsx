import React, { useState } from 'react';
import { 
  MessageSquare, 
  Star, 
  Send, 
  CheckCircle, 
  User, 
  Mail, 
  Briefcase,
  MessageCircle,
  ThumbsUp,
  ThumbsDown,
  Heart,
  Zap,
  Target
} from 'lucide-react';

const EnhancedFeedback = ({ content }) => {
  const [feedback, setFeedback] = useState({
    name: '',
    email: '',
    company: '',
    category: 'general',
    rating: 5,
    message: '',
    wouldRecommend: true,
    contactBack: false
  });
  
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
    { id: 'general', label: 'General Feedback', icon: MessageCircle, color: 'blue' },
    { id: 'project', label: 'Project Inquiry', icon: Briefcase, color: 'green' },
    { id: 'collaboration', label: 'Collaboration', icon: Target, color: 'purple' },
    { id: 'hiring', label: 'Hiring', icon: User, color: 'orange' },
    { id: 'improvement', label: 'Suggestions', icon: Zap, color: 'yellow' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Save to localStorage for analytics
      const savedFeedback = JSON.parse(localStorage.getItem('portfolio-feedback') || '[]');
      const newFeedback = {
        ...feedback,
        id: Date.now(),
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href
      };
      savedFeedback.push(newFeedback);
      localStorage.setItem('portfolio-feedback', JSON.stringify(savedFeedback));

      // Try to send to backend if available
      const token = sessionStorage.getItem('portfolio-token');
      if (token) {
        await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/feedback`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(newFeedback)
        });
      }

      // Update analytics
      const analytics = JSON.parse(localStorage.getItem('portfolio-analytics') || '{}');
      analytics.feedback = (analytics.feedback || 0) + 1;
      localStorage.setItem('portfolio-analytics', JSON.stringify(analytics));

      setSubmitted(true);
      
      // Reset form after delay
      setTimeout(() => {
        setSubmitted(false);
        setFeedback({
          name: '',
          email: '',
          company: '',
          category: 'general',
          rating: 5,
          message: '',
          wouldRecommend: true,
          contactBack: false
        });
      }, 3000);

    } catch (error) {
      console.log('Feedback saved locally');
    } finally {
      setIsSubmitting(false);
    }
  };

  const StarRating = ({ rating, onRatingChange, readonly = false }) => (
    <div className="flex space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => !readonly && onRatingChange(star)}
          className={`w-8 h-8 ${
            readonly 
              ? 'cursor-default' 
              : 'cursor-pointer hover:scale-110 transition-transform'
          }`}
        >
          <Star
            className={`w-full h-full ${
              star <= rating
                ? 'text-yellow-400 fill-current'
                : 'text-gray-600'
            }`}
          />
        </button>
      ))}
    </div>
  );

  if (submitted) {
    return (
      <section id="feedback" className="section">
        <div className="portfolio-container">
          <div className="glass-card section-content animate-fade-in text-center py-12">
            <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-6" />
            <h2 className="heading-xl text-green-400 mb-4">Thank you!</h2>
            <p className="text-lg text-muted mb-6">
              Your feedback has been received and is valuable to me.
            </p>
            <div className="flex items-center justify-center space-x-4 text-sm text-muted">
              <span className="flex items-center">
                <Heart className="w-4 h-4 mr-2 text-red-400" />
                Feedback appreciated
              </span>
              <span className="flex items-center">
                <Zap className="w-4 h-4 mr-2 text-yellow-400" />
                Response within 24h
              </span>
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
          <h2 className="heading-xl mb-8 text-acc-1 font-display flex items-center">
            <MessageSquare className="inline w-8 h-8 mr-4" />
            Share Your Thoughts
          </h2>
          
          <div className="two-col-grid gap-8">
            {/* Left: Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Category Selection */}
              <div>
                <label className="block text-sm font-semibold text-ink mb-3">
                  What's this about?
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {categories.map((cat) => {
                    const Icon = cat.icon;
                    return (
                      <label
                        key={cat.id}
                        className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all ${
                          feedback.category === cat.id
                            ? `border-${cat.color}-500 bg-${cat.color}-500/10`
                            : 'border-glass-border/30 hover:border-glass-border/60'
                        }`}
                      >
                        <input
                          type="radio"
                          name="category"
                          value={cat.id}
                          checked={feedback.category === cat.id}
                          onChange={(e) => setFeedback({ ...feedback, category: e.target.value })}
                          className="sr-only"
                        />
                        <Icon className={`w-5 h-5 mr-3 ${
                          feedback.category === cat.id ? `text-${cat.color}-400` : 'text-muted'
                        }`} />
                        <span className="text-sm font-medium">{cat.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Personal Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-ink mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    required
                    value={feedback.name}
                    onChange={(e) => setFeedback({ ...feedback, name: e.target.value })}
                    className="w-full px-4 py-3 bg-panel-2/50 border border-glass-border/30 rounded-lg text-ink placeholder-muted focus:border-acc-1 focus:ring-1 focus:ring-acc-1 transition-colors"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-ink mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={feedback.email}
                    onChange={(e) => setFeedback({ ...feedback, email: e.target.value })}
                    className="w-full px-4 py-3 bg-panel-2/50 border border-glass-border/30 rounded-lg text-ink placeholder-muted focus:border-acc-1 focus:ring-1 focus:ring-acc-1 transition-colors"
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-ink mb-2">
                  Company/Organization <span className="text-muted text-xs">(optional)</span>
                </label>
                <input
                  type="text"
                  value={feedback.company}
                  onChange={(e) => setFeedback({ ...feedback, company: e.target.value })}
                  className="w-full px-4 py-3 bg-panel-2/50 border border-glass-border/30 rounded-lg text-ink placeholder-muted focus:border-acc-1 focus:ring-1 focus:ring-acc-1 transition-colors"
                  placeholder="Your company"
                />
              </div>

              {/* Rating */}
              <div>
                <label className="block text-sm font-semibold text-ink mb-3">
                  How would you rate your experience?
                </label>
                <div className="flex items-center space-x-4">
                  <StarRating
                    rating={feedback.rating}
                    onRatingChange={(rating) => setFeedback({ ...feedback, rating })}
                  />
                  <span className="text-sm text-muted">
                    {feedback.rating === 5 ? 'Excellent!' : 
                     feedback.rating === 4 ? 'Very Good' : 
                     feedback.rating === 3 ? 'Good' : 
                     feedback.rating === 2 ? 'Fair' : 'Poor'}
                  </span>
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-semibold text-ink mb-2">
                  Your message
                </label>
                <textarea
                  required
                  rows="4"
                  value={feedback.message}
                  onChange={(e) => setFeedback({ ...feedback, message: e.target.value })}
                  className="w-full px-4 py-3 bg-panel-2/50 border border-glass-border/30 rounded-lg text-ink placeholder-muted focus:border-acc-1 focus:ring-1 focus:ring-acc-1 transition-colors resize-none"
                  placeholder="Share your thoughts, suggestions, or project ideas..."
                />
              </div>

              {/* Options */}
              <div className="space-y-3">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={feedback.wouldRecommend}
                    onChange={(e) => setFeedback({ ...feedback, wouldRecommend: e.target.checked })}
                    className="w-4 h-4 text-acc-1 bg-panel-2 border-glass-border/30 rounded focus:ring-acc-1"
                  />
                  <span className="text-sm text-ink">I would recommend Abhishek to others</span>
                </label>
                
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={feedback.contactBack}
                    onChange={(e) => setFeedback({ ...feedback, contactBack: e.target.checked })}
                    className="w-4 h-4 text-acc-1 bg-panel-2 border-glass-border/30 rounded focus:ring-acc-1"
                  />
                  <span className="text-sm text-ink">I'd like you to contact me back</span>
                </label>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full px-6 py-4 bg-acc-1 hover:bg-acc-1/90 text-bg font-semibold rounded-lg transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-bg border-t-transparent rounded-full animate-spin mr-2" />
                ) : (
                  <Send className="w-5 h-5 mr-2" />
                )}
                {isSubmitting ? 'Sending...' : 'Send Feedback'}
              </button>
            </form>

            {/* Right: Info */}
            <div className="space-y-6">
              <div className="p-6 bg-panel-2/30 rounded-xl border border-glass-border/20">
                <h3 className="text-lg font-semibold text-acc-1 mb-4 flex items-center">
                  <Target className="w-5 h-5 mr-2" />
                  Why Your Feedback Matters
                </h3>
                <div className="space-y-3 text-sm text-muted">
                  <p className="flex items-start">
                    <CheckCircle className="w-4 h-4 mr-2 text-ok mt-0.5 flex-shrink-0" />
                    Helps me improve my services and portfolio
                  </p>
                  <p className="flex items-start">
                    <CheckCircle className="w-4 h-4 mr-2 text-ok mt-0.5 flex-shrink-0" />
                    Guides future project development
                  </p>
                  <p className="flex items-start">
                    <CheckCircle className="w-4 h-4 mr-2 text-ok mt-0.5 flex-shrink-0" />
                    Builds trust with potential clients
                  </p>
                  <p className="flex items-start">
                    <CheckCircle className="w-4 h-4 mr-2 text-ok mt-0.5 flex-shrink-0" />
                    Creates opportunities for collaboration
                  </p>
                </div>
              </div>

              <div className="p-6 bg-acc-1/10 rounded-xl border border-acc-1/20">
                <h4 className="text-base font-semibold text-acc-1 mb-3 flex items-center">
                  <Zap className="w-4 h-4 mr-2" />
                  Quick Response Promise
                </h4>
                <p className="text-sm text-muted mb-3">
                  I personally read every piece of feedback and respond within 24 hours.
                </p>
                <div className="flex items-center space-x-4 text-xs text-muted">
                  <span className="flex items-center">
                    <Mail className="w-3 h-3 mr-1" />
                    Email response
                  </span>
                  <span className="flex items-center">
                    <MessageCircle className="w-3 h-3 mr-1" />
                    Follow-up chat
                  </span>
                </div>
              </div>

              {/* Previous Feedback Stats */}
              <div className="p-4 bg-glass-bg/30 rounded-lg border border-glass-border/20 text-center">
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="text-lg font-bold text-acc-1">98%</div>
                    <div className="text-xs text-muted">Satisfaction</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-ok">24h</div>
                    <div className="text-xs text-muted">Response</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-acc-2">50+</div>
                    <div className="text-xs text-muted">Reviews</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EnhancedFeedback;