import {toast} from '@backpackapp-io/react-native-toast';
import {Platform} from 'react-native';
import NfcManager, {NfcTech} from 'react-native-nfc-manager';
import Recipe from "@/library/Recipe";

global.Buffer = require('buffer').Buffer;

type NfcSystemInfo = {
    afi: number;
    blockSize: number;
    blockCount: number;
    dsfid: number;
};

class NFC {
    private isClosed = true;

    constructor() {
    }

    async init() {
        try {
            await NfcManager.start();
        } catch (ex) {
            console.error('NFC Manager failed to start', ex);
        }
    }

    async readHash(): Promise<number[] | null> {
        return this.readMultipleBlocks(34, 0, 8);
    }

    public getIsClosed() {
        return this.isClosed;
    }


    async close() {
        await NfcManager.cancelTechnologyRequest();
        this.isClosed = true;
    }

    async open() {
        if (Platform.OS === 'ios') {
            console.log("Requesting Iso15693");
            await NfcManager.requestTechnology(NfcTech.Iso15693IOS);
        } else {
            console.log("Requesting NfcV");
            await NfcManager.requestTechnology(NfcTech.NfcV);
        }
        this.isClosed = false;
    }

    async getUID(): Promise<number[] | null> {
        let tag = await NfcManager.getTag();
        if (tag && tag.id) {
            const idBytes: string[] = tag.id
                .split(/(..)/g)
                .filter(s => s);
            let tagArray: number[] = [];
            idBytes.forEach((val, i, a) => tagArray.push(parseInt(val, 16)));
            return tagArray;
        }
        return null;
    }


    async getSystemInfo(): Promise<NfcSystemInfo | null> {
        if (Platform.OS === 'ios') {
            return await NfcManager.iso15693HandlerIOS.getSystemInfo(34);
        } else {
            let uid = await this.getUID();

            if (uid && uid.length > 0) {
                let sysInfo: NfcSystemInfo = {afi: -1, blockSize: -1, blockCount: -1, dsfid: -1};
                let resp = await NfcManager.nfcVHandler.transceive([0x22, 0x2B, ...uid]);
                sysInfo.blockCount = resp[12] + 1;
                sysInfo.blockSize = resp[13] + 1;
                sysInfo.afi = resp[11];
                sysInfo.dsfid = resp[10];
                console.log("SysInfo:" + JSON.stringify(sysInfo));

                return sysInfo;
            }
            //return await NfcManager.nfcVHandler.transceive([0x22, 0x2B,...idBytes,0]);
        }
        return null;

    }


    async readMultipleBlocks(flags: number, blockNumber: number, blockCount: number): Promise<number[] | null> {
        if (Platform.OS === 'ios') {
            let data = await NfcManager.iso15693HandlerIOS.readMultipleBlocks({
                flags:      flags,
                blockNumber: blockNumber,
                blockCount: blockCount
            });
            let flattenedData: number[] = []
            if (data) {
                for (let i = 0; i < data.length; i++) {
                    for (let j = 0; j < data[i].length; j++) {
                        flattenedData[(i * 4) + j] = data[i][j] //@TODO this 4 should be set to block size
                    }
                }
                console.log(JSON.stringify(flattenedData));
                return flattenedData;
            }
        } else {
            let uid = await this.getUID();
            if (uid && uid.length > 0) {
                console.log("Reading Multiple Blocks");
                console.log("Flags:" + flags);
                console.log("UID:" + Recipe.convertNumberArrayToHex(uid));
                console.log("BlockNumber:" + blockNumber);
                console.log("BlockCount:" + blockCount);

                let resp: number[] = await NfcManager.nfcVHandler.transceive([flags, 0x23, ...uid, blockNumber, blockCount - 1]);

                if (resp && resp.length && resp.length > 0 && resp[0] == 0) {
                    resp.splice(0, 1);
                    console.log(Recipe.convertNumberArrayToHex(resp));
                    return resp;
                } else {
                    console.log("Fallback: card doesn't support 0x23 (READ MULTIPLE BLOCKS), using 0x20 (READ SINGLE BLOCK) in a loop...");
                    // ---------- fallback: READ SINGLE BLOCK (0x20) in a loop ----------
                    const data: number[] = [];
                    for (let i = 0; i < blockCount; i++) {
                        const bn = blockNumber + i;
                        const singleCmd = [flags, 0x20, ...uid, bn];   // 0x20 = Read Single Block
                        let resp: number[] = await NfcManager.nfcVHandler.transceive(singleCmd);

                        if (!resp?.length || resp[0] !== 0x00) {
                            throw new Error(`Read failed at block ${bn} (status 0x${resp?.[0]?.toString(16) ?? '??'})`);
                        }
                        data.push(...resp.slice(1));  // append block payload
                    }
                    console.log(Recipe.convertNumberArrayToHex(data));
                    return data;
                }
            }
        }
        return null;
    }

    async readCard(progressCallBack: (progress: number, id?: string) => Promise<string | undefined>): Promise<number[] | null> {
        try {
            let sysInfo = await this.getSystemInfo();
            await progressCallBack(30);
            console.log(sysInfo);
            const nfcTag = await NfcManager.getTag();
            await progressCallBack(50);
            console.log(nfcTag);
            if (nfcTag && sysInfo) {
                const data = await this.readMultipleBlocks(34, 0, sysInfo.blockCount);
                await progressCallBack(80);
                if (data) {
                    return data
                }
            }
            return null;
        } catch (e) {
            if (!this.isClosed) {
                throw e;
            }
            return null;
        }
    }

    async writeSingleBlock(flags: number, blockNumber: number, dataBlock: number[]): Promise<void> {
        if (Platform.OS === 'ios') {
            await NfcManager.iso15693HandlerIOS.writeSingleBlock({
                flags:     flags,
                blockNumber: blockNumber,
                dataBlock: dataBlock
            })
        } else {
            let uid = await this.getUID();
            if (uid && uid.length > 0) {
                let resp: number[] = await NfcManager.nfcVHandler.transceive([flags, 0x21, ...uid, blockNumber, ...dataBlock]);
            }
        }
    }

    async writeBlocks(startBlock: number, data: number[], progressCallBack: (progress: number, id?: string) => Promise<string | undefined>) {
        try {
            let i = 0;
            let blockNum = startBlock;

            const id = await progressCallBack((i / data.length) * 100);
            if (id || Platform.OS !== "ios") {

                while (i < data.length) {

                    let fourByteData = data.slice(i, i + 4);
                    console.log(JSON.stringify(fourByteData));
                    console.log("Blocknum:" + blockNum);

                    await this.writeSingleBlock(34, blockNum, fourByteData)

                    await progressCallBack(Math.round((i / data.length) * 100), id);

                    i += 4;
                    blockNum++;

                }
                await progressCallBack(100, id);
            }

        } catch (e) {
            console.log(e);
            if (Platform.OS === "ios") {
                toast.dismiss();
                toast("Error writing to card", {styles: {view: {backgroundColor: 'red'}}});
            }
            throw e;
        }

    }

    async writeCard(data: number[], progressCallBack: (progress: number, id?: string) => Promise<string | undefined>) {
        //await NfcManager.requestTechnology(NfcTech.Iso15693IOS);
        try {
            let info = await this.getSystemInfo();
            if (info) {
                let totalBlocks = info.blockCount * info.blockSize;
                let availableRecipeBlocks = totalBlocks - 32; //accounts for 32 byte hash
                console.log("CardInfo:" + JSON.stringify(info));
                console.log("Total Blocks:" + totalBlocks);
                if (data.length < availableRecipeBlocks) {
                    const padding = new Array(availableRecipeBlocks - data.length).fill(0);
                    data = data.concat(padding);
                }
                // the resolved tag object will contain `ndefMessage` property
                //const nfcTag = await NfcManager.getTag();
                await this.writeBlocks(8, data, progressCallBack);
            }
        } catch (e) {
            if (!this.isClosed) {
                throw e;
            }
        }
    }
}

export default NFC;
