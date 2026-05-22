import { useState, useRef } from 'react';
import { Upload, Download, X, CheckCircle, AlertCircle } from 'lucide-react';

function parseCsv(text) {
  const lines = text.trim().split('\n');
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  return lines.slice(1).map(line => {
    const values = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      if (line[i] === '"') { inQuotes = !inQuotes; }
      else if (line[i] === ',' && !inQuotes) { values.push(current.trim()); current = ''; }
      else { current += line[i]; }
    }
    values.push(current.trim());
    const row = {};
    headers.forEach((h, i) => { row[h] = values[i] || ''; });
    return row;
  }).filter(row => Object.values(row).some(v => v !== ''));
}

function generateTemplate(columns) {
  const header = columns.map(c => c.label).join(',');
  const example = columns.map(c => c.example || '').join(',');
  return `${header}\n${example}`;
}

export default function CsvImportModal({ title, columns, onImport, onClose }) {
  const [rows, setRows] = useState(null);
  const [error, setError] = useState('');
  const [importing, setImporting] = useState(false);
  const [done, setDone] = useState(null);
  const fileRef = useRef();

  function downloadTemplate() {
    const csv = generateTemplate(columns);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.toLowerCase().replace(/\s+/g, '-')}-template.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    setError('');
    setRows(null);
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = parseCsv(ev.target.result);
        if (parsed.length === 0) { setError('No data rows found in CSV.'); return; }
        // Map column labels to keys
        const mapped = parsed.map(row => {
          const out = {};
          columns.forEach(col => {
            const val = row[col.label] ?? row[col.key] ?? '';
            out[col.key] = col.type === 'number' ? (parseFloat(val) || 0) : val;
          });
          return out;
        });
        setRows(mapped);
      } catch(e) {
        setError('Failed to parse CSV. Please check the format.');
      }
    };
    reader.readAsText(file);
  }

  async function handleImport() {
    if (!rows) return;
    setImporting(true);
    try {
      const result = await onImport(rows);
      setDone(result);
    } catch(e) {
      setError('Import failed: ' + (e.message || 'Unknown error'));
    } finally {
      setImporting(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-800">Import {title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>

        <div className="p-6 space-y-4">
          {done ? (
            <div className="text-center py-6">
              <CheckCircle className="mx-auto mb-3 text-green-500" size={40} />
              <p className="text-lg font-medium text-gray-800">{done.inserted} rows imported successfully</p>
              <button onClick={onClose} className="mt-4 btn-primary">Done</button>
            </div>
          ) : (
            <>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-700 mb-3">
                  Download the template CSV, fill in your data, then upload it here.
                </p>
                <button onClick={downloadTemplate} className="btn-secondary text-xs">
                  <Download size={14} /> Download Template
                </button>
              </div>

              <div
                className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center cursor-pointer hover:border-blue-300 transition-colors"
                onClick={() => fileRef.current?.click()}
              >
                <Upload className="mx-auto mb-2 text-gray-400" size={28} />
                <p className="text-sm text-gray-600">Click to select CSV file</p>
                <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleFile} />
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                  <AlertCircle size={16} /> {error}
                </div>
              )}

              {rows && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    {rows.length} row{rows.length !== 1 ? 's' : ''} ready to import
                  </p>
                  <div className="overflow-x-auto max-h-40 overflow-y-auto text-xs">
                    <table className="w-full">
                      <thead>
                        <tr>
                          {columns.slice(0, 4).map(c => (
                            <th key={c.key} className="text-left p-1 text-gray-500 font-medium">{c.label}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {rows.slice(0, 5).map((row, i) => (
                          <tr key={i}>
                            {columns.slice(0, 4).map(c => (
                              <td key={c.key} className="p-1 text-gray-700 truncate max-w-24">{row[c.key]}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {rows.length > 5 && <p className="text-gray-400 mt-1">...and {rows.length - 5} more</p>}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button onClick={onClose} className="btn-secondary">Cancel</button>
                <button
                  onClick={handleImport}
                  disabled={!rows || importing}
                  className="btn-primary disabled:opacity-50"
                >
                  {importing ? 'Importing...' : `Import ${rows ? rows.length + ' rows' : ''}`}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
