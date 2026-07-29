import React, { useState } from 'react';
import { BarChart as BarChartIcon, LineChart as LineChartIcon, PieChart as PieChartIcon, AreaChart as AreaChartIcon, Plus, Trash2, Sliders, EyeOff, LayoutTemplate } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { GraphBlockData, GraphDataPoint } from '../../types';

interface GraphBlockProps {
  data?: GraphBlockData;
  onChange: (updated: GraphBlockData) => void;
}

const PRESET_COLORS = ['#FF6B00', '#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EC4899'];

export const GraphBlock: React.FC<GraphBlockProps> = ({ data, onChange }) => {
  const graph: GraphBlockData = data || {
    chartType: 'bar',
    title: 'Figure 2.1: Performance Throughput vs Node Load',
    caption: 'Experimental benchmarks showing scaling characteristics across distributed cluster nodes.',
    color: '#FF6B00',
    legendStyle: 'default',
    data: [
      { label: '1 Node', value: 1200 },
      { label: '2 Nodes', value: 2450 },
      { label: '4 Nodes', value: 4800 },
      { label: '8 Nodes', value: 9200 },
      { label: '16 Nodes', value: 17400 },
    ],
  };

  const [showEditor, setShowEditor] = useState<boolean>(false);

  const legendStyle = graph.legendStyle || 'default';

  const updateType = (chartType: 'bar' | 'line' | 'area' | 'pie') => {
    onChange({ ...graph, chartType });
  };

  const updateTitle = (title: string) => {
    onChange({ ...graph, title });
  };

  const updateCaption = (caption: string) => {
    onChange({ ...graph, caption });
  };

  const updateColor = (color: string) => {
    onChange({ ...graph, color });
  };

  const updateLegendStyle = (style: 'default' | 'white' | 'hidden') => {
    onChange({ ...graph, legendStyle: style });
  };

  const updateDataPoint = (index: number, field: 'label' | 'value', val: string) => {
    const updatedData = graph.data.map((point, idx) => {
      if (idx !== index) return point;
      if (field === 'value') {
        return { ...point, value: parseFloat(val) || 0 };
      }
      return { ...point, label: val };
    });
    onChange({ ...graph, data: updatedData });
  };

  const addDataPoint = () => {
    const newPoint: GraphDataPoint = {
      label: `Item ${graph.data.length + 1}`,
      value: 1000,
    };
    onChange({ ...graph, data: [...graph.data, newPoint] });
  };

  const removeDataPoint = (index: number) => {
    if (graph.data.length <= 1) return;
    onChange({ ...graph, data: graph.data.filter((_, idx) => idx !== index) });
  };

  const renderChartLegend = () => {
    if (legendStyle === 'hidden') return null;

    const isWhite = legendStyle === 'white';

    return (
      <Legend
        wrapperStyle={
          isWhite
            ? {
                backgroundColor: '#ffffff',
                color: '#111827',
                padding: '4px 12px',
                borderRadius: '6px',
                border: '1px solid #d1d5db',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                fontSize: '11px',
                fontWeight: '600',
                display: 'inline-block',
                marginTop: '6px'
              }
            : {
                fontSize: '11px',
                paddingTop: '6px'
              }
        }
        formatter={(value) => (
          <span className={isWhite ? 'text-zinc-900 font-bold text-xs px-1' : 'text-zinc-700 dark:text-zinc-300 font-medium text-xs px-1'}>
            {value}
          </span>
        )}
      />
    );
  };

  return (
    <div className="bg-white dark:bg-[#1E1E1E] border border-orange-500/30 rounded-lg p-4 space-y-3 shadow-sm select-none">
      
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-orange-500/20 pb-2">
        <div className="flex items-center gap-2 flex-1 min-w-[180px]">
          <input
            type="text"
            value={graph.title || ''}
            onChange={(e) => updateTitle(e.target.value)}
            className="text-sm font-bold text-gray-900 dark:text-gray-100 bg-transparent border-none focus:outline-hidden flex-1"
            placeholder="Graph Title..."
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Legend Quick Controls */}
          <div className="flex items-center gap-1 bg-[#121212] p-1 rounded border border-[#333]">
            <span className="text-[10px] text-gray-400 font-bold px-1 uppercase tracking-wider hidden sm:inline">Legend:</span>
            <button
              type="button"
              onClick={() => updateLegendStyle('default')}
              className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors ${
                legendStyle === 'default' ? 'bg-[#FF6B00] text-black font-bold' : 'text-gray-400 hover:text-white'
              }`}
              title="Default Legend Style"
            >
              Default
            </button>
            <button
              type="button"
              onClick={() => updateLegendStyle('white')}
              className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors flex items-center gap-1 ${
                legendStyle === 'white' ? 'bg-white text-black font-bold' : 'text-gray-400 hover:text-white'
              }`}
              title="White Background Legend"
            >
              <span className="w-2 h-2 rounded-xs bg-white border border-black/40 inline-block" />
              White BG
            </button>
            <button
              type="button"
              onClick={() => updateLegendStyle('hidden')}
              className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors flex items-center gap-1 ${
                legendStyle === 'hidden' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 font-bold' : 'text-gray-400 hover:text-white'
              }`}
              title="Hide Legend from Graph"
            >
              <EyeOff className="w-3 h-3" />
              Hidden
            </button>
          </div>

          {/* Chart Type Selector */}
          <div className="flex items-center gap-1 bg-[#121212] p-1 rounded border border-[#333]">
            <button
              onClick={() => updateType('bar')}
              className={`p-1 rounded text-xs flex items-center gap-1 transition-colors ${graph.chartType === 'bar' ? 'bg-[#FF6B00] text-black font-bold' : 'text-gray-400 hover:text-white'}`}
              title="Bar Chart"
            >
              <BarChartIcon className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => updateType('line')}
              className={`p-1 rounded text-xs flex items-center gap-1 transition-colors ${graph.chartType === 'line' ? 'bg-[#FF6B00] text-black font-bold' : 'text-gray-400 hover:text-white'}`}
              title="Line Chart"
            >
              <LineChartIcon className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => updateType('area')}
              className={`p-1 rounded text-xs flex items-center gap-1 transition-colors ${graph.chartType === 'area' ? 'bg-[#FF6B00] text-black font-bold' : 'text-gray-400 hover:text-white'}`}
              title="Area Chart"
            >
              <AreaChartIcon className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => updateType('pie')}
              className={`p-1 rounded text-xs flex items-center gap-1 transition-colors ${graph.chartType === 'pie' ? 'bg-[#FF6B00] text-black font-bold' : 'text-gray-400 hover:text-white'}`}
              title="Pie Chart"
            >
              <PieChartIcon className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setShowEditor(!showEditor)}
              className={`p-1.5 rounded text-xs font-medium border ml-1 ${showEditor ? 'bg-[#333] border-[#FF6B00] text-[#FF6B00]' : 'border-[#444] text-gray-300'}`}
              title="Toggle Chart Data & Style Controls"
            >
              <Sliders className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Chart Visualization Area */}
      <div className="h-64 w-full bg-zinc-50 dark:bg-[#151515] p-3 rounded border border-zinc-200 dark:border-zinc-800">
        <ResponsiveContainer width="100%" height="100%">
          {graph.chartType === 'bar' ? (
            <BarChart data={graph.data}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="label" stroke="#888888" fontSize={11} />
              <YAxis stroke="#888888" fontSize={11} />
              <Tooltip contentStyle={{ backgroundColor: '#1E1E1E', borderColor: '#444', color: '#FFF' }} />
              {renderChartLegend()}
              <Bar dataKey="value" name={graph.title || "Value"} fill={graph.color || '#FF6B00'} radius={[4, 4, 0, 0]} />
            </BarChart>
          ) : graph.chartType === 'line' ? (
            <LineChart data={graph.data}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="label" stroke="#888888" fontSize={11} />
              <YAxis stroke="#888888" fontSize={11} />
              <Tooltip contentStyle={{ backgroundColor: '#1E1E1E', borderColor: '#444', color: '#FFF' }} />
              {renderChartLegend()}
              <Line type="monotone" dataKey="value" name={graph.title || "Value"} stroke={graph.color || '#FF6B00'} strokeWidth={3} dot={{ r: 5 }} />
            </LineChart>
          ) : graph.chartType === 'area' ? (
            <AreaChart data={graph.data}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="label" stroke="#888888" fontSize={11} />
              <YAxis stroke="#888888" fontSize={11} />
              <Tooltip contentStyle={{ backgroundColor: '#1E1E1E', borderColor: '#444', color: '#FFF' }} />
              {renderChartLegend()}
              <Area type="monotone" dataKey="value" name={graph.title || "Value"} stroke={graph.color || '#FF6B00'} fill={graph.color || '#FF6B00'} fillOpacity={0.2} />
            </AreaChart>
          ) : (
            <PieChart>
              <Tooltip contentStyle={{ backgroundColor: '#1E1E1E', borderColor: '#444', color: '#FFF' }} />
              {renderChartLegend()}
              <Pie data={graph.data} dataKey="value" nameKey="label" cx="50%" cy="50%" outerRadius={70} label>
                {graph.data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={PRESET_COLORS[index % PRESET_COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Interactive Data Points Table Editor */}
      {showEditor && (
        <div className="bg-[#121212] border border-[#333] rounded-lg p-3 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-bold text-[#FF6B00]">
            <span className="flex items-center gap-1.5"><LayoutTemplate className="w-3.5 h-3.5" /> Chart Data & Legend Controls</span>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-gray-400">Color:</span>
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => updateColor(c)}
                  className={`h-4 w-4 rounded-full transition-transform ${graph.color === c ? 'scale-125 ring-2 ring-white' : ''}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div className="space-y-1.5 max-h-48 overflow-y-auto">
            {graph.data.map((pt, pIdx) => (
              <div key={pIdx} className="flex items-center gap-2 text-xs">
                <input
                  type="text"
                  value={pt.label}
                  onChange={(e) => updateDataPoint(pIdx, 'label', e.target.value)}
                  className="bg-[#1E1E1E] border border-[#444] rounded px-2 py-1 text-gray-200 flex-1"
                  placeholder="Label..."
                />
                <input
                  type="number"
                  value={pt.value}
                  onChange={(e) => updateDataPoint(pIdx, 'value', e.target.value)}
                  className="bg-[#1E1E1E] border border-[#444] rounded px-2 py-1 text-gray-200 w-28 font-mono"
                  placeholder="Value..."
                />
                {graph.data.length > 1 && (
                  <button
                    onClick={() => removeDataPoint(pIdx)}
                    className="p-1 text-gray-400 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <button
            onClick={addDataPoint}
            className="flex items-center gap-1 text-xs px-2 py-1 bg-[#262626] hover:bg-[#333] text-[#FF6B00] rounded font-bold transition-colors"
          >
            <Plus className="w-3 h-3" /> Add Data Point
          </button>
        </div>
      )}

      {/* Caption Input */}
      <input
        type="text"
        value={graph.caption || ''}
        onChange={(e) => updateCaption(e.target.value)}
        className="w-full text-xs italic text-center text-gray-500 bg-transparent border-none focus:outline-hidden"
        placeholder="Enter figure caption (e.g., Figure 2.1: Performance benchmarks)..."
      />

    </div>
  );
};
