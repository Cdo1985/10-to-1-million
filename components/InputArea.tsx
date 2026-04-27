/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Cpu, Rocket, ChevronRight, Loader2, Sparkles } from 'lucide-react';

interface InputAreaProps {
  onDeploy: () => void;
  isDeploying: boolean;
  disabled?: boolean;
}

export const InputArea: React.FC<InputAreaProps> = ({ onDeploy, isDeploying, disabled = false }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="relative group"
      >
        {/* Glow Effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-emerald-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
        
        <div className="relative bg-zinc-950 border border-zinc-800 rounded-2xl p-8 flex flex-col items-center">
          <div className="w-16 h-16 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-center text-blue-500 mb-6 group-hover:scale-110 transition-transform">
            {isDeploying ? <Loader2 className="animate-spin" size={32} /> : <Cpu size={32} />}
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-2 text-center">Ready to Grind?</h2>
          <p className="text-zinc-500 text-sm mb-8 text-center max-w-sm">
            Confirm deployment of your autonomous agent on Base. Initial stake: **0.10 USDC**.
          </p>
          
          <button
            onClick={onDeploy}
            disabled={disabled || isDeploying}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            className={`
              w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-3
              ${isDeploying ? 'bg-zinc-900 text-zinc-500' : 'bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-900/40'}
              disabled:opacity-50 disabled:cursor-not-allowed active:scale-95
            `}
          >
            {isDeploying ? (
              <>Spinning up Nodes...</>
            ) : (
              <>
                Deploy Earnings Agent
                <motion.div
                  animate={{ x: hovered ? 4 : 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <Rocket size={20} />
                </motion.div>
              </>
            )}
          </button>
          
          <div className="mt-6 flex items-center gap-6 text-[10px] font-mono text-zinc-600 uppercase tracking-widest">
            <span className="flex items-center gap-1.5"><Sparkles size={12} className="text-blue-500" /> AI Enhanced</span>
            <span className="flex items-center gap-1.5"><ChevronRight size={12} className="text-emerald-500" /> 100% On-Chain</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
