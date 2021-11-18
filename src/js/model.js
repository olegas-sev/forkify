import { API_KEY, API_URL, RES_PER_PAGE } from './config';
import { AJAX } from './helpers';

export const state = {
    recipe: {},
    search: {
        query: '',
        results: [],
        page: 1,
        resultsPerPage: RES_PER_PAGE,
    },
    bookmarks: [],
}

const createRecipeObject = function (data) {
    // State assigned to fetched data
    const { recipe } = data.data
    return {
        id: recipe.id,
        title: recipe.title,
        publisher: recipe.publisher,
        sourceUrl: recipe.source_url,
        image: recipe.image_url,
        servings: recipe.servings,
        cookingTime: recipe.cooking_time,
        ingredients: recipe.ingredients,
        ...(recipe.key && {key: recipe.key})
    }
}

export const loadRecipe = async function (id) {
    try {
        const data = await AJAX(`${API_URL}${id}?key=${API_KEY}`);
        state.recipe = createRecipeObject(data)


        if (state.bookmarks.some(bookmark => bookmark.id === id))
            state.recipe.bookmarked = true
        else
            state.recipe.bookmarked = false
    } catch (e) {
        throw e;
    }
}

export const loadSearchResults = async function (query) {
    try {
        state.search.query = query;
        const data = await AJAX(`${API_URL}?search=${query}&key=${API_KEY}`)

        state.search.results = data.data.recipes.map(recipe => {
            return {
                id: recipe.id,
                title: recipe.title,
                publisher: recipe.publisher,
                image: recipe.image_url,
                ...(recipe.key && {key: recipe.key})
            };
        })
        // New searc will reset current page to one
        state.search.page = 1;
    } catch (e) {
        console.error(e);
        throw e
    }
}

export const getSearchResultsPage = function (page = state.search.page) {
    state.search.page = page;
    const start = (page - 1) * state.search.resultsPerPage // 0
    const end = page * state.search.resultsPerPage // 9

    return state.search.results.slice(start, end);
}

export const updateServings = function (newServings) {
    state.recipe.ingredients.forEach(ing => {
        ing.quantity = (ing.quantity * newServings) / state.recipe.servings;
        // newQt = oldQt * newServings / oldServings // 2 * 8 / 4 = 4
      });
    
      state.recipe.servings = newServings;
};

const persistBookmarks = function () {
    localStorage.setItem('bookmarks', JSON.stringify(state.bookmarks))
}

export const addBookmark = function (recipe) {
    // Add a bookmark
    state.bookmarks.push(recipe)

    // Mark current recipe as bookmark
    if (recipe.id === state.recipe.id) state.recipe.bookmarked = true;
    persistBookmarks();
}

export const deleteBookmark = function (id) {
    // Find index
    const index = state.bookmarks.findIndex(el => el.id === id)
    // Remove from the list
    state.bookmarks.splice(index, 1)

    // Mark current recipe as NOT bookmark
    if (id === state.recipe.id) state.recipe.bookmarked = false;
    persistBookmarks();
}

const init = function () {
    const bookmarksStorage = localStorage.getItem('bookmarks')
    if (bookmarksStorage) state.bookmarks = JSON.parse(bookmarksStorage)
}

init();

const clearBookmarks = function () {
    localStorage.clear('bookmarks')
}
// clearBookmarks()

export const uploadRecipe = async function (newRecipe) {
    try {
        const ingredients = Object.entries(newRecipe)
            .filter(entry =>
                entry[0].startsWith('ingredient') && entry[1] !== '')
            .map(ing => {
                const ingredientsArray = ing[1].split(',').map(el => el.trim());
                if (ingredientsArray.length !== 3) throw new Error('Wrong ingredient format! Please use the correct format');
                const [quantity, unit, description] = ingredientsArray;

                return { quantity: quantity ? +quantity : null, unit, description }
            })
        const recipe = {
            title: newRecipe.title,
            source_url: newRecipe.sourceUrl,
            image_url: newRecipe.image,
            publisher: newRecipe.publisher,
            cooking_time: +newRecipe.cookingTime,
            servings: +newRecipe.servings,
            ingredients
        }

        const data = await AJAX(`${API_URL}?key=${API_KEY}`, recipe)
        state.recipe = createRecipeObject(data)
        addBookmark(state.recipe)
    } catch (e) {
        throw e
    }


}