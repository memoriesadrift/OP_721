import { BaseContractProperty, BitcoinAddressLike, IOP_NETContract } from 'opnet';

export interface IOP_721Contract extends IOP_NETContract {
    name(): Promise<BaseContractProperty>;
    symbol(): Promise<BaseContractProperty>;
    tokenURI(tokenId: bigint): Promise<BaseContractProperty>;
    balanceOf(address: BitcoinAddressLike): Promise<BaseContractProperty>;
    ownerOf(tokenId: bigint): Promise<BaseContractProperty>;
    setApprovalForAll(operator: BitcoinAddressLike, to: boolean): Promise<BaseContractProperty>;
    isApprovedForAll(
        owner: BitcoinAddressLike,
        operator: BitcoinAddressLike,
    ): Promise<BaseContractProperty>;
    approve(
        to: BitcoinAddressLike,
        tokenId: bigint,
        passedOwner: BitcoinAddressLike,
    ): Promise<BaseContractProperty>;
    getApproved(tokenId: bigint): Promise<BaseContractProperty>;
    transferFrom(
        from: BitcoinAddressLike,
        to: BitcoinAddressLike,
        tokenId: bigint,
    ): Promise<BaseContractProperty>;
    mint(to: BitcoinAddressLike, tokenId: bigint): Promise<BaseContractProperty>;
    burn(from: BitcoinAddressLike, tokenId: bigint): Promise<BaseContractProperty>;
}
