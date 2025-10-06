import { Plus, Check, X } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { ScrollArea } from "./ui/scroll-area";

const dataSources = [
  { name: "Twitter/X API", status: "connected", type: "Social Media", dataPoints: "1.2M/day" },
  { name: "USGS Earthquake", status: "connected", type: "Seismic", dataPoints: "Real-time" },
  { name: "NOAA Weather", status: "connected", type: "Weather", dataPoints: "Hourly" },
  { name: "Sentinel Satellites", status: "connected", type: "Satellite", dataPoints: "Daily" },
  { name: "IoT Sensors Network", status: "connected", type: "IoT", dataPoints: "5.3M/hour" },
  { name: "Facebook Disaster Maps", status: "pending", type: "Social Media", dataPoints: "N/A" },
  { name: "HERE Maps API", status: "connected", type: "Mapping", dataPoints: "Real-time" },
  { name: "OpenStreetMap", status: "connected", type: "Mapping", dataPoints: "Real-time" },
];

export const DataSourcesPanel = () => {
  return (
    <Card className="p-4 bg-card/50 backdrop-blur-sm border-sentinel-border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <div className="w-2 h-2 bg-sentinel-cyan rounded-full animate-pulse" />
          Data Sources Integration
        </h3>
        <Button
          size="sm"
          className="bg-sentinel-green hover:bg-sentinel-green/80 text-background"
        >
          <Plus className="w-3 h-3 mr-1" />
          Add Source
        </Button>
      </div>

      <ScrollArea className="h-[300px]">
        <div className="space-y-2">
          {dataSources.map((source, i) => (
            <div
              key={i}
              className="p-3 bg-background/50 border border-sentinel-border rounded-lg hover:border-sentinel-green/30 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium">{source.name}</span>
                    {source.status === "connected" ? (
                      <Check className="w-3 h-3 text-sentinel-green" />
                    ) : (
                      <X className="w-3 h-3 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Badge
                      variant="outline"
                      className="text-xs border-sentinel-border"
                    >
                      {source.type}
                    </Badge>
                    <span>{source.dataPoints}</span>
                  </div>
                </div>
                <Badge
                  variant={source.status === "connected" ? "default" : "secondary"}
                  className={
                    source.status === "connected"
                      ? "bg-sentinel-green/20 text-sentinel-green border-sentinel-green/30"
                      : "bg-muted"
                  }
                >
                  {source.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="mt-4 p-3 bg-muted/50 rounded-lg">
        <p className="text-xs text-muted-foreground">
          💡 <strong>Low-Code Integration:</strong> Use our wizard to connect new data sources without coding. Support for REST APIs, WebSockets, and database connections.
        </p>
      </div>
    </Card>
  );
};
