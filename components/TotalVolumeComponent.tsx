import Recipe from '@/library/Recipe'
import { useEffect, useState } from 'react'
import type { SizeTokens } from 'tamagui'
import { H6, Label, ToggleGroup, XStack, YStack } from 'tamagui'

export default function TotalVolumeComponent(props: {
    recipe:Recipe
  }) {


  

    return (
      <XStack
        alignItems="flex-start"
        justifyContent="flex-start"
        paddingLeft="$2"
      >
        <Label  fontWeight="700"  fontSize="$8" >Total Volume:</Label>
        <Label  fontWeight="700" color={props.recipe!.isPourVolumeValid() ? "$text" : "red"} fontSize="$8" >{" " + props.recipe!.getPourTotalVolume()}</Label>
        <Label  paddingRight="$1" fontWeight="700" fontSize="$8" >{"/" + props.recipe!.getTotalVolume() + " ml"}</Label>


      </XStack>
    )
  }