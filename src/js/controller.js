// Model
import * as model from "./model.js";

// Views
import recipeView from "./views/recipeView.js";

// Polyfilling
import 'core-js/stable';
import 'regenerator-runtime/runtime';

const timeout = function (s) {
  return new Promise(function (_, reject) {
    setTimeout(function () {
      reject(new Error(`Request took too long! Timeout after ${s} second`));
    }, s * 1000);
  });
};

// https://forkify-api.herokuapp.com/v2

///////////////////////////////////////


const controlRecipes = async function () {
  try {
    // Take search hash
    const id = window.location.hash.slice(1)
    console.log(id);
    
    // Guard clause if no id found from hash 
    if (!id) return;

    // 1. Start loading the spinner when we fetch data 
    recipeView.renderLoader()
    
    // 1. Loading the recipe
    await model.loadRecipe(id);

    // 2. Rendering the recipe 
    recipeView.render(model.state.recipe)
    
  } catch (e) {
    alert(e)
  }
};

// window.addEventListener("hashchange", controlRecipes)
// window.addEventListener("load", controlRecipes)

['hashchange', 'load'].forEach(ev => window.addEventListener(ev, controlRecipes))
// // http://localhost:1234/#5ed6604591c37cdc054bc886