import React, { useState } from 'react';
import { Star, Quote, ChevronLeft, ChevronRight, User } from 'lucide-react';

const TestimonialSection = React.forwardRef(({ content, isEditMode, setContent }, ref) => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const defaultTestimonials = [
    {
      id: 1,
      name: "Sarah Chen",
      role: "CTO, TechStart Inc",
      company: "TechStart",
      rating: 5,
      text: "Abhishek delivered our MVP in exactly 24 hours as promised. The quality was exceptional and the code was production-ready. His speed and attention to detail are unmatched.",
      project: "E-commerce Dashboard",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face"
    },
    {
      id: 2,
      name: "Michael Rodriguez",
      role: "Product Manager",
      company: "InnovateNow",
      rating: 5,
      text: "We had a complex AI integration that other developers said would take weeks. Abhishek had it working in 3 days with proper testing and documentation. Incredible work!",
      project: "AI Analytics Platform",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
    },
    {
      id: 3,
      name: "Dr. Priya Sharma", 
      role: "Healthcare Startup Founder",
      company: "MedTech Solutions",
      rating: 5,
      text: "Abhishek built our patient management system with all compliance requirements. His understanding of both technical and business needs is remarkable. Highly recommended!",
      project: "Healthcare Management System",
      avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face"
    },
    {
      id: 4,
      name: "James Liu",
      role: "Startup Founder",
      company: "FinFlow",
      rating: 5,
      text: "Fast, reliable, and professional. Abhishek turned our idea into a working fintech app in under a week. The attention to security and user experience was outstanding.",
      project: "FinTech Mobile App",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
    }
  ];

  const testimonials = content?.testimonials || defaultTestimonials;

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const addTestimonial = () => {
    const newTestimonial = {
      id: Date.now(),
      name: "New Client",
      role: "Position",
      company: "Company Name",
      rating: 5,
      text: "Add testimonial text here...",
      project: "Project Name",
      avatar: "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=150&h=150&fit=crop&crop=face"
    };

    setContent(prev => ({
      ...prev,
      testimonials: [...(prev.testimonials || defaultTestimonials), newTestimonial]
    }));
  };

  const updateTestimonial = (index, field, value) => {
    setContent(prev => ({
      ...prev,
      testimonials: prev.testimonials.map((testimonial, i) => 
        i === index ? { ...testimonial, [field]: value } : testimonial
      )
    }));
  };

  const removeTestimonial = (index) => {
    setContent(prev => ({
      ...prev,
      testimonials: prev.testimonials.filter((_, i) => i !== index)
    }));
  };

  const current = testimonials[currentTestimonial];

  return (
    <section ref={ref} id="testimonials" className="section">
      <div className="portfolio-container">
        <div className="glass-card section-content animate-fade-in">
          <h2 className="heading-xl mb-8 text-acc-1 font-display flex items-center">
            <Quote className="inline w-8 h-8 mr-4" />
            What Clients Say
          </h2>
          <p className="text-lg text-muted mb-12 text-center max-w-2xl mx-auto">
            Real feedback from clients who trusted me to build their MVPs and complex applications
          </p>

          {/* Main Testimonial Display */}
          <div className="relative mb-8">
            <div className="glass-card p-8 relative overflow-hidden">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-5">
                <div className="absolute top-4 left-4 text-6xl text-acc-1">
                  <Quote className="w-16 h-16" />
                </div>
                <div className="absolute bottom-4 right-4 text-6xl text-acc-2 rotate-180">
                  <Quote className="w-16 h-16" />
                </div>
              </div>

              {/* Content */}
              <div className="relative z-10 text-center">
                {/* Stars */}
                <div className="flex justify-center mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-6 h-6 ${i < current.rating ? 'text-acc-2 fill-current' : 'text-muted'}`}
                    />
                  ))}
                </div>

                {/* Testimonial Text */}
                {isEditMode ? (
                  <textarea
                    value={current.text}
                    onChange={(e) => updateTestimonial(currentTestimonial, 'text', e.target.value)}
                    className="w-full p-4 bg-panel/50 border border-glass-border rounded-lg text-ink text-lg leading-relaxed text-center resize-none mb-6"
                    rows="4"
                  />
                ) : (
                  <blockquote className="text-lg text-ink leading-relaxed mb-6 italic">
                    "{current.text}"
                  </blockquote>
                )}

                {/* Client Info */}
                <div className="flex items-center justify-center space-x-4">
                  <img 
                    src={current.avatar} 
                    alt={current.name}
                    className="w-16 h-16 rounded-full border-2 border-acc-1/30"
                  />
                  <div className="text-left">
                    {isEditMode ? (
                      <div className="space-y-1">
                        <input
                          type="text"
                          value={current.name}
                          onChange={(e) => updateTestimonial(currentTestimonial, 'name', e.target.value)}
                          className="w-full p-1 bg-panel/50 border border-glass-border rounded text-white font-semibold"
                        />
                        <input
                          type="text"
                          value={current.role}
                          onChange={(e) => updateTestimonial(currentTestimonial, 'role', e.target.value)}
                          className="w-full p-1 bg-panel/50 border border-glass-border rounded text-acc-1 text-sm"
                        />
                        <input
                          type="text"
                          value={current.company}
                          onChange={(e) => updateTestimonial(currentTestimonial, 'company', e.target.value)}
                          className="w-full p-1 bg-panel/50 border border-glass-border rounded text-muted text-sm"
                        />
                      </div>
                    ) : (
                      <>
                        <h4 className="text-white font-semibold">{current.name}</h4>
                        <p className="text-acc-1 text-sm">{current.role}</p>
                        <p className="text-muted text-sm">{current.company}</p>
                      </>
                    )}
                  </div>
                </div>

                {/* Project Badge */}
                <div className="mt-4">
                  {isEditMode ? (
                    <input
                      type="text"
                      value={current.project}
                      onChange={(e) => updateTestimonial(currentTestimonial, 'project', e.target.value)}
                      className="p-2 bg-acc-1/20 border border-acc-1/30 rounded-full text-acc-1 text-sm text-center"
                    />
                  ) : (
                    <span className="px-4 py-2 bg-acc-1/20 text-acc-1 rounded-full text-sm font-medium">
                      Project: {current.project}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Navigation Buttons */}
            {testimonials.length > 1 && (
              <>
                <button
                  onClick={prevTestimonial}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-glass-bg border border-glass-border rounded-full hover:bg-panel-hover transition-all hover:scale-110"
                  disabled={testimonials.length <= 1}
                >
                  <ChevronLeft className="w-6 h-6 text-acc-1" />
                </button>
                <button
                  onClick={nextTestimonial}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-glass-bg border border-glass-border rounded-full hover:bg-panel-hover transition-all hover:scale-110"
                  disabled={testimonials.length <= 1}
                >
                  <ChevronRight className="w-6 h-6 text-acc-1" />
                </button>
              </>
            )}
          </div>

          {/* Testimonial Dots */}
          {testimonials.length > 1 && (
            <div className="flex justify-center space-x-2 mb-8">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    index === currentTestimonial 
                      ? 'bg-acc-1 scale-125' 
                      : 'bg-muted/40 hover:bg-muted/60'
                  }`}
                />
              ))}
            </div>
          )}

          {/* Edit Mode Controls */}
          {isEditMode && (
            <div className="border-t border-glass-border/30 pt-6">
              <div className="flex justify-center space-x-4">
                <button
                  onClick={addTestimonial}
                  className="px-4 py-2 bg-acc-1/20 text-acc-1 border border-acc-1/30 rounded-lg hover:bg-acc-1/30 transition-colors text-sm"
                >
                  Add Testimonial
                </button>
                {testimonials.length > 1 && (
                  <button
                    onClick={() => removeTestimonial(currentTestimonial)}
                    className="px-4 py-2 bg-bad/20 text-bad border border-bad/30 rounded-lg hover:bg-bad/30 transition-colors text-sm"
                  >
                    Remove Current
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 pt-8 border-t border-glass-border/30">
            <div className="text-center">
              <div className="text-3xl font-bold text-acc-1 font-display mb-2">25+</div>
              <div className="text-sm text-muted">Projects Delivered</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-acc-2 font-display mb-2">100%</div>
              <div className="text-sm text-muted">On-Time Delivery</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-ok font-display mb-2">4.9/5</div>
              <div className="text-sm text-muted">Client Rating</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialSection;