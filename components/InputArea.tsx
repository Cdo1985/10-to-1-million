/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Cpu, Rocket, ChevronRight, Loader2, Sparkles, Wallet, Coins } from 'lucide-react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useBalance, useSendTransaction } from 'wagmi';
import { ConnectKitButton } from 'connectkit';
import { parseUnits, parseEther } from 'viem';
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
    targetRoi: number;
    operatingPath: string;
    targetOutcomeTime: string;
  };
}

const TREASURY_ADDRESS = "0x8929A6b29d4791E60ec7737604FfFB07971d606C"; // Example treasury address

export const InputArea: React.FC<InputAreaProps> = ({ onDeploy, isDeploying, disabled = false, agentConfig }) => {
  const [hovered, setHovered] = useState(false);
  const [paymentAsset, setPaymentAsset] = useState<'USDC' | 'ETH'>('USDC');
  const [stakeAmount, setStakeAmount] = useState<10 | 100 | 1000>(10);
  const { isConnected, address } = useAccount();

  const STAKE_OPTIONS = [
    { value: 10, eth: '0.0033' },
    { value: 100, eth: '0.033' },
    { value: 1000, eth: '0.33' }
  ];

  const currentOption = STAKE_OPTIONS.find(o => o.value === stakeAmount)!;
  
  const { writeContract, data: usdcHash, error: usdcError, isPending: isUsdcWaitingConfirm } = useWriteContract();
  const { sendTransaction, data: ethHash, error: ethError, isPending: isEthWaitingConfirm } = useSendTransaction();
  
  const hash = paymentAsset === 'USDC' ? usdcHash : ethHash;
  const writeError = paymentAsset === 'USDC' ? usdcError : ethError;
  const isWaitingConfirm = paymentAsset === 'USDC' ? isUsdcWaitingConfirm : isEthWaitingConfirm;

  const { isLoading: isWaitingTx, isSuccess: isTxSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  // Check balances
  const { data: usdcBalance } = useBalance({
    address,
    token: USDC_ADDRESS,
  });

  const { data: ethBalance } = useBalance({
    address,
  });

  const handlePaymentAndDeploy = async () => {
    if (!isConnected) return;
    
    try {
      if (paymentAsset === 'USDC') {
        const amount = parseUnits(stakeAmount.toString(), 6);
        writeContract({
          address: USDC_ADDRESS,
          abi: ERC20_ABI,
          functionName: 'transfer',
          args: [TREASURY_ADDRESS, amount],
          account: address,
          chain: base,
        } as any);
      } else {
        sendTransaction({
          to: TREASURY_ADDRESS as `0x${string}`,
          value: parseEther(currentOption.eth),
        });
      }
    } catch (err) {
      console.error("Payment failed", err);
    }
  };

  useEffect(() => {
    if (isTxSuccess) {
      onDeploy();
    }
  }, [isTxSuccess, onDeploy]);

  const buttonLoading = isDeploying || isWaitingConfirm || isWaitingTx;

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
          {/* Stake Amount Selection */}
          <div className="w-full grid grid-cols-3 gap-2 mb-4">
            {STAKE_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => setStakeAmount(option.value as 10 | 100 | 1000)}
                className={cn(
                  "py-3 rounded-xl border flex flex-col items-center justify-center transition-all",
                  stakeAmount === option.value 
                    ? "bg-zinc-800 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.2)]" 
                    : "bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300"
                )}
              >
                <span className={cn(
                  "text-xs font-black",
                  stakeAmount === option.value ? "text-white" : "text-zinc-500"
                )}>${option.value}</span>
                <span className="text-[8px] opacity-50 uppercase mt-0.5 tracking-tighter">Stake</span>
              </button>
            ))}
          </div>

          {/* Payment Method Toggle */}
          <div className="w-full flex p-1 bg-zinc-900 border border-zinc-800 rounded-xl mb-6">
            <button
              onClick={() => setPaymentAsset('USDC')}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[10px] font-black uppercase transition-all",
                paymentAsset === 'USDC' ? "bg-blue-600 text-white shadow-lg" : "text-zinc-500 hover:text-zinc-300"
              )}
            >
              <Coins size={14} />
              USDC (${stakeAmount}.00)
            </button>
            <button
              onClick={() => setPaymentAsset('ETH')}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[10px] font-black uppercase transition-all",
                paymentAsset === 'ETH' ? "bg-zinc-100 text-zinc-950 shadow-lg" : "text-zinc-500 hover:text-zinc-300"
              )}
            >
              <span className="text-[14px]">Ξ</span>
              ETH (≈{currentOption.eth})
            </button>
          </div>

          <p className="text-zinc-500 text-sm mb-6 text-center max-w-sm">
            Review your agent strategy before initiating the on-chain stake. 
            <span className="block mt-1 text-[10px] text-zinc-600 italic">Profit is split: Yield Pool + 20 USDC Operational Buffer.</span>
          </p>

          {/* Strategy Summary Panel */}
          {agentConfig && (
            <div className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 mb-8 grid grid-cols-2 gap-y-4 gap-x-6">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Personality/Focus</p>
                <p className="text-xs text-white font-medium capitalize">{agentConfig.personality} / {agentConfig.primaryFocus}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Risk Sensitivity</p>
                <p className="text-xs text-white font-medium">{agentConfig.riskTolerance}%</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Target ROI</p>
                <p className="text-xs text-emerald-400 font-bold">{agentConfig.targetRoi}%</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Est. Duration</p>
                <p className="text-xs text-white font-medium">{agentConfig.targetOutcomeTime}</p>
              </div>
              <div className="col-span-2 space-y-1 pt-2 border-t border-zinc-800">
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Execution Path</p>
                <p className="text-xs text-blue-400 font-mono truncate">{agentConfig.operatingPath}</p>
              </div>
            </div>
          )}

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
                  ${buttonLoading ? 'bg-zinc-900 text-zinc-500' : paymentAsset === 'USDC' ? 'bg-blue-600 text-white hover:bg-blue-500' : 'bg-white text-zinc-950 hover:bg-zinc-200'}
                  disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 shadow-xl
                `}
              >
                {isWaitingConfirm ? (
                  <>Confirm in Wallet...</>
                ) : isWaitingTx ? (
                  <>Spinning up Nodes...</>
                ) : isDeploying ? (
                  <>Initializing Agent...</>
                ) : (
                  <>
                    Pay {paymentAsset === 'USDC' ? `${stakeAmount}.00 USDC` : `${currentOption.eth} ETH`} & Deploy
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
                  Balance: <span className={cn(
                    "text-zinc-300", 
                    paymentAsset === 'USDC' 
                      ? (parseFloat(usdcBalance?.formatted || '0') < stakeAmount ? 'text-rose-400' : '')
                      : (parseFloat(ethBalance?.formatted || '0') < parseFloat(currentOption.eth) ? 'text-rose-400' : '')
                  )}>
                    {paymentAsset === 'USDC' 
                      ? `${parseFloat(usdcBalance?.formatted || '0').toFixed(2)} USDC`
                      : `${parseFloat(ethBalance?.formatted || '0').toFixed(4)} ETH`
                    }
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
