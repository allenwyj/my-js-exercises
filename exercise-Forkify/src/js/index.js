import Search from './models/Search';
import * as searchView from './views/searchView';
import { elements, renderLoader, clearLoader } from './views/base';

/**
 *  Global state of the app
 *  - Search object
 *  - Current recipe object
 *  - Shopping list object
 *  - Liked recipes
 */
const state = {};

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

        // search for recipes
        await state.search.getResults();

        // display results on UI
        clearLoader();
        searchView.renderResults(state.search.result);
    
    }
    
};

elements.searchForm.addEventListener('submit', e => {
    e.preventDefault();
    controlSearch();
});

elements.searchResPages.addEventListener('click', e => {
    // monitor if the click can be traced back to 'btn-inline' class
    const btn = e.target.closest('.btn-inline');
    if (btn) {
        // fetch our custom data through accessing variable 'goto'
        const goToPage = parseInt(btn.dataset.goto, 10);
        // clear the prev list and buttons
        searchView.clearResults();
        // reload the new page list
        searchView.renderResults(state.search.result, goToPage);
    }
});
