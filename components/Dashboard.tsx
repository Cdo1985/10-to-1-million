import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  TrendingUp, 
  Wallet, 
  Activity, 
  Terminal as TerminalIcon, 
  ChevronRight, 
  Zap, 
  ShieldCheck, 
  Cpu,
  Globe,
  ArrowUpRight,
  GripVertical,
  Rocket,
  Filter,
  ArrowDownAz,
  BookOpen,
  HelpCircle
} from 'lucide-react';
import { Reorder } from 'motion/react';
import { cn } from '@/lib/utils';
import { useAccount, useBalance } from 'wagmi';
import { ConnectKitButton } from 'connectkit';
import { USDC_ADDRESS } from '../lib/web3';
import { fetchLogs, simulateTask } from '../lib/backendService';

// --- Types ---
interface TaskLog {
  id: string;
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'microtask';
  amount?: string;
}

interface StrategyTask {
  id: string;
  title: string;
  description: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'ACTIVE' | 'IDLE';
  icon: any;
  color: string;
  details: {
    parameters: string[];
    history: { date: string; action: string; result: string }[];
    risks: string[];
  }
}

// --- Components ---

const StatCard = ({ title, value, icon: Icon, trend, prefix = "" }: { title: string, value: string, icon: any, trend?: string, prefix?: string }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl relative overflow-hidden group hover:border-zinc-700 transition-colors"
  >
    <div className="flex justify-between items-start mb-4">
      <div className="p-2 bg-zinc-800 rounded-lg text-zinc-400 group-hover:text-blue-400 transition-colors">
        <Icon size={20} />
      </div>
      {trend && (
        <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
          <TrendingUp size={12} />
          {trend}
        </span>
      )}
    </div>
    <div>
      <p className="text-zinc-500 text-sm font-medium mb-1">{title}</p>
      <h3 className="text-2xl font-bold font-mono tracking-tight text-zinc-100">
        {prefix}{value}
      </h3>
    </div>
    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 blur-[40px] rounded-full -mr-12 -mt-12 group-hover:bg-blue-500/10 transition-colors" />
  </motion.div>
);

const TerminalLog: React.FC<{ log: TaskLog }> = ({ log }) => (
  <div className="font-mono text-xs py-1 flex items-start gap-3 group">
    <span className="text-zinc-600 shrink-0 select-none">{log.timestamp}</span>
    <div className={cn(
      "flex flex-wrap gap-x-2",
      log.type === 'success' ? 'text-emerald-400' : 
      log.type === 'error' ? 'text-rose-400' :
      log.type === 'warning' ? 'text-amber-400' :
      log.type === 'microtask' ? 'text-blue-400' : 'text-zinc-400'
    )}>
      {log.type === 'microtask' && <span className="text-zinc-500">[$]</span>}
      <span>{log.message}</span>
      {log.amount && (
        <span className="bg-emerald-500/10 text-emerald-400 px-1 rounded font-bold">
          +{log.amount} USDC
        </span>
      )}
    </div>
  </div>
);

const ProgressBar = ({ current, target }: { current: number, target: number }) => {
  const percentage = Math.min((current / target) * 100, 100);
  
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-end">
        <div>
          <p className="text-zinc-500 text-xs font-medium uppercase tracking-wider mb-1">Grind Progress</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-zinc-100">${current.toLocaleString()}</span>
            <span className="text-zinc-500 text-sm font-mono">/ ${target.toLocaleString()}</span>
          </div>
        </div>
        <span className="text-blue-400 font-mono font-bold text-sm">{percentage.toFixed(2)}%</span>
      </div>
      <div className="h-3 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800 p-[2px]">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="h-full bg-gradient-to-r from-blue-600 via-blue-400 to-emerald-400 rounded-full relative"
        >
          <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.2)_50%,transparent_100%)] bg-[length:200%_100%] animate-[shimmer_2s_infinite]" />
        </motion.div>
      </div>
    </div>
  );
};

// --- Main Dashboard ---

export const Dashboard: React.FC = () => {
  const { isConnected, address } = useAccount();
  const { data: usdcBalance } = useBalance({
    address,
    token: USDC_ADDRESS,
  });

  const [logs, setLogs] = useState<TaskLog[]>([]);
  const terminalRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<'terminal' | 'strategy' | 'config' | 'guide'>('terminal');
  const [selectedTask, setSelectedTask] = useState<StrategyTask | null>(null);
  const [statusToggleTask, setStatusToggleTask] = useState<StrategyTask | null>(null);
  const [filterStatus, setFilterStatus] = useState<'All' | 'ACTIVE' | 'IDLE'>('All');
  const [sortBy, setSortBy] = useState<'order' | 'priority' | 'name'>('order');
  
  const [config, setConfig] = useState({
    riskTolerance: 40,
    maxGas: 0.5,
    preferredTasks: ['social', 'defi']
  });

  const handleSaveConfig = () => {
    // Simulate saving
    console.log("Saving config:", config);
  };

  const handleResetConfig = () => {
    setConfig({
      riskTolerance: 40,
      maxGas: 0.5,
      preferredTasks: ['social', 'defi']
    });
  };

  const [tasks, setTasks] = useState<StrategyTask[]>([
    {
      id: 'task-1',
      title: 'Micro-Task Scaling',
      description: 'Executing low-complexity human-intelligence tasks.',
      priority: 'High',
      status: 'ACTIVE',
      icon: TrendingUp,
      color: 'text-blue-400 bg-blue-500/10',
      details: {
        parameters: ['Min Reward: 0.001 USDC', 'Verify Interval: 30s', 'Max Concurrent: 50'],
        history: [
          { date: '2026-04-26', action: 'Data Labeling Batch #49', result: '+0.45 USDC' },
          { date: '2026-04-25', action: 'Captcha Solved #12', result: '+0.02 USDC' }
        ],
        risks: ['Network congestion may delay payouts', 'Platform-specific rate limiting']
      }
    },
    {
      id: 'task-2',
      title: 'Flash Loan Arbitrage',
      description: 'Identifying price discrepancies across Base DEXs.',
      priority: 'Medium',
      status: 'IDLE',
      icon: ArrowUpRight,
      color: 'text-purple-400 bg-purple-500/10',
      details: {
        parameters: ['Min Profit: 0.05 USDC', 'DEX List: Uniswap, Aerodrome', 'Gas Guard: On'],
        history: [
          { date: '2026-04-26', action: 'WETH/USDC arb found', result: '+2.41 USDC' },
          { date: '2026-04-24', action: 'No arb opportunities identified', result: '0.00 USDC' }
        ],
        risks: ['MEV frontrunning', 'Execution slippage']
      }
    },
    {
      id: 'task-3',
      title: 'Social Sentiment Analysis',
      description: 'Monitoring Farcaster for emerging alpha.',
      priority: 'Low',
      status: 'IDLE',
      icon: Globe,
      color: 'text-emerald-400 bg-emerald-500/10',
      details: {
        parameters: ['Scan Frequency: 5m', 'Keyword focus: "Base", "Mint"', 'Reliability: 0.85'],
        history: [
          { date: '2026-04-26', action: 'Alpha signal detected: $ZINC', result: 'Alert Sent' }
        ],
        risks: ['Incorrect signal interpretation', 'High volume of false positives']
      }
    },
    {
      id: 'task-4',
      title: 'Yield Farming',
      description: 'Liquidity provisioning across Base stable pools.',
      priority: 'Medium',
      status: 'IDLE',
      icon: Zap,
      color: 'text-amber-400 bg-amber-500/10',
      details: {
        parameters: ['TVL Limit: 10,000 USDC', 'Pool: USDbC/DAI', 'Auto-compound: Yes'],
        history: [
          { date: '2026-04-26', action: 'Accrued swap fees', result: '+0.12 USDC' }
        ],
        risks: ['Pool imbalance', 'Smart contract vulnerability']
      }
    },
    {
      id: 'task-5',
      title: 'Affiliate Marketing',
      description: 'Auto-referral link distribution for on-chain apps.',
      priority: 'Low',
      status: 'IDLE',
      icon: Activity,
      color: 'text-rose-400 bg-rose-500/10',
      details: {
        parameters: ['Target Platform: Farcaster', 'Click-through: 0.05%', 'Max Links: 5/hr'],
        history: [
          { date: '2026-04-26', action: 'Spread referral link #1', result: '3 clicks' }
        ],
        risks: ['Account flagging for spam', 'Low conversion rates']
      }
    }
  ]);
  
  const priorityMap = { High: 3, Medium: 2, Low: 1 };

  const displayedTasks = [...tasks]
    .filter(task => filterStatus === 'All' || task.status === filterStatus)
    .sort((a, b) => {
      if (sortBy === 'priority') return priorityMap[b.priority] - priorityMap[a.priority];
      if (sortBy === 'name') return a.title.localeCompare(b.title);
      return 0; // Default order is the index in the tasks array
    });

  // Parse URL params
  const searchParams = new URLSearchParams(window.location.search);
  const username = searchParams.get('username') || 'Anonymous';
  const balance = parseFloat(usdcBalance?.formatted || '0.10');
  const netProfit = parseFloat(searchParams.get('netProfit') || '0.00');
  const progressPercent = parseFloat(searchParams.get('progress') || '0');

  // Simulation & Sync Logic
  useEffect(() => {
    const messages = [
      { msg: "Scanning Farcaster for micro-gigs...", type: 'info' },
      { msg: "Validating social sentiment on Base L2", type: 'info' },
      { msg: "Completed data labeling for decentralized AI", type: 'success', amount: "0.002" },
      { msg: "Executing flash-loan strategy #72", type: 'microtask', amount: "0.015" },
      { msg: "Optimizing gas for next batch transaction", type: 'info' },
      { msg: "Received payout from AgentStore v2", type: 'success', amount: "0.042" },
      { msg: "Warning: High network congestion, deferring non-critical tasks", type: 'warning' },
      { msg: "Arbitrage opportunity detected: WETH/USDC", type: 'microtask', amount: "0.021" },
    ];

    const syncWithBackend = async () => {
      try {
        const backendLogs = await fetchLogs();
        setLogs(prev => {
          const existingIds = new Set(prev.map(l => l.id));
          const newItems = backendLogs.filter((l: any) => !existingIds.has(l.id));
          return [...prev, ...newItems].slice(-100);
        });
      } catch (err) {
        console.error("Sync error", err);
      }
    };

    const intervalLocal = setInterval(() => {
      if (Math.random() > 0.7) { // Only occasionally add local simulation to keep it lively
        const randomMsg = messages[Math.floor(Math.random() * messages.length)];
        const newLog: TaskLog = {
          id: 'local-' + Math.random().toString(36).substr(2, 9),
          timestamp: new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          message: randomMsg.msg,
          type: randomMsg.type as any,
          amount: randomMsg.amount
        };
        setLogs(prev => [...prev.slice(-99), newLog]);
      }
    }, 3000);

    const intervalBackend = setInterval(syncWithBackend, 5000);

    return () => {
      clearInterval(intervalLocal);
      clearInterval(intervalBackend);
    };
  }, []);

  // Trigger real backend simulation based on active tasks
  useEffect(() => {
    const triggerBackendTask = async () => {
      const activeTask = tasks.find(t => t.status === 'ACTIVE');
      if (activeTask) {
        try {
          await simulateTask(activeTask.title);
        } catch (err) {
          console.error("Backend simulation error", err);
        }
      }
    };

    const interval = setInterval(triggerBackendTask, 15000);
    return () => clearInterval(interval);
  }, [tasks]);

  // Auto-scroll terminal
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-900/20">
            <Cpu size={28} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-zinc-100 flex items-center gap-2 uppercase">
              Ten to One Million <span className="text-[10px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full font-mono">v1.2-ALPHA</span>
            </h1>
            <p className="text-zinc-500 text-sm font-medium flex items-center gap-1.5">
              <Globe size={14} className="text-blue-500" />
              Connected as <span className="text-zinc-300 font-mono">@{username}</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <ConnectKitButton.Custom>
            {({ isConnected, show, address }) => (
              <button 
                onClick={show}
                className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm font-medium hover:bg-zinc-800 transition-colors flex items-center gap-2"
              >
                <ShieldCheck size={16} className={isConnected ? "text-emerald-500" : "text-zinc-500"} />
                {isConnected ? `${address?.substring(0, 6)}...${address?.substring(address.length - 4)}` : "Connect Wallet"}
              </button>
            )}
          </ConnectKitButton.Custom>
          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-bold transition-all shadow-lg shadow-blue-900/20 active:scale-95">
            Collect $USDC
          </button>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column - Stats & Progress */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard 
              title="Current Balance" 
              value={balance.toFixed(2)} 
              icon={Wallet} 
              prefix="$" 
            />
            <StatCard 
              title="Net Profit" 
              value={netProfit.toFixed(2)} 
              icon={TrendingUp} 
              prefix="+" 
              trend="2.4% today" 
            />
            <StatCard 
              title="Uptime" 
              value="14d 2h 45m" 
              icon={Activity} 
            />
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 relative overflow-hidden"
          >
            <ProgressBar current={balance} target={1000000} />
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                <div>
                  <p className="text-zinc-500 text-[10px] uppercase tracking-widest font-bold mb-1">Network</p>
                  <p className="text-sm font-mono font-bold text-zinc-300 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                    Base Mainnet
                  </p>
                </div>
                <div className="w-px h-8 bg-zinc-800" />
                <div>
                  <p className="text-zinc-500 text-[10px] uppercase tracking-widest font-bold mb-1">Agent Strategy</p>
                  <p className="text-sm font-mono font-bold text-zinc-300">High Frequency Micro-Gigs</p>
                </div>
              </div>
              <button className="w-full sm:w-auto px-6 py-2 bg-zinc-50 text-zinc-950 rounded-lg text-sm font-bold hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2">
                Boost Yield <Zap size={16} />
              </button>
            </div>
          </motion.div>

          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-1 overflow-hidden flex flex-col min-h-[400px]">
            <div className="flex items-center border-b border-zinc-800 bg-zinc-900/80">
              <button 
                onClick={() => setActiveTab('terminal')}
                className={cn(
                  "px-6 py-3 text-sm font-bold transition-all border-b-2",
                  activeTab === 'terminal' ? "border-blue-500 text-blue-400 bg-blue-500/5" : "border-transparent text-zinc-500 hover:text-zinc-300"
                )}
              >
                Agent Terminal
              </button>
              <button 
                onClick={() => setActiveTab('strategy')}
                className={cn(
                  "px-6 py-3 text-sm font-bold transition-all border-b-2",
                  activeTab === 'strategy' ? "border-blue-500 text-blue-400 bg-blue-500/5" : "border-transparent text-zinc-500 hover:text-zinc-300"
                )}
              >
                Task Strategy
              </button>
              <button 
                onClick={() => setActiveTab('config')}
                className={cn(
                  "px-6 py-3 text-sm font-bold transition-all border-b-2",
                  activeTab === 'config' ? "border-blue-500 text-blue-400 bg-blue-500/5" : "border-transparent text-zinc-500 hover:text-zinc-300"
                )}
              >
                Agent Config
              </button>
              <button 
                onClick={() => setActiveTab('guide')}
                className={cn(
                  "px-6 py-3 text-sm font-bold transition-all border-b-2",
                  activeTab === 'guide' ? "border-blue-500 text-blue-400 bg-blue-500/5" : "border-transparent text-zinc-500 hover:text-zinc-300"
                )}
              >
                User Guide
              </button>
            </div>
            
            <div className="flex-1 p-4 relative">
              {activeTab === 'terminal' ? (
                <div 
                  ref={terminalRef}
                  className="absolute inset-0 p-4 overflow-y-auto overscroll-contain flex flex-col gap-0.5 scroll-smooth"
                >
                  {logs.map((log) => <TerminalLog key={log.id} log={log} />)}
                  <div className="font-mono text-xs text-blue-400 terminal-cursor pt-1">_</div>
                </div>
              ) : activeTab === 'strategy' ? (
                <div className="p-4">
                  {/* Filter and Sort Controls */}
                  <div className="flex flex-wrap items-center justify-between gap-4 mb-6 px-1">
                    <div className="flex items-center gap-2">
                      <Filter size={14} className="text-zinc-600" />
                      <div className="flex bg-zinc-900 border border-zinc-800 rounded-lg p-0.5">
                        {['All', 'ACTIVE', 'IDLE'].map((s) => (
                          <button
                            key={s}
                            onClick={() => setFilterStatus(s as any)}
                            className={cn(
                              "px-3 py-1 text-[10px] font-bold rounded-md transition-all",
                              filterStatus === s ? "bg-zinc-800 text-blue-400" : "text-zinc-500 hover:text-zinc-300"
                            )}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <ArrowDownAz size={14} className="text-zinc-600" />
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                        className="bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-1 text-[10px] font-bold text-zinc-400 focus:text-blue-400 outline-none"
                      >
                        <option value="order">Manual Order</option>
                        <option value="priority">Priority</option>
                        <option value="name">Name</option>
                      </select>
                    </div>
                  </div>

                  <Reorder.Group 
                    axis="y" 
                    values={displayedTasks} 
                    onReorder={(newOrder) => {
                      // Only allow reordering if we are showing all tasks in manual order
                      if (filterStatus === 'All' && sortBy === 'order') {
                        setTasks(newOrder);
                      }
                    }} 
                    className="space-y-4"
                  >
                    {displayedTasks.map((task) => (
                      <Reorder.Item 
                        key={task.id} 
                        value={task}
                        drag={filterStatus === 'All' && sortBy === 'order' ? 'y' : false}
                        whileDrag={{ 
                          scale: 1.02,
                          boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.5), 0 8px 10px -6px rgb(0 0 0 / 0.5)",
                          backgroundColor: "rgba(39, 39, 42, 0.82)"
                        }}
                        whileHover={{ 
                          backgroundColor: "rgba(39, 39, 42, 0.4)"
                        }}
                        onClick={() => setSelectedTask(task)}
                        className={cn(
                          "flex items-center justify-between p-4 bg-zinc-800/50 rounded-xl border border-zinc-700/50 cursor-pointer transition-colors group/item",
                          filterStatus === 'All' && sortBy === 'order' ? "active:cursor-grabbing" : "cursor-default"
                        )}
                      >
                        <div className="flex items-center gap-4">
                          {filterStatus === 'All' && sortBy === 'order' && (
                            <GripVertical size={18} className="text-zinc-600 group-hover/item:text-zinc-400 transition-colors" />
                          )}
                          <div className={cn("p-2 rounded-lg", task.color)}>
                            <task.icon size={20} />
                          </div>
                          <div>
                            <p className="text-zinc-100 font-bold text-sm">{task.title}</p>
                            <p className="text-zinc-500 text-xs">{task.description}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4" onClick={(e) => e.stopPropagation()}>
                          <select 
                            value={task.priority}
                            onChange={(e) => {
                              const newPriority = e.target.value as any;
                              setTasks(tasks.map(t => t.id === task.id ? { ...t, priority: newPriority } : t));
                            }}
                            className="bg-zinc-900 text-zinc-300 text-[10px] font-bold px-2 py-1 rounded border border-zinc-700 outline-none focus:border-blue-500 transition-colors"
                          >
                            <option value="High">HIGH</option>
                            <option value="Medium">MED</option>
                            <option value="Low">LOW</option>
                          </select>
                          <div 
                            onClick={(e) => {
                              e.stopPropagation();
                              setStatusToggleTask(task);
                            }}
                            className={cn(
                              "text-right font-mono text-[10px] font-bold px-2 py-0.5 rounded-full cursor-pointer hover:scale-105 transition-transform",
                              task.status === 'ACTIVE' ? "text-emerald-400 bg-emerald-500/10" : "text-zinc-500 bg-zinc-800"
                            )}
                          >
                            {task.status}
                          </div>
                        </div>
                      </Reorder.Item>
                    ))}
                  </Reorder.Group>
                  <p className="text-zinc-600 text-[10px] text-center mt-6 uppercase tracking-wider font-mono">
                    {filterStatus === 'All' && sortBy === 'order' 
                      ? "Drag to reorder hierarchy • Click to view details" 
                      : "Sorting/Filtering active • Click to view details"}
                  </p>
                </div>
              ) : activeTab === 'config' ? (
                <div className="p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Risk Tolerance */}
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <label className="text-sm font-bold text-zinc-100">Risk Tolerance</label>
                        <span className={cn(
                          "text-[10px] font-mono font-bold px-2 py-0.5 rounded-full",
                          config.riskTolerance < 30 ? "bg-emerald-500/10 text-emerald-400" :
                          config.riskTolerance < 70 ? "bg-blue-500/10 text-blue-400" : "bg-rose-500/10 text-rose-400"
                        )}>
                          {config.riskTolerance}% - {config.riskTolerance < 30 ? 'CONSERVATIVE' : config.riskTolerance < 70 ? 'BALANCED' : 'DEGENERATE'}
                        </span>
                      </div>
                      <input 
                        type="range" 
                        min="1" 
                        max="100" 
                        value={config.riskTolerance}
                        onChange={(e) => setConfig({ ...config, riskTolerance: parseInt(e.target.value) })}
                        className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                      />
                      <p className="text-zinc-500 text-[10px] font-medium leading-relaxed">
                        Higher risk increases target rewards but subjects the agent to higher slippage and volatile micro-gigs.
                      </p>
                    </div>

                    {/* Max Gas */}
                    <div className="space-y-4">
                      <label className="text-sm font-bold text-zinc-100 block">Max Gas Fees</label>
                      <div className="relative">
                        <input 
                          type="number" 
                          step="0.01"
                          value={config.maxGas}
                          onChange={(e) => setConfig({ ...config, maxGas: parseFloat(e.target.value) })}
                          className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2.5 text-sm font-mono focus:border-blue-500 outline-none transition-colors"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 text-[10px] font-bold">GWEI</span>
                      </div>
                      <p className="text-zinc-500 text-[10px] font-medium leading-relaxed">
                        Agent will pause operations if Base network gas exceeds this threshold to preserve profit margins.
                      </p>
                    </div>
                  </div>

                  {/* Task Types */}
                  <div className="space-y-4">
                    <label className="text-sm font-bold text-zinc-100 block">Preferred Task Types</label>
                    <div className="flex flex-wrap gap-3">
                      {[
                        { id: 'social', label: 'Social Engagement', icon: Globe },
                        { id: 'defi', label: 'DeFi Arbitrage', icon: TrendingUp },
                        { id: 'data', label: 'Data Labeling', icon: Activity },
                        { id: 'yield', label: 'Yield Farming', icon: Zap },
                        { id: 'affiliate', label: 'Affiliate Marketing', icon: Rocket },
                      ].map((type) => {
                        const isSelected = config.preferredTasks.includes(type.id);
                        return (
                          <button
                            key={type.id}
                            onClick={() => {
                              const newTasks = isSelected 
                                ? config.preferredTasks.filter(id => id !== type.id)
                                : [...config.preferredTasks, type.id];
                              setConfig({ ...config, preferredTasks: newTasks });
                            }}
                            className={cn(
                              "flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-bold transition-all",
                              isSelected 
                                ? "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/20" 
                                : "bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-700"
                            )}
                          >
                            <type.icon size={14} />
                            {type.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-4 flex items-center gap-3">
                    <button 
                      onClick={handleSaveConfig}
                      className="flex-1 bg-zinc-50 text-zinc-950 py-2.5 rounded-lg text-sm font-bold hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2"
                    >
                      Update Configuration
                    </button>
                    <button 
                      onClick={handleResetConfig}
                      className="px-6 py-2.5 border border-zinc-800 text-zinc-500 rounded-lg text-sm font-bold hover:bg-zinc-800 hover:text-zinc-300 transition-colors"
                    >
                      Reset
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-8 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-300 max-w-4xl mx-auto">
                  
                  {/* Guide Introduction */}
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl shrink-0">
                      <BookOpen size={24} />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-zinc-100 mb-2">Mastering Ten to One Million</h2>
                      <p className="text-zinc-500 text-sm leading-relaxed">
                        Welcome to your AI Agent Controller. Your agent is a high-frequency micro-earner designed to autonomously scale a 10 USDC stake to 1,000,000 USDC through strategic on-chain operations.
                      </p>
                    </div>
                  </div>

                  {/* FAQ Sections */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-zinc-100 font-bold">
                        <Cpu size={18} className="text-blue-500" />
                        <h3>Agent Configuration</h3>
                      </div>
                      <div className="space-y-4">
                        <div className="bg-zinc-800/30 border border-zinc-800 p-4 rounded-xl">
                          <p className="text-zinc-300 text-xs font-bold mb-1">Risk Tolerance</p>
                          <p className="text-zinc-500 text-[11px] leading-relaxed">Adjusts the aggressiveness of the agent. <span className="text-rose-400/80">Degenerate</span> mode chases higher APY but faces greater potential for slippage and failed transactions.</p>
                        </div>
                        <div className="bg-zinc-800/30 border border-zinc-800 p-4 rounded-xl">
                          <p className="text-zinc-300 text-xs font-bold mb-1">Gas Safeguard</p>
                          <p className="text-zinc-500 text-[11px] leading-relaxed">The agent monitors Base network gas prices in real-time. Operations pause if gas exceeds your limit to ensure micro-profits aren't eaten by fees.</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-zinc-100 font-bold">
                        <Zap size={18} className="text-amber-500" />
                        <h3>Task Strategies</h3>
                      </div>
                      <div className="space-y-4">
                        <div className="bg-zinc-800/30 border border-zinc-800 p-4 rounded-xl">
                          <p className="text-zinc-300 text-xs font-bold mb-1">Manual Priority</p>
                          <p className="text-zinc-500 text-[11px] leading-relaxed">In the Task Strategy tab, you can drag and drop tasks to set execution priority. The agent processes tasks from the top down.</p>
                        </div>
                        <div className="bg-zinc-800/30 border border-zinc-800 p-4 rounded-xl">
                          <p className="text-zinc-300 text-xs font-bold mb-1">Unlocking Growth</p>
                          <p className="text-zinc-500 text-[11px] leading-relaxed">New strategies like 'Flash Loan Arbitrage' and 'Yield Farming' unlock automatically as your balance hits key milestones ($10, $100, $1,000).</p>
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* On-Chain Payments Section */}
                  <div className="bg-blue-600/5 border border-blue-500/20 rounded-2xl p-6">
                    <div className="flex items-center gap-2 text-blue-400 font-bold mb-4">
                      <Wallet size={18} />
                      <h3>On-Chain Security & Payments</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <p className="text-zinc-100 text-xs font-bold">Base Mainnet</p>
                        <p className="text-zinc-500 text-[10px] leading-relaxed">All operations happen on Base, ensuring low fees and high throughput. Your agent's earnings are 100% USDC.</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-zinc-100 text-xs font-bold">Treasury Control</p>
                        <p className="text-zinc-500 text-[10px] leading-relaxed">Initial stakes are handled via secure smart contract transfers. You retain the ability to collect accrued profits at any time.</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-zinc-100 text-xs font-bold">Self-Custody</p>
                        <p className="text-zinc-500 text-[10px] leading-relaxed">We never store your private keys. The agent operates within the permissions granted during your initial set up.</p>
                      </div>
                    </div>
                  </div>

                  {/* Help Footer */}
                  <div className="flex flex-col items-center justify-center pt-6 border-t border-zinc-800/50">
                    <div className="flex items-center gap-2 text-zinc-400 text-xs mb-2">
                      <HelpCircle size={14} />
                      <span>Still have questions?</span>
                    </div>
                    <p className="text-zinc-600 text-[11px]">Join our Farcaster community or reach out on X for technical support.</p>
                  </div>

                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Social / Agent Details */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-2xl shadow-xl shadow-blue-900/20 text-white">
            <h4 className="font-bold text-lg mb-2">Join the Whitelist</h4>
            <p className="text-blue-100/80 text-sm mb-6">
              The real Agent Store is coming soon. Deploy autonomous USDC earners on Base with one click.
            </p>
            <div className="space-y-3">
              <input 
                type="email" 
                placeholder="email@example.com"
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-sm placeholder:text-white/40 outline-none focus:bg-white/20 transition-all"
              />
              <button className="w-full bg-white text-blue-600 py-2.5 rounded-lg text-sm font-bold hover:bg-zinc-100 transition-colors">
                Reserve Early Access
              </button>
            </div>
          </div>

          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
            <h4 className="text-zinc-500 text-[10px] uppercase tracking-widest font-bold mb-4 flex items-center justify-between">
              Recent On-Chain Activity
              <TrendingUp size={12} className="text-emerald-400" />
            </h4>
            <div className="space-y-4">
              {[
                { user: 'vitalik.eth', action: 'Deployed Agent', time: '2m' },
                { user: 'base_god', action: 'Earned 5.2 USDC', time: '5m' },
                { user: 'dubv', action: 'Scaled Grind', time: '12m' },
                { user: 'anon_farcaster', action: 'Whitelisted', time: '14m' },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between text-xs group cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[10px] font-mono group-hover:border-blue-500/50 transition-colors">
                      {item.user.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-zinc-300 font-bold group-hover:text-blue-400 transition-colors">{item.user}</p>
                      <p className="text-zinc-500">{item.action}</p>
                    </div>
                  </div>
                  <span className="text-zinc-600 font-mono">{item.time}</span>
                </div>
              ))}
            </div>
            <button className="w-full mt-6 py-2 border border-zinc-800 rounded-lg text-zinc-500 text-xs font-bold hover:bg-zinc-800 hover:text-zinc-300 transition-all">
              View All Transactions
            </button>
          </div>

          <div className="bg-zinc-900/20 border border-zinc-800/50 border-dashed rounded-2xl p-6 flex flex-col items-center text-center">
            <div className="p-3 bg-zinc-800/50 rounded-full text-zinc-600 mb-3">
              <ChevronRight size={20} />
            </div>
            <p className="text-zinc-500 text-xs font-medium mb-1">Next Milestone</p>
            <p className="text-zinc-300 font-mono font-bold text-sm">$100.00 Balance</p>
            <p className="text-[10px] text-zinc-600 mt-2">Unlocks Layer 2 Arbitrage strategy</p>
          </div>

        </div>
      </div>

      {/* Task detail Modal */}
      <AnimatePresence>
        {selectedTask && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedTask(null)}
              className="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn("p-2 rounded-lg", selectedTask.color)}>
                    <selectedTask.icon size={20} />
                  </div>
                  <div>
                    <h3 className="text-zinc-100 font-bold">{selectedTask.title}</h3>
                    <p className="text-zinc-500 text-xs">{selectedTask.status} • Priority: {selectedTask.priority}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedTask(null)}
                  className="p-2 text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  <ChevronRight className="rotate-90" size={20} />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div>
                  <h4 className="text-zinc-400 text-[10px] uppercase tracking-widest font-bold mb-3">Parameters</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedTask.details.parameters.map((p, i) => (
                      <span key={i} className="bg-zinc-800 text-zinc-300 px-2 py-1 rounded border border-zinc-700 text-[10px] font-mono">
                        {p}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-zinc-400 text-[10px] uppercase tracking-widest font-bold mb-3">Execution History</h4>
                  <div className="space-y-2">
                    {selectedTask.details.history.map((h, i) => (
                      <div key={i} className="flex justify-between items-center bg-zinc-800/30 p-2 rounded-lg border border-zinc-800">
                        <div>
                          <p className="text-zinc-300 text-[11px] font-bold">{h.action}</p>
                          <p className="text-zinc-600 text-[10px] font-mono">{h.date}</p>
                        </div>
                        <span className={cn(
                          "font-mono text-[10px] font-bold",
                          h.result.startsWith('+') ? "text-emerald-400" : "text-zinc-500"
                        )}>{h.result}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-zinc-400 text-[10px] uppercase tracking-widest font-bold mb-3">Identified Risks</h4>
                  <ul className="space-y-1.5">
                    {selectedTask.details.risks.map((r, i) => (
                      <li key={i} className="flex items-start gap-2 text-zinc-500 text-[10px]">
                        <div className="w-1 h-1 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="p-6 bg-zinc-800/50 flex gap-3">
                <button 
                  onClick={() => setSelectedTask(null)}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-bold hover:bg-blue-500 transition-colors"
                >
                  Confirm Strategy
                </button>
                <button 
                  onClick={() => setSelectedTask(null)}
                  className="flex-1 bg-zinc-800 text-zinc-400 py-2 rounded-lg text-sm font-bold hover:bg-zinc-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Status Toggle Confirmation Modal */}
      <AnimatePresence>
        {statusToggleTask && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setStatusToggleTask(null)}
              className="absolute inset-0 bg-zinc-950/90 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-6 text-center"
            >
              <div className={cn(
                "w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4",
                statusToggleTask.status === 'ACTIVE' ? "bg-rose-500/10 text-rose-500" : "bg-emerald-500/10 text-emerald-500"
              )}>
                <Zap size={32} />
              </div>
              <h3 className="text-xl font-bold text-zinc-100 mb-2">
                {statusToggleTask.status === 'ACTIVE' ? 'Deactivate' : 'Activate'} Strategy?
              </h3>
              <p className="text-zinc-500 text-sm mb-8">
                Are you sure you want to {statusToggleTask.status === 'ACTIVE' ? 'stop' : 'start'} the <span className="text-zinc-300 font-bold">{statusToggleTask.title}</span> autonomous operations on Base mainnet?
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => {
                    setTasks(tasks.map(t => 
                      t.id === statusToggleTask.id 
                        ? { ...t, status: t.status === 'ACTIVE' ? 'IDLE' : 'ACTIVE' } 
                        : t
                    ));
                    setStatusToggleTask(null);
                  }}
                  className={cn(
                    "flex-1 py-3 rounded-xl font-bold text-sm transition-all",
                    statusToggleTask.status === 'ACTIVE' 
                      ? "bg-rose-600 text-white hover:bg-rose-500 shadow-lg shadow-rose-900/20" 
                      : "bg-emerald-600 text-white hover:bg-emerald-500 shadow-lg shadow-emerald-900/20"
                  )}
                >
                  Confirm Change
                </button>
                <button 
                  onClick={() => setStatusToggleTask(null)}
                  className="flex-1 py-3 bg-zinc-800 text-zinc-400 rounded-xl font-bold text-sm hover:bg-zinc-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
