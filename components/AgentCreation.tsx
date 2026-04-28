import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Zap, 
  Shield, 
  TrendingUp, 
  Target, 
  Cpu, 
  Dna, 
  Sparkles,
  ChevronRight,
  ArrowLeft
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AgentCreationProps {
  onBack: () => void;
  onConfirm: (config: any) => void;
}

export const AgentCreation: React.FC<AgentCreationProps> = ({ onBack, onConfirm }) => {
  const [config, setConfig] = useState({
    name: '',
    personality: 'efficient',
    riskTolerance: 40,
    primaryFocus: 'defi'
  });

  const personalities = [
    { id: 'efficient', label: 'Efficient', icon: Cpu, desc: 'Prioritizes low gas and high probability wins.' },
    { id: 'aggressive', label: 'Aggressive', icon: Zap, desc: 'Seeks alpha in volatile pools and new launches.' },
    { id: 'stealth', label: 'Stealth', icon: Shield, desc: 'Focuses on privacy-preserving ops and MEV protection.' },
  ];

  const focuses = [
    { id: 'defi', label: 'DeFi Mastery', icon: TrendingUp },
    { id: 'social', label: 'Social Mining', icon: Target },
    { id: 'mixed', label: 'Balanced Growth', icon: Dna },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-12">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors mb-8 group"
      >
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        <span className="text-xs font-bold uppercase tracking-widest font-mono">Abort Mission</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-8">
          <header>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-[10px] font-bold text-blue-400 uppercase mb-4">
              <Sparkles size={12} />
              Neuro-Link Established
            </div>
            <h1 className="text-4xl font-bold text-white tracking-tight">Design Your Agent</h1>
            <p className="text-zinc-500 mt-2">Configure the autonomous logic that will scale your 10 USDC stake.</p>
          </header>

          <div className="space-y-6">
            {/* Name Input */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Agent Designation</label>
              <input 
                type="text" 
                placeholder="e.g. ALPHA-QUANT-01"
                value={config.name}
                onChange={(e) => setConfig({ ...config, name: e.target.value.toUpperCase() })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder:text-zinc-700 focus:border-blue-500 outline-none transition-all font-mono"
              />
            </div>

            {/* Personality Cards */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Operating Personality</label>
              <div className="grid grid-cols-1 gap-3">
                {personalities.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setConfig({ ...config, personality: p.id })}
                    className={cn(
                      "flex items-center gap-4 p-4 rounded-xl border transition-all text-left group",
                      config.personality === p.id 
                        ? "bg-blue-600/10 border-blue-500/50 text-white" 
                        : "bg-zinc-950 border-zinc-800 text-zinc-500 hover:border-zinc-700"
                    )}
                  >
                    <div className={cn(
                      "p-2 rounded-lg shrink-0",
                      config.personality === p.id ? "bg-blue-500 text-white" : "bg-zinc-900 group-hover:bg-zinc-800"
                    )}>
                      <p.icon size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-sm">{p.label}</p>
                      <p className="text-[11px] text-zinc-500 leading-tight">{p.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8 lg:pt-20">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 space-y-8">
            {/* Focus Picker */}
            <div className="space-y-4">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Strategic Focus</label>
              <div className="flex gap-3">
                {focuses.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setConfig({ ...config, primaryFocus: f.id })}
                    className={cn(
                      "flex-1 flex flex-col items-center gap-2 p-3 rounded-xl border text-[10px] font-bold transition-all",
                      config.primaryFocus === f.id 
                        ? "bg-zinc-900 border-zinc-700 text-blue-400" 
                        : "border-transparent text-zinc-600 hover:text-zinc-500"
                    )}
                  >
                    <f.icon size={18} />
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Risk Slider */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Risk Sensitivity</label>
                <span className="text-[10px] font-mono text-blue-400 font-bold">{config.riskTolerance}%</span>
              </div>
              <input 
                type="range"
                min="0"
                max="100"
                value={config.riskTolerance}
                onChange={(e) => setConfig({ ...config, riskTolerance: parseInt(e.target.value) })}
                className="w-full h-1.5 bg-zinc-900 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <div className="flex justify-between text-[10px] font-mono text-zinc-600 uppercase">
                <span>Safe</span>
                <span>Balanced</span>
                <span>Hyper</span>
              </div>
            </div>

            <div className="pt-4">
              <button
                onClick={() => onConfirm(config)}
                disabled={!config.name}
                className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold flex items-center justify-center gap-2 group transition-all shadow-lg shadow-blue-500/20 active:scale-95"
              >
                Proceed to Deployment
                <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <p className="text-[10px] text-zinc-600 text-center mt-4 uppercase tracking-tighter">
                Final configuration will be etched into the Base mainnet contract.
              </p>
            </div>
          </div>

          <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold mb-1">
              <Shield size={14} />
              Self-Custody Guaranteed
            </div>
            <p className="text-zinc-500 text-[10px] leading-relaxed">
              Earnings are deposited directly to your connected wallet. This setup process generates a logic-shell that you own.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
