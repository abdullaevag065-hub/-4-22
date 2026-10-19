
const API = "https://dummyjson.com";
const recipesList = document.getElementById("recipes-list");
const productsList = document.getElementById("products-list");
const recipeForm = document.getElementById("recipe-form");
const productForm = document.getElementById("product-form");
const recipeInput = document.getElementById("recipe-name");
const productInput = document.getElementById("product-name");
const recipeMessage = document.getElementById("recipe-message");
const productMessage = document.getElementById("product-message");


function showMessage(element, text, type = "") {
    element.textContent = text;
    element.className = "message";

    if (type) {
        element.classList.add(type);
    }
}


async function request(url, options = {}) {
    const response = await fetch(url, options);

    if (!response.ok) {
        throw new Error(`Ошибка сервера: ${response.status}`);
    }

    return response.json();
}


function createDeleteButton(id, type, card) {
    const button = document.createElement("button");

    button.type = "button";
    button.className = "delete-btn";
    button.textContent = "Удалить";

    button.addEventListener("click", async () => {
        button.disabled = true;
        button.textContent = "Удаление...";

        const message = type === "recipes"
            ? recipeMessage
            : productMessage;

        showMessage(message, "");

        try {
            await request(`${API}/${type}/${id}`, {
                method: "DELETE"
            });

            
            card.remove();

            showMessage(message, "Запись успешно удалена!", "success");
        } catch (error) {
            console.error("Ошибка удаления:", error);

            showMessage(
                message,
                "Не удалось удалить запись. Попробуйте ещё раз.",
                "error"
            );

            button.disabled = false;
            button.textContent = "Удалить";
        }
    });

    return button;
}


function createRecipeCard(recipe) {
    const card = document.createElement("article");
    card.className = "card";

    const image = document.createElement("img");
    image.src = recipe.image || "https://placehold.co/600x400?text=Recipe";
    image.alt = recipe.name;
    image.loading = "lazy";
    image.onerror = () => {
        image.onerror = null;
        image.src = "https://placehold.co/600x400?text=Recipe";
    };

    const content = document.createElement("div");
    content.className = "card-content";
    const title = document.createElement("h3");
    title.textContent = recipe.name;
    const cuisine = document.createElement("p");
    cuisine.textContent = `Кухня: ${recipe.cuisine || "Не указана"}`;
    content.append(title, cuisine);

    if (recipe.id != null) {
        content.append(
            createDeleteButton(recipe.id, "recipes", card)
        );
    }

    card.append(image, content);

    return card;
}


function createProductCard(product) {
    const card = document.createElement("article");
    card.className = "card";
    const image = document.createElement("img");
    image.src = product.thumbnail ||
        "https://placehold.co/600x400?text=Product";
    image.alt = product.title;
    image.loading = "lazy";
    image.onerror = () => {
        image.onerror = null;
        image.src = "https://placehold.co/600x400?text=Product";
    };

    const content = document.createElement("div");
    content.className = "card-content";
    const title = document.createElement("h3");
    title.textContent = product.title;
    const price = document.createElement("p");
    price.className = "price";
    price.textContent = `${product.price ?? 0} $`;

    content.append(title, price);

    if (product.id != null) {
        content.append(
            createDeleteButton(product.id, "products", card)
        );
    }

    card.append(image, content);

    return card;
}


async function loadRecipes() {
    try {
        const data = await request(`${API}/recipes`);

        recipesList.replaceChildren();

        data.recipes.forEach(recipe => {
            recipesList.append(createRecipeCard(recipe));
        });

        if (data.recipes.length === 0) {
            recipesList.textContent = "Рецептов пока нет.";
        }
    } catch (error) {
        console.error("Ошибка загрузки рецептов:", error);

        recipesList.textContent =
            "Не удалось загрузить рецепты. Обновите страницу позже.";
    }
}


async function loadProducts() {
    try {
        const data = await request(`${API}/products`);

        productsList.replaceChildren();

        data.products.forEach(product => {
            productsList.append(createProductCard(product));
        });

        if (data.products.length === 0) {
            productsList.textContent = "Товаров пока нет.";
        }
    } catch (error) {
        console.error("Ошибка загрузки товаров:", error);

        productsList.textContent =
            "Не удалось загрузить товары. Обновите страницу позже.";
    }
}


recipeForm.addEventListener("submit", async event => {
    event.preventDefault();

    const name = recipeInput.value.trim();

    if (!name) {
        showMessage(
            recipeMessage,
            "Ошибка: введите название рецепта!",
            "error"
        );
        recipeInput.focus();
        return;
    }

    const submitButton = recipeForm.querySelector("button");
    submitButton.disabled = true;
    showMessage(recipeMessage, "Добавление рецепта...");

    try {
        const recipe = await request(`${API}/recipes/add`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name: name,
                cuisine: "Не указана",
                image: "https://placehold.co/600x400?text=Recipe"
            })
        });

       
        recipesList.prepend(createRecipeCard(recipe));

        recipeForm.reset();

        showMessage(
            recipeMessage,
            "Рецепт успешно добавлен!",
            "success"
        );
    } catch (error) {
        console.error("Ошибка добавления рецепта:", error);

        showMessage(
            recipeMessage,
            "Не удалось добавить рецепт. Попробуйте ещё раз.",
            "error"
        );
    } finally {
        submitButton.disabled = false;
    }
});


productForm.addEventListener("submit", async event => {
    event.preventDefault();
    const title = productInput.value.trim();

    if (!title) {
        showMessage(
            productMessage,
            "Ошибка: введите название товара!",
            "error"
        );
        productInput.focus();
        return;
    }

    const submitButton = productForm.querySelector("button");
    submitButton.disabled = true;
    showMessage(productMessage, "Добавление товара...");

    try {
        const product = await request(`${API}/products/add`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                title: title,
                price: 0,
                thumbnail: "https://placehold.co/600x400?text=Product"
            })
        });

        
        productsList.prepend(createProductCard(product));

        productForm.reset();

        showMessage(
            productMessage,
            "Товар успешно добавлен!",
            "success"
        );
    } catch (error) {
        console.error("Ошибка добавления товара:", error);

        showMessage(
            productMessage,
            "Не удалось добавить товар. Попробуйте ещё раз.",
            "error"
        );
    } finally {
        submitButton.disabled = false;
    }
});


loadRecipes();
loadProducts();
