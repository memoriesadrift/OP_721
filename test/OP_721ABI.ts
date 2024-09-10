import { ABIDataTypes } from '@btc-vision/bsi-binary';
import { OP_NET_ABI, BitcoinAbiTypes, BitcoinInterfaceAbi } from 'opnet';

export const OP721Events = [
    {
        name: 'Mint',
        values: [
            {
                name: 'to',
                type: ABIDataTypes.ADDRESS,
            },
            {
                name: 'tokenId',
                type: ABIDataTypes.UINT256,
            },
        ],
        type: BitcoinAbiTypes.Event,
    },
    {
        name: 'Transfer',
        values: [
            {
                name: 'from',
                type: ABIDataTypes.ADDRESS,
            },
            {
                name: 'to',
                type: ABIDataTypes.ADDRESS,
            },
            {
                name: 'tokenId',
                type: ABIDataTypes.UINT256,
            },
        ],
        type: BitcoinAbiTypes.Event,
    },
    {
        name: 'Burn',
        values: [
            {
                name: 'tokenId',
                type: ABIDataTypes.UINT256,
            },
        ],
        type: BitcoinAbiTypes.Event,
    },
    {
        name: 'Approve',
        values: [
            {
                name: 'owner',
                type: ABIDataTypes.ADDRESS,
            },
            {
                name: 'spender',
                type: ABIDataTypes.ADDRESS,
            },
            {
                name: 'tokenId',
                type: ABIDataTypes.UINT256,
            },
        ],
        type: BitcoinAbiTypes.Event,
    },
    {
        name: 'ApprovalForAll',
        values: [
            {
                name: 'owner',
                type: ABIDataTypes.ADDRESS,
            },
            {
                name: 'operator',
                type: ABIDataTypes.ADDRESS,
            },
            {
                name: 'approved',
                type: ABIDataTypes.BOOL,
            },
        ],
        type: BitcoinAbiTypes.Event,
    },
];

export const OP_721_ABI: BitcoinInterfaceAbi = [
    {
        name: 'ownerOf',
        inputs: [
            {
                name: 'tokenId',
                type: ABIDataTypes.UINT256,
            },
        ],
        outputs: [
            {
                name: 'addressHash',
                type: ABIDataTypes.UINT256,
            },
        ],
        type: BitcoinAbiTypes.Function,
    },
    {
        name: 'balanceOf',
        inputs: [
            {
                name: 'owner',
                type: ABIDataTypes.ADDRESS,
            },
        ],
        outputs: [
            {
                name: 'balance',
                type: ABIDataTypes.UINT256,
            },
        ],
        type: BitcoinAbiTypes.Function,
    },
    {
        name: 'approve',
        inputs: [
            {
                name: 'spender',
                type: ABIDataTypes.ADDRESS,
            },
            {
                name: 'tokenId',
                type: ABIDataTypes.UINT256,
            },
        ],
        outputs: [],
        type: BitcoinAbiTypes.Function,
    },
    {
        name: 'getApproved',
        inputs: [
            {
                name: 'tokenId',
                type: ABIDataTypes.UINT256,
            },
        ],
        outputs: [
            {
                name: 'addressHash',
                type: ABIDataTypes.UINT256,
            },
        ],
        type: BitcoinAbiTypes.Function,
    },
    {
        name: 'setApprovalForAll',
        inputs: [
            {
                name: 'operator',
                type: ABIDataTypes.ADDRESS,
            },
            {
                name: 'approval',
                type: ABIDataTypes.BOOL,
            },
        ],
        outputs: [],
        type: BitcoinAbiTypes.Function,
    },
    {
        name: 'isApprovedForAll',
        inputs: [
            {
                name: 'owner',
                type: ABIDataTypes.ADDRESS,
            },
            {
                name: 'operator',
                type: ABIDataTypes.ADDRESS,
            },
        ],
        outputs: [
            {
                name: 'approved',
                type: ABIDataTypes.BOOL,
            },
        ],
        type: BitcoinAbiTypes.Function,
    },
    {
        name: 'transferFrom',
        inputs: [
            {
                name: 'from',
                type: ABIDataTypes.ADDRESS,
            },
            {
                name: 'to',
                type: ABIDataTypes.ADDRESS,
            },
            {
                name: 'tokenId',
                type: ABIDataTypes.UINT256,
            },
        ],
        outputs: [],
        type: BitcoinAbiTypes.Function,
    },
    {
        name: 'burn',
        inputs: [
            {
                name: 'from',
                type: ABIDataTypes.ADDRESS,
            },
            {
                name: 'tokenId',
                type: ABIDataTypes.UINT256,
            },
        ],
        outputs: [],
        type: BitcoinAbiTypes.Function,
    },
    {
        name: 'mint',
        inputs: [
            {
                name: 'to',
                type: ABIDataTypes.ADDRESS,
            },
            {
                name: 'tokenId',
                type: ABIDataTypes.UINT256,
            },
        ],
        outputs: [],
        type: BitcoinAbiTypes.Function,
    },
    {
        name: 'name',
        constant: true,
        inputs: [],
        outputs: [
            {
                name: 'name',
                type: ABIDataTypes.STRING,
            },
        ],
        type: BitcoinAbiTypes.Function,
    },
    {
        name: 'symbol',
        constant: true,
        inputs: [],
        outputs: [
            {
                name: 'symbol',
                type: ABIDataTypes.STRING,
            },
        ],
        type: BitcoinAbiTypes.Function,
    },
    {
        name: 'tokenURI',
        inputs: [
            {
                name: 'tokenId',
                type: ABIDataTypes.UINT256,
            },
        ],
        outputs: [
            {
                name: 'tokenURI',
                type: ABIDataTypes.STRING,
            },
        ],
        type: BitcoinAbiTypes.Function,
    },
    ...OP721Events,
    ...OP_NET_ABI,
];
