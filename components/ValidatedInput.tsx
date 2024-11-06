import { useState } from 'react';
import { TextInputProps } from 'react-native';
import { H6, Input, Label, Slider, XStack, YStack } from 'tamagui';

const HEADER_HEIGHT = 250;



type Props = TextInputProps & {
  onValidEditFunction?: ValidEditCallbackFunction
  setErrorFunction: (error: boolean) => void
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
    console.log("Validate:" + value);
    if (value && value !== "") {
      setValue(parseInt(value));
      if (props.minimumValue !== undefined && props.maximumValue !== undefined) {
        if (parseInt(value) >= props.minimumValue && parseInt(value) <= props.maximumValue) {
          console.log("Validated");
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
    }else{
      setValue(()=>undefined);
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
    var validEdit = await validate(value[0].toString());
    console.log(value[0]);
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
      <YStack maxWidth={400}>
        <XStack maxWidth={400} padding="$2" alignItems="center" alignSelf="flex-start" space>
          <Label>{props.label}</Label>
          <Slider  onValueChange={onValueChange} minWidth={150} value={value !== undefined && (value >= props.minimumValue && value <= props.maximumValue) ? [value] : [props.minimumValue]} min={props.minimumValue ? props.minimumValue : 0} max={props.maximumValue ? props.maximumValue : 100} step={props.step ? props.step : 1}>
            <Slider.Track borderWidth={1} borderColor="red">
              <Slider.TrackActive />
            </Slider.Track>
            <Slider.Thumb size="$2" index={0} circular />

          </Slider>
          <Input padding="$2" value={getProcessedValue()} width={10 + props.maxLength * 13} maxWidth={10 + props.maxLength * 13} onChangeText={(val) => validate(val)} focusStyle={{ borderColor: validated ? "blue" : "red" }} borderColor={validated ? "blue" : "red"} {...props}>

          </Input>

        </XStack>
        {!validated ? <H6 fontWeight="600" color="red" padding="$2">{"Error: " + getErrorMessage()}</H6> : ""}
      </YStack>
    </>
  );
}



