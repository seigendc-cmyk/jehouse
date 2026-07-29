export type ProposalCategory = 
  | 'tech_software' 
  | 'business_strategy' 
  | 'construction_eng' 
  | 'marketing_launch' 
  | 'research_grant' 
  | 'creative_agency';

export interface BudgetCategoryItem {
  id: string;
  name: string;
  category: 'Personnel' | 'Technology & Tools' | 'Marketing & Sales' | 'Operations & Overhead' | 'Contingency';
  q1Cost: number;
  q2Cost: number;
  q3Cost: number;
  q4Cost: number;
}

export interface ProposalMilestone {
  id: string;
  phase: string;
  taskName: string;
  owner: string;
  startMonth: number;
  durationMonths: number;
  estimatedCost: number;
  status: 'Planned' | 'In Progress' | 'Completed' | 'Critical';
}

export interface RiskItem {
  id: string;
  riskName: string;
  impact: 'High' | 'Medium' | 'Low';
  probability: 'High' | 'Medium' | 'Low';
  mitigationStrategy: string;
}

export interface ProposalSection {
  id: string;
  title: string;
  content: string;
  chartType?: 'budget_pie' | 'cashflow_bar' | 'roi_growth' | 'none';
  showTable?: boolean;
}

export interface ProposalAccomplishment {
  id: string;
  title: string;
  description: string;
  completedDate?: string;
  category: string;
  isCompleted: boolean;
}

export interface ProposalPrivacyLetter {
  enabled: boolean;
  noticeTitle: string;
  effectiveDate: string;
  confidentialityContent: string;
}

export interface ProjectProposal {
  id: string;
  title: string;
  clientName: string;
  authorName: string;

  // Cover Page Recipient Details
  recipientName?: string;
  recipientTitle?: string;
  recipientCompany?: string;
  recipientAddress?: string;
  recipientEmail?: string;

  // Privacy & Confidentiality Notice Letter
  privacyLetter?: ProposalPrivacyLetter;

  // User Accomplishments & Verified Achievements Checklist
  accomplishments?: ProposalAccomplishment[];

  category: ProposalCategory;
  currency: string;
  targetBudget: number;
  projectDurationMonths: number;
  executiveSummary: string;
  problemStatement: string;
  proposedSolution: string;
  budgetItems: BudgetCategoryItem[];
  milestones: ProposalMilestone[];
  risks: RiskItem[];
  expectedRevenueYear1: number;
  expectedRevenueYear2: number;
  expectedRevenueYear3: number;
  sections: ProposalSection[];
  createdAt: string;
}

export interface ProposalTemplate {
  id: string;
  name: string;
  description: string;
  category: ProposalCategory;
  isAiGenerated: boolean;
  isUserSaved?: boolean;
  folderPath?: string;
  createdAt: string;
  templateData: Omit<ProjectProposal, 'id' | 'createdAt'>;
}

export interface GenerateProposalParams {
  projectTitle: string;
  clientName: string;
  category: ProposalCategory;
  projectDescription: string;
  estimatedBudget: number;
  durationMonths: number;
}
