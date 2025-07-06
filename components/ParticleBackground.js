import { useEffect, useRef } from 'react';

export default function ParticleBackground({ isPlaying = false, audioElement = null }) {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const particlesRef = useRef([]);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const dataArrayRef = useRef(null);
  const flashIntensityRef = useRef(0);
  const pulseRef = useRef(0);

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

    // Initialize audio context for music reactivity
    const initAudioContext = () => {
      if (audioElement && isPlaying && !audioContextRef.current) {
        try {
          const audioContext = new (window.AudioContext || window.webkitAudioContext)();
          const analyser = audioContext.createAnalyser();
          const source = audioContext.createMediaElementSource(audioElement);
          
          analyser.fftSize = 256;
          const bufferLength = analyser.frequencyBinCount;
          const dataArray = new Uint8Array(bufferLength);
          
          source.connect(analyser);
          analyser.connect(audioContext.destination);
          
          audioContextRef.current = audioContext;
          analyserRef.current = analyser;
          dataArrayRef.current = dataArray;
        } catch (error) {
          console.log('Audio context initialization failed:', error);
        }
      }
    };

    const getAudioData = () => {
      if (analyserRef.current && dataArrayRef.current && isPlaying) {
        analyserRef.current.getByteFrequencyData(dataArrayRef.current);
        
        // Calculate average frequency for bass/beat detection
        const bass = dataArrayRef.current.slice(0, 10);
        const mid = dataArrayRef.current.slice(10, 100);
        const high = dataArrayRef.current.slice(100, 256);
        
        const bassAvg = bass.reduce((a, b) => a + b, 0) / bass.length;
        const midAvg = mid.reduce((a, b) => a + b, 0) / mid.length;
        const highAvg = high.reduce((a, b) => a + b, 0) / high.length;
        
        // Create flash effect on bass hits
        if (bassAvg > 180) {
          flashIntensityRef.current = Math.min(1, flashIntensityRef.current + 0.3);
        }
        
        // Smooth pulse based on mid frequencies
        pulseRef.current = midAvg / 255;
        
        return { bassAvg, midAvg, highAvg, overall: (bassAvg + midAvg + highAvg) / 3 };
      }
      return { bassAvg: 0, midAvg: 0, highAvg: 0, overall: 0 };
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
      
      const audioData = getAudioData();
      
      // Flash effect decay
      flashIntensityRef.current *= 0.85;
      
      // Create gradient background with music reactivity
      if (isPlaying && audioData.overall > 50) {
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
        const reactivity = isPlaying ? (audioData.overall / 255) * 2 : 1;
        const musicVelocity = isPlaying ? (audioData.bassAvg / 255) * 0.5 : 0;
        
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
          hue = (particle.hue + (audioData.highAvg / 255) * 60 + Date.now() * 0.05) % 360;
        }
        
        // Draw particle
        if (particle.type === 'star') {
          drawStar(ctx, particle.x, particle.y, currentSize, particle.opacity, hue);
        } else {
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, currentSize, 0, Math.PI * 2);
          
          if (isPlaying && audioData.overall > 100) {
            // Colorful mode when music is loud
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
      if (isPlaying && audioData.overall > 80) {
        particles.forEach((particle, i) => {
          particles.slice(i + 1).forEach(otherParticle => {
            const dx = particle.x - otherParticle.x;
            const dy = particle.y - otherParticle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 100) {
              ctx.beginPath();
              ctx.moveTo(particle.x, particle.y);
              ctx.lineTo(otherParticle.x, otherParticle.y);
              
              const lineOpacity = (1 - distance / 100) * 0.2 * (audioData.overall / 255);
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
    
    if (isPlaying) {
      initAudioContext();
    }
    
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
      
      // Clean up audio context
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
        analyserRef.current = null;
        dataArrayRef.current = null;
      }
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
