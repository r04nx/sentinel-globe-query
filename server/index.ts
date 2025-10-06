import express from 'express';
import cors from 'cors';
import { z } from 'zod';

const app = express();
app.use(cors());
app.use(express.json());

// Schema for events that LLM or other services must emit
const EventSchema = z.object({
  id: z.union([z.string(), z.number()]),
  type: z.enum(['flood','earthquake','fire','storm']),
  severity: z.number().min(0).max(1),
  lat: z.number().min(-90).max(90),
  lon: z.number().min(-180).max(180),
  timestamp: z.number(),
});

const EventsResponseSchema = z.object({ items: z.array(EventSchema) });

// Mock disaster events around Mumbai
app.get('/api/events', (req, res) => {
  const { from, to, bbox } = req.query;
  // generate simple mock points
  const base = [19.0760, 72.8777];
  const types: Array<'flood'|'earthquake'|'fire'|'storm'> = ['flood','earthquake','fire','storm'];
  const items = Array.from({ length: 120 }).map((_, i) => ({
    id: i + 1,
    type: types[i % types.length],
    severity: Math.random() * 0.6 + 0.2,
    lat: base[0] + (Math.random() - 0.5) * 0.5,
    lon: base[1] + (Math.random() - 0.5) * 0.5,
    timestamp: Date.now() - Math.floor(Math.random() * 1000 * 60 * 60 * 24)
  }));
  const payload = { items };
  const parsed = EventsResponseSchema.safeParse(payload);
  if (!parsed.success) return res.status(400).json({ error: 'invalid data', issues: parsed.error.issues });
  res.json(payload);
});

// Very naive chat suggestion endpoint
app.post('/api/suggest', (req, res) => {
  const { prompt } = req.body || {};
  const replies = [
    'Aggregated latest disaster feeds and highlighted top-5 hotspots on the map.',
    'Applied filters: last 24 hours and severity > 0.5. You can adjust in the control panel.',
    'For Mumbai, rainfall anomalies detected in the northeast corridor. Consider flood watch.'
  ];
  res.json({ reply: replies[Math.floor(Math.random() * replies.length)] });
});

const port = process.env.PORT || 5175;
app.listen(port, () => console.log(`API listening on :${port}`));


