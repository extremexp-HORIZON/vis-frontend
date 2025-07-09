import Supercluster from 'supercluster';
import { useEffect, useState } from 'react';

export const MAX_ZOOM = 18; // Define MAX_ZOOM as a constant

// Defined IPointType according to what RawVis backend returns
export type IPointType = [
  number,
  number,
  number,
  string | null,
  number | null,
  number | null,
  string[] | string[][],
];

export type ISuperclusterFeatureProperties = {
  totalCount: number;
  points: IPointType[];
  [key: string]:
    | string
    | (string | number | IPointType)[]
    | number
    | IPointType[]
    | null; // to allow dynamic dimensions and measures
};

export interface ISuperclusterFeature {
  type: 'Feature';
  geometry: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  properties: ISuperclusterFeatureProperties;
}

export function omit<T extends object, K extends keyof T>(
  obj: T,
  keysToOmit: K[],
): Omit<T, K> {
  return Object.fromEntries(
    Object.entries(obj).filter(([key]) => !keysToOmit.includes(key as K)),
  ) as Omit<T, K>;
}

export const prepareSupercluster = (
  points: IPointType[],
  measure0: string,
  measure1: string,
  dimensions: string[],
) => {
  const geoJsonPoints = points.map(point => {
    const geoJsonPoint = {
      type: 'Feature',
      properties: { totalCount: point[2], points: [point] },
      geometry: {
        type: 'Point',
        coordinates: [point[1], point[0]],
      },
    } as ISuperclusterFeature;

    geoJsonPoint.properties[measure0] = point[4];
    geoJsonPoint.properties[measure1] = point[5];

    dimensions.forEach((dim, index) => {
      geoJsonPoint.properties[dim] = point[6][index];
    });

    return geoJsonPoint;
  });

  const supercluster = new Supercluster({
    log: false,
    radius: 60,
    extent: 256,
    maxZoom: MAX_ZOOM,
    minPoints: 3,
    reduce(accumulated: ISuperclusterFeatureProperties, props) {
      accumulated.totalCount += props.totalCount;
      accumulated.points = accumulated.points.concat(props.points);

      dimensions.forEach(dim => {
        let accumValues = accumulated[dim] || [];
        let propValues = props[dim] || [];

        // Ensure both are arrays
        accumValues = Array.isArray(accumValues) ? accumValues : [accumValues];
        propValues = Array.isArray(propValues) ? propValues : [propValues];

        // Combine and deduplicate
        const uniqueValues = new Set([...accumValues, ...propValues]);

        accumulated[dim] = Array.from(uniqueValues);
      });

      const measure0Values = accumulated.points
        .map(point => point[4])
        .filter(val => val !== null);

      accumulated[measure0] =
        measure0Values.length > 0
          ? measure0Values.reduce((acc, val) => acc + val, 0) /
            measure0Values.length
          : null;

      const measure1Values = accumulated.points
        .map(point => point[5])
        .filter(val => val !== null);

      accumulated[measure1] =
        measure1Values.length > 0
          ? measure1Values.reduce((acc, val) => acc + val, 0) /
            measure1Values.length
          : null;
    },
  });

  supercluster.load(geoJsonPoints);

  return supercluster;
};

// hooks

export function useDebounce<T>(value: T, delay?: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay || 500);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
