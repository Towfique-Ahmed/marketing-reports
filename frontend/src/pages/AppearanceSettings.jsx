import { useState, useEffect } from 'react';
import { Save, Palette, Type, RefreshCw } from 'lucide-react';
import { getSettings, updateSettings } from '../api';

const FONTS = ['Inter', 'Roboto', 'Open Sans', 'Poppins', 'DM Sans'];

const PRESETS = [
  { name: 'Ocean Blue', primary_color: '#3B82F6', accent_color: '#8B5CF6', sidebar_bg: '#1e293b' },
  { name: 'Forest', primary_color: '#10B981', accent_color: '#059669', sidebar_bg: '#064E3B' },
  { name: 'Sunset', primary_color: '#F97316', accent_color: '#EF4444', sidebar_bg: '#1C1917' },
  { name: 'Purple Night', primary_color: '#8B5CF6', accent_color: '#EC4899', sidebar_bg: '#1E1B4B' },
  { name: 'Corporate', primary_color: '#0EA5E9', accent_color: '#6366F1', sidebar_bg: '#0F172A' },
];

const defaults = { primary_color: '#3B82F6', accent_color: '#8B5CF6', sidebar_bg: '#1e293b', font_family: 'Inter' };

function applySettings(s) {
  const root = document.documentElement;
  if (s.primary_color) root.style.setProperty('--color-primary', s.primary_color);
  if (s.accent_color) root.style.setProperty('--color-accent', s.accent_color);
  if (s.sidebar_bg) root.style.setProperty('--color-sidebar-bg', s.sidebar_bg);
  if (s.font_family) {
    root.style.setProperty('--font-family', `'${s.font_family}', system-ui, sans-serif`);
    document.body.style.fontFamily = `'${s.font_family}', system-ui, sans-serif`;
  }
}

export default function AppearanceSettings() {
  const [form, setForm] = useState(defaults);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getSettings().then(s => setForm({ ...defaults, ...s })).catch(() => {});
  }, []);

  const set = (k, v) => {
    const updated = { ...form, [k]: v };
    setForm(updated);
    applySettings(updated);
  };

  async function handleSave() {
    setSaving(true);
    await updateSettings(form);
    applySettings(form);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  function applyPreset(preset) {
    const updated = { ...form, ...preset };
    setForm(updated);
    applySettings(updated);
  }

  function resetDefaults() {
    setForm(defaults);
    applySettings(defaults);
  }

  return (
    <div className="p-6 max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Appearance</h1>
          <p className="text-sm text-gray-500 mt-0.5">Customize colors and fonts</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={resetDefaults} className="btn-secondary"><RefreshCw size={14} /> Reset</button>
          <button onClick={handleSave} disabled={saving} className="btn-primary disabled:opacity-50">
            <Save size={15} /> {saving ? 'Saving...' : saved ? '✓ Saved' : 'Save'}
          </button>
        </div>
      </div>

      {/* Color Presets */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
        <h2 className="font-semibold text-gray-700 mb-3 flex items-center gap-2"><Palette size={16} /> Quick Presets</h2>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map(p => (
            <button key={p.name} onClick={() => applyPreset(p)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 hover:border-gray-300 text-sm text-gray-700 transition-colors">
              <span className="w-4 h-4 rounded-full" style={{ backgroundColor: p.primary_color }}></span>
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* Color Controls */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
        <h2 className="font-semibold text-gray-700 mb-4 flex items-center gap-2"><Palette size={16} /> Colors</h2>
        <div className="space-y-4">
          {[
            { key: 'primary_color', label: 'Primary Color', desc: 'Buttons, links, active states' },
            { key: 'accent_color', label: 'Accent Color', desc: 'Secondary highlights and badges' },
            { key: 'sidebar_bg', label: 'Sidebar Background', desc: 'Navigation sidebar color' },
          ].map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-700">{label}</div>
                <div className="text-xs text-gray-400">{desc}</div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-400 font-mono">{form[key]}</span>
                <div className="relative">
                  <input
                    type="color"
                    value={form[key] || '#000000'}
                    onChange={e => set(key, e.target.value)}
                    className="w-10 h-10 rounded-lg cursor-pointer border border-gray-200 p-1"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Font Controls */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
        <h2 className="font-semibold text-gray-700 mb-4 flex items-center gap-2"><Type size={16} /> Font Family</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {FONTS.map(font => (
            <button
              key={font}
              onClick={() => set('font_family', font)}
              className={`py-3 px-4 rounded-lg border text-sm transition-all ${
                form.font_family === font
                  ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
              style={{ fontFamily: `'${font}', system-ui, sans-serif` }}
            >
              {font}
            </button>
          ))}
        </div>
      </div>

      {/* Live Preview */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="font-semibold text-gray-700 mb-4">Live Preview</h2>
        <div className="space-y-3" style={{ fontFamily: form.font_family ? `'${form.font_family}', system-ui, sans-serif` : undefined }}>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 rounded-lg text-white text-sm font-medium" style={{ backgroundColor: form.primary_color }}>
              Primary Button
            </button>
            <button className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-700">
              Secondary Button
            </button>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-xs font-medium text-white" style={{ backgroundColor: form.primary_color }}>Badge</span>
            <span className="px-2 py-0.5 rounded text-xs font-medium text-white" style={{ backgroundColor: form.accent_color }}>Accent</span>
            <span className="text-sm" style={{ color: form.primary_color }}>Link text</span>
          </div>
          <div className="p-3 rounded-lg border-l-4 text-sm text-gray-600" style={{ borderColor: form.primary_color, backgroundColor: form.primary_color + '10' }}>
            This is how info cards will look with your selected primary color.
          </div>
        </div>
      </div>
    </div>
  );
}
