// SENTINEL API Service Client
// Connects frontend components to FastAPI backend

const API_BASE_URL = 'http://localhost:8000';

export interface DisasterData {
  id: string;
  type: string;
  title: string;
  description: string | null;
  severity: string;
  latitude: number;
  longitude: number;
  magnitude: number | null;
  affected_area: number | null;
  casualties: number | null;
  status: string;
  source: string;
  source_url: string | null;
  external_id: string | null;
  occurred_at: string;
  created_at: string;
  updated_at: string;
}

export interface DisasterStats {
  total_disasters: number;
  active_disasters: number;
  by_type: Record<string, number>;
  by_severity: Record<string, number>;
  recent_count: number;
}

export interface ChatMessage {
  message: string;
}

export interface ChatResponse {
  reply: string;
  context?: {
    disasters_count: number;
    alerts_count: number;
    news_count: number;
    has_current_data: boolean;
  };
}

class SentinelAPI {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  // Generic fetch wrapper with error handling
  private async fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error);
      throw error;
    }
  }

  // Health check
  async getHealth() {
    return this.fetchAPI('/health');
  }

  // Disaster endpoints
  async getDisasters(params?: {
    type?: string;
    severity?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<DisasterData[]> {
    const queryParams = new URLSearchParams();
    if (params?.type) queryParams.append('type', params.type);
    if (params?.severity) queryParams.append('severity', params.severity);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());

    const query = queryParams.toString();
    return this.fetchAPI(`/api/disasters/${query ? `?${query}` : ''}`);
  }

  async getRecentDisasters(days: number = 7): Promise<DisasterData[]> {
    return this.fetchAPI(`/api/disasters/recent?days=${days}`);
  }

  async getDisastersForMap(bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
    type?: string;
    severity?: string;
  }): Promise<DisasterData[]> {
    const { north, south, east, west, type, severity } = bounds;
    const params = new URLSearchParams({
      north: north.toString(),
      south: south.toString(),
      east: east.toString(),
      west: west.toString(),
    });
    
    if (type) params.append('type', type);
    if (severity) params.append('severity', severity);

    return this.fetchAPI(`/api/disasters/map?${params.toString()}`);
  }

  async getDisasterStats(): Promise<DisasterStats> {
    return this.fetchAPI('/api/disasters/stats');
  }

  async getDisasterTypes(): Promise<{ types: string[] }> {
    return this.fetchAPI('/api/disasters/types');
  }

  async getDisasterById(id: string): Promise<DisasterData> {
    return this.fetchAPI(`/api/disasters/${id}`);
  }

  // Chat endpoints
  async sendChatMessage(message: string): Promise<ChatResponse> {
    return this.fetchAPI('/api/chat/', {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  }

  async getDisasterSummary(): Promise<{ summary: string }> {
    return this.fetchAPI('/api/chat/summary');
  }

  // Crawler endpoints
  async triggerCrawl(): Promise<{ message: string }> {
    return this.fetchAPI('/api/crawler/crawl', {
      method: 'POST',
    });
  }

  async crawlEarthquakes(): Promise<{ message: string }> {
    return this.fetchAPI('/api/crawler/crawl/earthquakes', {
      method: 'POST',
    });
  }

  async crawlWeather(): Promise<{ message: string }> {
    return this.fetchAPI('/api/crawler/crawl/weather', {
      method: 'POST',
    });
  }

  async crawlFires(): Promise<{ message: string }> {
    return this.fetchAPI('/api/crawler/crawl/fires', {
      method: 'POST',
    });
  }

  // Utility methods
  getDisasterColor(severity: string): string {
    switch (severity.toLowerCase()) {
      case 'critical': return '#ff0000';
      case 'high': return '#ff8800';
      case 'medium': return '#ffaa00';
      case 'low': return '#ffff00';
      default: return '#888888';
    }
  }

  formatDisasterTitle(disaster: DisasterData): string {
    if (disaster.magnitude) {
      return `M${disaster.magnitude} ${disaster.type.charAt(0).toUpperCase() + disaster.type.slice(1)}`;
    }
    return disaster.title;
  }
}

// Create and export singleton instance
export const sentinelAPI = new SentinelAPI();

// Export types for use in components
export type { DisasterData, DisasterStats, ChatResponse };
