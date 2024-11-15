import NFC from "@/library/NFC";
import Recipe from "@/library/Recipe";
import RecipeDatabase from "@/library/RecipeDatabase";

import { Divider, Icon, IconElement, Layout, Text, TopNavigation, TopNavigationAction } from "@ui-kitten/components";
import { Link, useNavigation, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
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
import { XBloomRecipe } from "@/library/XBloomRecipe";
import ImportRecipeComponent from "@/components/ImportRecipeComponent";
import { useShareIntentContext } from "expo-share-intent";





export default function HomeScreen() {
  const [recipesJSON, setRecipesJSON] = useState<string>("");
  const [showImportRecipeDialog, setShowImportRecipeDialog] = useState(false);
  const [xbloomRecipeID, setXBloomRecipeID] = useState<string>("");
  const [key, setKey] = useState(0);
  const router = useRouter();
  const db = new RecipeDatabase();
  const navigation = useNavigation();

  const { hasShareIntent, shareIntent, error, resetShareIntent } = useShareIntentContext();
  const receivedShareIntent = useRef(false);





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
    if (hasShareIntent) {
      console.log("Share intent received:" + JSON.stringify(shareIntent));

      if (shareIntent.type == "weburl" && shareIntent.webUrl) {
        console.log("Web URL: " + shareIntent.webUrl);
        let url = new URL(shareIntent.webUrl);
        if (url) {
          var id = url.searchParams.get("id");
          console.log('XBloom ID: ' + id);
          if (id) {
            setShowImportRecipeDialog(true);
            setXBloomRecipeID(id);
            console.log("XBloom ID: " + showImportRecipeDialog);

          }
        }
      }
      // we want to handle share intent event in a specific page
      /*router.replace({
        pathname: "shareintent",
      });*/
    }
  }, [hasShareIntent]);




  useEffect(() => {
    var recipes = db.retrieveAllRecipes();
    // var xbloom = new XBloomRecipe("CMcQuqFPRw9E2xDQvFAZkg==");
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
          view: { backgroundColor: 'green' },
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

  async function onCloseImportCallback(){
    console.log("Close import callback");
    setShowImportRecipeDialog(false);
    setXBloomRecipeID("");
   // resetShareIntent();
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
        {showImportRecipeDialog ? <ImportRecipeComponent recipeId={xbloomRecipeID} onClose={()=>onCloseImportCallback()} /> : ""}
      </ScrollView>

    </>
  )
}