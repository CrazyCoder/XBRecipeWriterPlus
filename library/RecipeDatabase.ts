import * as SQLite from 'expo-sqlite';

import Recipe from './Recipe';

var testRecipes = [{ "recipeJSON": "{\"uuid\":\"888a3d2a-a976-41c8-84b2-dc680e0773fa\",\"title\":\"LoyalOrig\",\"xid\":\"LCR003\",\"ratio\":10,\"grindSize\":50,\"grindRPM\":120,\"pours\":[\"{\\\"pourNumber\\\":1,\\\"volume\\\":40,\\\"temperature\\\":93,\\\"flowRate\\\":30,\\\"agitation\\\":2,\\\"pourPattern\\\":2,\\\"pauseTime\\\":59}\",\"{\\\"pourNumber\\\":2,\\\"volume\\\":30,\\\"temperature\\\":82,\\\"flowRate\\\":35,\\\"agitation\\\":0,\\\"pourPattern\\\":2,\\\"pauseTime\\\":15}\",\"{\\\"pourNumber\\\":3,\\\"volume\\\":30,\\\"temperature\\\":82,\\\"flowRate\\\":35,\\\"agitation\\\":0,\\\"pourPattern\\\":1,\\\"pauseTime\\\":15}\",\"{\\\"pourNumber\\\":4,\\\"volume\\\":30,\\\"temperature\\\":85,\\\"flowRate\\\":35,\\\"agitation\\\":0,\\\"pourPattern\\\":1,\\\"pauseTime\\\":15}\",\"{\\\"pourNumber\\\":5,\\\"volume\\\":20,\\\"temperature\\\":84,\\\"flowRate\\\":35,\\\"agitation\\\":2,\\\"pourPattern\\\":1,\\\"pauseTime\\\":0}\"],\"checksum\":62,\"prefixArray\":[9,156,106,243,150,115,145,209,108,38,173,11,56,186,200,115,119,28,203,143,223,200,223,137,37,220,164,229,159,7,154,25],\"suffixArray\":[0,244,0,0,35,25,17,229,2,0,0,0,35,17,18,139,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]}", "uuid": "888a3d2a-a976-41c8-84b2-dc680e0773fa" }, { "recipeJSON": "{\"uuid\":\"98b613e4-9432-4a7a-8441-2e6de93effdc\",\"title\":\"XbloomOrigOrange\",\"xid\":\"XBL005\",\"ratio\":15,\"grindSize\":59,\"grindRPM\":120,\"pours\":[\"{\\\"pourNumber\\\":1,\\\"volume\\\":50,\\\"temperature\\\":95,\\\"flowRate\\\":30,\\\"agitation\\\":2,\\\"pourPattern\\\":2,\\\"pauseTime\\\":45}\",\"{\\\"pourNumber\\\":2,\\\"volume\\\":45,\\\"temperature\\\":95,\\\"flowRate\\\":35,\\\"agitation\\\":0,\\\"pourPattern\\\":2,\\\"pauseTime\\\":15}\",\"{\\\"pourNumber\\\":3,\\\"volume\\\":45,\\\"temperature\\\":95,\\\"flowRate\\\":35,\\\"agitation\\\":0,\\\"pourPattern\\\":2,\\\"pauseTime\\\":15}\",\"{\\\"pourNumber\\\":4,\\\"volume\\\":45,\\\"temperature\\\":95,\\\"flowRate\\\":35,\\\"agitation\\\":0,\\\"pourPattern\\\":2,\\\"pauseTime\\\":10}\",\"{\\\"pourNumber\\\":5,\\\"volume\\\":40,\\\"temperature\\\":95,\\\"flowRate\\\":35,\\\"agitation\\\":0,\\\"pourPattern\\\":2,\\\"pauseTime\\\":10}\"],\"checksum\":174,\"prefixArray\":[185,170,194,158,87,7,2,10,58,56,93,91,222,225,224,58,201,242,239,108,6,65,88,228,139,49,87,45,111,188,180,15],\"suffixArray\":[0,241,0,0,35,35,95,1,2,0,0,0,35,17,18,88,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]}", "uuid": "98b613e4-9432-4a7a-8441-2e6de93effdc" }, { "recipeJSON": "{\"uuid\":\"d7ddf025-7b4f-424f-ba7c-9116adfb6e60\",\"title\":\"JoeOrig\",\"xid\":\"JOE003\",\"ratio\":16,\"grindSize\":55,\"grindRPM\":120,\"pours\":[\"{\\\"pourNumber\\\":1,\\\"volume\\\":60,\\\"temperature\\\":93,\\\"flowRate\\\":30,\\\"agitation\\\":2,\\\"pourPattern\\\":1,\\\"pauseTime\\\":20}\",\"{\\\"pourNumber\\\":2,\\\"volume\\\":55,\\\"temperature\\\":93,\\\"flowRate\\\":35,\\\"agitation\\\":0,\\\"pourPattern\\\":1,\\\"pauseTime\\\":15}\",\"{\\\"pourNumber\\\":3,\\\"volume\\\":50,\\\"temperature\\\":93,\\\"flowRate\\\":35,\\\"agitation\\\":0,\\\"pourPattern\\\":1,\\\"pauseTime\\\":15}\",\"{\\\"pourNumber\\\":4,\\\"volume\\\":45,\\\"temperature\\\":93,\\\"flowRate\\\":35,\\\"agitation\\\":0,\\\"pourPattern\\\":1,\\\"pauseTime\\\":5}\",\"{\\\"pourNumber\\\":5,\\\"volume\\\":30,\\\"temperature\\\":93,\\\"flowRate\\\":35,\\\"agitation\\\":0,\\\"pourPattern\\\":1,\\\"pauseTime\\\":10}\"],\"checksum\":140,\"prefixArray\":[177,87,244,182,47,160,125,180,117,172,111,39,15,39,74,177,163,18,11,66,130,28,105,216,176,32,192,255,252,57,211,38],\"suffixArray\":[0,244,0,0,35,25,17,114,2,0,0,0,35,17,18,178,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]}", "uuid": "d7ddf025-7b4f-424f-ba7c-9116adfb6e60" }, { "recipeJSON": "{\"uuid\":\"d919fe70-dd66-4b01-8fa6-e5aa6a865dc6\",\"title\":\"VerveOrig\",\"xid\":\"VER009\",\"ratio\":16,\"machineRatio\":1,\"dosage\":15,\"grindSize\":64,\"grindRPM\":120,\"pours\":[\"{\\\"pourNumber\\\":1,\\\"volume\\\":45,\\\"temperature\\\":95,\\\"flowRate\\\":30,\\\"agitation\\\":2,\\\"pourPattern\\\":2,\\\"pauseTime\\\":30}\",\"{\\\"pourNumber\\\":2,\\\"volume\\\":50,\\\"temperature\\\":94,\\\"flowRate\\\":35,\\\"agitation\\\":2,\\\"pourPattern\\\":2,\\\"pauseTime\\\":15}\",\"{\\\"pourNumber\\\":3,\\\"volume\\\":50,\\\"temperature\\\":93,\\\"flowRate\\\":35,\\\"agitation\\\":0,\\\"pourPattern\\\":2,\\\"pauseTime\\\":12}\",\"{\\\"pourNumber\\\":4,\\\"volume\\\":50,\\\"temperature\\\":93,\\\"flowRate\\\":35,\\\"agitation\\\":2,\\\"pourPattern\\\":1,\\\"pauseTime\\\":15}\",\"{\\\"pourNumber\\\":5,\\\"volume\\\":45,\\\"temperature\\\":92,\\\"flowRate\\\":35,\\\"agitation\\\":2,\\\"pourPattern\\\":1,\\\"pauseTime\\\":0}\"],\"checksum\":237,\"prefixArray\":[249,24,80,207,4,14,81,85,240,235,57,87,169,254,224,164,137,252,56,196,242,173,180,175,25,224,148,168,125,239,237,40],\"suffixArray\":[0,244,0,0,35,25,17,130,0,251,0,0,35,23,15,97,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]}", "uuid": "d919fe70-dd66-4b01-8fa6-e5aa6a865dc6" }, { "recipeJSON": "{\"uuid\":\"0fa255c3-3fbb-4b5f-9816-3b1f3791a0ab\",\"title\":\"VerveOrig (Copy)(1)\",\"xid\":\"VER009\",\"ratio\":16,\"machineRatio\":1,\"dosage\":15,\"grindSize\":64,\"grindRPM\":120,\"pours\":[\"{\\\"pourNumber\\\":1,\\\"volume\\\":45,\\\"temperature\\\":95,\\\"flowRate\\\":30,\\\"agitation\\\":2,\\\"pourPattern\\\":2,\\\"pauseTime\\\":30}\",\"{\\\"pourNumber\\\":2,\\\"volume\\\":50,\\\"temperature\\\":94,\\\"flowRate\\\":35,\\\"agitation\\\":2,\\\"pourPattern\\\":2,\\\"pauseTime\\\":15}\",\"{\\\"pourNumber\\\":3,\\\"volume\\\":50,\\\"temperature\\\":93,\\\"flowRate\\\":35,\\\"agitation\\\":0,\\\"pourPattern\\\":2,\\\"pauseTime\\\":12}\",\"{\\\"pourNumber\\\":4,\\\"volume\\\":50,\\\"temperature\\\":93,\\\"flowRate\\\":35,\\\"agitation\\\":2,\\\"pourPattern\\\":1,\\\"pauseTime\\\":15}\",\"{\\\"pourNumber\\\":5,\\\"volume\\\":45,\\\"temperature\\\":92,\\\"flowRate\\\":35,\\\"agitation\\\":2,\\\"pourPattern\\\":1,\\\"pauseTime\\\":0}\"],\"checksum\":237,\"prefixArray\":[249,24,80,207,4,14,81,85,240,235,57,87,169,254,224,164,137,252,56,196,242,173,180,175,25,224,148,168,125,239,237,40],\"suffixArray\":[0,244,0,0,35,25,17,130,0,251,0,0,35,23,15,97,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]}", "uuid": "0fa255c3-3fbb-4b5f-9816-3b1f3791a0ab" }, { "recipeJSON": "{\"uuid\":\"03f428a7-7c1f-4d8c-9c79-0b3bcc65d7b4\",\"title\":\"Test recipe\",\"xid\":\"VER009\",\"ratio\":20,\"machineRatio\":1,\"dosage\":15,\"grindSize\":64,\"grindRPM\":120,\"pours\":[\"{\\\"pourNumber\\\":1,\\\"volume\\\":105,\\\"temperature\\\":95,\\\"flowRate\\\":30,\\\"agitation\\\":2,\\\"pourPattern\\\":2,\\\"pauseTime\\\":30}\",\"{\\\"pourNumber\\\":2,\\\"volume\\\":50,\\\"temperature\\\":94,\\\"flowRate\\\":35,\\\"agitation\\\":2,\\\"pourPattern\\\":2,\\\"pauseTime\\\":15}\",\"{\\\"pourNumber\\\":3,\\\"volume\\\":50,\\\"temperature\\\":93,\\\"flowRate\\\":35,\\\"agitation\\\":0,\\\"pourPattern\\\":2,\\\"pauseTime\\\":12}\",\"{\\\"pourNumber\\\":4,\\\"volume\\\":50,\\\"temperature\\\":93,\\\"flowRate\\\":35,\\\"agitation\\\":2,\\\"pourPattern\\\":1,\\\"pauseTime\\\":15}\",\"{\\\"pourNumber\\\":5,\\\"volume\\\":45,\\\"temperature\\\":92,\\\"flowRate\\\":35,\\\"agitation\\\":2,\\\"pourPattern\\\":1,\\\"pauseTime\\\":0}\"],\"checksum\":14,\"prefixArray\":[249,24,80,207,4,14,81,85,240,235,57,87,169,254,224,164,137,252,56,196,242,173,180,175,25,224,148,168,125,239,237,40],\"suffixArray\":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]}", "uuid": "03f428a7-7c1f-4d8c-9c79-0b3bcc65d7b4" }, { "recipeJSON": "{\"uuid\":\"4d0323cc-6a95-4cf4-9f53-ffe662808eff\",\"title\":\"Joe Daily Large\",\"xid\":\"JOE004\",\"ratio\":16,\"machineRatio\":1,\"dosage\":22,\"grindSize\":55,\"grindRPM\":120,\"pours\":[\"{\\\"pourNumber\\\":1,\\\"volume\\\":86,\\\"temperature\\\":93,\\\"flowRate\\\":30,\\\"agitation\\\":2,\\\"pourPattern\\\":1,\\\"pauseTime\\\":20}\",\"{\\\"pourNumber\\\":2,\\\"volume\\\":78,\\\"temperature\\\":93,\\\"flowRate\\\":35,\\\"agitation\\\":0,\\\"pourPattern\\\":1,\\\"pauseTime\\\":15}\",\"{\\\"pourNumber\\\":3,\\\"volume\\\":71,\\\"temperature\\\":93,\\\"flowRate\\\":35,\\\"agitation\\\":0,\\\"pourPattern\\\":1,\\\"pauseTime\\\":15}\",\"{\\\"pourNumber\\\":4,\\\"volume\\\":66,\\\"temperature\\\":93,\\\"flowRate\\\":35,\\\"agitation\\\":0,\\\"pourPattern\\\":1,\\\"pauseTime\\\":5}\",\"{\\\"pourNumber\\\":5,\\\"volume\\\":44,\\\"temperature\\\":93,\\\"flowRate\\\":35,\\\"agitation\\\":0,\\\"pourPattern\\\":1,\\\"pauseTime\\\":10}\"],\"checksum\":140,\"prefixArray\":[177,87,244,182,47,160,125,180,117,172,111,39,15,39,74,177,163,18,11,66,130,28,105,216,176,32,192,255,252,57,211,38],\"suffixArray\":[0,244,0,0,35,25,17,114,2,0,0,0,35,17,18,178,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]}", "uuid": "4d0323cc-6a95-4cf4-9f53-ffe662808eff" }]

const TEST = false;

class RecipeDatabase {
    private db: SQLite.SQLiteDatabase;

    constructor() {
        this.db = SQLite.openDatabaseSync('xbrecipewriter.db')
        this.createTable();
    }





    private createTable(): void {
        this.db.execSync(`
            PRAGMA journal_mode = WAL;
            CREATE TABLE IF NOT EXISTS recipes (uuid TEXT PRIMARY KEY NOT NULL,recipeJSON TEXT);`
        );

        if (TEST) {
            for (let i = 0; i < testRecipes.length; i++) {
                this.insertRecipe(new Recipe(undefined, testRecipes[i].recipeJSON));
            }
        }
    }

    public insertRecipe(recipe: Recipe): void {
        if (recipe && !this.getRecipe(recipe.uuid) ) {
            this.db.runSync(`
            INSERT INTO recipes (uuid, recipeJSON) VALUES (?, ?);`,
                [
                    recipe.uuid,
                    JSON.stringify(recipe)
                ]
            );
        } else {
            throw new Error("DB: Recipe already exists");
        }
    }

    public updateRecipe(uuid: string, updatedRecipe: Recipe): void {
        var recipe = this.getRecipe(uuid);
        if (!recipe) {
            this.insertRecipe(updatedRecipe);
            return;
        } else {
            this.db.runSync(`
            UPDATE recipes SET recipeJSON = ? WHERE uuid = ?;`,
                [
                    JSON.stringify(updatedRecipe),
                    uuid
                ]
            );
        }
    }

    public deleteRecipe(uuid: string): void {
        this.db.runSync(`
            DELETE FROM recipes WHERE uuid = ?;`,
            [
                uuid
            ]
        );
    }

    public getRecipe(uuid: string): Recipe | null {
        var recipeJSON: any = this.db.getFirstSync(
            `SELECT * FROM recipes WHERE uuid = ?;`,
            [
                uuid
            ]
        );
        if (recipeJSON) {
            return new Recipe(undefined, recipeJSON.recipeJSON);
        }
        return null;

    }

    public cloneRecipe(uuid: string): void {
        var recipe = this.getRecipe(uuid);
        if (recipe) {
            recipe.generateNewUUID();
            recipe.title = this.createTitle(recipe.title);
            this.insertRecipe(recipe);
        }
    }

    private createTitle(title: string): string {

        var newTitle = title;
        if (!newTitle.includes("(Copy)")) {
            newTitle = `${newTitle} (Copy)(1)`;
        }

        var count = 1;
        while (this.doesTitleExist(newTitle)) {
            count++;
            if (newTitle.includes("(Copy)")) {
                newTitle = newTitle.replace(/\(Copy\)\(\d+\)$/, `(Copy)(${count})`);
            } else {
                newTitle = `${title} (Copy)(${count})`;
            }
        }

        return newTitle;
    }

    public doesTitleExist(title: string): boolean {
        var recipes = this.retrieveAllRecipes();
        if (recipes) {
            for (let i = 0; i < recipes.length; i++) {
                if (recipes[i].title.toLowerCase() == title.toLowerCase()) {
                    return true;
                }
            }
        }
        return false
    }


    public retrieveAllRecipes(): Recipe[] | null {
        var recipesJSON: any[] = this.db.getAllSync(
            `SELECT * FROM recipes;`,

        );
        if (recipesJSON && recipesJSON.length > 0) {
            var recipes: Recipe[] = [];
            for (let i = 0; i < recipesJSON.length; i++) {
                recipes.push(new Recipe(undefined, recipesJSON[i].recipeJSON));
            }

            return recipes;
        }
        return null;
    }


}

export default RecipeDatabase;