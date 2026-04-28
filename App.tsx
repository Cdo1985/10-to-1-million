/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect } from 'react';
import { Hero } from './components/Hero';
import { InputArea } from './components/InputArea';
import { Dashboard } from './components/Dashboard';
import { AgentCreation } from './components/AgentCreation';
import { FlowMap } from './components/FlowMap';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, HelpCircle, ArrowUpRight, Network } from 'lucide-react';
import { cn } from './lib/utils';

export type AppFlow = 'LANDING' | 'CREATING' | 'PAYING' | 'ACTIVE' | 'FLOWMAP';

const LandingFAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const faqs = [
    {
      q: "Do I need to pay for gas or does USDC cover it?",
      a: (
        <span>
          Initially, you need &lt;$0.05 of native ETH for the handshake. After deployment, the agent uses its earnings Buffer (20 USDC) to automate all recurring operation costs. 
          <a href="https://docs.base.org/fees" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline ml-1 inline-flex items-center gap-0.5">
            Verify Base Fees <ArrowUpRight size={10} />
          </a>
        </span>
      )
    },
    {
      q: "How do earnings get split?",
      a: "The agent fills a 20 USDC 'Safety Buffer' from its first micro-job payouts. Once the buffer is full, 100% of additional profit flows into your Withdrawable Yield Pool."
    },
    {
      q: "Do I need to sign up for other protocols?",
      a: "No. Your Base-native wallet acts as a Universal ID. The agent uses your pre-authorized session and secure signatures to initialize accounts and execute strategies across Aave, Morpho, and Aerodrome autonomously."
    },
    {
      q: "How long does it take to reach $1,000,000?",
      a: (
        <div className="space-y-3">
          <p>Growth is recursive and performance-based. By compounding 100% of yield back into the operating buffer, the agent optimizes for exponential scaling.</p>
          <div className="bg-zinc-900/50 rounded-lg p-3 border border-zinc-900">
            <div className="grid grid-cols-3 text-[10px] uppercase tracking-widest text-zinc-600 font-bold mb-2 pb-2 border-b border-zinc-800">
              <span>Tier Stake</span>
              <span>Est. Time</span>
              <span>Multiplier</span>
            </div>
            {[
              { s: '$10 USDC', t: '~48 Months', e: '12x' },
              { s: '$100 USDC', t: '~32 Months', e: '24x' },
              { s: '$1000 USDC', t: '~18 Months', e: '40x' }
            ].map((row, i) => (
              <div key={i} className="grid grid-cols-3 py-1.5 text-zinc-400 font-medium">
                <span className="text-zinc-200">{row.s}</span>
                <span>{row.t}</span>
                <span className="text-blue-400 font-black">{row.e} Compounding</span>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-zinc-600 italic leading-relaxed">Trajectories are based on autonomous compounding cycles and market volatility. Each tier utilizes its respected pay grade for efficiency.</p>
        </div>
      )
    },
    {
      q: "Where does the AI get the micro jobs from?",
      a: (
        <span>
          The agent sources tasks from the Base L2 ecosystem: DeFi Liquidity, Social Mining (Farcaster), and Yield Harvesting. 
          <a href="https://www.base.org/ecosystem" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline ml-1 inline-flex items-center gap-0.5">
            Explore Ecosystem <ArrowUpRight size={10} />
          </a>
        </span>
      )
    },
    {
      q: "What are the estimated platform/dev profits?",
      a: (
        <div className="space-y-3">
          <p>The protocol is sustained by a flat 5% infrastructure fee on all successful payouts. Since every agent targets a $1,000,000 milestone, the projected dev profit per successful agent is:</p>
          <div className="bg-zinc-900/50 rounded-lg p-3 border border-zinc-900">
            {[
              { t: "$10 Stake", p: "$50,000", note: "Long-tail revenue" },
              { t: "$100 Stake", p: "$50,000", note: "Medium-term growth" },
              { t: "$1000 Stake", p: "$50,000", note: "High-velocity yield" }
            ].map((row, i) => (
              <div key={i} className="flex justify-between py-1.5 text-zinc-400 font-medium border-b border-zinc-800 last:border-0">
                <span className="text-zinc-200">{row.t}</span>
                <span className="text-emerald-400 font-black">{row.p} Fee</span>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-zinc-600 italic leading-relaxed">Fees are automatically deducted during the final payout phase. This covers the continuous gas cost for micro-tasks and cross-protocol rebalancing over the agent's lifespan.</p>
        </div>
      )
    },
    {
      q: "What fees are generated and sent to my wallet?",
      a: "The agent generates revenue through micro-job fees and yield. Upon completion, the total accumulated profit (minus a 5% platform maintenance fee) is sent to your wallet. This includes the unlocked 20 USDC Operational Buffer."
    },
    {
      q: "What is the minimum USDC needed to start?",
      a: "The minimum stake is 10 USDC. This is your seed capital. Because Base is highly efficient, even this small amount can start productive compounding cycles immediately."
    }
  ];

  const [showFaqs, setShowFaqs] = useState(false);

  return (
    <div className="w-full max-w-2xl mx-auto space-y-3 mt-12 mb-8">
      <div className="flex flex-col items-center gap-6">
        <button 
          onClick={() => setShowFaqs(!showFaqs)}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 transition-all text-[10px] uppercase font-bold tracking-[0.2em] group"
        >
          <HelpCircle size={14} className={cn("transition-colors", showFaqs ? "text-blue-400" : "text-zinc-500 group-hover:text-blue-400")} />
          {showFaqs ? "Hide FAQ Guide" : "Show FAQ Guide"}
          <ChevronDown size={14} className={cn("transition-transform duration-300", showFaqs && "rotate-180")} />
        </button>

        <AnimatePresence>
          {showFaqs && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="w-full space-y-3"
            >
              {faqs.map((faq, i) => (
                <div key={i} className="border border-zinc-900 bg-zinc-950/20 rounded-xl overflow-hidden transition-colors hover:border-zinc-800">
                  <button 
                    onClick={() => setOpenIndex(openIndex === i ? null : i)}
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-white/5 transition-colors group"
                  >
                    <span className={cn(
                      "text-sm font-bold transition-colors",
                      openIndex === i ? "text-blue-400" : "text-zinc-400 group-hover:text-zinc-100"
                    )}>{faq.q}</span>
                    <ChevronDown size={16} className={cn("text-zinc-600 transition-transform duration-300", openIndex === i && "rotate-180 text-blue-400")} />
                  </button>
                  <AnimatePresence>
                    {openIndex === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                      >
                        <div className="px-4 pb-4 text-xs text-zinc-500 leading-relaxed border-t border-zinc-900 pt-3 mx-4">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

const App: React.FC = () => {
  const [flow, setFlow] = useState<AppFlow>('LANDING');
  const [isDeploying, setIsDeploying] = useState(false);
  const [agentConfig, setAgentConfig] = useState<any>(null);

  // Check URL params for auto-deploy state (e.g. if username exists)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('username')) {
      setFlow('ACTIVE');
    }
  }, []);

  const handleDeploy = () => {
    setIsDeploying(true);
    // Simulate deployment process
    setTimeout(() => {
      setIsDeploying(false);
      setFlow('ACTIVE');
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-zinc-950 bg-dot-grid relative overflow-x-hidden flex flex-col selection:bg-blue-500/30">
      
      <AnimatePresence mode="wait">
        {flow === 'LANDING' && (
          <motion.div 
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex-1 flex flex-col justify-center items-center py-20 px-4"
          >
            <Hero />
            
            <div className="flex items-center gap-4 mt-4">
              <button 
                onClick={() => setFlow('FLOWMAP')}
                className="px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-500 text-[10px] font-black uppercase tracking-widest hover:text-blue-400 hover:border-blue-500/50 transition-all flex items-center gap-2"
              >
                <Network size={12} />
                View App Flowmap
              </button>
            </div>
            
            <LandingFAQ />

            <button 
              onClick={() => setFlow('CREATING')}
              className="mt-8 px-12 py-4 bg-white text-zinc-950 font-bold rounded-xl hover:bg-zinc-200 transition-all shadow-xl active:scale-95 flex items-center gap-3 group"
            >
              Initialize Autonomous Agent
              <motion.span
                animate={{ x: [0, 4, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                <ChevronDown size={18} className="-rotate-90" />
              </motion.span>
            </button>
            <div className="mt-12 py-12 border-t border-zinc-900/50 flex flex-col items-center gap-4 w-full max-w-4xl">
              <div className="flex items-center gap-8 text-zinc-600 text-[10px] font-bold uppercase tracking-[0.2em]">
                <span>Secure</span>
                <span className="w-1 h-1 bg-zinc-800 rounded-full" />
                <span>Audited</span>
                <span className="w-1 h-1 bg-zinc-800 rounded-full" />
                <span>Non-Custodial</span>
              </div>
            </div>
          </motion.div>
        )}

        {flow === 'CREATING' && (
          <motion.div
            key="creating"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1"
          >
            <AgentCreation 
              onBack={() => setFlow('LANDING')}
              onConfirm={(config) => {
                setAgentConfig(config);
                setFlow('PAYING');
              }}
            />
          </motion.div>
        )}

        {flow === 'PAYING' && (
          <motion.div 
            key="paying"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col justify-center items-center py-20 px-4"
          >
            <InputArea 
              onDeploy={handleDeploy} 
              isDeploying={isDeploying} 
              agentConfig={agentConfig}
            />
          </motion.div>
        )}

        {flow === 'ACTIVE' && (
          <motion.div 
            key="dashboard"
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 flex flex-col vanish-in"
          >
            <Dashboard />
          </motion.div>
        )}

        {flow === 'FLOWMAP' && (
          <motion.div
            key="flowmap"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="flex-1"
          >
            <FlowMap onBack={() => setFlow('LANDING')} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Persistent Background Glows */}
      <div className="fixed bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-blue-900/10 to-transparent pointer-events-none -z-10" />
    </div>
  );
};

export default App;
