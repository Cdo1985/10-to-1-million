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
  HelpCircle,
  Target,
  Search,
  ChevronDown,
  Fuel
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
  const [guideSearch, setGuideSearch] = useState('');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [showFaqs, setShowFaqs] = useState(false);
  const [gasUsed, setGasUsed] = useState(0.0421);
  const gasLimit = 0.5000;

  const faqItems = [
    {
      question: "What are the protocol/dev profits?",
      answer: "The platform generates revenue through a 5% infrastructure fee on successful agent goal reaching ($1,000,000). For each agent, this results in $50,000 of protocol revenue. Higher tiers ($100/$1000) reach this milestone faster, increasing the protocol's annual recurring revenue (ARR)."
    },
    {
      question: "What are the final fees sent to my wallet?",
      answer: "When your agent hits its goal, it transfers the entire Yield Pool plus the unlocked Operational Buffer to your wallet. During the grinding phase, a 5% platform fee is automatically deducted from payouts to cover infrastructure and global maintenance."
    },
    {
      question: "How do earnings get split?",
      answer: "The agent prioritizes its own survival. The first 20 USDC of earnings is held in an 'Operational Buffer' to pay for gas and liquidity. Any earnings beyond that go directly to your 'Yield Pool', which is available for withdrawal anytime. Once the $1M goal is hit, the 20 USDC buffer also unlocks."
    },
    {
      question: "Do I need to pay for gas fees separately?",
      answer: (
        <span>
          Only for the initial deployment. Since Base is an L2, you need a tiny amount of native ETH (usually &lt; $0.05) to sign the deployment. After that, your agent uses its USDC buffer to automate all future costs. 
          <a href="https://docs.base.org/fees" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline ml-1 inline-flex items-center gap-0.5">
            Verify Base Fees <ArrowUpRight size={10} />
          </a>
        </span>
      )
    },
    {
      question: "Where does the AI get the micro jobs from?",
      answer: (
        <span>
          The agent sources its 'micro-jobs' from the Base L2 ecosystem. These are autonomous on-chain operations: DeFi Liquidity (Aerodrome/Uniswap), Social Mining (Farcaster), and Yield Harvesting. 
          <a href="https://www.base.org/ecosystem" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline ml-1 inline-flex items-center gap-0.5">
            Explore Ecosystem <ArrowUpRight size={10} />
          </a>
        </span>
      )
    },
    {
      question: "What is the minimum USDC needed to start?",
      answer: "The minimum stake required to initialize and deploy an agent is 10 USDC. This covers initial liquidity for compounding cycles. Because it's on Base, gas fees are <$0.01, ensuring your stake grows rather than being eaten by costs."
    },
    {
      question: "How safe is my initial stake?",
      answer: "Your stake is held in a smart contract vault on Base. The agent only has permission to execute authorized strategies; it cannot withdraw funds to external addresses without your signature."
    },
    {
      question: "What happens if gas prices spike?",
      answer: "The 'Gas Safeguard' automatically pauses the agent if current Base fees exceed your configured threshold. Operations resume once fees normalize."
    },
    {
      question: "Can I withdraw mid-grind?",
      answer: "Yes. You are in full control of the vault. You can collect accrued profits or withdraw your entire balance at any point, though this may pause recursive compounding tasks."
    },
    {
      question: "How does the agent select tasks?",
      answer: "The agent uses a proprietary scoring algorithm that weighs 'Target ROI', 'Priority', and 'Risk Sensitivity' against real-time on-chain data to maximize capital efficiency."
    },
    {
      question: "What is Base Mainnet?",
      answer: (
        <span>
          Base is a secure, low-cost Ethereum L2 built by Coinbase. It offers Ethereum's security with drastically lower fees. 
          <a href="https://base.org" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline ml-1 inline-flex items-center gap-0.5">
            Visit Base.org <ArrowUpRight size={10} />
          </a>
        </span>
      )
    },
    {
      question: "What are Execution Paths?",
      answer: "Execution Paths are white-listed protocols (DEXs, Bridges, Markets) your agent is authorized to interact with. This prevents your capital from entering unverified or high-risk contracts."
    }
  ];

  const filteredFaqs = faqItems.filter(item => 
    item.question.toLowerCase().includes(guideSearch.toLowerCase()) || 
    item.answer.toLowerCase().includes(guideSearch.toLowerCase())
  );
  
  const [config, setConfig] = useState({
    riskTolerance: 40,
    maxGas: 0.5,
    preferredTasks: ['social', 'defi'],
    targetRoi: 500,
    operatingPath: 'Base Mainnet -> Aerodrome -> Uniswap',
    targetOutcomeTime: '180 Days'
  });

  const handleSaveConfig = () => {
    // Simulate saving
    console.log("Saving config:", config);
  };

  const handleResetConfig = () => {
    setConfig({
      riskTolerance: 40,
      maxGas: 0.5,
      preferredTasks: ['social', 'defi'],
      targetRoi: 500,
      operatingPath: 'Base Mainnet -> Aerodrome -> Uniswap',
      targetOutcomeTime: '180 Days'
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
      description: 'Liquidity provisioning across Base lending markets.',
      priority: 'Medium',
      status: 'IDLE',
      icon: Zap,
      color: 'text-amber-400 bg-amber-500/10',
      details: {
        parameters: ['Protocol: Morpho, Aave', 'Asset: USDC', 'LTV Limit: 75%'],
        history: [
          { date: '2026-04-26', action: 'Supplied USDC to Morpho Blue', result: 'APY: 8.4%' }
        ],
        risks: ['Borrow rate spikes', 'Smart contract vulnerability']
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
  const balance = parseFloat(usdcBalance?.formatted || '10.00');
  
  const initialStake = 10.00;
  const earnings = balance - initialStake;
  const bufferCap = 20.00;
  
  // Logic: First 20 USDC of earnings goes to buffer, rest to yield pool
  const bufferAmount = Math.min(earnings > 0 ? earnings : 0, bufferCap);
  const yieldPool = Math.max(0, earnings - bufferCap);
  const goalReached = balance >= 1000000;
  
  const netProfit = earnings > 0 ? earnings : 0;
  const progressPercent = (balance / 1000000) * 100;

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
        
        // Slightly increase gas used on success/microtask
        if (randomMsg.type === 'success' || randomMsg.type === 'microtask') {
          setGasUsed(prev => prev + 0.0001 + Math.random() * 0.0005);
        }

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
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
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
              title="Gas Remaining" 
              value={(gasLimit - gasUsed).toFixed(4)} 
              icon={Fuel} 
              prefix="$" 
              trend={`${(( (gasLimit - gasUsed) / gasLimit ) * 100).toFixed(0)}%`}
            />
            <StatCard 
              title="Gas Consumed" 
              value={gasUsed.toFixed(4)} 
              icon={Zap} 
              prefix="$" 
            />
            <StatCard 
              title="Uptime" 
              value="14d 2h 45m" 
              icon={Activity} 
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 relative overflow-hidden flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-end mb-6">
                  <div>
                    <h3 className="text-zinc-100 text-xl font-bold mb-1">Capital Allocation</h3>
                    <p className="text-zinc-500 text-xs tracking-tight">Strategy: Goal Completion Optimization</p>
                  </div>
                  <div className="text-right">
                    <p className="text-blue-400 text-2xl font-black font-mono">${balance.toLocaleString()}</p>
                    <p className="text-zinc-600 text-[10px] uppercase font-bold">Total Agent Value</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px] uppercase font-bold tracking-widest">
                      <span className="text-emerald-400 flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Yield Pool (Withdrawable)
                      </span>
                      <span className="text-zinc-300">${yieldPool.toFixed(2)}</span>
                    </div>
                    <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(yieldPool / balance) * 100}%` }}
                        className="h-full bg-emerald-500" 
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px] uppercase font-bold tracking-widest">
                      <span className="text-blue-400 flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                        Operational Buffer
                      </span>
                      <span className="text-zinc-300">{bufferAmount.toFixed(2)} / {bufferCap.toFixed(2)} USDC</span>
                    </div>
                    <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(bufferAmount / bufferCap) * 100}%` }}
                        className="h-full bg-blue-500" 
                      />
                    </div>
                    <p className="text-[9px] text-zinc-600 leading-relaxed italic">
                      The buffer is locked until the $1M goal is met to ensure recursive growth. {goalReached ? "Goal reached: Buffer unlocked." : ""}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-6 pt-6 border-t border-zinc-800/50">
                <div className="flex items-center gap-6">
                  <div>
                    <p className="text-zinc-500 text-[10px] uppercase tracking-widest font-bold mb-1">Status</p>
                    <p className="text-sm font-mono font-bold text-emerald-400 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      Active Compounding
                    </p>
                  </div>
                </div>
                <button 
                  disabled={yieldPool <= 0 && !goalReached}
                  className="w-full sm:w-auto px-6 py-2 bg-zinc-50 text-zinc-950 rounded-lg text-sm font-bold hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  Withdraw Yield <ChevronRight size={16} />
                </button>
              </div>
            </div>

            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden group">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-amber-500/10 text-amber-500 rounded-lg">
                  <Zap size={18} />
                </div>
                <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest">Gas Safeguard</span>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-zinc-500 text-[10px] uppercase font-bold mb-0.5">Total Used</p>
                    <p className="text-lg font-mono font-bold text-zinc-100">${gasUsed.toFixed(4)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-zinc-500 text-[10px] uppercase font-bold mb-0.5">Total Left</p>
                    <p className="text-sm font-mono font-bold text-emerald-400">${(gasLimit - gasUsed).toFixed(4)}</p>
                  </div>
                </div>
                <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.max(0, ((gasLimit - gasUsed) / gasLimit) * 100)}%` }}
                    className={cn(
                      "h-full rounded-full",
                      ((gasLimit - gasUsed) / gasLimit) > 0.5 ? "bg-emerald-500" : 
                      ((gasLimit - gasUsed) / gasLimit) > 0.2 ? "bg-amber-500" : "bg-rose-500"
                    )}
                  />
                </div>
              </div>
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 blur-[40px] rounded-full -mr-12 -mt-12 group-hover:bg-amber-500/10 transition-colors" />
            </div>
          </div>

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
                Agent Guide
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

                    {/* Target ROI */}
                    <div className="space-y-4">
                      <label className="text-sm font-bold text-zinc-100 block">Target ROI (%)</label>
                      <div className="relative">
                        <input 
                          type="number" 
                          value={config.targetRoi}
                          onChange={(e) => setConfig({ ...config, targetRoi: parseInt(e.target.value) })}
                          className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2.5 text-sm font-mono focus:border-blue-500 outline-none transition-colors"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 text-[10px] font-bold">%</span>
                      </div>
                      <p className="text-zinc-500 text-[10px] font-medium leading-relaxed">
                        The agent will prioritize strategies fulfilling this expected return on investment.
                      </p>
                    </div>

                    {/* Target Time */}
                    <div className="space-y-4">
                      <label className="text-sm font-bold text-zinc-100 block">Target Duration</label>
                      <div className="relative">
                        <input 
                          type="text" 
                          value={config.targetOutcomeTime}
                          onChange={(e) => setConfig({ ...config, targetOutcomeTime: e.target.value })}
                          className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2.5 text-sm font-mono focus:border-blue-500 outline-none transition-colors"
                        />
                      </div>
                      <p className="text-zinc-500 text-[10px] font-medium leading-relaxed">
                        Estimated timeframe to reach total profit outcome (e.g. "90 Days").
                      </p>
                    </div>
                  </div>

                  {/* Operating Path */}
                  <div className="space-y-4">
                    <label className="text-sm font-bold text-zinc-100 block">Execution Path</label>
                    <input 
                      type="text" 
                      value={config.operatingPath}
                      onChange={(e) => setConfig({ ...config, operatingPath: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-sm font-mono text-blue-400 focus:border-blue-500 outline-none transition-colors"
                    />
                    <p className="text-zinc-500 text-[10px] font-medium leading-relaxed">
                      Defines exactly where the agent is authorized to bridge and swap assets.
                    </p>
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
                <div className="p-8 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-300 max-w-4xl mx-auto overflow-y-auto max-h-full scrollbar-hidden">
                  
                  {/* Guide Header & Search */}
                  <div className="space-y-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="flex items-start gap-6">
                        <div className="p-4 bg-blue-500/10 text-blue-400 rounded-2xl shrink-0">
                          <BookOpen size={32} />
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-zinc-100 mb-1">Agent Knowledge Base</h2>
                          <p className="text-zinc-500 text-sm">
                            Master autonomous micro-earning and capital compounding.
                          </p>
                        </div>
                      </div>
                      
                      <div className="relative w-full md:w-72">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" />
                        <input 
                          type="text" 
                          placeholder="Search guides & FAQ..."
                          value={guideSearch}
                          onChange={(e) => setGuideSearch(e.target.value)}
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-zinc-600 focus:border-blue-500/50 outline-none transition-all"
                        />
                      </div>
                    </div>

                    {/* ROI & Path Logic (Hidden when searching FAQs to focus on results) */}
                    {!guideSearch && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-2xl space-y-4"
                      >
                        <div className="flex items-center gap-2 text-zinc-100 font-bold">
                          <Target size={18} className="text-emerald-500" />
                          <h3>ROI Tracking & Path Execution</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <p className="text-zinc-300 text-xs font-bold uppercase tracking-wider">Dynamic ROI Targets</p>
                            <p className="text-zinc-500 text-[11px] leading-relaxed">
                              Your agent calculates the expected Return on Investment for every operation. By setting a **Target ROI** in the config, you instruct the agent to skip low-yield opportunities regardless of priority.
                            </p>
                          </div>
                          <div className="space-y-2">
                            <p className="text-zinc-300 text-xs font-bold uppercase tracking-wider">Execution Paths</p>
                            <p className="text-zinc-500 text-[11px] leading-relaxed">
                              The **Execution Path** defines the allow-listed protocols (DEXs, Bridges, Markets) your agent is authorized to interaction with. This ensures your capital never enters unverified or high-risk contracts.
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>

                  {/* FAQ & Task Mastery Sections */}
                  <div className={cn(
                    "grid grid-cols-1 gap-12",
                    !guideSearch && "md:grid-cols-2"
                  )}>
                    
                    <div className="space-y-6">
                      <div className="flex items-center justify-between gap-2 text-zinc-100 font-bold">
                        <div className="flex items-center gap-2">
                          <Cpu size={18} className="text-blue-500" />
                          <h3>Frequently Asked Questions</h3>
                        </div>
                        <button 
                          onClick={() => setShowFaqs(!showFaqs)}
                          className="px-3 py-1.5 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-400 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest flex items-center gap-2"
                        >
                          {showFaqs ? "Hide FAQ" : "Show FAQ"}
                          <ChevronDown size={14} className={cn("transition-transform duration-300", showFaqs && "rotate-180")} />
                        </button>
                      </div>
                      
                      <AnimatePresence>
                        {showFaqs && (
                          <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-3 overflow-hidden"
                          >
                            {filteredFaqs.length > 0 ? (
                              filteredFaqs.map((faq, idx) => (
                                <div 
                                  key={idx}
                                  className="group border border-zinc-800 rounded-xl overflow-hidden transition-all duration-300 hover:border-zinc-700"
                                >
                                  <button 
                                    onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                                    className="w-full flex items-center justify-between p-4 text-left bg-zinc-900/20 hover:bg-zinc-900/40 transition-colors"
                                  >
                                    <span className={cn(
                                      "text-xs font-bold transition-colors",
                                      openFaqIndex === idx ? "text-blue-400" : "text-zinc-300 group-hover:text-zinc-100"
                                    )}>
                                      {faq.question}
                                    </span>
                                    <ChevronDown 
                                      size={16} 
                                      className={cn(
                                        "text-zinc-600 transition-transform duration-300",
                                        openFaqIndex === idx && "rotate-180 text-blue-400"
                                      )} 
                                    />
                                  </button>
                                  <AnimatePresence>
                                    {openFaqIndex === idx && (
                                      <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3, ease: "easeInOut" }}
                                      >
                                        <div className="p-4 pt-0 text-[11px] text-zinc-500 leading-relaxed bg-zinc-900/20">
                                          <div className="w-full h-px bg-zinc-800 mb-4 opacity-50" />
                                          {faq.answer}
                                        </div>
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </div>
                              ))
                            ) : (
                              <div className="p-8 text-center bg-zinc-900/20 border border-zinc-800 border-dashed rounded-xl">
                                <HelpCircle size={24} className="text-zinc-700 mx-auto mb-2" />
                                <p className="text-zinc-500 text-xs">No matching FAQ items found.</p>
                              </div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {!guideSearch && (
                      <div className="space-y-6">
                        <div className="flex items-center gap-2 text-zinc-100 font-bold">
                          <Zap size={18} className="text-amber-500" />
                          <h3>Task Mastery</h3>
                        </div>
                        <div className="space-y-4">
                          <div className="bg-zinc-900/30 border border-zinc-800 p-5 rounded-2xl group hover:border-amber-500/30 transition-colors">
                            <p className="text-zinc-300 text-xs font-bold mb-2 flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                              Priority Hierarchy
                            </p>
                            <p className="text-zinc-500 text-[11px] leading-relaxed">
                              Tasks are executed based on a blend of your manual priority list and the current **Risk Sensitivity**. High-risk agents will ignore "Low" priority safety checks to prioritize faster turnover.
                            </p>
                          </div>
                          <div className="bg-zinc-900/30 border border-zinc-800 p-5 rounded-2xl group hover:border-blue-500/30 transition-colors">
                            <p className="text-zinc-300 text-xs font-bold mb-2 flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                              The Unlocking Loop
                            </p>
                            <p className="text-zinc-500 text-[11px] leading-relaxed">
                              Certain task strategies (like Flash Loans) require a minimum balance to be capital-efficient. As your Balance grows, new modules become ACTIVE automatically.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* On-Chain Payments Section */}
                  <div className="bg-blue-600/5 border border-blue-500/20 rounded-2xl p-6 relative overflow-hidden">
                    <div className="flex items-center gap-2 text-blue-400 font-bold mb-4">
                      <Wallet size={18} />
                      <h3>On-Chain Security & Payments</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                      <div className="space-y-2">
                        <p className="text-zinc-100 text-xs font-bold">100% Non-Custodial</p>
                        <p className="text-zinc-500 text-[10px] leading-relaxed">We never store your private keys. Every payment interaction is initiated from your wallet and executed by the AI logic-shell.</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-zinc-100 text-xs font-bold">Base Gas Efficiency</p>
                        <p className="text-zinc-500 text-[10px] leading-relaxed">By operating on Base, transaction costs remain near zero ($0.01 or less), allowing micro-payouts to remain profitable.</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-zinc-100 text-xs font-bold">Automated Settlement</p>
                        <p className="text-zinc-500 text-[10px] leading-relaxed">Profits are settled in USDC to your dedicated agent vault. You can sweep these funds to your main wallet with a single click.</p>
                      </div>
                    </div>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-[60px] rounded-full -mr-16 -mt-16" />
                  </div>

                  {/* Help Footer */}
                  <div className="flex flex-col items-center justify-center pt-10 border-t border-zinc-800/50">
                    <div className="flex items-center gap-2 text-zinc-400 text-xs mb-2">
                      <HelpCircle size={14} />
                      <span>Advanced Configuration required?</span>
                    </div>
                    <p className="text-zinc-600 text-[11px] max-w-sm text-center">
                      For enterprise-grade agent clusters, consult our developer documentation or connect with a Strategist on Farcaster.
                    </p>
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
                {selectedTask.id === 'task-4' && (
                  <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 space-y-4">
                    <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
                      <TrendingUp size={14} />
                      Strategy Insight: Yield Optimization
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-zinc-500 text-[10px] uppercase font-bold mb-1">Target Protocols</p>
                        <div className="flex flex-wrap gap-x-2 gap-y-1">
                          <a href="https://app.morpho.org/?network=base" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 text-[11px] leading-relaxed font-mono underline decoration-blue-500/30">Morpho</a>
                          <span className="text-zinc-700 font-mono text-[11px]">/</span>
                          <a href="https://app.aave.com/markets/?marketName=proto_base_v3" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 text-[11px] leading-relaxed font-mono underline decoration-blue-500/30">Aave</a>
                          <span className="text-zinc-700 font-mono text-[11px]">/</span>
                          <a href="https://app.compound.finance/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 text-[11px] leading-relaxed font-mono underline decoration-blue-500/30">Compound</a>
                        </div>
                      </div>
                      <div>
                        <p className="text-zinc-500 text-[10px] uppercase font-bold mb-1">APY Tracking</p>
                        <a href="https://base.blockscout.com/" target="_blank" rel="noopener noreferrer" className="text-zinc-300 hover:text-zinc-100 text-[11px] leading-relaxed font-mono flex items-center gap-1 group">
                          Live Pulse (Base)
                          <ArrowUpRight size={10} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                        </a>
                      </div>
                    </div>
                    <div className="h-px bg-amber-500/10 w-full" />
                    <p className="text-zinc-400 text-[10px] leading-relaxed italic">
                      "The agent monitors lending utilization ratios across Base. When utilization exceeds 85% on Morpho, capital is automatically rebalanced to Aave to capture interest rate spikes while maintaining 100% liquidity."
                    </p>
                  </div>
                )}

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
