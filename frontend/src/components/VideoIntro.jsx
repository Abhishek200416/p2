import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX, X } from 'lucide-react';

const VideoIntro = ({ videoSrc, onComplete, onSkip }) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const videoRef = useRef(null);
  const progressRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      const progress = (video.currentTime / video.duration) * 100;
      setProgress(progress);
    };

    const handleEnded = () => {
      setIsVisible(false);
      setTimeout(onComplete, 300); // Allow fade out animation
    };

    const handleCanPlay = () => {
      video.play().catch(console.log);
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('canplay', handleCanPlay);

    // Auto-play with muted initially (browser requirement)
    video.muted = true;
    video.play().catch(console.log);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('canplay', handleCanPlay);
    };
  }, [onComplete]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    video.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleSkip = () => {
    setIsVisible(false);
    setTimeout(onSkip, 300);
  };

  const handleProgressClick = (e) => {
    const video = videoRef.current;
    const rect = progressRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const percentage = clickX / width;
    video.currentTime = percentage * video.duration;
  };

  if (!videoSrc || !isVisible) {
    return null;
  }

  return (
    <div 
      className={`fixed inset-0 z-[9999] bg-black flex items-center justify-center transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {/* Video */}
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        loop={false}
        muted={isMuted}
        playsInline
      >
        <source src={videoSrc} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Overlay Controls */}
      <div className="absolute inset-0 bg-black/20">
        {/* Top Controls */}
        <div className="absolute top-6 right-6 flex space-x-3">
          <button
            onClick={handleSkip}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white text-sm font-medium rounded-full transition-all flex items-center"
          >
            <X className="w-4 h-4 mr-2" />
            Skip Intro
          </button>
        </div>

        {/* Center Play/Pause */}
        <div className="absolute inset-0 flex items-center justify-center">
          <button
            onClick={togglePlay}
            className="w-20 h-20 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center transition-all transform hover:scale-110"
          >
            {isPlaying ? (
              <Pause className="w-8 h-8 text-white ml-1" />
            ) : (
              <Play className="w-8 h-8 text-white ml-1" />
            )}
          </button>
        </div>

        {/* Bottom Controls */}
        <div className="absolute bottom-6 left-6 right-6">
          <div className="flex items-center space-x-4 text-white">
            {/* Progress Bar */}
            <div 
              ref={progressRef}
              onClick={handleProgressClick}
              className="flex-1 h-1 bg-white/30 rounded-full cursor-pointer group"
            >
              <div 
                className="h-full bg-blue-400 rounded-full transition-all group-hover:h-2"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Volume Control */}
            <button
              onClick={toggleMute}
              className="p-2 hover:bg-white/10 rounded-full transition-all"
            >
              {isMuted ? (
                <VolumeX className="w-5 h-5" />
              ) : (
                <Volume2 className="w-5 h-5" />
              )}
            </button>

            {/* Time Display */}
            <div className="text-sm font-mono min-w-[60px] text-right">
              {Math.floor(progress)}%
            </div>
          </div>
        </div>

        {/* Branding */}
        <div className="absolute bottom-6 left-6">
          <div className="text-white/80 text-sm">
            <div className="font-semibold">Abhishek Kolluri</div>
            <div className="text-xs text-white/60">Portfolio Experience</div>
          </div>
        </div>
      </div>

      {/* Grain overlay for cinematic effect */}
      <div className="absolute inset-0 opacity-20 pointer-events-none mix-blend-overlay">
        <div className="w-full h-full bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse" />
      </div>
    </div>
  );
};

export default VideoIntro;