import { createPublicClient, http, type Chain } from 'viem';
import { foundry, megaeth, megaethTestnet } from 'viem/chains';

export const NETWORK_NAMES = ['local', 'testnet', 'mainnet'] as const;

export type NetworkName = (typeof NETWORK_NAMES)[number];

const chains: Record<NetworkName, Chain> = {
  local: foundry,
  testnet: megaethTestnet,
  mainnet: megaeth,
};

export interface NetworkConfig {
  name: NetworkName;
  chain: Chain;
  rpcUrl: string;
  usesCustomRpc: boolean;
}

export function resolveNetwork(network?: string, customRpcUrl?: string): NetworkConfig {
  const name = network ?? 'local';

  if (!NETWORK_NAMES.includes(name as NetworkName)) {
    throw new Error(
      `Invalid network '${name}'. Expected one of: ${NETWORK_NAMES.join(', ')}.`,
    );
  }

  const chain = chains[name as NetworkName];

  return {
    name: name as NetworkName,
    chain,
    rpcUrl: customRpcUrl ?? chain.rpcUrls.default.http[0],
    usesCustomRpc: customRpcUrl !== undefined,
  };
}

export async function validateCustomRpc(config: NetworkConfig): Promise<void> {
  if (!config.usesCustomRpc) return;

  const client = createPublicClient({
    chain: config.chain,
    transport: http(config.rpcUrl),
  });
  const actualChainId = await client.getChainId();

  if (actualChainId !== config.chain.id) {
    throw new Error(
      `RPC chain ID mismatch: --network ${config.name} expects ${config.chain.id}, but ${config.rpcUrl} returned ${actualChainId}.`,
    );
  }
}
