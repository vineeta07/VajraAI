
export enum SchemeType {
  PROCUREMENT = 'Procurement',
  WELFARE = 'Welfare',
  SPENDING = 'Spending',
  ALL = 'All'
}

export enum RiskStatus {
  PENDING = 'Pending',
  INVESTIGATING = 'Investigating',
  BLOCKED = 'Blocked',
  FALSE_POSITIVE = 'False Positive'
}

export interface RiskAnomaly {
  id: string;
  tenderId: string;
  score: number;
  reason: string;
  district: string;
  scheme: SchemeType;
  amount: number;
  contractor: string;
  timestamp: string;
  status: RiskStatus;
}

export interface DistrictStats {
  id: string;
  name: string;
  riskScore: number;
  totalAnomalies: number;
  savingsBlocked: number;
  coordinates: [number, number][];
}

export interface NetworkNode {
  id: string;
  name: string;
  type: 'firm' | 'tender' | 'official';
  val: number;
  risk?: number;
}

export interface NetworkLink {
  source: string;
  target: string;
  value: number;
}

export interface SavingsState {
  blocked: number;
  ghosts: number;
  firs: number;
}
