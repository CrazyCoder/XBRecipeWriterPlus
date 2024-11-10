
import RecipeDatabase from '@/library/RecipeDatabase';
import type { PopoverProps } from 'tamagui'
import { Adapt, Button, Input, Label, Popover, XStack, YStack } from 'tamagui'



export function RecipeOperationDialog({
    Icon,
    Name,
    shouldAdapt,
    rerenderFunction,
    ...props
  }: PopoverProps & { Icon?: any; Name?: string; shouldAdapt?: boolean, rerenderFunction: () => void
  }) {
    return (
      <Popover  size="$1" allowFlip {...props}>
        <Popover.Trigger asChild>
          <Button backgroundColor="#dddddd" icon={Icon} />
        </Popover.Trigger>
  
        {shouldAdapt && (
          <Adapt when="sm" platform="touch">
            <Popover.Sheet modal dismissOnSnapToBottom>
              <Popover.Sheet.Frame backgroundColor="$colorTransparent"
 padding="$4">
                <Adapt.Contents  />
              </Popover.Sheet.Frame>
              <Popover.Sheet.Overlay
                animation="lazy"
                enterStyle={{ opacity: 0 }}
                exitStyle={{ opacity: 0 }}
              />
            </Popover.Sheet>
          </Adapt>
        )}
  
        <Popover.Content
          borderWidth={1}
          borderColor="$borderColor"
          enterStyle={{ y: -10, opacity: 0 }}
          exitStyle={{ y: -10, opacity: 0 }}
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
          <Popover.Arrow  borderWidth={1} borderColor="$colorTransparent" />
  
          <YStack backgroundColor="white" borderRadius={20}>
          <Popover.Close asChild>
              <Button
                size="$3"
                onPress={() => {
                    var db = new RecipeDatabase();
                    db.cloneRecipe(Name!);
                    rerenderFunction();
                }}
              >
                Duplicate
              </Button>
            </Popover.Close>
  
            <Popover.Close asChild>
              <Button
                size="$3"
                onPress={() => {
                  var db = new RecipeDatabase();
                  db.deleteRecipe(Name!);
                  rerenderFunction();
                }}
              >
                Delete
              </Button>
            </Popover.Close>
          </YStack>
        </Popover.Content>
      </Popover>
    )
  }