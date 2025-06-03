// import { type ReactNode } from 'react';
// import { WagmiProvider, createConfig, http } from 'wagmi';
// import { mainnet, sepolia } from 'wagmi/chains';
// import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// import { injected } from 'wagmi/connectors';

// // Create wagmi config
// const config = createConfig({
//   chains: [mainnet, sepolia],
//   connectors: [
//     injected(),
//   ],
//   transports: {
//     [mainnet.id]: http(),
//     [sepolia.id]: http(),
//   },
// });

// // Create a client for react-query
// const queryClient = new QueryClient();

// interface Web3ProviderProps {
//   children: ReactNode;
// }

// export function Web3Provider({ children }: Web3ProviderProps) {
//   return (
//     <WagmiProvider config={config}>
//       <QueryClientProvider client={queryClient}>
//         {children}
//       </QueryClientProvider>
//     </WagmiProvider>
//   );
// } 