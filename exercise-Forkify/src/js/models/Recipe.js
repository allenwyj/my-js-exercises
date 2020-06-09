import axios from 'axios';

export default class Recipe {
    constructor(id) {
        this.id = id;
    }

    async getRecipe() {
        try {
            const res = await axios(`https://forkify-api.herokuapp.com/api/get?rId=${this.id}`);
            this.title = res.data.recipe.title;
            this.author = res.data.recipe.publisher;
            this.img = res.data.recipe.image_url;
            this.url = res.data.recipe.source_url;
            this.ingredients = res.data.recipe.ingredients;
        } catch (e) {
            alert('Ops! Something went wrong :(');
        }
    }

    calcTime() {
        const numIng = this.ingredients.length;
        // suppose every 3 ingredients needs 15 minutes.
        const cookingTimePerUnit = 15;
        const periods = Math.ceil(numIng / 3);
        this.time = periods * cookingTimePerUnit;
    }

    calcServings() {
        // TODO: hard coded for now
        this.servings = 4;
    }

    parseIngredients() {
        // the index postion for long units matches the position of their short forms.
        const unitsLong = ['tablespoons', 'tablespoon', 'ounces', 'ounce', 'teaspoons', 'teaspoon', 'cups', 'pounds'];
        const unitsShort = ['tbsp', 'tbsp', 'oz', 'oz', 'tsp', 'tsp', 'cup', 'pound'];
        const units = [...unitsShort, 'kg', 'g'];

        const newIngredients = this.ingredients.map(el => {
            // uniform units
            let ingredient = el.toLowerCase();

            // remove parentheses
            ingredient = ingredient.replace(/ *\([^)]*\) */g, ' ');

            // looping over the long units and for each element, check if the ingredient contains any of them.
            unitsLong.forEach((unit, i) => {
                // replace the matched long unit to the short form. 
                ingredient = ingredient.replace(unit, unitsShort[i]);
            });

            // Parse ingredients into count, unit and ingredients.
            // spliting the ingredient string by space
            const arrIng = ingredient.split(' ');

            /**
             * In order to find the quantity in the front of the unit,
             * using findIndex() to looping the elements in the arrIng one by one,
             * and see if they are in the unitsShort array. That means the elements
             * in the front of the matched element will be the quantity.
             * If there is no match, unitIndex = -1.
             */
            const unitIndex = arrIng.findIndex(el => units.includes(el));

            let objIng;
            if (unitIndex > -1) {
                // there is a unit
                const arrCount = arrIng.slice(0, unitIndex);

                /**
                 * there is a match, if there is only 1 element, means
                 * that it may be number only, or '1-1/2' or '1+1/2',
                 * so we replace '-' to '+' and use eval() to add them up
                 */
                let count;
                if (arrCount.length === 1) {
                    // may have '1-1/2'
                    count = eval(arrIng[0].replace('-', '+'));
                } else {
                    count = eval(arrIng.slice(0, unitIndex).join('+')); // '1+1/2' -> 1.5
                }

                objIng = {
                    count,
                    unit: arrIng[unitIndex],
                    ingredient: arrIng.slice(unitIndex + 1).join(' ')
                }

            } else if (parseInt(arrIng[0], 10)) {
                // there is no unit but starting with a quantity
                objIng = {
                    count: parseInt(arrIng[0], 10),
                    unit: '',
                    ingredient: arrIng.slice(1).join(' ') // slice the array starts from the second element
                }

            } else if (unitIndex === -1) {
                // there is no unit and no quantity
                objIng = {
                    count: 1,
                    unit: '',
                    ingredient
                }
            }

            // each objIng will be pushed to newIngredients array.
            return objIng;
            
        });
        // setting the formatted list to the new ingredients list
        this.ingredients = newIngredients;
    }

    updateServings(type) {
        // servings
        const newServings = type === 'dec' ? this.servings - 1 : this.servings + 1;

        // ingredients
        this.ingredients.forEach(el => {
            // cannot write in assignment operator *=, it will cause decimal problem
            // like 27/26*26 = 27.000000000004
            el.count = el.count * newServings / this.servings; 
        });

        this.servings = newServings;
    }
}