import React from 'react';
import { Table, Plus, Trash2, Grid, Calculator } from 'lucide-react';
import { SpreadsheetData } from '../../types';

interface SpreadsheetBlockProps {
  data?: SpreadsheetData;
  onChange: (updated: SpreadsheetData) => void;
}

export const SpreadsheetBlock: React.FC<SpreadsheetBlockProps> = ({ data, onChange }) => {
  // Default fallback spreadsheet state
  const spreadsheet = data || {
    title: 'Experimental Data Matrix',
    columns: ['A', 'B', 'C', 'D'],
    headers: ['Sample ID', 'Temperature (°C)', 'Pressure (kPa)', 'Yield (%)'],
    rows: [
      ['SMP-001', '25.4', '101.3', '94.2'],
      ['SMP-002', '30.1', '105.8', '96.8'],
      ['SMP-003', '35.0', '110.2', '98.1'],
      ['SMP-004', '40.2', '115.6', '92.4'],
    ],
  };

  const handleTitleChange = (title: string) => {
    onChange({ ...spreadsheet, title });
  };

  const handleHeaderChange = (colIndex: number, val: string) => {
    const newHeaders = [...(spreadsheet.headers || spreadsheet.columns)];
    newHeaders[colIndex] = val;
    onChange({ ...spreadsheet, headers: newHeaders });
  };

  const handleCellChange = (rowIndex: number, colIndex: number, val: string) => {
    const newRows = spreadsheet.rows.map((row, rIdx) => {
      if (rIdx !== rowIndex) return row;
      const copy = [...row];
      copy[colIndex] = val;
      return copy;
    });
    onChange({ ...spreadsheet, rows: newRows });
  };

  const addRow = () => {
    const emptyRow = new Array(spreadsheet.columns.length).fill('');
    onChange({ ...spreadsheet, rows: [...spreadsheet.rows, emptyRow] });
  };

  const removeRow = (rowIndex: number) => {
    if (spreadsheet.rows.length <= 1) return;
    const newRows = spreadsheet.rows.filter((_, idx) => idx !== rowIndex);
    onChange({ ...spreadsheet, rows: newRows });
  };

  const addColumn = () => {
    const nextChar = String.fromCharCode(65 + spreadsheet.columns.length);
    const newColumns = [...spreadsheet.columns, nextChar];
    const newHeaders = [...(spreadsheet.headers || []), `Col ${nextChar}`];
    const newRows = spreadsheet.rows.map((row) => [...row, '']);
    onChange({ ...spreadsheet, columns: newColumns, headers: newHeaders, rows: newRows });
  };

  const removeColumn = () => {
    if (spreadsheet.columns.length <= 1) return;
    const newColumns = spreadsheet.columns.slice(0, -1);
    const newHeaders = (spreadsheet.headers || []).slice(0, -1);
    const newRows = spreadsheet.rows.map((row) => row.slice(0, -1));
    onChange({ ...spreadsheet, columns: newColumns, headers: newHeaders, rows: newRows });
  };

  return (
    <div className="bg-white dark:bg-[#1E1E1E] border border-emerald-500/30 rounded-lg p-4 space-y-3 shadow-sm select-none">
      
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-emerald-500/20 pb-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-emerald-500/10 text-emerald-500 rounded font-bold">
            <Grid className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={spreadsheet.title || ''}
            onChange={(e) => handleTitleChange(e.target.value)}
            className="text-sm font-bold text-gray-900 dark:text-gray-100 bg-transparent border-none focus:outline-hidden"
            placeholder="Spreadsheet Title..."
          />
        </div>

        {/* Toolbar buttons */}
        <div className="flex items-center gap-1.5 text-xs">
          <button
            onClick={addRow}
            className="flex items-center gap-1 px-2 py-1 rounded bg-emerald-500/10 hover:bg-emerald-500 hover:text-black text-emerald-400 font-medium transition-colors border border-emerald-500/20"
            title="Add Row"
          >
            <Plus className="w-3 h-3" /> Row
          </button>
          <button
            onClick={addColumn}
            className="flex items-center gap-1 px-2 py-1 rounded bg-emerald-500/10 hover:bg-emerald-500 hover:text-black text-emerald-400 font-medium transition-colors border border-emerald-500/20"
            title="Add Column"
          >
            <Plus className="w-3 h-3" /> Col
          </button>
          {spreadsheet.columns.length > 1 && (
            <button
              onClick={removeColumn}
              className="px-2 py-1 rounded bg-zinc-800 hover:bg-rose-500 hover:text-white text-gray-400 transition-colors"
              title="Remove Column"
            >
              - Col
            </button>
          )}
        </div>
      </div>

      {/* Spreadsheet Grid Table */}
      <div className="overflow-x-auto border border-zinc-200 dark:border-zinc-800 rounded">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            {/* Column Alphabet Index Row */}
            <tr className="bg-zinc-100 dark:bg-[#121212] text-zinc-500 font-mono text-[10px]">
              <th className="w-8 p-1.5 text-center border-r border-b border-zinc-200 dark:border-zinc-800 font-normal">#</th>
              {spreadsheet.columns.map((col, cIdx) => (
                <th key={cIdx} className="p-1.5 text-center border-r border-b border-zinc-200 dark:border-zinc-800 font-bold uppercase">
                  {col}
                </th>
              ))}
              <th className="w-8 border-b border-zinc-200 dark:border-zinc-800"></th>
            </tr>
            {/* Header Titles Row */}
            <tr className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold">
              <td className="w-8 p-1 text-center border-r border-b border-zinc-200 dark:border-zinc-800">hdr</td>
              {spreadsheet.columns.map((_, cIdx) => (
                <td key={cIdx} className="p-1 border-r border-b border-zinc-200 dark:border-zinc-800">
                  <input
                    type="text"
                    value={spreadsheet.headers?.[cIdx] || ''}
                    onChange={(e) => handleHeaderChange(cIdx, e.target.value)}
                    className="w-full bg-transparent text-center font-bold text-xs focus:outline-hidden text-emerald-700 dark:text-emerald-300"
                    placeholder={`Header ${cIdx + 1}`}
                  />
                </td>
              ))}
              <td className="w-8 border-b border-zinc-200 dark:border-zinc-800"></td>
            </tr>
          </thead>

          <tbody>
            {spreadsheet.rows.map((row, rIdx) => (
              <tr key={rIdx} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors">
                <td className="w-8 p-1 text-center border-r border-b border-zinc-200 dark:border-zinc-800 font-mono text-[10px] text-zinc-400 bg-zinc-50 dark:bg-[#151515]">
                  {rIdx + 1}
                </td>
                {row.map((cellValue, cIdx) => (
                  <td key={cIdx} className="p-1 border-r border-b border-zinc-200 dark:border-zinc-800">
                    <input
                      type="text"
                      value={cellValue}
                      onChange={(e) => handleCellChange(rIdx, cIdx, e.target.value)}
                      className="w-full bg-transparent px-1.5 py-0.5 text-xs text-zinc-800 dark:text-zinc-200 focus:outline-hidden font-mono"
                      placeholder="-"
                    />
                  </td>
                ))}
                <td className="w-8 p-1 text-center border-b border-zinc-200 dark:border-zinc-800">
                  {spreadsheet.rows.length > 1 && (
                    <button
                      onClick={() => removeRow(rIdx)}
                      className="p-1 text-zinc-400 hover:text-rose-400 transition-colors"
                      title="Delete Row"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
};
