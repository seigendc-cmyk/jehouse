import React from 'react';
import { ChartData } from '../types';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface AcademicChartProps {
  data: ChartData;
  height?: number;
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

export const AcademicChart: React.FC<AcademicChartProps> = ({ data, height = 240 }) => {
  const chartDataPoints = data.items && data.items.length > 0 
    ? data.items.map(item => ({ name: item.label, value: item.value, fill: item.color }))
    : (data.labels || []).map((label, idx) => ({
        name: label,
        value: data.dataPoints?.[idx] ?? 0,
      }));

  if (chartDataPoints.length === 0) {
    return <div className="text-xs text-zinc-400 italic p-4 text-center border border-dashed rounded">No chart dataset configured</div>;
  }

  const chartColor = data.color || '#10b981';

  return (
    <div className="w-full flex flex-col items-center my-2 p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-sm">
      {data.title && (
        <h4 className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100 mb-1 text-center">
          {data.title}
        </h4>
      )}

      <div style={{ width: '100%', height: height }}>
        <ResponsiveContainer width="100%" height="100%">
          {data.type === 'bar' ? (
            <BarChart data={chartDataPoints} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} label={{ value: data.xAxisLabel || '', position: 'insideBottom', offset: -10 }} />
              <YAxis tick={{ fontSize: 11 }} label={{ value: data.yAxisLabel || '', angle: -90, position: 'insideLeft' }} />
              <Tooltip formatter={(val: number) => [val, 'Value']} />
              <Bar dataKey="value" fill={chartColor} radius={[4, 4, 0, 0]} />
            </BarChart>
          ) : data.type === 'line' || data.type === 'scatter' ? (
            <LineChart data={chartDataPoints} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} label={{ value: data.xAxisLabel || '', position: 'insideBottom', offset: -10 }} />
              <YAxis tick={{ fontSize: 11 }} label={{ value: data.yAxisLabel || '', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke={chartColor} strokeWidth={3} dot={{ r: 5, fill: chartColor }} />
            </LineChart>
          ) : (
            <PieChart>
              <Tooltip />
              <Pie
                data={chartDataPoints}
                cx="50%"
                cy="50%"
                outerRadius={75}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
              >
                {chartDataPoints.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          )}
        </ResponsiveContainer>
      </div>

      {(data.xAxisLabel || data.yAxisLabel) && (
        <div className="flex items-center justify-between w-full text-[11px] text-zinc-500 font-medium px-2 mt-1">
          {data.xAxisLabel && <span>X-Axis: {data.xAxisLabel}</span>}
          {data.yAxisLabel && <span>Y-Axis: {data.yAxisLabel}</span>}
        </div>
      )}
    </div>
  );
};
