import Pour from "./Pour";
import Recipe from "./Recipe";

export class XBloomRecipe {

    private xbRecipeJSON: any | null = null
    private name = "";
    private imageURL = "";
    private subtitle = "";
    private id = "";

    constructor(id: string) {
        this.id = id;
        /* var data = `{"info":"Operation Successful","recipeVo":{"adaptedModel":1,"createTimeStamp":1717152879025,"cupType":2,"dose":15,"grandWater":16,"grinderSize":59,"isDefault":1,"isEnableBypassWater":2,"isSetGrinderSize":1,"isShortcuts":1,"podsVo":{"flavor":"Lemon · Jasmine · Darjeeling","id":"APG007","image":"https://s3.us-east-1.amazonaws.com/tbdprodpic/30f6d6e2e10c11eeb7aa0242ac480009/1717149441.7039723.png","imagePath":"https://tbdprodpic.s3.us-east-1.amazonaws.com/20240531/6659a0d291364.png","introduce":"N/A","origin":"Colombia","pid":"8527454896352","process":"Hybrid Washed","roast":1,"subtitle":"Apollon's Gold","tableId":315,"theName":"CGLE Geisha","type":"Single Origin","varietal":"Mix"},"pourCount":5,"pourList":[{"flowRate":3,"isEnableVibrationAfter":1,"isEnableVibrationBefore":2,"pattern":3,"pausing":20,"recipeId":3053,"tableId":16476,"temperature":95,"theName":"Bloom","volume":50},{"flowRate":3.5,"isEnableVibrationAfter":2,"isEnableVibrationBefore":2,"pattern":2,"pausing":12,"recipeId":3053,"tableId":16477,"temperature":95,"theName":"Pour1","volume":55},{"flowRate":3.5,"isEnableVibrationAfter":2,"isEnableVibrationBefore":1,"pattern":2,"pausing":12,"recipeId":3053,"tableId":16478,"temperature":95,"theName":"Pour2","volume":45},{"flowRate":3.5,"isEnableVibrationAfter":2,"isEnableVibrationBefore":2,"pattern":3,"pausing":12,"recipeId":3053,"tableId":16479,"temperature":95,"theName":"Pour3","volume":45},{"flowRate":3.5,"isEnableVibrationAfter":1,"isEnableVibrationBefore":1,"pattern":3,"pausing":12,"recipeId":3053,"tableId":16480,"temperature":95,"theName":"Pour4","volume":45}],"rpm":120,"shareRecipeLink":"https://share-h5.xbloom.com/?id=CMcQuqFPRw9E2xDQvFAZkg%3D%3D","subSetType":1,"tableId":3053,"theColor":"#ABACD1","theName":"CGLE Geisha","theSubsetId":10},"result":"success"}`
         if (data) {
             //var test = JSON.parse(data.trim());
             this.xbRecipeJSON = JSON.parse(data);
             console.log(this.xbRecipeJSON);
             this.name = this.xbRecipeJSON.recipeVo.theName ;
             this.subtitle = this.xbRecipeJSON.recipeVo.podsVo.subtitle;
             this.imageURL = this.xbRecipeJSON.recipeVo.podsVo.image;
             console.log(this.name);
             console.log(this.imageURL)
         }*/



    }

    private containsChineseCustomChars(inputString: string) {
        // Define the Unicode values for the characters
        const unicodeCharacters = [0x660E, 0x8C26]; // Unicode for "明" and "谦"

        // Check if the input string includes all the target Unicode characters
        const containsAll = unicodeCharacters.every(unicode =>
            inputString.includes(String.fromCharCode(unicode))
        );

        return containsAll;
    }

    public getRecipe(): Recipe | null {
        try {
            let recipe = new Recipe(undefined, undefined);
            let ratio: number = this.xbRecipeJSON.recipeVo.grandWater;
            let grindSize: number = this.xbRecipeJSON.recipeVo.grinderSize;
            let dosage: number = this.xbRecipeJSON.recipeVo.dose;
            let pourCount: number = this.xbRecipeJSON.recipeVo.pourCount;
            let title = "";
            if (this.getSubtitle().length > 0) {
                title = this.getSubtitle() + ":" + this.getName();
            } else {
                title = this.getName();
            }





            let xid = this.xbRecipeJSON.recipeVo.podsVo.id;
            recipe.setRatio(ratio);
            recipe.setDosage(dosage);
            recipe.title = title;
            recipe.grindSize = grindSize;
            recipe.xid = xid;
            recipe.grindRPM = 120;

            for (let i = 0; i < pourCount; i++) {
                let pourData = this.xbRecipeJSON.recipeVo.pourList[i];
                let flowRate = pourData.flowRate * 10;
                let isEnableVibrationAfter = pourData.isEnableVibrationAfter == 1 ? true : false;
                let isEnableVibrationBefore = pourData.isEnableVibrationBefore == 1 ? true : false;
                let pattern = pourData.pattern;
                let pause = pourData.pausing;
                let volume = pourData.volume;
                let temperature = pourData.temperature;
                let pour = new Pour(i + 1, volume, temperature, flowRate, 0, pattern, pause);
                pour.setAgitationAfter(isEnableVibrationAfter);
                pour.setAgitationBefore(isEnableVibrationBefore);
                recipe.pours.push(pour);

                //recipe.pours.push(new Pour(pourData.flowRate,pourData.temperature,pourData.volume,pourData.pausing,pourData.pattern,pourData.isEnableVibrationBefore,pourData.isEnableVibrationAfter));
                //recipe.addPour(i +1);
            }
            return recipe;
        } catch (e) {
            console.log("Error Importing Recipe:" + e);
        }
        return null;
    }

    public getName() {
        return this.name;
    }

    public getSubtitle() {
        if (this.containsChineseCustomChars(this.subtitle)) {
            return ""
        } else {
            return this.subtitle;
        }
    }

    public getImageURL() {
        return this.imageURL;
    }

    public async fetchRecipeDetail() {
        const response = await fetch("https://client-api.xbloom.com/RecipeDetail.html", {
            headers: {
                accept: "application/json, text/plain, */*",
                "accept-language": "en-US,en;q=0.9",
                "content-type": "application/json",
                Referer: "https://share-h5.xbloom.com/",
            },
            body: JSON.stringify({
                tableIdOfRSA: this.id,
                interfaceVersion: 19700101,
                skey: "testskey"
            }),
            method: "POST"
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (data) {
            //var test = JSON.parse(data.trim());
            this.xbRecipeJSON = JSON.parse(JSON.stringify(data));
            console.log(this.xbRecipeJSON);
            this.name = this.xbRecipeJSON.recipeVo.theName;
            this.subtitle = this.xbRecipeJSON.recipeVo.podsVo.subtitle;

            this.imageURL = this.xbRecipeJSON.recipeVo.podsVo.imagePath;
            console.log(this.name);
            console.log(this.imageURL)
        }
        return data;
    }


}

