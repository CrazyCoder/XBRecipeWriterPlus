import * as SQLite from 'expo-sqlite';

import Recipe from './Recipe';

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
    }

    public insertRecipe(recipe: Recipe): void {
        if (recipe && !this.getRecipe(recipe.uuid)) {
            this.db.runSync(`
                        INSERT INTO recipes (uuid, recipeJSON)
                        VALUES (?, ?);`,
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
        let recipe = this.getRecipe(uuid);
        if (!recipe) {
            this.insertRecipe(updatedRecipe);
            return;
        } else {
            this.db.runSync(`
                        UPDATE recipes
                        SET recipeJSON = ?
                        WHERE uuid = ?;`,
                [
                    JSON.stringify(updatedRecipe),
                    uuid
                ]
            );
        }
    }

    public deleteRecipe(uuid: string): void {
        this.db.runSync(`
                    DELETE
                    FROM recipes
                    WHERE uuid = ?;`,
            [
                uuid
            ]
        );
    }

    public getRecipe(uuid: string): Recipe | null {
        let recipeJSON: any = this.db.getFirstSync(
            `SELECT *
             FROM recipes
             WHERE uuid = ?;`,
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
        let recipe = this.getRecipe(uuid);
        if (recipe) {
            recipe.generateNewUUID();
            recipe.title = this.createTitle(recipe.title);
            this.insertRecipe(recipe);
        }
    }

    private createTitle(title: string): string {

        let newTitle = title;
        if (!newTitle.includes("(Copy)")) {
            newTitle = `${newTitle} (Copy)(1)`;
        }

        let count = 1;
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
        let recipes = this.retrieveAllRecipes();
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
        let recipesJSON: any[] = this.db.getAllSync(
            `SELECT *
             FROM recipes;`,
        );
        if (recipesJSON && recipesJSON.length > 0) {
            let recipes: Recipe[] = [];
            for (let i = 0; i < recipesJSON.length; i++) {
                recipes.push(new Recipe(undefined, recipesJSON[i].recipeJSON));
            }

            return recipes;
        }
        return null;
    }


}

export default RecipeDatabase;