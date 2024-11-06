import { toast } from '@backpackapp-io/react-native-toast';
import React, { useEffect } from 'react';
import { View, Text, Button, AppRegistry } from 'react-native';
import NfcManager, { NfcEvents, TagEvent } from 'react-native-nfc-manager';
import { NfcTech } from 'react-native-nfc-manager';
global.Buffer = require('buffer').Buffer;
class NFC {

    constructor() {

    }

    async init() {
        try {
            await NfcManager.start();
        } catch (ex) {
            console.error('NFC Manager failed to start', ex);
        }
    }

    public convertNumberArrayToHex(array: number[]): string {
        let hexOutput = ''
        for (let i = 0; i < array.length; i++) {
            let hex = array[i].toString(16);
            if (hex.length == 1) {
                hex = '0' + hex;
            }
            hexOutput += "" + hex;
        }
        return hexOutput;
    }

    async readHash(): Promise<number[] | null> {

        const hash = await NfcManager.iso15693HandlerIOS.readMultipleBlocks({ flags: 34, blockNumber: 0, blockCount: 8 })
        let flattenedData: number[] = []

        if (hash) {
            if (hash) {
                for (let i = 0; i < hash.length; i++) {
                    for (let j = 0; j < hash[i].length; j++) {
                        flattenedData[(i * 4) + j] = hash[i][j] //@TODO this 4 should be set to block size
                    }
                }
            }
        }
        return flattenedData;

    }


    async close() {
        await NfcManager.cancelTechnologyRequest();
    }

    async open() {
        await NfcManager.requestTechnology(NfcTech.Iso15693IOS);
    }



    async readCard(): Promise<number[] | null> {




        // register for the NFC tag with NDEF in it
        var sysInfo = await NfcManager.iso15693HandlerIOS.getSystemInfo(0x22);
        console.log(sysInfo);
        const nfcTag = await NfcManager.getTag();
        console.log(nfcTag);
        if (nfcTag) {

            const data = await NfcManager.iso15693HandlerIOS.readMultipleBlocks({ flags: 34, blockNumber: 0, blockCount: sysInfo.blockCount })

            let flattenedData: number[] = []
            if (data) {
                for (let i = 0; i < data.length; i++) {
                    for (let j = 0; j < data[i].length; j++) {
                        flattenedData[(i * 4) + j] = data[i][j] //@TODO this 4 should be set to block size
                    }
                }
                console.log(JSON.stringify(flattenedData));

                return flattenedData
            }
        }
        //console.log('Tag found', tag);

        return null;
    }

    async writeBlocks(startBlock: number, data: number[], toastID?: string) {
        try{
        let i = 0;
        let blockNum = startBlock;

        
        const id = toast("Writing Recipe to Card: " + ((i/data.length) * 100) + "%");

        while (i < data.length) {

            var fourByteData = data.slice(i, i + 4)
            console.log(JSON.stringify(fourByteData));
            console.log("Blocknum:" + blockNum);
            await NfcManager.iso15693HandlerIOS.writeSingleBlock({ flags: 34, blockNumber: blockNum, dataBlock: fourByteData })
            
            toast("Writing Recipe to Card: " + Math.round((i/data.length) * 100) + "%", {id:id});
            
            i += 4;
            blockNum++;

        }
        toast("Writing Recipe to Card: 100%", {id:id,styles: {
            view: {backgroundColor: 'green'},
          }});

        }catch(e){
            console.log(e);
            toast.dismiss();
            toast("Error writing to card", {styles: {view: {backgroundColor: 'red'}}});
            throw e;
        }

    }

    async writeCard(data: number[], toastID?: string) {
        //await NfcManager.requestTechnology(NfcTech.Iso15693IOS);

        if (data.length < 128) {
            const padding = new Array(128 - data.length).fill(0);
            data = data.concat(padding);
        }

        console.log("write card");


        // the resolved tag object will contain `ndefMessage` property
        //const nfcTag = await NfcManager.getTag();
        await this.writeBlocks(8, data);

    }


}

export default NFC;