import { elements } from './base';
import { Fraction } from 'fractional';

const createIngredientHTML = el => `
    <li class="recipe__item">
        <svg class="recipe__icon">
            <use href="img/icons.svg#icon-check"></use>
        </svg>
        <div class="recipe__count">${formatNumberToFraction(el.count)}</div>
        <div class="recipe__ingredient">
            <span class="recipe__unit">${el.unit}</span>
            ${el.ingredient}
        </div>
    </li>
`;

/**
 * Convert a number which may contain decimal part into fraction.
 * @param {number} num 
 */
const formatNumberToFraction = num => {
    if (num) {
        // spliting num to integer and decimal parts.
        // 3.5 => int = 3, dec = 5
        const [int, dec] = num.toString().split('.').map(el => parseInt(el, 10));

        // if there is no decimal part, simply return the num.
        if (!dec) {
            return num;
        }

        // if the integer part is 0, it means 0 < num < 1
        // num = 0 cannot be passed in this if-statement
        if (int === 0) {
            const fr = new Fraction(num);
            return `${fr.numerator}/${fr.denominator}`; // i.e. 2/3
        } else {
            // getting the decimal part
            const fr = new Fraction(num - int);
            return `${int} ${fr.numerator}/${fr.denominator}`; // i.e. 1 2/3
        }
    }
    return '?';
};

export const clearResults = () => {
    // set the innerHTML to nothing
    elements.recipeDetail.innerHTML = '';
};

export const updateIngredientsQtyOnUI = recipe => {
    // update the servings
    document.querySelector('.recipe__info-data--people').textContent = recipe.servings;

    // update the ingredients
    const oldIngredients = Array.from(document.querySelectorAll('.recipe__count'));
    oldIngredients.forEach((el, i) => {
        el.textContent = formatNumberToFraction(recipe.ingredients[i].count);
    });
};

export const displayRecipeSection = recipe => {
    const markup = `
            <figure class="recipe__fig">
                <img src="${recipe.img}" alt="${recipe.title}" class="recipe__img">
                <h1 class="recipe__title">
                    <span>${recipe.title}</span>
                </h1>
            </figure>
            <div class="recipe__details">
                <div class="recipe__info">
                    <svg class="recipe__info-icon">
                        <use href="img/icons.svg#icon-stopwatch"></use>
                    </svg>
                    <span class="recipe__info-data recipe__info-data--minutes">${recipe.time}</span>
                    <span class="recipe__info-text"> minutes</span>
                </div>
                <div class="recipe__info">
                    <svg class="recipe__info-icon">
                        <use href="img/icons.svg#icon-man"></use>
                    </svg>
                    <span class="recipe__info-data recipe__info-data--people">${recipe.servings}</span>
                    <span class="recipe__info-text"> servings</span>

                    <div class="recipe__info-buttons">
                        <button class="btn-tiny btn-decrease">
                            <svg>
                                <use href="img/icons.svg#icon-circle-with-minus"></use>
                            </svg>
                        </button>
                        <button class="btn-tiny btn-increase">
                            <svg>
                                <use href="img/icons.svg#icon-circle-with-plus"></use>
                            </svg>
                        </button>
                    </div>

                </div>
                <button class="recipe__love">
                    <svg class="header__likes">
                        <use href="img/icons.svg#icon-heart-outlined"></use>
                    </svg>
                </button>
            </div>

            <div class="recipe__ingredients">
                <ul class="recipe__ingredient-list">

                    ${recipe.ingredients.map(el => createIngredientHTML(el)).join('')}

                </ul>

                <button class="btn-small recipe__btn recipe__btn--add">
                    <svg class="search__icon">
                        <use href="img/icons.svg#icon-shopping-cart"></use>
                    </svg>
                    <span>Add to shopping list</span>
                </button>
            </div>

            <div class="recipe__directions">
                <h2 class="heading-2">How to cook it</h2>
                <p class="recipe__directions-text">
                    This recipe was carefully designed and tested by
                    <span class="recipe__by">${recipe.author}</span>. Please check out directions at their website.
                </p>
                <a class="btn-small recipe__btn" href="${recipe.url}" target="_blank">
                    <span>Directions</span>
                    <svg class="search__icon">
                        <use href="img/icons.svg#icon-triangle-right"></use>
                    </svg>

                </a>
            </div>
    `;
    elements.recipeDetail.insertAdjacentHTML('afterbegin', markup);
};