import RecipeDatabase from '@/library/RecipeDatabase';
import React, {useEffect, useState} from 'react';
import type {PopoverProps} from 'tamagui'
import {Adapt, Button, Popover, YStack} from 'tamagui'


export function RecipeOperationDialog({
    showDialog,
    Name,
    shouldAdapt,
    rerenderFunction,
    ...props
}: PopoverProps & {
    showDialog: boolean, Name?: string; shouldAdapt?: boolean, rerenderFunction: () => void
}) {

    const [showPopover, setShowPopover] = useState(showDialog);

    useEffect(() => {
        setShowPopover(showDialog);
    }, [showDialog])

    function onOpenChange(open: boolean) {
        if (!open) {
            rerenderFunction();
        }
    }

    return (
        <Popover size="$1" {...props} open={showPopover} onOpenChange={(open) => onOpenChange(open)}>

            {shouldAdapt && (
                <Adapt platform="touch">
                    <Popover.Sheet modal dismissOnSnapToBottom>
                        <Popover.Sheet.Frame backgroundColor="$colorTransparent"
                                             padding="$4">
                            <Adapt.Contents/>
                        </Popover.Sheet.Frame>
                        <Popover.Sheet.Overlay
                            animation="lazy"
                            enterStyle={{opacity: 0}}
                            exitStyle={{opacity: 0}}
                        />
                    </Popover.Sheet>
                </Adapt>
            )}

            <Popover.Content
                borderWidth={1}
                borderColor="$borderColor"
                enterStyle={{y: -10, opacity: 0}}
                exitStyle={{y: -10, opacity: 0}}
                elevate
                animation={[
                    'quick',
                    {
                        opacity: {
                            overshootClamping: true,
                        },
                    },
                ]}
            >
                <Popover.Arrow borderWidth={1} borderColor="$colorTransparent"/>

                <YStack backgroundColor="white" borderRadius={20}>
                    <Button
                        size="$3"
                        onPress={() => {
                            let db = new RecipeDatabase();
                            db.cloneRecipe(Name!);
                            setShowPopover(false);
                            rerenderFunction();
                        }}
                    >
                        Duplicate
                    </Button>

                    <Button
                        size="$3"
                        onPress={() => {
                            let db = new RecipeDatabase();
                            db.deleteRecipe(Name!);
                            setShowPopover(false);
                            rerenderFunction();
                        }}
                    >
                        Delete
                    </Button>
                </YStack>
            </Popover.Content>
        </Popover>
    )
}