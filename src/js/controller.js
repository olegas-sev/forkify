// Model
import * as model from "./model.js";

// Views
import recipeView from "./views/recipeView.js";
import searchView from "./views/searchView.js";
import resultsView from "./views/resultsView.js";
import paginationView from "./views/paginationView.js";

// Polyfilling
import 'core-js/stable';
import 'regenerator-runtime/runtime';



const controlRecipes = async function () {
  try {
    // Take search hash
    const id = window.location.hash.slice(1)

    // Guard clause if no id found from hash 
    if (!id) return;

    // 1. Start loading the spinner when we fetch data 
    recipeView.renderLoader()

    // 1. Loading the recipe
    await model.loadRecipe(id);

    // 2. Rendering the recipe 
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

// Subscriber
const init = function () {
  recipeView.addHandlerRender(controlRecipes)
  searchView.addHandlerSearch(controlSearchResults)
  paginationView.addHandlerClick(controlPagination)
}

init();
