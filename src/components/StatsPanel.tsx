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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <Card
            key={i}
            className="p-4 bg-card/50 backdrop-blur-sm border-sentinel-border hover:border-sentinel-green/50 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
                <span className="text-xs text-sentinel-green">{stat.change}</span>
              </div>
              <div className={`p-2 bg-background rounded-lg ${stat.color}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};
