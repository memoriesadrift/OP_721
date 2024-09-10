import { DeployableOP_721 } from './DeployableOP_721';
import { OP721InitParameters } from './interfaces/OP721InitParameters';

/**
 * This contract is intended to be used by developers wanting to extend OP\_721 and use it to create their own NFT contracts.
 *
 * By default, OP\_721 includes the OP\_721\_Metadata extension, same as ERC\_721.
 */
export abstract class OP_721 extends DeployableOP_721 {
    protected constructor(name: string, symbol: string) {
        super(new OP721InitParameters(name, symbol));
    }
}
