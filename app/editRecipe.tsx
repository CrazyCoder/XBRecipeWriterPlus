import ValidatedInput from "@/components/ValidatedInput";

import Recipe, {CUP_TYPE} from "@/library/Recipe";
import {AntDesign} from "@expo/vector-icons";
import {Icon, IconElement} from "@ui-kitten/components";
import {useLocalSearchParams, useNavigation} from "expo-router";
import React, {useEffect, useMemo, useState} from "react";
import {ActivityIndicator, Alert, Platform, Pressable, useColorScheme, useWindowDimensions} from "react-native";


import {Adapt, Button, Dialog, Fieldset, getTokens, H6, ScrollView, Sheet, XStack, YStack} from "tamagui";
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
import {XBloomRecipe} from "@/library/XBloomRecipe";


export default function editRecipe() {
    const {recipeJSON, saveEnabled} = useLocalSearchParams();
    const [recipeInJSON, setRecipeInJSON] = useState<string>("");
    const [inputError, setInputError] = useState(false);
    const [titleChanged, setTitleChanged] = useState(false);
    const [enableSave, setEnableSave] = useState(saveEnabled && saveEnabled === "true");
    const [writeProgress, setWriteProgress] = useState(0);
    const [showAndroidNFCDialog, setShowAndroidNFCDialog] = useState(false);
    const [key, setKey] = useState(0);
    const [isLoadingTitle, setIsLoadingTitle] = useState(false);
    const [showRestoreDialog, setShowRestoreDialog] = useState(false);
    const [restoreOptions, setRestoreOptions] = useState<Array<{
        id: string;
        label: string;
        action: () => Promise<void>;
    }>>([]);


    // Cache the Recipe object using useMemo
    const cachedRecipe = useMemo<Recipe | null>(() => {
        if (recipeInJSON && recipeInJSON !== "") {
            return new Recipe(undefined, recipeInJSON);
        }
        return null;
    }, [recipeInJSON]);

    const ON_OFF_BUTTON_CONFIG = {
        buttons:      [1, 0],
        getLabelText: (id: number) => id === 1 ? "On" : "Off"
    };

    const RECIPE_LABELS = {
        TITLE:            "Title",
        XID:              "XID",
        DOSE:             "Dose (g)",
        RATIO:            "Ratio",
        GRIND_SIZE:       "Grind size",
        GRIND_RPM:        "Grind RPM",
        GRINDER:          "Grinder",
        CUP:              "Cup",
        VOLUME:           "Volume",
        TEMPERATURE:      "Temperature (°C)",
        FLOW_RATE:        "Flow rate (ml/s)",
        PAUSING:          "Pausing (s)",
        PATTERN:          "Pattern",
        AGITATION_BEFORE: "Agitation before",
        AGITATION_AFTER:  "Agitation after"
    } as const;


    const nfc = new NFC();

    const navigation = useNavigation();
    const {height, width} = useWindowDimensions();
    const colorScheme = useColorScheme();


    useEffect(() => {
        navigation.setOptions({
            title:       'Edit Recipe',
            headerShown: true,
            headerRight: () => <IconButton onPress={() => writeCard()} title="" icon={writeCardIcon()}/>
        })
    }, [navigation, recipeInJSON]);

    const fetchRecipeTitle = async (recipe: Recipe) => {
        setIsLoadingTitle(true);

        try {
            const xbRecipe = new XBloomRecipe(recipe.xid);
            await xbRecipe.fetchRecipeDetail();

            let recipeTitle = xbRecipe.getRecipeTitle();
            if (recipeTitle.length > 0) {
                // Update the current recipe with the fetched title
                recipe.title = recipeTitle;
                // Also get shareID for restore feature if not already present
                let xbr = xbRecipe.getRecipe();
                if (xbr && xbr.shareId.length > 0 && recipe.shareId.length == 0) {
                    recipe.shareId = xbr.shareId;
                }
                if (xbr && xbr.offline_backup.length > 0 && recipe.offline_backup.length == 0) {
                    recipe.offline_backup = xbr.offline_backup;
                }
                setRecipeInJSON(JSON.stringify(recipe));
                setTitleChanged(true);
                setEnableSave(true);
            }
        } catch (error) {
            console.log("Failed to fetch recipe title:", error);
        } finally {
            setIsLoadingTitle(false);
        }
    };

    useEffect(() => {
        const recipe = getRecipe();
        // Only fetch if we have a recipe with XID but no title
        if (recipe && recipe.xid && recipe.title.length == 0) {
            fetchRecipeTitle(recipe);
        }
    }, [recipeInJSON]);

    const handleReloadTitlePress = async () => {
        const recipe = getRecipe();
        if (recipe && recipe.xid) {
            await fetchRecipeTitle(recipe);
        }
    };

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
        return cachedRecipe;
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
                        view: {backgroundColor: 'green'}
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
                            text:    'Ok',
                            onPress: () => console.log('Cancel Pressed')
                        }
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
            name="upload-outline"
        />
    );


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
            // Limit tea recipes to maximum 3 pours
            if (r.isTea() && r.pours.length >= 3) {
                Alert.alert('Pour Limit', 'Tea recipes are limited to a maximum of 3 pours', [
                    {
                        text:    'Ok',
                        onPress: () => console.log('Pour limit reached')
                    }
                ]);
                return;
            }
            r.addPour(pourNumber);
            setRecipeInJSON(() => JSON.stringify(r));
            setKey((prev) => prev + 1);
            setEnableSave(true);
        }
    }

    const RestoreDialog = () => {
        const [isRestoring, setIsRestoring] = useState(false);

        const handleRestoreAction = async (action: () => Promise<void>) => {
            setIsRestoring(true);
            try {
                await action();
            } catch (error) {
                console.error("Failed to restore recipe:", error);
                toast(`${error}`, {
                    styles: {
                        view: {backgroundColor: 'rose'}
                    }
                });
            } finally {
                setIsRestoring(false);
                setShowRestoreDialog(false);
                setKey((prev) => prev + 1);
            }
        };

        return (
            <Dialog modal open={showRestoreDialog} onOpenChange={setShowRestoreDialog}>
                <Adapt platform="touch">
                    <Sheet
                        snapPoints={[Math.min(40 + restoreOptions.length * 15, 80), 90]}
                        zIndex={200000} modal dismissOnSnapToBottom>
                        <Sheet.Frame padding="$4">
                            <Adapt.Contents/>
                        </Sheet.Frame>
                        <Sheet.Overlay
                            animation="quick"
                            enterStyle={{opacity: 0}}
                            exitStyle={{opacity: 0}}
                        />
                    </Sheet>
                </Adapt>

                <Dialog.Portal>
                    <Dialog.Overlay key="overlay" opacity={0.5}/>
                    <Dialog.Content bordered elevate gap="$4" maxWidth={400}>
                        <Dialog.Title alignSelf="center" fontWeight={600}>
                            Restore Recipe
                        </Dialog.Title>
                        <Dialog.Description textAlign="center">
                            Choose how you would like to restore this recipe:
                        </Dialog.Description>

                        <Fieldset gap="$3" marginTop={"$3"}>
                            {restoreOptions.map((option) => (
                                <YStack key={option.id} gap="$2">
                                    <Button marginTop={"$2"}
                                            theme="red"
                                            onPress={() => handleRestoreAction(option.action)}
                                            size="$4"
                                            disabled={isRestoring}
                                            opacity={isRestoring ? 0.5 : 1}>
                                        {option.label}
                                    </Button>
                                </YStack>
                            ))}
                            <XStack alignItems="center" gap="$2" justifyContent="center">
                                <ActivityIndicator size="large" color="gray" animating={isRestoring}/>
                            </XStack>
                        </Fieldset>

                        <XStack justifyContent="center" paddingTop="$4">
                            <Button
                                theme="active"
                                onPress={() => setShowRestoreDialog(false)}>
                                Cancel
                            </Button>
                        </XStack>
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog>
        );
    };

    function restoreRecipe() {
        const alwaysKeepFields = ['uuid', 'backup', 'title'];

        const recipe = getRecipe();
        if (!recipe) return;

        const options: Array<{
            id: string;
            label: string;
            action: () => Promise<void>;
        }> = [];

        function keepSettingsAndSave(
            restoredRecipe: Recipe,
            fieldsToKeep: Array<keyof Recipe> = []
        ) {
            if (!recipe) return;
            let keepFields = [...alwaysKeepFields, ...fieldsToKeep];

            for (const field of keepFields) {
                const value = (recipe as any)[field];

                if (
                    value !== undefined &&
                    ((((typeof value === 'string') || (typeof value === 'object'))
                            && value.length > 0) ||
                        typeof value === 'boolean' ||
                        typeof value === 'number')
                ) {
                    (restoredRecipe as any)[field] = value;
                }
            }
            setRecipeInJSON(JSON.stringify(restoredRecipe));
            setEnableSave(true);
        }

        // Check for NFC backup data
        if (recipe.backup && recipe.backup.length > 0) {
            options.push({
                id:     'nfc',
                label:  'Restore from NFC card backup',
                action: async () => {
                    const restoredRecipe = new Recipe(recipe.backup);
                    // keep shareId
                    keepSettingsAndSave(restoredRecipe, ['shareId', 'offline_backup']);
                    toast("Recipe restored from NFC backup");
                }
            });
        }

        // Check for offline backup from the online database
        if (recipe.offline_backup && recipe.offline_backup.length > 0) {
            options.push({
                id:     'offline',
                label:  'Restore from offline backup',
                action: async () => {
                    const restoredRecipe = new Recipe(recipe.offline_backup, undefined, false);
                    // keep shareId
                    keepSettingsAndSave(restoredRecipe, ['shareId', 'offline_backup']);
                    toast("Recipe restored from offline backup");
                }
            });
        }

        // Check for XID
        if (recipe.xid && recipe.xid.trim().length > 0) {
            options.push({
                id:     'xid',
                label:  'Restore by XID from online database',
                action: async () => {
                    const xbRecipe = new XBloomRecipe(recipe.xid);
                    await xbRecipe.fetchRecipeDetail();
                    const restoredRecipe = xbRecipe.getRecipe();
                    if (restoredRecipe) {
                        // keep shareId and cup type in case user has customized it
                        // (default recipeVo for the same XID may have a different cup type)
                        keepSettingsAndSave(restoredRecipe, ['shareId', 'cupType']);
                        toast("Recipe restored by XID");
                    } else {
                        throw new Error('Could not fetch recipe data using XID');
                    }
                }
            });
        }

        // Check for shareId
        if (recipe.shareId && recipe.shareId.trim().length > 0) {
            options.push({
                id:     'shareId',
                label:  'Restore by Share Link from online database',
                action: async () => {
                    const xbRecipe = new XBloomRecipe(recipe.shareId);
                    await xbRecipe.fetchRecipeDetail();
                    const restoredRecipe = xbRecipe.getRecipe();
                    if (restoredRecipe) {
                        // keep original XID
                        keepSettingsAndSave(restoredRecipe, ['xid']);
                        toast("Recipe restored by Share Link");
                    } else {
                        throw new Error('Could not fetch recipe data using Share Link');
                    }
                }
            });
        }

        if (options.length === 0) {
            Alert.alert('No Restore Options', 'This recipe has no available restore options (no NFC backup, XID, or Share ID found)');
            return;
        }

        setRestoreOptions(options);
        setShowRestoreDialog(true);
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
                            text:    'Ok',
                            onPress: () => console.log('Cancel Pressed')
                        }
                    ]);
                }
            } else {
                db.updateRecipe(recipe.uuid, recipe);
                navigation.goBack();
            }
        } else {
            Alert.alert('Pour Volume Error', 'Your individual pour volumes must add up to the total volume', [
                {
                    text:    'Ok',
                    onPress: () => console.log('Cancel Pressed')
                }
            ]);
        }
    }

    async function editInputComplete(label: string, value: string, pourNumber?: number) {
        let recipe = getRecipe();
        if (recipe === null) return;

        // Recipe settings
        const fieldConfigs: Record<string, {
            requiresNumber: boolean;
            update: (r: Recipe, val: string) => void;
        }> = {
            [RECIPE_LABELS.GRINDER]:    {
                requiresNumber: true,
                update:         (r: Recipe, val: string) => {
                    r.grinder = val === "1";
                    setKey((prev) => prev + 1);
                }
            },
            [RECIPE_LABELS.GRIND_SIZE]: {
                requiresNumber: true,
                update:         (r: Recipe, val: string) => r.grindSize = Number(val)
            },
            [RECIPE_LABELS.GRIND_RPM]:  {
                requiresNumber: true,
                update:         (r: Recipe, val: string) => r.grindRPM = Number(val)
            },
            [RECIPE_LABELS.RATIO]:      {
                requiresNumber: true,
                update:         (r: Recipe, val: string) => r.ratio = Number(val)
            },
            [RECIPE_LABELS.DOSE]:       {
                requiresNumber: true,
                update:         (r: Recipe, val: string) => r.dosage = Number(val)
            },
            [RECIPE_LABELS.XID]:        {
                requiresNumber: false,
                update:         (r: Recipe, val: string) => r.xid = val
            },
            [RECIPE_LABELS.TITLE]:      {
                requiresNumber: false,
                update:         (r: Recipe, val: string) => {
                    r.title = val;
                    setTitleChanged(true);
                }
            },
            [RECIPE_LABELS.CUP]:        {
                requiresNumber: false,
                update:         (r: Recipe, val: string) => {
                    r.cupType = Number(val);
                }
            }
        };

        // Handle pour-specific settings
        const pourFields: Record<string, (r: Recipe, val: string, pourNum: number) => void> = {
            [RECIPE_LABELS.VOLUME]:           (r: Recipe, val: string, pourNum: number) =>
                                                  r.pours[pourNum].volume = Number(val),
            [RECIPE_LABELS.TEMPERATURE]:      (r: Recipe, val: string, pourNum: number) =>
                                                  r.pours[pourNum].temperature = Number(val),
            [RECIPE_LABELS.FLOW_RATE]:        (r: Recipe, val: string, pourNum: number) =>
                                                  r.pours[pourNum].flowRate = Number(val),
            [RECIPE_LABELS.PAUSING]:          (r: Recipe, val: string, pourNum: number) =>
                                                  r.pours[pourNum].pauseTime = Number(val),
            [RECIPE_LABELS.PATTERN]:          (r: Recipe, val: string, pourNum: number) =>
                                                  r.pours[pourNum].pourPattern = Number(val),
            [RECIPE_LABELS.AGITATION_BEFORE]: (r: Recipe, val: string, pourNum: number) =>
                                                  r.pours[pourNum].setAgitationBefore(val === "1"),
            [RECIPE_LABELS.AGITATION_AFTER]:  (r: Recipe, val: string, pourNum: number) =>
                                                  r.pours[pourNum].setAgitationAfter(val === "1")
        };

        // Handle regular fields
        const fieldConfig = fieldConfigs[label];
        if (fieldConfig) {
            // Skip validation for non-numeric fields or validate numeric ones
            if (!fieldConfig.requiresNumber || !isNaN(Number(value))) {
                fieldConfig.update(recipe, value);
                setRecipeInJSON(JSON.stringify(recipe));
                setEnableSave(true);
            }
            return;
        }

        // Handle pour-specific fields
        const pourField = pourFields[label];
        if (pourField) {
            if (pourNumber !== undefined && !isNaN(Number(value))) {
                pourField(recipe, value, pourNumber);
                setRecipeInJSON(JSON.stringify(recipe));
                setEnableSave(true);
            }
            return;
        }

        throw new Error("Unknown Edit Recipe Input field");
    }

    return (
        <>
            {recipeInJSON && getRecipe() && recipeInJSON !== "" ?
                <YStack maxWidth="100%" key={key} flex={1}>
                    <XStack flex={1}>
                        <ScrollView showsVerticalScrollIndicator={false} margin="$2" nestedScrollEnabled={true}>
                            <YStack maxWidth="100%">
                                <XStack alignItems="center">
                                    <LabeledInput setErrorFunction={setInputError} maxLength={100}
                                                  initialValue={getRecipe()!.title}
                                                  label={RECIPE_LABELS.TITLE}
                                                  onValidEditFunction={editInputComplete}
                                                  validateInput={(data) => {
                                                      return data.length > 0;
                                                  }}
                                                  errorMessage="You must have a title"
                                                  key={`title-${isLoadingTitle}`}
                                                  disabled={isLoadingTitle}
                                    />
                                    <XStack paddingLeft={"$4"} paddingRight={"$3"}>
                                        <Pressable onPress={handleReloadTitlePress} disabled={isLoadingTitle}>
                                            {isLoadingTitle ? (
                                                <ActivityIndicator size={30} color="gray"/>
                                            ) : (
                                                <AntDesign name="sync" size={30} color="gray"/>
                                            )}
                                        </Pressable>
                                    </XStack>
                                </XStack>
                                <XStack>
                                    <LabeledInput setErrorFunction={setInputError} maxLength={7}
                                                  initialValue={getRecipe()!.xid} label={RECIPE_LABELS.XID}
                                                  onValidEditFunction={editInputComplete}/>
                                    <XStack flex={1} paddingLeft={"$2"}>
                                        <TooltipComponent
                                            content="6-character recipe ID used by the app to find recipes online. Format: <VENDOR>[T]<NUM> (3-char vendor code, optional T for tea, 2-3 digit number). Remove or change to prevent wrong recipe display in app (machine will still work)."/>
                                    </XStack>
                                </XStack>
                                <ValidatedInput setErrorFunction={setInputError} initialValue={getRecipe()!.dosage}
                                                minimumValue={1} maximumValue={getRecipe()!.isTea() ? 10 : 31} step={1}
                                                label={RECIPE_LABELS.DOSE}
                                                maxLength={2} inputMode="numeric"
                                                onValidEditFunction={editInputComplete}/>
                                <ValidatedInput setErrorFunction={setInputError} initialValue={getRecipe()!.ratio}
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
                                {!getRecipe()!.isTea() && (
                                    <>
                                        <XStack>
                                            <MyButtonGroup initialValue={"" + getRecipe()!.cupType}
                                                           label={RECIPE_LABELS.CUP}
                                                           size="$4" minWidth={"$5"}
                                                           orientation="horizontal"
                                                           onToggle={(val) => editInputComplete(RECIPE_LABELS.CUP, val)}
                                                           buttons={[CUP_TYPE.XPOD, CUP_TYPE.OMNI, CUP_TYPE.OTHER]}
                                                           getLabelText={Recipe.getCupTypeText}
                                            />
                                            <TooltipComponent
                                                content={"Omni type disables overflow protection. Other type is used for third-party brewers."}/>
                                        </XStack>
                                        <XStack>
                                            <MyButtonGroup initialValue={getRecipe()!.grinder ? "1" : "0"}
                                                           label={RECIPE_LABELS.GRINDER} size="$4" minWidth={"$5"}
                                                           orientation="horizontal"
                                                           onToggle={(val) => editInputComplete(RECIPE_LABELS.GRINDER, val)}
                                                           buttons={ON_OFF_BUTTON_CONFIG.buttons}
                                                           getLabelText={ON_OFF_BUTTON_CONFIG.getLabelText}
                                            />
                                            <TooltipComponent
                                                content={"Disabling grinder is experimental. It sets grind size to 81 (instead of 80 max). However, machine will not accept the card with the grinder disabled. As a workaround, you can load any other recipe with the grinder enabled first, either via a shortcut button, another card or an app. Once any other recipe is already loaded, the card with disabled grinder will work and you'll see '--' for the grind size. At the moment there is no better way to disable grinder from the recipe card."}/>
                                        </XStack>
                                    </>
                                )}
                                <XStack alignItems="center" flexWrap="wrap">
                                    <XStack>
                                        <TotalVolumeComponent recipe={getRecipe()!}/>
                                        <TooltipComponent
                                            content={"This field shows the total volume of all pours versus the total volume based on your dosage and ratio (sum of all pour volumes / dose × ratio). The numbers need to match for a valid recipe that the machine will accept. Adjust pour volumes, ratio, and dose as needed.\n\nTea recipes show 90ml per pour, but the actual volume in the cup will be 120ml per pour since the machine automatically adds ~30ml to trigger the siphon. If the siphon triggers prematurely due to wet leaf expansion, reduce the volume of the latter steeps."}/>
                                    </XStack>
                                    <Button borderWidth={2} flex={1}
                                            pressStyle={{backgroundColor: "#de4f00", borderColor: "gray"}}
                                            borderColor="gray" paddingHorizontal="$3" paddingVertical="$2"
                                            marginHorizontal="$2" marginVertical="$2" backgroundColor="#f4511e"
                                            fontWeight={700} fontSize="$5" color="white"
                                            onPress={() => autoAdjustPourVolumes()}>
                                        Auto
                                    </Button>
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
                                                                maximumValue={getRecipe()!.isTea() ? 360 : 59} step={1}
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
                                                            label={RECIPE_LABELS.AGITATION_BEFORE} size="$4"
                                                            minWidth={"$11"}
                                                            orientation="horizontal"
                                                            onToggle={(val) => editInputComplete(RECIPE_LABELS.AGITATION_BEFORE, val, index)}
                                                            buttons={ON_OFF_BUTTON_CONFIG.buttons}
                                                            getLabelText={ON_OFF_BUTTON_CONFIG.getLabelText}

                                                        />
                                                        <MyButtonGroup
                                                            initialValue={pour.getAgitationAfter() ? "1" : "0"}
                                                            label={RECIPE_LABELS.AGITATION_AFTER} size="$4"
                                                            minWidth={"$11"}
                                                            orientation="horizontal"
                                                            onToggle={(val) => editInputComplete(RECIPE_LABELS.AGITATION_AFTER, val, index)}
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
                    <XStack paddingVertical="$2" justifyContent="center" alignContent="center" alignItems="center"
                            backgroundColor="$backgroundFocus">
                        <Button marginHorizontal={"$2"} onPress={() => restoreRecipe()} width={150} fontSize={16}
                                fontWeight={700}
                                color="white" backgroundColor="#f4511e">Restore</Button>
                        <Button marginHorizontal={"$4"} onPress={() => saveRecipe()} width={150} fontSize={16}
                                fontWeight={700}
                                disabled={inputError || !enableSave} color="white"
                                backgroundColor={inputError || !enableSave ? "#f59d7d" : "#f4511e"}>Save</Button>
                    </XStack>
                    {Platform.OS !== "ios" && showAndroidNFCDialog ?
                        <AndroidNFCDialog onClose={() => onNFCDialogClose()}
                                          progress={writeProgress}></AndroidNFCDialog> : ""}
                    <RestoreDialog/>
                </YStack>
                : ""}
        </>
    )
}
