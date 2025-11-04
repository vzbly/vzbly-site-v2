import { useEffect, useRef, useState } from 'react';
import heroVideoDesktop from '../assets/hero-vzbly-720.webm';
import heroVideoMobile from '../assets/hero-vzbly-mobile.webm';

interface HeroVideoProps {
  onComplete?: () => void;
}

export default function HeroVideo({ onComplete }: HeroVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [containerHeight, setContainerHeight] = useState('200vh');
  const [isMobile, setIsMobile] = useState(false);
  const isScrubbingRef = useRef(false);
  const hasUserScrolledRef = useRef(false);
  const videoCompleteRef = useRef(false);
  const onCompleteCalledRef = useRef(false);
  const lastScrollTimeRef = useRef(0);
  const lastProgressRef = useRef(0);
  const targetTimeRef = useRef(0);
  const animationFrameRef = useRef<number>();

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Reset video state when device type changes
    videoCompleteRef.current = false;
    onCompleteCalledRef.current = false;
    hasUserScrolledRef.current = false;
    isScrubbingRef.current = false;
    setScrollProgress(0);
    
    // Ensure page starts at top when video loads
    window.scrollTo(0, 0);
    
    // Reload video when device type changes
    video.load();

    // Ensure video is loaded and ready
    const handleLoadedMetadata = () => {
      if (!video.duration) return;
      
      // Calculate container height based on video duration
      // Use scroll distance per second of video
      const scrollDistancePerSecond = 100; // viewport heights per second
      const totalScrollHeight = video.duration * scrollDistancePerSecond;
      
      // Set initial height for scrubbing (will be adjusted if autoplay completes)
      setContainerHeight(`${totalScrollHeight}vh`);
      
      // Start video at beginning
      video.currentTime = 0;
      // Start autoplay immediately
      video.play().catch(console.error);
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);

    // Smooth interpolation for video time updates during scrubbing
    const smoothUpdateVideo = () => {
      if (!video.duration || videoCompleteRef.current) {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
          animationFrameRef.current = undefined;
        }
        // Ensure video is locked at final frame
        if (videoCompleteRef.current) {
          video.currentTime = video.duration;
          video.pause();
        }
        return;
      }
      
      const currentTime = video.currentTime;
      const targetTime = Math.min(targetTimeRef.current, video.duration - 0.01);
      const diff = targetTime - currentTime;
      
      if (Math.abs(diff) > 0.01) {
        const easing = 0.15;
        const newTime = Math.min(currentTime + diff * easing, video.duration - 0.01);
        video.currentTime = newTime;
        
        // Check if we've reached the end
        if (newTime >= video.duration - 0.1) {
          video.currentTime = video.duration;
          video.pause();
          videoCompleteRef.current = true;
          if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = undefined;
          }
        } else {
          animationFrameRef.current = requestAnimationFrame(smoothUpdateVideo);
        }
      } else {
        video.currentTime = targetTime;
        // Check if we've reached the end
        if (targetTime >= video.duration - 0.1) {
          video.currentTime = video.duration;
          video.pause();
          videoCompleteRef.current = true;
        }
      }
    };

    // Handle scroll-driven video playback
    const handleScroll = () => {
      if (!containerRef.current || !video.duration) return;

      // If video is complete, don't scrub
      if (videoCompleteRef.current) return;

      const container = containerRef.current;
      const rect = container.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const now = Date.now();
      
      // Mark that user has started scrolling
      if (!hasUserScrolledRef.current) {
        hasUserScrolledRef.current = true;
        // Pause autoplay when user starts scrolling
        video.pause();
      }
      
      // Calculate scroll progress (0 to 1) based on scroll position within container
      let progress = 0;
      let shouldScrub = false;
      
      // Only scrub if the video container is actively being scrolled through
      if (rect.top <= 0 && rect.bottom >= viewportHeight) {
        // Video container is in view and scrollable - calculate progress based on scroll position
        const scrolled = Math.abs(rect.top);
        const totalScroll = rect.height - viewportHeight;
        progress = Math.min(1, Math.max(0, scrolled / Math.max(totalScroll, 1)));
        shouldScrub = true;
      } else if (rect.top > 0) {
        // Video hasn't been reached yet - use current video time
        progress = video.currentTime / video.duration;
        shouldScrub = false;
      } else {
        // Video has been scrolled past - ensure it's at end
        progress = 1;
        shouldScrub = false;
        if (!videoCompleteRef.current) {
          video.currentTime = video.duration;
          video.pause();
          videoCompleteRef.current = true;
        }
      }

      // Always scrub when in the video section and user is scrolling
      if (shouldScrub) {
        // Set target time directly (no interpolation delay for immediate response)
        const targetTime = Math.min(progress * video.duration, video.duration - 0.01);
        targetTimeRef.current = targetTime;
        video.pause(); // Pause when scrubbing
        isScrubbingRef.current = true;
        
        // Update immediately for responsiveness
        if (Math.abs(video.currentTime - targetTime) > 0.05) {
          video.currentTime = targetTime;
        } else {
          // Use smooth interpolation for fine adjustments
          if (!animationFrameRef.current) {
            animationFrameRef.current = requestAnimationFrame(smoothUpdateVideo);
          }
        }
        
        lastScrollTimeRef.current = now;
      } else if (!shouldScrub && isScrubbingRef.current) {
        // Stop scrubbing
        isScrubbingRef.current = false;
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
          animationFrameRef.current = undefined;
        }
      }
      
      // Check if we've reached the end
      if (progress >= 0.99 && !videoCompleteRef.current) {
        video.currentTime = video.duration;
        video.pause();
        videoCompleteRef.current = true;
        // Remove timeupdate listener to prevent flashing
        video.removeEventListener('timeupdate', handleTimeUpdate);
        // Call onComplete callback when scrubbing completes (only once)
        if (onComplete && !onCompleteCalledRef.current) {
          onCompleteCalledRef.current = true;
          setTimeout(() => {
            onComplete();
          }, 500);
        }
      }
      
      lastProgressRef.current = progress;
      setScrollProgress(progress);
    };

    // Update progress from video playback (when autoplaying, not scrubbing)
    const handleTimeUpdate = () => {
      // If already complete, immediately lock and return (prevent flashing)
      if (videoCompleteRef.current) {
        video.currentTime = video.duration;
        video.pause();
        return;
      }
      
      if (!isScrubbingRef.current && !hasUserScrolledRef.current && video.duration) {
        const progress = video.currentTime / video.duration;
        
        // Check if we've reached the end (check earlier to catch completion)
        if (progress >= 0.98 || video.currentTime >= video.duration - 0.2) {
          // Mark as complete and lock immediately
          videoCompleteRef.current = true;
          video.currentTime = video.duration;
          video.pause();
          setScrollProgress(1);
          
          // Remove this listener to prevent flashing
          video.removeEventListener('timeupdate', handleTimeUpdate);
          
          // Also remove ended listener to prevent any triggers
          video.removeEventListener('ended', handleEnded);
          
          // If autoplay finished (user didn't scroll), make container minimal for easy transition
          if (!hasUserScrolledRef.current) {
            setContainerHeight('101vh');
          }
          
          // Call onComplete callback if provided (when video completes via autoplay) (only once)
          if (onComplete && !onCompleteCalledRef.current) {
            onCompleteCalledRef.current = true;
            setTimeout(() => {
              onComplete();
            }, 500);
          }
        } else {
          setScrollProgress(progress);
          targetTimeRef.current = video.currentTime;
        }
      }
    };

    // Handle video end
    const handleEnded = () => {
      // Video finished - lock at final frame immediately
      videoCompleteRef.current = true;
      video.currentTime = video.duration;
      video.pause();
      setScrollProgress(1);
      
      // Remove listeners to prevent any further updates/flashing
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      
      // Cancel any animation frames
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = undefined;
      }
      
      // If autoplay finished (user didn't scroll), make container minimal for easy transition
      if (!hasUserScrolledRef.current) {
        setContainerHeight('101vh'); // Just slightly taller than viewport for easy scroll
      }
      
      // Call onComplete callback if provided (only once)
      if (onComplete && !onCompleteCalledRef.current) {
        onCompleteCalledRef.current = true;
        setTimeout(() => {
          onComplete();
        }, 500); // Small delay to allow final frame to display
      }
    };

    // Prevent scrolling past video section until video is complete (only when user is scrubbing)
    const preventScrollPast = (e: WheelEvent) => {
      if (!containerRef.current || !video.duration || !hasUserScrolledRef.current || videoCompleteRef.current) return;
      
      const container = containerRef.current;
      const currentScroll = window.scrollY;
      const viewportHeight = window.innerHeight;
      
      // Calculate video section boundaries
      const videoStart = container.offsetTop;
      const videoEnd = videoStart + container.offsetHeight - viewportHeight;
      
      // Check if we're at or past the end of the video section
      const isAtEnd = currentScroll >= videoEnd - 1;
      
      // Check if video is complete
      const videoProgress = video.currentTime / video.duration;
      const isVideoComplete = videoProgress >= 0.99 || videoCompleteRef.current;
      
      // If we're at the end and video isn't complete, prevent scrolling down
      if (isAtEnd && !isVideoComplete && e.deltaY > 0) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('ended', handleEnded);
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('wheel', handleScroll, { passive: true });
    window.addEventListener('wheel', preventScrollPast, { passive: false });

    // Also try to start when canplay if not already loaded
    const handleCanPlay = () => {
      if (video.paused && !hasUserScrolledRef.current && !videoCompleteRef.current) {
        video.play().catch(console.error);
      }
    };
    video.addEventListener('canplay', handleCanPlay);
    
    // Prevent video from playing once complete
    const handlePlay = () => {
      if (videoCompleteRef.current) {
        video.pause();
        video.currentTime = video.duration;
      }
    };
    video.addEventListener('play', handlePlay);

    // Start video immediately if already loaded
    if (video.readyState >= 2) {
      handleLoadedMetadata();
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('ended', handleEnded);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('wheel', handleScroll);
      window.removeEventListener('wheel', preventScrollPast);
    };
  }, [isMobile, onComplete]);

  return (
    <div
      ref={containerRef}
      className="w-full bg-black relative"
      style={{
        height: containerHeight,
        zIndex: 50,
      }}
    >
      <div 
        className="sticky top-0 w-full h-screen flex items-center justify-center overflow-hidden"
        style={{
          position: 'sticky',
          top: 0,
          width: '100%',
          height: '100vh',
        }}
      >
        <video
          key={isMobile ? 'mobile' : 'desktop'}
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-contain md:object-cover"
          playsInline
          muted
          autoPlay
          preload="auto"
          loop={false}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
          }}
        >
          <source src={isMobile ? heroVideoMobile : heroVideoDesktop} type="video/webm" />
        </video>
        
        {/* Progress indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-64 h-1 bg-white/20 rounded-full overflow-hidden z-10">
          <div
            className="h-full bg-gradient-to-r from-whimsical-pink via-whimsical-purple to-whimsical-yellow transition-all duration-300"
            style={{ width: `${scrollProgress * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
