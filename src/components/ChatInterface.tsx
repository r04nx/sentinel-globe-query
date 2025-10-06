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

    try {
      const res = await fetch('/api/suggest', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt: input }) });
      const data = await res.json();
      const assistantMessage: Message = { role: 'assistant', content: data.reply || 'OK', timestamp: new Date() };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (e) {
      const assistantMessage: Message = { role: 'assistant', content: 'Backend unavailable. Please try again later.', timestamp: new Date() };
      setMessages(prev => [...prev, assistantMessage]);
    }
    setIsLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-card/80 backdrop-blur-md border border-sentinel-border">
      {/* Header */}
      <div className="px-6 py-4 border-b border-sentinel-border bg-background/50">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-sentinel-green animate-pulse" />
          <h3 className="font-semibold text-base">AI Query Engine</h3>
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
                <p className="text-sm leading-relaxed">{message.content}</p>
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
                <span className="text-sm text-muted-foreground">Processing query...</span>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

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
