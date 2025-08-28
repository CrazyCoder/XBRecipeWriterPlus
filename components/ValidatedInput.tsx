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

    const oneStep = props.step ? props.step : 1;

    // Use ref to track the last validated value to prevent duplicate validations
    const lastValidatedValue = useRef<number | undefined>(props.initialValue);

    // Debounce timer ref for async validation callback
    const validationTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

    const onIsSlidingChange = useCallback((isSliding: boolean) => {
        props.onIsSlidingChange?.(isSliding);
    }, [props.onIsSlidingChange]);

    // Memoize validation logic to avoid recalculation
    const isValidValue = useCallback((numValue: number): boolean => {
        return numValue >= props.minimumValue && numValue <= props.maximumValue;
    }, [props.minimumValue, props.maximumValue]);

    // Separate sync validation from async callback
    const validateSync = useCallback((inputValue: string): boolean => {
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

    // Debounced async validation callback
    const triggerAsyncValidation = useCallback((inputValue: string, numValue: number) => {
        // Clear existing timer
        if (validationTimer.current) {
            clearTimeout(validationTimer.current);
        }

        // Only trigger async callback if value actually changed and is valid
        if (props.onValidEditFunction &&
            isValidValue(numValue) &&
            lastValidatedValue.current !== numValue) {

            lastValidatedValue.current = numValue;

            // Debounce async validation
            validationTimer.current = setTimeout(async () => {
                try {
                    if (props.pourNumber !== undefined) {
                        await props.onValidEditFunction!(props.label?.toString()!, inputValue, props.pourNumber);
                    } else {
                        await props.onValidEditFunction!(props.label?.toString()!, inputValue);
                    }
                } catch (error) {
                    console.error('Validation callback error:', error);
                }
            }, 100);
        }
    }, [props.onValidEditFunction, props.label, props.pourNumber, isValidValue]);

    // Combined validation function
    const validate = useCallback(async (inputValue: string): Promise<boolean> => {
        const isValid = validateSync(inputValue);

        if (isValid) {
            const numValue = parseInt(inputValue, 10);
            triggerAsyncValidation(inputValue, numValue);
        }

        return isValid;
    }, [validateSync, triggerAsyncValidation]);

    // Memoize processed value calculation
    const processedValue = useMemo((): string => {
        if (props.floatingPoint && value !== undefined) {
            return (value / 10).toFixed(1);
        }
        return value !== undefined ? value.toString() : "";
    }, [value, props.floatingPoint]);

    const onValueChange = useCallback(async (sliderValue: number[]) => {
        const newValue = sliderValue[0];
        if (value !== newValue) {
            setValue(newValue);
            await validate(newValue.toString());
        }
    }, [value, validate]);

    const onMinusPress = useCallback(async () => {
        if (value && value - oneStep >= props.minimumValue) {
            const newValue = value - oneStep;
            setValue(newValue);
            await validate(newValue.toString());
        }
    }, [value, props.minimumValue, validate]);

    const onPlusPress = useCallback(async () => {
        if (value && value + oneStep <= props.maximumValue) {
            const newValue = value + oneStep;
            setValue(newValue);
            await validate(newValue.toString());
        }
    }, [value, props.maximumValue, validate]);

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

    // Cleanup timer on unmount
    React.useEffect(() => {
        return () => {
            if (validationTimer.current) {
                clearTimeout(validationTimer.current);
            }
        };
    }, []);


    return (
        <>
            <YStack>
                <XStack padding="$2" alignItems="center" alignSelf="flex-start" flex={1} gap={"$4"}>
                    <XStack gap="$3">
                        <Pressable onPress={onMinusPress} style={pressedButtonStyle}>
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
                        <Input padding="$2" value={processedValue} onChangeText={validate}
                               focusStyle={{borderColor: validated ? "gray" : "red"}}
                               borderColor={validated ? "gray" : "red"} {...props} minWidth={"$4"}>
                        </Input>
                        <XStack paddingLeft="$3">
                            <Pressable onPress={onPlusPress} style={pressedButtonStyle}>
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
