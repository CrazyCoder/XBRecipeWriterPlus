import ValidatedInput from "@/components/ValidatedInput";

import Recipe, {CUP_TYPE} from "@/library/Recipe";
import {AntDesign} from "@expo/vector-icons";
import {Icon, IconElement} from "@ui-kitten/components";
import {useLocalSearchParams, useNavigation} from "expo-router";
import React, {useEffect, useState} from "react";
import {Alert, Platform, Pressable, useColorScheme, useWindowDimensions} from "react-native";


import {Button, getTokens, H6, ScrollView, XStack, YStack} from "tamagui";
import {MyButtonGroup} from "@/components/MyButtonGroup";
import LabeledInput from "@/components/LabeledInput";
import RecipeDatabase from "@/library/RecipeDatabase";
import TotalVolumeComponent from "@/components/TotalVolumeComponent";
import TooltipComponent from "@/components/TooltipComponent";
import {toast} from "@backpackapp-io/react-native-toast";
import AndroidNFCDialog from "@/components/AndroidNFCDialog";
import NFC from "@/library/NFC";
import Svg, {Path} from "react-native-svg";
import Pour, {POUR_PATTERN} from "@/library/Pour";


export default function editRecipe() {
    let {recipeJSON, saveEnabled} = useLocalSearchParams();
    const [recipeInJSON, setRecipeInJSON] = useState<string>("");
    const [inputError, setInputError] = useState(false);
    const [titleChanged, setTitleChanged] = useState(false);
    const [enableSave, setEnableSave] = useState(saveEnabled && saveEnabled === "true");
    const [writeProgress, setWriteProgress] = useState(0);
    const [showAndroidNFCDialog, setShowAndroidNFCDialog] = useState(false);
    const [key, setKey] = useState(0);

    const ON_OFF_BUTTON_CONFIG = {
        buttons: [1, 0],
        getLabelText: (id: number) => id === 1 ? "On" : "Off"
    };

    const RECIPE_LABELS = {
        TITLE: "Title",
        XID: "XID",
        DOSE: "Dose (g)",
        RATIO: "Ratio",
        GRIND_SIZE: "Grind size",
        GRIND_RPM: "Grind RPM",
        GRINDER: "Grinder",
        CUP: "Cup",
        VOLUME: "Volume",
        TEMPERATURE: "Temperature (°C)",
        FLOW_RATE: "Flow rate (ml/s)",
        PAUSING: "Pausing (s)",
        PATTERN: "Pattern",
        AGITATION_BEFORE: "Agitation before",
        AGITATION_AFTER: "Agitation after"
    } as const;


    const nfc = new NFC();

    const navigation = useNavigation();
    const {height, width} = useWindowDimensions();
    const colorScheme = useColorScheme();


    useEffect(() => {
        navigation.setOptions({
            title: 'Edit Recipe',
            headerShown: true,
            headerRight: () => <IconButton onPress={() => writeCard()} title="" icon={writeCardIcon()}/>
        })
    }, [navigation, recipeInJSON]);

    type IconProps = {
        title: string;
        onPress: () => void;
        icon: IconElement;
    }

    function writeCardIcon() {
        return (
            <Svg width="40" height="35" viewBox="0 0 24 24" fill="none">
                <Path
                    d="M2,8.5h12.5M6,16.5h2M10.5,16.5h4M22,14.03v2.08c0,3.51-.89,4.39-4.44,4.39H6.44c-3.55,0-4.44-.88-4.44-4.39V7.89c0-3.51.89-4.39,4.44-4.39h8.06M20,9.5V3.5M20,3.5l-2,2M20,3.5l2,2"
                    stroke="white" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>
            </Svg>
        )
    }


    const IconButton = (props: IconProps) => (
        <Pressable onPress={props.onPress}>
            {props.icon}
        </Pressable>
    );

    function getRecipe(): Recipe | null {
        if (recipeInJSON && recipeInJSON !== "") {
            return new Recipe(undefined, recipeInJSON);
        }
        return null;
    }

    useEffect(() => {
        setRecipeInJSON(recipeJSON as string);
    }, []);

    async function onNFCDialogClose() {
        await nfc.close();
        setShowAndroidNFCDialog(false);
    }

    async function progressCallback(progress: number, id?: string): Promise<string | undefined> {
        console.log("Progress:" + progress);

        if (Platform.OS === "ios") {
            if (id && progress === 100) {
                toast("Writing Recipe to Card: 100%", {
                    id: id, styles: {
                        view: {backgroundColor: 'green'},
                    }
                });
            } else {
                if (id) {
                    toast("Writing Recipe to Card: " + Math.round(progress) + "%", {id: id});
                    return id;
                } else {
                    return toast("Writing Recipe to Card: " + Math.round(progress) + "%");
                }
            }
        } else {
            setWriteProgress(progress);
        }
        return undefined;
    }


    async function writeCard() {
        console.log('Write Card')
        try {
            let r = getRecipe();
            if (r !== null) {
                console.log(r);
                if (r.isPourVolumeValid()) {
                    //const id = toast("Writing Recipe to Card: 0");
                    if (Platform.OS !== "ios") {
                        setWriteProgress(0);
                        setShowAndroidNFCDialog(true);
                    }
                    await r.writeCard(nfc, progressCallback);
                    if (Platform.OS !== "ios") {
                        setShowAndroidNFCDialog(false);
                    }
                } else {
                    Alert.alert('Pour Volume Error', 'Your individual pour volumes must add up to the total volume', [
                        {
                            text: 'Ok',
                            onPress: () => console.log('Cancel Pressed'),
                        },
                    ]);
                }
            }
        } catch (e) {
            console.log("Write error!:" + e);
            setShowAndroidNFCDialog(false);
            Alert.alert('Write Error', 'There was an error writing the recipe to the card');
        }
    }

    const writeNFC = (props: any): IconElement => (
        <Icon
            {...props}
            name='upload-outline'
        />
    );

    function updateAgitation(pourNumber: number, isBefore: boolean, on: boolean) {
        let r = getRecipe();
        if (r) {
            if (isBefore) {
                r.pours[pourNumber].setAgitationBefore(on)
            } else {
                r.pours[pourNumber].setAgitationAfter(on)
            }
            setRecipeInJSON(() => JSON.stringify(r));
            setEnableSave(true);
        }
    }

    function deletePour(pourNumber: number) {
        let r = getRecipe();
        if (r && r.pours.length > 1) {
            r.deletePour(pourNumber);
            setRecipeInJSON(() => JSON.stringify(r));
            setKey((prev) => prev + 1);
            setEnableSave(true);
        }
    }

    function autoAdjustPourVolumes() {
        let r = getRecipe();
        if (r) {
            r.autoFixPourVolumes();
            setRecipeInJSON(() => JSON.stringify(r));
            setKey((prev) => prev + 1);
            setEnableSave(true);
        }
    }

    function addPour(pourNumber: number) {
        let r = getRecipe();
        if (r) {
            r.addPour(pourNumber);
            setRecipeInJSON(() => JSON.stringify(r));
            setKey((prev) => prev + 1);
            setEnableSave(true);
        }
    }

    function saveRecipe() {
        console.log("Save Recipe");
        console.log(recipeInJSON);
        let db = new RecipeDatabase();
        let recipe = getRecipe()!;
        if (recipe.isPourVolumeValid()) {
            if (titleChanged && db.doesTitleExist(recipe.title)) {
                let r = db.getRecipe(recipe.uuid);
                //if the changed title matches the title of a duplicate recipe that has the same uuid. Then we hit an edge case where the user modified the title, but then changed back to what it was originally.
                if (r?.title === recipe.title) {
                    db.updateRecipe(recipe.uuid, recipe);
                    navigation.goBack();
                } else {
                    Alert.alert('Save Error', 'The title of \"' + recipe.title + "\" already exists. Please choose a different name", [
                        {
                            text: 'Ok',
                            onPress: () => console.log('Cancel Pressed'),
                        },
                    ]);
                }
            } else {
                db.updateRecipe(recipe.uuid, recipe);
                navigation.goBack();
            }
        } else {
            Alert.alert('Pour Volume Error', 'Your individual pour volumes must add up to the total volume', [
                {
                    text: 'Ok',
                    onPress: () => console.log('Cancel Pressed'),
                },
            ]);
        }
    }

    async function editInputComplete(label: string, value: string, pourNumber?: number) {
        let recipe = getRecipe();
        if (recipe !== null) {
            switch (label) {
                case RECIPE_LABELS.GRINDER:
                    if (!isNaN(Number(value))) {
                        recipe.grinder = value === "1";
                        setRecipeInJSON(() => JSON.stringify(recipe));
                        setKey((prev) => prev + 1);
                        setEnableSave(true);
                    }
                    return;
                case RECIPE_LABELS.GRIND_SIZE:
                    if (!isNaN(Number(value))) {
                        recipe!.grindSize = Number(value);
                        setRecipeInJSON(() => JSON.stringify(recipe));
                        setEnableSave(true);
                        return;
                    }
                    return;
                case RECIPE_LABELS.GRIND_RPM:
                    if (!isNaN(Number(value))) {
                        recipe!.grindRPM = Number(value);
                        setRecipeInJSON(JSON.stringify(recipe));
                        setEnableSave(true);
                        return;

                    }
                    return;
                case RECIPE_LABELS.RATIO:
                    if (!isNaN(Number(value))) {
                        let val = Number(value)
                        recipe!.setRatio(val);
                        setRecipeInJSON(JSON.stringify(recipe));
                        setEnableSave(true);
                        return;
                    }
                    return;
                case RECIPE_LABELS.DOSE:
                    if (!isNaN(Number(value))) {
                        let val = Number(value)
                        recipe!.setDosage(val);
                        setRecipeInJSON(JSON.stringify(recipe));
                        setEnableSave(true);
                        return;
                    }
                    return;
                case RECIPE_LABELS.XID:
                    recipe!.xid = value;
                    setRecipeInJSON(JSON.stringify(recipe));
                    setEnableSave(true);
                    return;
                case RECIPE_LABELS.TITLE:
                    recipe!.title = value;
                    setTitleChanged(true);
                    setRecipeInJSON(JSON.stringify(recipe));
                    setEnableSave(true);
                    return;
                case RECIPE_LABELS.CUP:
                    recipe!.cupType = Number(value);
                    setRecipeInJSON(JSON.stringify(recipe));
                    setKey((prev) => prev + 1);
                    setEnableSave(true);
                    return;
                case RECIPE_LABELS.VOLUME:
                    if (pourNumber !== undefined) {
                        if (!isNaN(Number(value))) {
                            recipe!.pours[pourNumber].volume = Number(value);
                            setRecipeInJSON(() => JSON.stringify(recipe));
                            setEnableSave(true);
                        }
                    }
                    return;
                case RECIPE_LABELS.TEMPERATURE:
                    if (pourNumber !== undefined) {
                        if (!isNaN(Number(value))) {
                            recipe!.pours[pourNumber].temperature = Number(value);
                            setRecipeInJSON(JSON.stringify(recipe));
                            setEnableSave(true);
                            return;
                        }
                    }
                    return;
                case RECIPE_LABELS.FLOW_RATE:
                    if (pourNumber !== undefined) {
                        if (!isNaN(Number(value))) {
                            recipe!.pours[pourNumber].flowRate = Number(value);
                            setRecipeInJSON(JSON.stringify(recipe));
                            setEnableSave(true);
                            return;
                        }
                    }
                    return;
                case RECIPE_LABELS.PAUSING:
                    if (pourNumber !== undefined) {
                        if (!isNaN(Number(value))) {
                            recipe!.pours[pourNumber].pauseTime = Number(value);
                            setRecipeInJSON(JSON.stringify(recipe));
                            setEnableSave(true);
                            return;
                        }
                    }
                    return;
                case RECIPE_LABELS.PATTERN:
                    if (pourNumber !== undefined) {
                        if (!isNaN(Number(value))) {
                            recipe!.pours[pourNumber].pourPattern = Number(value);
                            setRecipeInJSON(JSON.stringify(recipe));
                            setEnableSave(true);
                            return;
                        }
                    }
                    return;
                default:
                    throw new Error("Unknown Edit Recipe Input field");
            }
        }
    }


    return (
        <>
            {recipeInJSON && getRecipe() && recipeInJSON !== "" ?
                <YStack maxWidth="100%" key={key}>
                    <XStack maxHeight="90%">
                        <ScrollView showsVerticalScrollIndicator={false} margin="$2" nestedScrollEnabled={true}>
                            <YStack maxWidth="100%">
                                <XStack>
                                    <LabeledInput setErrorFunction={setInputError} width={290} maxLength={100}
                                                  initialValue={getRecipe()!.title}
                                                  label={RECIPE_LABELS.TITLE}
                                                  onValidEditFunction={editInputComplete}
                                                  validateInput={(data) => {
                                                      return data.length > 0;

                                                  }}
                                                  errorMessage="You must have a title"/>
                                    <TooltipComponent paddingLeft="$2"
                                                      content="This is the title of the recipe for use in this app only. It is never stored on the card. So that's why this field is blank when you've just read in a card"/>

                                </XStack>
                                <XStack>
                                    <LabeledInput setErrorFunction={setInputError} width={110} maxLength={8}
                                                  initialValue={getRecipe()!.xid} label={RECIPE_LABELS.XID}
                                                  onValidEditFunction={editInputComplete}/>
                                    <TooltipComponent
                                        content="This is a 8 character unique identifier for the recipe that is used by the mobile app to look up the recipe online. It can be any alphanumeric value. Importantly, if you don't want the mobile app to show the wrong recipe, I'd probably change this. But if you do that, it won't show any recipe at all in the app (although it should still work on the machine) "/>
                                </XStack>
                                <ValidatedInput setErrorFunction={setInputError} initialValue={getRecipe()!.getDosage()}
                                                minimumValue={1} maximumValue={getRecipe()!.isTea() ? 10 : 25} step={1}
                                                label={RECIPE_LABELS.DOSE}
                                                maxLength={2} inputMode="numeric"
                                                onValidEditFunction={editInputComplete}/>
                                <ValidatedInput setErrorFunction={setInputError} initialValue={getRecipe()!.getRatio()}
                                                minimumValue={5} maximumValue={100} step={1} label={RECIPE_LABELS.RATIO}
                                                maxLength={3}
                                                inputMode="numeric" onValidEditFunction={editInputComplete}/>
                                {(getRecipe()!.grinder && !getRecipe()!.isTea()) && (
                                    <>
                                        <ValidatedInput setErrorFunction={setInputError}
                                                        initialValue={getRecipe()!.grindSize}
                                                        minimumValue={40} maximumValue={80} step={1}
                                                        label={RECIPE_LABELS.GRIND_SIZE}
                                                        maxLength={2} inputMode="numeric"
                                                        onValidEditFunction={editInputComplete}/>
                                        <ValidatedInput setErrorFunction={setInputError}
                                                        initialValue={getRecipe()!.grindRPM}
                                                        minimumValue={60} maximumValue={120} step={10}
                                                        label={RECIPE_LABELS.GRIND_RPM}
                                                        maxLength={3} inputMode="numeric"
                                                        onValidEditFunction={editInputComplete}/>
                                    </>
                                )}
                                <MyButtonGroup initialValue={"" + getRecipe()!.cupType} label={RECIPE_LABELS.CUP}
                                               size="$4" minWidth={"$5"}
                                               orientation="horizontal"
                                               onToggle={(val) => editInputComplete(RECIPE_LABELS.CUP, val)}
                                               buttons={Object.values(CUP_TYPE)}
                                               getLabelText={Recipe.getCupTypeText}
                                />
                                {!getRecipe()!.isTea() && (
                                    <>
                                        <MyButtonGroup initialValue={getRecipe()!.grinder ? "1" : "0"}
                                                       label={RECIPE_LABELS.GRINDER} size="$4" minWidth={"$5"}
                                                       orientation="horizontal"
                                                       onToggle={(val) => editInputComplete(RECIPE_LABELS.GRINDER, val)}
                                                       buttons={ON_OFF_BUTTON_CONFIG.buttons}
                                                       getLabelText={ON_OFF_BUTTON_CONFIG.getLabelText}
                                        />
                                    </>
                                )}
                                <XStack alignItems="center" flexWrap="wrap">
                                    <XStack>
                                        <TotalVolumeComponent recipe={getRecipe()!}/>
                                        <TooltipComponent
                                            content="This field shows the total volume of all of the pours vs the total volume based on your dosage and ratio (sum of all pour volumes / dose * ratio). The numbers need to match for the valid recipe that the machine will accept. Ajust pour volumes, ratio and dose as needed."/>
                                    </XStack>
                                    <Button borderWidth={2}
                                            pressStyle={{backgroundColor: "#de4f00", borderColor: "gray"}}
                                            borderColor="gray" paddingHorizontal="$3" paddingVertical="$2"
                                            marginLeft="$2" marginVertical="$2" backgroundColor="#ff7036" color="white"
                                            onPress={() => autoAdjustPourVolumes()}>Auto</Button>
                                </XStack>

                                <ScrollView showsHorizontalScrollIndicator={false} centerContent={true} horizontal
                                            pagingEnabled={true} nestedScrollEnabled={true} removeClippedSubviews={true}
                                            disableScrollViewPanResponder={true}>
                                    {getRecipe() ? getRecipe()!.pours.map((pour, index) => (
                                        <YStack width={width - getTokens().size["$2"].val} key={index} borderWidth={2}
                                                borderColor="gray" marginInline="$2" borderRadius={10}>
                                            <YStack padding="$2">
                                                <XStack justifyContent="space-between">
                                                    <H6 fontSize={20}
                                                        fontWeight={700}>Pour {pour.getPourNumber()} of {getRecipe()?.pours.length}</H6>
                                                    <XStack paddingRight="$2">
                                                        <XStack paddingRight="$2">
                                                            <IconButton onPress={() => deletePour(index)} title=""
                                                                        icon={<AntDesign name="closesquareo" size={24}
                                                                                         color="red"/>}></IconButton>
                                                        </XStack>
                                                        <IconButton onPress={() => addPour(index)} title=""
                                                                    icon={<AntDesign name="plussquareo" size={24}
                                                                                     color="green"/>}></IconButton>
                                                    </XStack>
                                                </XStack>
                                                <ValidatedInput setErrorFunction={setInputError}
                                                                initialValue={pour.getVolume()} minimumValue={1}
                                                                maximumValue={getRecipe()!.isTea() ? 90 : 240} step={1}
                                                                pourNumber={index} label={RECIPE_LABELS.VOLUME}
                                                                maxLength={3}
                                                                inputMode="numeric" style={{maxWidth: 100}}
                                                                onValidEditFunction={editInputComplete}/>

                                                <ValidatedInput setErrorFunction={setInputError}
                                                                initialValue={pour.getTemperature()} minimumValue={39}
                                                                maximumValue={99} step={1} pourNumber={index}
                                                                label={RECIPE_LABELS.TEMPERATURE} maxLength={2}
                                                                inputMode="numeric"
                                                                onValidEditFunction={editInputComplete}/>

                                                <ValidatedInput setErrorFunction={setInputError}
                                                                initialValue={pour.getFlowRate()} minimumValue={30}
                                                                maximumValue={35} step={1} floatingPoint
                                                                pourNumber={index} label={RECIPE_LABELS.FLOW_RATE}
                                                                maxLength={4}
                                                                inputMode="decimal"
                                                                onValidEditFunction={editInputComplete}/>

                                                <ValidatedInput setErrorFunction={setInputError}
                                                                initialValue={pour.getPauseTime()} minimumValue={0}
                                                                maximumValue={getRecipe()!.isTea() ? 255 : 59} step={1}
                                                                pourNumber={index} label={RECIPE_LABELS.PAUSING}
                                                                maxLength={3}
                                                                inputMode="numeric"
                                                                onValidEditFunction={editInputComplete}/>

                                                <MyButtonGroup initialValue={"" + pour.getPourPattern()} minWidth={"$6"}
                                                               label="Pattern" size="$4" orientation="horizontal"
                                                               onToggle={(val) => editInputComplete(RECIPE_LABELS.PAUSING, val, index)}
                                                               buttons={Object.values(POUR_PATTERN)}
                                                               getLabelText={Pour.getPourPatternText}
                                                />
                                                {!getRecipe()!.isTea() && (
                                                    <>
                                                        <MyButtonGroup
                                                            initialValue={pour.getAgitationBefore() ? "1" : "0"}
                                                            label={RECIPE_LABELS.AGITATION_AFTER} size="$4"
                                                            minWidth={"$11"}
                                                            orientation="horizontal"
                                                            onToggle={(val) => updateAgitation(index, true, val === "1")}
                                                            buttons={ON_OFF_BUTTON_CONFIG.buttons}
                                                            getLabelText={ON_OFF_BUTTON_CONFIG.getLabelText}

                                                        />
                                                        <MyButtonGroup
                                                            initialValue={pour.getAgitationAfter() ? "1" : "0"}
                                                            label={RECIPE_LABELS.AGITATION_AFTER} size="$4"
                                                            minWidth={"$11"}
                                                            orientation="horizontal"
                                                            onToggle={(val) => updateAgitation(index, false, val === "1")}
                                                            buttons={ON_OFF_BUTTON_CONFIG.buttons}
                                                            getLabelText={ON_OFF_BUTTON_CONFIG.getLabelText}
                                                        />
                                                    </>
                                                )}
                                            </YStack>
                                        </YStack>
                                    )) : ""}
                                </ScrollView>
                            </YStack>
                        </ScrollView>
                    </XStack>
                    <XStack paddingVertical="$3" justifyContent="center" alignContent="center" alignItems="center">
                        <Button onPress={() => saveRecipe()} width={200} fontSize={16} fontWeight={700}
                                disabled={inputError || !enableSave} color="white"
                                backgroundColor={inputError || !enableSave ? "#f59d7d" : "#f4511e"}>Save</Button>
                    </XStack>
                    {Platform.OS !== "ios" && showAndroidNFCDialog ?
                        <AndroidNFCDialog onClose={() => onNFCDialogClose()}
                                          progress={writeProgress}></AndroidNFCDialog> : ""}
                </YStack>
                : ""}

        </>
    )
}
