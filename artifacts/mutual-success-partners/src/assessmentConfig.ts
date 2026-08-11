import type { CalculatorResult } from './calculatorConfig';

export type AssessmentAnswer = string | string[];
export type AssessmentAnswers = Record<string, AssessmentAnswer>;
export type AssessmentStep = {
  id: string;
  label: string;
  title: string;
  description: string;
  questionIds: string[];
};
export type AssessmentQuestion = {
  id: string;
  number: number;
  stepId: string;
  prompt: string;
  hint: string;
  type: 'single' | 'multi';
  options: string[];
  optionScores: Record<string, number>;
};
export type AssessmentLeak = {
  id: string;
  title: string;
  shortTitle: string;
  description: string;
  recommendation: string;
  impact: 'High impact' | 'Medium impact';
  score: (answers: AssessmentAnswers) => number;
};
export type AssessmentResult = {
  score: number;
  category: string;
  summary: string;
  leaks: AssessmentLeak[];
  recommendations: string[];
};

export const assessmentSteps: AssessmentStep[] = [
  { id: 'business', label: 'Step 01', title: 'About Your Business', description: 'A quick baseline helps us put your answers in context.', questionIds: ['businessType', 'teamSize', 'monthlyRevenue'] },
  { id: 'lead-response', label: 'Step 02', title: 'Lead & Response Process', description: 'Speed and consistency shape what happens after an inquiry.', questionIds: ['responseTime', 'firstContactMethods', 'missedCalls'] },
  { id: 'sales-follow-up', label: 'Step 03', title: 'Sales & Follow-up Process', description: 'Small follow-up gaps can leave meaningful work on the table.', questionIds: ['followUpConsistency', 'estimateFollowUp'] },
  { id: 'operations', label: 'Step 04', title: 'Operations & Systems', description: 'The right operating rhythm makes recovered revenue repeatable.', questionIds: ['leadTracking', 'noShowRate', 'reengagement'] },
];

export const assessmentQuestions: AssessmentQuestion[] = [
  {
    id: 'businessType', number: 1, stepId: 'business', prompt: 'What type of business are you?', hint: 'Select one.',
    type: 'single', options: ['General Contractor', 'Home Services', 'Professional Services', 'Other'],
    optionScores: { 'General Contractor': 72, 'Home Services': 74, 'Professional Services': 70, Other: 64 },
  },
  {
    id: 'teamSize', number: 2, stepId: 'business', prompt: 'How many people are on your team?', hint: 'Select one.',
    type: 'single', options: ['1–5', '6–15', '16–30', '31+'],
    optionScores: { '1–5': 58, '6–15': 67, '16–30': 74, '31+': 78 },
  },
  {
    id: 'monthlyRevenue', number: 3, stepId: 'business', prompt: 'What is your average monthly revenue?', hint: 'Select one.',
    type: 'single', options: ['Under $25K', '$25K–$75K', '$75K–$150K', '$150K+'],
    optionScores: { 'Under $25K': 58, '$25K–$75K': 66, '$75K–$150K': 73, '$150K+': 79 },
  },
  {
    id: 'responseTime', number: 4, stepId: 'lead-response', prompt: 'How quickly does your team typically respond to a new lead or inquiry?', hint: 'Select one.',
    type: 'single', options: ['Under 5 min', '5–30 min', '30–60 min', '1–4 hours', '4+ hours'],
    optionScores: { 'Under 5 min': 100, '5–30 min': 84, '30–60 min': 68, '1–4 hours': 45, '4+ hours': 22 },
  },
  {
    id: 'firstContactMethods', number: 5, stepId: 'lead-response', prompt: 'How do most of your leads first contact you?', hint: 'Select all that apply.',
    type: 'multi', options: ['Phone', 'Website Form', 'Email', 'Text/SMS', 'Social Media'],
    optionScores: { Phone: 74, 'Website Form': 78, Email: 62, 'Text/SMS': 82, 'Social Media': 58 },
  },
  {
    id: 'missedCalls', number: 6, stepId: 'lead-response', prompt: 'How often do you miss calls from prospective customers?', hint: 'Select one.',
    type: 'single', options: ['Rarely', 'Sometimes', 'Often'],
    optionScores: { Rarely: 90, Sometimes: 60, Often: 28 },
  },
  {
    id: 'followUpConsistency', number: 7, stepId: 'sales-follow-up', prompt: 'How consistently do you follow up with new leads?', hint: 'Select one.',
    type: 'single', options: ['Every lead', 'Most leads', 'Some leads', 'No consistent system'],
    optionScores: { 'Every lead': 94, 'Most leads': 76, 'Some leads': 49, 'No consistent system': 22 },
  },
  {
    id: 'estimateFollowUp', number: 8, stepId: 'sales-follow-up', prompt: 'How quickly do you follow up after sending an estimate?', hint: 'Select one.',
    type: 'single', options: ['Same day', '1–2 days', '3–7 days', 'Rarely'],
    optionScores: { 'Same day': 94, '1–2 days': 78, '3–7 days': 49, Rarely: 21 },
  },
  {
    id: 'leadTracking', number: 9, stepId: 'operations', prompt: 'Where do you track your leads and opportunities?', hint: 'Select one.',
    type: 'single', options: ['CRM', 'Spreadsheet', 'Inbox/calendar', 'No system'],
    optionScores: { CRM: 94, Spreadsheet: 68, 'Inbox/calendar': 45, 'No system': 20 },
  },
  {
    id: 'noShowRate', number: 10, stepId: 'operations', prompt: 'How would you describe your no-show or cancellation rate?', hint: 'Select one.',
    type: 'single', options: ['Low', 'Moderate', 'High', 'Unsure'],
    optionScores: { Low: 92, Moderate: 69, High: 35, Unsure: 52 },
  },
  {
    id: 'reengagement', number: 11, stepId: 'operations', prompt: 'Do you have a process to re-engage old or inactive leads?', hint: 'Select one.',
    type: 'single', options: ['Yes', 'Sometimes', 'No'],
    optionScores: { Yes: 92, Sometimes: 57, No: 22 },
  },
  {
    id: 'growthPriority', number: 12, stepId: 'operations', prompt: 'What is your biggest growth priority right now?', hint: 'Select one.',
    type: 'single', options: ['More leads', 'Faster response', 'Better follow-up', 'Stronger operations'],
    optionScores: { 'More leads': 64, 'Faster response': 65, 'Better follow-up': 66, 'Stronger operations': 68 },
  },
];

export const leakDefinitions: AssessmentLeak[] = [
  {
    id: 'response', title: 'Slow Response Times', shortTitle: 'Slow response times',
    description: 'Leads are waiting too long for a first human response.',
    recommendation: 'Set a five-minute response standard and route every new inquiry to an owner.',
    impact: 'High impact',
    score: (answers) => {
      const response = { 'Under 5 min': 0, '5–30 min': 22, '30–60 min': 45, '1–4 hours': 72, '4+ hours': 92 }[answers.responseTime as string] ?? 45;
      const missed = { Rarely: 0, Sometimes: 30, Often: 76 }[answers.missedCalls as string] ?? 25;
      return Math.round(response * .65 + missed * .35);
    },
  },
  {
    id: 'follow-up', title: 'Inconsistent Follow-up', shortTitle: 'Inconsistent follow-up',
    description: 'Good leads and estimates can go quiet without a next-step rhythm.',
    recommendation: 'Create a visible follow-up cadence for every lead, estimate, and open conversation.',
    impact: 'High impact',
    score: (answers) => {
      const lead = { 'Every lead': 0, 'Most leads': 25, 'Some leads': 62, 'No consistent system': 94 }[answers.followUpConsistency as string] ?? 45;
      const estimate = { 'Same day': 0, '1–2 days': 22, '3–7 days': 58, Rarely: 90 }[answers.estimateFollowUp as string] ?? 40;
      return Math.round(lead * .6 + estimate * .4);
    },
  },
  {
    id: 'tracking', title: 'No System for Re-engagement', shortTitle: 'No re-engagement system',
    description: 'Older opportunities are not being intentionally brought back into view.',
    recommendation: 'Segment inactive leads and schedule a simple, human re-engagement sequence.',
    impact: 'Medium impact',
    score: (answers) => {
      const tracking = { CRM: 0, Spreadsheet: 32, 'Inbox/calendar': 60, 'No system': 94 }[answers.leadTracking as string] ?? 45;
      const reengagement = { Yes: 0, Sometimes: 38, No: 88 }[answers.reengagement as string] ?? 40;
      return Math.round(tracking * .45 + reengagement * .55);
    },
  },
  {
    id: 'attendance', title: 'No-shows & Cancellations', shortTitle: 'No-shows & cancellations',
    description: 'Booked revenue is being lost between the calendar and the appointment.',
    recommendation: 'Confirm appointments with a clear next step and make rescheduling frictionless.',
    impact: 'Medium impact',
    score: (answers) => ({ Low: 0, Moderate: 38, High: 88, Unsure: 56 }[answers.noShowRate as string] ?? 40),
  },
  {
    id: 'channels', title: 'Fragmented Lead Channels', shortTitle: 'Fragmented lead channels',
    description: 'Leads arrive through multiple doors without one shared response view.',
    recommendation: 'Centralize channel ownership so phone, forms, email, and text all receive the same service level.',
    impact: 'Medium impact',
    score: (answers) => {
      const methods = answers.firstContactMethods;
      if (!Array.isArray(methods) || methods.length === 0) return 55;
      return Math.min(86, Math.max(12, (methods.length - 1) * 18 + (methods.includes('Social Media') ? 16 : 0)));
    },
  },
];

export const scoreCategories = [
  { min: 82, label: 'Revenue Optimized', summary: 'Your foundation is strong. The next gains are likely sitting in precision and consistency.' },
  { min: 64, label: 'Growth Opportunity', summary: 'You have a workable foundation with a few meaningful leaks worth closing next.' },
  { min: 42, label: 'Revenue Recovery Opportunity', summary: 'There is meaningful revenue being held back by process friction you can fix.' },
  { min: 0, label: 'Significant Revenue Opportunity', summary: 'Your answers point to several recoverable moments across the customer journey.' },
];

const averageQuestionScore = (answers: AssessmentAnswers) => {
  const answered = assessmentQuestions.filter((question) => answers[question.id] !== undefined);
  if (!answered.length) return 0;
  const total = answered.reduce((sum, question) => {
    const answer = answers[question.id];
    if (Array.isArray(answer)) {
      if (!answer.length) return sum;
      return sum + answer.reduce((inner, value) => inner + (question.optionScores[value] ?? 50), 0) / answer.length;
    }
    return sum + (question.optionScores[answer] ?? 50);
  }, 0);
  return total / answered.length;
};

export function calculateAssessmentResult(answers: AssessmentAnswers, calculatorResult?: CalculatorResult): AssessmentResult {
  const base = averageQuestionScore(answers);
  const score = Math.round(Math.min(100, Math.max(0, base * .82 + (calculatorResult?.growthScore ?? 58) * .18)));
  const category = scoreCategories.find((item) => score >= item.min) ?? scoreCategories.at(-1)!;
  const leaks = [...leakDefinitions].sort((a, b) => b.score(answers) - a.score(answers)).slice(0, 3);
  return {
    score,
    category: category.label,
    summary: category.summary,
    leaks,
    recommendations: leaks.map((leak) => leak.recommendation),
  };
}