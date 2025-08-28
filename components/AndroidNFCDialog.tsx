import React, {useState} from 'react';
import {ViewStyle} from 'react-native';

import {Button, Sheet, Spinner, Text, XStack, YStack} from 'tamagui';
import Svg, {Path} from 'react-native-svg';
import {ProgressBar} from '@react-native-community/progress-bar-android';

function NfcIcon(): React.JSX.Element {
    return (
        <Svg width="50%" height="50%" viewBox="0 0 24 24" fill="none">
            <Path
                d="M6 11H18M22 8V7.8C22 6.11984 22 5.27976 21.673 4.63803C21.3854 4.07354 20.9265 3.6146 20.362 3.32698C19.7202 3 18.8802 3 17.2 3H17M22 16V16.2C22 17.8802 22 18.7202 21.673 19.362C21.3854 19.9265 20.9265 20.3854 20.362 20.673C19.7202 21 18.8802 21 17.2 21H17M7 21H6.8C5.11984 21 4.27976 21 3.63803 20.673C3.07354 20.3854 2.6146 19.9265 2.32698 19.362C2 18.7202 2 17.8802 2 16.2V16M2 8V7.8C2 6.11984 2 5.27976 2.32698 4.63803C2.6146 4.07354 3.07354 3.6146 3.63803 3.32698C4.27976 3 5.11984 3 6.8 3H7M6 13.8V10.2C6 9.0799 6 8.51984 6.21799 8.09202C6.40973 7.71569 6.71569 7.40973 7.09202 7.21799C7.51984 7 8.0799 7 9.2 7H14.8C15.9201 7 16.4802 7 16.908 7.21799C17.2843 7.40973 17.5903 7.71569 17.782 8.09202C18 8.51984 18 9.0799 18 10.2V13.8C18 14.9201 18 15.4802 17.782 15.908C17.5903 16.2843 17.2843 16.5903 16.908 16.782C16.4802 17 15.9201 17 14.8 17H9.2C8.0799 17 7.51984 17 7.09202 16.782C6.71569 16.5903 6.40973 16.2843 6.21799 15.908C6 15.4802 6 14.9201 6 13.8Z"
                stroke="blue" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </Svg>
    )
}


export default function AndroidNFCDialog(props: {
    onClose: () => void,
    progress?: number,
}) {
    const [isOpen, setOpen] = useState(true);

    async function onCancel() {
        console.log("Cancel NFC Dialog");
        setOpen(false);
        props.onClose();
    }


    return (
        <Sheet
            open={isOpen}
            onOpenChange={(isOpen: boolean) => !isOpen && props.onClose()}
            modal
            dismissOnSnapToBottom
            snapPoints={[70]}
        >
            <Sheet.Overlay
                animation="quick"
                enterStyle={{opacity: 0}}
                exitStyle={{opacity: 0}}
            />
            <Sheet.Handle/>
            <Sheet.Frame
                style={{
                    backgroundColor:     'white',
                    borderTopLeftRadius: 16,
                    borderTopRightRadius: 16,
                    padding:             16
                } as ViewStyle}
            >
                <YStack gap={16} ai="center">
                    <Spinner size="large">
                    </Spinner>
                    {props.progress !== undefined ?
                        <XStack key={props.progress} paddingHorizontal="$5" alignItems="center">
                            <ProgressBar styleAttr="Horizontal" color="blue" indeterminate={false}
                                         progress={props.progress / 100} style={{width: '100%'}}/>
                            <Text paddingLeft="$2" color="black">{props.progress + "%"}</Text>
                        </XStack> : ""}
                    <Text style={{fontSize: 18, fontWeight: 'bold', color: '#333'}}>
                        Hold Near the NFC Reader
                    </Text>
                    <Text style={{fontSize: 14, textAlign: 'center', color: '#666'}}>
                        Place your card close to the NFC reader to continue.
                    </Text>
                    <NfcIcon/>
                    <Button backgroundColor="blue" size="$6" color="white" theme="active"
                            onPress={() => onCancel()}>
                        Cancel
                    </Button>
                </YStack>
            </Sheet.Frame>
        </Sheet>
    );
};
