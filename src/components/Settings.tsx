import React from 'react';
import { AppState, BrandSettings } from '../types';
import {
  Palette,
  Calendar,
  Type,
  Image as ImageIcon,
  Save,
  RefreshCw,
  Download,
} from 'lucide-react';
import { motion } from 'motion/react';

interface SettingsProps {
  state: AppState;
  onUpdate: (newState: Partial<AppState>) => void;
  onResetTimeline?: () => void;
  onExportJson?: () => void;
}

export const Settings: React.FC<SettingsProps> = ({
  state,
  onUpdate,
  onResetTimeline,
  onExportJson,
}) => {
  const handleBrandUpdate = (updates: Partial<BrandSettings>) => {
    onUpdate({
      brandSettings: {
        ...state.brandSettings,
        ...updates,
      },
    });
  };

  const handlePaletteUpdate = (key: keyof BrandSettings['palette'], value: string) => {
    handleBrandUpdate({
      palette: {
        ...state.brandSettings.palette,
        [key]: value,
      },
    });
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif text-brand">Salon Settings</h1>
          <p className="text-stone-500">Manage your brand identity and project milestones</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* General Settings */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-2xl shadow-sm border border-brand/5 space-y-6"
        >
          <div className="flex items-center gap-2 text-brand font-medium">
            <Type className="w-5 h-5" />
            <h2>General Information</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Salon Name</label>
              <input 
                type="text"
                value={state.brandSettings.salonName}
                onChange={(e) => handleBrandUpdate({ salonName: e.target.value })}
                className="w-full px-4 py-2 rounded-xl border border-brand/10 focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all"
                placeholder="Enter salon name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Grand Opening Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input 
                  type="date"
                  value={state.openingDate}
                  onChange={(e) => onUpdate({ openingDate: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-brand/10 focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>
          </div>
        </motion.section>

        {/* Brand Identity */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-6 rounded-2xl shadow-sm border border-brand/5 space-y-6"
        >
          <div className="flex items-center gap-2 text-brand font-medium">
            <ImageIcon className="w-5 h-5" />
            <h2>Visual Identity</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Logo URL</label>
              <input 
                type="url"
                value={state.brandSettings.logoUrl || ''}
                onChange={(e) => handleBrandUpdate({ logoUrl: e.target.value })}
                className="w-full px-4 py-2 rounded-xl border border-brand/10 focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all"
                placeholder="https://example.com/logo.png"
              />
            </div>

            {state.brandSettings.logoUrl && (
              <div className="mt-2 p-4 bg-stone-50 rounded-xl flex justify-center">
                <img 
                  src={state.brandSettings.logoUrl} 
                  alt="Logo Preview" 
                  className="h-16 object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
            )}
          </div>
        </motion.section>

        {/* Color Palette */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-6 rounded-2xl shadow-sm border border-brand/5 md:col-span-2 space-y-6"
        >
          <div className="flex items-center gap-2 text-brand font-medium">
            <Palette className="w-5 h-5" />
            <h2>Color Palette</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-6">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">Primary</label>
              <div className="flex flex-col items-center gap-2">
                <input 
                  type="color"
                  value={state.brandSettings.palette.primary}
                  onChange={(e) => handlePaletteUpdate('primary', e.target.value)}
                  className="w-full h-12 rounded-lg cursor-pointer border-none"
                />
                <code className="text-[10px] font-mono bg-stone-100 px-2 py-1 rounded">{state.brandSettings.palette.primary}</code>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">Secondary</label>
              <div className="flex flex-col items-center gap-2">
                <input 
                  type="color"
                  value={state.brandSettings.palette.secondary}
                  onChange={(e) => handlePaletteUpdate('secondary', e.target.value)}
                  className="w-full h-12 rounded-lg cursor-pointer border-none"
                />
                <code className="text-[10px] font-mono bg-stone-100 px-2 py-1 rounded">{state.brandSettings.palette.secondary}</code>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">Accent</label>
              <div className="flex flex-col items-center gap-2">
                <input 
                  type="color"
                  value={state.brandSettings.palette.accent}
                  onChange={(e) => handlePaletteUpdate('accent', e.target.value)}
                  className="w-full h-12 rounded-lg cursor-pointer border-none"
                />
                <code className="text-[10px] font-mono bg-stone-100 px-2 py-1 rounded">{state.brandSettings.palette.accent}</code>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">Muted</label>
              <div className="flex flex-col items-center gap-2">
                <input 
                  type="color"
                  value={state.brandSettings.palette.muted}
                  onChange={(e) => handlePaletteUpdate('muted', e.target.value)}
                  className="w-full h-12 rounded-lg cursor-pointer border-none"
                />
                <code className="text-[10px] font-mono bg-stone-100 px-2 py-1 rounded">{state.brandSettings.palette.muted}</code>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">Paper</label>
              <div className="flex flex-col items-center gap-2">
                <input 
                  type="color"
                  value={state.brandSettings.palette.paper}
                  onChange={(e) => handlePaletteUpdate('paper', e.target.value)}
                  className="w-full h-12 rounded-lg cursor-pointer border-none"
                />
                <code className="text-[10px] font-mono bg-stone-100 px-2 py-1 rounded">{state.brandSettings.palette.paper}</code>
              </div>
            </div>
          </div>
        </motion.section>

        {(onResetTimeline || onExportJson) && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-white p-6 rounded-2xl shadow-sm border border-brand/5 md:col-span-2 space-y-4"
          >
            <div className="flex items-center gap-2 text-brand font-medium">
              <RefreshCw className="w-5 h-5" />
              <h2>Planner data</h2>
            </div>
            <p className="text-sm text-stone-500">
              Reset task due dates to the built-in template, or download a JSON backup of your
              planner.
            </p>
            <div className="flex flex-wrap gap-3">
              {onResetTimeline && (
                <button
                  type="button"
                  onClick={onResetTimeline}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-brand/20 text-brand text-sm font-medium hover:bg-brand/5 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Reset task dates to template
                </button>
              )}
              {onExportJson && (
                <button
                  type="button"
                  onClick={onExportJson}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand text-white text-sm font-medium hover:opacity-90 transition-opacity"
                >
                  <Download className="w-4 h-4" />
                  Export JSON backup
                </button>
              )}
            </div>
          </motion.section>
        )}
      </div>

      <div className="flex justify-end">
        <div className="flex items-center gap-2 text-stone-400 text-sm italic">
          <Save className="w-4 h-4" />
          <span>Changes are saved automatically to the cloud</span>
        </div>
      </div>
    </div>
  );
};
