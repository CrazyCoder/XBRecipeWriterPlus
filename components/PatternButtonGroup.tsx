import Pour, { POUR_PATTERN } from '@/library/Pour'
import type { SizeTokens } from 'tamagui'
import { H6, Label, ToggleGroup, XStack, YStack } from 'tamagui'

export default function PatternButtonGroup(props: {
    size: SizeTokens
    label: string
    orientation: 'vertical' | 'horizontal'
    onToggle: (value: string) => void
    initalValue?: string
  }) {
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
          value={props.initalValue !==undefined ? props.initalValue : ""}
          orientation={props.orientation}
          type="single" // since this demo switches between loosen types
          size={props.size}
          disableDeactivation={true}
          onValueChange={(value) => props.onToggle(value)}
        >
          <ToggleGroup.Item value={""+POUR_PATTERN.CENTERED} aria-label="Centered">
            <H6>Centered</H6>
          </ToggleGroup.Item>
          <ToggleGroup.Item value={"" + POUR_PATTERN.CIRCULAR} aria-label="Circular">
          <H6>Circular</H6>
          </ToggleGroup.Item>
          <ToggleGroup.Item value={"" + POUR_PATTERN.SPIRAL} aria-label="Spiral">
          <H6>Spiral</H6>
          </ToggleGroup.Item>
        </ToggleGroup>
      </XStack>
    )
  }