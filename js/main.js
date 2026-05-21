const navbar = document.querySelector(".navbar");
const searchForm = document.querySelector(".search-form");
const cartItem = document.querySelector(".cart-items-container");
const contactForm = document.querySelector("#contact-form");
const contactStatus = document.querySelector("#contact-status");
const progress = document.querySelector("#scroll-progress");
const cursorDot = document.querySelector(".cursor-dot");
const cursorRing = document.querySelector(".cursor-ring");
const quickView = document.querySelector("#quick-view");
const quickImage = document.querySelector("#quick-image");
const quickTitle = document.querySelector("#quick-title");
const quickPrice = document.querySelector("#quick-price");
const menuBtn = document.querySelector("#menu-btn");
const searchBtn = document.querySelector("#search-btn");
const cartBtn = document.querySelector("#cart-btn");

function toggleClass(node, className, force) {
  if (node) node.classList.toggle(className, force);
}

function removeClass(node, className) {
  if (node) node.classList.remove(className);
}

if (menuBtn) {
  menuBtn.onclick = () => {
    toggleClass(navbar, "active");
    removeClass(searchForm, "active");
    removeClass(cartItem, "active");
  };
}

if (searchBtn) {
  searchBtn.onclick = () => {
    toggleClass(searchForm, "active");
    removeClass(navbar, "active");
    removeClass(cartItem, "active");
  };
}

if (cartBtn) {
  cartBtn.onclick = () => {
    toggleClass(cartItem, "active");
    removeClass(navbar, "active");
    removeClass(searchForm, "active");
  };
}

window.onscroll = () => {
  removeClass(navbar, "active");
  removeClass(searchForm, "active");
  removeClass(cartItem, "active");
  updateProgress();
};

function updateProgress() {
  if (!progress) return;
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const percent = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
  progress.style.width = `${percent}%`;
}

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
        <span class="product-badge">${product.rating >= 5 ? "Top Pick" : "Signature"}</span>
        <img src="${product.image}" alt="${product.name}" />
        <h3>${product.name}</h3>
        <div class="price">${formatPrice(product)} <span>${product.oldPrice.toFixed(2)} ${product.currency}</span></div>
        <a href="#contact" class="btn">Add to Cart</a>
      </div>
    `;
  }

  return `
    <div class="box">
      <span class="product-badge">${product.rating >= 5 ? "Icon" : "New"}</span>
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
  if (!response.ok) throw new Error("Products API failed");
  const products = await response.json();
  const catalogList = document.querySelector("#catalog-list");
  const productsList = document.querySelector("#products-list");

  if (catalogList) {
    catalogList.innerHTML = products
      .filter((product) => product.category === "catalog")
      .map((product) => productCard(product, true))
      .join("");
  }

  if (productsList) {
    productsList.innerHTML = products
      .filter((product) => product.category === "products")
      .map((product) => productCard(product))
      .join("");
  }

  wireProductInteractions();
  observeReveal();
}

async function loadReviews() {
  const response = await fetch("/api/reviews");
  if (!response.ok) throw new Error("Reviews API failed");
  const reviews = await response.json();
  const reviewsList = document.querySelector("#reviews-list");
  if (!reviewsList) return;
  reviewsList.innerHTML = reviews
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
  observeReveal();
}

async function loadBlogs() {
  const response = await fetch("/api/blogs");
  if (!response.ok) throw new Error("Blogs API failed");
  const blogs = await response.json();
  const blogsList = document.querySelector("#blogs-list");
  if (!blogsList) return;
  blogsList.innerHTML = blogs
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
  observeReveal();
}

async function submitContact(event) {
  event.preventDefault();
  if (!contactForm || !contactStatus) return;
  const formData = new FormData(contactForm);
  const payload = Object.fromEntries(formData.entries());
  contactStatus.textContent = "Sending...";
  contactStatus.className = "form-status";

  try {
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
  } catch {
    contactStatus.textContent = "Backend is not available on this static preview.";
    contactStatus.className = "form-status error";
  }
}

if (contactForm) {
  contactForm.addEventListener("submit", submitContact);
}

function wireProductInteractions() {
  const searchInput = document.querySelector("#search-box");
  const cartContainer = document.querySelector(".cart-items-container");
  const cartButtons = [...document.querySelectorAll('a[aria-label^="Add"], .catalog .box .btn')];
  const viewButtons = [...document.querySelectorAll('a[aria-label^="View"]')];

  if (searchInput && !searchInput.dataset.wired) {
    searchInput.dataset.wired = "true";
    searchInput.addEventListener("input", () => {
      const query = searchInput.value.trim().toLowerCase();
      document.querySelectorAll(".catalog .box, .products .box").forEach((card) => {
        const visible = card.textContent.toLowerCase().includes(query);
        card.style.display = visible ? "" : "none";
      });
    });
  }

  cartButtons.forEach((button) => {
    if (button.dataset.wired) return;
    button.dataset.wired = "true";
    button.addEventListener("click", (event) => {
      event.preventDefault();
      const card = event.currentTarget.closest(".box");
      if (!card) return;
      const name = card.querySelector("h3")?.textContent || "Selected perfume";
      const price = card.querySelector(".price")?.childNodes[0]?.textContent.trim() || "";
      const image = card.querySelector("img")?.getAttribute("src") || "img/product/1.jpg";
      if (!cartContainer) return;
      cartContainer.classList.add("active");
      cartContainer.insertAdjacentHTML(
        "afterbegin",
        `<div class="cart-item fresh">
          <span class="fas fa-times"></span>
          <img src="${image}" alt="${name}" />
          <div class="content">
            <h3>${name}</h3>
            <div class="price">${price}</div>
          </div>
        </div>`
      );
    });
  });

  viewButtons.forEach((button) => {
    if (button.dataset.quickWired) return;
    button.dataset.quickWired = "true";
    button.addEventListener("click", (event) => {
      event.preventDefault();
      const card = event.currentTarget.closest(".box");
      if (!card) return;
      openQuickView(card);
    });
  });
}

function openQuickView(card) {
  if (!quickView || !quickImage || !quickTitle || !quickPrice) return;
  quickImage.src = card.querySelector("img")?.getAttribute("src") || "img/product/1.jpg";
  quickTitle.textContent = card.querySelector("h3")?.textContent || "M&L Parfums";
  quickPrice.textContent = card.querySelector(".price")?.childNodes[0]?.textContent.trim() || "";
  quickView.classList.add("active");
  quickView.setAttribute("aria-hidden", "false");
}

function observeReveal() {
  const items = document.querySelectorAll(".box, .about .row, .contact .row, .heading, .section-kicker");
  if (!("IntersectionObserver" in window)) {
    items.forEach((item) => item.classList.add("reveal", "is-visible"));
    return;
  }
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  items.forEach((item) => {
    item.classList.add("reveal");
    observer.observe(item);
  });
}

document.addEventListener("click", (event) => {
  if (event.target.classList.contains("fa-times")) {
    event.target.closest(".cart-item")?.remove();
  }
  if (quickView && (event.target.classList.contains("quick-close") || event.target === quickView)) {
    quickView.classList.remove("active");
    quickView.setAttribute("aria-hidden", "true");
  }
});

document.addEventListener("mousemove", (event) => {
  if (cursorDot && cursorRing) {
    cursorDot.style.transform = `translate(${event.clientX}px, ${event.clientY}px)`;
    cursorRing.style.transform = `translate(${event.clientX}px, ${event.clientY}px)`;
  }

  const showcase = document.querySelector(".hero-showcase");
  if (!showcase || window.innerWidth < 900) return;
  const x = (event.clientX / window.innerWidth - 0.5) * 16;
  const y = (event.clientY / window.innerHeight - 0.5) * 16;
  showcase.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(-5deg)`;
});

document.addEventListener("keydown", (event) => {
  if (quickView && event.key === "Escape") {
    quickView.classList.remove("active");
    quickView.setAttribute("aria-hidden", "true");
  }
});

updateProgress();
observeReveal();
wireProductInteractions();
loadProducts().catch(() => {
  wireProductInteractions();
});
loadReviews().catch(() => {});
loadBlogs().catch(() => {});
