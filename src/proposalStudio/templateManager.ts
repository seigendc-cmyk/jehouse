import { ProposalTemplate, ProjectProposal } from './types';
import { DEFAULT_PROPOSAL_TEMPLATES } from './templates';
import { safeSaveItem } from '../lib/idbStorage';

const LOCAL_STORAGE_KEY = 'presscraft_proposal_templates_v1';
const LOCAL_FOLDER_NAME = 'PressCraft_Proposals/Templates/';

/**
 * Gets all available proposal templates (Pre-packaged AI templates + User custom saved templates)
 */
export function getStoredProposalTemplates(): ProposalTemplate[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) {
      return DEFAULT_PROPOSAL_TEMPLATES;
    }
    const userSavedTemplates: ProposalTemplate[] = JSON.parse(raw);
    
    // Combine defaults with user saved, avoiding duplicates by ID
    const defaultIds = new Set(DEFAULT_PROPOSAL_TEMPLATES.map((t) => t.id));
    const customOnly = userSavedTemplates.filter((t) => !defaultIds.has(t.id));

    return [...DEFAULT_PROPOSAL_TEMPLATES, ...customOnly];
  } catch (err) {
    console.warn('Failed to parse local proposal templates from localStorage:', err);
    return DEFAULT_PROPOSAL_TEMPLATES;
  }
}

/**
 * Saves a proposal as a reusable custom template in the local computer/browser folder
 */
export function saveProposalAsTemplate(
  proposal: ProjectProposal, 
  templateName?: string, 
  templateDescription?: string
): ProposalTemplate {
  const allTemplates = getStoredProposalTemplates();

  const newTemplate: ProposalTemplate = {
    id: `tpl-user-${Date.now()}`,
    name: templateName || proposal.title,
    description: templateDescription || `User custom template derived from "${proposal.title}"`,
    category: proposal.category,
    isAiGenerated: false,
    isUserSaved: true,
    folderPath: `${LOCAL_FOLDER_NAME}Custom/`,
    createdAt: new Date().toISOString(),
    templateData: {
      title: proposal.title,
      clientName: proposal.clientName,
      authorName: proposal.authorName,
      category: proposal.category,
      currency: proposal.currency,
      targetBudget: proposal.targetBudget,
      projectDurationMonths: proposal.projectDurationMonths,
      executiveSummary: proposal.executiveSummary,
      problemStatement: proposal.problemStatement,
      proposedSolution: proposal.proposedSolution,
      budgetItems: proposal.budgetItems,
      milestones: proposal.milestones,
      risks: proposal.risks,
      expectedRevenueYear1: proposal.expectedRevenueYear1,
      expectedRevenueYear2: proposal.expectedRevenueYear2,
      expectedRevenueYear3: proposal.expectedRevenueYear3,
      sections: proposal.sections
    }
  };

  const updatedTemplates = [newTemplate, ...allTemplates.filter((t) => t.isUserSaved)];

  try {
    safeSaveItem(LOCAL_STORAGE_KEY, updatedTemplates);
  } catch (err) {
    console.warn('Notice saving proposal template:', err);
  }

  return newTemplate;
}

/**
 * Creates a ProjectProposal instance directly from a ProposalTemplate without using live AI API calls
 */
export function createProposalFromTemplate(
  template: ProposalTemplate,
  customTitle?: string,
  customClient?: string,
  customBudget?: number
): ProjectProposal {
  const d = template.templateData;
  const budgetScale = customBudget && d.targetBudget ? customBudget / d.targetBudget : 1;

  return {
    id: `proposal-${Date.now()}`,
    title: customTitle?.trim() || d.title,
    clientName: customClient?.trim() || d.clientName,
    authorName: d.authorName || 'PressCraft Strategic Consulting',
    category: d.category,
    currency: d.currency || '$',
    targetBudget: customBudget || d.targetBudget,
    projectDurationMonths: d.projectDurationMonths,
    executiveSummary: d.executiveSummary,
    problemStatement: d.problemStatement,
    proposedSolution: d.proposedSolution,
    budgetItems: d.budgetItems.map((item) => ({
      ...item,
      id: `b-${Math.random().toString(36).substr(2, 6)}`,
      q1Cost: Math.round(item.q1Cost * budgetScale),
      q2Cost: Math.round(item.q2Cost * budgetScale),
      q3Cost: Math.round(item.q3Cost * budgetScale),
      q4Cost: Math.round(item.q4Cost * budgetScale)
    })),
    milestones: d.milestones.map((m) => ({
      ...m,
      id: `m-${Math.random().toString(36).substr(2, 6)}`,
      estimatedCost: Math.round(m.estimatedCost * budgetScale)
    })),
    risks: d.risks.map((r) => ({
      ...r,
      id: `r-${Math.random().toString(36).substr(2, 6)}`
    })),
    expectedRevenueYear1: Math.round(d.expectedRevenueYear1 * budgetScale),
    expectedRevenueYear2: Math.round(d.expectedRevenueYear2 * budgetScale),
    expectedRevenueYear3: Math.round(d.expectedRevenueYear3 * budgetScale),
    sections: d.sections.map((s) => ({ ...s, id: `sec-${Math.random().toString(36).substr(2, 6)}` })),
    createdAt: new Date().toISOString()
  };
}

/**
 * Downloads a template as a JSON file into the local installation/computer download directory
 */
export function exportTemplateToFile(template: ProposalTemplate) {
  const jsonString = JSON.stringify(template, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ProposalTemplate_${template.name.replace(/[^a-zA-Z0-9_-]/g, '_')}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Deletes a user-saved custom template
 */
export function deleteStoredTemplate(templateId: string): ProposalTemplate[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return DEFAULT_PROPOSAL_TEMPLATES;

    const userSavedTemplates: ProposalTemplate[] = JSON.parse(raw);
    const updated = userSavedTemplates.filter((t) => t.id !== templateId);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));

    return getStoredProposalTemplates();
  } catch (err) {
    console.error('Error deleting proposal template:', err);
    return getStoredProposalTemplates();
  }
}
