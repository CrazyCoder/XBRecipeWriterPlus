import React, {useCallback, useMemo, useRef, useState} from 'react';
import {Pressable, TextInputProps, View} from 'react-native';
import {H6, Input, Label, XStack, YStack} from 'tamagui';
import {Slider} from '@miblanchard/react-native-slider';
import {AntDesign} from '@expo/vector-icons';

type Props = TextInputProps & {
    onValidEditFunction?: ValidEditCallbackFunction
    setErrorFunction: (error: boolean) => void
    onIsSlidingChange?: (isSliding: boolean) => void
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
    const isLongPressing = useRef(false);

    const LONG_PRESS_REPEAT_START = 200;
    const LONG_PRESS_REPEAT_MIN = 30;

    const oneStep = props.step ? props.step : 1;

    // Long press timer refs
    const longPressTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
    const longPressInterval = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
    const currentInterval = useRef<number>(LONG_PRESS_REPEAT_START); // Initial interval in ms

    const onIsSlidingChange = useCallback((isSliding: boolean) => {
        props.onIsSlidingChange?.(isSliding);
    }, [props.onIsSlidingChange]);

    // Memoize validation logic to avoid recalculation
    const isValidValue = useCallback((numValue: number): boolean => {
        return numValue >= props.minimumValue && numValue <= props.maximumValue;
    }, [props.minimumValue, props.maximumValue]);

    const validateValue = useCallback((inputValue: string): boolean => {
        if (!inputValue || inputValue === "") {
            if (value !== undefined) {
                setValue(undefined);
                setValidated(false);
                props.setErrorFunction(true);
            }
            return false;
        }

        const numValue = parseInt(inputValue, 10);

        // Check if parsing failed
        if (isNaN(numValue)) {
            if (validated) {
                setValidated(false);
                props.setErrorFunction(true);
            }
            return false;
        }

        const isValid = isValidValue(numValue);

        // Only update state if values actually changed
        if (value !== numValue) {
            setValue(numValue);
        }

        if (validated !== isValid) {
            setValidated(isValid);
            props.setErrorFunction(!isValid);
        }

        return isValid;
    }, [value, validated, isValidValue, props.setErrorFunction]);

    const updateRecipe = useCallback((inputValue: string): boolean => {
        const isValid = validateValue(inputValue);
        if (isValid) {
            try {
                if (props.onValidEditFunction) {
                    if (props.pourNumber !== undefined) {
                        void props.onValidEditFunction(props.label?.toString()!, inputValue, props.pourNumber);
                    } else {
                        void props.onValidEditFunction(props.label?.toString()!, inputValue);
                    }
                }
            } catch (error) {
                console.error('Validation callback error:', error);
            }
        }
        return isValid;
    }, [validateValue, props.onValidEditFunction, props.label, props.pourNumber]);

    // Memoize processed value calculation
    const processedValue = useMemo((): string => {
        if (props.floatingPoint && value !== undefined) {
            return (value / 10).toFixed(1);
        }
        return value !== undefined ? value.toString() : "";
    }, [value, props.floatingPoint]);

    const onValueChange = useCallback((sliderValue: number[]) => {
        const newValue = sliderValue[0];
        if (value !== newValue) {
            setValue(newValue);
            updateRecipe(newValue.toString());
        }
    }, [value, updateRecipe]);

    const onPlusPress = useCallback(() => {
        setValue(prevValue => {
            if (prevValue && prevValue + oneStep <= props.maximumValue) {
                const newValue = prevValue + oneStep;
                // Trigger validation after state update
                updateRecipe(newValue.toString());
                return newValue;
            }
            return prevValue;
        });
    }, [props.maximumValue, oneStep, updateRecipe]);

    const onMinusPress = useCallback(() => {
        setValue(prevValue => {
            if (prevValue && prevValue - oneStep >= props.minimumValue) {
                const newValue = prevValue - oneStep;
                updateRecipe(newValue.toString());
                return newValue;
            }
            return prevValue;
        });
    }, [props.minimumValue, oneStep, updateRecipe]);

    const startLongPress = useCallback((pressFunction: () => void) => {
        isLongPressing.current = true;
        // Initial delay before starting repetitive calls
        longPressTimer.current = setTimeout(() => {
            // Start repetitive calls
            const repeatPress = () => {
                pressFunction();
                // Reduce interval exponentially
                currentInterval.current = Math.max(LONG_PRESS_REPEAT_MIN, currentInterval.current * 0.85);
                longPressInterval.current = setTimeout(repeatPress, currentInterval.current);
            };

            repeatPress();
        }, LONG_PRESS_REPEAT_START); // Initial delay
    }, []);

    const stopLongPress = useCallback(() => {
        isLongPressing.current = false;
        if (longPressTimer.current) {
            clearTimeout(longPressTimer.current);
            longPressTimer.current = undefined;
        }
        if (longPressInterval.current) {
            clearInterval(longPressInterval.current);
            longPressInterval.current = undefined;
        }
        currentInterval.current = LONG_PRESS_REPEAT_START; // Reset interval
    }, [value]);

    const onMinusLongPress = useCallback(() => {
        startLongPress(onMinusPress);
    }, [startLongPress, onMinusPress]);

    const onPlusLongPress = useCallback(() => {
        startLongPress(onPlusPress);
    }, [startLongPress, onPlusPress]);

    // Memoize error message to avoid recalculation
    const errorMessage = useMemo((): string => {
        if (props.label && props.minimumValue && props.maximumValue) {
            let msg = props.label + " must be between " + props.minimumValue + " and " + props.maximumValue;
            if (props.step && props.step !== 1) {
                msg += " in increments of " + props.step;
            }
            return msg;
        }
        return 'Error: Invalid Input';
    }, [props.label, props.minimumValue, props.maximumValue, props.step]);

    const pressedButtonStyle = useCallback(({pressed}: { pressed: boolean }) => [
        {
            opacity:   pressed ? 0.5 : 1,
            transform: [{scale: pressed ? 0.9 : 1}]
        }
    ], []);

    // Cleanup timers on unmount
    React.useEffect(() => {
        return () => {
            if (longPressTimer.current) {
                clearTimeout(longPressTimer.current);
            }
            if (longPressInterval.current) {
                clearInterval(longPressInterval.current);
            }
        };
    }, []);



    return (
        <>
            <YStack>
                <XStack padding="$2" alignItems="center" alignSelf="flex-start" flex={1} gap={"$4"}>
                    <XStack gap="$3">
                        <Pressable onPress={onMinusPress} onLongPress={onMinusLongPress} onPressOut={stopLongPress} style={pressedButtonStyle}>
                            <AntDesign padding={0} name="minuscircle" size={30} color="red"/>
                        </Pressable>
                    </XStack>

                    <View style={{flex: 1, position: 'relative', height: 44}}>
                        {/* Slider container */}
                        <View style={{position: 'absolute', top: 0, left: 0, right: 0, bottom: 0}}>
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
                                        step={oneStep}
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
                                        onValueChange={onValueChange}
                                        onSlidingComplete={() => onIsSlidingChange(false)}
                                        onSlidingStart={() => onIsSlidingChange(true)}
                                />
                            </View>
                        </View>
                    </View>

                    <XStack alignItems="center" alignContent="center">
                        <Input padding="$2" value={processedValue} onChangeText={updateRecipe}
                               focusStyle={{borderColor: validated ? "gray" : "red"}}
                               borderColor={validated ? "gray" : "red"} {...props} minWidth={"$4"}>
                        </Input>
                        <XStack paddingLeft="$3">
                            <Pressable onPress={onPlusPress} onLongPress={onPlusLongPress} onPressOut={stopLongPress} style={pressedButtonStyle}>
                                <AntDesign padding={0} name="pluscircle" size={30} color="#ff5c00"/>
                            </Pressable>
                        </XStack>
                    </XStack>
                </XStack>
                {!validated ? <H6 fontWeight="600" color="red" padding="$2">{"Error: " + errorMessage}</H6> : ""}
            </YStack>
        </>
    );
}
