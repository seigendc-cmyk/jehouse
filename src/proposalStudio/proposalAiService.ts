import { ProjectProposal, GenerateProposalParams } from './types';

/**
 * AI Service for generating project proposals with budgets, milestones, and financial models
 */
export async function generateProposalWithAI(params: GenerateProposalParams): Promise<ProjectProposal> {
  try {
    const response = await fetch('/api/ai/proposal-generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || 'Failed to generate proposal from AI server');
    }

    const data = await response.json();
    return data.proposal;
  } catch (err: any) {
    console.warn('Backend proposal generator fallback activated:', err.message);
    return createFallbackProposal(params);
  }
}

/**
 * Local offline fallback for project proposals
 */
function createFallbackProposal(params: GenerateProposalParams): ProjectProposal {
  const b = params.estimatedBudget || 150000;
  const curr = '$';

  return {
    id: `proposal-${Date.now()}`,
    title: params.projectTitle || 'Enterprise NextGen Platform Implementation',
    clientName: params.clientName || 'Apex Global Logistics',
    authorName: 'PressCraft Strategic Consulting',
    category: params.category || 'tech_software',
    currency: curr,
    targetBudget: b,
    projectDurationMonths: params.durationMonths || 6,
    executiveSummary: `This project proposal presents a comprehensive, high-ROI execution strategy for "${params.projectTitle || 'NextGen Project'}". Designed specifically for ${params.clientName || 'Apex Global'}, the project addresses operational bottlenecks, modernizes digital infrastructure, and provides a scalable framework to drive long-term revenue growth.`,
    problemStatement: `The current operating workflow relies on fragmented legacy software, causing manual latency, communication bottlenecks, and reduced yield efficiency. Without modernization, operational risks and scaling costs will continue to compound over the next 12 months.`,
    proposedSolution: `We propose deploying an automated, cloud-native enterprise system tailored to ${params.clientName || 'the client\'s'} operational requirements. Featuring real-time telemetry, automated dispatch routing, and predictive analytics, this solution streamlines cross-department workflows while guaranteeing strict data security compliance.`,
    budgetItems: [
      {
        id: 'b-1',
        name: 'Senior Systems Engineers & Architects',
        category: 'Personnel',
        q1Cost: Math.round(b * 0.25),
        q2Cost: Math.round(b * 0.20),
        q3Cost: Math.round(b * 0.05),
        q4Cost: 0
      },
      {
        id: 'b-2',
        name: 'Cloud Infrastructure & Security Licenses',
        category: 'Technology & Tools',
        q1Cost: Math.round(b * 0.05),
        q2Cost: Math.round(b * 0.08),
        q3Cost: Math.round(b * 0.07),
        q4Cost: Math.round(b * 0.05)
      },
      {
        id: 'b-3',
        name: 'Go-To-Market & Onboarding Training',
        category: 'Marketing & Sales',
        q1Cost: 0,
        q2Cost: Math.round(b * 0.04),
        q3Cost: Math.round(b * 0.06),
        q4Cost: Math.round(b * 0.03)
      },
      {
        id: 'b-4',
        name: 'Project Management & Quality Assurance',
        category: 'Operations & Overhead',
        q1Cost: Math.round(b * 0.03),
        q2Cost: Math.round(b * 0.03),
        q3Cost: Math.round(b * 0.02),
        q4Cost: Math.round(b * 0.02)
      },
      {
        id: 'b-5',
        name: 'Risk Buffer & Emergency Contingency',
        category: 'Contingency',
        q1Cost: Math.round(b * 0.01),
        q2Cost: Math.round(b * 0.01),
        q3Cost: Math.round(b * 0.02),
        q4Cost: Math.round(b * 0.01)
      }
    ],
    milestones: [
      {
        id: 'm-1',
        phase: 'Phase 1: Discovery & Architecture',
        taskName: 'Requirements Mapping & System Blueprinting',
        owner: 'Lead Architect',
        startMonth: 1,
        durationMonths: 1,
        estimatedCost: Math.round(b * 0.15),
        status: 'Completed'
      },
      {
        id: 'm-2',
        phase: 'Phase 2: Core Engineering',
        taskName: 'Database Schema & API Gateway Buildout',
        owner: 'Backend Engineering Team',
        startMonth: 2,
        durationMonths: 2,
        estimatedCost: Math.round(b * 0.40),
        status: 'In Progress'
      },
      {
        id: 'm-3',
        phase: 'Phase 3: Integration & Testing',
        taskName: 'End-to-End Simulation & Security Audits',
        owner: 'QA & Compliance Officer',
        startMonth: 4,
        durationMonths: 1,
        estimatedCost: Math.round(b * 0.25),
        status: 'Planned'
      },
      {
        id: 'm-[#4]',
        phase: 'Phase 4: Deployment & Launch',
        taskName: 'Production Rollout & User Onboarding',
        owner: 'Deployment Lead',
        startMonth: 5,
        durationMonths: 2,
        estimatedCost: Math.round(b * 0.20),
        status: 'Planned'
      }
    ],
    risks: [
      {
        id: 'r-1',
        riskName: 'Legacy API Compatibility Delays',
        impact: 'High',
        probability: 'Medium',
        mitigationStrategy: 'Build isolated adapter middleware to prevent blocking core roadmap deliverables.'
      },
      {
        id: 'r-2',
        riskName: 'Staff Onboarding Friction',
        impact: 'Medium',
        probability: 'Low',
        mitigationStrategy: 'Deliver interactive video training modules and conduct hands-on workshop sessions.'
      }
    ],
    expectedRevenueYear1: Math.round(b * 1.35),
    expectedRevenueYear2: Math.round(b * 2.80),
    expectedRevenueYear3: Math.round(b * 4.50),
    sections: [
      {
        id: 'sec-1',
        title: 'Project Scope & Objectives',
        content: 'This section details the primary deliverables, key performance metrics (KPIs), and technical boundaries established for this engagement.',
        chartType: 'budget_pie'
      },
      {
        id: 'sec-2',
        title: 'Financial Planning & Cash Flow Projections',
        content: 'Our structured quarterly financial model ensures capital efficiency while providing transparent milestone tracking throughout the project lifecycle.',
        chartType: 'cashflow_bar'
      },
      {
        id: 'sec-3',
        title: 'Return on Investment (ROI) Growth Model',
        content: 'Projected financial yields demonstrate a full capital break-even within 8 months of deployment, yielding compounding efficiency gains over Years 1-3.',
        chartType: 'roi_growth'
      }
    ],
    createdAt: new Date().toISOString()
  };
}
