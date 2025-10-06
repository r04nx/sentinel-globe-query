import { useEffect, useState } from "react";
import sentinelLogo from "@/assets/sentinel-logo.png";

const loadingMessages = [
  "Initializing SENTINEL systems...",
  "Connecting to satellite networks...",
  "Aggregating real-time data streams...",
  "Loading geospatial intelligence modules...",
  "Calibrating AI prediction models...",
  "Establishing secure data channels...",
  "Synchronizing global sensor network...",
  "Preparing 3D visualization engine...",
  "Activating threat detection algorithms...",
  "System ready. Welcome to SENTINEL."
];

export const LoadingScreen = ({ onLoadComplete }: { onLoadComplete: () => void }) => {
  const [messageIndex, setMessageIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const messageInterval = setInterval(() => {
      setMessageIndex((prev) => {
        if (prev < loadingMessages.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 800);

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setTimeout(onLoadComplete, 500);
          return 100;
        }
        return prev + 2;
      });
    }, 80);

    return () => {
      clearInterval(messageInterval);
      clearInterval(progressInterval);
    };
  }, [onLoadComplete]);

  return (
    <div className="fixed inset-0 z-50 bg-background flex items-center justify-center">
      <div className="absolute inset-0 bg-gradient-to-br from-sentinel-green/5 via-background to-sentinel-cyan/5" />
      
      {/* Animated grid background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(hsl(var(--sentinel-green) / 0.1) 1px, transparent 1px),
            linear-gradient(90deg, hsl(var(--sentinel-green) / 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }} />
      </div>

      <div className="relative z-10 text-center space-y-8 px-4">
        {/* Logo */}
        <div className="flex justify-center">
          <div className="relative">
            <img 
              src={sentinelLogo} 
              alt="SENTINEL" 
              className="w-32 h-32 animate-pulse-glow"
            />
            <div className="absolute inset-0 bg-sentinel-green/20 blur-3xl rounded-full" />
          </div>
        </div>

        {/* Title */}
        <div>
          <h1 className="text-5xl font-bold glow-text mb-2">SENTINEL</h1>
          <p className="text-muted-foreground text-sm tracking-widest">
            DISASTER INTELLIGENCE PLATFORM
          </p>
        </div>

        {/* Loading bar */}
        <div className="w-full max-w-md mx-auto space-y-4">
          <div className="h-1 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-sentinel-green to-sentinel-cyan transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          
          {/* Progress percentage */}
          <div className="text-sentinel-green text-2xl font-mono font-bold">
            {progress}%
          </div>
        </div>

        {/* Loading messages */}
        <div className="min-h-[60px]">
          <p className="text-sm text-foreground/80 animate-pulse font-mono">
            {loadingMessages[messageIndex]}
          </p>
        </div>

        {/* Status indicator */}
        <div className="flex justify-center items-center gap-2">
          <div className="w-2 h-2 bg-sentinel-green rounded-full animate-pulse" />
          <span className="text-xs text-muted-foreground">SYSTEM ONLINE</span>
        </div>
      </div>

      {/* Scanline effect */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-sentinel-green/5 to-transparent h-32 scanline" />
      </div>
    </div>
  );
};
