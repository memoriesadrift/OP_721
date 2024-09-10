import { OP_721 } from './OP_721';

/**
 * An example of how the OP\_721 contract can be used to create NFTs on OPNET.
 */
@final
export class MyNFT extends OP_721 {
    constructor() {
        const name = 'Bored Bitcoin Baboons';
        const symbol = 'BBB';

        super(name, symbol);
    }

    public onInstantiated(): void {
        if (!this.isInstantiated) {
            super.onInstantiated();
        }
    }

    // Overriding baseUri with a base link shared by all nfts
    protected override baseUri(): string {
        return 'https://bored-bitcoin-baboons.club/nft/';
    }
}
