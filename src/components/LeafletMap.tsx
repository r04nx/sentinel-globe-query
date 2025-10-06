import { useEffect, useRef } from "react";

export const LeafletMap = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let map: any;
    (async () => {
      const L = await import("leaflet");
      await import("leaflet/dist/leaflet.css");
      if (!containerRef.current) return;

      // Base map - dark theme
      // Keep container dark before tiles load to avoid white flash
      containerRef.current.style.background = '#05080f';
      map = L.map(containerRef.current, { zoomControl: true, scrollWheelZoom: true, attributionControl: false });
      const mumbai = [19.0760, 72.8777];
      map.setView(mumbai as any, 12);

      // CartoDB Dark Matter tiles (attractive dark theme)
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap, © CARTO',
        subdomains: 'abcd',
        maxZoom: 20,
        crossOrigin: true
      }).addTo(map);

      // Neon marker icon matching theme
      const pin = L.divIcon({
        className: 'neon-pin',
        html: '<div style="position:relative;width:14px;height:14px;border-radius:50%;background:#00ffa3;box-shadow:0 0 10px #00ffa3;transform:translate(-50%,-50%) rotate(45deg);"><span style="position:absolute;bottom:-6px;left:50%;width:2px;height:8px;background:#00ffa3;box-shadow:0 0 6px #00ffa3;transform:translateX(-50%)"></span></div>',
        iconSize: [14, 14] as any,
        iconAnchor: [7, 7] as any,
      });

      // Load local Mumbai GeoJSON and style roads abstractly
      try {
        // Load Mumbai skeleton
        const resp = await fetch('/mumbai.geojson');
        const gj = await resp.json();
        // Vibrant neon palette tuned for dark background
        const roadColors: Record<string, string> = {
          motorway: '#ff4d4d',      // vivid red
          trunk: '#ff9a3c',         // orange
          primary: '#ffd23f',       // amber
          secondary: '#8dff57',     // lime
          tertiary: '#35ffd2',      // aqua
          residential: '#47b3ff',   // sky
          service: '#b57bff',       // violet
          footway: '#ff66d9',       // magenta
        };
        const weightByClass: Record<string, number> = {
          motorway: 2.8, trunk: 2.4, primary: 2.2, secondary: 1.8, tertiary: 1.4, residential: 1.1, service: 1, footway: 0.8
        };

        const layer = (await import('leaflet')).geoJSON(gj as any, {
          style: (feature: any) => {
            const hw = feature?.properties?.highway || feature?.properties?.road || feature?.properties?.class;
            const color = roadColors[hw] || '#00ffa3';
            const weight = weightByClass[hw] || 1.2;
            return { color, weight, opacity: 0.95, fill: false, lineCap: 'round', lineJoin: 'round' } as any; // no polygon fill
          }
        }).addTo(map);

        // Fit to Mumbai data bounds on first load and drop a center marker
        try { map.fitBounds((layer as any).getBounds(), { padding: [40, 40] as any }); } catch {}
        try {
          const c = (layer as any).getBounds().getCenter();
          L.marker([c.lat, c.lng], { icon: pin }).addTo(map);
        } catch {}

        // Legend control matching app theme
        const legend = L.control({ position: 'bottomleft' });
        legend.onAdd = function () {
          const div = L.DomUtil.create('div', 'leaflet-legend');
          div.style.background = 'rgba(0,0,0,0.6)';
          div.style.border = '1px solid #1de9b6';
          div.style.borderRadius = '6px';
          div.style.padding = '6px 8px';
          div.style.color = '#cfe';
          div.style.fontSize = '11px';
          (div.style as any).zIndex = 1000;
          div.innerHTML = '<div style="margin-bottom:4px;color:#aaffee">Mumbai Layers</div>' +
            Object.entries(roadColors).map(([k, v]) => `<div style="display:flex;align-items:center;gap:6px"><span style="width:12px;height:2px;background:${v};display:inline-block"></span><span>${k}</span></div>`).join('');
          return div;
        } as any;
        legend.addTo(map);
      } catch (e) {
        // ignore if not present
      }

      // Load events from backend and render pins with type-specific colors and breathing animation
      try {
        const from = Date.now() - 1000 * 60 * 60 * 24;
        const events = await fetch(`/api/events?from=${from}`).then(r => r.json());
        const colors: Record<string,string> = { flood: '#47b3ff', earthquake: '#ff4d4d', fire: '#ff8a1f', storm: '#35ffd2' };
        for (const it of events.items || []) {
          const c = colors[it.type] || '#00ffa3';
          const html = `<div class="pulse-pin" style="--pin:${c}"></div>`;
          const icon = L.divIcon({ className: 'neon-pin', html, iconSize: [16,16] as any, iconAnchor: [8,8] as any });
          const marker = L.marker([it.lat, it.lon], { icon }).addTo(map);
          marker.bindPopup(`<div><strong>${it.type.toUpperCase()}</strong><br/>Severity: ${(it.severity * 100).toFixed(0)}%<br/>${new Date(it.timestamp).toLocaleString()}</div>`);
        }
      } catch {}

      // Subtle neon cursor on map container
      if (containerRef.current) {
        containerRef.current.style.cursor = 'url("data:image/svg+xml;utf8,<svg xmlns=\\"http://www.w3.org/2000/svg\\" width=\\"32\\" height=\\"32\\" viewBox=\\"0 0 32 32\\"><polygon points=\\"4,4 8,22 14,16\\" fill=\\"%23001010\\" stroke=\\"%2300ffa3\\" stroke-width=\\"2\\"/><polygon points=\\"4,4 8,22 14,16\\" fill=\\"%2300ffa3\\" opacity=\\"0.18\\"/></svg>") 4 4, auto';
      }
    })();
    return () => { if (map) map.remove(); };
  }, []);

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />;
};


