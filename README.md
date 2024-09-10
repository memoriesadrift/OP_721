# OP-721 Non-fungible Token Implementation
This repo serves as a reference implementation of an ERC-721 like NFT smart contract on OPNET.

## Known Issues
 - `ownerOf` returns a hash of the owner's address, due to storage concerns.
 - some methods have different signatures to ERC-721, requiring the callee to pass the token owner's address, since only address hashes are stored on chain.


