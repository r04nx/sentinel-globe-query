import { useState, useRef, useEffect } from "react";
import { Send, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export const ChatInterface = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Welcome to SENTINEL. I can help you query disaster data, analyze patterns, and generate insights. Try asking: 'Show flood-affected areas with rainfall >100mm in the last 24 hours'",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const responses = [
        "I've analyzed the data. Found 15 flood-affected regions with rainfall exceeding 100mm. The most critical areas are in Maharashtra (3 zones), Kerala (2 zones), and Assam (4 zones). Real-time satellite data shows water levels rising at 2.3cm/hour.",
        "Processing your query... I've identified 23 seismic events in the last 48 hours. 3 earthquakes above 4.5 magnitude detected in the Pacific Ring of Fire. No tsunami warnings issued. Detailed geological analysis available.",
        "Social media analysis complete. Detected 1,247 distress signals across affected areas. 89% verified through cross-referencing with official sources. Emergency response teams have been alerted to 15 critical zones.",
        "Historical pattern analysis shows this event matches 2019 disaster profile with 87% similarity. Predictive models suggest peak intensity will occur in 6-8 hours. Evacuation recommendations generated for 12 high-risk zones."
      ];

      const assistantMessage: Message = {
        role: "assistant",
        content: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-card/50 backdrop-blur-sm border border-sentinel-border rounded-lg">
      {/* Header */}
      <div className="px-4 py-3 border-b border-sentinel-border">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-sentinel-green rounded-full animate-pulse" />
          <h3 className="font-semibold text-sm">AI Query Engine</h3>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Natural language interface for disaster intelligence
        </p>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.map((message, i) => (
            <div
              key={i}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                  message.role === "user"
                    ? "bg-sentinel-green/20 border border-sentinel-green/30"
                    : "bg-muted border border-border"
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <span className="text-xs text-muted-foreground mt-1 block">
                  {message.timestamp.toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-muted border border-border rounded-lg px-4 py-2 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-sentinel-green" />
                <span className="text-sm text-muted-foreground">Processing query...</span>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t border-sentinel-border">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about disasters, data sources, or analytics..."
            className="flex-1 bg-background border-sentinel-border focus:border-sentinel-green"
            disabled={isLoading}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="bg-sentinel-green hover:bg-sentinel-green/80 text-background"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
