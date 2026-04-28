import React, { useEffect } from 'react';
import { WagmiProvider, useAccount } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConnectKitProvider } from 'connectkit';
import { config, base } from './web3';
import { AaveAccountSdk } from '@aave/account';

const queryClient = new QueryClient();

export const Web3Provider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider 
          mode="dark"
          options={{
            initialChainId: base.id,
          }}
        >
          <AaveConnector>
            {children}
          </AaveConnector>
        </ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};

const AaveConnector: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isConnected, connector } = useAccount();

  useEffect(() => {
    const initAave = async () => {
      try {
        if (isConnected && connector) {
          const provider = await connector.getProvider();
          // The AaveAccountSdk needs to be connected to the EIP1193 provider
          await AaveAccountSdk.connect(provider as any);
        } else if (typeof window !== 'undefined' && (window as any).ethereum) {
          // Initialize with window.ethereum as fallback
          try {
            await AaveAccountSdk.connect((window as any).ethereum);
          } catch (e) {
            // Silently fail for lazy initialization
          }
        }
      } catch (error) {
        if (isConnected) {
          console.error("Failed to connect Aave Account SDK:", error);
        }
      }
    };

    initAave();
  }, [isConnected, connector]);

  return <>{children}</>;
};
