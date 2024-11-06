import Pour, { POUR_PATTERN } from '@/library/Pour'
import { useEffect, useState } from 'react'
import type { SizeTokens } from 'tamagui'
import { H6, Label, ToggleGroup, XStack, YStack } from 'tamagui'

export default function OnOffButtonGroup(props: {
    size: SizeTokens
    label: string
    orientation: 'vertical' | 'horizontal'
    onToggle: (value: boolean) => void
    initialValue?: string
  }) {

    const [value, setValue] = useState(props.initialValue !== undefined ? props.initialValue : "0")

    async function onValueChange(value: string) {
      setValue(value)
      props.onToggle(value === "1")
    }

    return (
      <XStack
        flexDirection={props.orientation === 'horizontal' ? 'row' : 'column'}
        alignItems="flex-start"
        justifyContent="flex-start"
        padding="$2"
        space="$4"
      >
        <Label paddingRight="$0" justifyContent="flex-end" size={props.size}>
          {props.label}
        </Label>
  
        {/* @ts-ignore */}
        <ToggleGroup
          value={value}
          orientation={props.orientation}
          type="single" // since this demo switches between loosen types
          size={props.size}
          disableDeactivation={true}
          onValueChange={(value) => onValueChange(value)}
        >
          <ToggleGroup.Item value={""+1} aria-label="On">
            <H6>On</H6>
          </ToggleGroup.Item>
          <ToggleGroup.Item value={"" + 0} aria-label="Off">
          <H6>Off</H6>
          </ToggleGroup.Item>
        </ToggleGroup>
      </XStack>
    )
  }