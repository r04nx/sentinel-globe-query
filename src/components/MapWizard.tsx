import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";

export type GlobeConfig = {
  basemap: 'none' | 'osm-dark' | 'osm-light' | 'nasa';
  showGrid: boolean;
  showOutlines: boolean;
  showLandMasses: boolean;
  globeOpacity: number; // 0..1
  autoRotate: boolean;
  autoRotateSpeed: number; // radians per frame multiplier
  starfieldDensity: number; // number of stars
};

export const defaultGlobeConfig: GlobeConfig = {
  basemap: 'none',
  showGrid: true,
  showOutlines: true,
  showLandMasses: true,
  globeOpacity: 0.7,
  autoRotate: true,
  autoRotateSpeed: 0.001,
  starfieldDensity: 1000
};

export function MapWizard({ initial, onApply, onClose }: { initial: GlobeConfig; onApply: (cfg: GlobeConfig) => void; onClose: () => void; }) {
  const [cfg, setCfg] = useState<GlobeConfig>(initial);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center">
      <div className="w-[520px] bg-background border border-sentinel-border rounded-lg shadow-xl p-6 space-y-5 max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-semibold">Globe Map Wizard</h2>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Basemap Source</label>
            <Select value={cfg.basemap} onValueChange={(v) => setCfg({ ...cfg, basemap: v as GlobeConfig['basemap'] })}>
              <SelectTrigger className="w-full"><SelectValue placeholder="Select basemap" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None (vector only)</SelectItem>
                <SelectItem value="osm-dark">OSM Dark (Carto)</SelectItem>
                <SelectItem value="osm-light">OSM Light (Carto)</SelectItem>
                <SelectItem value="nasa">NASA Blue Marble</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3 border-t pt-3">
            <h3 className="text-sm font-medium text-muted-foreground">Visual Elements</h3>
            
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm">Show Grid</div>
                <div className="text-xs text-muted-foreground">Latitude/Longitude grid</div>
              </div>
              <Switch checked={cfg.showGrid} onCheckedChange={(v) => setCfg({ ...cfg, showGrid: v })} />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm">Show Outlines</div>
                <div className="text-xs text-muted-foreground">Country vector borders</div>
              </div>
              <Switch checked={cfg.showOutlines} onCheckedChange={(v) => setCfg({ ...cfg, showOutlines: v })} />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm">Show Land Masses</div>
                <div className="text-xs text-muted-foreground">GeoJSON land rendering</div>
              </div>
              <Switch checked={cfg.showLandMasses} onCheckedChange={(v) => setCfg({ ...cfg, showLandMasses: v })} />
            </div>
          </div>

          <div className="space-y-3 border-t pt-3">
            <h3 className="text-sm font-medium text-muted-foreground">Appearance</h3>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-sm">Globe Opacity</div>
                <div className="text-xs text-muted-foreground">{Math.round(cfg.globeOpacity * 100)}%</div>
              </div>
              <Slider value={[cfg.globeOpacity]} min={0.05} max={1} step={0.05} onValueChange={(v) => setCfg({ ...cfg, globeOpacity: v[0] })} />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-sm">Starfield Density</div>
                <div className="text-xs text-muted-foreground">{cfg.starfieldDensity} stars</div>
              </div>
              <Slider 
                value={[cfg.starfieldDensity]} 
                min={100} 
                max={3000} 
                step={100} 
                onValueChange={(v) => setCfg({ ...cfg, starfieldDensity: v[0] })} 
              />
            </div>
          </div>

          <div className="space-y-3 border-t pt-3">
            <h3 className="text-sm font-medium text-muted-foreground">Animation</h3>
            
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm">Auto Rotate</div>
                <div className="text-xs text-muted-foreground">Spin the globe automatically</div>
              </div>
              <Switch checked={cfg.autoRotate} onCheckedChange={(v) => setCfg({ ...cfg, autoRotate: v })} />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-sm">Rotate Speed</div>
                <div className="text-xs text-muted-foreground">{cfg.autoRotateSpeed.toFixed(3)} rad/frame</div>
              </div>
              <Slider 
                value={[cfg.autoRotateSpeed]} 
                min={0.0002} 
                max={0.004} 
                step={0.0002} 
                onValueChange={(v) => setCfg({ ...cfg, autoRotateSpeed: v[0] })} 
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={() => onApply(cfg)} className="bg-sentinel-green hover:bg-sentinel-green/80">
            Apply Changes
          </Button>
        </div>
      </div>
    </div>
  );
}
