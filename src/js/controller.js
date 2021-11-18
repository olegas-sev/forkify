// Model
import * as model from "./model.js";

// Views
import recipeView from "./views/recipeView";
import searchView from "./views/searchView";
import resultsView from "./views/resultsView";
import bookmarksView from "./views/bookmarksView";
import paginationView from "./views/paginationView";
import addRecipeView from "./views/addRecipeView";

// Config
import { MODAL_CLOSE_SECONDS } from "./config.js";

// Polyfilling
import 'core-js/stable';
import 'regenerator-runtime/runtime';




const controlRecipes = async function () {
  try {
    // Take search hash
    const id = window.location.hash.slice(1)

    // Guard clause if no id found from hash 
    if (!id) return;

    // 0. Update results view to mark selected search result
    resultsView.update(model.getSearchResultsPage())
    // 1. Update bookmarks
    bookmarksView.update(model.state.bookmarks)

    // 2. Start loading the spinner when we fetch data 
    recipeView.renderLoader()

    // 3. Loading the recipe
    await model.loadRecipe(id);

    // 4. Rendering the recipe 
    recipeView.render(model.state.recipe)  

  } catch (e) {
    recipeView.renderError();
  }
};

const controlSearchResults = async function () {
  try {
    resultsView.renderLoader()

    // Get search query
    const query = searchView.getQuery();
    if (!query) return;

    // Load search results
    await model.loadSearchResults(query)

    // Get results of certain page
    //resultsView.render(model.state.search.results)
    resultsView.render(model.getSearchResultsPage())

    // Render the results
    paginationView.render(model.state.search)
  } catch (e) {
    console.log(e);
  }
}

const controlPagination = function (goToPage) {
  // Get NEW results of certain page
  resultsView.render(model.getSearchResultsPage(goToPage))
  // Render the results
  paginationView.render(model.state.search)

}

const controlServings = function(newServings) {
  // Update recipe servings
  model.updateServings(newServings)

  // Update UI
  // recipeView.render(model.state.recipe)
  recipeView.update(model.state.recipe)
}

const controlAddBookmark = function() {
  // Add/remove bookmark
  if (!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
  else model.deleteBookmark(model.state.recipe.id);

  // Update view
  recipeView.update(model.state.recipe);

  // Render bookmarks
  bookmarksView.render(model.state.bookmarks)
}

const controlBookmarks = function() {
  bookmarksView.render(model.state.bookmarks)
}

const controlAddRecipe = async function(newRecipe) {
  // Upload the new recipe data
  try {
    // Show loader
    addRecipeView.renderLoader();

    await model.uploadRecipe(newRecipe)

    // Render recipe
    recipeView.render(model.state.recipe)

    // Success message 
    addRecipeView.renderMessage()

    // Bookmark view
    bookmarksView.render(model.state.bookmarks)

    // Change url path to the added recipe
    window.history.pushState(null, '', `#${model.state.recipe.id}`)

    // Close form window
    setTimeout(function() {
      addRecipeView.toggleWindow()
    }, MODAL_CLOSE_SECONDS * 1000)

  } catch (e) {
    console.error(e);
    addRecipeView.renderError(e.message)
  }
}

// Subscriber
const init = function () {
  bookmarksView.addHandlerRender(controlBookmarks)
  recipeView.addHandlerRender(controlRecipes)
  recipeView.addHandlerUpdateServings(controlServings)
  recipeView.addHandlerAddBookmark(controlAddBookmark)
  searchView.addHandlerSearch(controlSearchResults)
  paginationView.addHandlerClick(controlPagination)
  addRecipeView.addHandlerUpload(controlAddRecipe)
}

init();
