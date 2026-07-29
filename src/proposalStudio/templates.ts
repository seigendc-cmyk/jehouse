import { ProposalTemplate } from './types';

/**
 * Pre-packaged AI-crafted Proposal Templates stored locally for offline/no-AI proposal creation
 */
export const DEFAULT_PROPOSAL_TEMPLATES: ProposalTemplate[] = [
  {
    id: 'tpl-software-modernization',
    name: 'Enterprise Software & Cloud Modernization',
    description: 'AI-designed template for cloud migrations, API refactoring, and microservice infrastructure upgrades.',
    category: 'tech_software',
    isAiGenerated: true,
    isUserSaved: false,
    folderPath: 'PressCraft_Proposals/Templates/Tech/',
    createdAt: '2026-01-15T00:00:00.000Z',
    templateData: {
      title: 'Enterprise Microservices & Cloud Platform Migration',
      clientName: '[Client Company Name]',
      authorName: 'PressCraft Solutions Architecture',
      category: 'tech_software',
      currency: '$',
      targetBudget: 220000,
      projectDurationMonths: 6,
      executiveSummary: 'This proposal outlines the strategy to modernize legacy monolithic infrastructure into a resilient, cloud-native microservices architecture. By introducing containerized API gateways and real-time observability, the client will achieve 99.99% uptime, reduce operational latency by 40%, and lower hosting overhead.',
      problemStatement: 'The current monolithic legacy codebase suffers from frequent deployment bottlenecks, unscalable database locks, and rising hosting infrastructure costs. Scaling peak traffic requires provisioning entire redundant servers rather than isolated services.',
      proposedSolution: 'We propose a 4-phase containerized migration leveraging Kubernetes, serverless API endpoints, and a decoupled event-driven architecture. This transition will be executed with zero production downtime using blue-green deployment strategies.',
      budgetItems: [
        {
          id: 'b-tech-1',
          name: 'Cloud Solution Architects & Senior Devs',
          category: 'Personnel',
          q1Cost: 60000,
          q2Cost: 50000,
          q3Cost: 15000,
          q4Cost: 0
        },
        {
          id: 'b-tech-2',
          name: 'AWS/GCP Kubernetes & Database Licenses',
          category: 'Technology & Tools',
          q1Cost: 12000,
          q2Cost: 18000,
          q3Cost: 15000,
          q4Cost: 10000
        },
        {
          id: 'b-tech-3',
          name: 'DevOps Automation & Security Penetration Audits',
          category: 'Operations & Overhead',
          q1Cost: 8000,
          q2Cost: 8000,
          q3Cost: 5000,
          q4Cost: 4000
        },
        {
          id: 'b-tech-4',
          name: 'Engineering Team Onboarding & Documentation',
          category: 'Marketing & Sales',
          q1Cost: 2000,
          q2Cost: 4000,
          q3Cost: 4000,
          q4Cost: 2000
        },
        {
          id: 'b-tech-5',
          name: 'Migration Contingency Buffer',
          category: 'Contingency',
          q1Cost: 2000,
          q2Cost: 3000,
          q3Cost: 3000,
          q4Cost: 2000
        }
      ],
      milestones: [
        {
          id: 'm-tech-1',
          phase: 'Phase 1: Architecture & Containerization',
          taskName: 'Microservices Schema Design & Dockerization',
          owner: 'Lead Architect',
          startMonth: 1,
          durationMonths: 1,
          estimatedCost: 40000,
          status: 'Completed'
        },
        {
          id: 'm-tech-2',
          phase: 'Phase 2: Core Data Migration',
          taskName: 'Database Sharding & Real-Time Event Pipeline',
          owner: 'Backend Lead',
          startMonth: 2,
          durationMonths: 2,
          estimatedCost: 90000,
          status: 'In Progress'
        },
        {
          id: 'm-tech-3',
          phase: 'Phase 3: QA & Load Testing',
          taskName: 'Chaos Engineering & Automated Penetration Audits',
          owner: 'QA & Security Officer',
          startMonth: 4,
          durationMonths: 1,
          estimatedCost: 50000,
          status: 'Planned'
        },
        {
          id: 'm-tech-4',
          phase: 'Phase 4: Cutover & Handover',
          taskName: 'Production Traffic Cutover & Staff Training',
          owner: 'DevOps Manager',
          startMonth: 5,
          durationMonths: 2,
          estimatedCost: 40000,
          status: 'Planned'
        }
      ],
      risks: [
        {
          id: 'r-tech-1',
          riskName: 'Legacy DB Schema Incompatibilities',
          impact: 'High',
          probability: 'Medium',
          mitigationStrategy: 'Construct backwards-compatible dual-write API middleware during phase 2.'
        },
        {
          id: 'r-tech-2',
          riskName: 'Third-Party Webhook Downtime',
          impact: 'Medium',
          probability: 'Low',
          mitigationStrategy: 'Implement dead-letter message queues with exponential backoff retries.'
        }
      ],
      expectedRevenueYear1: 300000,
      expectedRevenueYear2: 650000,
      expectedRevenueYear3: 1100000,
      sections: [
        {
          id: 'sec-tech-1',
          title: 'Technical Scope & Infrastructure Objectives',
          content: 'Detailed description of cloud topology, ingress routing, and service discovery mechanisms.',
          chartType: 'budget_pie'
        },
        {
          id: 'sec-tech-2',
          title: 'Quarterly Migration Capital Model',
          content: 'Financial breakdown showing front-loaded engineering expenditure tapering into steady operational maintenance.',
          chartType: 'cashflow_bar'
        },
        {
          id: 'sec-tech-3',
          title: '3-Year Infrastructure Efficiency & Cost Reduction',
          content: 'Projected yield demonstrating 45% annual hosting cost reduction and expanded transactional capacity.',
          chartType: 'roi_growth'
        }
      ]
    }
  },
  {
    id: 'tpl-business-strategy',
    name: 'Strategic Management & Advisory Engagement',
    description: 'AI-designed template for corporate restructuring, market expansion, and operational audit consulting.',
    category: 'business_strategy',
    isAiGenerated: true,
    isUserSaved: false,
    folderPath: 'PressCraft_Proposals/Templates/Business/',
    createdAt: '2026-02-01T00:00:00.000Z',
    templateData: {
      title: 'Corporate Market Expansion & Operational Optimization',
      clientName: '[Client Organization]',
      authorName: 'PressCraft Advisory Group',
      category: 'business_strategy',
      currency: '$',
      targetBudget: 150000,
      projectDurationMonths: 4,
      executiveSummary: 'This strategic proposal delivers a roadmap for enterprisewide operational restructuring and targeted international market expansion. Our multi-faceted consulting engagement identifies untapped margin opportunities and streamlines organizational governance.',
      problemStatement: 'Slowing domestic revenue growth and rising customer acquisition costs have eroded EBITDA margins over consecutive quarters. Internal cross-departmental silos hamper rapid product innovation.',
      proposedSolution: 'We will conduct a comprehensive 360-degree operational audit, redesign key supply chain channels, and formulate a targeted go-to-market strategy for emerging regional markets.',
      budgetItems: [
        {
          id: 'b-biz-1',
          name: 'Executive Management Consultants & Analysts',
          category: 'Personnel',
          q1Cost: 50000,
          q2Cost: 40000,
          q3Cost: 10000,
          q4Cost: 0
        },
        {
          id: 'b-biz-2',
          name: 'Market Intelligence Datasets & Survey Tools',
          category: 'Technology & Tools',
          q1Cost: 10000,
          q2Cost: 12000,
          q3Cost: 8000,
          q4Cost: 0
        },
        {
          id: 'b-biz-3',
          name: 'Stakeholder Focus Groups & Travel Logistics',
          category: 'Operations & Overhead',
          q1Cost: 5000,
          q2Cost: 5000,
          q3Cost: 2000,
          q4Cost: 0
        },
        {
          id: 'b-biz-4',
          name: 'Executive Leadership Strategy Workshops',
          category: 'Marketing & Sales',
          q1Cost: 2000,
          q2Cost: 3000,
          q3Cost: 3000,
          q4Cost: 0
        }
      ],
      milestones: [
        {
          id: 'm-biz-1',
          phase: 'Phase 1: Operational Diagnostic',
          taskName: 'Data Analytics & Internal Department Audits',
          owner: 'Lead Engagement Director',
          startMonth: 1,
          durationMonths: 1,
          estimatedCost: 45000,
          status: 'In Progress'
        },
        {
          id: 'm-biz-2',
          phase: 'Phase 2: Strategy Design',
          taskName: 'Supply Chain Restructuring & Market Entry Blueprint',
          owner: 'Senior Strategy Partner',
          startMonth: 2,
          durationMonths: 2,
          estimatedCost: 75000,
          status: 'Planned'
        },
        {
          id: 'm-biz-3',
          phase: 'Phase 3: Rollout & Executive Alignment',
          taskName: 'KPI Dashboard Setup & Change Management Training',
          owner: 'Change Lead',
          startMonth: 4,
          durationMonths: 1,
          estimatedCost: 30000,
          status: 'Planned'
        }
      ],
      risks: [
        {
          id: 'r-biz-1',
          riskName: 'Internal Organizational Resistance to Change',
          impact: 'High',
          probability: 'Medium',
          mitigationStrategy: 'Involve regional department heads early in co-designing transformation milestones.'
        }
      ],
      expectedRevenueYear1: 280000,
      expectedRevenueYear2: 520000,
      expectedRevenueYear3: 900000,
      sections: [
        {
          id: 'sec-biz-1',
          title: 'Strategic Context & Growth Horizons',
          content: 'Detailed evaluation of industry shifts, competitive positioning, and profitability targets.',
          chartType: 'budget_pie'
        },
        {
          id: 'sec-biz-2',
          title: 'Consulting Resource Investment Schedule',
          content: 'Quarterly breakdown of advisory hours, research data access, and executive leadership workshops.',
          chartType: 'cashflow_bar'
        },
        {
          id: 'sec-biz-3',
          title: 'Projected EBITDA & Margin Lift Curve',
          content: 'Compounding yield model showing expected 22% margin improvement over 36 months.',
          chartType: 'roi_growth'
        }
      ]
    }
  },
  {
    id: 'tpl-marketing-launch',
    name: 'Omnichannel Marketing & Brand Campaign Launch',
    description: 'AI-designed template for product releases, digital ad campaigns, PR, and growth marketing.',
    category: 'marketing_launch',
    isAiGenerated: true,
    isUserSaved: false,
    folderPath: 'PressCraft_Proposals/Templates/Marketing/',
    createdAt: '2026-03-10T00:00:00.000Z',
    templateData: {
      title: 'Omnichannel Product Launch & Brand Growth Campaign',
      clientName: '[Consumer Brand / Startup]',
      authorName: 'PressCraft Creative Media',
      category: 'marketing_launch',
      currency: '$',
      targetBudget: 120000,
      projectDurationMonths: 3,
      executiveSummary: 'This proposal outlines an aggressive 90-day omnichannel marketing campaign designed to maximize brand awareness, drive viral customer engagement, and hit aggressive Q3 sales conversion targets.',
      problemStatement: 'Entering a crowded retail market requires overcoming high customer acquisition costs (CAC) and establishing immediate top-of-mind brand equity.',
      proposedSolution: 'We will orchestrate a high-impact launch combining influencer partnerships, paid search & social automation, experiential PR events, and retargeting conversion funnels.',
      budgetItems: [
        {
          id: 'b-mkt-1',
          name: 'Creative Directors, Copywriters & Video Producers',
          category: 'Personnel',
          q1Cost: 25000,
          q2Cost: 15000,
          q3Cost: 10000,
          q4Cost: 0
        },
        {
          id: 'b-mkt-2',
          name: 'Paid Media Placement & Influencer Sponsorships',
          category: 'Marketing & Sales',
          q1Cost: 30000,
          q2Cost: 20000,
          q3Cost: 10000,
          q4Cost: 0
        },
        {
          id: 'b-mkt-3',
          name: 'Ad Analytics & CRM Automation Tools',
          category: 'Technology & Tools',
          q1Cost: 3000,
          q2Cost: 3000,
          q3Cost: 2000,
          q4Cost: 0
        },
        {
          id: 'b-mkt-4',
          name: 'PR Event Hosting & Press Outreach',
          category: 'Operations & Overhead',
          q1Cost: 10000,
          q2Cost: 2000,
          q3Cost: 0,
          q4Cost: 0
        }
      ],
      milestones: [
        {
          id: 'm-mkt-1',
          phase: 'Phase 1: Creative Production',
          taskName: 'Video Spot Shoot, Copywriting & Landing Page Build',
          owner: 'Creative Director',
          startMonth: 1,
          durationMonths: 1,
          estimatedCost: 35000,
          status: 'Completed'
        },
        {
          id: 'm-mkt-2',
          phase: 'Phase 2: Launch & Ad Blitz',
          taskName: 'Influencer Seeding, Paid Ads Go-Live & PR Push',
          owner: 'Growth Lead',
          startMonth: 2,
          durationMonths: 1,
          estimatedCost: 55000,
          status: 'In Progress'
        },
        {
          id: 'm-mkt-3',
          phase: 'Phase 3: Optimization & Scaling',
          taskName: 'Retargeting Funnels & Conversion Rate Optimization',
          owner: 'Analytics Specialist',
          startMonth: 3,
          durationMonths: 1,
          estimatedCost: 30000,
          status: 'Planned'
        }
      ],
      risks: [
        {
          id: 'r-mkt-1',
          riskName: 'Fluctuating Paid Ad CPC Rates',
          impact: 'Medium',
          probability: 'High',
          mitigationStrategy: 'Diversify ad spend across Meta, TikTok, Search, and organic newsletter sponsorships.'
        }
      ],
      expectedRevenueYear1: 250000,
      expectedRevenueYear2: 500000,
      expectedRevenueYear3: 850000,
      sections: [
        {
          id: 'sec-mkt-1',
          title: 'Campaign Vision & Audience Targeting',
          content: 'Detailed breakdown of customer personas, key messaging pillars, and media channels.',
          chartType: 'budget_pie'
        },
        {
          id: 'sec-mkt-2',
          title: 'Media Spend & Production Outlay Schedule',
          content: 'Weekly outlay mapping showing concentrated pre-launch production costs and scaled media buy.',
          chartType: 'cashflow_bar'
        },
        {
          id: 'sec-mkt-3',
          title: 'Customer Acquisition Yield & Lifetime Value Projections',
          content: 'Predictive revenue curve demonstrating 3.2x Return on Ad Spend (ROAS) within 90 days.',
          chartType: 'roi_growth'
        }
      ]
    }
  },
  {
    id: 'tpl-financial-partnership-build',
    name: 'Project Build & Financial Partnership Investment Proposal',
    description: 'Specialized template requesting co-investment and financial partnership for commercial technology & infrastructure builds.',
    category: 'business_strategy',
    isAiGenerated: true,
    isUserSaved: false,
    folderPath: 'PressCraft_Proposals/Templates/Financial_Partnership/',
    createdAt: '2026-03-01T00:00:00.000Z',
    templateData: {
      title: 'Commercial Infrastructure Build & Strategic Financial Partnership Request',
      clientName: 'Apex Capital Partners & Investment Committee',
      authorName: 'Vanguard Industrial Technologies Consortium',
      recipientName: 'Victoria Sterling',
      recipientTitle: 'Managing Director, Strategic Investments',
      recipientCompany: 'Apex Capital Partners LLC',
      recipientAddress: '550 Madison Avenue, Floor 32, New York, NY 10022',
      recipientEmail: 'vsterling@apexcapital.com',
      privacyLetter: {
        enabled: true,
        noticeTitle: 'CONFIDENTIALITY & NON-DISCLOSURE AGREEMENT NOTICE',
        effectiveDate: '2026-03-01',
        confidentialityContent: 'PRIVACY NOTICE: This proposal contains proprietary financial structures, trade secrets, architectural schematics, and confidential market valuation models belonging to Vanguard Industrial Technologies Consortium. By reviewing this document, the recipient Apex Capital Partners LLC agrees to maintain strict confidentiality, refrain from unauthorized dissemination or copying, and use the contained intelligence solely for evaluating the proposed financial co-investment partnership.'
      },
      accomplishments: [
        {
          id: 'acc-1',
          title: 'Phase 0 Site Land Acquisition & Zoning Approvals Secured',
          description: 'Obtained full municipal industrial zoning clearances, environmental impact permits, and secured 15-acre commercial deed.',
          completedDate: '2025-11-14',
          category: 'Regulatory & Real Estate',
          isCompleted: true
        },
        {
          id: 'acc-2',
          title: 'Architectural Blueprint & Structural Engineering Validation',
          description: 'Completed structural engineering audits and approved 100% stamped MEP (Mechanical, Electrical, Plumbing) designs.',
          completedDate: '2026-01-20',
          category: 'Engineering & Design',
          isCompleted: true
        },
        {
          id: 'acc-3',
          title: '$1.2M Founder Seed Capital & Pre-Commitment Equity Injected',
          description: 'Principals have injected $1,200,000 cash equity into escrow for initial site preparation and procurement locks.',
          completedDate: '2026-02-10',
          category: 'Capital Accomplishments',
          isCompleted: true
        },
        {
          id: 'acc-4',
          title: 'Pre-Signed Anchor Tenant Letters of Intent (LOI) Executed',
          description: 'Secured binding LOIs representing $450,000 in guaranteed Year 1 operational lease revenue from tier-1 enterprise partners.',
          completedDate: '2026-02-25',
          category: 'Commercial Contracts',
          isCompleted: true
        }
      ],
      category: 'business_strategy',
      currency: '$',
      targetBudget: 500000,
      projectDurationMonths: 12,
      executiveSummary: 'This proposal invites Apex Capital Partners to form a strategic Financial Partnership for the $500,000 Phase 1 build of our commercial technological infrastructure hub. With $1.2M in founder seed equity already deployed and pre-lease tenant LOIs secured, this co-investment offers a preferred 18% IRR with preferred dividend distributions beginning Q3.',
      problemStatement: 'Rapid regional industrial automation growth has created a severe deficit in high-density commercial tech infrastructure. Existing regional facilities operate at 100% capacity with 18-month waitlists.',
      proposedSolution: 'A 50/50 financial partnership build to construct a state-of-the-art modular infrastructure facility. Capital contributions will fund site development, power grid substation drops, and high-margin client buildouts.',
      budgetItems: [
        {
          id: 'b-fin-1',
          name: 'Site Construction & Structural Foundation Build',
          category: 'Operations & Overhead',
          q1Cost: 150000,
          q2Cost: 100000,
          q3Cost: 20000,
          q4Cost: 0
        },
        {
          id: 'b-fin-2',
          name: 'High-Density Electrical Power Substation & Cooling Systems',
          category: 'Technology & Tools',
          q1Cost: 80000,
          q2Cost: 70000,
          q3Cost: 10000,
          q4Cost: 0
        },
        {
          id: 'b-fin-3',
          name: 'General Contracting & Site Supervision Personnel',
          category: 'Personnel',
          q1Cost: 20000,
          q2Cost: 20000,
          q3Cost: 15000,
          q4Cost: 10000
        },
        {
          id: 'b-fin-4',
          name: 'Commercial Leasing Marketing & Enterprise Sales',
          category: 'Marketing & Sales',
          q1Cost: 5000,
          q2Cost: 10000,
          q3Cost: 10000,
          q4Cost: 5000
        },
        {
          id: 'b-fin-5',
          name: 'Co-Investment Legal & ESCROW Contingency Buffer',
          category: 'Contingency',
          q1Cost: 5000,
          q2Cost: 5000,
          q3Cost: 3000,
          q4Cost: 2000
        }
      ],
      milestones: [
        {
          id: 'm-fin-1',
          phase: 'Phase 1: Capital Partner ESCROW Deposit & Site Breaking',
          taskName: 'Partnership Agreement Execution & Escrow Funding',
          owner: 'Managing Partner',
          startMonth: 1,
          durationMonths: 2,
          estimatedCost: 150000,
          status: 'Completed'
        },
        {
          id: 'm-fin-2',
          phase: 'Phase 2: Heavy Infrastructure & Power Grid Integration',
          taskName: 'Transformer Substation Drop & High-Density HVAC Installation',
          owner: 'Lead Construction Engineer',
          startMonth: 3,
          durationMonths: 3,
          estimatedCost: 200000,
          status: 'In Progress'
        },
        {
          id: 'm-fin-3',
          phase: 'Phase 3: Tenant Buildouts & Commissioning',
          taskName: 'Fit-out for Anchor Tenants & System Pressure Audits',
          owner: 'Operations Director',
          startMonth: 6,
          durationMonths: 3,
          estimatedCost: 100000,
          status: 'Planned'
        },
        {
          id: 'm-fin-4',
          phase: 'Phase 4: Commercial Operations & Revenue Distribution',
          taskName: 'Tenancy Occupancy & Q3 Dividend Distribution',
          owner: 'Chief Financial Officer',
          startMonth: 9,
          durationMonths: 4,
          estimatedCost: 50000,
          status: 'Planned'
        }
      ],
      risks: [
        {
          id: 'r-fin-1',
          riskName: 'Utility Grid Connection Interconnection Delay',
          impact: 'High',
          probability: 'Low',
          mitigationStrategy: 'Pre-ordered dual utility transformer switches and secured priority power queue slot.'
        },
        {
          id: 'r-fin-2',
          riskName: 'Interest Rate Volatility During Draw Period',
          impact: 'Medium',
          probability: 'Medium',
          mitigationStrategy: 'Locked fixed 12-month capital draw rates with bank syndicate.'
        }
      ],
      expectedRevenueYear1: 680000,
      expectedRevenueYear2: 1250000,
      expectedRevenueYear3: 2100000,
      sections: [
        {
          id: 'sec-fin-1',
          title: 'Financial Partnership Structure & Co-Investment Terms',
          content: 'Detailed outline of partner equity splits, capital call schedules, debt-service coverage ratios, and preferred cash flow distribution hierarchy.',
          chartType: 'budget_pie'
        },
        {
          id: 'sec-fin-2',
          title: 'Quarterly Project Capital Build Expenditure Schedule',
          content: 'Outlay breakdown showing heavy front-loaded procurement in Q1-Q2 followed by steady tenant rental cash generation.',
          chartType: 'cashflow_bar'
        },
        {
          id: 'sec-fin-3',
          title: 'Investor IRR & 3-Year Capital Return Distribution',
          content: 'Financial projection modeling 18.4% Net Internal Rate of Return with 1.85x equity multiple over 36 months.',
          chartType: 'roi_growth'
        }
      ]
    }
  }
];
