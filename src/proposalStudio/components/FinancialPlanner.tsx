import React, { useState } from 'react';
import { BudgetCategoryItem, ProjectProposal } from '../types';
import { 
  BudgetAllocationPieChart, 
  QuarterlyCashFlowBarChart, 
  RoiGrowthLineChart 
} from './ProposalCharts';
import { 
  Plus, 
  Trash2, 
  DollarSign, 
  PieChart as PieIcon, 
  BarChart3, 
  TrendingUp, 
  Calculator, 
  Edit3, 
  Check 
} from 'lucide-react';

interface FinancialPlannerProps {
  proposal: ProjectProposal;
  onUpdateProposal: (updated: ProjectProposal) => void;
}

/**
 * Lightweight MS Excel-style formula parser for financial spreadsheet cells.
 * Supports `=SUM(a, b, ...)`, `=AVERAGE(a, b, ...)`, `=MAX(...)`, `=MIN(...)`, and basic math (`+`, `-`, `*`, `/`).
 */
function evaluateExcelFormula(input: string | number): number {
  if (typeof input === 'number') return isNaN(input) ? 0 : input;
  if (!input) return 0;

  const raw = input.toString().trim();
  if (!raw) return 0;

  // If not starting with '=', treat as raw number
  if (!raw.startsWith('=')) {
    const num = parseFloat(raw);
    return isNaN(num) ? 0 : num;
  }

  // Strip initial '='
  let expr = raw.substring(1).trim().toUpperCase();

  try {
    // 1. Handle SUM(...)
    expr = expr.replace(/SUM\(([^)]+)\)/gi, (_, args) => {
      const nums = args.split(',').map((x: string) => parseFloat(x.trim()) || 0);
      return nums.reduce((a: number, b: number) => a + b, 0).toString();
    });

    // 2. Handle AVERAGE(...)
    expr = expr.replace(/AVERAGE\(([^)]+)\)/gi, (_, args) => {
      const nums = args.split(',').map((x: string) => parseFloat(x.trim()) || 0);
      return nums.length ? (nums.reduce((a: number, b: number) => a + b, 0) / nums.length).toString() : '0';
    });

    // 3. Handle MAX(...) and MIN(...)
    expr = expr.replace(/MAX\(([^)]+)\)/gi, (_, args) => {
      const nums = args.split(',').map((x: string) => parseFloat(x.trim()) || 0);
      return Math.max(...nums).toString();
    });
    expr = expr.replace(/MIN\(([^)]+)\)/gi, (_, args) => {
      const nums = args.split(',').map((x: string) => parseFloat(x.trim()) || 0);
      return Math.min(...nums).toString();
    });

    // 4. Safe arithmetic evaluation
    // Only allow digits, operators, whitespace, and decimals
    if (/^[0-9+\-*/.()\s]+$/.test(expr)) {
      // Safe Function constructor evaluation for arithmetic expressions
      const result = new Function(`"use strict"; return (${expr})`)();
      return typeof result === 'number' && !isNaN(result) ? result : 0;
    }
  } catch (e) {
    console.warn('Formula syntax error:', raw, e);
  }

  const fallback = parseFloat(raw.replace(/[^0-9.-]/g, ''));
  return isNaN(fallback) ? 0 : fallback;
}

/**
 * MS Excel-style cell input component supporting numbers & formula strings (e.g. `=SUM(1000,2000)`, `=15000*1.2`)
 */
const SpreadsheetCellInput: React.FC<{
  value: number;
  onCommit: (val: string | number) => void;
}> = ({ value, onCommit }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState<string>(value.toString());

  const handleBlur = () => {
    setIsEditing(false);
    onCommit(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setIsEditing(false);
      onCommit(text);
    }
  };

  return (
    <input
      type="text"
      value={isEditing ? text : value}
      onFocus={() => {
        setIsEditing(true);
        setText(value.toString());
      }}
      onChange={(e) => setText(e.target.value)}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      title="Supports numbers or MS Excel formulas starting with '=' (e.g. =SUM(1000, 2000), =15000*1.2)"
      placeholder="0 or =SUM(...)"
      className="w-24 text-right bg-[#111] border border-[#333] hover:border-emerald-500/50 focus:border-emerald-500 rounded px-2 py-1 text-xs text-emerald-400 font-mono transition-colors"
    />
  );
};

export const FinancialPlanner: React.FC<FinancialPlannerProps> = ({
  proposal,
  onUpdateProposal
}) => {
  const [activeChartTab, setActiveChartTab] = useState<'pie' | 'bar' | 'roi'>('pie');
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState<BudgetCategoryItem['category']>('Personnel');
  const [newItemQ1, setNewItemQ1] = useState<number>(10000);

  const currency = proposal.currency || '$';

  // Calculations
  const grandTotalCost = proposal.budgetItems.reduce(
    (acc, item) => acc + item.q1Cost + item.q2Cost + item.q3Cost + item.q4Cost,
    0
  );

  const q1Total = proposal.budgetItems.reduce((sum, item) => sum + item.q1Cost, 0);
  const q2Total = proposal.budgetItems.reduce((sum, item) => sum + item.q2Cost, 0);
  const q3Total = proposal.budgetItems.reduce((sum, item) => sum + item.q3Cost, 0);
  const q4Total = proposal.budgetItems.reduce((sum, item) => sum + item.q4Cost, 0);

  const handleUpdateItemCost = (
    id: string, 
    field: 'q1Cost' | 'q2Cost' | 'q3Cost' | 'q4Cost', 
    rawInput: string | number
  ) => {
    const evaluatedVal = evaluateExcelFormula(rawInput);
    const updatedItems = proposal.budgetItems.map((item) => {
      if (item.id === id) {
        return { ...item, [field]: Math.max(0, evaluatedVal) };
      }
      return item;
    });
    onUpdateProposal({ ...proposal, budgetItems: updatedItems });
  };

  const handleAddBudgetItem = () => {
    if (!newItemName.trim()) return;

    const newItem: BudgetCategoryItem = {
      id: `b-${Date.now()}`,
      name: newItemName.trim(),
      category: newItemCategory,
      q1Cost: newItemQ1,
      q2Cost: 0,
      q3Cost: 0,
      q4Cost: 0
    };

    onUpdateProposal({
      ...proposal,
      budgetItems: [...proposal.budgetItems, newItem]
    });

    setNewItemName('');
  };

  const handleDeleteItem = (id: string) => {
    onUpdateProposal({
      ...proposal,
      budgetItems: proposal.budgetItems.filter((i) => i.id !== id)
    });
  };

  return (
    <div className="space-y-6 text-gray-100">
      
      {/* Metrics Highlights Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-[#1C1C1C] border border-[#2D2D2D] rounded-xl p-3.5 space-y-1 shadow-lg">
          <span className="text-[10px] font-bold text-gray-400 uppercase font-mono tracking-wider">
            Total Proposal Budget
          </span>
          <p className="text-xl font-black text-emerald-400 font-mono">
            {currency}{grandTotalCost.toLocaleString()}
          </p>
        </div>

        <div className="bg-[#1C1C1C] border border-[#2D2D2D] rounded-xl p-3.5 space-y-1 shadow-lg">
          <span className="text-[10px] font-bold text-gray-400 uppercase font-mono tracking-wider">
            Year 1 Yield
          </span>
          <p className="text-xl font-black text-blue-400 font-mono">
            {currency}{(proposal.expectedRevenueYear1 || 0).toLocaleString()}
          </p>
        </div>

        <div className="bg-[#1C1C1C] border border-[#2D2D2D] rounded-xl p-3.5 space-y-1 shadow-lg">
          <span className="text-[10px] font-bold text-gray-400 uppercase font-mono tracking-wider">
            Net Projected Profit (Yr 3)
          </span>
          <p className="text-xl font-black text-amber-400 font-mono">
            {currency}{((proposal.expectedRevenueYear3 || 0) - grandTotalCost).toLocaleString()}
          </p>
        </div>

        <div className="bg-[#1C1C1C] border border-[#2D2D2D] rounded-xl p-3.5 space-y-1 shadow-lg">
          <span className="text-[10px] font-bold text-gray-400 uppercase font-mono tracking-wider">
            Est. ROI Yield
          </span>
          <p className="text-xl font-black text-purple-400 font-mono">
            {grandTotalCost > 0 
              ? `${((((proposal.expectedRevenueYear3 || 0) - grandTotalCost) / grandTotalCost) * 100).toFixed(0)}%`
              : 'N/A'
            }
          </p>
        </div>
      </div>

      {/* Visual Chart Switcher Tabs */}
      <div className="space-y-3">
        <div className="flex items-center justify-between border-b border-[#2D2D2D] pb-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 font-mono flex items-center gap-1.5">
            <Calculator className="w-4 h-4" />
            Financial Models & Interactive Graphs
          </h3>

          <div className="flex items-center gap-1.5 bg-[#141414] p-1 rounded-lg border border-[#2D2D2D]">
            <button
              onClick={() => setActiveChartTab('pie')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-bold transition-colors cursor-pointer ${
                activeChartTab === 'pie' ? 'bg-[#FF6B00] text-black' : 'text-gray-400 hover:text-white'
              }`}
            >
              <PieIcon className="w-3.5 h-3.5" />
              <span>Category Breakdown</span>
            </button>

            <button
              onClick={() => setActiveChartTab('bar')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-bold transition-colors cursor-pointer ${
                activeChartTab === 'bar' ? 'bg-[#FF6B00] text-black' : 'text-gray-400 hover:text-white'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Quarterly Outlay</span>
            </button>

            <button
              onClick={() => setActiveChartTab('roi')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-bold transition-colors cursor-pointer ${
                activeChartTab === 'roi' ? 'bg-[#FF6B00] text-black' : 'text-gray-400 hover:text-white'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>3-Year ROI Curve</span>
            </button>
          </div>
        </div>

        {/* Chart Render Container */}
        {activeChartTab === 'pie' && <BudgetAllocationPieChart items={proposal.budgetItems} currency={currency} />}
        {activeChartTab === 'bar' && <QuarterlyCashFlowBarChart items={proposal.budgetItems} currency={currency} />}
        {activeChartTab === 'roi' && <RoiGrowthLineChart proposal={proposal} />}
      </div>

      {/* Financial Table Editor */}
      <div className="bg-[#181818] border border-[#2D2D2D] rounded-xl p-4 space-y-4 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#2A2A2A] pb-3">
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
              <Calculator className="w-4 h-4 text-emerald-400" />
              Line-Item Budget Breakdown & Financial Spreadsheet
            </h4>
            <p className="text-[11px] text-gray-400 mt-0.5">
              Edit Q1-Q4 numeric values or type MS Excel formulas directly into table cells.
            </p>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-950/60 border border-emerald-500/40 rounded-lg text-[11px] font-mono text-emerald-300">
            <span>Formula Engine:</span>
            <code className="text-amber-300 bg-black/40 px-1.5 py-0.5 rounded">=SUM(10k, 5k)</code>
            <code className="text-amber-300 bg-black/40 px-1.5 py-0.5 rounded">=15k*1.2</code>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#222222] text-gray-300 font-mono border-b border-[#333]">
                <th className="p-2.5">Item & Description</th>
                <th className="p-2.5">Category</th>
                <th className="p-2.5 text-right">Q1 Cost ({currency})</th>
                <th className="p-2.5 text-right">Q2 Cost ({currency})</th>
                <th className="p-2.5 text-right">Q3 Cost ({currency})</th>
                <th className="p-2.5 text-right">Q4 Cost ({currency})</th>
                <th className="p-2.5 text-right font-bold text-amber-400">Line Total</th>
                <th className="p-2.5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#282828]">
              {proposal.budgetItems.map((item) => {
                const lineTotal = item.q1Cost + item.q2Cost + item.q3Cost + item.q4Cost;
                return (
                  <tr key={item.id} className="hover:bg-[#202020] transition-colors">
                    <td className="p-2.5 font-bold text-white">{item.name}</td>
                    <td className="p-2.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-950/80 text-blue-300 border border-blue-800/40">
                        {item.category}
                      </span>
                    </td>

                    {/* Q1-Q4 Editable Excel-Formula Supported Cell Inputs */}
                    <td className="p-2.5 text-right">
                      <SpreadsheetCellInput
                        value={item.q1Cost}
                        onCommit={(val) => handleUpdateItemCost(item.id, 'q1Cost', val)}
                      />
                    </td>
                    <td className="p-2.5 text-right">
                      <SpreadsheetCellInput
                        value={item.q2Cost}
                        onCommit={(val) => handleUpdateItemCost(item.id, 'q2Cost', val)}
                      />
                    </td>
                    <td className="p-2.5 text-right">
                      <SpreadsheetCellInput
                        value={item.q3Cost}
                        onCommit={(val) => handleUpdateItemCost(item.id, 'q3Cost', val)}
                      />
                    </td>
                    <td className="p-2.5 text-right">
                      <SpreadsheetCellInput
                        value={item.q4Cost}
                        onCommit={(val) => handleUpdateItemCost(item.id, 'q4Cost', val)}
                      />
                    </td>

                    <td className="p-2.5 text-right font-mono font-bold text-amber-400">
                      {currency}{lineTotal.toLocaleString()}
                    </td>

                    <td className="p-2.5 text-center">
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="p-1 text-red-400 hover:text-red-300 hover:bg-red-950/40 rounded transition-colors cursor-pointer"
                        title="Delete line item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}

              {/* Total Summary Row */}
              <tr className="bg-[#242424] font-bold text-white font-mono border-t-2 border-[#444]">
                <td className="p-2.5 uppercase">Quarterly Outlay Totals</td>
                <td className="p-2.5">--</td>
                <td className="p-2.5 text-right text-emerald-300">{currency}{q1Total.toLocaleString()}</td>
                <td className="p-2.5 text-right text-emerald-300">{currency}{q2Total.toLocaleString()}</td>
                <td className="p-2.5 text-right text-emerald-300">{currency}{q3Total.toLocaleString()}</td>
                <td className="p-2.5 text-right text-emerald-300">{currency}{q4Total.toLocaleString()}</td>
                <td className="p-2.5 text-right text-amber-300 text-sm">{currency}{grandTotalCost.toLocaleString()}</td>
                <td className="p-2.5"></td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Add Budget Line Item Box */}
        <div className="p-3 bg-[#121212] border border-[#2D2D2D] rounded-lg flex flex-wrap items-center gap-3">
          <input
            type="text"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            placeholder="New Budget Item (e.g. Cloud Server Hosting)..."
            className="flex-1 min-w-[180px] p-2 bg-[#222] border border-[#3A3A3A] text-xs text-white rounded focus:outline-hidden focus:border-amber-400"
          />

          <select
            value={newItemCategory}
            onChange={(e) => setNewItemCategory(e.target.value as any)}
            className="p-2 bg-[#222] border border-[#3A3A3A] text-xs text-gray-200 rounded focus:outline-hidden focus:border-amber-400 cursor-pointer"
          >
            <option value="Personnel">Personnel</option>
            <option value="Technology & Tools">Technology & Tools</option>
            <option value="Marketing & Sales">Marketing & Sales</option>
            <option value="Operations & Overhead">Operations & Overhead</option>
            <option value="Contingency">Contingency</option>
          </select>

          <input
            type="number"
            value={newItemQ1}
            onChange={(e) => setNewItemQ1(Number(e.target.value))}
            placeholder="Q1 Initial Budget"
            className="w-28 p-2 bg-[#222] border border-[#3A3A3A] text-xs text-emerald-400 font-mono rounded focus:outline-hidden focus:border-amber-400"
          />

          <button
            onClick={handleAddBudgetItem}
            disabled={!newItemName.trim()}
            className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-black font-bold text-xs rounded transition-colors cursor-pointer flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Line Item
          </button>
        </div>
      </div>

    </div>
  );
};
