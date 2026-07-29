import React from 'react';
import { Table as TableIcon, Plus, Trash2 } from 'lucide-react';
import { TableBlockData } from '../../types';

interface TableBlockProps {
  data?: TableBlockData;
  onChange: (updated: TableBlockData) => void;
}

export const TableBlock: React.FC<TableBlockProps> = ({ data, onChange }) => {
  const tableData: TableBlockData = data || {
    title: 'Table 1.1: Physical Properties & Constants',
    headers: ['Property', 'Symbol', 'Value', 'Units'],
    rows: [
      ['Speed of Light', 'c', '2.9979 × 10⁸', 'm/s'],
      ['Planck Constant', 'h', '6.6260 × 10⁻³⁴', 'J·s'],
      ['Gravitational Constant', 'G', '6.6743 × 10⁻¹¹', 'm³/(kg·s²)'],
      ['Boltzmann Constant', 'k_B', '1.3806 × 10⁻²³', 'J/K'],
    ],
    striped: true,
  };

  const handleTitleChange = (title: string) => {
    onChange({ ...tableData, title });
  };

  const handleHeaderChange = (colIndex: number, val: string) => {
    const newHeaders = [...tableData.headers];
    newHeaders[colIndex] = val;
    onChange({ ...tableData, headers: newHeaders });
  };

  const handleCellChange = (rowIndex: number, colIndex: number, val: string) => {
    const newRows = tableData.rows.map((row, rIdx) => {
      if (rIdx !== rowIndex) return row;
      const copy = [...row];
      copy[colIndex] = val;
      return copy;
    });
    onChange({ ...tableData, rows: newRows });
  };

  const addRow = () => {
    const emptyRow = new Array(tableData.headers.length).fill('');
    onChange({ ...tableData, rows: [...tableData.rows, emptyRow] });
  };

  const removeRow = (rowIndex: number) => {
    if (tableData.rows.length <= 1) return;
    onChange({ ...tableData, rows: tableData.rows.filter((_, idx) => idx !== rowIndex) });
  };

  const addColumn = () => {
    const newHeaders = [...tableData.headers, `Col ${tableData.headers.length + 1}`];
    const newRows = tableData.rows.map((row) => [...row, '']);
    onChange({ ...tableData, headers: newHeaders, rows: newRows });
  };

  const removeColumn = () => {
    if (tableData.headers.length <= 1) return;
    const newHeaders = tableData.headers.slice(0, -1);
    const newRows = tableData.rows.map((row) => row.slice(0, -1));
    onChange({ ...tableData, headers: newHeaders, rows: newRows });
  };

  return (
    <div className="bg-white dark:bg-[#1E1E1E] border border-blue-500/30 rounded-lg p-4 space-y-3 shadow-sm select-none">
      
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-blue-500/20 pb-2">
        <div className="flex items-center gap-2 flex-1">
          <div className="p-1.5 bg-blue-500/10 text-blue-400 rounded font-bold">
            <TableIcon className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={tableData.title || ''}
            onChange={(e) => handleTitleChange(e.target.value)}
            className="text-sm font-bold text-gray-900 dark:text-gray-100 bg-transparent border-none focus:outline-hidden flex-1 font-serif"
            placeholder="Table Title..."
          />
        </div>

        <div className="flex items-center gap-1.5 text-xs">
          <button
            onClick={addRow}
            className="flex items-center gap-1 px-2 py-1 rounded bg-blue-500/10 hover:bg-blue-500 hover:text-white text-blue-400 font-medium transition-colors border border-blue-500/20"
          >
            <Plus className="w-3 h-3" /> Row
          </button>
          <button
            onClick={addColumn}
            className="flex items-center gap-1 px-2 py-1 rounded bg-blue-500/10 hover:bg-blue-500 hover:text-white text-blue-400 font-medium transition-colors border border-blue-500/20"
          >
            <Plus className="w-3 h-3" /> Col
          </button>
          {tableData.headers.length > 1 && (
            <button
              onClick={removeColumn}
              className="px-2 py-1 rounded bg-zinc-800 hover:bg-rose-500 hover:text-white text-gray-400 transition-colors"
            >
              - Col
            </button>
          )}
        </div>
      </div>

      {/* Table Element */}
      <div className="overflow-x-auto border border-zinc-200 dark:border-zinc-800 rounded">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-zinc-100 dark:bg-[#121212] text-zinc-800 dark:text-zinc-200 font-bold border-b border-zinc-200 dark:border-zinc-800">
              {tableData.headers.map((header, cIdx) => (
                <th key={cIdx} className="p-2 border-r border-zinc-200 dark:border-zinc-800">
                  <input
                    type="text"
                    value={header}
                    onChange={(e) => handleHeaderChange(cIdx, e.target.value)}
                    className="w-full bg-transparent font-bold text-xs focus:outline-hidden"
                    placeholder={`Header ${cIdx + 1}`}
                  />
                </th>
              ))}
              <th className="w-8"></th>
            </tr>
          </thead>
          <tbody>
            {tableData.rows.map((row, rIdx) => (
              <tr key={rIdx} className="border-b border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors">
                {row.map((cellValue, cIdx) => (
                  <td key={cIdx} className="p-2 border-r border-zinc-200 dark:border-zinc-800 font-serif">
                    <input
                      type="text"
                      value={cellValue}
                      onChange={(e) => handleCellChange(rIdx, cIdx, e.target.value)}
                      className="w-full bg-transparent text-xs text-zinc-800 dark:text-zinc-200 focus:outline-hidden"
                      placeholder="Cell value..."
                    />
                  </td>
                ))}
                <td className="w-8 p-1 text-center">
                  {tableData.rows.length > 1 && (
                    <button
                      onClick={() => removeRow(rIdx)}
                      className="p-1 text-zinc-400 hover:text-rose-400 transition-colors"
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
