import { ABIRegistry, Blockchain } from "@btc-vision/btc-runtime/runtime";
import { MyNFT } from "./contracts/ExampleNft";

export function defineSelectors(): void {
  /** OP_NET */
  ABIRegistry.defineGetterSelector("address", false);
  ABIRegistry.defineGetterSelector("owner", false);
  ABIRegistry.defineMethodSelector("isAddressOwner", false);

  /** OP_721 */
  ABIRegistry.defineMethodSelector("tokenURI", false);
  ABIRegistry.defineMethodSelector("balanceOf", false);
  ABIRegistry.defineMethodSelector("ownerOf", true);
  ABIRegistry.defineMethodSelector("getApproved", false);
  ABIRegistry.defineMethodSelector("isApprovedForAll", false);
  ABIRegistry.defineMethodSelector("burn", true);
  ABIRegistry.defineMethodSelector("mint", true);
  ABIRegistry.defineMethodSelector("transferFrom", true);
  ABIRegistry.defineMethodSelector("approve", true);
  ABIRegistry.defineMethodSelector("setApprovedForAll", true);

  ABIRegistry.defineGetterSelector("name", false);
  ABIRegistry.defineGetterSelector("symbol", false);
}

// DO NOT TOUCH TO THIS.
Blockchain.contract = () => {
  // ONLY CHANGE THE CONTRACT CLASS NAME.
  const contract = new MyNFT();
  contract.onInstantiated();

  // DO NOT ADD CUSTOM LOGIC HERE.

  return contract;
};

// VERY IMPORTANT
export * from "@btc-vision/btc-runtime/runtime/exports";
