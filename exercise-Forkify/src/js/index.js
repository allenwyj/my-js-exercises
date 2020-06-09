import Search from './models/Search';
import Recipe from './models/Recipe';
import ShoppingList from './models/ShoppingList';
import Likes from './models/Likes';
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import * as shoppingListView from './views/shoppingListView';
import * as likesListView from './views/likesListView';
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
            state.recipe.parseIngredients();

            // Calculate cooking time and servings
            state.recipe.calcTime();
            state.recipe.calcServings();

            // Display the recipe
            clearLoader();
            recipeView.displayRecipeSection(state.recipe, state.likesList.isLiked(id));
        
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
        state.shoppingList = new ShoppingList();
    }

    // add each ingredients to the list
    state.recipe.ingredients.forEach(el => {
        const item = state.shoppingList.addItem(el.count, el.unit, el.ingredient);
        // display the item on UI
        shoppingListView.createListItem(item);
    });
}

/**
 * Likes List Controller
 */
const controlLikesList = () => {
    // If there is no likes list, then create a new one first.
    if (!state.likesList) {
        state.likesList = new Likes();
    }

    // taking the current recipe's ID
    const currentID = state.recipe.id;

    // user has NOT liked the current recipe yet, like it
    if (!state.likesList.isLiked(currentID)) {
        // add like to the state
        const newLike = state.likesList.addLike(
            currentID,
            state.recipe.title,
            state.recipe.author,
            state.recipe.img
        );
        // toggle the like button
        likesListView.toggleLikeBtn(true);
        // add like to UI list
        likesListView.createLike(newLike);

    // use has liked the current recipe already, dislike it.
    } else {
        // remove like from the state
        state.likesList.deleteLike(currentID);
        // toggle the like button
        likesListView.toggleLikeBtn(false);
        // remove like from UI List
        likesListView.deleteLike(currentID);
    }

    likesListView.toggleLikeMenu(state.likesList.getNumLikes());
};


// enable to delete and update the shopping list item
elements.shoppingList.addEventListener('click', e => {
    // fetching the id of the clicked shopping list item
    const id = e.target.closest('.shopping__item').dataset.itemid;

    // handling the delete button
    if (e.target.matches('.shopping__delete, .shopping__delete *')) {
        // Delete from state
        state.shoppingList.deleteLike(id);

        // Delete from UI
        shoppingListView.deleteListItem(id);

    // Handling if user clicks the butonns to change the qty in the shopping list
    } else if (e.target.matches('.shopping__count--value')) {
        // read the data from the UI and update in our shopping list
        const val = parseFloat(e.target.value, 10);
        state.shoppingList.updateCount(id, val);
    }
});

// monitor if user click one of the recipe or user reload the url.
['hashchange', 'load'].forEach(event => window.addEventListener(event, controlRecipe));

elements.searchForm.addEventListener('submit', e => {
    e.preventDefault();
    controlSearch();
});

// Handle the activities when the page is loaded
window.addEventListener('load', () => {
    state.likesList = new Likes();

    // restore likes
    state.likesList.readStorage();

    // show the menu if there are likes in the list
    likesListView.toggleLikeMenu(state.likesList.getNumLikes());

    // display the existing likes
    state.likesList.likes.forEach(like => likesListView.createLike(like));
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

// handling recipe servings - and + buttons click
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
        // add ingredients to shopping list
        controlShoppingList();
    } else if (e.target.matches('.recipe__love, .recipe__love *')) {
        // add recipe to like list
        controlLikesList();
    }
});