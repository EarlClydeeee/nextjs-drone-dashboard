export type HeatmapPoint = {
  id: string;
  label: string;
  /** Position as percentage of map container (0–100) */
  x: number;
  y: number;
  /** Visual radius as percentage of map width */
  radius: number;
  intensity: number;
  sqMeters: number;
  estimatedTrucks: number;
  volumeMass: string;
  flowReductionPct: number;
};
