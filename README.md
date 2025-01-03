## Notes

This is an app for rewriting XBloom recipe cards. There are some limitations based on how XBloom cards operates:

* This only works with genuine XBloom NFC cards. XBloom includes a 32 byte hash in the beginning of the card. The hash appears to be based on the cards serial number. This app does not recalculate that hash, which is why it only works on genuine cards. Theoretically, if you purchased rewritable UID cards, you may be able to use third party NFC chips though.
*  All XBloom recipe cards are limited to 15G of beans. The reason for that is because the machine verifies the total volume in your recipe equals 15 * your ratio. To get around this, the app will automatically adjusts what it calls the "machine ratio" if you adjust the dosage. This doesn't actually affect the ratio of your recipe, but just what is sent to the machine. The consequence of this is that the app may adjust your total volume by up to +/- 7.5mg due to rounding.
* The cards do not support .5 ratios
* If you experience exccessive "waits" on the machine with your recipe, turn off "overflow protection." This changes the pod type on the recipe so that it doesn't run into overflow issues.
* The app support importing of recipes. Just open up an XBloom share link in your phone's browser and once loaded, "share" it with XBRecipeWriter. 

## Data Format
![alt text](https://github.com/terminaldisclaimer/XBRecipeWriter/blob/main/Data%20Format.png)


## Get started with development
XBRecipeWriter was written in Expo. 


1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
    npx expo start
   ```

