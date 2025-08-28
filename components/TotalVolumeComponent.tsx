import Recipe from '@/library/Recipe'
import {Label, XStack} from 'tamagui'
import React, {useState, forwardRef, useImperativeHandle} from 'react';

interface TotalVolumeComponentProps {
    recipe: Recipe
}

interface TotalVolumeComponentRef {
    forceUpdate: () => void;
}

const TotalVolumeComponent = forwardRef<TotalVolumeComponentRef, TotalVolumeComponentProps>((props, ref) => {
    const [localKey, setLocalKey] = useState(0);

    useImperativeHandle(ref, () => ({
        forceUpdate: () => {
            setLocalKey(prev => prev + 1);
        }
    }));

    return (
        <XStack
            alignItems="flex-start"
            justifyContent="flex-start"
            paddingHorizontal="$2"
            flexWrap="nowrap"
            flexShrink={0}>
            <Label fontWeight="700" fontSize="$7">Volume:</Label>
            <Label fontWeight="700" color={props.recipe.isPourVolumeValid() ? "$text" : "red"}
                   fontSize="$8" width={64} style={{fontVariant: ['tabular-nums']}}
                   minWidth="$5" textAlign="center"
                   key={"pv_" + localKey}
            >
                {props.recipe.getPourTotalVolume().toString().padStart(3, ' ')}
            </Label>
            <Label fontWeight="300" fontSize="$7" paddingRight="$2">/</Label>
            <Label fontWeight="700" style={{fontVariant: ['tabular-nums']}}
                   fontSize="$8" minWidth="$5" textAlign="center"
                   key={"tv_" + localKey}
            >
                {props.recipe.getTotalVolume().toString().padStart(3, ' ')}
            </Label>
            <Label fontWeight="300" fontSize="$7" paddingHorizontal="$2">ml</Label>
        </XStack>
    )
});

export default TotalVolumeComponent;
