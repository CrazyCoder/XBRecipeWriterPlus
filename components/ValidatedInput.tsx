import React, {useState} from 'react';
import {TextInputProps, View} from 'react-native';
import {PanGestureHandler, Pressable} from 'react-native-gesture-handler';
import {H6, Input, Label, XStack, YStack} from 'tamagui';
import {Slider} from '@miblanchard/react-native-slider';
import {AntDesign} from '@expo/vector-icons';

type Props = TextInputProps & {
    onValidEditFunction?: ValidEditCallbackFunction
    setErrorFunction: (error: boolean) => void
    onSlideStart?: () => void
    pourNumber?: number
    label: string
    minimumValue: number
    maximumValue: number
    step: number
    initialValue: number | undefined
    maxLength: number
    floatingPoint?: boolean
};

type ValidEditCallbackFunction = (inputLabel: string, value: string, pourNumber?: number) => Promise<void>;


export default function ValidatedInput(props: Props) {
    const [validated, setValidated] = useState(true);
    const [value, setValue] = useState(props.initialValue);


    async function validate(value: string): Promise<boolean> {
        if (value && value !== "") {
            setValue(parseInt(value));
            if (props.minimumValue !== undefined && props.maximumValue !== undefined) {
                if (parseInt(value) >= props.minimumValue && parseInt(value) <= props.maximumValue) {
                    setValidated(() => true);
                    props.setErrorFunction(false);

                    if (props.onValidEditFunction) {
                        if (props.pourNumber !== undefined) {
                            await props.onValidEditFunction(props.label?.toString()!, value, props.pourNumber);
                        } else {
                            await props.onValidEditFunction(props.label?.toString()!, value);
                        }
                    }
                    return true;
                }
            }
        } else {
            setValue(() => undefined);
        }
        //setValue(()=>undefined);
        setValidated(false);
        props.setErrorFunction(true);
        return false;
    }

    function getProcessedValue(): string {
        if (props.floatingPoint && value !== undefined) {
            return "" + (value / 10).toFixed(1);
        }
        return value !== undefined ? "" + value : "";
    }

    async function onValueChange(value: number[]) {
        setValue(value[0]);
        //var validEdit = await validate(value[0].toString());
    }

    async function onMinusPress() {
        if (value && value - 1 >= props.minimumValue) {
            setValue((value) => value! -= 1);
            await validate("" + (value - 1));
        }
    }

    async function onPlusPress() {
        if (value && (value + 1 <= props.maximumValue)) {
            setValue((value) => value! += 1);
            await validate("" + (value + 1));
        }

    }

    async function onSlideStart() {
        console.log("Slide Start");
        if (props.onSlideStart !== undefined) {
            console.log("Slide Start!");

            props.onSlideStart();
        }
    }

    function getErrorMessage(): string {
        if (props.label && props.minimumValue && props.maximumValue) {

            let msg = props.label + " must be between " + props.minimumValue + " and " + props.maximumValue;
            if (props.step && props.step !== 1) {
                msg += " in increments of " + props.step;
            }
            return msg;
        }

        return 'Error: Invalid Input'
    }

    const pressedButtonStyle = ({pressed}: { pressed: boolean }) => [
        {
            opacity:   pressed ? 0.5 : 1,
            transform: [{scale: pressed ? 0.9 : 1}]
        }
    ];


    return (
        <>
            <YStack>
                <XStack padding="$2" alignItems="center" alignSelf="flex-start" flex={1} gap={"$4"}>
                    <XStack gap="$3">
                        <Pressable onPressIn={() => onMinusPress()} style={pressedButtonStyle}>
                            <AntDesign padding={0} name="minuscircle" size={30} color="red"/>
                        </Pressable>
                    </XStack>

                    <View style={{flex: 1, position: 'relative', height: 44}}>
                        {/* Slider container */}
                        <View style={{position: 'absolute', top: 0, left: 0, right: 0, bottom: 0}}>
                            <PanGestureHandler>
                                <View onResponderGrant={() => true} style={{
                                    flex: 1, borderWidth: 1, borderRadius: 10, borderColor: "gray", paddingHorizontal: 1
                                }}>
                                    <View style={{
                                        zIndex:         1,
                                        position:       'absolute',
                                        top:            0,
                                        left:           10,
                                        right:          0,
                                        bottom:         0,
                                        pointerEvents:  'none',
                                        justifyContent: 'center'
                                    }}>
                                        <Label style={{
                                            textAlign: 'left'
                                        }}>
                                            {props.label}
                                        </Label>
                                    </View>
                                    <Slider containerStyle={{flex: 1}}
                                            value={value !== undefined && (value >= props.minimumValue && value <= props.maximumValue) ? [value] : [props.minimumValue]}
                                            minimumValue={props.minimumValue ? props.minimumValue : 0}
                                            maximumValue={props.maximumValue ? props.maximumValue : 100}
                                            step={props.step ? props.step : 1}
                                            minimumTrackTintColor="rgba(255, 0, 0, 0.9)"
                                            maximumTrackTintColor="$color0"
                                            trackStyle={{height: 40, borderRadius: 8}}
                                            renderThumbComponent={() => (
                                                <View style={{
                                                    width:  0,
                                                    height: 0
                                                }}/>
                                            )}
                                            trackClickable={false}
                                            onValueChange={(value) => onValueChange(value)}
                                            onSlidingComplete={() => validate("" + value)}
                                    />
                                </View>
                            </PanGestureHandler>
                        </View>
                    </View>

                    <XStack alignItems="center" alignContent="center">
                        <Input padding="$2" value={getProcessedValue()} onChangeText={(val) => validate(val)}
                               focusStyle={{borderColor: validated ? "gray" : "red"}}
                               borderColor={validated ? "gray" : "red"} {...props} minWidth={"$4"}>
                        </Input>
                        <XStack paddingLeft="$3">
                            <Pressable onPressIn={() => onPlusPress()} style={pressedButtonStyle}>
                                <AntDesign padding={0} name="pluscircle" size={30} color="#ff5c00"/>
                            </Pressable>
                        </XStack>
                    </XStack>
                </XStack>
                {!validated ? <H6 fontWeight="600" color="red" padding="$2">{"Error: " + getErrorMessage()}</H6> : ""}
            </YStack>
        </>
    );
}
