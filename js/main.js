const navbar = document.querySelector(".navbar");
const searchForm = document.querySelector(".search-form");
const cartItem = document.querySelector(".cart-items-container");
const contactForm = document.querySelector("#contact-form");
const contactStatus = document.querySelector("#contact-status");

document.querySelector("#menu-btn").onclick = () => {
  navbar.classList.toggle("active");
  searchForm.classList.remove("active");
  cartItem.classList.remove("active");
};

document.querySelector("#search-btn").onclick = () => {
  searchForm.classList.toggle("active");
  navbar.classList.remove("active");
  cartItem.classList.remove("active");
};

document.querySelector("#cart-btn").onclick = () => {
  cartItem.classList.toggle("active");
  navbar.classList.remove("active");
  searchForm.classList.remove("active");
};

window.onscroll = () => {
  navbar.classList.remove("active");
  searchForm.classList.remove("active");
  cartItem.classList.remove("active");
};

function formatPrice(product) {
  return `${product.price.toFixed(2)} ${product.currency}`;
}

function renderStars(rating) {
  const fullStars = Math.floor(rating);
  const hasHalf = rating % 1 !== 0;
  let html = "";

  for (let index = 0; index < fullStars; index += 1) {
    html += '<i class="fas fa-star"></i>';
  }

  if (hasHalf) {
    html += '<i class="fas fa-star-half-alt"></i>';
  }

  return html;
}

function productCard(product, compact = false) {
  if (compact) {
    return `
      <div class="box">
        <img src="${product.image}" alt="${product.name}" />
        <h3>${product.name}</h3>
        <div class="price">${formatPrice(product)} <span>${product.oldPrice.toFixed(2)} ${product.currency}</span></div>
        <a href="#contact" class="btn">Add to Cart</a>
      </div>
    `;
  }

  return `
    <div class="box">
      <div class="icons">
        <a href="#contact" class="fas fa-shopping-cart" aria-label="Add ${product.name} to cart"></a>
        <a href="#products" class="fas fa-heart" aria-label="Save ${product.name}"></a>
        <a href="${product.image}" class="fas fa-eye" aria-label="View ${product.name}"></a>
      </div>
      <div class="image">
        <img src="${product.image}" alt="${product.name}" />
      </div>
      <div class="content">
        <h3>${product.name}</h3>
        <div class="stars">${renderStars(product.rating)}</div>
        <div class="price">${formatPrice(product)} <span>${product.oldPrice.toFixed(2)} ${product.currency}</span></div>
      </div>
    </div>
  `;
}

async function loadProducts() {
  const response = await fetch("/api/products");
  const products = await response.json();
  const catalogList = document.querySelector("#catalog-list");
  const productsList = document.querySelector("#products-list");

  catalogList.innerHTML = products
    .filter((product) => product.category === "catalog")
    .map((product) => productCard(product, true))
    .join("");

  productsList.innerHTML = products
    .filter((product) => product.category === "products")
    .map((product) => productCard(product))
    .join("");
}

async function loadReviews() {
  const response = await fetch("/api/reviews");
  const reviews = await response.json();
  document.querySelector("#reviews-list").innerHTML = reviews
    .map(
      (review) => `
        <div class="box">
          <i class="fas fa-quote-right quote"></i>
          <p>${review.text}</p>
          <img src="${review.image}" class="user" alt="${review.name}" />
          <h3>${review.name}</h3>
          <div class="stars">${renderStars(review.rating)}</div>
        </div>
      `
    )
    .join("");
}

async function loadBlogs() {
  const response = await fetch("/api/blogs");
  const blogs = await response.json();
  document.querySelector("#blogs-list").innerHTML = blogs
    .map(
      (blog) => `
        <div class="box">
          <div class="image">
            <img src="${blog.image}" alt="${blog.title}">
          </div>
          <div class="content">
            <a href="#blogs" class="title">${blog.title}</a>
            <span>by admin / ${blog.date}</span>
            <p>${blog.excerpt}</p>
            <a href="#contact" class="btn">read more</a>
          </div>
        </div>
      `
    )
    .join("");
}

async function submitContact(event) {
  event.preventDefault();
  const formData = new FormData(contactForm);
  const payload = Object.fromEntries(formData.entries());
  contactStatus.textContent = "Sending...";
  contactStatus.className = "form-status";

  const response = await fetch("/api/contact", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload)
  });
  const result = await response.json();

  if (!response.ok) {
    contactStatus.textContent = result.error || "Message could not be sent.";
    contactStatus.className = "form-status error";
    return;
  }

  contactForm.reset();
  contactStatus.textContent = "Message sent successfully.";
  contactStatus.className = "form-status success";
}

contactForm.addEventListener("submit", submitContact);

loadProducts().catch(() => {});
loadReviews().catch(() => {});
loadBlogs().catch(() => {});
