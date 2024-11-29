
import type { TooltipProps } from 'tamagui'
import { Button, Paragraph, Tooltip, TooltipGroup, XStack, YStack } from 'tamagui'
import { AntDesign } from "@expo/vector-icons";
import { Alert, useColorScheme } from 'react-native';



export default function TooltipComponent(props: {
 
 content: string
 paddingLeft?: string
}) {

  const colorScheme = useColorScheme();
  async function handlePress() {
    Alert.alert('What is this?', props.content, [
      {
        text: 'Ok',
        onPress: () => console.log('Cancel Pressed'),
      },
    ]);
  }


  return (
    <YStack paddingLeft={props.paddingLeft}>
      <AntDesign onPress={()=>handlePress()} name="questioncircle" size={20} color="#ff783e"  />
    </YStack>
  )
}

