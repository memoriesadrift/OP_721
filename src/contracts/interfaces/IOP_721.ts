import { BytesWriter, Calldata } from '@btc-vision/btc-runtime/runtime';

/**
 * Minimal OP\_721 Interface.
 * */
export interface IOP_721 {
    balanceOf(callData: Calldata): BytesWriter;

    ownerOf(callData: Calldata): BytesWriter;

    transferFrom(callData: Calldata): BytesWriter;

    approve(callData: Calldata): BytesWriter;

    getApproved(callData: Calldata): BytesWriter;

    setApprovalForAll(callData: Calldata): BytesWriter;

    isApprovedForAll(callData: Calldata): BytesWriter;
}
