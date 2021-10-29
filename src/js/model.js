export const state = {
    recipe: {},
}

export const loadRecipe = async function (id) {
    try {
        // Fetching data from API 
        const res = await fetch(`https://forkify-api.herokuapp.com/api/v2/recipes/${id}`)
        const data = await res.json()

        // If response isn't okay throw some erros
        if (!res.ok) throw new Error(`${data.message} (${res.status})`)
        console.log(res, data);

        // State assigned to fetched data
        const { recipe } = data.data
        state.recipe = {
            id: recipe.id,
            title: recipe.title,
            publisher: recipe.publisher,
            sourceUrl: recipe.source_url,
            image: recipe.image_url,
            servings: recipe.servings,
            cookingTime: recipe.cooking_time,
            ingredients: recipe.ingredients
        }
        console.log(state.recipe);
    } catch (e) {
        alert(e)
    }
}