import Search from './models/Search';
import Recipe from './models/Recipe';
import List from './models/List';
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import * as shoppingListView from './views/shoppingListView';
import { elements, renderLoader, clearLoader } from './views/base';

/**
 *  Global state of the app
 *  - Search object
 *  - Current recipe object
 *  - Shopping list object
 *  - Liked recipes
 */
const state = {};

/**
 * Search Controller
 */
const controlSearch = async () => {
    // get the query from the view
    const query = searchView.getInput();

    if (query) {
        // new search object and add to the state
        state.search = new Search(query);

        // prepare UI for results
        searchView.clearInput();
        searchView.clearResults();
        renderLoader(elements.searchRes);

        try {
            // search for recipes
            await state.search.getResults();

            // display results on UI
            clearLoader();
            searchView.displayResults(state.search.result);
    
        } catch (err) {
            alert('Ops! something is wrong here.')
            clearLoader();
        }
    }
};

/**
 * Recipe Controller
 */
const controlRecipe = async () => {
    // getting the entire url from the browser
    //const id = window.location;
    // only getting the hash value in the url
    const id = window.location.hash.replace('#', '');
    
    if (id) {
        
        // Prepare UI for changes
        recipeView.clearResults();
        renderLoader(elements.recipeDetail);

        // Highlight selected recipe
        if (state.search) {
            searchView.hightlightSelected(id);
        }

        // Create new Recipe object
        state.recipe = new Recipe(id);

        // try catch if getRecipe() get rejected.
        try {
            // Get recipe data and parse ingredients
            await state.recipe.getRecipe();
            console.log(state.recipe.ingredients);
            state.recipe.parseIngredients();

            // Calculate cooking time and servings
            state.recipe.calcTime();
            state.recipe.calcServings();

            // Display the recipe
            clearLoader();
            recipeView.displayRecipeSection(state.recipe);
        
        } catch (err) {
            // TODO: can be have a better UI for error display.
            alert('Error processing recipe!');
            clearLoader();
        }
    }
};

/**
 * Shopping List Controller
 */
const controlShoppingList = () => {
    // create a new list if no list exists
    if (!state.shoppingList) {
        state.shoppingList = new List();
    }

    // add each ingredients to the list
    state.recipe.ingredients.forEach(el => {
        const item = state.shoppingList.addItem(el.count, el.unit, el.ingredient);
        // display the item on UI
        shoppingListView.createListItem(item);
    });
}

// enable to delete and update the shopping list item
elements.shoppingList.addEventListener('click', e => {
    
})

// monitor if user click one of the recipe or user reload the url.
['hashchange', 'load'].forEach(event => window.addEventListener(event, controlRecipe));

elements.searchForm.addEventListener('submit', e => {
    e.preventDefault();
    controlSearch();
});

// handling user clicks in the recipe list.
elements.searchResPages.addEventListener('click', e => {
    // monitor if the click can be traced back to 'btn-inline' class
    const btn = e.target.closest('.btn-inline');
    if (btn) {
        // fetch our custom data through accessing variable 'goto'
        const goToPage = parseInt(btn.dataset.goto, 10);
        // clear the prev list and buttons
        searchView.clearResults();
        // reload the new page list
        searchView.displayResults(state.search.result, goToPage);
    }
});

// handling recipe - and + buttons click
elements.recipeDetail.addEventListener('click', e => {

    // check if the click is on the button or its child elements
    if (e.target.matches('.btn-decrease, .btn-decrease *')) {
        // decrease button area is clicked
        if (state.recipe.servings > 1) {
            // update the current recipe serving number
            state.recipe.updateServings('dec');
            // update the UI
            recipeView.updateIngredientsQtyOnUI(state.recipe);
        } else {
            alert('The minimum is 1 serving.');
        }
        
    } else if (e.target.matches('.btn-increase, .btn-increase *')) {
        // increase button area is clicked
        // update the current recipe serving number
        state.recipe.updateServings('inc');
        // update the UI
        recipeView.updateIngredientsQtyOnUI(state.recipe);
    } else if (e.target.matches('.recipe__btn--add, .recipe__btn--add *')) {
        controlShoppingList();
    }
});