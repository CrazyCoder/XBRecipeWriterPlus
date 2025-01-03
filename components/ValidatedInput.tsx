import { useState } from 'react';
import { TextInputProps, View } from 'react-native';
import { PanGestureHandler, Pressable } from 'react-native-gesture-handler';
import { H6, Input, Label, XStack, YStack } from 'tamagui';
import { Slider } from '@miblanchard/react-native-slider';
import { AntDesign } from '@expo/vector-icons';



const HEADER_HEIGHT = 250;



type Props = TextInputProps & {
  onValidEditFunction?: ValidEditCallbackFunction
  setErrorFunction: (error: boolean) => void
  onSlideStart?: () => void
  pourNumber?: number
  label: string
  minimumValue: number
  maximumValue: number
  step: number
  initialValue: number | undefined
  maxLength: number
  floatingPoint?: boolean
};

type ValidEditCallbackFunction = (inputLabel: string, value: string, pourNumber?: number) => Promise<void>;


export default function ValidatedInput(props: Props) {
  const [validated, setValidated] = useState(true);
  const [value, setValue] = useState(props.initialValue);






  async function validate(value: string): Promise<boolean> {
    if (value && value !== "") {
      setValue(parseInt(value));
      if (props.minimumValue !== undefined && props.maximumValue !== undefined) {
        if (parseInt(value) >= props.minimumValue && parseInt(value) <= props.maximumValue) {
          setValidated(() => true);
          props.setErrorFunction(false);

          if (props.onValidEditFunction) {
            if (props.pourNumber !== undefined) {
              props.onValidEditFunction(props.label?.toString()!, value, props.pourNumber);
            } else {
              props.onValidEditFunction(props.label?.toString()!, value);
            }
          }
          return true;
        }
      }
    } else {
      setValue(() => undefined);
    }
    //setValue(()=>undefined);
    setValidated(false);
    props.setErrorFunction(true);
    return false;
  }

  function getProcessedValue(): string {
    if (props.floatingPoint && value !== undefined) {
      return "" + (value / 10).toFixed(1);
    }
    return value !== undefined ? "" + value : "";
  }



  async function onValueChange(value: number[]) {
    setValue(value[0]);
    //var validEdit = await validate(value[0].toString());
  }

  async function onMinusPress() {
    if (value && value - 1 >= props.minimumValue) {
      setValue((value) => value! -= 1);
      validate("" + (value-1));
    }
  }

  async function onPlusPress() {
    if (value && (value + 1 <= props.maximumValue)) {
      setValue((value) => value! += 1);
      validate("" + (value +1) );
    }

  }

  async function onSlideStart() {
    console.log("Slide Start");
    if (props.onSlideStart !== undefined) {
      console.log("Slide Start!");

      props.onSlideStart();
    }
  }

  function getErrorMessage(): string {
    if (props.label && props.minimumValue && props.maximumValue) {

      let msg = props.label + " must be between " + props.minimumValue + " and " + props.maximumValue;
      if (props.step && props.step !== 1) {
        msg += " in increments of " + props.step;
      }
      return msg;
    }

    return 'Error: Invalid Input'
  }
  return (
    <>
      <YStack>
        <XStack padding="$2" alignItems="center" alignSelf="flex-start" flex={1} space>
          <Label>{props.label}</Label>
          {/*} <Slider flex={1} value={value !== undefined && (value >= props.minimumValue && value <= props.maximumValue) ? [value] : [props.minimumValue]} min={props.minimumValue ? props.minimumValue : 0} max={props.maximumValue ? props.maximumValue : 100} step={props.step ? props.step : 1}>
              <Slider.Track  flex={1} borderWidth={1} borderColor="#ffa592" backgroundColor="#ffa592">
                <Slider.TrackActive backgroundColor="#ff5c00" />
              </Slider.Track >
              <Slider.Thumb  backgroundColor="#ff5c00" borderColor="#ffa592" size="$2" index={0} circular />

            </Slider>s */}
          <PanGestureHandler >
            <View onResponderGrant={() => true} style={{ flex: 1 }} >
              <Slider containerStyle={{ flex: 1, width: "100%" }}
                value={value !== undefined && (value >= props.minimumValue && value <= props.maximumValue) ? [value] : [props.minimumValue]}
                minimumValue={props.minimumValue ? props.minimumValue : 0}
                maximumValue={props.maximumValue ? props.maximumValue : 100}
                step={props.step ? props.step : 1}
                thumbTintColor="#ff5c00"
                maximumTrackTintColor="#ffa592"
                minimumTrackTintColor="#ff5c00"
                trackStyle={{ height: 6, borderRadius: 6 }}
                trackClickable={false}
                onValueChange={(value) => onValueChange(value)}
                onSlidingComplete={() => validate("" + value)}
              />
            </View>
          </PanGestureHandler>

          <XStack alignItems="center" alignContent="center" padding={0} margin={0} >
            <Input padding="$2" value={getProcessedValue()} onChangeText={(val) => validate(val)} focusStyle={{ borderColor: validated ? "gray" : "red" }} borderColor={validated ? "gray" : "red"} {...props}>

            </Input>
            <XStack paddingLeft="$2" gap="$2" >
              <Pressable onPress={()=>onMinusPress()}>
                <AntDesign padding={0} name="minuscircle" size={20} color="red" />
              </Pressable>
              <Pressable onPress={() => onPlusPress()}>
                <AntDesign padding={0} name="pluscircle" size={20} color="#ff5c00" />
              </Pressable>
            </XStack>
          </XStack>

        </XStack>
        {!validated ? <H6 fontWeight="600" color="red" padding="$2">{"Error: " + getErrorMessage()}</H6> : ""}
      </YStack>
    </>
  );
}



