import React from 'react';
import { TableData } from '../types';
import { Plus, Trash2, Table as TableIcon } from 'lucide-react';

interface AcademicTableProps {
  data?: TableData;
  editable?: boolean;
  onChange?: (updated: TableData) => void;
}

export const AcademicTable: React.FC<AcademicTableProps> = ({
  data,
  editable = false,
  onChange,
}) => {
  const table = data || {
    title: 'Observation Data Sheet',
    headers: ['Item / Date', 'Observation', 'Quantity', 'Notes'],
    rows: [
      ['Sample A', 'High soil moisture', '14.5 kg', 'Optimal yield'],
      ['Sample B', 'Moderate moisture', '11.2 kg', 'Standard crop'],
      ['Sample C', 'Low moisture', '8.0 kg', 'Requires mulch'],
    ],
    caption: 'Table 1.1: Academic Field Experiment Recording Log'
  };

  const handleHeaderChange = (index: number, val: string) => {
    if (!onChange) return;
    const newHeaders = [...table.headers];
    newHeaders[index] = val;
    onChange({ ...table, headers: newHeaders });
  };

  const handleCellChange = (rIdx: number, cIdx: number, val: string) => {
    if (!onChange) return;
    const newRows = table.rows.map((row, r) =>
      r === rIdx ? row.map((cell, c) => (c === cIdx ? val : cell)) : row
    );
    onChange({ ...table, rows: newRows });
  };

  const handleAddRow = () => {
    if (!onChange) return;
    const emptyRow = new Array(table.headers.length).fill('');
    onChange({ ...table, rows: [...table.rows, emptyRow] });
  };

  const handleRemoveRow = (rIdx: number) => {
    if (!onChange) return;
    onChange({ ...table, rows: table.rows.filter((_, idx) => idx !== rIdx) });
  };

  const handleAddColumn = () => {
    if (!onChange) return;
    const newHeaders = [...table.headers, `Col ${table.headers.length + 1}`];
    const newRows = table.rows.map((r) => [...r, '']);
    onChange({ ...table, headers: newHeaders, rows: newRows });
  };

  const handleRemoveColumn = (colIdx: number) => {
    if (!onChange || table.headers.length <= 1) return;
    const newHeaders = table.headers.filter((_, idx) => idx !== colIdx);
    const newRows = table.rows.map((r) => r.filter((_, idx) => idx !== colIdx));
    onChange({ ...table, headers: newHeaders, rows: newRows });
  };

  return (
    <div className="w-full my-3 space-y-2">
      <div className="flex items-center justify-between">
        {editable ? (
          <input
            type="text"
            value={table.title || ''}
            onChange={(e) => onChange && onChange({ ...table, title: e.target.value })}
            placeholder="Table Title (e.g., Pfumvudza Maize Harvest Data)"
            className="font-bold text-sm text-zinc-900 dark:text-zinc-100 bg-transparent border-b border-zinc-300 dark:border-zinc-700 pb-1 w-full max-w-md focus:outline-none focus:border-emerald-500"
          />
        ) : (
          table.title && (
            <h4 className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100 uppercase tracking-wide flex items-center gap-1.5">
              <TableIcon className="w-4 h-4 text-emerald-600" /> {table.title}
            </h4>
          )
        )}

        {editable && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleAddRow}
              className="flex items-center gap-1 px-2.5 py-1 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 rounded text-[11px] font-bold hover:bg-emerald-200 cursor-pointer"
            >
              <Plus className="w-3 h-3" /> Add Row
            </button>
            <button
              type="button"
              onClick={handleAddColumn}
              className="flex items-center gap-1 px-2.5 py-1 bg-indigo-100 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 rounded text-[11px] font-bold hover:bg-indigo-200 cursor-pointer"
            >
              <Plus className="w-3 h-3" /> Add Column
            </button>
          </div>
        )}
      </div>

      <div className="overflow-x-auto rounded-lg border border-zinc-300 dark:border-zinc-700 shadow-sm">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-zinc-100 dark:bg-zinc-800 border-b border-zinc-300 dark:border-zinc-700 font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">
              {table.headers.map((h, cIdx) => (
                <th key={cIdx} className="p-2.5 border-r border-zinc-300 dark:border-zinc-700 relative group min-w-[100px]">
                  {editable ? (
                    <div className="flex items-center justify-between gap-1">
                      <input
                        type="text"
                        value={h}
                        onChange={(e) => handleHeaderChange(cIdx, e.target.value)}
                        className="w-full bg-transparent font-bold text-xs focus:outline-none text-zinc-900 dark:text-zinc-100"
                      />
                      {table.headers.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveColumn(cIdx)}
                          className="opacity-0 group-hover:opacity-100 text-rose-500 hover:text-rose-700 p-0.5"
                          title="Delete Column"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ) : (
                    <span>{h}</span>
                  )}
                </th>
              ))}
              {editable && <th className="w-10 p-2 text-center bg-zinc-200 dark:bg-zinc-800"></th>}
            </tr>
          </thead>

          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 bg-white dark:bg-zinc-900">
            {table.rows.map((row, rIdx) => (
              <tr key={rIdx} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                {row.map((cell, cIdx) => (
                  <td key={cIdx} className="p-2 border-r border-zinc-200 dark:border-zinc-800">
                    {editable ? (
                      <input
                        type="text"
                        value={cell}
                        onChange={(e) => handleCellChange(rIdx, cIdx, e.target.value)}
                        placeholder="Cell value"
                        className="w-full p-1 bg-transparent text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:bg-emerald-50 dark:focus:bg-emerald-950/40 rounded"
                      />
                    ) : (
                      <span className="text-zinc-800 dark:text-zinc-200">{cell || '—'}</span>
                    )}
                  </td>
                ))}

                {editable && (
                  <td className="p-1 text-center">
                    <button
                      type="button"
                      onClick={() => handleRemoveRow(rIdx)}
                      className="p-1 text-zinc-400 hover:text-rose-500 rounded"
                      title="Delete Row"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editable ? (
        <input
          type="text"
          value={table.caption || ''}
          onChange={(e) => onChange && onChange({ ...table, caption: e.target.value })}
          placeholder="Caption / Footnote (e.g., Source: ZIMSEC Agriculture Field Guide)"
          className="text-[11px] text-zinc-500 italic bg-transparent border-b border-dashed border-zinc-300 dark:border-zinc-700 w-full focus:outline-none"
        />
      ) : (
        table.caption && <p className="text-[11px] text-zinc-500 italic text-center">{table.caption}</p>
      )}
    </div>
  );
};
