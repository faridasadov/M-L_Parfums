CREATE DATABASE IF NOT EXISTS ml_parfums
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE ml_parfums;

CREATE TABLE IF NOT EXISTS products (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(160) NOT NULL,
  category ENUM('catalog', 'products') NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  old_price DECIMAL(10, 2) NOT NULL,
  currency CHAR(3) NOT NULL DEFAULT 'AZN',
  image VARCHAR(255) NOT NULL,
  rating DECIMAL(2, 1) NOT NULL DEFAULT 5.0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_products_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS reviews (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(160) NOT NULL,
  image VARCHAR(255) NOT NULL,
  rating DECIMAL(2, 1) NOT NULL DEFAULT 5.0,
  text TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS blogs (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  title VARCHAR(220) NOT NULL,
  image VARCHAR(255) NOT NULL,
  published_on DATE NOT NULL,
  excerpt TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS messages (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(160) NOT NULL,
  phone VARCHAR(60) NOT NULL,
  message TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_messages_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO products (id, name, category, price, old_price, currency, image, rating) VALUES
  (1, 'Burberry Black', 'catalog', 75.99, 99.99, 'AZN', '/img/product/1.jpg', 4.5),
  (2, 'Amber Wood', 'catalog', 68.50, 89.99, 'AZN', '/img/product/2.jpg', 4.5),
  (3, 'Noir Essence', 'catalog', 82.00, 110.00, 'AZN', '/img/product/3.jpg', 5.0),
  (4, 'Velvet Rose', 'catalog', 59.99, 79.99, 'AZN', '/img/product/4.jpg', 4.0),
  (5, 'Citrus Musk', 'catalog', 64.00, 84.00, 'AZN', '/img/product/5.jpg', 4.5),
  (6, 'Royal Oud', 'catalog', 95.00, 129.00, 'AZN', '/img/product/6.jpg', 5.0),
  (7, 'Golden Bloom', 'products', 72.00, 96.00, 'AZN', '/img/product/7.jpg', 4.5),
  (8, 'Midnight Pour Femme', 'products', 88.00, 115.00, 'AZN', '/img/product/8.jpg', 5.0),
  (9, 'Fresh Signature', 'products', 61.00, 79.00, 'AZN', '/img/product/9.jpg', 4.5)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  category = VALUES(category),
  price = VALUES(price),
  old_price = VALUES(old_price),
  currency = VALUES(currency),
  image = VALUES(image),
  rating = VALUES(rating);

INSERT INTO reviews (id, name, image, rating, text) VALUES
  (1, 'Jhon Dacker', '/img/male_user.png', 4.5, 'Fast delivery and a clean, lasting fragrance. The package arrived in perfect condition.'),
  (2, 'Helena Jackson', '/img/female_user.png', 5.0, 'The scent recommendation was accurate and the perfume stayed fresh through the day.'),
  (3, 'Mickel Krew', '/img/male_user.png', 4.5, 'Good prices, original products and quick support from the store team.')
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  image = VALUES(image),
  rating = VALUES(rating),
  text = VALUES(text);

INSERT INTO blogs (id, title, image, published_on, excerpt) VALUES
  (1, 'Refreshing and long-lasting perfumes', '/img/product/10.jpg', '2026-01-07', 'How to choose a daily fragrance that stays balanced from morning to evening.'),
  (2, 'How to store premium fragrances', '/img/product/9.jpg', '2026-02-18', 'Simple storage habits that protect perfume notes, color and projection.'),
  (3, 'Choosing scents for every season', '/img/product/8.jpg', '2026-03-12', 'A practical guide to matching fresh, woody and floral notes with the weather.')
ON DUPLICATE KEY UPDATE
  title = VALUES(title),
  image = VALUES(image),
  published_on = VALUES(published_on),
  excerpt = VALUES(excerpt);
