const products = [
  { name: "Amber Wood", price: 68.5, image: "img/product/2.jpg", tags: ["oud", "amber"] },
  { name: "Royal Oud", price: 95, image: "img/product/6.jpg", tags: ["oud"] },
  { name: "Fresh Signature", price: 61, image: "img/product/9.jpg", tags: ["fresh"] },
  { name: "Velvet Rose", price: 59.99, image: "img/product/4.jpg", tags: ["rose"] },
  { name: "Citrus Musk", price: 64, image: "img/product/5.jpg", tags: ["fresh"] },
  { name: "Noir Essence", price: 82, image: "img/product/3.jpg", tags: ["amber"] },
  { name: "Burberry Black", price: 75.99, image: "img/product/1.jpg", tags: ["classic", "amber"] },
  { name: "Golden Bloom", price: 72, image: "img/product/7.jpg", tags: ["rose", "amber"] },
  { name: "Midnight Pour Femme", price: 88, image: "img/product/8.jpg", tags: ["oud", "classic"] },
  { name: "Crystal Muse", price: 70, image: "img/product/10.jpg", tags: ["fresh", "rose"] }
];

const screenTitle = document.querySelector("#screenTitle");
const screenEyebrow = document.querySelector("#screenEyebrow");
const filterButton = document.querySelector("#filterButton");
const views = [...document.querySelectorAll(".view")];
const tabButtons = [...document.querySelectorAll("[data-tab]")];
const grid = document.querySelector("#productGrid");
const homeGrid = document.querySelector("#homeGrid");
const searchInput = document.querySelector("#searchInput");
const filterButtons = [...document.querySelectorAll("[data-filter]")];
const cartCount = document.querySelector("#cartCount");
const cartList = document.querySelector("#cartList");
const cartTotal = document.querySelector("#cartTotal");
const checkoutButton = document.querySelector("#checkoutButton");
const cartCheckoutButton = document.querySelector("#cartCheckoutButton");
let activeFilter = "all";
let cartItems = [products[0], products[1]];

function formatPrice(value) {
  return `${Number(value).toFixed(value % 1 ? 2 : 0)} AZN`;
}

function productCard(product) {
  return `
    <article class="productCard" data-name="${product.name}">
      <img src="${product.image}" alt="${product.name}" />
      <strong>${product.name}</strong>
      <span>${formatPrice(product.price)}</span>
    </article>
  `;
}

function wireProductCards(scope = document) {
  scope.querySelectorAll(".productCard").forEach((card) => {
    card.addEventListener("click", () => {
      const product = products.find((item) => item.name === card.dataset.name);
      if (!product) return;
      cartItems.push(product);
      renderCart();
      showView("cart");
    });
  });
}

function renderProducts() {
  const queryTerms = searchInput.value.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const visible = products.filter((product) => {
    const matchesFilter = activeFilter === "all" || product.tags.includes(activeFilter);
    const searchable = `${product.name} ${product.tags.join(" ")}`.toLowerCase();
    const matchesQuery = queryTerms.length === 0 || queryTerms.every((term) => searchable.includes(term));
    return matchesFilter && matchesQuery;
  });

  grid.innerHTML = visible.length ? visible.map(productCard).join("") : '<div class="empty">No perfume found</div>';
  wireProductCards(grid);
}

function renderHome() {
  homeGrid.innerHTML = products.slice(6, 8).map(productCard).join("");
  wireProductCards(homeGrid);
}

function renderCart() {
  cartCount.textContent = `${cartItems.length} items`;
  cartTotal.textContent = formatPrice(cartItems.reduce((sum, product) => sum + product.price, 0));

  cartList.innerHTML = cartItems.length
    ? cartItems.map((product, index) => `
      <article class="cartRow">
        <img src="${product.image}" alt="${product.name}" />
        <div>
          <strong>${product.name}</strong>
          <span>${formatPrice(product.price)}</span>
        </div>
        <button type="button" data-remove="${index}">Remove</button>
      </article>
    `).join("")
    : '<div class="empty">Cart is empty</div>';

  cartList.querySelectorAll("[data-remove]").forEach((button) => {
    button.addEventListener("click", () => {
      cartItems.splice(Number(button.dataset.remove), 1);
      renderCart();
    });
  });
}

function showView(name, updateHash = true) {
  views.forEach((view) => view.classList.toggle("active", view.dataset.view === name));
  tabButtons.forEach((button) => button.classList.toggle("active", button.dataset.tab === name));
  filterButton.hidden = name !== "catalog";

  const titles = {
    home: ["M&L Parfums", "Home"],
    catalog: ["M&L Parfums", "Catalog"],
    cart: ["Order summary", "Cart"],
    profile: ["Bonus & account", "Profile"]
  };
  screenEyebrow.textContent = titles[name][0];
  screenTitle.textContent = titles[name][1];
  if (updateHash) {
    window.history.replaceState(null, "", `#${name}`);
  }
}

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activeFilter = button.dataset.filter;
    filterButtons.forEach((item) => item.classList.toggle("active", item === button));
    renderProducts();
  });
});

tabButtons.forEach((button) => {
  button.addEventListener("click", () => showView(button.dataset.tab));
});

searchInput.addEventListener("input", renderProducts);
checkoutButton.addEventListener("click", () => showView("cart"));
cartCheckoutButton.addEventListener("click", () => {
  cartCheckoutButton.textContent = "Ready";
});
filterButton.addEventListener("click", () => {
  activeFilter = activeFilter === "all" ? "oud" : "all";
  filterButtons.forEach((item) => item.classList.toggle("active", item.dataset.filter === activeFilter));
  renderProducts();
});

renderHome();
renderProducts();
renderCart();
showView(window.location.hash.replace("#", "") || "catalog", false);
