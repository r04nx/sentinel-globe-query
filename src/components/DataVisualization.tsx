import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Card } from "./ui/card";

const disasterData = [
  { month: "Jan", floods: 12, earthquakes: 5, fires: 8, storms: 15 },
  { month: "Feb", floods: 15, earthquakes: 3, fires: 12, storms: 18 },
  { month: "Mar", floods: 18, earthquakes: 7, fires: 10, storms: 22 },
  { month: "Apr", floods: 25, earthquakes: 4, fires: 15, storms: 28 },
  { month: "May", floods: 30, earthquakes: 8, fires: 20, storms: 35 },
  { month: "Jun", floods: 28, earthquakes: 6, fires: 25, storms: 32 },
];

const severityData = [
  { time: "00:00", severity: 45 },
  { time: "04:00", severity: 52 },
  { time: "08:00", severity: 68 },
  { time: "12:00", severity: 75 },
  { time: "16:00", severity: 82 },
  { time: "20:00", severity: 78 },
];

export const DataVisualization = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card className="p-4 bg-card/50 backdrop-blur-sm border-sentinel-border">
        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
          <div className="w-2 h-2 bg-sentinel-green rounded-full" />
          Disaster Events by Type
        </h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={disasterData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--sentinel-border))" />
            <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
            <YAxis stroke="hsl(var(--muted-foreground))" />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--sentinel-border))",
                borderRadius: "8px",
              }}
            />
            <Legend />
            <Bar dataKey="floods" fill="hsl(var(--sentinel-cyan))" />
            <Bar dataKey="earthquakes" fill="hsl(var(--destructive))" />
            <Bar dataKey="fires" fill="hsl(var(--warning))" />
            <Bar dataKey="storms" fill="hsl(var(--sentinel-green))" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card className="p-4 bg-card/50 backdrop-blur-sm border-sentinel-border">
        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
          <div className="w-2 h-2 bg-sentinel-cyan rounded-full" />
          Real-time Severity Index
        </h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={severityData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--sentinel-border))" />
            <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" />
            <YAxis stroke="hsl(var(--muted-foreground))" />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--sentinel-border))",
                borderRadius: "8px",
              }}
            />
            <Line
              type="monotone"
              dataKey="severity"
              stroke="hsl(var(--sentinel-green))"
              strokeWidth={2}
              dot={{ fill: "hsl(var(--sentinel-green))", r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
};
