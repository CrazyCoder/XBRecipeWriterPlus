
import type { TooltipProps } from 'tamagui'
import { Button, Paragraph, Tooltip, TooltipGroup, XStack, YStack } from 'tamagui'
import { AntDesign } from "@expo/vector-icons";
import { Alert } from 'react-native';



export default function TooltipComponent(props: {
 content: string
}) {

  async function handlePress() {
    Alert.alert('What is this?', props.content, [
      {
        text: 'Ok',
        onPress: () => console.log('Cancel Pressed'),
      },
    ]);
  }


  return (
    <YStack>
      <AntDesign onPress={()=>handlePress()} name="questioncircle" size={20} color="blue" />
    </YStack>
  )
}

