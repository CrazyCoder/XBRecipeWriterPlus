import Pour, {POUR_PATTERN} from "./Pour";
import Recipe, {CUP_TYPE, GRIND_SIZE_OFFSET, GRINDER_OFF} from "./Recipe";

export class XBloomRecipe {
    private xbRecipeJSON: any | null = null
    private name = "";
    private imageURL = "";
    private subtitle = "";
    private id = "";
    private byXid = false;

    constructor(id: string) {
        this.id = id;
        // Use different endpoint for XID-based requests
        if (id.length > 0 && id.length <= 7) {
            console.log("Got XID:", id);
            this.byXid = true;
        }
    }

    private containsChineseCustomChars(inputString: string) {
        // Define the Unicode values for the characters
        const unicodeCharacters = [0x660E, 0x8C26]; // Unicode for "明" and "谦"

        // Check if the input string includes all the target Unicode characters
        return unicodeCharacters.every(unicode =>
            inputString.includes(String.fromCharCode(unicode))
        );
    }

    public getRecipe(): Recipe | null {
        try {
            let recipe = new Recipe(undefined, undefined);
            let ratio: number = this.xbRecipeJSON.recipeVo.grandWater;

            let grindSize: number = this.xbRecipeJSON.recipeVo.grinderSize ?? GRIND_SIZE_OFFSET + GRINDER_OFF;
            let isSetGrinderSize: number = this.xbRecipeJSON.recipeVo.isSetGrinderSize ?? 2;

            // 2 means grinder is disabled
            if (isSetGrinderSize == 2 || grindSize == GRIND_SIZE_OFFSET + GRINDER_OFF) {
                recipe.grinder = false;
            }

            let dosage: number = this.xbRecipeJSON.recipeVo.dose;
            let pourCount: number = this.xbRecipeJSON.recipeVo.pourCount;
            let title = this.getRecipeTitle();

            let xid = this.xbRecipeJSON.recipeVo.podsVo?.id ?? "";

            recipe.ratio = ratio;
            recipe.dosage = dosage;
            recipe.title = title;
            recipe.grindSize = grindSize;
            recipe.xid = xid;

            if (this.byXid) {
                let shareLink = this.xbRecipeJSON.recipeVo?.shareRecipeLink ?? "";
                try {
                    const url = new URL(shareLink);
                    const id = url.searchParams.get('id');
                    if (id) {
                        recipe.shareId = decodeURIComponent(id);
                        console.log("Got shareId:", recipe.shareId);
                    }
                } catch (e) {
                    console.log("Error parsing share link:", e);
                }
            } else {
                recipe.shareId = this.id;
            }

            recipe.grindRPM = (this.xbRecipeJSON.recipeVo.rpm && this.xbRecipeJSON.recipeVo.rpm >= 60 && this.xbRecipeJSON.recipeVo.rpm <= 120)
                ? this.xbRecipeJSON.recipeVo.rpm
                : 120;

            let cup = this.xbRecipeJSON.recipeVo.cupType ?? 1

            switch (cup) {
                case 1:
                    recipe.cupType = CUP_TYPE.XPOD
                    break;
                case 2:
                    recipe.cupType = CUP_TYPE.OMNI
                    break;
                case 3:
                    recipe.cupType = CUP_TYPE.OTHER
                    break;
                case 4:
                    recipe.cupType = CUP_TYPE.TEA
                    recipe.defaultCups = pourCount
                    break;
                default:
                    recipe.cupType = CUP_TYPE.XPOD
            }

            console.log('cup:', cup, 'cupType:', recipe.cupType);

            for (let i = 0; i < pourCount; i++) {
                let pourData = this.xbRecipeJSON.recipeVo.pourList[i];
                let flowRate = pourData.flowRate * 10;
                let isEnableVibrationAfter = pourData.isEnableVibrationAfter == 1;
                let isEnableVibrationBefore = pourData.isEnableVibrationBefore == 1;
                let pattern: number;
                switch (pourData.pattern) {
                    case 1:
                        pattern = POUR_PATTERN.CENTERED;
                        break;
                    case 2:
                        pattern = POUR_PATTERN.SPIRAL;
                        break;
                    case 3:
                        pattern = POUR_PATTERN.CIRCULAR;
                        break;
                    default:
                        console.log("Unknown pour pattern, will use Circular: " + pourData.pattern)
                        pattern = POUR_PATTERN.CIRCULAR
                }
                let pause = pourData.pausing;
                let volume = pourData.volume;
                let temperature = pourData.temperature;
                if (recipe.cupType == CUP_TYPE.TEA && volume > 90) {
                    console.log("Fixing tea pour volume to 90ml, was: " + volume + "ml")
                    volume = 90;
                }
                let pour = new Pour(i + 1, volume, temperature, flowRate, 0, pattern, pause);
                pour.setAgitationAfter(isEnableVibrationAfter);
                pour.setAgitationBefore(isEnableVibrationBefore);
                recipe.pours.push(pour);
            }
            recipe.fixRatio();
            return recipe;
        } catch (e) {
            console.log("Error Importing Recipe:" + e);
        }
        return null;
    }

    public getRecipeTitle() {
        if (this.getSubtitle().length > 0 && this.getName().length > 0) {
            return this.getName() + " | " + this.getSubtitle();
        } else {
            return this.getName();
        }
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
        let apiEndpoint = this.byXid ?
            "https://client-api.xbloom.com/tRecipeDetailOfPods.thtml" :
            "https://client-api.xbloom.com/RecipeDetail.html";

        // Common parameters for both requests
        const baseBody = {
            interfaceVersion: 19700101,
            skey:             "testskey"
        };

        // Conditional body based on byXid flag
        const requestBody = this.byXid ? {
            ...baseBody,
            xid:               this.id,
            languageType:      0,
            adaptedModel:      1,
            isRefreshScanTime: 1,
            appVersion:        "2.1.2"
        } : {
            ...baseBody,
            tableIdOfRSA: this.id
        };

        const response = await fetch(apiEndpoint, {
            headers: {
                accept:            "application/json, text/plain, */*",
                "accept-language": "en-US,en;q=0.9",
                "content-type":    "application/json",
                Referer:           "https://share-h5.xbloom.com/"
            },
            body:    JSON.stringify(requestBody),
            method:  "POST"
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (data) {
            this.xbRecipeJSON = JSON.parse(JSON.stringify(data));
            console.log(JSON.stringify(this.xbRecipeJSON));
            let recipeVo = this.xbRecipeJSON.recipeVo;
            if (recipeVo) {
                this.name = recipeVo.theName;
                if (recipeVo.podsVo) {
                    this.subtitle = recipeVo.podsVo.subtitle;
                    this.imageURL = recipeVo.podsVo.imagePath;
                    console.log(this.name);
                    console.log(this.imageURL)
                }
            }
        }
        return data;
    }
}
