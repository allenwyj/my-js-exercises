import { elements } from './base';

export const getInput = () => elements.searchInput.value;

export const clearInput = () => {
    // avoid implicit return
    elements.searchInput.value = '';
};

export const clearResults = () => {
    // set the innerHTML to nothing
    elements.searchResultList.innerHTML = '';
};

/**
 *  Limit the title of recipe to 17 char, so it won't break the layout
 */
const limitRecipeTitle = (title, limit = 17) => {
    const newTitle = [];
    if (title.length > limit) {
        title.split(' ').reduce((acc, cur) => {
            if ((acc + cur.length) <= limit) {
                newTitle.push(cur);
            }
            return acc + cur.length;
        }, 0);

        // return the new title
        return `${newTitle.join(' ')} ...`;
    }
    return title;
};

const renderRecipe = recipe => {
    const markup = `
        <li>
            <a class="results__link" href="#${recipe.recipe_id}">
                <figure class="results__fig">
                    <img src="${recipe.image_url}" alt="${recipe.title}">
                </figure>
                <div class="results__data">
                    <h4 class="results__name">${limitRecipeTitle(recipe.title)}</h4>
                    <p class="results__author">${recipe.publisher}</p>
                </div>
            </a>
        </li>
    `;
    
    // insert html code into the DOM
    elements.searchResultList.insertAdjacentHTML('beforeend', markup);
};

export const renderResults = recipes => {
    // calling renderRecipe function
    recipes.forEach(renderRecipe);
};
