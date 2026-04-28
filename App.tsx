/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect } from 'react';
import { Hero } from './components/Hero';
import { InputArea } from './components/InputArea';
import { Dashboard } from './components/Dashboard';
import { AgentCreation } from './components/AgentCreation';
import { motion, AnimatePresence } from 'motion/react';

export type AppFlow = 'LANDING' | 'CREATING' | 'PAYING' | 'ACTIVE';

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
            <button 
              onClick={() => setFlow('CREATING')}
              className="mt-8 px-12 py-4 bg-white text-zinc-950 font-bold rounded-xl hover:bg-zinc-200 transition-all shadow-xl active:scale-95"
            >
              Initialize Autonomous Agent
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
      </AnimatePresence>

      {/* Persistent Background Glows */}
      <div className="fixed bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-blue-900/10 to-transparent pointer-events-none -z-10" />
    </div>
  );
};

export default App;
