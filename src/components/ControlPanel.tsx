import { Settings, Filter, Download, RefreshCw, ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Slider } from "./ui/slider";
import { Card } from "./ui/card";
import { toast } from "sonner";
import jsPDF from "jspdf";

export const ControlPanel = () => {
  const [open, setOpen] = useState(false);
  const handleExportPDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.text("SENTINEL - Disaster Report", 20, 20);
    
    doc.setFontSize(12);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 20, 35);
    
    doc.setFontSize(14);
    doc.text("Active Disasters: 23", 20, 50);
    doc.text("Data Sources: 147", 20, 60);
    doc.text("Real-time Feeds: 1,247", 20, 70);
    doc.text("Satellites Online: 34", 20, 80);
    
    doc.text("Critical Alerts:", 20, 100);
    doc.setFontSize(10);
    doc.text("- Flood warning: Maharashtra (Severity: High)", 20, 110);
    doc.text("- Earthquake detected: Pacific Ring (Magnitude: 4.8)", 20, 120);
    doc.text("- Storm system forming: Bay of Bengal", 20, 130);
    
    doc.save("sentinel-report.pdf");
    toast.success("Report exported successfully");
  };

  const handleRefresh = () => {
    toast.success("Data refreshed");
  };

  return (
    <Card className="p-0 bg-card/60 backdrop-blur-sm border-sentinel-border/80 rounded-lg overflow-hidden">
      <button
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-sentinel-green/5 transition-colors"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-controls="control-panel-content"
      >
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <Settings className="w-4 h-4" />
          Control Panel
        </h3>
        {open ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
      </button>

      <div id="control-panel-content" className={`px-4 pb-4 ${open ? 'animate-in fade-in-10 slide-in-from-top-1 duration-200' : 'hidden'}`}>
        <div className="space-y-4 pt-2">
          <div>
            <label className="text-xs text-muted-foreground mb-2 block">Disaster Type Filter</label>
            <Select defaultValue="all">
              <SelectTrigger className="bg-background/70 border-sentinel-border/80 hover:border-sentinel-green/40">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="flood">Floods</SelectItem>
                <SelectItem value="earthquake">Earthquakes</SelectItem>
                <SelectItem value="fire">Fires</SelectItem>
                <SelectItem value="storm">Storms</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-xs text-muted-foreground mb-2 block">Severity Threshold</label>
            <Slider
              defaultValue={[50]}
              max={100}
              step={1}
              className="[&_[role=slider]]:bg-sentinel-green [&_[role=slider]]:border-sentinel-green"
            />
          </div>

          <div>
            <label className="text-xs text-muted-foreground mb-2 block">Time Range</label>
            <Select defaultValue="24h">
              <SelectTrigger className="bg-background/70 border-sentinel-border/80 hover:border-sentinel-green/40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1h">Last Hour</SelectItem>
                <SelectItem value="24h">Last 24 Hours</SelectItem>
                <SelectItem value="7d">Last 7 Days</SelectItem>
                <SelectItem value="30d">Last 30 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 border-sentinel-border/80 hover:bg-sentinel-green/10 hover:text-sentinel-green"
              onClick={handleRefresh}
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              Refresh
            </Button>
            <Button
              size="sm"
              className="flex-1 bg-sentinel-green hover:bg-sentinel-green/80 text-background"
              onClick={handleExportPDF}
            >
              <Download className="w-3 h-3 mr-1" />
              Export PDF
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};
