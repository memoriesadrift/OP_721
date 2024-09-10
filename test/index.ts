import { getContract, JSONRpcProvider } from 'opnet';
import { IOP_721Contract } from './OP_721Contract.ts';
import { OP_721_ABI } from './OP_721ABI.ts';

const senderAddress: string = 'bcrt1pusperpqzv687gzs3l8eues5rxjx62ukqt4mljvfw3hr6gavjtv3qsk4lrf';
const provider: JSONRpcProvider = new JSONRpcProvider('https://regtest.opnet.org');
const contract: IOP_721Contract = getContract<IOP_721Contract>(
    'bcrt1q2x8sffuc53vf9dgdz23qdzv0cjqsrgcj8cd7m7', // Sample OP-721 Contract on Regtest
    OP_721_ABI,
    provider,
    senderAddress,
);

const contractCall = await contract.name();

if ('error' in contractCall) {
    console.log('Contract error', contractCall.error);
} else {
    console.log('Call result:', contractCall.properties);
}
