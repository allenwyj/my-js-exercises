import { elements } from './base';
import { limitRecipeTitle } from './searchView';

// Handling the Like button on the recipe section
export const toggleLikeBtn = isLiked => {
    // If the current recipe is liked, then the heart is the fill-in heart
    const iconString = isLiked ? 'icon-heart' : 'icon-heart-outlined';

    // change the parent element recipe__love and under its child element use class, href attribute
    document.querySelector('.recipe__love use').setAttribute('href', `img/icons.svg#${iconString}`);
};

// Handling the disvisibility of the like menu icon  
export const toggleLikeMenu = numLikes => {
    // If there is no like in the list, then hides the Like list button
    elements.likesMenu.style.visibility = numLikes > 0 ? 'visible' : 'hidden';
};

// Handling the creation of each item in the like list.
export const createLike = like => {
    // the markup for the Like list item
    const markup = `
        <li>
            <a class="likes__link" href="#${like.id}">
                <figure class="likes__fig">
                    <img src="${like.img}" alt="${like.title}">
                </figure>
                <div class="likes__data">
                    <h4 class="likes__name">${limitRecipeTitle(like.title)}</h4>
                    <p class="likes__author">${like.author}</p>
                </div>
            </a>
        </li>
    `;
    elements.likesList.insertAdjacentHTML('beforeend', markup);
};

// Handling the deletion of a like
export const deleteLike = id => {
    // getting the element based on the id, and traverse to its list item
    const el = document.querySelector(`.likes__link[href*="${id}"]`).parentElement;
    if (el) {
        // if the el is existed, then remove it from its parent element.
        el.parentElement.removeChild(el);
    }
}