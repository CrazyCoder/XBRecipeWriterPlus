import Pour, { POUR_PATTERN } from '@/library/Pour'
import Recipe from '@/library/Recipe'
import RecipeDatabase from '@/library/RecipeDatabase'
import { useEffect, useState } from 'react'
import type { SizeTokens } from 'tamagui'
import { Button, Circle, H2, H5, H6, Label, Text, ToggleGroup, XStack, YStack } from 'tamagui'
import { Entypo } from "@expo/vector-icons";
import { Pressable } from 'react-native'
import { RecipeOperationDialog } from './RecipeOperationDialog'

export default function RecipeItem(props: {
  recipe: Recipe
  rerenderFunction: () => void
  onPress: () => void
}) {
  const [pressed, setPressed] = useState(false)
  
  async function onPress(){
    props.onPress();
  }

  function getStyle(): any{
    let s = {backgroundColor:"#d1d1d1",borderWidth:2, borderRadius:20,borderColor:"#6faff0", width:"100%"};
    if(pressed){
      s.backgroundColor = "#bcbcbc";
      s.borderColor="#6faff0";
    }else{
      s.backgroundColor = "#d1d1d1";
      s.borderColor="#639dd8";
    }
    return s;
  }

  return (
    <XStack
      padding="$2"
      flexDirection='row'
    >
      <Pressable style={getStyle()}  onPressIn={()=>setPressed(true)} onPress={()=>onPress()} onPressOut={()=>setPressed(false)} >
        <YStack paddingHorizontal="$2" paddingVertical="$1" alignItems='center'>
          <H5 paddingVertical="$1">{props.recipe.title}</H5>
          <XStack flex={1} justifyContent='space-evenly' width="100%" flexDirection='row'>
            <YStack >
              <Circle size="$7" borderColor="#99942e"  borderWidth={1}><Text fontSize={30} fontWeight={200}>{"1:" + props.recipe.getRatio()}</Text></Circle>
              <Text  alignSelf='center'>Ratio</Text>
            </YStack>
            <YStack>
              <XStack flex={1} alignItems='center' justifyContent='center' borderColor="#6faff0" borderWidth={2}><Text padding="$2" fontSize={40} fontWeight={700}>{props.recipe.getTotalVolume() +" ml"}</Text></XStack>
              <Text alignSelf='center'>Volume</Text>
            </YStack>
            <YStack >
              <Circle size="$7" borderColor="#99942e" borderWidth={1}><Text fontSize={30} fontWeight={200}>{props.recipe.grindSize}</Text></Circle>
              <Text alignSelf='center'>Grind</Text>
            </YStack>
          </XStack>
        </YStack>
      </Pressable>
      {/*<RecipeOperationDialog
          shouldAdapt={true}
          placement="top"
          Icon={<Entypo name="dots-three-vertical" size={24} color="black" />}
          Name={props.recipe.uuid}
          rerenderFunction={props.rerenderFunction}
        />*/}
    </XStack>
  )
}