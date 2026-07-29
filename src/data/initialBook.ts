import { BookProject } from '../types';

export const initialBookProject: BookProject = {
  id: 'book-presscraft-001',
  title: 'The Algorithmic Economy',
  subtitle: 'Industrial Architectures, Financial Intelligence & Quantum Value Networks',
  author: 'Dr. Aurelius Vance',
  category: 'Science, Tech & Math',
  lastSaved: new Date().toISOString(),
  cloudSynced: true,

  series: {
    isSeries: true,
    seriesTitle: 'The Quantum Architecture Anthology',
    seriesNumber: 'Book 1 of 3',
    publisherSeriesId: 'SERIES-QA-2026',
    tagline: 'An Epic Multi-Season Technical & Speculative Saga',
    seasons: [
      {
        id: 'season-1',
        seasonNumber: 1,
        title: 'Season 1: Dawn of Algorithmic Value',
        subtitle: 'Foundational Models & Stochastic Equilibrium',
        description: 'Covers the early theoretical breakthroughs, ledger mechanics, and initial continuous markets.',
        releaseYear: '2026',
        episodes: [
          {
            id: 'ep-1-1',
            episodeNumber: 1,
            title: 'Episode 1: The First Ledger',
            subtitle: 'Stochastic Models and Continuous Equilibrium',
            synopsis: 'Introduction to stochastic differential equations and value network balance.',
            releaseDate: '2026-01-15',
            chapterIds: ['ch-1']
          },
          {
            id: 'ep-1-2',
            episodeNumber: 2,
            title: 'Episode 2: Autonomous Markets',
            subtitle: 'High-Frequency Equilibrium',
            synopsis: 'Exploring liquidity algorithms and automated price discovery.',
            releaseDate: '2026-02-01',
            chapterIds: ['ch-2']
          }
        ]
      },
      {
        id: 'season-2',
        seasonNumber: 2,
        title: 'Season 2: The Quantum Shift',
        subtitle: 'Decentralized Intelligence & Autonomous Agents',
        description: 'Explores AI agentic governance, multi-party computation, and zero-knowledge proofs.',
        releaseYear: '2026',
        episodes: [
          {
            id: 'ep-2-1',
            episodeNumber: 1,
            title: 'Episode 1: Autonomous Governance',
            subtitle: 'Zero-Knowledge Multi-Agent Systems',
            synopsis: 'Self-governing smart contracts operating under extreme network latency.',
            releaseDate: '2026-06-10',
            chapterIds: []
          }
        ]
      }
    ]
  },

  cover: {
    title: 'THE ALGORITHMIC ECONOMY',
    subtitle: 'Industrial Architectures, Financial Intelligence & Quantum Value Networks',
    author: 'DR. AURELIUS VANCE',
    publisher: 'PRESSCRAFT ACADEMIC PRESS',
    coverBgColor: '#18181b', // Charcoal Matt Grey
    textColor: '#f4f4f5',
    accentColor: '#f97316', // Vibrant Orange Accent
    spineWidthMm: 22,
    backBlurb: 'A groundbreaking treatise on modern quantitative systems, tokenized ledger economics, and high-frequency autonomous market making. Essential reading for industrial engineers, financial strategists, and computational scientists.',
    artworkUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop',
    fullBleedImage: false,
    imageOpacity: 90,
    layoutStyle: 'modern-minimal'
  },

  frontMatter: {
    includeTitlePage: true,
    includeCopyright: true,
    copyrightText: 'Copyright © 2026 PressCraft Academic Press. All rights reserved. No part of this publication may be reproduced, stored in a retrieval system, or transmitted in any form without prior permission.',
    isbn: '978-1-954820-42-9',
    publisher: 'PressCraft Publishing House • London & New York',
    
    includeDedication: true,
    dedicationText: 'To the visionary engineers and mathematical pioneers whose quiet rigor constructs the resilient foundations of our digital future.',
    
    includeForeword: true,
    forewordAuthor: 'Prof. Elena Rostova, Oxford Institute of Cybernetics',
    forewordContent: 'When Dr. Vance first shared his initial draft of this treatise, the global financial architecture was experiencing unprecedented volatility. Through relentless empirical analysis and rigorous mathematical modeling, this book illuminates the path toward self-correcting algorithmic equilibrium.',
    
    includeExecutiveSummary: true,
    executiveSummaryContent: `### Executive Summary & Industrial Scope

The modern industrial enterprise no longer operates as a isolated production facility, but as a node in a high-speed, distributed algorithmic ecosystem.

1. **Foundational Premise**: Value distribution in current high-frequency markets can be modeled using continuous stochastic differential equations and stochastic calculus.
2. **Key Innovation**: Introducing the *Dynamic Value Equilibrium Framework (DVEF)* to automatically balance ledger liquidity and transaction latency.
3. **Target Readership**: Systems architects, financial quantitative analysts, computer science faculty, and executive technology leaders.`,
    
    includeTOC: true,
    includeIndex: true,
    indexConfig: {
      title: 'Index of Terms & Keywords',
      style: 'columns-2',
      autoExtractKeywords: true,
      customTerms: [
        'Algorithmic Equilibrium',
        'Autonomous Systems',
        'Continuous Stochastic',
        'Dynamic Value Equilibrium Framework',
        'Financial Architecture',
        'Ledger Liquidity',
        'Quantitative Analysts',
        'Transaction Latency'
      ]
    }
  },

  chapters: [
    {
      id: 'ch-1',
      number: 1,
      title: 'Foundations of Algorithmic Value',
      subtitle: 'Stochastic Models and Continuous Equilibrium',
      wordCount: 840,
      blocks: [
        {
          id: 'b-101',
          type: 'heading',
          text: '1.1 Introduction to Autonomous Economic Nodes',
          align: 'left'
        },
        {
          id: 'b-102',
          type: 'paragraph',
          text: 'In contemporary industrial systems, information throughput is directly coupled to capital velocity. When transaction fees fluctuate unpredictably, resource allocation degrades across the supply network. To overcome this systemic fragility, modern market architectures utilize autonomous market makers (AMMs) governed by invariant mathematical curves.',
          indentLevel: 0,
          fontStyle: 'serif'
        },
        {
          id: 'b-103',
          type: 'clause',
          text: 'Clause 1.1A: Conservation of Liquidity Invariants',
          bold: true
        },
        {
          id: 'b-104',
          type: 'paragraph',
          text: 'Any industrial transaction pool must satisfy the core constant-product invariant where liquidity reserves X and Y fulfill the state function:',
          indentLevel: 0
        },
        {
          id: 'b-105',
          type: 'latex',
          text: 'LaTeX Formula',
          latexFormula: 'X \\cdot Y = K \\quad \\implies \\quad (X + \\Delta x)(Y - \\Delta y) = K'
        },
        {
          id: 'b-106',
          type: 'subheading',
          text: '1.2 Continuous Stochastic Differential Equations',
          align: 'left'
        },
        {
          id: 'b-107',
          type: 'paragraph',
          text: 'Modeling asset price fluctuation S(t) under fractional Brownian motion yields the following stochastic equation:',
          indentLevel: 0
        },
        {
          id: 'b-108',
          type: 'latex',
          text: 'LaTeX Formula',
          latexFormula: 'dS_t = \\mu S_t dt + \\sigma S_t dW_t + \\int_{\\mathbb{R}} \\gamma(S_{t^-}, z) \\tilde{N}(dt, dz)'
        },
        {
          id: 'b-109',
          type: 'image',
          text: 'Liquidity Depth Curve Visualization',
          imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1000&auto=format&fit=crop',
          imageCaption: 'Figure 1.1: Real-time Liquidity Depth Curve across Multi-Tiered Market Exchanges.',
          imageWrap: 'center'
        },
        {
          id: 'b-110',
          type: 'quote',
          text: '"Rigor in mathematical definition is not merely an academic exercise; it is the sole safeguard against systemic liquidity cascade failure in automated trading engines."',
          align: 'center'
        }
      ]
    },
    {
      id: 'ch-2',
      number: 2,
      title: 'Accounting Ledgers & Code Execution',
      subtitle: 'Implementation Patterns for Financial Systems',
      wordCount: 920,
      blocks: [
        {
          id: 'b-201',
          type: 'heading',
          text: '2.1 Double-Entry Corporate Ledger Verification',
          align: 'left'
        },
        {
          id: 'b-202',
          type: 'paragraph',
          text: 'Below is an illustrative enterprise general ledger snippet recording automated treasury balance operations during Q3 settlement:',
          indentLevel: 0
        },
        {
          id: 'b-203',
          type: 'ledger',
          text: 'Quarterly Treasury Settlement Ledger',
          ledgerData: [
            { date: '2026-07-01', account: '1010 Cash & Liquidity Reserves', debit: '$1,250,000.00', credit: '$0.00', notes: 'Consolidated yield pool deposit' },
            { date: '2026-07-01', account: '4020 Automated Market Revenue', debit: '$0.00', credit: '$1,250,000.00', notes: 'Smart contract settlement fees' },
            { date: '2026-07-15', account: '2050 Liquidity Pool Liability', debit: '$450,000.00', credit: '$0.00', notes: 'Rebalancing reserve tranche A' },
            { date: '2026-07-15', account: '1010 Cash & Liquidity Reserves', debit: '$0.00', credit: '$450,000.00', notes: 'Internal ledger adjustment' }
          ]
        },
        {
          id: 'b-204',
          type: 'subheading',
          text: '2.2 Algorithmic Matching Engine Core (TypeScript)',
          align: 'left'
        },
        {
          id: 'b-205',
          type: 'code',
          text: 'Engine implementation snippet',
          codeLanguage: 'typescript',
          codeSnippet: `interface Order {
  id: string;
  side: 'BUY' | 'SELL';
  price: number;
  amount: number;
}

export class OrderBookEngine {
  private bids: Order[] = [];
  private asks: Order[] = [];

  public executeTrade(incoming: Order): number {
    let filled = 0;
    const targets = incoming.side === 'BUY' ? this.asks : this.bids;
    
    for (const match of targets) {
      if (incoming.amount <= 0) break;
      if (incoming.side === 'BUY' && match.price > incoming.price) break;
      
      const tradeQty = Math.min(incoming.amount, match.amount);
      filled += tradeQty;
      incoming.amount -= tradeQty;
      match.amount -= tradeQty;
    }
    return filled;
  }
}`
        },
        {
          id: 'b-206',
          type: 'callout',
          text: 'Notice: In production environments, floating-point arithmetic should be replaced with fixed-point precision integer types to avoid IEEE 754 rounding discrepancies.',
          align: 'left'
        },
        {
          id: 'b-207',
          type: 'subheading',
          text: '2.3 Section Assessment & Knowledge Check',
          align: 'left'
        },
        {
          id: 'b-208',
          type: 'quiz',
          text: 'Chapter 2 Quiz Questions',
          quizQuestions: [
            {
              id: 'q-1',
              question: 'Which condition triggers a liquidity rebalancing cascade in a constant-product AMM?',
              options: [
                'When trade volume exceeds pool reserves by 50%',
                'When arbitrage opportunities exceed gas fee thresholds',
                'When invariant K is modified during an unverified state change',
                'When transaction fee rates decay to zero'
              ],
              correctIndex: 2,
              explanation: 'Invariant K must strictly remain constant unless liquidity is explicitly added or removed from the pool.'
            },
            {
              id: 'q-2',
              question: 'In modern algorithmic ledger systems, why is IEEE 754 floating point arithmetic prohibited for balance tracking?',
              options: [
                'It runs too slowly on GPUs',
                'It causes non-deterministic precision loss across different processor architectures',
                'It cannot represent negative debit numbers',
                'It requires specialized database indexing'
              ],
              correctIndex: 1,
              explanation: 'Floating point rounding discrepancies lead to non-deterministic execution states in distributed ledger consensus.'
            }
          ]
        }
      ]
    }
  ],

  watermark: {
    enabled: true,
    text: 'CONFIDENTIAL • DRAFT COPY',
    opacity: 0.08,
    rotation: -35,
    fontSize: 54
  },

  exportSettings: {
    includeCover: true,
    includeFrontMatter: true,
    includeExecSummary: true,
    includeTOC: true,
    includeQuizzes: true,
    includeWatermark: true,
    includeFootnotes: true,
    trimSize: '6x9',
    fontPairing: 'Classic Serif',
    googleSerifFont: 'EB Garamond',
    googleSansFont: 'Inter',
    marginPreset: 'auto',
    customMargins: {
      top: '0.75in',
      right: '0.625in',
      bottom: '0.75in',
      left: '0.875in'
    },
    showRunningHeader: true,
    showPageNumbers: true,
    enableHyphenation: true,
    autoHyphenation: true
  },

  headerFooter: {
    enabled: true,
    headerLeftText: 'The Algorithmic Economy',
    headerCenterText: '',
    headerRightText: 'Dr. Aurelius Vance',
    footerLeftText: 'PressCraft Academic Press',
    footerCenterText: 'Page {page}',
    footerRightText: 'ISBN 978-1-954820-42-9',
    showPageNumbers: true,
    headerDividerLine: true,
    footerDividerLine: true
  },

  assets: [
    {
      id: 'asset-default-1',
      name: 'Algorithmic Economy Cover Artwork',
      url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1200',
      caption: 'Abstract digital economy network visualization',
      category: 'covers',
      tags: ['cover', 'abstract', 'network'],
      uploadedAt: new Date().toISOString(),
      width: 1200,
      height: 800
    },
    {
      id: 'asset-default-2',
      name: 'Data Analytics Dashboard & Trends',
      url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=1000',
      caption: 'Figure 1.1 Automated algorithmic trading throughput',
      category: 'charts',
      tags: ['chart', 'analytics', 'finance'],
      uploadedAt: new Date().toISOString(),
      width: 1000,
      height: 667
    },
    {
      id: 'asset-default-3',
      name: 'Neural Network Architecture Diagram',
      url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=1000',
      caption: 'Figure 2.1 Deep learning matrix computation nodes',
      category: 'figures',
      tags: ['ai', 'code', 'neural-net'],
      uploadedAt: new Date().toISOString(),
      width: 1000,
      height: 667
    }
  ]
};
