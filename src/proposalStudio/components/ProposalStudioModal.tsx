import React, { useState, useEffect } from 'react';
import { 
  ProjectProposal, 
  ProposalCategory, 
  ProposalSection, 
  ProposalTemplate 
} from '../types';
import { generateProposalWithAI } from '../proposalAiService';
import { 
  getStoredProposalTemplates, 
  saveProposalAsTemplate, 
  createProposalFromTemplate, 
  exportTemplateToFile, 
  deleteStoredTemplate 
} from '../templateManager';
import { FinancialPlanner } from './FinancialPlanner';
import { ProposalTableEditor } from './ProposalTableEditor';
import { 
  FileSpreadsheet, 
  Sparkles, 
  Wand2, 
  FileText, 
  Calculator, 
  Calendar, 
  Import, 
  Check, 
  X, 
  RefreshCw, 
  Download, 
  FolderCheck, 
  FolderPlus, 
  Folder, 
  Save, 
  Trash2, 
  Layers, 
  Upload, 
  BookOpen,
  ShieldCheck,
  CheckSquare,
  UserCheck,
  Building,
  Mail,
  MapPin,
  Lock,
  FileCheck,
  Plus
} from 'lucide-react';
import { Chapter, ContentBlock, BookProject } from '../../types';
import { exportToWordDocx } from '../../lib/exportUtils';

interface ProposalStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportToBookStudio?: (importedChapter: Chapter) => void;
}

export const ProposalStudioModal: React.FC<ProposalStudioModalProps> = ({
  isOpen,
  onClose,
  onImportToBookStudio
}) => {
  // Mode Selection: 'ai' vs 'template'
  const [creationMode, setCreationMode] = useState<'ai' | 'template'>('template');

  // Wizard Input State
  const [projectTitle, setProjectTitle] = useState('Enterprise Cloud Infrastructure Modernization');
  const [clientName, setClientName] = useState('Global Logistics Corp');
  const [category, setCategory] = useState<ProposalCategory>('tech_software');
  const [estimatedBudget, setEstimatedBudget] = useState<number>(180000);
  const [durationMonths, setDurationMonths] = useState<number>(6);
  const [projectDescription, setProjectDescription] = useState('Migrate legacy monolithic systems to a scalable microservices architecture with real-time telemetry and 99.99% uptime guarantees.');
  
  // Template Manager State
  const [templates, setTemplates] = useState<ProposalTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [newTemplateName, setNewTemplateName] = useState('');
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);

  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [proposal, setProposal] = useState<ProjectProposal | null>(null);
  const [activeTab, setActiveTab] = useState<'brief' | 'cover' | 'privacy' | 'checklist' | 'financials' | 'tables'>('brief');
  const [importSuccessMsg, setImportSuccessMsg] = useState<string | null>(null);

  // Accomplishments New Item Input State
  const [newAccTitle, setNewAccTitle] = useState('');
  const [newAccDesc, setNewAccDesc] = useState('');
  const [newAccCategory, setNewAccCategory] = useState('Key Accomplishment');

  // Load local templates on mount
  useEffect(() => {
    const list = getStoredProposalTemplates();
    setTemplates(list);
    if (list.length > 0 && !selectedTemplateId) {
      setSelectedTemplateId(list[0].id);
    }
  }, [isOpen]);

  // Generate proposal via AI
  const handleGenerateProposal = async () => {
    setIsGenerating(true);
    setImportSuccessMsg(null);
    try {
      const generated = await generateProposalWithAI({
        projectTitle,
        clientName,
        category,
        projectDescription,
        estimatedBudget,
        durationMonths
      });
      setProposal(generated);
      setActiveTab('brief');
    } catch (err) {
      console.error('Error generating proposal:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Generate proposal from Template (No AI Required)
  const handleCreateFromTemplate = () => {
    const selected = templates.find((t) => t.id === selectedTemplateId);
    if (!selected) return;

    const instantiated = createProposalFromTemplate(
      selected,
      projectTitle,
      clientName,
      estimatedBudget
    );

    setProposal(instantiated);
    setActiveTab('brief');
    setImportSuccessMsg(`Proposal created offline using template "${selected.name}"!`);
    setTimeout(() => setImportSuccessMsg(null), 4000);
  };

  // Save active proposal as custom template in local computer folder
  const handleSaveAsTemplate = () => {
    if (!proposal) return;
    const tName = newTemplateName.trim() || `${proposal.title} (Custom Template)`;
    const saved = saveProposalAsTemplate(proposal, tName);
    
    const updated = getStoredProposalTemplates();
    setTemplates(updated);
    setSelectedTemplateId(saved.id);
    setIsSavingTemplate(false);
    setNewTemplateName('');

    setImportSuccessMsg(`Saved as template in local folder "PressCraft_Proposals/Templates/Custom/"!`);
    setTimeout(() => setImportSuccessMsg(null), 4000);
  };

  // Delete custom template
  const handleDeleteTemplate = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = deleteStoredTemplate(id);
    setTemplates(updated);
    if (selectedTemplateId === id && updated.length > 0) {
      setSelectedTemplateId(updated[0].id);
    }
  };

  // Import template JSON file from computer disk
  const handleImportTemplateJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const rawJson = evt.target?.result as string;
        const parsed: ProposalTemplate = JSON.parse(rawJson);
        if (!parsed.templateData || !parsed.name) {
          alert('Invalid proposal template file format.');
          return;
        }

        const saved = saveProposalAsTemplate(
          { ...parsed.templateData, id: '', createdAt: '' },
          parsed.name,
          parsed.description
        );

        const updated = getStoredProposalTemplates();
        setTemplates(updated);
        setSelectedTemplateId(saved.id);

        setImportSuccessMsg(`Template "${parsed.name}" imported into local templates library!`);
        setTimeout(() => setImportSuccessMsg(null), 4000);
      } catch (err) {
        alert('Failed to parse proposal template JSON file.');
      }
    };
    reader.readAsText(file);
  };

  /**
   * Export proposal directly to Word (.docx) file
   */
  const handleExportToWordDocx = () => {
    if (!proposal) return;

    const dummyBookProject: BookProject = {
      id: proposal.id,
      title: proposal.title,
      subtitle: `Project Proposal Prepared for ${proposal.clientName}`,
      author: proposal.authorName || 'Strategic Consulting',
      category: 'Business & Executive',
      cover: {
        title: proposal.title,
        subtitle: `Client: ${proposal.clientName}`,
        author: proposal.authorName || 'Strategic Consulting',
        publisher: 'PressCraft Proposal Studio',
        coverBgColor: '#1E3A8A',
        textColor: '#FFFFFF',
        accentColor: '#3B82F6',
        spineWidthMm: 10,
        backBlurb: 'Formal project proposal with complete financial breakdown and milestone roadmap.',
        layoutStyle: 'modern-minimal'
      },
      frontMatter: {
        includeTitlePage: true,
        includeCopyright: true,
        copyrightText: `© ${new Date().getFullYear()} ${proposal.authorName || 'Strategic Consulting'}. Confidential.`,
        isbn: 'PROPOSAL-2026-X',
        publisher: 'PressCraft Proposal Studio',
        includeDedication: false,
        dedicationText: '',
        includeForeword: false,
        forewordAuthor: '',
        forewordContent: '',
        includeExecutiveSummary: true,
        executiveSummaryContent: proposal.executiveSummary,
        includeTOC: true
      },
      exportSettings: {
        includeCover: true,
        includeFrontMatter: true,
        includeExecSummary: true,
        includeTOC: true,
        includeQuizzes: false,
        includeWatermark: false,
        includeFootnotes: false,
        trimSize: '8.5x11',
        fontPairing: 'Modern Sans',
        showRunningHeader: true,
        showPageNumbers: true,
        enableHyphenation: true,
        autoHyphenation: true
      },
      watermark: {
        enabled: false,
        text: 'CONFIDENTIAL',
        opacity: 0.15,
        rotation: -45,
        fontSize: 72
      },
      cloudSynced: false,
      lastSaved: new Date().toISOString(),
      chapters: [
        {
          id: 'ch-exec-summary',
          number: 1,
          title: 'Executive Brief & Strategy',
          wordCount: 300,
          blocks: [
            { id: 'b-p1', type: 'subheading', text: 'Problem Statement' },
            { id: 'b-p2', type: 'paragraph', text: proposal.problemStatement },
            { id: 'b-sol1', type: 'subheading', text: 'Proposed Solution & Deliverable Scope' },
            { id: 'b-sol2', type: 'paragraph', text: proposal.proposedSolution }
          ]
        },
        {
          id: 'ch-financials',
          number: 2,
          title: 'Financial Planning & Budget Model',
          wordCount: 400,
          blocks: proposal.budgetItems.flatMap((item) => [
            {
              id: `b-bud-${item.id}`,
              type: 'clause',
              text: `${item.name} (${item.category}): Total Cost $${(item.q1Cost + item.q2Cost + item.q3Cost + item.q4Cost).toLocaleString()}`
            }
          ])
        },
        {
          id: 'ch-milestones',
          number: 3,
          title: 'Milestone Timeline & Risk Assessment',
          wordCount: 350,
          blocks: [
            ...proposal.milestones.map((m) => ({
              id: `b-ms-${m.id}`,
              type: 'paragraph' as const,
              text: `${m.phase} - ${m.taskName} (Owner: ${m.owner}, Cost: $${m.estimatedCost.toLocaleString()}, Status: ${m.status})`
            })),
            ...proposal.risks.map((r) => ({
              id: `b-rk-${r.id}`,
              type: 'callout' as const,
              text: `Risk: ${r.riskName} [Impact: ${r.impact}] -> Strategy: ${r.mitigationStrategy}`
            }))
          ]
        }
      ]
    };

    exportToWordDocx(dummyBookProject);
  };

  /**
   * Import proposal as a formatted chapter in PressCraft Book Studio
   */
  const handleImportToMainStudio = () => {
    if (!proposal || !onImportToBookStudio) return;

    const totalBudget = proposal.budgetItems.reduce((sum, i) => sum + i.q1Cost + i.q2Cost + i.q3Cost + i.q4Cost, 0);

    const blocks: ContentBlock[] = [];

    // 1. Privacy Notice Clause
    if (proposal.privacyLetter?.enabled) {
      blocks.push({
        id: `proposal-priv-head-${Date.now()}`,
        type: 'clause',
        text: `🔒 ${proposal.privacyLetter.noticeTitle} (Effective Date: ${proposal.privacyLetter.effectiveDate})`
      });
      blocks.push({
        id: `proposal-priv-body-${Date.now()}`,
        type: 'quote',
        text: proposal.privacyLetter.confidentialityContent
      });
    }

    // 2. Addressee & Recipient Cover Details
    blocks.push({
      id: `proposal-callout-${Date.now()}`,
      type: 'callout',
      text: `PROJECT PROPOSAL: ${proposal.title} | Prepared For: ${proposal.recipientName || proposal.clientName} (${proposal.recipientTitle || 'Executive'}, ${proposal.recipientCompany || proposal.clientName}) | Address: ${proposal.recipientAddress || 'Corporate HQ'} | Budget Target: $${totalBudget.toLocaleString()}`
    });

    // 3. Accomplishment Checklist
    if (proposal.accomplishments && proposal.accomplishments.length > 0) {
      blocks.push({
        id: `proposal-acc-head-${Date.now()}`,
        type: 'subheading',
        text: 'Verified Accomplishments & Track Record Checklist'
      });
      proposal.accomplishments.forEach((acc) => {
        blocks.push({
          id: `proposal-acc-${acc.id}`,
          type: 'paragraph',
          text: `[${acc.isCompleted ? '✓ COMPLETED' : '⏳ IN PROGRESS'}] ${acc.title} (${acc.category}${acc.completedDate ? ` - ${acc.completedDate}` : ''}): ${acc.description}`
        });
      });
    }

    // 4. Executive Summary
    blocks.push({
      id: `proposal-exec-${Date.now()}`,
      type: 'heading',
      text: 'Executive Summary'
    });
    blocks.push({
      id: `proposal-exec-body-${Date.now()}`,
      type: 'paragraph',
      text: proposal.executiveSummary
    });

    // 5. Problem Statement & Proposed Solution
    blocks.push(
      {
        id: `proposal-prob-head-${Date.now()}`,
        type: 'subheading',
        text: '1. Problem Statement'
      },
      {
        id: `proposal-prob-body-${Date.now()}`,
        type: 'paragraph',
        text: proposal.problemStatement
      },
      {
        id: `proposal-sol-head-${Date.now()}`,
        type: 'subheading',
        text: '2. Proposed Solution'
      },
      {
        id: `proposal-sol-body-${Date.now()}`,
        type: 'paragraph',
        text: proposal.proposedSolution
      },
      {
        id: `proposal-[#3]-head-${Date.now()}`,
        type: 'subheading',
        text: '3. Financial Planning Breakdown'
      }
    );

    proposal.budgetItems.forEach((b) => {
      const lineTotal = b.q1Cost + b.q2Cost + b.q3Cost + b.q4Cost;
      blocks.push({
        id: `proposal-b-${b.id}`,
        type: 'clause',
        text: `• ${b.name} (${b.category}): Q1=$${b.q1Cost.toLocaleString()} | Q2=$${b.q2Cost.toLocaleString()} | Q3=$${b.q3Cost.toLocaleString()} | Q4=$${b.q4Cost.toLocaleString()} [Total = $${lineTotal.toLocaleString()}]`
      });
    });

    blocks.push({
      id: `proposal-[#4]-head-${Date.now()}`,
      type: 'subheading',
      text: '4. Milestone Deliverables'
    });

    proposal.milestones.forEach((m) => {
      blocks.push({
        id: `proposal-m-${m.id}`,
        type: 'paragraph',
        text: `[${m.phase}] ${m.taskName} - Assigned to: ${m.owner} (Cost: $${m.estimatedCost.toLocaleString()}, Status: ${m.status})`
      });
    });

    const proposalChapter: Chapter = {
      id: `ch-prop-${Date.now()}`,
      number: 99,
      title: `Proposal: ${proposal.title}`,
      blocks,
      wordCount: blocks.reduce((sum, b) => sum + (b.text?.split(/\s+/).length || 0), 0)
    };

    onImportToBookStudio(proposalChapter);
    setImportSuccessMsg(`Proposal "${proposal.title}" successfully imported into PressCraft Studio!`);
    setTimeout(() => setImportSuccessMsg(null), 4000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-lg flex items-center justify-center p-3 sm:p-6 overflow-hidden select-none">
      <div className="bg-[#181818] border border-[#333333] rounded-2xl max-w-6xl w-full h-[92vh] shadow-2xl flex flex-col overflow-hidden text-gray-100">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#2A2A2A] px-6 py-4 bg-[#141414] shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white shadow-lg">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white uppercase tracking-wider flex items-center gap-2">
                Project Proposal Studio
                <span className="text-[10px] bg-blue-500/20 text-blue-400 border border-blue-500/40 px-2 py-0.5 rounded-full font-mono font-bold">
                  Graphs • Financial Models • Tables
                </span>
              </h2>
              <p className="text-xs text-gray-400">
                Author executive proposals with interactive Recharts financial models, milestone tables, and risk matrices.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-[#2A2A2A] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Creation Mode Selector */}
          <div className="bg-[#212121] border border-[#333] rounded-2xl p-5 space-y-4 shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#2D2D2D] pb-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCreationMode('template')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    creationMode === 'template'
                      ? 'bg-emerald-600 text-white shadow-lg'
                      : 'bg-[#181818] text-gray-400 hover:text-white hover:bg-[#282828]'
                  }`}
                >
                  <FolderCheck className="w-4 h-4 text-emerald-300" />
                  <span>1. Template Mode (No AI Required)</span>
                </button>

                <button
                  onClick={() => setCreationMode('ai')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    creationMode === 'ai'
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-[#181818] text-gray-400 hover:text-white hover:bg-[#282828]'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-blue-300" />
                  <span>2. AI Proposal Wizard</span>
                </button>
              </div>

              <div className="flex items-center gap-2 text-[11px] font-mono text-gray-400 bg-[#141414] px-3 py-1.5 rounded-lg border border-[#2D2D2D]">
                <FolderCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Local Folder: <strong className="text-gray-200">PressCraft_Proposals/Templates/</strong></span>
              </div>
            </div>

            {/* MODE 1: TEMPLATE MODE (NO AI) */}
            {creationMode === 'template' && (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2 font-mono">
                      <FolderPlus className="w-4 h-4" />
                      Select Pre-Loaded AI Template or Custom Saved Template
                    </h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Generate documents instantly without AI API calls using structured templates stored in your computer folder.
                    </p>
                  </div>

                  <label className="flex items-center gap-1.5 px-3 py-1.5 bg-[#181818] hover:bg-[#282828] border border-[#3A3A3A] text-gray-200 font-bold text-xs rounded-xl cursor-pointer transition-colors">
                    <Upload className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Import Template (.json)</span>
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImportTemplateJson}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Templates Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {templates.map((tpl) => {
                    const isSelected = selectedTemplateId === tpl.id;
                    return (
                      <div
                        key={tpl.id}
                        onClick={() => setSelectedTemplateId(tpl.id)}
                        className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between ${
                          isSelected
                            ? 'bg-emerald-950/40 border-emerald-500 shadow-md ring-1 ring-emerald-500/50'
                            : 'bg-[#151515] border-[#2E2E2E] hover:border-gray-500 hover:bg-[#1A1A1A]'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                              tpl.isAiGenerated
                                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                : 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                            }`}>
                              {tpl.isAiGenerated ? 'AI Crafted Template' : 'User Saved Template'}
                            </span>

                            {tpl.isUserSaved && (
                              <button
                                onClick={(e) => handleDeleteTemplate(tpl.id, e)}
                                title="Delete Custom Template"
                                className="text-gray-500 hover:text-red-400 p-1 rounded-md hover:bg-red-950/40 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>

                          <h4 className="text-xs font-bold text-white mb-1 line-clamp-1">
                            {tpl.name}
                          </h4>
                          <p className="text-[11px] text-gray-400 line-clamp-2 leading-relaxed mb-3">
                            {tpl.description}
                          </p>
                        </div>

                        <div className="pt-2 border-t border-[#252525] flex items-center justify-between text-[10px] font-mono text-gray-400">
                          <span>Target: ${tpl.templateData.targetBudget.toLocaleString()}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              exportTemplateToFile(tpl);
                            }}
                            title="Export template to computer download folder"
                            className="text-emerald-400 hover:underline flex items-center gap-1"
                          >
                            <Download className="w-3 h-3" />
                            <span>Export</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Selected Template Parameters */}
                <div className="bg-[#141414] border border-[#2D2D2D] rounded-xl p-4 space-y-3">
                  <span className="text-[11px] font-mono font-bold text-gray-300 uppercase tracking-wider block">
                    Customize Document Parameters (Offline Generation):
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-gray-400 block mb-1">
                        Proposal Title:
                      </label>
                      <input
                        type="text"
                        value={projectTitle}
                        onChange={(e) => setProjectTitle(e.target.value)}
                        className="w-full p-2 bg-[#1A1A1A] border border-[#333] rounded-lg text-xs text-white"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-gray-400 block mb-1">
                        Client / Organization:
                      </label>
                      <input
                        type="text"
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        className="w-full p-2 bg-[#1A1A1A] border border-[#333] rounded-lg text-xs text-white"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-gray-400 block mb-1">
                        Budget Scaling Target ($):
                      </label>
                      <input
                        type="number"
                        value={estimatedBudget}
                        onChange={(e) => setEstimatedBudget(Number(e.target.value))}
                        className="w-full p-2 bg-[#1A1A1A] border border-[#333] rounded-lg text-xs text-emerald-400 font-mono"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={handleCreateFromTemplate}
                      className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg cursor-pointer"
                    >
                      <FolderCheck className="w-4 h-4" />
                      <span>Generate Document from Template (No AI)</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* MODE 2: AI GENERATOR WIZARD */}
            {creationMode === 'ai' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-300 uppercase tracking-wider block mb-1">
                      Project Title:
                    </label>
                    <input
                      type="text"
                      value={projectTitle}
                      onChange={(e) => setProjectTitle(e.target.value)}
                      placeholder="e.g. NextGen Supply Chain Platform..."
                      className="w-full p-2.5 bg-[#141414] border border-[#333] rounded-xl text-xs text-white focus:outline-hidden focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-300 uppercase tracking-wider block mb-1">
                      Target Client / Organization:
                    </label>
                    <input
                      type="text"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder="e.g. Acme Enterprises Inc..."
                      className="w-full p-2.5 bg-[#141414] border border-[#333] rounded-xl text-xs text-white focus:outline-hidden focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-300 uppercase tracking-wider block mb-1">
                      Industry / Category:
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as ProposalCategory)}
                      className="w-full p-2.5 bg-[#141414] border border-[#333] rounded-xl text-xs text-blue-400 font-mono focus:outline-hidden focus:border-blue-500 cursor-pointer"
                    >
                      <option value="tech_software">Software & IT Engineering</option>
                      <option value="business_strategy">Management & Strategy</option>
                      <option value="construction_eng">Infrastructure & Engineering</option>
                      <option value="marketing_launch">Marketing & Product Launch</option>
                      <option value="research_grant">Research & Grant Application</option>
                      <option value="creative_agency">Creative Agency Proposal</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-300 uppercase tracking-wider block mb-1">
                      Estimated Budget Target ($):
                    </label>
                    <input
                      type="number"
                      value={estimatedBudget}
                      onChange={(e) => setEstimatedBudget(Number(e.target.value))}
                      className="w-full p-2.5 bg-[#141414] border border-[#333] rounded-xl text-xs text-emerald-400 font-mono focus:outline-hidden focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-300 uppercase tracking-wider block mb-1">
                      Timeline (Months):
                    </label>
                    <input
                      type="number"
                      value={durationMonths}
                      onChange={(e) => setDurationMonths(Number(e.target.value))}
                      className="w-full p-2.5 bg-[#141414] border border-[#333] rounded-xl text-xs text-amber-400 font-mono focus:outline-hidden focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-300 uppercase tracking-wider block mb-1">
                    Project Scope Brief & Objectives:
                  </label>
                  <textarea
                    value={projectDescription}
                    onChange={(e) => setProjectDescription(e.target.value)}
                    rows={2}
                    placeholder="Key goals, deliverables, or problem context..."
                    className="w-full p-3 bg-[#141414] border border-[#333] rounded-xl text-xs text-white focus:outline-hidden focus:border-blue-500 resize-none"
                  />
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={handleGenerateProposal}
                    disabled={isGenerating || !projectTitle.trim()}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-xl cursor-pointer"
                  >
                    {isGenerating ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Modeling Financials & Generating Proposal...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Generate Proposal & Financial Model via AI</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Active Proposal Studio Area */}
          {proposal && (
            <div className="space-y-5 border-t border-[#2A2A2A] pt-5">
              
              {/* Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-[#141414] p-3 rounded-xl border border-[#2D2D2D]">
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    onClick={() => setActiveTab('brief')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs transition-colors cursor-pointer ${
                      activeTab === 'brief'
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-[#222] text-gray-300 hover:bg-[#333]'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    Brief
                  </button>

                  <button
                    onClick={() => setActiveTab('cover')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs transition-colors cursor-pointer ${
                      activeTab === 'cover'
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-[#222] text-gray-300 hover:bg-[#333]'
                    }`}
                  >
                    <UserCheck className="w-3.5 h-3.5 text-blue-400" />
                    Cover Page & Addressee
                  </button>

                  <button
                    onClick={() => setActiveTab('privacy')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs transition-colors cursor-pointer ${
                      activeTab === 'privacy'
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-[#222] text-gray-300 hover:bg-[#333]'
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                    Privacy & Confidentiality Letter
                  </button>

                  <button
                    onClick={() => setActiveTab('checklist')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs transition-colors cursor-pointer ${
                      activeTab === 'checklist'
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-[#222] text-gray-300 hover:bg-[#333]'
                    }`}
                  >
                    <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
                    Accomplishments Checklist
                  </button>

                  <button
                    onClick={() => setActiveTab('financials')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs transition-colors cursor-pointer ${
                      activeTab === 'financials'
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-[#222] text-gray-300 hover:bg-[#333]'
                    }`}
                  >
                    <Calculator className="w-3.5 h-3.5 text-amber-400" />
                    Financial Models
                  </button>

                  <button
                    onClick={() => setActiveTab('tables')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs transition-colors cursor-pointer ${
                      activeTab === 'tables'
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-[#222] text-gray-300 hover:bg-[#333]'
                    }`}
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    Milestones & Risks
                  </button>
                </div>

                {/* Import, Export & Save Template Actions */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setIsSavingTemplate(!isSavingTemplate)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer shadow-md"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save to Template Folder</span>
                  </button>

                  {onImportToBookStudio && (
                    <button
                      onClick={handleImportToMainStudio}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer shadow-md"
                    >
                      <Import className="w-3.5 h-3.5" />
                      <span>Import into Book Studio</span>
                    </button>
                  )}

                  <button
                    onClick={handleExportToWordDocx}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer shadow-md"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Export Word (.docx)</span>
                  </button>
                </div>
              </div>

              {/* Save Template Dialog Box */}
              {isSavingTemplate && (
                <div className="p-4 bg-[#1E1E1E] border border-purple-500/50 rounded-xl space-y-3 shadow-2xl">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-purple-300 uppercase tracking-wider font-mono flex items-center gap-2">
                      <FolderPlus className="w-4 h-4 text-purple-400" />
                      Save Active Document as Custom Template in Folder "PressCraft_Proposals/Templates/Custom/"
                    </span>
                    <button
                      onClick={() => setIsSavingTemplate(false)}
                      className="text-gray-400 hover:text-white text-xs"
                    >
                      Cancel
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newTemplateName}
                      onChange={(e) => setNewTemplateName(e.target.value)}
                      placeholder={`Custom Template: ${proposal.title}`}
                      className="flex-1 p-2.5 bg-[#121212] border border-[#3A3A3A] rounded-xl text-xs text-white focus:outline-hidden focus:border-purple-500"
                    />

                    <button
                      onClick={handleSaveAsTemplate}
                      className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-colors cursor-pointer shadow-lg shrink-0 flex items-center gap-1.5"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Confirm Save</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Alert Notification */}
              {importSuccessMsg && (
                <div className="p-3 bg-emerald-950/80 border border-emerald-500/50 rounded-xl flex items-center gap-2 text-xs text-emerald-300">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{importSuccessMsg}</span>
                </div>
              )}

              {/* TAB 1: Executive Brief */}
              {activeTab === 'brief' && (
                <div className="bg-[#181818] border border-[#2D2D2D] rounded-xl p-6 space-y-6 shadow-xl">
                  <div className="border-b border-[#2A2A2A] pb-4">
                    <span className="text-[10px] font-mono font-bold text-blue-400 uppercase tracking-widest block mb-1">
                      PROJECT PROPOSAL BRIEF • CLIENT: {proposal.clientName}
                    </span>
                    <h3 className="text-xl font-extrabold text-white">
                      {proposal.title}
                    </h3>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider font-mono">
                      Executive Summary
                    </h4>
                    <textarea
                      value={proposal.executiveSummary}
                      onChange={(e) => setProposal({ ...proposal, executiveSummary: e.target.value })}
                      rows={4}
                      className="w-full p-3 bg-[#111] border border-[#333] rounded-xl text-xs text-gray-200 focus:outline-hidden focus:border-blue-500 resize-none leading-relaxed"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-red-400 uppercase tracking-wider font-mono">
                        Problem Statement
                      </h4>
                      <textarea
                        value={proposal.problemStatement}
                        onChange={(e) => setProposal({ ...proposal, problemStatement: e.target.value })}
                        rows={4}
                        className="w-full p-3 bg-[#111] border border-[#333] rounded-xl text-xs text-gray-200 focus:outline-hidden focus:border-blue-500 resize-none leading-relaxed"
                      />
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider font-mono">
                        Proposed Solution
                      </h4>
                      <textarea
                        value={proposal.proposedSolution}
                        onChange={(e) => setProposal({ ...proposal, proposedSolution: e.target.value })}
                        rows={4}
                        className="w-full p-3 bg-[#111] border border-[#333] rounded-xl text-xs text-gray-200 focus:outline-hidden focus:border-blue-500 resize-none leading-relaxed"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: Cover Page & Addressee Details */}
              {activeTab === 'cover' && (
                <div className="bg-[#181818] border border-[#2D2D2D] rounded-xl p-6 space-y-6 shadow-xl">
                  <div className="border-b border-[#2A2A2A] pb-3 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-blue-400 uppercase tracking-widest block mb-1">
                        COVER PAGE CONFIGURATION
                      </span>
                      <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                        <UserCheck className="w-5 h-5 text-blue-400" />
                        Names, Titles & Address of Addressees & Partner Companies
                      </h3>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Addressee Inputs */}
                    <div className="space-y-4 bg-[#121212] p-4 rounded-xl border border-[#2A2A2A]">
                      <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider font-mono flex items-center gap-2">
                        <Building className="w-4 h-4 text-blue-400" />
                        Target Recipient & Company Details
                      </h4>

                      <div>
                        <label className="text-xs text-gray-400 font-bold block mb-1">Recipient Person Name:</label>
                        <input
                          type="text"
                          value={proposal.recipientName || ''}
                          placeholder="e.g. Victoria Sterling"
                          onChange={(e) => setProposal({ ...proposal, recipientName: e.target.value })}
                          className="w-full p-2.5 bg-[#1A1A1A] border border-[#333] rounded-lg text-xs text-white"
                        />
                      </div>

                      <div>
                        <label className="text-xs text-gray-400 font-bold block mb-1">Recipient Official Title:</label>
                        <input
                          type="text"
                          value={proposal.recipientTitle || ''}
                          placeholder="e.g. Managing Director, Strategic Investments"
                          onChange={(e) => setProposal({ ...proposal, recipientTitle: e.target.value })}
                          className="w-full p-2.5 bg-[#1A1A1A] border border-[#333] rounded-lg text-xs text-white"
                        />
                      </div>

                      <div>
                        <label className="text-xs text-gray-400 font-bold block mb-1">Target Company / Organization Name:</label>
                        <input
                          type="text"
                          value={proposal.recipientCompany || ''}
                          placeholder="e.g. Apex Capital Partners LLC"
                          onChange={(e) => setProposal({ ...proposal, recipientCompany: e.target.value })}
                          className="w-full p-2.5 bg-[#1A1A1A] border border-[#333] rounded-lg text-xs text-white"
                        />
                      </div>

                      <div>
                        <label className="text-xs text-gray-400 font-bold block mb-1">Recipient Physical Address:</label>
                        <textarea
                          value={proposal.recipientAddress || ''}
                          rows={2}
                          placeholder="e.g. 550 Madison Avenue, Floor 32, New York, NY 10022"
                          onChange={(e) => setProposal({ ...proposal, recipientAddress: e.target.value })}
                          className="w-full p-2.5 bg-[#1A1A1A] border border-[#333] rounded-lg text-xs text-white resize-none"
                        />
                      </div>

                      <div>
                        <label className="text-xs text-gray-400 font-bold block mb-1">Recipient Direct Email:</label>
                        <input
                          type="email"
                          value={proposal.recipientEmail || ''}
                          placeholder="e.g. vsterling@apexcapital.com"
                          onChange={(e) => setProposal({ ...proposal, recipientEmail: e.target.value })}
                          className="w-full p-2.5 bg-[#1A1A1A] border border-[#333] rounded-lg text-xs text-white"
                        />
                      </div>
                    </div>

                    {/* Authoring & Proposal Cover Card Preview */}
                    <div className="bg-[#0A0A0A] p-6 rounded-xl border border-blue-500/30 flex flex-col justify-between shadow-2xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 bg-blue-600 text-black font-extrabold text-[9px] px-3 py-1 uppercase tracking-widest rounded-bl-lg font-mono">
                        Official Cover Page Preview
                      </div>

                      <div className="space-y-4">
                        <span className="text-xs font-mono text-blue-400 font-bold uppercase tracking-widest">
                          PROPOSAL FOR FINANCIAL PARTNERSHIP & BUILD
                        </span>
                        <h2 className="text-xl font-extrabold text-white leading-tight">
                          {proposal.title}
                        </h2>

                        <div className="pt-4 border-t border-[#222] space-y-2">
                          <span className="text-[10px] font-mono text-gray-500 uppercase block font-bold">PREPARED FOR:</span>
                          <div className="text-xs font-bold text-gray-200">{proposal.recipientName || proposal.clientName}</div>
                          <div className="text-xs text-blue-400">{proposal.recipientTitle || 'Managing Director'}</div>
                          <div className="text-xs font-semibold text-gray-300">{proposal.recipientCompany || proposal.clientName}</div>
                          <div className="text-[11px] text-gray-400">{proposal.recipientAddress || 'Corporate Headquarters'}</div>
                          {proposal.recipientEmail && <div className="text-[11px] text-gray-500 font-mono">{proposal.recipientEmail}</div>}
                        </div>

                        <div className="pt-4 border-t border-[#222] space-y-1">
                          <span className="text-[10px] font-mono text-gray-500 uppercase block font-bold">SUBMITTED BY:</span>
                          <div className="text-xs font-bold text-white">{proposal.authorName}</div>
                          <div className="text-[11px] text-gray-400">Date: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
                        </div>
                      </div>

                      <div className="mt-6 pt-3 border-t border-[#222] flex items-center justify-between text-[10px] font-mono text-gray-500">
                        <span>CONFIDENTIAL & PROPRIETARY</span>
                        <span>TARGET: ${proposal.targetBudget.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: Privacy & Confidentiality Notice Letter */}
              {activeTab === 'privacy' && (
                <div className="bg-[#181818] border border-[#2D2D2D] rounded-xl p-6 space-y-6 shadow-xl">
                  <div className="border-b border-[#2A2A2A] pb-3 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-purple-400 uppercase tracking-widest block mb-1">
                        PRIVACY & CONFIDENTIALITY LETTER
                      </span>
                      <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-purple-400" />
                        Document Non-Disclosure & Privacy Statement
                      </h3>
                    </div>

                    <label className="flex items-center gap-2 cursor-pointer bg-[#222] px-3 py-1.5 rounded-lg border border-[#333]">
                      <input
                        type="checkbox"
                        checked={proposal.privacyLetter?.enabled ?? true}
                        onChange={(e) => setProposal({
                          ...proposal,
                          privacyLetter: {
                            enabled: e.target.checked,
                            noticeTitle: proposal.privacyLetter?.noticeTitle || 'CONFIDENTIALITY & NON-DISCLOSURE AGREEMENT NOTICE',
                            effectiveDate: proposal.privacyLetter?.effectiveDate || new Date().toISOString().split('T')[0],
                            confidentialityContent: proposal.privacyLetter?.confidentialityContent || 'PRIVACY NOTICE: This proposal contains proprietary financial structures, trade secrets, architectural schematics, and confidential market valuation models. By reviewing this document, the recipient agrees to maintain strict confidentiality, refrain from unauthorized dissemination or copying, and use the contained intelligence solely for evaluating the proposed partnership.'
                          }
                        })}
                        className="rounded text-purple-500 focus:ring-purple-500"
                      />
                      <span className="text-xs font-bold text-gray-200">Include Privacy Notice Letter at Start of Proposal</span>
                    </label>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs text-gray-400 font-bold block mb-1">Notice Letter Heading:</label>
                        <input
                          type="text"
                          value={proposal.privacyLetter?.noticeTitle || 'CONFIDENTIALITY & NON-DISCLOSURE AGREEMENT NOTICE'}
                          onChange={(e) => setProposal({
                            ...proposal,
                            privacyLetter: {
                              ...(proposal.privacyLetter || { enabled: true, noticeTitle: '', effectiveDate: '', confidentialityContent: '' }),
                              noticeTitle: e.target.value
                            }
                          })}
                          className="w-full p-2.5 bg-[#111] border border-[#333] rounded-lg text-xs text-white"
                        />
                      </div>

                      <div>
                        <label className="text-xs text-gray-400 font-bold block mb-1">Effective Date:</label>
                        <input
                          type="date"
                          value={proposal.privacyLetter?.effectiveDate || new Date().toISOString().split('T')[0]}
                          onChange={(e) => setProposal({
                            ...proposal,
                            privacyLetter: {
                              ...(proposal.privacyLetter || { enabled: true, noticeTitle: '', effectiveDate: '', confidentialityContent: '' }),
                              effectiveDate: e.target.value
                            }
                          })}
                          className="w-full p-2.5 bg-[#111] border border-[#333] rounded-lg text-xs text-purple-300 font-mono"
                        />
                      </div>

                      <div>
                        <label className="text-xs text-gray-400 font-bold block mb-1">Confidentiality Statement & Legal Terms:</label>
                        <textarea
                          value={proposal.privacyLetter?.confidentialityContent || ''}
                          rows={6}
                          onChange={(e) => setProposal({
                            ...proposal,
                            privacyLetter: {
                              ...(proposal.privacyLetter || { enabled: true, noticeTitle: '', effectiveDate: '', confidentialityContent: '' }),
                              confidentialityContent: e.target.value
                            }
                          })}
                          className="w-full p-3 bg-[#111] border border-[#333] rounded-xl text-xs text-gray-200 resize-none leading-relaxed"
                        />
                      </div>
                    </div>

                    {/* Sealed Preview Badge */}
                    <div className="bg-[#120F1D] p-6 rounded-xl border border-purple-500/40 space-y-4 flex flex-col justify-between shadow-2xl">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-purple-400 font-mono text-xs font-bold uppercase tracking-wider">
                          <Lock className="w-4 h-4 text-purple-400" />
                          <span>DOCUMENT SECURITY SEAL</span>
                        </div>
                        <h4 className="text-sm font-extrabold text-white uppercase tracking-wider">
                          {proposal.privacyLetter?.noticeTitle || 'CONFIDENTIALITY & NON-DISCLOSURE AGREEMENT NOTICE'}
                        </h4>
                        <p className="text-xs text-gray-300 leading-relaxed italic border-l-2 border-purple-500 pl-3 py-1">
                          "{proposal.privacyLetter?.confidentialityContent}"
                        </p>
                      </div>

                      <div className="pt-4 border-t border-purple-900/50 flex items-center justify-between text-[11px] font-mono text-purple-300">
                        <span>Effective Date: {proposal.privacyLetter?.effectiveDate || '2026-03-01'}</span>
                        <span className="bg-purple-900/60 text-purple-200 px-2.5 py-0.5 rounded border border-purple-500/30 font-bold">SEALED LEGAL CLAUSE</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: Accomplishments Checklist */}
              {activeTab === 'checklist' && (
                <div className="bg-[#181818] border border-[#2D2D2D] rounded-xl p-6 space-y-6 shadow-xl">
                  <div className="border-b border-[#2A2A2A] pb-3 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-widest block mb-1">
                        VERIFIED ACCOMPLISHMENTS & TRACK RECORD
                      </span>
                      <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                        <CheckSquare className="w-5 h-5 text-emerald-400" />
                        Checklist of User & Consortium Accomplishments
                      </h3>
                    </div>

                    {/* Progress Bar */}
                    {proposal.accomplishments && proposal.accomplishments.length > 0 && (
                      <div className="text-right">
                        <span className="text-xs font-mono font-bold text-emerald-400">
                          {proposal.accomplishments.filter(a => a.isCompleted).length} / {proposal.accomplishments.length} Completed ({Math.round((proposal.accomplishments.filter(a => a.isCompleted).length / proposal.accomplishments.length) * 100)}%)
                        </span>
                        <div className="w-40 h-2 bg-[#222] rounded-full overflow-hidden border border-[#333] mt-1">
                          <div 
                            className="h-full bg-emerald-500 transition-all duration-300"
                            style={{ width: `${(proposal.accomplishments.filter(a => a.isCompleted).length / proposal.accomplishments.length) * 100}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Accomplishment List */}
                  <div className="space-y-3">
                    {proposal.accomplishments?.map((acc) => (
                      <div 
                        key={acc.id}
                        className={`p-4 rounded-xl border transition-all flex items-start justify-between gap-4 ${
                          acc.isCompleted 
                            ? 'bg-emerald-950/20 border-emerald-500/40 text-gray-200' 
                            : 'bg-[#121212] border-[#2A2A2A] text-gray-400'
                        }`}
                      >
                        <div className="flex items-start gap-3 flex-1">
                          <button
                            onClick={() => {
                              const updated = proposal.accomplishments?.map(a => a.id === acc.id ? { ...a, isCompleted: !a.isCompleted } : a);
                              setProposal({ ...proposal, accomplishments: updated });
                            }}
                            className={`p-1 rounded cursor-pointer transition-colors mt-0.5 ${
                              acc.isCompleted ? 'bg-emerald-500 text-black' : 'bg-[#222] border border-[#444] text-gray-500 hover:text-white'
                            }`}
                          >
                            <Check className="w-4 h-4 font-bold" />
                          </button>

                          <div className="space-y-1 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-extrabold text-white">{acc.title}</span>
                              <span className="text-[10px] bg-[#222] border border-[#333] text-emerald-300 px-2 py-0.5 rounded font-mono">
                                {acc.category}
                              </span>
                              {acc.completedDate && (
                                <span className="text-[10px] text-gray-500 font-mono">
                                  Completed: {acc.completedDate}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-400 leading-relaxed">{acc.description}</p>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            const updated = proposal.accomplishments?.filter(a => a.id !== acc.id);
                            setProposal({ ...proposal, accomplishments: updated });
                          }}
                          className="text-gray-500 hover:text-red-400 p-1.5 rounded hover:bg-red-950/40 transition-colors cursor-pointer"
                          title="Remove Accomplishment"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Add New Accomplishment Form */}
                  <div className="bg-[#121212] p-4 rounded-xl border border-[#2D2D2D] space-y-3">
                    <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider block">
                      + Add Achieved Milestone or Accomplishment to Document Checklist
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <input
                          type="text"
                          value={newAccTitle}
                          onChange={(e) => setNewAccTitle(e.target.value)}
                          placeholder="Accomplishment Title (e.g. Zoning Permits Approved)..."
                          className="w-full p-2.5 bg-[#1A1A1A] border border-[#333] rounded-lg text-xs text-white"
                        />
                      </div>

                      <div>
                        <input
                          type="text"
                          value={newAccCategory}
                          onChange={(e) => setNewAccCategory(e.target.value)}
                          placeholder="Category (e.g. Real Estate, Regulatory)..."
                          className="w-full p-2.5 bg-[#1A1A1A] border border-[#333] rounded-lg text-xs text-white"
                        />
                      </div>

                      <div>
                        <button
                          onClick={() => {
                            if (!newAccTitle.trim()) return;
                            const newItem = {
                              id: `acc-${Date.now()}`,
                              title: newAccTitle,
                              description: newAccDesc || 'Verified milestone accomplishment.',
                              category: newAccCategory || 'Key Accomplishment',
                              completedDate: new Date().toISOString().split('T')[0],
                              isCompleted: true
                            };
                            setProposal({
                              ...proposal,
                              accomplishments: [...(proposal.accomplishments || []), newItem]
                            });
                            setNewAccTitle('');
                            setNewAccDesc('');
                          }}
                          className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-black font-extrabold text-xs uppercase tracking-wider rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <Plus className="w-4 h-4" />
                          Add Accomplishment
                        </button>
                      </div>
                    </div>

                    <div>
                      <input
                        type="text"
                        value={newAccDesc}
                        onChange={(e) => setNewAccDesc(e.target.value)}
                        placeholder="Detailed accomplishment context / evidence description..."
                        className="w-full p-2.5 bg-[#1A1A1A] border border-[#333] rounded-lg text-xs text-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: Financial Models & Charts */}
              {activeTab === 'financials' && (
                <FinancialPlanner
                  proposal={proposal}
                  onUpdateProposal={setProposal}
                />
              )}

              {/* TAB 3: Milestone Tables & Risk Matrix */}
              {activeTab === 'tables' && (
                <ProposalTableEditor
                  proposal={proposal}
                  onUpdateProposal={setProposal}
                />
              )}

            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="border-t border-[#2A2A2A] px-6 py-3 bg-[#141414] flex items-center justify-between text-xs text-gray-400 shrink-0">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-3.5 h-3.5 text-blue-400" />
            <span>Project Proposal Studio Module • Independent Directory `/src/proposalStudio/`</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#2A2A2A] hover:bg-[#3A3A3A] text-white font-bold rounded-lg transition-colors cursor-pointer"
          >
            Close Studio
          </button>
        </div>

      </div>
    </div>
  );
};
