import { AlertTriangle, Activity, Database, Satellite } from "lucide-react";
import { Card } from "./ui/card";

const stats = [
  {
    label: "Active Disasters",
    value: "23",
    change: "+5",
    icon: AlertTriangle,
    color: "text-destructive"
  },
  {
    label: "Data Sources",
    value: "147",
    change: "+12",
    icon: Database,
    color: "text-sentinel-cyan"
  },
  {
    label: "Real-time Feeds",
    value: "1,247",
    change: "+89",
    icon: Activity,
    color: "text-sentinel-green"
  },
  {
    label: "Satellites Online",
    value: "34",
    change: "100%",
    icon: Satellite,
    color: "text-warning"
  }
];

export const StatsPanel = () => {
  return (
    <div className="grid gap-3 grid-cols-[repeat(auto-fill,minmax(180px,1fr))]">
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <Card
            key={i}
            className="p-3 bg-card/60 backdrop-blur-sm border-sentinel-border/80 hover:border-sentinel-green/50 transition-colors rounded-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] text-muted-foreground mb-0.5">{stat.label}</p>
                <p className="text-xl font-bold leading-none">{stat.value}</p>
                <span className="text-[11px] text-sentinel-green">{stat.change}</span>
              </div>
              <div className={`p-2 bg-background/70 border border-sentinel-border/60 rounded-md shadow-sm ${stat.color}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};
