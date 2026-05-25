import React from "react";

export default function PrintTable({ columns, rows }) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 print:rounded-none">
      <table className="w-full table-fixed border-collapse text-left text-xs sm:text-sm">
        <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500 print:bg-white">
          <tr>
            {columns.map((column) => (
              <th key={column.key} className="break-words border-b border-slate-200 px-2 py-2 font-black sm:px-3">
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((row, rowIndex) => (
            <tr key={row.id || row.name || rowIndex} className="align-top">
              {columns.map((column) => (
                <td key={column.key} className="break-words px-2 py-2 text-slate-700 sm:px-3">
                  {column.render ? column.render(row) : row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
