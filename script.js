// валюты
const rates = {
    USD: 1,
    RUB: 90,
    EUR: 0.9
};

let currentCurrency = "RUB";


// корзина
let cart = JSON.parse(localStorage.getItem("cart")) || [];

document.addEventListener("DOMContentLoaded", () => {
    updateCartCount();
    updatePrices();
    renderCart();
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
    cart.push({ name, price });

    localStorage.setItem("cart", JSON.stringify(cart));

    updateCartCount();
    renderCart(); 
    updateCheckoutButton();
}

function updateCartCount() {
    document.getElementById("cart-count").textContent = cart.length;
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

    cart.forEach((item, index) => {
        const converted = item.price * rates[currentCurrency];

        const div = document.createElement("div");

        div.innerHTML = 
            ` ${item.name} - ${converted.toFixed(0)} ${currentCurrency}
            <button class="btn-secondary" onclick="removeFromCart(${index})"> Удалить </button>`
            ;

        container.appendChild(div);
        total += converted;
    });

    totalEl.textContent = "Итого:" + total.toFixed(0) + " " + currentCurrency;
}

function removeFromCart(index) {
    cart.splice(index, 1);

    localStorage.setItem("cart", JSON.stringify(cart));

    updateCartCount();
    renderCart();
    updateCheckoutButton();
}

function updateUI() {
    updatePrices();
    renderCart();
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
    showPage("checkout");

    let total = 0;

    cart.forEach(item => {
        total += item.price * rates[currentCurrency];
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
    const date = document.getElementById("date");
    const phone = document.getElementById("phone");
    const city = document.getElementById("city");

    const emailVal = email.value.trim();
    const surnameVal = surname.value.trim();
    const nameVal = name.value.trim();
    const dateVal = date.value.trim();
    const phoneVal = phone.value.trim();
    const cityVal = city.value.trim();

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phonePattern = /^\+7 \(\d{3}\) \d{3} \d{2}-\d{2}$/;
    const cityPattern = /^[a-zA-Zа-яА-ЯёЁ\s\-]{2,}$/;

    let valid = true;

    // очистка классов
    [email, surname, name, date, phone, city].forEach(input => {
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
    check(date, dateVal !== "");
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

    function updateModalPrice() {
        const converted = price * rates[currentCurrency];
        document.getElementById("modal-price").textContent =
            converted.toFixed(0) + " " + currentCurrency;
    }

    updateModalPrice();

    document.getElementById("modal-add").onclick = () => {
        addToCart(name, price);
    };

    // сохраняем функцию глобально, чтобы можно было обновлять при смене валюты
    window.updateModalPrice = updateModalPrice;
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
}

function updateCheckoutButton() {
    const btn = document.querySelector("#cart .btn-primary");

    if (!btn) return;

    if (cart.length === 0) {
        btn.disabled = true;
        btn.style.opacity = "0.5";
        btn.style.cursor = "not-allowed";
    } else {
        btn.disabled = false;
        btn.style.opacity = "1";
        btn.style.cursor = "pointer";
    }
}
