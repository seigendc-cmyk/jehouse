import React, { useState } from 'react';
import { ProjectProposal, ProposalMilestone, RiskItem } from '../types';
import { 
  Table, 
  Calendar, 
  AlertTriangle, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  UserCheck 
} from 'lucide-react';

interface ProposalTableEditorProps {
  proposal: ProjectProposal;
  onUpdateProposal: (updated: ProjectProposal) => void;
}

export const ProposalTableEditor: React.FC<ProposalTableEditorProps> = ({
  proposal,
  onUpdateProposal
}) => {
  const currency = proposal.currency || '$';

  // New Milestone State
  const [newPhase, setNewPhase] = useState('');
  const [newTask, setNewTask] = useState('');
  const [newOwner, setNewOwner] = useState('');
  const [newCost, setNewCost] = useState(15000);

  // New Risk State
  const [newRiskName, setNewRiskName] = useState('');
  const [newMitigation, setNewMitigation] = useState('');

  const handleAddMilestone = () => {
    if (!newTask.trim()) return;

    const newM: ProposalMilestone = {
      id: `m-${Date.now()}`,
      phase: newPhase.trim() || 'Phase 1: Implementation',
      taskName: newTask.trim(),
      owner: newOwner.trim() || 'Project Manager',
      startMonth: 1,
      durationMonths: 2,
      estimatedCost: newCost,
      status: 'Planned'
    };

    onUpdateProposal({
      ...proposal,
      milestones: [...proposal.milestones, newM]
    });

    setNewTask('');
    setNewPhase('');
  };

  const handleDeleteMilestone = (id: string) => {
    onUpdateProposal({
      ...proposal,
      milestones: proposal.milestones.filter((m) => m.id !== id)
    });
  };

  const handleUpdateMilestoneStatus = (id: string, status: ProposalMilestone['status']) => {
    const updated = proposal.milestones.map((m) => {
      if (m.id === id) return { ...m, status };
      return m;
    });
    onUpdateProposal({ ...proposal, milestones: updated });
  };

  const handleAddRisk = () => {
    if (!newRiskName.trim()) return;

    const newR: RiskItem = {
      id: `r-${Date.now()}`,
      riskName: newRiskName.trim(),
      impact: 'Medium',
      probability: 'Low',
      mitigationStrategy: newMitigation.trim() || 'Regular compliance audits and daily backups.'
    };

    onUpdateProposal({
      ...proposal,
      risks: [...proposal.risks, newR]
    });

    setNewRiskName('');
    setNewMitigation('');
  };

  const handleDeleteRisk = (id: string) => {
    onUpdateProposal({
      ...proposal,
      risks: proposal.risks.filter((r) => r.id !== id)
    });
  };

  return (
    <div className="space-y-8 text-gray-100">
      
      {/* 1. Milestones & Deliverables Schedule Table */}
      <div className="bg-[#181818] border border-[#2D2D2D] rounded-xl p-5 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-[#2A2A2A] pb-3">
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-400" />
              Project Milestones & Deliverables Schedule
            </h3>
            <p className="text-xs text-gray-400">
              Structured timeline, resource assignments, and milestone cost tracking.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#222222] text-gray-300 font-mono border-b border-[#333]">
                <th className="p-2.5">Phase / Stage</th>
                <th className="p-2.5">Key Deliverable / Task</th>
                <th className="p-2.5">Assigned Owner</th>
                <th className="p-2.5 text-center">Timeline</th>
                <th className="p-2.5 text-right">Est. Cost</th>
                <th className="p-2.5 text-center">Status</th>
                <th className="p-2.5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#282828]">
              {proposal.milestones.map((m) => (
                <tr key={m.id} className="hover:bg-[#202020] transition-colors">
                  <td className="p-2.5 font-bold text-amber-400 font-mono">{m.phase}</td>
                  <td className="p-2.5 text-white">{m.taskName}</td>
                  <td className="p-2.5 text-gray-300 flex items-center gap-1">
                    <UserCheck className="w-3 h-3 text-blue-400 shrink-0" />
                    <span>{m.owner}</span>
                  </td>
                  <td className="p-2.5 text-center font-mono text-gray-400">
                    Month {m.startMonth} - {m.startMonth + m.durationMonths - 1}
                  </td>
                  <td className="p-2.5 text-right font-mono font-bold text-emerald-400">
                    {currency}{m.estimatedCost.toLocaleString()}
                  </td>
                  <td className="p-2.5 text-center">
                    <select
                      value={m.status}
                      onChange={(e) => handleUpdateMilestoneStatus(m.id, e.target.value as any)}
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold cursor-pointer focus:outline-hidden ${
                        m.status === 'Completed'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-600/40'
                          : m.status === 'In Progress'
                          ? 'bg-blue-950 text-blue-300 border border-blue-600/40'
                          : m.status === 'Critical'
                          ? 'bg-red-950 text-red-300 border border-red-600/40'
                          : 'bg-gray-800 text-gray-300 border border-gray-600/40'
                      }`}
                    >
                      <option value="Planned">Planned</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                      <option value="Critical">Critical</option>
                    </select>
                  </td>
                  <td className="p-2.5 text-center">
                    <button
                      onClick={() => handleDeleteMilestone(m.id)}
                      className="p-1 text-red-400 hover:text-red-300 rounded hover:bg-red-950/40 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Add Milestone Inline Form */}
        <div className="p-3 bg-[#121212] border border-[#2D2D2D] rounded-lg flex flex-wrap items-center gap-3">
          <input
            type="text"
            value={newPhase}
            onChange={(e) => setNewPhase(e.target.value)}
            placeholder="Phase (e.g. Phase 2)..."
            className="w-36 p-2 bg-[#222] border border-[#3A3A3A] text-xs text-white rounded focus:outline-hidden focus:border-amber-400"
          />
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="Deliverable Description..."
            className="flex-1 min-w-[180px] p-2 bg-[#222] border border-[#3A3A3A] text-xs text-white rounded focus:outline-hidden focus:border-amber-400"
          />
          <input
            type="text"
            value={newOwner}
            onChange={(e) => setNewOwner(e.target.value)}
            placeholder="Owner (e.g. Lead Dev)..."
            className="w-32 p-2 bg-[#222] border border-[#3A3A3A] text-xs text-white rounded focus:outline-hidden focus:border-amber-400"
          />
          <button
            onClick={handleAddMilestone}
            disabled={!newTask.trim()}
            className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-black font-bold text-xs rounded transition-colors cursor-pointer flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Milestone
          </button>
        </div>
      </div>

      {/* 2. Risk Matrix & Mitigation Table */}
      <div className="bg-[#181818] border border-[#2D2D2D] rounded-xl p-5 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-[#2A2A2A] pb-3">
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              Risk Analysis & Mitigation Matrix
            </h3>
            <p className="text-xs text-gray-400">
              Evaluate operational hazards, impact ratings, and risk mitigation strategies.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#222222] text-gray-300 font-mono border-b border-[#333]">
                <th className="p-2.5">Identified Risk</th>
                <th className="p-2.5 text-center">Impact</th>
                <th className="p-2.5 text-center">Probability</th>
                <th className="p-2.5">Mitigation & Action Strategy</th>
                <th className="p-2.5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#282828]">
              {proposal.risks.map((r) => (
                <tr key={r.id} className="hover:bg-[#202020] transition-colors">
                  <td className="p-2.5 font-bold text-white">{r.riskName}</td>
                  <td className="p-2.5 text-center">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      r.impact === 'High' ? 'bg-red-950 text-red-300 border border-red-700/50' : 'bg-yellow-950 text-yellow-300'
                    }`}>
                      {r.impact}
                    </span>
                  </td>
                  <td className="p-2.5 text-center">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-950 text-blue-300">
                      {r.probability}
                    </span>
                  </td>
                  <td className="p-2.5 text-gray-300">{r.mitigationStrategy}</td>
                  <td className="p-2.5 text-center">
                    <button
                      onClick={() => handleDeleteRisk(r.id)}
                      className="p-1 text-red-400 hover:text-red-300 rounded hover:bg-red-950/40 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Add Risk Inline Form */}
        <div className="p-3 bg-[#121212] border border-[#2D2D2D] rounded-lg flex flex-wrap items-center gap-3">
          <input
            type="text"
            value={newRiskName}
            onChange={(e) => setNewRiskName(e.target.value)}
            placeholder="Risk Description (e.g. Vendor Delays)..."
            className="w-48 p-2 bg-[#222] border border-[#3A3A3A] text-xs text-white rounded focus:outline-hidden focus:border-amber-400"
          />
          <input
            type="text"
            value={newMitigation}
            onChange={(e) => setNewMitigation(e.target.value)}
            placeholder="Mitigation Strategy..."
            className="flex-1 min-w-[200px] p-2 bg-[#222] border border-[#3A3A3A] text-xs text-white rounded focus:outline-hidden focus:border-amber-400"
          />
          <button
            onClick={handleAddRisk}
            disabled={!newRiskName.trim()}
            className="px-3.5 py-2 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-bold text-xs rounded transition-colors cursor-pointer flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Risk Factor
          </button>
        </div>
      </div>

    </div>
  );
};
