import React, {useState} from 'react';
import {TextInputProps} from 'react-native';
import {H6, Input, Label, XStack, YStack} from 'tamagui';

type Props = TextInputProps & {
    validateInput?: ValidateCallbackFunction
    onValidEditFunction?: ValidEditCallbackFunction
    setErrorFunction?: (error: boolean) => void
    initialValue?: string
    pourNumber?: number
    label: string
    errorMessage?: string
    width?: number
    disabled?: boolean
    maxLength: number
};

type ValidateCallbackFunction = (value: string) => boolean;
type ValidEditCallbackFunction = (inputLabel: string, value: string, pourNumber?: number) => Promise<void>;


export default function LabeledInput(props: Props) {
    const [validated, setValidated] = useState(true);
    const [value, setValue] = useState(props.initialValue);

    async function validate(value: string): Promise<boolean> {
        setValue(value);
        if (props.validateInput !== undefined) {
            let valid = props.validateInput(value);
            setValidated(valid);
            props.setErrorFunction?.(!valid);
            if (valid) {
                await doneEditing(value);
            }
            return valid;
        } else {
            setValidated(true);
            await doneEditing(value);
            return true;
        }
    }

    async function doneEditing(value: string) {
        if (validated) {
            if (props.onValidEditFunction) {
                if (props.pourNumber !== undefined) {
                    await props.onValidEditFunction(props.label?.toString()!, value, props.pourNumber);
                } else {
                    await props.onValidEditFunction(props.label?.toString()!, value);
                }
            }
        }
    }

    return (
        <>
            <YStack flex={1}>
                <XStack paddingLeft="$2" paddingVertical="$2" alignItems="center" alignSelf="flex-start"
                        gap={"$2"}>
                    <Label minWidth={"$3"}>{props.label}</Label>
                    <Input flex={1}
                           disabled={props.disabled}
                           marginLeft="$1"
                           value={value ? "" + value : ""}
                           onChangeText={(val) => validate(val)}
                           focusStyle={{borderColor: validated ? "gray" : "red"}}
                           borderColor={validated ? "gray" : "red"} {...props}
                           backgroundColor={props.disabled ? "#D3D3D3" : "$background"}
                           color={props.disabled ? "black" : "$text"}>
                    </Input>
                </XStack>
                {!validated ? <H6 fontWeight="600" color="red" padding="$2">{"Error: " + props.errorMessage}</H6> : ""}
            </YStack>
        </>
    );
}
