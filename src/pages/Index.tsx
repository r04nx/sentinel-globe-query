import { useState, Suspense } from "react";
import { Menu, Bell, Settings, User, X, Maximize2, Minimize2 } from "lucide-react";
import { LoadingScreen } from "@/components/LoadingScreen";
import { Globe } from "@/components/Globe";
import { LeafletMap } from "@/components/LeafletMap";
import { MapWizard, defaultGlobeConfig, type GlobeConfig } from "@/components/MapWizard";
import { ChatInterface } from "@/components/ChatInterface";
import { StatsPanel } from "@/components/StatsPanel";
import { DataVisualization } from "@/components/DataVisualization";
import { ControlPanel } from "@/components/ControlPanel";
import { DataSourcesPanel } from "@/components/DataSourcesPanel";
import { Button } from "@/components/ui/button";
import sentinelLogo from "@/assets/sentinel-logo.png";

const Index = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [chatExpanded, setChatExpanded] = useState(false);
  const [showPanels, setShowPanels] = useState(true);
  const [showWizard, setShowWizard] = useState(false);
  const [globeCfg, setGlobeCfg] = useState<GlobeConfig>(defaultGlobeConfig);
  const [leftWidth, setLeftWidth] = useState<number>(400);
  const [isResizingLeft, setIsResizingLeft] = useState(false);
  const [rotationPaused, setRotationPaused] = useState(false);
  const [mode2D, setMode2D] = useState(true);

  if (isLoading) {
    return <LoadingScreen onLoadComplete={() => setIsLoading(false)} />;
  }

  return (
    <div className="relative min-h-screen bg-black text-foreground overflow-hidden">
      {/* Global mouse handlers for resizing */}
      {isResizingLeft && (
        <div
          className="fixed inset-0 z-50"
          onMouseMove={(e) => {
            const min = 280; const max = 560;
            const newWidth = Math.min(max, Math.max(min, e.clientX - 24));
            setLeftWidth(newWidth);
          }}
          onMouseUp={() => setIsResizingLeft(false)}
          onMouseLeave={() => setIsResizingLeft(false)}
        />
      )}
      {/* Fullscreen Globe Background */}
      <div className="fixed inset-0 z-0">
        <Suspense fallback={
          <div className="w-full h-full flex items-center justify-center bg-black">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-sentinel-green border-t-transparent animate-spin mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Loading 3D Globe...</p>
            </div>
          </div>
        }>
          {mode2D ? (
            <LeafletMap />
          ) : (
          <Globe config={{
            basemap: globeCfg.basemap,
            showGrid: globeCfg.showGrid,
            showOutlines: globeCfg.showOutlines,
            globeOpacity: globeCfg.globeOpacity,
            autoRotate: rotationPaused ? false : globeCfg.autoRotate,
            autoRotateSpeed: globeCfg.autoRotateSpeed,
          }} />)}
        </Suspense>
      </div>

      {/* Header Overlay */}
      <header className="fixed top-0 left-0 right-0 z-40 border-b border-sentinel-border bg-background/80 backdrop-blur-md">
        <div className="px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowPanels(!showPanels)}
                className="hover:bg-sentinel-green/10"
              >
                <Menu className="w-5 h-5" />
              </Button>
              <div className="flex items-center gap-3">
                <img src={sentinelLogo} alt="SENTINEL" className="w-8 h-8" />
                <div>
                  <h1 className="text-xl font-bold glow-text">SENTINEL</h1>
                  <p className="text-xs text-muted-foreground">Disaster Intelligence Platform</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="relative hover:bg-sentinel-green/10">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-destructive" />
              </Button>
              <Button variant="outline" size="sm" className="hover:bg-sentinel-green/10" onClick={() => setShowWizard(true)}>
                Map Wizard
              </Button>
              <Button variant="outline" size="sm" className="hover:bg-sentinel-green/10" onClick={() => setRotationPaused(!rotationPaused)}>
                {rotationPaused ? 'Play Globe' : 'Pause Globe'}
              </Button>
              <Button variant="outline" size="sm" className="hover:bg-sentinel-green/10" onClick={() => setMode2D(!mode2D)}>
                {mode2D ? '3D Globe' : '2D Map'}
              </Button>
              <Button variant="ghost" size="icon" className="hover:bg-sentinel-green/10">
                <Settings className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="hover:bg-sentinel-green/10">
                <User className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Left Panel - Stats & Controls */}
      {showPanels && (
        <>
          <div
            className="fixed left-6 top-24 bottom-6 z-30 space-y-4 overflow-y-auto"
            style={{ width: `${leftWidth}px` }}
          >
            <div className="space-y-4">
              <StatsPanel />
              <ControlPanel />
              <DataSourcesPanel />
            </div>
          </div>
          {/* Resize handle */}
          {/* Resize handle removed visually (kept hit area only) */}
          <div
            className="fixed top-24 bottom-6 z-40 cursor-col-resize"
            style={{ left: `${6 + leftWidth + 8}px`, width: '8px' }}
            onMouseDown={() => setIsResizingLeft(true)}
          />
        </>
      )}

      {/* Right Panel - Data Visualization */}
      {showPanels && !chatExpanded && (
        <div className="fixed right-6 top-24 bottom-6 z-30 w-96 overflow-y-auto">
          <DataVisualization />
        </div>
      )}

      {/* Chat Interface - Expandable */}
      <div 
        className={`fixed z-30 transition-all duration-300 ${
          chatExpanded 
            ? 'inset-x-6 top-24 bottom-6' 
            : 'right-6 bottom-6 w-[500px] h-[600px]'
        }`}
      >
        <div className="relative h-full">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setChatExpanded(!chatExpanded)}
            className="absolute -top-10 right-0 z-10 bg-background/80 border border-sentinel-border hover:bg-sentinel-green/10"
          >
            {chatExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </Button>
          <ChatInterface />
        </div>
      </div>

      {/* Footer Overlay */}
      <footer className="fixed bottom-0 left-0 right-0 z-20 border-t border-sentinel-border bg-background/60 backdrop-blur-sm py-3">
        <div className="px-6 text-center text-xs text-muted-foreground">
          <p>SENTINEL v1.0 | Spatial Emergency Network & Threat Intelligence Nexus for Enhanced Logistics</p>
          <p className="mt-1">Team VOLDEMORT | HERE Technology Hackathon 2025</p>
        </div>
      </footer>

      {showWizard && (
        <MapWizard
          initial={globeCfg}
          onApply={(cfg) => { setGlobeCfg(cfg); setShowWizard(false); }}
          onClose={() => setShowWizard(false)}
        />
      )}
    </div>
  );
};

export default Index;
