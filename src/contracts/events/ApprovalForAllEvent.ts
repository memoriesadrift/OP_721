import { Address, BytesWriter, NetEvent } from '@btc-vision/btc-runtime/runtime';

@final
export class ApprovalForAllEvent extends NetEvent {
    constructor(owner: Address, operator: Address, approved: boolean) {
        const data: BytesWriter = new BytesWriter(1, true);
        data.writeAddress(owner);
        data.writeAddress(operator);
        data.writeBoolean(approved);

        super('Approval for All', data);
    }
}
