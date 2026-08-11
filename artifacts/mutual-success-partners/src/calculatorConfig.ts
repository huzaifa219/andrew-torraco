export type CalculatorInputs = {
  monthlyOpportunities: number;
  averageJobValue: number;
  responseMinutes: number;
};

export type CalculatorResult = {
  annualOpportunity: number;
  growthScore: number;
  additionalMonthlyRevenue: number;
  additionalJobs: number;
  roi: number;
  category: string;
  responseLabel: string;
};

export const BOOKING_URL = 'mailto:andrew@mutualsuccesspartners.com?subject=Discovery%20Call%20Request';

export const calculatorConfig = {
  fields: {
    monthlyOpportunities: { min: 5, max: 180, step: 1, defaultValue: 45 },
    averageJobValue: { min: 2500, max: 50000, step: 500, defaultValue: 15000 },
    responseMinutes: { min: 2, max: 1440, step: 1, defaultValue: 720 },
  },
  responseBands: [
    { max: 5, score: 100, label: 'Under 5 min' },
    { max: 15, score: 88, label: '5–15 min' },
    { max: 30, score: 74, label: '15–30 min' },
    { max: 60, score: 61, label: '30–60 min' },
    { max: 240, score: 45, label: '1–4 hrs' },
    { max: 720, score: 26, label: '4–12 hrs' },
    { max: Infinity, score: 10, label: '12+ hrs' },
  ],
  scoreWeights: { response: .5, opportunities: .25, jobValue: .25 },
  opportunityModel: { conversionLift: .14, monthlyCaptureRate: .2, roiInvestment: 1800 },
  categories: [
    { min: 80, label: 'Revenue Optimized' },
    { min: 60, label: 'Growth Opportunity' },
    { min: 40, label: 'Revenue Recovery Opportunity' },
    { min: 0, label: 'Significant Revenue Opportunity' },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const normalize = (value: number, min: number, max: number) => ((value - min) / (max - min)) * 100;

export const getResponseBand = (minutes: number) =>
  calculatorConfig.responseBands.find((band) => minutes <= band.max) ?? calculatorConfig.responseBands.at(-1)!;

export const formatResponseTime = (minutes: number) => {
  if (minutes < 5) return 'Under 5 min';
  if (minutes < 60) return `${minutes} min`;
  if (minutes < 1440) return `${Math.round(minutes / 60)} hrs`;
  return '12+ hrs';
};

export const calculateGrowthScore = (inputs: CalculatorInputs) => {
  const response = getResponseBand(inputs.responseMinutes).score;
  const opportunities = normalize(inputs.monthlyOpportunities, calculatorConfig.fields.monthlyOpportunities.min, calculatorConfig.fields.monthlyOpportunities.max);
  const jobValue = normalize(inputs.averageJobValue, calculatorConfig.fields.averageJobValue.min, calculatorConfig.fields.averageJobValue.max);
  const { response: responseWeight, opportunities: opportunityWeight, jobValue: jobValueWeight } = calculatorConfig.scoreWeights;
  return Math.round(clamp(response * responseWeight + opportunities * opportunityWeight + jobValue * jobValueWeight, 0, 100));
};

export const calculateRevenueOpportunity = (inputs: CalculatorInputs) => {
  const score = calculateGrowthScore(inputs);
  const captureRate = calculatorConfig.opportunityModel.monthlyCaptureRate;
  return Math.round(inputs.monthlyOpportunities * inputs.averageJobValue * captureRate * (1 + (100 - score) / 240) * 12);
};

export const calculateAdditionalMonthlyRevenue = (inputs: CalculatorInputs) => Math.round(calculateRevenueOpportunity(inputs) / 12);
export const calculateAdditionalJobs = (inputs: CalculatorInputs) => Math.max(1, Math.round(calculateAdditionalMonthlyRevenue(inputs) / inputs.averageJobValue));
export const calculateROI = (inputs: CalculatorInputs) => Math.max(1, Math.round((calculateAdditionalMonthlyRevenue(inputs) / calculatorConfig.opportunityModel.roiInvestment) * 10) / 10);

export const calculateResults = (inputs: CalculatorInputs): CalculatorResult => {
  const growthScore = calculateGrowthScore(inputs);
  return {
    annualOpportunity: calculateRevenueOpportunity(inputs),
    growthScore,
    additionalMonthlyRevenue: calculateAdditionalMonthlyRevenue(inputs),
    additionalJobs: calculateAdditionalJobs(inputs),
    roi: calculateROI(inputs),
    category: calculatorConfig.categories.find((category) => growthScore >= category.min)?.label ?? 'Significant Revenue Opportunity',
    responseLabel: formatResponseTime(inputs.responseMinutes),
  };
};