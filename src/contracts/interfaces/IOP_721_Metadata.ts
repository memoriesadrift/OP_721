import { BytesWriter, Calldata } from '@btc-vision/btc-runtime/runtime';

/**
 * Optional Metadata Extension for OP\_721.
 * */
export interface IOP_721_Metadata {
    name: string;
    symbol: string;
    tokenURI(calldata: Calldata): BytesWriter;
}
