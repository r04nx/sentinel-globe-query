import { useState, Suspense } from "react";
import { Menu, Bell, Settings, User } from "lucide-react";
import { LoadingScreen } from "@/components/LoadingScreen";
import { Globe } from "@/components/Globe";
import { ChatInterface } from "@/components/ChatInterface";
import { StatsPanel } from "@/components/StatsPanel";
import { DataVisualization } from "@/components/DataVisualization";
import { ControlPanel } from "@/components/ControlPanel";
import { DataSourcesPanel } from "@/components/DataSourcesPanel";
import { Button } from "@/components/ui/button";
import sentinelLogo from "@/assets/sentinel-logo.png";

const Index = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (isLoading) {
    return <LoadingScreen onLoadComplete={() => setIsLoading(false)} />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-sentinel-border bg-background/95 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setSidebarOpen(!sidebarOpen)}
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
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
              </Button>
              <Button variant="ghost" size="icon">
                <Settings className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <User className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="space-y-6">
          {/* Stats */}
          <StatsPanel />

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Globe Section */}
            <div className="lg:col-span-2 space-y-6">
              <div className="relative rounded-lg overflow-hidden border border-sentinel-border bg-card/30 backdrop-blur-sm">
                <div className="absolute top-4 left-4 z-10 bg-background/80 backdrop-blur-sm px-3 py-1 rounded-lg border border-sentinel-border">
                  <p className="text-xs font-semibold">Global Disaster Map</p>
                </div>
                <div className="h-[500px]">
                  <Suspense fallback={
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-8 h-8 border-2 border-sentinel-green border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">Loading 3D Globe...</p>
                      </div>
                    </div>
                  }>
                    <Globe />
                  </Suspense>
                </div>
              </div>

              <DataVisualization />
            </div>

            {/* Right Sidebar */}
            <div className="space-y-6">
              <ControlPanel />
              <div className="h-[400px]">
                <ChatInterface />
              </div>
            </div>
          </div>

          {/* Data Sources */}
          <DataSourcesPanel />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-sentinel-border mt-12 py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>SENTINEL v1.0 | Spatial Emergency Network & Threat Intelligence Nexus for Enhanced Logistics</p>
          <p className="mt-1">Team VOLDEMORT | HERE Technology Hackathon 2025</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
