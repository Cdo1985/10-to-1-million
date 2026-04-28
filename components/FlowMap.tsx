import React from 'react';
import { motion } from 'motion/react';
import { 
  ArrowRight, 
  Settings, 
  Rocket, 
  LayoutDashboard, 
  Wallet, 
  Cpu, 
  Network, 
  Coins, 
  X,
  ChevronRight,
  Database,
  Lock,
  Zap,
  Activity
} from 'lucide-react';
import { cn } from '../lib/utils';

interface FlowNodeProps {
  icon: any;
  title: string;
  description: string;
  subItems?: string[];
  color: string;
}

const FlowNode = ({ icon: Icon, title, description, subItems, color }: FlowNodeProps) => (
  <div className="relative group">
    <div className={cn(
      "p-6 rounded-2xl border bg-zinc-900/50 backdrop-blur-xl border-zinc-800 transition-all duration-500",
      "group-hover:border-zinc-700 group-hover:bg-zinc-900 group-hover:translate-y-[-4px]",
      "shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)]"
    )}>
      <div className={cn(
        "w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110",
        color === 'blue' ? "bg-blue-500/20 text-blue-400" : 
        color === 'emerald' ? "bg-emerald-500/20 text-emerald-400" : 
        color === 'amber' ? "bg-amber-500/20 text-amber-400" : "bg-purple-500/20 text-purple-400"
      )}>
        <Icon size={24} />
      </div>
      <h3 className="text-white font-black tracking-tight mb-2 flex items-center gap-2">
        {title}
        <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-all translate-x-[-4px] group-hover:translate-x-0" />
      </h3>
      <p className="text-zinc-500 text-xs leading-relaxed mb-4">{description}</p>
      
      {subItems && (
        <div className="space-y-2 border-t border-zinc-800/50 pt-4">
          {subItems.map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-[10px] text-zinc-400 font-medium">
              <div className={cn(
                "w-1 h-1 rounded-full",
                color === 'blue' ? "bg-blue-500" : 
                color === 'emerald' ? "bg-emerald-500" : 
                color === 'amber' ? "bg-amber-500" : "bg-purple-500"
              )} />
              {item}
            </div>
          ))}
        </div>
      )}
    </div>
    
    {/* Connection Line */}
    <div className="absolute top-1/2 -right-4 w-4 h-px bg-zinc-800 hidden lg:block" />
  </div>
);

export const FlowMap: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-zinc-950 p-6 lg:p-12 relative overflow-hidden">
      {/* Background Decor */}
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-blue-500/5 blur-[120px] rounded-full -z-10" />
      <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-emerald-500/5 blur-[120px] rounded-full -z-10" />
      
      <div className="max-w-7xl mx-auto">
        <header className="flex items-center justify-between mb-16">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Network className="text-blue-500" size={20} />
              <h2 className="text-zinc-600 text-[10px] uppercase font-black tracking-[0.3em]">System Architecture</h2>
            </div>
            <h1 className="text-4xl lg:text-5xl font-black text-white tracking-tighter">
              Agent <span className="text-zinc-700">Lifecycle</span> Flow
            </h1>
          </div>
          <button 
            onClick={onBack}
            className="p-3 bg-zinc-900 border border-zinc-800 rounded-full text-zinc-400 hover:text-white hover:border-zinc-700 transition-all hover:rotate-90"
          >
            <X size={20} />
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {/* Main User Journey */}
          <FlowNode 
            icon={Rocket}
            title="Lander"
            description="Entry point of the ecosystem. Explains the $10 to $1M goal and system mechanics."
            color="blue"
            subItems={['Universal ID Sync', 'Strategy Overview', 'Risk Analysis']}
          />

          <FlowNode 
            icon={Lock}
            title="Identity Interop"
            description="Your wallet acts as a global key. The agent clones your profile across Base protocols."
            color="purple"
            subItems={['Base L2 Handshake', 'Cross-protocol Auth', 'Session Persistence']}
          />

          <FlowNode 
            icon={Wallet}
            title="On-chain Stake"
            description="Deployment handshake. Users authorize the initial liquidity pool via USDC or ETH."
            color="amber"
            subItems={['EIP-712 Signature', 'Liquidity Injection', 'Universal On-ramp']}
          />

          <FlowNode 
            icon={LayoutDashboard}
            title="Management"
            description="Real-time monitoring of automated tasks, yield generation, and buffer growth."
            color="emerald"
            subItems={['Live PNL Tracking', 'Yield Pool (Withdrawable)', 'Operational Buffer']}
          />
        </div>

        {/* Technical Sub-systems */}
        <div className="mt-24 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 p-8 rounded-3xl border border-zinc-800 bg-zinc-900/20">
            <h3 className="text-white text-xl font-black mb-6 flex items-center gap-3">
              <Cpu className="text-blue-500" size={20} />
              Execution Logic Path
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                { icon: Database, label: 'Scanning', desc: 'Queries Base L2 for yield opportunities.' },
                { icon: Lock, label: 'Universal Profiling', desc: 'Auto-syncs identity across Aave & Morpho.' },
                { icon: Zap, label: 'Executing', desc: 'Gas-optimized strategy deployment.' }
              ].map((item, i) => (
                <div key={i} className="space-y-2">
                  <div className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center text-blue-400">
                    <item.icon size={16} />
                  </div>
                  <p className="text-zinc-200 text-sm font-bold">{item.label}</p>
                  <p className="text-zinc-500 text-[10px] leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
            
            <div className="mt-8 pt-8 border-t border-zinc-800/50 flex flex-wrap gap-12">
              <div>
                <p className="text-[10px] text-emerald-500 font-black uppercase tracking-widest mb-2">Yield Stream</p>
                <p className="text-zinc-400 text-xs">Returns {'>'} 20 USDC → <span className="text-white">Yield Pool</span></p>
              </div>
              <div>
                <p className="text-[10px] text-blue-500 font-black uppercase tracking-widest mb-2">Gas Reservoir</p>
                <p className="text-zinc-400 text-xs">First 20 USDC → <span className="text-white">Active Buffer</span></p>
              </div>
              <div>
                <p className="text-[10px] text-amber-500 font-black uppercase tracking-widest mb-2">Goal Target</p>
                <p className="text-zinc-400 text-xs">$1M Met → <span className="text-white">Buffer Unlocked</span></p>
              </div>
            </div>
          </div>

          <div className="p-8 rounded-3xl border border-zinc-800 bg-gradient-to-br from-zinc-900/50 to-zinc-900/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Activity size={80} />
            </div>
            <h3 className="text-white text-xl font-black mb-4">Recursive Growth</h3>
            <p className="text-zinc-500 text-xs leading-relaxed mb-6">
              The agent uses a self-sustaining loop. By locking the first 20 USDC of profit into an operational buffer, it ensures that gas costs are never a bottleneck for future compounding cycles.
            </p>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-[10px] font-bold">
                <span className="text-zinc-400 uppercase tracking-widest">Protocol Efficiency</span>
                <span className="text-emerald-400">99.8%</span>
              </div>
              <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '99.8%' }}
                  className="h-full bg-emerald-500" 
                />
              </div>
            </div>
          </div>
        </div>

        <footer className="mt-16 text-center">
            <p className="text-zinc-700 text-[10px] uppercase font-bold tracking-[0.5em]">End-to-End Autonomous Workflow</p>
        </footer>
      </div>
    </div>
  );
};
