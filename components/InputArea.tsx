/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Cpu, Rocket, ChevronRight, Loader2, Sparkles, Wallet } from 'lucide-react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useBalance } from 'wagmi';
import { ConnectKitButton } from 'connectkit';
import { parseUnits } from 'viem';
import { USDC_ADDRESS, ERC20_ABI, base } from '../lib/web3';
import { cn } from '../lib/utils';

interface InputAreaProps {
  onDeploy: () => void;
  isDeploying: boolean;
  disabled?: boolean;
  agentConfig?: {
    name: string;
    personality: string;
    riskTolerance: number;
    primaryFocus: string;
  };
}

const TREASURY_ADDRESS = "0x8929A6b29d4791E60ec7737604FfFB07971d606C"; // Example treasury address

export const InputArea: React.FC<InputAreaProps> = ({ onDeploy, isDeploying, disabled = false, agentConfig }) => {
  const [hovered, setHovered] = useState(false);
  const { isConnected, address } = useAccount();
  const { writeContract, data: hash, error: writeError, isPending: isWaitngConfirm } = useWriteContract();
  
  const { isLoading: isWaitingTx, isSuccess: isTxSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  // Check USDC balance
  const { data: usdcBalance } = useBalance({
    address,
    token: USDC_ADDRESS,
  });

  const handlePaymentAndDeploy = async () => {
    if (!isConnected) return;
    
    try {
      // 0.10 USDC (6 decimals)
      const amount = parseUnits('0.10', 6);
      
      writeContract({
        address: USDC_ADDRESS,
        abi: ERC20_ABI,
        functionName: 'transfer',
        args: [TREASURY_ADDRESS, amount],
        account: address,
        chain: base,
      } as any); // Use any to bypass strict wagmi type check if it still complains about generic mismatch
    } catch (err) {
      console.error("Payment failed", err);
    }
  };

  useEffect(() => {
    if (isTxSuccess) {
      onDeploy();
    }
  }, [isTxSuccess, onDeploy]);

  const buttonLoading = isDeploying || isWaitngConfirm || isWaitingTx;

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
            {buttonLoading ? <Loader2 className="animate-spin" size={32} /> : <Cpu size={32} />}
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-2 text-center">
            {agentConfig ? `Deploying ${agentConfig.name}` : 'Ready to Grind?'}
          </h2>
          <p className="text-zinc-500 text-sm mb-8 text-center max-w-sm">
            {agentConfig 
              ? `Confirm deployment of your ${agentConfig.personality} agent focused on ${agentConfig.primaryFocus}.`
              : 'Confirm deployment of your autonomous agent on Base.'}
            {' '}Initial stake: **0.10 USDC**.
          </p>

          {!isConnected ? (
            <div className="w-full">
              <ConnectKitButton.Custom>
                {({ show }) => (
                  <button
                    onClick={show}
                    className="w-full py-4 rounded-xl font-bold text-lg bg-white text-zinc-950 hover:bg-zinc-200 transition-all flex items-center justify-center gap-3 shadow-lg active:scale-95"
                  >
                    <Wallet size={20} />
                    Connect Wallet to Start
                  </button>
                )}
              </ConnectKitButton.Custom>
            </div>
          ) : (
            <div className="w-full space-y-4">
              <button
                onClick={handlePaymentAndDeploy}
                disabled={disabled || buttonLoading}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
                className={`
                  w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-3
                  ${buttonLoading ? 'bg-zinc-900 text-zinc-500' : 'bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-900/40'}
                  disabled:opacity-50 disabled:cursor-not-allowed active:scale-95
                `}
              >
                {isWaitngConfirm ? (
                  <>Confirm in Wallet...</>
                ) : isWaitingTx ? (
                  <>Processing USDC...</>
                ) : isDeploying ? (
                  <>Spinning up Nodes...</>
                ) : (
                  <>
                    Pay 0.10 USDC & Deploy
                    <motion.div
                      animate={{ x: hovered ? 4 : 0 }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                      <Rocket size={20} />
                    </motion.div>
                  </>
                )}
              </button>
              
              {writeError && (
                <p className="text-rose-500 text-[10px] text-center font-mono uppercase bg-rose-500/5 py-2 rounded">
                  Transaction Failed: {writeError.message.substring(0, 50)}...
                </p>
              )}

              <div className="flex justify-between items-center px-2">
                <p className="text-[10px] font-mono text-zinc-500 uppercase">
                  Connected: <span className="text-zinc-300">{address?.substring(0, 6)}...{address?.substring(address.length - 4)}</span>
                </p>
                <p className="text-[10px] font-mono text-zinc-500 uppercase">
                  USDC Balance: <span className={cn("text-zinc-300", parseFloat(usdcBalance?.formatted || '0') < 0.1 ? 'text-rose-400' : '')}>
                    {parseFloat(usdcBalance?.formatted || '0').toFixed(2)}
                  </span>
                </p>
              </div>
            </div>
          )}
          
          <div className="mt-6 flex items-center gap-6 text-[10px] font-mono text-zinc-600 uppercase tracking-widest">
            <span className="flex items-center gap-1.5"><Sparkles size={12} className="text-blue-500" /> AI Enhanced</span>
            <span className="flex items-center gap-1.5"><ChevronRight size={12} className="text-emerald-500" /> Base Mainnet</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
