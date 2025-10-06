import { Plus, ChevronDown, ChevronRight, Twitter, MessageCircle, Facebook, Instagram, Globe2, Rss, Map, Layers, Satellite, Navigation } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { ScrollArea } from "./ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { useState } from "react";

const socialSources = [
  { name: 'Twitter', icon: Twitter, color: 'text-sky-400' },
  { name: 'X', icon: Twitter, color: 'text-sky-300' },
  { name: 'Reddit', icon: MessageCircle, color: 'text-orange-400' },
  { name: 'Facebook', icon: Facebook, color: 'text-blue-500' },
  { name: 'Instagram', icon: Instagram, color: 'text-pink-400' },
  { name: 'MIndicator', icon: Globe2, color: 'text-emerald-400' },
  { name: 'News Feed', icon: Rss, color: 'text-amber-400' },
];

const mapServices = [
  { name: 'Google Maps', icon: Navigation, color: 'text-red-400' },
  { name: 'HERE Maps', icon: Navigation, color: 'text-emerald-400' },
  { name: 'OpenStreetMap', icon: Globe2, color: 'text-green-400' },
  { name: 'Esri World Imagery', icon: Layers, color: 'text-purple-400' },
  { name: 'Carto Basemaps', icon: Map, color: 'text-sky-400' },
  { name: 'Mapbox', icon: Map, color: 'text-blue-400' },
  { name: 'Stamen', icon: Map, color: 'text-amber-400' },
];

export const DataSourcesPanel = () => {
  const [open, setOpen] = useState(false);
  return (
    <Card className="p-0 bg-card/60 backdrop-blur-sm border-sentinel-border/80 rounded-lg overflow-hidden">
      <button
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-sentinel-green/5 transition-colors"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-controls="datasource-content"
      >
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <div className="w-2 h-2 bg-sentinel-cyan rounded-full animate-pulse" />
          Data Sources Integration
        </h3>
        {open ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
      </button>
      {/* Header-only (removed duplicate Add Source button) */}

      <div id="datasource-content" className={`${open ? 'animate-in fade-in-10 slide-in-from-top-1 duration-200' : 'hidden'}`}>
      <ScrollArea className="h-[360px] px-4 pb-4">
        <div className="mb-3">
          <h4 className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Social Media Feeds</h4>
          <div className="grid grid-cols-2 gap-2">
            {socialSources.map((s, idx) => {
              const Icon = s.icon;
              return (
                <Dialog key={idx}>
                  <DialogTrigger asChild>
                    <button className="flex items-center gap-2 p-2 bg-background/60 border border-sentinel-border/80 rounded-md hover:border-sentinel-green/40 text-sm">
                      <Icon className={`w-4 h-4 ${s.color}`} />
                      <span>{s.name}</span>
                    </button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg">
                    <DialogHeader>
                      <DialogTitle>{s.name} Configuration</DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="col-span-2">
                        <Label htmlFor="endpoint">API Endpoint</Label>
                        <Input id="endpoint" placeholder="https://api.example.com/..." />
                      </div>
                      <div className="col-span-2">
                        <Label htmlFor="apikey">API Key</Label>
                        <Input id="apikey" type="password" placeholder="••••••" />
                      </div>
                      <div>
                        <Label>Polling Interval</Label>
                        <Select defaultValue="30s">
                          <SelectTrigger className="bg-background/70 border-sentinel-border/80"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="15s">15s</SelectItem>
                            <SelectItem value="30s">30s</SelectItem>
                            <SelectItem value="60s">60s</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Crawl Window</Label>
                        <Select defaultValue="24h">
                          <SelectTrigger className="bg-background/70 border-sentinel-border/80"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1h">1h</SelectItem>
                            <SelectItem value="6h">6h</SelectItem>
                            <SelectItem value="24h">24h</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-2">
                        <Label>Analytics</Label>
                        <div className="text-xs text-muted-foreground">Sentiment, topics, geotagging (toggleable in future)</div>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              );
            })}
          </div>
        </div>

        <div className="mb-3">
          <h4 className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Map Services</h4>
          <div className="grid grid-cols-2 gap-2">
            {mapServices.map((s, idx) => {
              const Icon = s.icon;
              return (
                <Dialog key={idx}>
                  <DialogTrigger asChild>
                    <button className="flex items-center gap-2 p-2 bg-background/60 border border-sentinel-border/80 rounded-md hover:border-sentinel-green/40 text-sm">
                      <Icon className={`w-4 h-4 ${s.color}`} />
                      <span>{s.name}</span>
                    </button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg">
                    <DialogHeader>
                      <DialogTitle>{s.name} Configuration</DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="col-span-2">
                        <Label htmlFor="endpoint">Tiles/Imagery Endpoint</Label>
                        <Input id="endpoint" placeholder="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                      </div>
                      <div className="col-span-2">
                        <Label htmlFor="apikey">API Key</Label>
                        <Input id="apikey" type="password" placeholder="optional" />
                      </div>
                      <div>
                        <Label>Attribution</Label>
                        <Input placeholder="© OpenStreetMap contributors" />
                      </div>
                      <div>
                        <Label>Max Zoom</Label>
                        <Select defaultValue="19">
                          <SelectTrigger className="bg-background/70 border-sentinel-border/80"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="18">18</SelectItem>
                            <SelectItem value="19">19</SelectItem>
                            <SelectItem value="20">20</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-2 text-xs text-muted-foreground">Use free sources like OpenStreetMap (tiles), Esri World Imagery, CARTO, Stamen; paid keys (Google, Mapbox, HERE) optional.</div>
                    </div>
                  </DialogContent>
                </Dialog>
              );
            })}
          </div>
        </div>
        {/* Additional categories like Sensors Network, Satellite Imagery can be added similarly */}
      </ScrollArea>
      </div>

      {/* Footer actions */}
      <div className={`border-t border-sentinel-border/60 px-4 py-3 flex items-center justify-end gap-2 bg-background/40 ${open ? '' : 'hidden'}`}>
        <Button size="sm" className="bg-sentinel-green hover:bg-sentinel-green/80 text-background">
          <Plus className="w-3 h-3 mr-1" />
          Add Source
        </Button>
      </div>

    </Card>
  );
};
