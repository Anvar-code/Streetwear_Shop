// валюты
const rates = {
    USD: 1,
    RUB: 92,
    EUR: 0.9
};

let currentCurrency = "RUB";


// корзина
let cart = JSON.parse(localStorage.getItem("cart")) || [];

document.addEventListener("DOMContentLoaded", () => {
    updateCartCount();
    updatePrices();
    renderCart();
    updateButtons();
    updateCheckoutButton();
});

// переключение страниц
function showPage(page) {
    document.querySelectorAll('.page').forEach(p => {
        p.style.display = 'none';
    });

    document.getElementById(page).style.display = 'block';

    if (page === "cart") {
        renderCart();
    }

    updateCheckoutButton();
}

// корзина, добав
function addToCart(name, price) {

    const existing = cart.find(item => item.name === name);

    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({
            name,
            price,
            quantity: 1
        });
    }

    localStorage.setItem("cart", JSON.stringify(cart));

    updateCartCount();
    renderCart();
    updateButtons();
    updateCheckoutButton();
}

function updateCartCount() {

    let total = 0;

    cart.forEach(item => {
        total += item.quantity;
    });

    document.getElementById("cart-count").textContent = total;
}

// обновление цен в кат
function updatePrices() {
    document.querySelectorAll(".price").forEach(el => {
        const base = el.getAttribute("data-price");

        const value = (base * rates[currentCurrency]).toFixed(0);

        el.textContent = value + " " + currentCurrency;
    });
}

// отображение корзины, удаление
function renderCart() {

    const container = document.getElementById("cart-items");
    const totalEl = document.getElementById("total");

    container.innerHTML = "";

    let total = 0;

    cart.forEach(item => {

        const converted = item.price * rates[currentCurrency];

        const itemTotal = converted * item.quantity;

        const div = document.createElement("div");

        div.className = "cart-item";

        div.innerHTML = `
            <div>
                ${item.name}
            </div>

            <div class="quantity-controls">
                <button onclick="decreaseQuantity('${item.name}')">−</button>

                <span>${item.quantity}</span>

                <button onclick="increaseQuantity('${item.name}')">+</button>
            </div>

            <div>
                ${itemTotal.toFixed(0)} ${currentCurrency}
            </div>
        `;

        container.appendChild(div);

        total += itemTotal;
    });

    totalEl.textContent =
        "Итого: " + total.toFixed(0) + " " + currentCurrency;
}

function removeFromCart(index) {
    cart.splice(index, 1);

    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartCount();
    renderCart();
    updateCheckoutButton();
    updateButtons();
}

function updateUI() {
    updatePrices();
    renderCart();
    updateButtons();
}

// переключение валют
document.getElementById("currency").addEventListener("change", (e) => {
    currentCurrency = e.target.value;

    updateUI();

    if (window.updateModalPrice) {
    window.updateModalPrice();
}
});

// открыть оформле
function openCheckout() {
    if (cart.length === 0) {
        alert("Корзина пуста");
        showPage("cart"); // возвращаем назад
        return;
    }

    showPage("checkout");

    let total = 0;

    cart.forEach(item => {
        total += item.price * item.quantity * rates[currentCurrency];
    });

    document.getElementById("checkout-total").textContent =
        "Итого: " + total.toFixed(0) + " " + currentCurrency;
}

// назад в корз
function backToCart() {
    showPage("cart");
    renderCart();
}

const textarea = document.querySelector("textarea");
const counter = document.querySelector(".counter");

if (textarea) {
    textarea.addEventListener("input", () => {
        counter.textContent = textarea.value.length + "/300";
    });
}

// купить закз
function confirmOrder() {
    const email = document.getElementById("email");
    const surname = document.getElementById("surname");
    const name = document.getElementById("name");
    const phone = document.getElementById("phone");
    const city = document.getElementById("city");

    const emailVal = email.value.trim();
    const surnameVal = surname.value.trim();
    const nameVal = name.value.trim();
    const phoneVal = phone.value.trim();
    const cityVal = city.value.trim();

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phonePattern = /^\+7 \(\d{3}\) \d{3} \d{2}-\d{2}$/;
    const cityPattern = /^[a-zA-Zа-яА-ЯёЁ\s\-]{2,}$/;

    let valid = true;

    // очистка классов
    [email, surname, name, phone, city].forEach(input => {
        input.classList.remove("input-error", "input-success");
    });

    function check(input, condition) {
        if (!condition) {
            input.classList.add("input-error");
            valid = false;
        } else {
            input.classList.add("input-success");
        }
    }

    check(email, emailPattern.test(emailVal));
    check(surname, surnameVal.length > 1);
    check(name, nameVal.length > 1);
    check(phone, phonePattern.test(phoneVal));
    check(city, cityPattern.test(cityVal));

    if (!valid) {
        alert("Проверьте правильность заполнения");
        return;
    }

    alert("Заказ оформлен!");

    cart = [];
    localStorage.removeItem("cart");

    document.querySelectorAll("#checkout input, #checkout textarea").forEach(input => {
    input.value = "";
    input.classList.remove("input-error", "input-success");
});

    updateCartCount();
    renderCart();
    updateButtons();
    showPage("home");
}

const phoneInput = document.getElementById("phone");

if (phoneInput) {
    phoneInput.addEventListener("input", formatPhone);
}

function formatPhone(e) {
    let digits = e.target.value.replace(/\D/g, "");

    // убираем первую 8 или 7
    if (digits.startsWith("8")) digits = digits.slice(1);
    if (digits.startsWith("7")) digits = digits.slice(1);

    // максимум 10 цифр
    digits = digits.substring(0, 10);

    let result = "+7";

    if (digits.length > 0) result += " (" + digits.substring(0, 3);
    if (digits.length >= 3) result += ") " + digits.substring(3, 6);
    if (digits.length >= 6) result += " " + digits.substring(6, 8);
    if (digits.length >= 8) result += "-" + digits.substring(8, 10);

    e.target.value = result;
}

function filterCategory(category) {
    const products = document.querySelectorAll(".product-card");

    products.forEach(product => {
        const productCategory = product.getAttribute("data-category");

        if (category === "all" || productCategory === category) {
            product.style.display = "";
        } else {
            product.style.display = "none";
        }
    });
}


let images = [];
let currentIndex = 0;

function openProduct(name, price, img1, img2) {
    document.getElementById("productModal").style.display = "flex";

    document.getElementById("modal-title").textContent = name;

    images = [img1, img2].filter(Boolean);
    currentIndex = 0;

    updateImage();
    updateModalPrice(price);

    const modalBtn = document.getElementById("modal-add");
    const item = cart.find(i => i.name === name);

    if (item) {
        modalBtn.innerHTML = `
        <div class="quantity-controls">
            <button onclick="event.stopPropagation(); decreaseQuantity('${name}')">−</button>

            <span>${item.quantity}</span>

            <button onclick="event.stopPropagation(); increaseQuantity('${name}')">+</button>
        </div>`;
    
    } else {
        
        modalBtn.innerHTML = `В корзину`;
        
        modalBtn.onclick = () => {
            addToCart(name, price);

        openProduct(name, price, img1, img2);
    };
}
    // сохраняем функцию глобально, чтобы можно было обновлять при смене валюты
    window.updateModalPrice = updateModalPrice;
}

function updateModalPrice(price) {
    const converted = price * rates[currentCurrency];
    document.getElementById("modal-price").textContent =
        converted.toFixed(0) + " " + currentCurrency;
}

function updateImage() {
    document.getElementById("mainImage").src = images[currentIndex];
}

function nextImage() {
    currentIndex = (currentIndex + 1) % images.length;
    updateImage();
}

function prevImage() {
    currentIndex = (currentIndex - 1 + images.length) % images.length;
    updateImage();
}

function closeProduct() {
    document.getElementById("productModal").style.display = "none";
}

function searchProducts() {
    const value = document.getElementById("search").value.toLowerCase();
    const products = document.querySelectorAll(".product-card");

    products.forEach(product => {
        const title = product.querySelector("h3").textContent.toLowerCase();

        if (title.includes(value)) {
            product.style.display = "";
        } else {
            product.style.display = "none";
        }
    });
}

// очистить корзину
function clearCart() {
    cart = [];
    localStorage.removeItem("cart");

    updateCartCount();
    renderCart();
    updateCheckoutButton();
    updateButtons();
}

function updateCheckoutButton() {
    const btn = document.querySelector("#cart .btn-primary");

    if (!btn) return;

    const isEmpty = cart.length === 0;

    btn.disabled = isEmpty;

    btn.style.opacity = isEmpty ? "0.5" : "1";
    btn.style.cursor = isEmpty ? "not-allowed" : "pointer";

    // отключаем клик
    if (isEmpty) {
        btn.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            alert("Корзина пуста");
        };
    } else {
        btn.onclick = () => openCheckout();
    }
}

function increaseQuantity(name) {
    const item = cart.find(i => i.name === name);

    if (item) {
        item.quantity++;
    }

    localStorage.setItem("cart", JSON.stringify(cart));

    updateCartCount();
    renderCart();
    updateButtons();

    if (document.getElementById("productModal").style.display === "flex") {
        const title = document.getElementById("modal-title").textContent;

        const current = cart.find(i => i.name === title);

        const modalBtn = document.getElementById("modal-add");

        if (current) {
            modalBtn.innerHTML = `
                <div class="quantity-controls">
                    <button onclick="event.stopPropagation(); decreaseQuantity('${title}')">−</button>
                    <span>${current.quantity}</span>
                    <button onclick="event.stopPropagation(); increaseQuantity('${title}')">+</button>
                </div>
            `;
        } else {
            modalBtn.innerHTML = `В корзину`;
        }
    }
}

function decreaseQuantity(name) {
    const item = cart.find(i => i.name === name);

    if (!item) return;

    item.quantity--;

    if (item.quantity <= 0) {
        cart = cart.filter(i => i.name !== name);
    }

    localStorage.setItem("cart", JSON.stringify(cart));

    updateCartCount();
    renderCart();
    updateButtons();
    updateCheckoutButton();

        if (document.getElementById("productModal").style.display === "flex") {
        const title = document.getElementById("modal-title").textContent;

        const current = cart.find(i => i.name === title);

        const modalBtn = document.getElementById("modal-add");

        if (current) {
            modalBtn.innerHTML = `
                <div class="quantity-controls">
                    <button onclick="event.stopPropagation(); decreaseQuantity('${title}')">−</button>
                    <span>${current.quantity}</span>
                    <button onclick="event.stopPropagation(); increaseQuantity('${title}')">+</button>
                </div>
            `;
        } else {
            modalBtn.innerHTML = `В корзину`;
        }
    }
}

function updateButtons() {

    document.querySelectorAll(".product-card").forEach(card => {

        const title = card.querySelector("h3").textContent;

        const btn = card.querySelector("button");

        const item = cart.find(i => i.name === title);

        if (item) {

            btn.classList.remove("btn-primary");

            btn.innerHTML = `
                <div class="quantity-controls">
                    <button onclick="event.stopPropagation(); decreaseQuantity('${title}')">−</button>
                    <span>${item.quantity}</span>
                    <button onclick="event.stopPropagation(); increaseQuantity('${title}')">+</button>
                </div>
            `;

        } else {

            btn.classList.add("btn-primary");

            const price = Number(
                card.querySelector(".price").getAttribute("data-price")
            );

            btn.innerHTML = `В корзину`;

            btn.onclick = (e) => {
                e.stopPropagation();
                addToCart(title, price);
            };
        }
    });
}

// открыть checkout после возврата
window.addEventListener("DOMContentLoaded", () => {

    const openCheckout =
        localStorage.getItem("openCheckout");

    if (openCheckout === "true") {

        showPage("checkout");

        localStorage.removeItem("openCheckout");
    }
});

function goBackCheckout() {
    localStorage.setItem("openCheckout", "true");
    window.location.href = "index.html";
}
