import NFC from "@/library/NFC";
import Recipe from "@/library/Recipe";
import RecipeDatabase from "@/library/RecipeDatabase";

import { Divider, Icon, IconElement, Layout, Text, TopNavigation, TopNavigationAction } from "@ui-kitten/components";
import { Link, useNavigation } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, Button, Pressable, TouchableOpacity } from "react-native";
import Ionicons from '@expo/vector-icons/Ionicons';
import AntDesign from '@expo/vector-icons/AntDesign';
import { router } from 'expo-router';
import { MySafeAreaView } from "@/components/MySafeAreaView";
import { MyStack } from "@/components/MyStack";
import { H1, H6, Paragraph, ScrollView, YStack } from "tamagui";
import RecipeItem from "@/components/RecipeItem";
import { useFocusEffect, useIsFocused } from "@react-navigation/native";

import { Animated } from "react-native";
import { toast, ToastPosition, Toasts } from "@backpackapp-io/react-native-toast";





export default function HomeScreen() {
  const [recipesJSON, setRecipesJSON] = useState<string>("");
  const navigation = useNavigation();
  const db = new RecipeDatabase();
  const [key, setKey] = useState(0);




  //const isFocused = useIsFocused();


  type IconProps = {
    title: string;
    onPress: () => void;
    icon: IconElement;
  }

  useFocusEffect(
    React.useCallback(() => {
      var recipes = db.retrieveAllRecipes();
      if (recipes) {
        setRecipesJSON(JSON.stringify(recipes));
      }
    }, [])
  )


  useEffect(() => {
    var recipes = db.retrieveAllRecipes();
    if (recipes) {
      setRecipesJSON(JSON.stringify(recipes));
    }
  }, [key]);

  function getRecipes(): Recipe[] {
    var recipes = [];
    if (recipesJSON) {
      var recipeData = JSON.parse(recipesJSON);
      for (let i = 0; i < recipeData.length; i++) {
        recipes.push(new Recipe(undefined, JSON.stringify(recipeData[i])));
      }
    }
    return recipes;
  }

  const IconButton = (props: IconProps) => (
    <Pressable onPress={props.onPress}>
      {props.icon}
    </Pressable>
  );

  useEffect(() => {

    navigation.setOptions({
      title: 'Recipes',
      headerShown: true,
      headerRight: () => <IconButton onPress={() => readCard()} title="" icon={<AntDesign name="download" size={24} color="black" />
      }></IconButton>,

    })
  }, [navigation]);

  async function readCard() {
    try {
      console.log('Read Card')
      var recipe = new Recipe();
      //toast("Hold your phone near the NFC tag");
      await recipe.readCard();
      toast("Recipe read successfully", {
        duration: 4000,
        position: ToastPosition.TOP,
        styles: {
          view: {backgroundColor: 'green'},
        }
      });

      //reenable
      router.push({ pathname: '/editRecipe', params: { recipeJSON: JSON.stringify(recipe) } });
    } catch (e) {
      console.log(e);
      Alert.alert("Error", "Could not read card. Please try again.");
    }

  }

  function forceRefresh() {
    setKey((prev) => prev + 1);
  }

  return (
    <>

      <ScrollView backgroundColor="#dddddd">
        <YStack maxWidth={600} flexDirection="column" >
          {recipesJSON ? getRecipes()
            .sort((a: Recipe, b: Recipe) => a.title.localeCompare(b.title))
            .map((recipe: Recipe, index) => {
              return (
                <RecipeItem rerenderFunction={forceRefresh} key={index} recipe={recipe} onPress={() => {
                  router.push({ pathname: '/editRecipe', params: { recipeJSON: JSON.stringify(recipe) } });
                }}>
                </RecipeItem>
              )
            }) : ""}
        </YStack>
      </ScrollView>

    </>
  )
}