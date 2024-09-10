import { IOP_721 } from './interfaces/IOP_721';
import {
    Address,
    MemorySlotData,
    AddressMemoryMap,
    ApproveEvent,
    Blockchain,
    BytesWriter,
    Calldata,
    MultiAddressMemoryMap,
    OP_NET,
    Revert,
    Selector,
    StoredString,
    TransferEvent,
    encodeSelector,
    SafeMath,
    BurnEvent,
    MintEvent,
} from '@btc-vision/btc-runtime/runtime';
import { u256 } from 'as-bignum/assembly';
import { OP721InitParameters } from './interfaces/OP721InitParameters';
import { hashAddress } from './utils/hash';
import { ApprovalForAllEvent } from './events/ApprovalForAllEvent';
import { IOP_721_Metadata } from './interfaces/IOP_721_Metadata';

type SerializedTokenId = string;
type AddressHash = u256;

const ZERO_ADDRESS: Address = '0';

const ownersMapPointer: u16 = Blockchain.nextPointer;
const balancesMapPointer: u16 = Blockchain.nextPointer;
const tokenApprovalsMapPointer: u16 = Blockchain.nextPointer;
const operatorApprovalsMapPointer: u16 = Blockchain.nextPointer;
const namePointer: u16 = Blockchain.nextPointer;
const symbolPointer: u16 = Blockchain.nextPointer;

export abstract class DeployableOP_721 extends OP_NET implements IOP_721, IOP_721_Metadata {
    // Owners of any given NFT from the collection.
    // NOTE: As far as I can tell, there are no generic mappings in OPNET as of yet,
    // save for implementing them by oneself. For this small assignment, I'm forgoing that,
    // but it would be a great first issue to improve OPNET.
    // _owners should be of type `mapping(u256 => Address)` but `AddressMemoryMap` only
    // supports string type keys and u256 type values, which we want the exact opposite of here.
    // Since the functionality of ERC-721 only needs the owner map for checking that only the
    // owner of a token can execute certain functions, storing the hash is technically sufficient,
    // though desirable to be extended.
    protected readonly _owners: AddressMemoryMap<SerializedTokenId, MemorySlotData<u256>>;

    // The amount of NFTs from this collection owned by any given address.
    protected readonly _balances: AddressMemoryMap<Address, MemorySlotData<u256>>;

    // Which addresses are approved to operate on each NFT in the collection
    protected readonly _tokenApprovals: AddressMemoryMap<SerializedTokenId, MemorySlotData<u256>>;

    // Map of owners and operators given approval to act on their NFTs of this collection.
    // Operators can act on ALL NFTs of this collection owned by a given owner.
    // the mapping is Owner => Operator => isApproved (true/false)
    // Since booleans are stored as u256.Zero / u256.One on chain, we use u256 here.
    protected readonly _operatorApprovals: MultiAddressMemoryMap<
        Address,
        Address,
        MemorySlotData<u256>
    >;

    protected readonly _name: StoredString;
    protected readonly _symbol: StoredString;

    protected constructor(params: OP721InitParameters | null = null) {
        super();

        this._owners = new AddressMemoryMap(ownersMapPointer, u256.Zero);
        this._balances = new AddressMemoryMap(balancesMapPointer, u256.Zero);
        this._tokenApprovals = new AddressMemoryMap(tokenApprovalsMapPointer, u256.Zero);
        this._operatorApprovals = new MultiAddressMemoryMap(operatorApprovalsMapPointer, u256.Zero);
        this._name = new StoredString(namePointer, '');
        this._symbol = new StoredString(symbolPointer, '');

        if (params && this._name.value === '') {
            this.instantiate(params, true);
        }
    }

    public instantiate(params: OP721InitParameters, skipOwnerVerification: boolean = false): void {
        if (this._name.value.length > 0) {
            throw new Revert('Already initialized.');
        }
        if (!skipOwnerVerification) this.onlyOwner(Blockchain.origin);

        this._name.value = params.name;
        this._symbol.value = params.symbol;
    }

    public get name(): string {
        if (!this._name) throw new Revert('Name not set');

        return this._name.value;
    }

    public get symbol(): string {
        if (!this._symbol) throw new Revert('Symbol not set');

        return this._symbol.value;
    }

    /**
     * Returns the unique URI associated with the given tokenId
     *
     * @param {Calldata} callData with a single `u256` tokenId whose URI is to be returned.
     *
     * @throws `Revert`s if the tokenId isn't owned by anyone, i.e. it's burned or not minted yet.
     *
     * @returns `BytesWriter` writes the URI to a `BytesWriter`.
     * */
    public tokenURI(callData: Calldata): BytesWriter {
        const response = new BytesWriter();
        const tokenId = callData.readU256();

        this._requireOwned(tokenId);

        const baseUri = this.baseUri();

        const uri = baseUri.length > 0 ? `${baseUri}${tokenId.toString()}` : tokenId.toString();

        response.writeStringWithLength(uri);
        return response;
    }

    /**
     * Returns the amount of NFTs of this collection owned by the provided `Address`.
     *
     * @param {Calldata} callData with a single `Address` to query.
     *
     * @returns `BytesWriter` writes the balance to a `BytesWriter`.
     * */
    public balanceOf(callData: Calldata): BytesWriter {
        const response = new BytesWriter();
        const address = callData.readAddress();
        const balance = this._balances.get(address);

        response.writeU256(balance);

        return response;
    }

    /**
     * Returns the hash of the address of the owner of a given NFT in this collection.
     *
     * @param {Calldata} callData with a single `u256` tokenId to query.
     *
     * @returns `BytesWriter` writes the `u256` SHA256 hash of the address of the owner to a `BytesWriter`.
     *
     * WARN: This returns a SHA256 hash of the owner's address due to technical limitations,
     * see top of file for more info
     * */
    public ownerOf(callData: Calldata): BytesWriter {
        const response = new BytesWriter();
        const tokenId = callData.readU256();
        const ownerHash = this._requireOwned(tokenId);
        response.writeU256(ownerHash);

        return response;
    }

    /**
     * Sets an approval for a given `Address` to manage or no longer manage the callee's NFTs of this collection.
     * Emits an `ApprovalForAllEvent` on success.
     *
     * @param {Calldata} callData with an `Address` of the operator and a `boolean` of the approval status (allowed/disallowed).
     *
     * @throws `Revert`s if the operator is an invalid address (zero address).
     *
     * @returns `BytesWriter` - nothing written.
     * */
    public setApprovalForAll(callData: Calldata): BytesWriter {
        const response = new BytesWriter();
        const operator = callData.readAddress();
        const to = callData.readBoolean();
        const callee = Blockchain.origin;

        this._setApprovalForAll(callee, operator, to);
        this.createApprovalForAllEvent(callee, operator, to);

        return response;
    }

    /**
     * Returns whether or not the provided operator can manage the provided owner's assets.
     *
     * @param {Calldata} callData with the NFT owner's `Address` and the operator's `Address`.
     *
     * @returns `BytesWriter` writes a `boolean` of whether `operator` can act on `owner`'s assets.
     * */
    public isApprovedForAll(callData: Calldata): BytesWriter {
        const response = new BytesWriter();
        const owner = callData.readAddress();
        const operator = callData.readAddress();

        const approvalsMap = this._operatorApprovals.get(owner);
        const approvalUint = approvalsMap.get(operator);
        const approval = approvalUint === u256.Zero ? false : true;

        response.writeBoolean(approval);

        return response;
    }

    /**
     * Sets an approval for a given `Address` to operate on the callee's given `u256` tokenId NFT .
     * Emits an `ApproveEvent` on success.
     *
     * @param {Calldata} callData with an `Address` to be approved, the `u256` tokenId of the NFT and the `Address` of the NFT's owner.
     *
     * @throws `Revert`s if the approval is invalid, for example if the passed owner `Address` and the NFT's stored owner don't match, the NFT doesn't exist or isn't owned by the callee.
     *
     * @returns `BytesWriter` - nothing written.
     *
     * NOTE: There is an extra parameter from the ERC standard, as we store address hashes and need to check the owner address against the hash.
     * */
    public approve(callData: Calldata): BytesWriter {
        const response = new BytesWriter();
        const to = callData.readAddress();
        const tokenId = callData.readU256();
        const passedOwner = callData.readAddress();

        const callee = Blockchain.origin;

        const fetchedOwnerAddressHash = this._requireOwned(tokenId);

        if (fetchedOwnerAddressHash !== hashAddress(passedOwner)) {
            throw new Revert('Incorrect owner passed.');
        }

        const owner = callee === passedOwner ? callee : passedOwner;

        this._approve(owner, callee, to, tokenId);
        this.createApprovalEvent(owner, to, tokenId);

        return response;
    }

    /**
     * Returns the hash of the `Address` approved to manage the given `u256` tokenId NFT.
     *
     * @param {Calldata} callData with the `u256` tokenId to query.
     *
     * @returns `BytesWriter` writes a `u256` SHA256 hash of the `Address` approved to manage the given NFT.
     *
     * NOTE: due to technical limitations, returns a hash of the approved address
     * */
    public getApproved(callData: Calldata): BytesWriter {
        const response = new BytesWriter();
        const tokenId = callData.readU256();

        response.writeU256(this._getApproved(tokenId));

        return response;
    }

    /**
     * Transfers an NFT with the provided `u256` tokenId from one `Address` to another.
     *
     * Emits a `TransferEvent` on success.
     *
     * @param {Calldata} callData with an `Address` to transfer from, an `Address` to transfer to and the `u256` tokenId to transfer.
     *
     * @throws `Revert`s if the transfer is invalid, such as nonexistent NFT, insufficient permissions or invalid destination address.
     *
     * @returns `BytesWriter` - nothing written.
     * */
    public transferFrom(callData: Calldata): BytesWriter {
        const response = new BytesWriter();
        const from = callData.readAddress();
        const to = callData.readAddress();
        const tokenId = callData.readU256();
        const callee = Blockchain.origin;

        const fetchedOwnerAddressHash = this._requireOwned(tokenId);

        if (fetchedOwnerAddressHash !== hashAddress(from)) {
            throw new Revert('Incorrect owner passed.');
        }

        this._transfer(from, to, tokenId, callee);

        this.createTransferEvent(from, to, tokenId);

        return response;
    }

    /**
     * Mints an NFT with the given `u256` tokenId to the provided `Address`.
     *
     * Emits a `MintEvent` on success.
     *
     * @param {Calldata} callData with an `Address` to mint to and the `u256` tokenId to mint.
     *
     * @throws `Revert`s if not called by the contract owner or if an NFT with the provided tokenId already exists.
     *
     * @returns `BytesWriter` - nothing written.
     * */
    public mint(callData: Calldata): BytesWriter {
        const response = new BytesWriter();
        const to = callData.readAddress();
        const tokenId = callData.readU256();

        this.onlyOwner(Blockchain.origin);

        this._mint(to, tokenId);
        this.createMintEvent(to, tokenId);

        return response;
    }

    /**
     * Burns an NFT with the given `u256` tokenId.
     *
     * Emits a `BurnEvent` on success.
     *
     * @param {Calldata} callData with an `Address` to burn from and the `u256` tokenId to burn.
     *
     * @throws `Revert`s if not called by the contract owner or if an NFT with the provided tokenId doesn't exist.
     *
     * @returns `BytesWriter` - nothing written.
     *
     * WARN: due to technical limitations, the owner of the asset has to be passed. This is not a good idea and should be remedied in the future.
     * NOTE: If desirable, this method can be changed to only allow an asset's owner to burn a token instead of the admin / contract owner.
     * */
    public burn(callData: Calldata): BytesWriter {
        const response = new BytesWriter();
        const from = callData.readAddress();
        const tokenId = callData.readU256();

        this.onlyOwner(Blockchain.origin);

        this._burn(from, tokenId);
        this.createBurnEvent(tokenId);
        return response;
    }

    // Private helper functions
    private _approve(owner: Address, spender: Address, to: Address, tokenId: u256): void {
        const fetchedOwnerAddressHash = this._requireOwned(tokenId);
        if (
            spender != ZERO_ADDRESS &&
            (fetchedOwnerAddressHash !== hashAddress(owner) ||
                !this._isApprovedForAll(owner, spender))
        ) {
            throw new Revert('Invalid approver.');
        }

        this._tokenApprovals.set(tokenId.toString(), hashAddress(to));
    }

    private _setApprovalForAll(owner: Address, operator: Address, to: boolean): void {
        if (operator === ZERO_ADDRESS) {
            throw new Revert('Invalid operator.');
        }
        const operatorApproval = this._operatorApprovals.get(owner);
        const toUint = to ? u256.One : u256.Zero;
        operatorApproval.set(operator, toUint);
    }

    private _transfer(from: Address, to: Address, tokenId: u256, callee: Address): void {
        if (!this._isAuthorized(from, callee, tokenId)) {
            throw new Revert('Not authorized to transfer this token.');
        }

        if (to === ZERO_ADDRESS) {
            throw new Revert('Invalid transfer recipient.');
        }

        this._update(from, to, tokenId);
    }

    private _mint(to: Address, tokenId: u256): void {
        if (to === ZERO_ADDRESS) {
            throw new Revert('Invalid mint recipient.');
        }

        if (this._owners.get(tokenId.toString()) != u256.Zero) {
            throw new Revert('Token already exists.');
        }

        this._update(ZERO_ADDRESS, to, tokenId);
    }

    private _burn(from: Address, tokenId: u256): void {
        const fetchedOwnerAddressHash = this._owners.get(tokenId.toString());
        if (hashAddress(from) !== fetchedOwnerAddressHash) {
            throw new Revert('Incorrect from address.');
        }

        if (fetchedOwnerAddressHash == u256.Zero) {
            throw new Revert('Nonexistent token.');
        }

        this._update(from, ZERO_ADDRESS, tokenId);
    }

    /**
     * General balance updating function that handles minting, burning and transferring NFTs.
     */
    private _update(from: Address, to: Address, tokenId: u256): void {
        if (from !== ZERO_ADDRESS) {
            // Clear approval
            this._approve(ZERO_ADDRESS, ZERO_ADDRESS, ZERO_ADDRESS, tokenId);

            const prevBalance = this._balances.get(from);
            this._balances.set(from, SafeMath.sub(prevBalance, u256.One));
        }

        if (to !== ZERO_ADDRESS) {
            const prevBalance = this._balances.get(to);
            this._balances.set(from, SafeMath.add(prevBalance, u256.One));
        }

        this._owners.set(tokenId.toString(), hashAddress(to));
    }

    private _isAuthorized(owner: Address, spender: Address, tokenId: u256): boolean {
        return (
            owner == spender ||
            this._isApprovedForAll(owner, spender) ||
            this._getApproved(tokenId) == hashAddress(spender)
        );
    }

    private _isApprovedForAll(owner: Address, operator: Address): boolean {
        return this._operatorApprovals.get(owner).get(operator) == u256.One;
    }

    private _getApproved(tokenId: u256): AddressHash {
        return this._tokenApprovals.get(tokenId.toString());
    }

    /**
     * Reverts if the token has no owner, i.e. it hasn't been minted yet or has been burned.
     *
     * @returns {AddressHash} the hash of the NFT owner's address.
     */
    private _requireOwned(tokenId: u256): AddressHash {
        const ownerHash = this._ownerOf(tokenId);
        if (ownerHash == u256.Zero) {
            throw new Revert('Nonexistent token.');
        }

        return ownerHash;
    }

    private _ownerOf(tokenId: u256): AddressHash {
        const serializedTokenId = tokenId.toString();

        const ownerHash = this._owners.get(serializedTokenId);

        return ownerHash;
    }

    // NOTE: This should be overriden with a useful string in the final deployed contract.
    protected baseUri(): string {
        return '';
    }

    public callMethod(method: Selector, calldata: Calldata): BytesWriter {
        switch (method) {
            case encodeSelector('balanceOf'):
                return this.balanceOf(calldata);
            case encodeSelector('ownerOf'):
                return this.ownerOf(calldata);
            case encodeSelector('transferFrom'):
                return this.transferFrom(calldata);
            case encodeSelector('approve'):
                return this.approve(calldata);
            case encodeSelector('getApproved'):
                return this.getApproved(calldata);
            case encodeSelector('setApprovalForAll'):
                return this.setApprovalForAll(calldata);
            case encodeSelector('isApprovedForAll'):
                return this.isApprovedForAll(calldata);
            case encodeSelector('burn'):
                return this.burn(calldata);
            case encodeSelector('mint'):
                return this.mint(calldata);
            case encodeSelector('tokenURI'):
                return this.tokenURI(calldata);
            default:
                return super.callMethod(method, calldata);
        }
    }

    public callView(method: Selector): BytesWriter {
        const response = new BytesWriter();

        switch (method) {
            case encodeSelector('name'):
                response.writeStringWithLength(this.name);
                break;
            case encodeSelector('symbol'):
                response.writeStringWithLength(this.symbol);
                break;
            default:
                return super.callView(method);
        }

        return response;
    }

    protected createApprovalEvent(owner: Address, spender: Address, tokenId: u256): void {
        const approveEvent = new ApproveEvent(owner, spender, tokenId);

        this.emitEvent(approveEvent);
    }

    protected createApprovalForAllEvent(
        owner: Address,
        operator: Address,
        approved: boolean,
    ): void {
        const approvalEvent = new ApprovalForAllEvent(owner, operator, approved);

        this.emitEvent(approvalEvent);
    }

    protected createTransferEvent(from: Address, to: Address, tokenId: u256): void {
        const transferEvent = new TransferEvent(from, to, tokenId);

        this.emitEvent(transferEvent);
    }

    protected createBurnEvent(tokenId: u256): void {
        const burnEvent = new BurnEvent(tokenId);

        this.emitEvent(burnEvent);
    }

    protected createMintEvent(owner: Address, tokenId: u256): void {
        const mintEvent = new MintEvent(owner, tokenId);

        this.emitEvent(mintEvent);
    }
}
