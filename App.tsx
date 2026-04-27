/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect } from 'react';
import { Hero } from './components/Hero';
import { InputArea } from './components/InputArea';
import { Dashboard } from './components/Dashboard';
import { motion, AnimatePresence } from 'motion/react';

const App: React.FC = () => {
  const [isDeploying, setIsDeploying] = useState(false);
  const [isDeployed, setIsDeployed] = useState(false);

  // Check URL params for auto-deploy state (e.g. if username exists)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('username')) {
      setIsDeployed(true);
    }
  }, []);

  const handleDeploy = () => {
    setIsDeploying(true);
    // Simulate deployment process
    setTimeout(() => {
      setIsDeploying(false);
      setIsDeployed(true);
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-zinc-950 bg-dot-grid relative overflow-x-hidden flex flex-col selection:bg-blue-500/30">
      
      <AnimatePresence mode="wait">
        {!isDeployed ? (
          <motion.div 
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex-1 flex flex-col"
          >
            <div className="flex-1 flex flex-col justify-center items-center py-20 px-4">
              <Hero />
              <InputArea onDeploy={handleDeploy} isDeploying={isDeploying} />
            </div>
            
            {/* Footer */}
            <div className="py-12 border-t border-zinc-900/50 flex flex-col items-center gap-4">
              <div className="flex items-center gap-8 text-zinc-600 text-[10px] font-bold uppercase tracking-[0.2em]">
                <span>Secure</span>
                <span className="w-1 h-1 bg-zinc-800 rounded-full" />
                <span>Audited</span>
                <span className="w-1 h-1 bg-zinc-800 rounded-full" />
                <span>Non-Custodial</span>
              </div>
              <p className="text-zinc-600 font-mono text-[10px]">
                BUILD ON BASE © 2026
              </p>
            </div>
          </motion.div>
        ) : (
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
