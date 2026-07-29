import React from 'react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  AreaChart, 
  Area 
} from 'recharts';
import { BudgetCategoryItem, ProjectProposal } from '../types';

interface BudgetPieChartProps {
  items: BudgetCategoryItem[];
  currency?: string;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444', '#EC4899'];

export const BudgetAllocationPieChart: React.FC<BudgetPieChartProps> = ({ items, currency = '$' }) => {
  // Group by category
  const categoryTotals: Record<string, number> = {};
  items.forEach((item) => {
    const total = item.q1Cost + item.q2Cost + item.q3Cost + item.q4Cost;
    categoryTotals[item.category] = (categoryTotals[item.category] || 0) + total;
  });

  const data = Object.keys(categoryTotals).map((cat) => ({
    name: cat,
    value: categoryTotals[cat]
  }));

  const grandTotal = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="bg-[#1A1A1A] border border-[#2D2D2D] rounded-xl p-4 shadow-xl space-y-3">
      <div className="flex items-center justify-between border-b border-[#2A2A2A] pb-2">
        <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
          Budget Allocation by Category
        </h4>
        <span className="text-xs font-mono font-bold text-emerald-400">
          Total: {currency}{grandTotal.toLocaleString()}
        </span>
      </div>

      <div className="w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={4}
              dataKey="value"
              label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
              labelLine={false}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(val: number) => [`${currency}${val.toLocaleString()}`, 'Amount']}
              contentStyle={{ backgroundColor: '#111', borderColor: '#444', borderRadius: '8px', color: '#fff' }}
            />
            <Legend wrapperStyle={{ fontSize: '11px', color: '#ccc' }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export const QuarterlyCashFlowBarChart: React.FC<{ items: BudgetCategoryItem[]; currency?: string }> = ({ items, currency = '$' }) => {
  const q1 = items.reduce((sum, i) => sum + i.q1Cost, 0);
  const q2 = items.reduce((sum, i) => sum + i.q2Cost, 0);
  const q3 = items.reduce((sum, i) => sum + i.q3Cost, 0);
  const q4 = items.reduce((sum, i) => sum + i.q4Cost, 0);

  const data = [
    { quarter: 'Q1 (Phase 1)', CapitalOutlay: q1 },
    { quarter: 'Q2 (Phase 2)', CapitalOutlay: q2 },
    { quarter: 'Q3 (Phase 3)', CapitalOutlay: q3 },
    { quarter: 'Q4 (Phase 4)', CapitalOutlay: q4 },
  ];

  return (
    <div className="bg-[#1A1A1A] border border-[#2D2D2D] rounded-xl p-4 shadow-xl space-y-3">
      <div className="flex items-center justify-between border-b border-[#2A2A2A] pb-2">
        <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
          Quarterly Capital Outlay & Schedule
        </h4>
        <span className="text-xs font-mono text-gray-400">Q1 - Q4 Expenditure</span>
      </div>

      <div className="w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#222" />
            <XAxis dataKey="quarter" stroke="#888" tick={{ fontSize: 11 }} />
            <YAxis stroke="#888" tick={{ fontSize: 11 }} tickFormatter={(v) => `${currency}${v / 1000}k`} />
            <Tooltip 
              formatter={(val: number) => [`${currency}${val.toLocaleString()}`, 'Outlay']}
              contentStyle={{ backgroundColor: '#111', borderColor: '#444', borderRadius: '8px', color: '#fff' }}
            />
            <Bar dataKey="CapitalOutlay" fill="#3B82F6" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export const RoiGrowthLineChart: React.FC<{ proposal: ProjectProposal }> = ({ proposal }) => {
  const currency = proposal.currency || '$';
  const totalCost = proposal.budgetItems.reduce((acc, item) => acc + item.q1Cost + item.q2Cost + item.q3Cost + item.q4Cost, 0);

  const data = [
    { year: 'Initial Investment', CumulativeCost: totalCost, RevenueYield: 0, NetProfit: -totalCost },
    { year: 'Year 1', CumulativeCost: totalCost, RevenueYield: proposal.expectedRevenueYear1, NetProfit: proposal.expectedRevenueYear1 - totalCost },
    { year: 'Year 2', CumulativeCost: totalCost, RevenueYield: proposal.expectedRevenueYear2, NetProfit: proposal.expectedRevenueYear2 - totalCost },
    { year: 'Year 3', CumulativeCost: totalCost, RevenueYield: proposal.expectedRevenueYear3, NetProfit: proposal.expectedRevenueYear3 - totalCost },
  ];

  return (
    <div className="bg-[#1A1A1A] border border-[#2D2D2D] rounded-xl p-4 shadow-xl space-y-3">
      <div className="flex items-center justify-between border-b border-[#2A2A2A] pb-2">
        <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
          3-Year ROI & Revenue Yield Projection
        </h4>
        <span className="text-xs font-mono text-emerald-400 font-bold">
          3-Yr ROI: {(((proposal.expectedRevenueYear3 - totalCost) / (totalCost || 1)) * 100).toFixed(0)}%
        </span>
      </div>

      <div className="w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#222" />
            <XAxis dataKey="year" stroke="#888" tick={{ fontSize: 11 }} />
            <YAxis stroke="#888" tick={{ fontSize: 11 }} tickFormatter={(v) => `${currency}${v / 1000}k`} />
            <Tooltip 
              formatter={(val: number) => [`${currency}${val.toLocaleString()}`, 'Value']}
              contentStyle={{ backgroundColor: '#111', borderColor: '#444', borderRadius: '8px', color: '#fff' }}
            />
            <Legend wrapperStyle={{ fontSize: '11px' }} />
            <Area type="monotone" dataKey="RevenueYield" stroke="#10B981" fill="#10B981" fillOpacity={0.25} name="Gross Revenue Yield" />
            <Area type="monotone" dataKey="NetProfit" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.15} name="Net Profit After Cost" />
            <Line type="monotone" dataKey="CumulativeCost" stroke="#EF4444" strokeWidth={2} strokeDasharray="5 5" name="Total Project Cost" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
