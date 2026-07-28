export type TimeframeKey = 'H4' | 'H1' | 'M15';

export type StrategyType = 
  | 'SMC' // Smart Money Concepts
  | 'PRICE_ACTION' // Classic Price Action & Patterns
  | 'ICT' // Inner Circle Trader (Power of 3, Silver Bullet)
  | 'SUPPLY_DEMAND' // Supply & Demand Imbalance
  | 'BREAKOUT_TREND' // Trend Following & Key Level Breakout
  | 'HARMONIC'; // Harmonic Patterns & Fibonacci

export interface ChartImageInput {
  h4Image: string | null; // base64 or data URL
  h1Image: string | null;
  m15Image: string | null;
}

export type SignalType = 'BUY' | 'SELL' | 'NO_TRADE';

export interface MarketStructureTimeframe {
  timeframe: string; // "H4", "H1", "M15"
  trend: 'Bullish' | 'Bearish' | 'Sideways / Ranging';
  summary: string; // Thai description
  keyLevel: string; // e.g. "Order Block 2380.00"
}

export interface TradeSetup {
  entryType: 'Limit Order' | 'Market Execution' | 'Stop Order';
  entryPrice: string; // e.g. "2385.50" or "2385.00 - 2386.50"
  entryPriceValue: number;
  stopLoss: string; // e.g. "2380.00"
  stopLossValue: number;
  takeProfit1: string; // e.g. "2394.00"
  takeProfit1Value: number;
  takeProfit2: string; // e.g. "2402.00"
  takeProfit2Value: number;
  takeProfit3: string; // e.g. "2415.00"
  takeProfit3Value: number;
  riskRewardRatio: string; // e.g. "1 : 3.2"
  estimatedPipsSL: number;
  recommendedRiskPercent: string; // e.g. "1.0% - 2.0%"
}

export interface SummaryConditionRow {
  step: number;
  topic: string; // e.g. "1. Multi-Timeframe Alignment (H4 -> H1)"
  conditionMet: boolean;
  timeframe: string;
  details: string; // Thai explanation
  ruleType: string; // e.g. "Higher TF Bias", "Liquidity Sweep", "Entry Trigger"
}

export interface KeyZoneOverlay {
  id: string;
  type: 'ORDER_BLOCK' | 'FAIR_VALUE_GAP' | 'LIQUIDITY_SWEEP' | 'CHOCH' | 'SUPPORT_RESISTANCE' | 'TRENDLINE';
  label: string;
  timeframe: string;
  yPercentMin: number; // 0-100 from top of image
  yPercentMax: number; // 0-100 from top of image
  xPercentMin: number; // 0-100 from left of image
  xPercentMax: number; // 0-100 from left of image
  colorHex: string;
}

export interface ChartOverlayCoordinates {
  entryYPercent: number; // 0 - 100
  slYPercent: number; // 0 - 100
  tp1YPercent: number; // 0 - 100
  tp2YPercent: number; // 0 - 100
  tp3YPercent: number; // 0 - 100
  keyZones: KeyZoneOverlay[];
}

export interface AnalysisResult {
  id: string;
  timestamp: string;
  symbol: string; // e.g. "XAU/USD (Gold)"
  strategyUsed: StrategyType;
  signal: SignalType;
  confidenceScore: number; // 0 - 100
  overallReasoning: string; // Short summary in Thai
  marketStructure: MarketStructureTimeframe[];
  tradeSetup: TradeSetup;
  confluences: string[]; // List of Thai reasons supporting trade
  summaryConditions: SummaryConditionRow[];
  invalidationScenario: string; // When trade is invalid
  tradeManagement: string; // E.g. Move SL to BE at TP1
  overlayCoords?: ChartOverlayCoordinates;
  images: ChartImageInput;
}

export interface SampleChartPreset {
  id: string;
  name: string;
  symbol: string;
  description: string;
  strategy: StrategyType;
  h4Url: string;
  h1Url: string;
  m15Url: string;
}

export type SubscriptionPlanType = 'FREE' | 'PRO_MONTHLY' | 'PRO_ANNUAL';

export interface SubscriptionPricingTier {
  id: SubscriptionPlanType;
  name: string;
  badge?: string;
  isPopular?: boolean;
  priceThb: number;
  priceUsd: number;
  period: string;
  description: string;
  features: string[];
  recommended?: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  apiKey?: string; // Personal Gemini API Key
  plan: SubscriptionPlanType;
  dailyAnalysisCount: number;
  dailyQuotaLimit: number; // 3 for FREE, Infinity/999 for PRO
  subscriptionExpiresAt?: string;
  isLoggedIn: boolean;
}

export interface PaymentTransaction {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  plan: SubscriptionPlanType;
  amountThb: number;
  method: 'PROMPTPAY' | 'CREDIT_CARD';
  status: 'APPROVED' | 'PENDING' | 'REJECTED';
  timestamp: string;
  referenceCode: string;
}

export interface AnalysisLogItem {
  id: string;
  userId: string;
  userName: string;
  symbol: string;
  strategy: StrategyType;
  signal: SignalType;
  confidenceScore: number;
  timestamp: string;
}

export interface AdminOverviewStats {
  totalUsers: number;
  totalVipUsers: number;
  totalRevenueThb: number;
  totalAnalysesCount: number;
  todayAnalysesCount: number;
  pendingPaymentsCount: number;
}

export type AuditRecommendation = 'HOLD' | 'PARTIAL_CLOSE' | 'CLOSE_NOW';

export interface PositionAuditRequest {
  chartImage: string; // base64 or data URL
  orderType: 'BUY' | 'SELL';
  timeframe: string; // e.g., "M15", "H1", "H4"
  symbol?: string; // e.g. "XAU/USD"
  entryPrice?: string;
  currentPrice?: string;
  stopLoss?: string;
  takeProfit?: string;
  notes?: string;
}

export interface PositionAuditResult {
  id: string;
  timestamp: string;
  symbol: string;
  orderType: 'BUY' | 'SELL';
  timeframe: string;
  entryPrice?: string;
  recommendation: AuditRecommendation; // 'HOLD' | 'PARTIAL_CLOSE' | 'CLOSE_NOW'
  recommendationTitle: string;
  recommendationSummary: string;
  qualityScore: number; // 0 - 100
  structureAnalysis: string;
  cautionPoints: string[];
  managementAdvice: string;
  targetAdjustment?: {
    suggestedSl?: string;
    suggestedTp?: string;
    trailingStopPips?: string;
  };
  chartImageBase64?: string;
}

