import {styled, ToggleGroup} from "tamagui";

export const MyToggleGroupItem = styled(ToggleGroup.Item, {
    variants: {
        active: {
            true: {
                backgroundColor: 'red',
            },
        },
    },
});
