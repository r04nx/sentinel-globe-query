import { useState, useEffect } from "react";
import * as THREE from "three";

export interface GeoJsonOptions {
  json: any;
  radius: number;
  materialOptions?: {
    color?: number | string;
    opacity?: number;
    transparent?: boolean;
  };
}

// Convert latitude and longitude to sphere coordinates
function convertToSphereCoords(coordinates: number[], sphereRadius: number): THREE.Vector3 {
  const lon = coordinates[0];
  const lat = coordinates[1];

  const x = Math.cos(lat * Math.PI / 180) * Math.cos(lon * Math.PI / 180) * sphereRadius;
  const y = Math.cos(lat * Math.PI / 180) * Math.sin(lon * Math.PI / 180) * sphereRadius;
  const z = Math.sin(lat * Math.PI / 180) * sphereRadius;

  return new THREE.Vector3(x, y, z);
}

// Check if two points need interpolation (distance > 5 degrees)
function needsInterpolation(point1: number[], point2: number[]): boolean {
  const lonDistance = Math.abs(point1[0] - point2[0]);
  const latDistance = Math.abs(point1[1] - point2[1]);
  return lonDistance > 5 || latDistance > 5;
}

// Get midpoint between two coordinates
function getMidpoint(point1: number[], point2: number[]): number[] {
  const midpointLon = (point1[0] + point2[0]) / 2;
  const midpointLat = (point1[1] + point2[1]) / 2;
  return [midpointLon, midpointLat];
}

// Recursively interpolate points to avoid lines going through the sphere
function interpolatePoints(points: number[][]): number[][] {
  const tempArray: number[][] = [];
  
  for (let i = 0; i < points.length - 1; i++) {
    const point1 = points[i];
    const point2 = points[i + 1];
    
    if (needsInterpolation(point1, point2)) {
      tempArray.push(point1);
      tempArray.push(getMidpoint(point1, point2));
    } else {
      tempArray.push(point1);
    }
  }
  
  tempArray.push(points[points.length - 1]);
  
  if (tempArray.length > points.length) {
    return interpolatePoints(tempArray);
  }
  
  return tempArray;
}

// Create coordinate array with interpolation
function createCoordinateArray(feature: number[][]): number[][] {
  const tempArray: number[][] = [];
  
  for (let i = 0; i < feature.length; i++) {
    const point1 = feature[i];
    const point2 = feature[i - 1];
    
    if (i > 0) {
      if (needsInterpolation(point2, point1)) {
        const interpolated = interpolatePoints([point2, point1]);
        tempArray.push(...interpolated);
      } else {
        tempArray.push(point1);
      }
    } else {
      tempArray.push(point1);
    }
  }
  
  return tempArray;
}

export function createGeometryFromGeoJSON({ json, radius, materialOptions }: GeoJsonOptions): THREE.BufferGeometry[] {
  const geometries: THREE.BufferGeometry[] = [];
  
  // Extract geometries from different GeoJSON types
  let geoArray: any[] = [];
  
  if (json.type === 'Feature') {
    geoArray.push(json.geometry);
  } else if (json.type === 'FeatureCollection') {
    geoArray = json.features.map((f: any) => f.geometry);
  } else if (json.type === 'GeometryCollection') {
    geoArray = json.geometries;
  } else {
    throw new Error('Invalid GeoJSON format');
  }
  
  // Process each geometry
  for (const geom of geoArray) {
    if (!geom) continue;
    
    if (geom.type === 'Polygon') {
      for (const ring of geom.coordinates) {
        const coordinateArray = createCoordinateArray(ring);
        const vertices: number[] = [];
        
        for (const coord of coordinateArray) {
          const point = convertToSphereCoords(coord, radius);
          vertices.push(point.x, point.y, point.z);
        }
        
        if (vertices.length > 0) {
          const geometry = new THREE.BufferGeometry();
          geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
          geometries.push(geometry);
        }
      }
    } else if (geom.type === 'MultiPolygon') {
      for (const polygon of geom.coordinates) {
        for (const ring of polygon) {
          const coordinateArray = createCoordinateArray(ring);
          const vertices: number[] = [];
          
          for (const coord of coordinateArray) {
            const point = convertToSphereCoords(coord, radius);
            vertices.push(point.x, point.y, point.z);
          }
          
          if (vertices.length > 0) {
            const geometry = new THREE.BufferGeometry();
            geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
            geometries.push(geometry);
          }
        }
      }
    } else if (geom.type === 'LineString') {
      const coordinateArray = createCoordinateArray(geom.coordinates);
      const vertices: number[] = [];
      for (const coord of coordinateArray) {
        const point = convertToSphereCoords(coord, radius);
        vertices.push(point.x, point.y, point.z);
      }
      if (vertices.length > 0) {
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        geometries.push(geometry);
      }
    } else if (geom.type === 'MultiLineString') {
      for (const line of geom.coordinates) {
        const coordinateArray = createCoordinateArray(line);
        const vertices: number[] = [];
        for (const coord of coordinateArray) {
          const point = convertToSphereCoords(coord, radius);
          vertices.push(point.x, point.y, point.z);
        }
        if (vertices.length > 0) {
          const geometry = new THREE.BufferGeometry();
          geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
          geometries.push(geometry);
        }
      }
    }
  }
  
  return geometries;
}

export function useGeoJsonData(url: string) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(url);
        const geoJsonData = await response.json();
        setData(geoJsonData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load GeoJSON data');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [url]);
  
  return { data, loading, error };
}
