import { useState, useRef, useEffect } from "react";
import { Send, Loader2, AlertTriangle, Database } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { sentinelAPI, type ChatResponse } from "@/services/api";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  context?: ChatResponse['context'];
}

export const ChatInterface = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "🌟 Welcome to SENTINEL AI Assistant! I can help you query disaster data, analyze patterns, and generate insights. Try asking:\n\n• 'What disasters are currently active?'\n• 'Show me recent earthquakes above magnitude 6'\n• 'Tell me about flood risks in Asia'\n• 'What's the current disaster situation?'",
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

    try {
      // Use the new SENTINEL API
      const response = await sentinelAPI.sendChatMessage(input);
      
      const assistantMessage: Message = {
        role: 'assistant',
        content: response.reply || 'I apologize, but I couldn\'t process your request right now.',
        timestamp: new Date(),
        context: response.context
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat API Error:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: '⚠️ I\'m having trouble connecting to the disaster intelligence system. The backend service might be starting up or unavailable. Please try again in a moment.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    }

    setIsLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Quick action buttons for common queries
  const quickActions = [
    { label: "Current Status", query: "What's the current disaster situation globally?" },
    { label: "Recent Earthquakes", query: "Show me recent significant earthquakes" },
    { label: "Active Alerts", query: "What weather alerts are currently active?" },
    { label: "Disaster Stats", query: "Give me statistics on recent disasters" }
  ];

  const handleQuickAction = (query: string) => {
    setInput(query);
  };

  return (
    <div className="flex flex-col h-full bg-card/80 backdrop-blur-md border border-sentinel-border">
      {/* Header */}
      <div className="px-6 py-4 border-b border-sentinel-border bg-background/50">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-sentinel-green animate-pulse" />
          <h3 className="font-semibold text-base">SENTINEL AI Assistant</h3>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Natural language interface for disaster intelligence
        </p>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-6" ref={scrollRef}>
        <div className="space-y-4">
          {messages.map((message, i) => (
            <div
              key={i}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[75%] px-5 py-3 ${
                  message.role === "user"
                    ? "bg-sentinel-green/20 border border-sentinel-green/30"
                    : "bg-muted/80 border border-border"
                }`}
              >
                <div className="text-sm leading-relaxed whitespace-pre-wrap">
                  {message.content}
                </div>
                
                {/* Context indicators for assistant messages */}
                {message.role === "assistant" && message.context && (
                  <div className="mt-3 pt-2 border-t border-border/50 flex items-center gap-4 text-xs text-muted-foreground">
                    {message.context.disasters_count > 0 && (
                      <span className="flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        {message.context.disasters_count} disasters
                      </span>
                    )}
                    {message.context.alerts_count > 0 && (
                      <span className="flex items-center gap-1">
                        <Database className="w-3 h-3" />
                        {message.context.alerts_count} alerts
                      </span>
                    )}
                    {message.context.has_current_data && (
                      <span className="text-sentinel-green">• Real-time data</span>
                    )}
                  </div>
                )}

                <span className="text-xs text-muted-foreground mt-2 block">
                  {message.timestamp.toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-muted/80 border border-border px-5 py-3 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-sentinel-green" />
                <span className="text-sm text-muted-foreground">Analyzing disaster data...</span>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Quick Actions */}
      {messages.length === 1 && (
        <div className="px-6 py-3 border-t border-sentinel-border bg-background/30">
          <div className="text-xs text-muted-foreground mb-2">Quick Actions:</div>
          <div className="flex flex-wrap gap-2">
            {quickActions.map((action, i) => (
              <Button
                key={i}
                variant="outline"
                size="sm"
                onClick={() => handleQuickAction(action.query)}
                className="text-xs h-7 bg-background/50 hover:bg-sentinel-green/10 border-sentinel-border/50"
              >
                {action.label}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-6 border-t border-sentinel-border bg-background/50">
        <div className="flex gap-3">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about disasters, data sources, or analytics..."
            className="flex-1 bg-background border-sentinel-border focus:border-sentinel-green text-base h-12"
            disabled={isLoading}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="bg-sentinel-green hover:bg-sentinel-green/80 text-background h-12 px-6"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
