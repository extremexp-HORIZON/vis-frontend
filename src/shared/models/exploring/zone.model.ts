import type { IRectangle } from './rectangle.model';

export interface IZone {
  id?: string;
  fileName?: string;
  name?: string;
  type?: string;
  description?: string;
  status?: string;
  createdAt?: string;
  heights?: number[];
  geohashes?: string[];
  rectangle?: IRectangle;
}

export const defaultValue: Readonly<IZone> = {};
