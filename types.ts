
export type Side = 'LONG' | 'SHORT';
export type Status = 'WIN' | 'LOSS' | 'BE';

export interface Trade {
  id: string;
  accountId: string; // Linked account ID
  date: string;
  symbol: string;
  side: Side;
  status: Status;
  netPL: number;
  contracts: number;
  duration: string;
  mae: number;
  mfe: number;
  setup: string;
  mistakes?: string[];
  rating?: number;
  screenshot?: string; // Base64 string of the uploaded image
}

export interface ChartDataPoint {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface PLPoint {
  time: string;
  value: number;
}

export interface NewsEvent {
  id: string;
  time: string;
  currency: string;
  asset?: string; // Specific instrument like GC, NQ, ES
  event: string;
  impact: 'HIGH' | 'MED' | 'LOW';
  forecast?: string;
  previous?: string;
  description?: string;
  typicalReaction?: string;
}
