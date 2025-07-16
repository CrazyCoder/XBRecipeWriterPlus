import Recipe from "@/library/Recipe";
import RecipeDatabase from "@/library/RecipeDatabase";

import {IconElement} from "@ui-kitten/components";
import {useNavigation, useRouter} from "expo-router";
import React, {useEffect, useState} from "react";
import {Alert, Platform, Pressable, useColorScheme} from "react-native";

import {Button, View, XStack, YStack} from "tamagui";
import RecipeItem from "@/components/RecipeItem";
import {useFocusEffect} from "@react-navigation/native";

import {toast, ToastPosition} from "@backpackapp-io/react-native-toast";
import ImportRecipeComponent from "@/components/ImportRecipeComponent";
import {useShareIntentContext} from "expo-share-intent";
import AndroidNFCDialog from "@/components/AndroidNFCDialog";
import NFC from "@/library/NFC";
import Svg, {Path} from "react-native-svg";
import AntDesign from '@expo/vector-icons/AntDesign';
import Feather from '@expo/vector-icons/Feather';
import {XBloomRecipe} from "@/library/XBloomRecipe";

// @ts-ignore-next-line
import SwipeableFlatList from 'react-native-swipeable-list';

export default function HomeScreen() {
    const [recipesJSON, setRecipesJSON] = useState<string>("");
    const [showAndroidNFCDialog, setShowAndroidNFCDialog] = useState(false);
    const [showImportRecipeDialog, setShowImportRecipeDialog] = useState(false);
    const [readProgress, setReadProgress] = useState(0);
    const [xbloomRecipeID, setXBloomRecipeID] = useState<string | null>("");
    const [bounceFirstRowOnMount, setBounceFirstRowOnMount] = useState(true);
    const [key, setKey] = useState(0);
    const router = useRouter();
    const db = new RecipeDatabase();
    const navigation = useNavigation();

    const nfc = new NFC();

    const {hasShareIntent, shareIntent, error, resetShareIntent} = useShareIntentContext();

    const colorScheme = useColorScheme();


    function readCardIcon() {
        return (
            <Svg width="40" height="35" viewBox="0 0 24 24" fill="none">
                <Path
                    d="M2 8.5H14.5M6 16.5H8M10.5 16.5H14.5M22 14.03V16.11C22 19.62 21.11 20.5 17.56 20.5H6.44C2.89 20.5 2 19.62 2 16.11V7.89C2 4.38 2.89 3.5 6.44 3.5H14.5M20 3.5V9.5M20 9.5L22 7.5M20 9.5L18 7.5"
                    stroke="white" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>
            </Svg>
        )
    }

    useEffect(() => {
        navigation.setOptions({
            title: 'Recipes',
            headerShown: true,
            headerRight: () => <IconButton onPress={() => readCard()} title="" icon={readCardIcon()}/>
        })
    }, [navigation]);

    type IconProps = {
        title: string;
        onPress: () => void;
        icon: IconElement;
    }

    useFocusEffect(
        React.useCallback(() => {
            let recipes = db.retrieveAllRecipes();
            if (recipes) {
                setRecipesJSON(JSON.stringify(recipes));
            }
        }, [])
    )

    useEffect(() => {
        if (hasShareIntent) {
            console.log("Share intent received:" + JSON.stringify(shareIntent));

            if (shareIntent.type == "weburl" && shareIntent.webUrl) {
                let url = new URL(shareIntent.webUrl);
                if (url) {
                    let id = url.searchParams.get("id");
                    if (id) {
                        console.log("Showing import dialog for recipe id:" + id);
                        setShowImportRecipeDialog(() => true);
                        setXBloomRecipeID(() => id);
                        forceRefresh();
                        resetShareIntent();
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
        let recipes = db.retrieveAllRecipes();

        // when testing with an empty database, load sample recipes by IDs
        // (use `EXPO_PUBLIC_LOAD_RECIPE=CMcQuqFPRw9E2xDQvFAZkg==,KrTeDcmAIbv/0jrYKS4UtQ==,CpY80jg3CuKrSiO3YLruHg==` in .env.local)
        if (__DEV__ && process.env.EXPO_PUBLIC_LOAD_RECIPE !== undefined && recipes === null) {
            const recipeIds = process.env.EXPO_PUBLIC_LOAD_RECIPE.split(',');

            for (const recipeId of recipeIds) {
                let xbloom = new XBloomRecipe(recipeId.trim());
                xbloom.fetchRecipeDetail().then(() => {
                    if (xbloom) {
                        let rec = xbloom?.getRecipe();
                        if (rec && !db.doesTitleExist(rec.title)) {
                            db.insertRecipe(rec);
                        }
                    }
                });
            }

            recipes = db.retrieveAllRecipes();
        }

        if (recipes && recipes.length > 0) {
            setRecipesJSON(JSON.stringify(recipes));
        } else {
            setRecipesJSON("");
        }
    }, [key]);

    // loads the first recipe automatically for debugging / testing
    // (use `EXPO_PUBLIC_DEBUG_RECIPE_VIEW=true` in .env.local)
    if (__DEV__ && process.env.EXPO_PUBLIC_DEBUG_RECIPE_VIEW === "true") {
        useEffect(() => {
            const recipes = getRecipes();
            if (recipes && recipes.length > 0) {
                router.push({pathname: '/editRecipe', params: {recipeJSON: JSON.stringify(recipes[0])}});
            }
        }, [recipesJSON]);
    }

    function getRecipes(): Recipe[] {
        let recipes = [];
        if (recipesJSON && recipesJSON.length > 0) {
            let recipeData = JSON.parse(recipesJSON);
            for (let i = 0; i < recipeData.length; i++) {
                recipes.push(new Recipe(undefined, JSON.stringify(recipeData[i])));
            }
        }
        return recipes.sort((a: Recipe, b: Recipe) => a.title.localeCompare(b.title));
    }


    const IconButton = (props: IconProps) => (
        <Pressable onPress={props.onPress}>
            {props.icon}
        </Pressable>
    );


    async function onNFCDialogClose() {
        await nfc.close();
        setShowAndroidNFCDialog(false);
    }

    async function progressCallback(progress: number): Promise<string | undefined> {
        setReadProgress(progress);
        return undefined;
    }

    async function readCard() {
        setShowAndroidNFCDialog(true);
        setReadProgress(0);
        try {
            console.log('Read Card')
            let recipe = new Recipe();
            //toast("Hold your phone near the NFC tag");
            let success = await recipe.readCard(nfc, progressCallback);

            if (success) {
                if (Platform.OS === "ios") {
                    toast("Recipe read successfully", {
                        duration: 4000,
                        position: ToastPosition.TOP,
                        styles: {
                            view: {backgroundColor: 'green'},
                        }
                    });
                }
                setShowAndroidNFCDialog(false);


                //reenable
                router.push({pathname: '/editRecipe', params: {recipeJSON: JSON.stringify(recipe)}});
            }
        } catch (e) {
            console.log(e);
            setShowAndroidNFCDialog(false);
            Alert.alert("Error", "Could not read card. Please try again.");
        }

    }

    function forceRefresh() {
        setBounceFirstRowOnMount(false);
        setKey((prev) => prev + 1);
    }

    async function onCloseImportCallback() {
        console.log("Closing import dialog");
        setShowImportRecipeDialog(() => false);
        setXBloomRecipeID(() => "");
        forceRefresh();
    }

    interface RenderItemProps {
        item: { recipe: Recipe };
        recipe: Recipe;
    }

    function extractItemKey(item: Recipe) {
        return item.key;
    }

    function deleteRecipe(recipe: Recipe) {
        let db = new RecipeDatabase();
        db.deleteRecipe(recipe.uuid);
        forceRefresh();
    }

    function duplicateRecipe(recipe: Recipe) {
        console.log("Duplicating recipe:" + recipe.title);
        let db = new RecipeDatabase();
        db.cloneRecipe(recipe.uuid);
        forceRefresh();
    }

    return (
        <>
            <YStack alignItems="center" key={"recipekey" + key}
                    backgroundColor={colorScheme === "light" ? "#dddddd" : "black"} maxWidth="100%" paddingTop="$2"
                    flexDirection="column">
                {recipesJSON ?
                    (<SwipeableFlatList showsVerticalScrollIndicator={false} keyExtractor={extractItemKey}
                                        data={getRecipes()} renderItem={({item}: { item: Recipe }) => (
                            <View style={{maxWidth: 600}}>
                                <RecipeItem recipe={item} onPress={() => {
                                    router.push({pathname: '/editRecipe', params: {recipeJSON: JSON.stringify(item)}});
                                }}>
                                </RecipeItem>
                            </View>
                        )} renderQuickActions={({index, item}: { index: number; item: Recipe }) => (
                            <View style={{
                                maxWidth: 600,
                                justifyContent: "flex-end",
                                flex: 1,
                                flexDirection: "row",
                                alignItems: "center"
                            }}>
                                <XStack paddingRight="$2" height="60%" paddingVertical="$3">
                                    <Button onPress={() => deleteRecipe(item)} width={80} height="100%" marginRight="$1"
                                            alignItems="center" justifyContent="center" backgroundColor="red"
                                            borderColor="#ffa592" borderWidth={2} borderRadius={10}><AntDesign
                                        name="delete" size={25} color="white"/></Button>
                                    <Button onPress={() => duplicateRecipe(item)} width={80} height="100%"
                                            alignItems="center" justifyContent="center" backgroundColor="#dddddd"
                                            borderColor="#ffa592" borderWidth={2} borderRadius={10}>
                                        <Feather name="copy"
                                                 size={25}
                                                 color="black"/>
                                    </Button>
                                </XStack>
                            </View>
                        )}
                                        maxSwipeDistance={168}
                                        bounceFirstRowOnMount={bounceFirstRowOnMount}
                        >
                        </SwipeableFlatList>

                    ) : ""}
            </YStack>

            {showImportRecipeDialog && xbloomRecipeID ?
                <ImportRecipeComponent key={"import" + key} recipeId={xbloomRecipeID}
                                       onClose={() => onCloseImportCallback()}/> : ""}

            {Platform.OS !== "ios" && showAndroidNFCDialog ?
                <AndroidNFCDialog onClose={() => onNFCDialogClose()} progress={readProgress}></AndroidNFCDialog> : ""}

        </>
    )
}
