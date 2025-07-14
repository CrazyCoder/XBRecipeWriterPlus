import Recipe from '@/library/Recipe'
import {Label, XStack} from 'tamagui'
import React from 'react';

export default function TotalVolumeComponent(props: {
    recipe: Recipe
}) {


    return (
        <XStack
            alignItems="flex-start"
            justifyContent="flex-start"
            paddingLeft="$2"
        >
            <Label fontWeight="700" fontSize="$7">Total Volume:</Label>
            <Label fontWeight="700" color={props.recipe!.isPourVolumeValid() ? "$text" : "red"}
                   fontSize="$8">{" " + props.recipe!.getPourTotalVolume()}</Label>
            <Label paddingRight="$1" fontWeight="700"
                   fontSize="$8">{"/" + props.recipe!.getTotalVolume() + " ml"}</Label>


        </XStack>
    )
}