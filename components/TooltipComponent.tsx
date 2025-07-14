import {YStack} from 'tamagui'
import {AntDesign} from "@expo/vector-icons";
import {Alert, useColorScheme} from 'react-native';
import React from 'react';

export default function TooltipComponent(props: {
    content: string
    paddingLeft?: string
}) {

    const colorScheme = useColorScheme();

    async function handlePress() {
        Alert.alert('What is this?', props.content, [
            {
                text: 'Ok',
                onPress: () => console.log('Cancel Pressed'),
            },
        ]);
    }

    return (
        <YStack paddingLeft={props.paddingLeft}>
            <AntDesign onPress={() => handlePress()} name="questioncircle" size={20} color="#ff783e"/>
        </YStack>
    )
}
