import { elements } from './base';

export const getInput = () => elements.searchInput.value;

export const clearInput = () => {
    // avoid implicit return
    elements.searchInput.value = '';
};

export const clearResults = () => {
    // set the innerHTML to nothing
    elements.searchResultList.innerHTML = '';
    elements.searchResPages.innerHTML = '';
};

export const hightlightSelected = id => {
    const resultsArr = Array.from(document.querySelectorAll('.results__link'));
    resultsArr.forEach(el => {
        el.classList.remove('results__link--active');
    });
    // Get the <a> element in the document that has a "href" attribute
    document.querySelector(`a[href*="#${id}"]`).classList.add('results__link--active');
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

const createRecipeListItem = recipe => {
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
    
    // insert html code into the DOM, each insertion will be placed to the last position.
    elements.searchResultList.insertAdjacentHTML('beforeend', markup);
};

/**
 * Create a HTML button based on it's type and assign the page num to it.
 * @param {number} page - the current page
 * @param {string} type - the button's type: prev or next
 */
const createButton = (page, type) => `
    <button class="btn-inline results__btn--${type}" data-goto=${type === 'prev' ? page - 1 : page + 1}>
        <span>Page ${type === 'prev' ? page - 1 : page + 1}</span>
        <svg class="search__icon">
            <use href="img/icons.svg#icon-triangle-${type === 'prev' ? 'left' : 'right'}"></use>
        </svg>
    </button>
`;

/**
 * Assign the pagination button(s) to the HTML page.
 * If the page num is 1, then it will only shows the 'next' button.
 * If the page is the last page, it will only shows the 'prev' button.
 * If the page is within the total page number, then shows two buttons.
 * @param {number} page - the current page number
 * @param {number} numResults - the number of results needed to be paginated
 * @param {number} resPerPage - the number of results for each page
 */
const displayButtons = (page, numResults, resPerPage) => {
    const pages = Math.ceil(numResults / resPerPage);
    let button;

    if (page === 1 && pages > 1) {
        // only show the 'next' button
        button = createButton(page, 'next');
    } else if (page < pages) {
        // show 'next' and 'prev' buttons
        button = `
            ${createButton(page, 'prev')}
            ${createButton(page, 'next')}
        `;
    } else if (page === pages && pages > 1) {
        // only show the 'prev' button
        button = createButton(page, 'prev');
    }

    elements.searchResPages.insertAdjacentHTML('afterbegin', button);
};

// loading 10 resources per page by default.
export const displayResults = (recipes, page = 1, resPerPage = 10) => {

    const start = (page - 1) * resPerPage;
    const end = page * resPerPage;

    // calling renderRecipe function to create HTML element for each recipe
    recipes.slice(start, end).forEach(createRecipeListItem);

    // generate the pagination button(s) based on the page num
    displayButtons(page, recipes.length, resPerPage);
};
