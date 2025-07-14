
import type {SizeTokens} from 'tamagui'
import {Label, ToggleGroup, XStack} from 'tamagui'
import React, {useEffect, useState} from 'react';
import {MyButton} from "@/components/MyButton";

export function MyButtonGroup(props: {
    size: SizeTokens
    minWidth?: SizeTokens
    label: string
    orientation: 'vertical' | 'horizontal'
    onToggle: (value: string) => void
    initialValue?: string
    buttons: number[]
    getLabelText: (id: number) => string
}) {
    const [value, setValue] = useState<string>(props.initialValue ?? "")

    useEffect(() => {
        if (props.initialValue !== undefined) {
            setValue(props.initialValue)
        }
    }, [props.initialValue])

    const handleValueChange = (newValue: string) => {
        setValue(newValue)
        props.onToggle(newValue)
    }

    return (
        <XStack
            flexDirection={props.orientation === 'horizontal' ? 'row' : 'column'}
            alignItems="center"
            justifyContent="flex-start"
            padding="$2"
            gap="$4"
        >
            <Label paddingRight="$2" justifyContent="flex-end" size={props.size} minWidth={props.minWidth ?? "$2"}>
                {props.label}
            </Label>

            <ToggleGroup style={{borderColor: "gray", borderWidth: 1, padding: 1}}
                value={value}
                orientation={props.orientation}
                type="single"
                size={props.size}
                disableDeactivation={true}
                onValueChange={handleValueChange}
            >
                {props.buttons.map(btn => (
                    <MyButton
                        key={btn}
                        id={btn}
                        label={props.getLabelText(btn)}
                        value={value}
                    />
                ))}
            </ToggleGroup>
        </XStack>
    )
}
