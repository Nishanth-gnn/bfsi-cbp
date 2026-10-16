export interface FundamentalInputs {
  price: number;
  eps?: number;
  bookValuePerShare?: number;
  netProfit?: number;
  weightedAverageShares?: number;
  averageShareholdersEquity?: number;
  averageTotalAssets?: number;
  ebit?: number;
  capitalEmployed?: number;
  totalDebt?: number;
  shareholdersEquity?: number;
  currentRevenue?: number;
  previousRevenue?: number;
  annualDividendPerShare?: number;
  earningsGrowthRate?: number; // In percentage points
  beginningValue?: number;
  endingValue?: number;
  numberOfYears?: number;
}

export const calculatePE = (price: number, eps?: number): number | null => {
  if (!eps || eps <= 0) return null;
  return price / eps;
};

export const calculatePriceToBook = (price: number, bookValuePerShare?: number): number | null => {
  if (!bookValuePerShare || bookValuePerShare <= 0) return null;
  return price / bookValuePerShare;
};

export const calculateEPS = (netProfit?: number, shares?: number): number | null => {
  if (netProfit === undefined || !shares || shares <= 0) return null;
  return netProfit / shares;
};

export const calculateROE = (netProfit?: number, equity?: number): number | null => {
  if (netProfit === undefined || !equity || equity <= 0) return null;
  return (netProfit / equity) * 100;
};

export const calculateROA = (netProfit?: number, assets?: number): number | null => {
  if (netProfit === undefined || !assets || assets <= 0) return null;
  return (netProfit / assets) * 100;
};

export const calculateROCE = (ebit?: number, capitalEmployed?: number): number | null => {
  if (ebit === undefined || !capitalEmployed || capitalEmployed <= 0) return null;
  return (ebit / capitalEmployed) * 100;
};

export const calculateDebtToEquity = (totalDebt?: number, equity?: number): number | null => {
  if (totalDebt === undefined || !equity || equity <= 0) return null;
  return totalDebt / equity;
};

export const calculateRevenueGrowth = (current?: number, previous?: number): number | null => {
  if (current === undefined || !previous || previous <= 0) return null;
  return ((current - previous) / previous) * 100;
};

export const calculateDividendYield = (dividend?: number, price?: number): number | null => {
  if (dividend === undefined || !price || price <= 0) return null;
  return (dividend / price) * 100;
};

export const calculatePEG = (pe?: number | null, growthRate?: number): number | null => {
  if (!pe || !growthRate || growthRate <= 0) return null;
  return pe / growthRate;
};

export const calculateCAGR = (beginning?: number, ending?: number, years?: number): number | null => {
  if (!beginning || beginning <= 0 || !ending || !years || years <= 0) return null;
  return (Math.pow(ending / beginning, 1 / years) - 1) * 100;
};
