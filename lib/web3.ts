import { createConfig, http } from 'wagmi';
import { base } from 'wagmi/chains';
export { base };
import { getDefaultConfig } from 'connectkit';

// We'll use a public transport for demo purposes. 
// For production, the user would provide their own Alchemy/Infura key.
export const config = createConfig(
  getDefaultConfig({
    // Your WalletConnect Project ID
    walletConnectProjectId: "0785f7f32997e0fac47ed6e297a7605d", // Public placeholder or user's key
    appName: "Ten to One Million",
    chains: [base],
    transports: {
      [base.id]: http(),
    },
  })
);

export const USDC_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"; // Base native USDC
export const ERC20_ABI = [
  {
    name: 'transfer',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'recipient', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: 'balance', type: 'uint256' }],
  },
  {
      name: 'decimals',
      type: 'function',
      stateMutability: 'view',
      inputs: [],
      outputs: [{ name: '', type: 'uint8' }],
  }
] as const;
