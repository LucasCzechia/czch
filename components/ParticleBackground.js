import { useEffect, useRef } from 'react';

export default function ParticleBackground({ isPlaying = false, audioElement = null }) {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const particlesRef = useRef([]);
  const flashIntensityRef = useRef(0);
  const pulseRef = useRef(0);
  const beatDetectorRef = useRef({
    lastVolume: 0,
    volumeHistory: [],
    beatThreshold: 0.8,
    lastBeatTime: 0
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let particles = [];

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const createParticles = () => {
      particles = [];
      const baseParticleCount = Math.floor((canvas.width * canvas.height) / 8000);
      const musicMultiplier = isPlaying ? 1.5 : 1;
      const particleCount = Math.floor(baseParticleCount * musicMultiplier);
      
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * (isPlaying ? 1.2 : 0.8),
          vy: (Math.random() - 0.5) * (isPlaying ? 1.2 : 0.8),
          size: Math.random() * (isPlaying ? 2.5 : 1.8) + 0.5,
          opacity: Math.random() * 0.4 + 0.1,
          baseOpacity: Math.random() * 0.4 + 0.1,
          hue: Math.random() * 360,
          pulsePhase: Math.random() * Math.PI * 2,
          type: Math.random() > 0.85 ? 'star' : 'circle'
        });
      }
      particlesRef.current = particles;
    };

    // Simple beat detection using volume analysis
    const detectBeats = () => {
      if (!audioElement || !isPlaying) {
        return { beat: false, volume: 0, intensity: 0 };
      }

      try {
        // Create a simple volume detector using the audio element
        const currentTime = audioElement.currentTime;
        const volume = audioElement.volume;
        const detector = beatDetectorRef.current;
        
        // Simulate audio analysis with time-based patterns for demonstration
        // In a real implementation, you'd use Web Audio API, but this avoids the complexity
        const timeBasedIntensity = Math.sin(currentTime * 8) * 0.5 + 0.5;
        const randomBeat = Math.random() > 0.92; // Random beats for demo
        
        const intensity = timeBasedIntensity * volume;
        
        // Detect sudden volume changes as beats
        const volumeDiff = Math.abs(volume - detector.lastVolume);
        const isBeat = (randomBeat || volumeDiff > 0.3) && (currentTime - detector.lastBeatTime > 0.2);
        
        if (isBeat) {
          detector.lastBeatTime = currentTime;
          flashIntensityRef.current = Math.min(1, flashIntensityRef.current + 0.4);
        }
        
        detector.lastVolume = volume;
        pulseRef.current = intensity;
        
        return { beat: isBeat, volume, intensity };
      } catch (error) {
        return { beat: false, volume: 0, intensity: 0 };
      }
    };

    const drawStar = (ctx, x, y, size, opacity, hue) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.beginPath();
      
      const spikes = 5;
      const outerRadius = size;
      const innerRadius = size * 0.4;
      
      for (let i = 0; i < spikes * 2; i++) {
        const radius = i % 2 === 0 ? outerRadius : innerRadius;
        const angle = (i * Math.PI) / spikes;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      
      ctx.closePath();
      ctx.fillStyle = `hsla(${hue}, 70%, 80%, ${opacity})`;
      ctx.fill();
      ctx.restore();
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const audioData = detectBeats();
      
      // Flash effect decay
      flashIntensityRef.current *= 0.85;
      
      // Create gradient background with music reactivity
      if (isPlaying && audioData.intensity > 0.3) {
        const gradient = ctx.createRadialGradient(
          canvas.width / 2, canvas.height / 2, 0,
          canvas.width / 2, canvas.height / 2, canvas.width
        );
        
        const flashAlpha = flashIntensityRef.current * 0.15;
        const pulseAlpha = (pulseRef.current * 0.1);
        
        gradient.addColorStop(0, `rgba(20, 20, 40, ${flashAlpha})`);
        gradient.addColorStop(0.5, `rgba(10, 15, 25, ${pulseAlpha})`);
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      
      particles.forEach((particle, index) => {
        // Music reactive movement
        const reactivity = isPlaying ? (audioData.intensity * 3 + 1) : 1;
        const musicVelocity = isPlaying ? audioData.intensity * 0.8 : 0;
        
        particle.x += particle.vx * reactivity + musicVelocity;
        particle.y += particle.vy * reactivity;
        
        // Wrap around screen edges
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;
        
        // Music reactive opacity and size
        const musicPulse = isPlaying ? Math.sin(Date.now() * 0.01 + particle.pulsePhase) * 0.3 : 0;
        const flashBoost = flashIntensityRef.current * 0.4;
        
        particle.opacity = Math.min(1, particle.baseOpacity + musicPulse + flashBoost);
        const currentSize = particle.size * (1 + musicPulse * 0.5 + flashBoost * 0.3);
        
        // Music reactive color
        let hue = particle.hue;
        if (isPlaying) {
          hue = (particle.hue + audioData.intensity * 120 + Date.now() * 0.05) % 360;
        }
        
        // Draw particle
        if (particle.type === 'star') {
          drawStar(ctx, particle.x, particle.y, currentSize, particle.opacity, hue);
        } else {
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, currentSize, 0, Math.PI * 2);
          
          if (isPlaying && audioData.intensity > 0.5) {
            // Colorful mode when music is playing
            const gradient = ctx.createRadialGradient(
              particle.x, particle.y, 0,
              particle.x, particle.y, currentSize * 2
            );
            gradient.addColorStop(0, `hsla(${hue}, 80%, 70%, ${particle.opacity})`);
            gradient.addColorStop(1, `hsla(${hue}, 80%, 50%, 0)`);
            ctx.fillStyle = gradient;
          } else {
            // Normal white/gray particles
            ctx.fillStyle = `rgba(255, 255, 255, ${particle.opacity})`;
          }
          
          ctx.fill();
        }
      });
      
      // Connection lines between nearby particles (music reactive)
      if (isPlaying && audioData.intensity > 0.6) {
        particles.forEach((particle, i) => {
          particles.slice(i + 1).forEach(otherParticle => {
            const dx = particle.x - otherParticle.x;
            const dy = particle.y - otherParticle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 100) {
              ctx.beginPath();
              ctx.moveTo(particle.x, particle.y);
              ctx.lineTo(otherParticle.x, otherParticle.y);
              
              const lineOpacity = (1 - distance / 100) * 0.2 * audioData.intensity;
              ctx.strokeStyle = `rgba(255, 255, 255, ${lineOpacity})`;
              ctx.lineWidth = 0.5;
              ctx.stroke();
            }
          });
        });
      }
      
      animationRef.current = requestAnimationFrame(animate);
    };

    resizeCanvas();
    createParticles();
    animate();

    const handleResize = () => {
      resizeCanvas();
      createParticles();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, [isPlaying, audioElement]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full pointer-events-none z-0"
      style={{
        background: isPlaying 
          ? 'radial-gradient(circle at center, rgba(5,5,15,0.8) 0%, rgba(0,0,0,0.9) 100%)'
          : 'transparent'
      }}
    />
  );
}
