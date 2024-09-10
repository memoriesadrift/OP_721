import { Address, bytes32, Sha256 } from '@btc-vision/btc-runtime/runtime';
import { u256 } from 'as-bignum/assembly';

/**
 * Hashes an `Address` with SHA256 to make it storable as `u256`
 * Uses the same hashing method as `encodePointer` from `@btc-vision/btc-runtime`
 *
 * [Permalink](https://github.com/btc-vision/btc-runtime/blob/2ab2144aeb89c1826b8579813fb51f0e6c49255f/runtime/math/abi.ts#L16)
 */
export const hashAddress = (addr: Address): u256 => {
    const buffer = Uint8Array.wrap(String.UTF8.encode(addr));
    const hash = Sha256.hash(buffer);

    return bytes32(hash);
};
