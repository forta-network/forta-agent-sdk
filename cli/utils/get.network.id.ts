import { providers } from "ethers";
import { assertExists } from ".";
import { WithRetry } from "./with.retry";

// returns the network/chain id as reported by the "net_version" json-rpc method
export type GetNetworkId = () => Promise<number>;

export default function provideGetNetworkId(
  withRetry: WithRetry,
  ethersProvider: providers.JsonRpcProvider
) {
  assertExists(withRetry, "withRetry");
  assertExists(ethersProvider, "ethersProvider");

  return async function getNetworkId() {
    const networkId: string = await withRetry(
      ethersProvider.send.bind(ethersProvider), // need to bind() so that "this" is defined
      ["net_version", []]
    );
    return parseInt(networkId);
  };
}
