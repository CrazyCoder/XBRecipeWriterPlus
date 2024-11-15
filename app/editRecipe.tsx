import ValidatedInput from "@/components/ValidatedInput";
import PatternButtonGroup from "@/components/PatternButtonGroup";

import Recipe from "@/library/Recipe";
import { AntDesign } from "@expo/vector-icons";
import { Icon, IconElement } from "@ui-kitten/components";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Pressable } from "react-native";

import { YStack, H6, XStack, ScrollView, Button } from "tamagui";
import OnOffButtonGroup from "@/components/OnOffButtonGroup";
import LabeledInput from "@/components/LabeledInput";
import RecipeDatabase from "@/library/RecipeDatabase";
import TotalVolumeComponent from "@/components/TotalVolumeComponent";
import TooltipComponent from "@/components/TooltipComponent";

//const recipeJSON = "{\"title\":\"\",\"xid\":\"VER009\",\"ratio\":16,\"grindSize\":64,\"grindRPM\":120,\"pours\":[{\"pourNumber\":1,\"volume\":45,\"temperature\":95,\"flowRate\":30,\"agitation\":2,\"pourPattern\":2,\"pauseTime\":30},{\"pourNumber\":2,\"volume\":50,\"temperature\":94,\"flowRate\":35,\"agitation\":2,\"pourPattern\":2,\"pauseTime\":15},{\"pourNumber\":3,\"volume\":50,\"temperature\":93,\"flowRate\":35,\"agitation\":0,\"pourPattern\":2,\"pauseTime\":12},{\"pourNumber\":4,\"volume\":50,\"temperature\":93,\"flowRate\":35,\"agitation\":2,\"pourPattern\":1,\"pauseTime\":15},{\"pourNumber\":5,\"volume\":45,\"temperature\":92,\"flowRate\":35,\"agitation\":2,\"pourPattern\":1,\"pauseTime\":256}],\"prefixArray\":[249,24,80,207,4,14,81,85,240,235,57,87,169,254,224,164,137,252,56,196,242,173,180,175,25,224,148,168,125,239,237,40],\"suffixArray\":[24,16,237,0,244,0,0,35,25,17,130,0,251,0,0,35,23,15,97,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]}";



export default function editRecipe() {
  var { recipeJSON, saveEnabled } = useLocalSearchParams()
  const [recipeInJSON, setRecipeInJSON] = useState<string>("");
  const [inputError, setInputError] = useState(false);
  const [enableSave, setEnableSave] = useState(saveEnabled && saveEnabled === "true");
  const [enableMachineRatio, setEnableMachineRatio] = useState(false);
  const [key, setKey] = useState(0);



  const navigation = useNavigation();

  type IconProps = {
    title: string;
    onPress: () => void;
    icon: IconElement;
  }


  const IconButton = (props: IconProps) => (
    <Pressable onPress={props.onPress}>
      {props.icon}
    </Pressable>
  );

  function getRecipe(): Recipe | null {
    if (recipeInJSON && recipeInJSON !== "") {
      var r = new Recipe(undefined, recipeInJSON);
      return r;
    }
    return null;
  }

  useEffect(() => {
    setRecipeInJSON(recipeJSON as string);
  }, []);

  useEffect(() => {
    var r = getRecipe();
    if (r && r.isXPodDosage()) {
      setEnableMachineRatio(() => false);
    } else {
      setEnableMachineRatio(() => true);
    }

  }, [recipeInJSON]);


  useEffect(() => {

    //setRecipe(()=>r)

    navigation.setOptions({
      title: 'Edit Recipe',
      headerShown: true,
      headerRight: () => <IconButton onPress={() => writeCard()} title="" icon={<AntDesign name="upload" size={24} color="black" />
      }></IconButton>,
    })
  }, [navigation, recipeInJSON]);







  async function writeCard() {
    console.log('Write Card')
    try {
      var r = getRecipe();
      if (r !== null) {
        console.log(r);
        if (r.isPourVolumeValid()) {
          //const id = toast("Writing Recipe to Card: 0");
          await r.writeCard();
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
    var r = getRecipe();
    if (r) {
      if (isBefore) {
        r.pours[pourNumber].setAgitationBefore(on)
      } else {
        r.pours[pourNumber].setAgitationAfter(on)
      }
      setRecipeInJSON(() => JSON.stringify(r));
    }
  }

  function deletePour(pourNumber: number) {
    var r = getRecipe();
    if (r && r.pours.length > 1) {
      r.deletePour(pourNumber);
      setRecipeInJSON(() => JSON.stringify(r));
      setKey((prev) => prev + 1);
      setEnableSave(true);

    }
  }

  function addPour(pourNumber: number) {

    var r = getRecipe();
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
    var db = new RecipeDatabase();
    var recipe = getRecipe()!;
    if (recipe.isPourVolumeValid()) {
      if(!db.doesTitleExist(recipe.title)) {
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
      Alert.alert('Pour Volume Error', 'Your individual pour volumes must add up to the total volume', [
        {
          text: 'Ok',
          onPress: () => console.log('Cancel Pressed'),
        },
      ]);
    }
    // db.retrieveAllRecipes();
  }

  async function editInputComplete(label: string, value: string, pourNumber?: number) {
    console.log("Edit complete:" + label);
    console.log("Pour Number:" + pourNumber);
    console.log(label + ":" + value);
    var recipe = getRecipe();
    if (recipe !== null) {

      switch (label) {
        case "Grind Size":
          if (!isNaN(Number(value))) {
            let val = Number(value)
            setEnableSave(true);
            recipe!.grindSize = val;
            setRecipeInJSON(() => JSON.stringify(recipe));
            return;
          }
          return;
        case "Grind RPM":
          if (!isNaN(Number(value))) {
            let val = Number(value)
            recipe!.grindRPM = val;
            setEnableSave(true);
            setRecipeInJSON(JSON.stringify(recipe));
            return;

          }
          return;
        case "Ratio":
          if (!isNaN(Number(value))) {
            let val = Number(value)
            recipe!.setRatio(val);
            setEnableSave(true);
            setRecipeInJSON(JSON.stringify(recipe));
            return;
          }
          return;
        case "Dosage (g)":
          if (!isNaN(Number(value))) {
            let val = Number(value)
            recipe!.setDosage(val);
            setEnableSave(true);
            setRecipeInJSON(JSON.stringify(recipe));
            return;
          }
          return;
        case "XID":
          recipe!.xid = value;
          setEnableSave(true);
          setRecipeInJSON(JSON.stringify(recipe));
          return;
        case "Title":
          recipe!.title = value;
          setEnableSave(true);
          setRecipeInJSON(JSON.stringify(recipe));
          return;
        case "Volume":
          if (pourNumber !== undefined) {
            if (!isNaN(Number(value))) {
              recipe!.pours[pourNumber].volume = Number(value);
              setEnableSave(true);
              setRecipeInJSON(() => JSON.stringify(recipe));
              return;
            }
          }
          return;
        case "Temperature (c)":
          if (pourNumber !== undefined) {
            if (!isNaN(Number(value))) {
              recipe!.pours[pourNumber].temperature = Number(value);
              setEnableSave(true);
              setRecipeInJSON(JSON.stringify(recipe));
              return;
            }
          }
          return;
        case "Flow Rate (ml)":
          if (pourNumber !== undefined) {
            if (!isNaN(Number(value))) {
              recipe!.pours[pourNumber].flowRate = Number(value);
              setEnableSave(true);
              setRecipeInJSON(JSON.stringify(recipe));
              return;
            }
          }
          return;
        case "Pause Time (s)":
          if (pourNumber !== undefined) {
            if (!isNaN(Number(value))) {
              recipe!.pours[pourNumber].pauseTime = Number(value);
              setEnableSave(true);
              setRecipeInJSON(JSON.stringify(recipe));
              return;
            }
          }
          return;
        case "Pattern:":
          if (pourNumber !== undefined) {
            if (!isNaN(Number(value))) {
              recipe!.pours[pourNumber].pourPattern = Number(value);
              setEnableSave(true);
              setRecipeInJSON(JSON.stringify(recipe));
              return;
            }
          }
          return;
        default:
          console.log("Unknown field");
      }
    }
  }

  return (
    <>
      {recipeInJSON && getRecipe() && recipeInJSON !== "" ?
        <YStack key={key} >

          <XStack maxHeight="90%">
            <ScrollView padding="$4" >
              <YStack maxWidth={600}>
                <XStack><LabeledInput setErrorFunction={setInputError} width={290} maxLength={23} initialValue={getRecipe()!.title} label="Title" onValidEditFunction={editInputComplete} validateInput={(data) => {
                  console.log("Title:" + data);
                  if (data.length > 0) {
                    return true;
                  }
                  return false;
                }} errorMessage="You must have a title" />
                <TooltipComponent paddingLeft="$2" content="This is the title of the recipe for use in this app only. It is never stored on the card. So that's why this field is blank when you've just read in a card" />

                </XStack>
                <XStack>
                  <LabeledInput setErrorFunction={setInputError} width={110} maxLength={8} initialValue={getRecipe()!.xid} label="XID" onValidEditFunction={editInputComplete} />
                  <TooltipComponent content="This is a 9 character unique identifier for the recipe that is used by the mobile app to look up the recipe online. It can be any alphanumeric value. Importantly, if you don't want the mobile app to show the wrong recipe, I'd probably change this. But if you do that, it won't show any recipe at all in the app (although it should still work on the machine) " />
                </XStack>
                <ValidatedInput setErrorFunction={setInputError} initialValue={getRecipe()!.getDosage()} minimumValue={10} maximumValue={25} step={1} label="Dosage (g)" maxLength={2} inputMode="numeric" onValidEditFunction={editInputComplete} />
                <ValidatedInput setErrorFunction={setInputError} initialValue={getRecipe()!.grindSize} minimumValue={1} maximumValue={80} step={1} label="Grind Size" maxLength={2} inputMode="numeric" onValidEditFunction={editInputComplete} />
                <ValidatedInput setErrorFunction={setInputError} initialValue={getRecipe()!.grindRPM} minimumValue={60} maximumValue={120} step={10} label="Grind RPM" maxLength={3} inputMode="numeric" onValidEditFunction={editInputComplete} />
                <ValidatedInput setErrorFunction={setInputError} initialValue={getRecipe()!.getRatio()} minimumValue={5} maximumValue={25} step={1} label="Ratio" maxLength={3} inputMode="numeric" onValidEditFunction={editInputComplete} />
                {/* <ValidatedInput setErrorFunction={setInputError} initialValue={getRecipe()!.ratio} minimumValue={5} maximumValue={25} step={1}  label="Ratio" maxLength={3} inputMode="numeric" onValidEditFunction={editInputComplete} /> */}

                {enableMachineRatio ?
                  <XStack>
                    <LabeledInput disabled={true} setErrorFunction={setInputError} maxLength={5} initialValue={"1:" + getRecipe()!.getMachineRatio()} label="Machine Ratio" />
                    <TooltipComponent paddingLeft="$1" content="This is the ratio actually displayed on the machine. IT CAN BE IGNORED. And that also means, if you are seeing this that you changed the dosage. The XBloom assumes that all recipe cards are for 15g. The ratio that is displayed on the machine does not actually change what the machine does. It is simply there as a check to make sure your pour volumes are correct. So for dosages greater than 15g, this app adjusts that ratio to account for different dosages. AGAIN, this does not affect the functionality of the machine. The ratio displayed on the machine is informational only and CAN BE IGNORED.  " />
                  </XStack>
                  : ""}


                <XStack>
                  <TotalVolumeComponent recipe={getRecipe()!} />
                  <TooltipComponent content="This field shows the total of all of the pours vs the total volume based on your dosage and ratio. You may also be wondering, hey wait why does the total volume not equal my dosage multipled by my ratio? The short answer is because that's the way it has to be, so don't worry about it. The longer answer is that because the XBloom recipe cards can only natively support 15g this app has to do some math to support other dosage volumes. And because the recipe cards further support only whole number ratios, due to some math rounding the total volume might not equal what the total volume should be based on your ratio. It's essentially as close as it can get. But, and THIS IS IMPORTANT, this does not affect your recipe. Your ratio is still what you actually specified. I promise. In fact, to prove it--take the total volume in the app and devidee by 15. " />
                </XStack>

                {getRecipe() ? getRecipe()!.pours.map((pour, index) => (
                  <YStack key={index} space="$2.5" borderWidth={2} borderColor="gray" marginVertical="$2" borderRadius={10}>
                    <YStack padding="$2">
                      <XStack justifyContent="space-between">
                        <H6 fontSize={20} fontWeight={700}>Pour {pour.getPourNumber()}</H6>
                        <XStack paddingRight="$2">
                          <XStack paddingRight="$2">
                            <IconButton onPress={() => deletePour(index)} title="" icon={<AntDesign name="closecircle" size={24} color="red" />}></IconButton>
                          </XStack>
                          <IconButton onPress={() => addPour(index)} title="" icon={<AntDesign name="pluscircle" size={24} color="green" />}></IconButton>
                        </XStack>
                      </XStack>
                      <ValidatedInput setErrorFunction={setInputError} initialValue={pour.getVolume()} minimumValue={1} maximumValue={240} step={1} pourNumber={index} label="Volume" maxLength={3} inputMode="numeric" style={{ maxWidth: 100 }} onValidEditFunction={editInputComplete} />

                      <ValidatedInput setErrorFunction={setInputError} initialValue={pour.getTemperature()} minimumValue={39} maximumValue={95} step={1} pourNumber={index} label="Temperature (c)" maxLength={2} inputMode="numeric" onValidEditFunction={editInputComplete} />

                      <ValidatedInput setErrorFunction={setInputError} initialValue={pour.getFlowRate()} minimumValue={30} maximumValue={35} step={1} floatingPoint pourNumber={index} label="Flow Rate (ml)" maxLength={4} inputMode="decimal" onValidEditFunction={editInputComplete} />

                      <ValidatedInput setErrorFunction={setInputError} initialValue={pour.getPauseTime()} minimumValue={0} maximumValue={59} step={1} pourNumber={index} label="Pause Time (s)" maxLength={2} inputMode="numeric" onValidEditFunction={editInputComplete} />

                      <PatternButtonGroup initalValue={"" + pour.getPourPattern()} label="Pattern:" size="$4" orientation="horizontal" onToggle={(val) => editInputComplete("Pattern:", val, index)} />
                      <OnOffButtonGroup initialValue={pour.getAgitationBefore() ? "1" : "0"} label="Agitation Before:" size="$4" orientation="horizontal" onToggle={(val) => updateAgitation(index, true, val)} />
                      <OnOffButtonGroup initialValue={pour.getAgitationAfter() ? "1" : "0"} label="Agitation After:   " size="$4" orientation="horizontal" onToggle={(val) => updateAgitation(index, false, val)} />
                    </YStack>
                  </YStack>
                )) : ""}

              </YStack>
            </ScrollView>
          </XStack>
          <XStack paddingVertical="$3" justifyContent="center" alignContent="center" alignItems="center" >
            <Button onPress={() => saveRecipe()} width={200} fontSize={16} fontWeight={700} disabled={inputError || !enableSave} color="white" backgroundColor={inputError || !enableSave ? "#f59d7d" : "#f4511e"}>Save</Button>
          </XStack>
        </YStack>
        : ""}

    </>
  )
}
