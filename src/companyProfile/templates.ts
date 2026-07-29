import { CompanyProfile } from './types';

export const COMPANY_PROFILE_TEMPLATES: CompanyProfile[] = [
  {
    id: 'template-aura-tech',
    name: 'Aura Cloud & AI Technologies',
    tagline: 'Engineering Next-Generation Intelligence & Cloud Architectures',
    logoUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80',
    heroImageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&auto=format&fit=crop&q=80',
    foundedYear: '2018',
    headquarters: 'San Francisco, CA & London, UK',
    website: 'https://auratech.example.com',
    email: 'contact@auratech.example.com',
    phone: '+1 (415) 890-2100',
    industry: 'Enterprise Software & Artificial Intelligence',
    employees: '250+ Engineers & Consultants',
    primaryColor: '#2563eb',
    secondaryColor: '#0f172a',
    fontPairing: 'modern',
    layoutStyle: 'modern_minimal',
    footerNote: 'Confidential & Proprietary — Aura Technologies Group © 2026. All Rights Reserved.',
    sections: [
      {
        id: 'sec-overview',
        type: 'overview',
        title: 'Company Executive Summary',
        subtitle: 'A decade of pioneering artificial intelligence and distributed cloud infrastructure',
        content: `Aura Cloud & AI Technologies is an industry-leading software innovation enterprise specializing in high-performance cloud infrastructure, custom machine learning models, and real-time distributed data pipelines.\n\nFounded in 2018, our mission is to empower Fortune 500 businesses with scalable, resilient, and secure technological foundations. We combine deep research in artificial intelligence with production-grade engineering excellence to solve complex enterprise challenges.`,
        imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop&q=80',
        imageCaption: 'Engineering Team collaborating at our Global Technology Center',
        imagePosition: 'right'
      },
      {
        id: 'sec-mission-vision',
        type: 'mission_vision',
        title: 'Mission, Vision & Strategic Values',
        subtitle: 'Guided by operational precision, security, and sustainable technology',
        content: `Our **Mission** is to bridge the gap between raw cutting-edge research and real-world business application, turning complex data streams into decisive operational advantage.\n\nOur **Vision** is a seamlessly connected digital ecosystem where intelligent software autonomously optimizes workflow, protects sensitive information, and accelerates technological breakthroughs for humanity.`,
        isHighlighted: true
      },
      {
        id: 'sec-stats',
        type: 'highlights_stats',
        title: 'Key Operational Milestones & Metrics',
        subtitle: 'Measurable enterprise impact across global deployment environments',
        content: 'Our infrastructure and AI models operate continuously across North America, Europe, and Asia-Pacific regions with enterprise SLAs.',
        stats: [
          { id: 's1', label: 'Uptime SLA Guarantee', value: '99.999%', subtext: 'Multi-region failover' },
          { id: 's2', label: 'Active Enterprise Clients', value: '140+', subtext: 'Global Fortune 500 companies' },
          { id: 's3', label: 'Daily Processed Events', value: '4.2B+', subtext: 'Low-latency analytics' },
          { id: 's4', label: 'Patents Pending & Granted', value: '28', subtext: 'In AI & Neural Networks' }
        ]
      },
      {
        id: 'sec-services',
        type: 'services',
        title: 'Core Capabilities & Enterprise Offerings',
        subtitle: 'Tailored technology modules designed for rapid integration and maximum security',
        content: 'We provide modular solutions spanning full-lifecycle software delivery, cloud orchestration, and custom intelligence engines.',
        services: [
          {
            id: 'srv-1',
            title: 'Enterprise AI & LLM Systems',
            description: 'Domain-specific fine-tuning, retrieval-augmented generation (RAG), and agentic workflows built on private cloud clusters.',
            badge: 'Flagship Core',
            imageUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=500&auto=format&fit=crop&q=80'
          },
          {
            id: 'srv-2',
            title: 'Multi-Cloud Architecture & Migration',
            description: 'Zero-downtime microservice migration, Kubernetes cluster management, and Infrastructure-as-Code automation.',
            badge: 'DevOps & SRE',
            imageUrl: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=500&auto=format&fit=crop&q=80'
          },
          {
            id: 'srv-3',
            title: 'Cybersecurity & Data Governance',
            description: 'End-to-end encryption, SOC2 Type II compliance auditing, automated threat detection, and zero-trust framework implementation.',
            badge: 'Security',
            imageUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=500&auto=format&fit=crop&q=80'
          }
        ]
      },
      {
        id: 'sec-leadership',
        type: 'leadership',
        title: 'Executive Leadership Team',
        subtitle: 'Industry veterans committed to innovation and corporate stewardship',
        content: 'Our executive team brings together decades of technical mastery from leading research institutions and global technology giants.',
        members: [
          {
            id: 'm1',
            name: 'Dr. Evelyn Vance',
            title: 'Chief Executive Officer & Co-Founder',
            bio: 'Former Distributed Systems Director at MIT CSAIL. 15+ years leading high-scale enterprise engineering organizations.',
            avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80',
            email: 'evelyn.vance@auratech.example.com'
          },
          {
            id: 'm2',
            name: 'Marcus Thorne',
            title: 'Chief Technology Officer',
            bio: 'Pioneer in parallel computing and machine learning compilers. Holds 12 fundamental software patent claims.',
            avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=300&auto=format&fit=crop&q=80',
            email: 'marcus.thorne@auratech.example.com'
          },
          {
            id: 'm3',
            name: 'Sophia Ling',
            title: 'VP of Product Innovation',
            bio: 'Specialist in human-computer interface design and enterprise product scalability across fintech and healthtech sectors.',
            avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&auto=format&fit=crop&q=80',
            email: 'sophia.ling@auratech.example.com'
          }
        ]
      },
      {
        id: 'sec-testimonials',
        type: 'testimonials',
        title: 'Client Endorsements & Case Studies',
        subtitle: 'What our enterprise partners say about our partnership',
        content: 'Trusted by global CTOs and technology leaders to handle mission-critical workloads.',
        testimonials: [
          {
            id: 't1',
            clientName: 'David Sterling',
            clientCompany: 'Global Fintech Corp (CIO)',
            quote: 'Aura’s AI pipeline reduced our real-time fraud detection latency from 450ms down to 18ms while improving precision by 24%. Truly transformative.',
            rating: 5,
            avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
          },
          {
            id: 't2',
            clientName: 'Elena Rostova',
            clientCompany: 'AeroSpace Systems Ltd (VP Cloud)',
            quote: 'The multi-cloud migration was executed flawlessly without a single minute of customer downtime. Their engineering team is second to none.',
            rating: 5,
            avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
          }
        ]
      },
      {
        id: 'sec-contact',
        type: 'contact',
        title: 'Global Headquarters & Inquiries',
        subtitle: 'Connect with our engineering and partnership team',
        content: 'Ready to modernize your infrastructure or deploy enterprise AI? Reach out to schedule a technical architecture review.',
        imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop&q=80',
        imageCaption: 'Aura Technology Campus HQ Building'
      }
    ]
  },
  {
    id: 'template-apex-capital',
    name: 'Apex Global Financial & Advisory',
    tagline: 'Strategic Capital Management & Institutional Wealth Advisory',
    logoUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80',
    heroImageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&auto=format&fit=crop&q=80',
    foundedYear: '2005',
    headquarters: 'Wall Street, New York & Zurich',
    website: 'https://apexcapital.example.com',
    email: 'investors@apexcapital.example.com',
    phone: '+1 (212) 555-0199',
    industry: 'Investment Banking & Private Equity',
    employees: '500+ Financial Professionals',
    primaryColor: '#0f172a',
    secondaryColor: '#b45309',
    fontPairing: 'corporate',
    layoutStyle: 'executive_luxe',
    footerNote: 'Apex Global Capital Partners LLC — Regulated by the SEC & FINRA.',
    sections: [
      {
        id: 'apex-1',
        type: 'overview',
        title: 'Corporate Identity & Legacy',
        subtitle: 'Over two decades of institutional asset stewardship and capital growth',
        content: `Apex Global Partners is a premier global financial institution advising multinational corporations, sovereign funds, and high-net-worth families on cross-border M&A, private equity placement, and risk management.\n\nOur firm stands on principles of absolute fiduciary integrity, disciplined risk assessment, and long-term value creation across economic cycles.`,
        imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&auto=format&fit=crop&q=80',
        imagePosition: 'left'
      },
      {
        id: 'apex-2',
        type: 'highlights_stats',
        title: 'Institutional Financial Highlights',
        subtitle: 'Key financial performance indicators and assets under management',
        content: 'We manage multi-billion dollar portfolios with consistent risk-adjusted returns.',
        stats: [
          { id: 'as1', label: 'Assets Under Advisory', value: '$14.2B+', subtext: 'Global AUM' },
          { id: 'as2', label: 'Cross-Border M&A Closed', value: '$28B+', subtext: 'Total transaction volume' },
          { id: 'as3', label: 'Global Offices', value: '12', subtext: 'NY, London, Zurich, Tokyo, HK' },
          { id: 'as4', label: 'Client Retention Rate', value: '98.4%', subtext: 'Multi-decade relationships' }
        ]
      },
      {
        id: 'apex-3',
        type: 'services',
        title: 'Institutional Wealth & Advisory Services',
        subtitle: 'Comprehensive financial solutions tailored for complex global needs',
        content: 'Our specialized divisions deliver bespoke advisory and capital restructuring.',
        services: [
          {
            id: 'asrv1',
            title: 'Mergers & Acquisitions Advisory',
            description: 'End-to-end advisory on buyside and sellside transactions, valuation analysis, and regulatory navigation.',
            badge: 'Investment Banking'
          },
          {
            id: 'asrv2',
            title: 'Private Equity & Growth Capital',
            description: 'Direct equity placement in high-growth technology, energy transition, and infrastructure ventures.',
            badge: 'Direct Investment'
          },
          {
            id: 'asrv3',
            title: 'Sovereign & Family Office Structuring',
            description: 'Multi-generational asset protection, tax optimization, and global trust management services.',
            badge: 'Private Wealth'
          }
        ]
      },
      {
        id: 'apex-4',
        type: 'leadership',
        title: 'Board of Governors & Managing Directors',
        subtitle: 'Seasoned stewards with unmatched financial expertise',
        content: 'Guided by leaders who have steered institutions through major global macroeconomic shifts.',
        members: [
          {
            id: 'am1',
            name: 'Arthur Pendelton',
            title: 'Senior Managing Partner',
            bio: '30+ years in international investment banking. Former Board Advisor to the European Central Bank.',
            avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&auto=format&fit=crop&q=80'
          },
          {
            id: 'am2',
            name: 'Claire Beauchamp',
            title: 'Head of Global M&A',
            bio: 'Structured over 100 landmark cross-border acquisitions in telecom, healthcare, and energy sectors.',
            avatarUrl: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=300&auto=format&fit=crop&q=80'
          }
        ]
      }
    ]
  },
  {
    id: 'template-ecogreen-energy',
    name: 'EcoGreen Energy Systems',
    tagline: 'Pioneering Clean Solar, Wind & Smart Grid Micro-Infrastructure',
    logoUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=200&auto=format&fit=crop&q=80',
    heroImageUrl: 'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?w=1200&auto=format&fit=crop&q=80',
    foundedYear: '2015',
    headquarters: 'Austin, Texas & Copenhagen, Denmark',
    website: 'https://ecogreen.example.com',
    email: 'info@ecogreen.example.com',
    phone: '+1 (512) 440-9900',
    industry: 'Renewable Energy & CleanTech',
    employees: '380+ CleanTech Specialists',
    primaryColor: '#059669',
    secondaryColor: '#064e3b',
    fontPairing: 'modern',
    layoutStyle: 'tech_grid',
    footerNote: 'EcoGreen Energy Corp — Certified B-Corporation & Net-Zero Leader.',
    sections: [
      {
        id: 'eco-1',
        type: 'overview',
        title: 'Accelerating the Global Clean Energy Transition',
        subtitle: 'Turnkey renewable microgrids and industrial energy storage solutions',
        content: `EcoGreen Energy Systems designs, manufactures, and deploys high-efficiency solar arrays, utility-scale battery energy storage systems (BESS), and intelligent AI-driven grid software.\n\nWe enable commercial campuses, industrial facilities, and municipal utilities to reduce carbon footprints while lowering long-term energy costs.`,
        imageUrl: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=800&auto=format&fit=crop&q=80',
        imagePosition: 'right'
      },
      {
        id: 'eco-2',
        type: 'highlights_stats',
        title: 'Environmental & Energy Impact',
        subtitle: 'Quantifiable carbon offset and clean energy generation',
        content: 'Our installations generate gigawatt-hours of clean power annually across 18 countries.',
        stats: [
          { id: 'es1', label: 'Clean Energy Generated', value: '3.4 GWh+', subtext: 'Annual total production' },
          { id: 'es2', label: 'Metric Tons CO2 Offset', value: '1.8M+', subtext: 'Equivalent to planting 85M trees' },
          { id: 'es3', label: 'Commercial Installations', value: '620+', subtext: 'Factories & corporate parks' },
          { id: 'es4', label: 'B-Corp Impact Score', value: '124.5', subtext: 'Top 5% globally' }
        ]
      }
    ]
  }
];
