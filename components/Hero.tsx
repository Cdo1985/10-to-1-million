/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { motion } from 'motion/react';
import { Cpu, Zap, Wallet, BarChart3 } from 'lucide-react';

const Feature = ({ icon: Icon, title, desc }: { icon: any, title: string, desc: string }) => (
  <div className="flex flex-col items-center text-center gap-3">
    <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-2xl text-blue-400">
      <Icon size={24} />
    </div>
    <div>
      <h3 className="text-zinc-100 font-bold text-sm tracking-tight">{title}</h3>
      <p className="text-zinc-500 text-xs leading-relaxed max-w-[180px]">{desc}</p>
    </div>
  </div>
);

export const Hero: React.FC = () => {
  return (
    <div className="relative z-10 w-full flex flex-col items-center pt-12 pb-20">
      {/* Badge */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="mb-8 px-4 py-1.5 bg-blue-600/10 border border-blue-500/20 rounded-full flex items-center gap-2"
      >
        <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
        <span className="text-xs font-bold text-blue-400 tracking-wider uppercase">Live on Base Mainnet</span>
      </motion.div>

      {/* Main Title */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-center max-w-4xl px-4"
      >
        <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tighter text-white mb-8 leading-[0.9]">
          $10 <span className="text-zinc-700">TO</span> <br className="hidden sm:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-blue-400 to-emerald-400">$1,000,000</span>
        </h1>
        <p className="text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed mb-12">
          Deploy a personal AI agent with a $10 USDC starting stake. It grinds micro-tasks, optimizes yield, and executes strategies autonomously — fully on-chain.
        </p>
      </motion.div>

      {/* Stats/Features */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-16 w-full max-w-5xl"
      >
        <Feature 
          icon={Cpu} 
          title="Autonomous" 
          desc="AI agents find work independently 24/7."
        />
        <Feature 
          icon={Zap} 
          title="Zero Latency" 
          desc="Optimized execution on Base network."
        />
        <Feature 
          icon={Wallet} 
          title="USDC Yield" 
          desc="All earnings paid out in stablecoins."
        />
        <Feature 
          icon={BarChart3} 
          title="Verifiable" 
          desc="100% on-chain proof of work."
        />
      </motion.div>

      {/* Animated Elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 w-full max-w-5xl flex justify-between pointer-events-none opacity-20">
        <div className="w-[400px] h-[400px] bg-blue-600/30 blur-[120px] rounded-full" />
        <div className="w-[400px] h-[400px] bg-emerald-600/20 blur-[120px] rounded-full" />
      </div>
    </div>
  );
};
