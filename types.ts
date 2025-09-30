export enum AppStep {
  USER_INPUT,
  PROBLEM_DISCOVERY,
  OFFER_ALIGNMENT,
  GENERATING,
  DASHBOARD,
}

export type OfferType = 'product' | 'assessment';

export interface AdScripts {
  short: string;
  story: string;
  problemSolution: string;
  emotional: string;
  authority: string;
  socialProof: string;
  urgent: string;
}

export interface AdCampaign {
  hooks: string[];
  scripts: AdScripts;
  ctas: string[];
  imagePrompts: string[];
}

export type GeneratedImages = Record<string, string[]>;
