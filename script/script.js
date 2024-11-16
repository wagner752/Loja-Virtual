// URL da planilha publicada (substitua pela sua)
const SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vS2VP2o7HF3OPrFIwMYL3tkT673vZ4gQOUhSn9G8-z0apAhm1r0b07hoF9wZW_U51ct5B-I5LaZ9ySE/pub?output=csv";

// Carrinho
let cart = [];
let whatsappNumber = ""; // Variável para armazenar o número do WhatsApp

/*
// Mostrar o modal ao carregar a página
window.onload = () => {
  const modal = new bootstrap.Modal(document.getElementById("whatsappModal"));
  modal.show();
};*/

// Salvar o número de WhatsApp
function saveWhatsAppNumber() {
  whatsappNumber = document.getElementById("whatsappNumber").value.trim();
  if (!whatsappNumber) {
    alert("Por favor, insira um número válido.");
    return;
  }
  const modal = bootstrap.Modal.getInstance(document.getElementById("whatsappModal"));
  modal.hide();
}

// Carregar produtos da planilha
async function loadProducts() {
  const productList = document.getElementById("product-list");
  productList.innerHTML = "";

  try {
    const response = await fetch(SHEET_URL);
    const csvData = await response.text(); // Aqui pegamos o texto CSV

    // Converter CSV para array de objetos
    const products = csvToArray(csvData);

    products.forEach((product) => {
      const productCard = `
        <div class="col-md-4 mb-4">
          <div class="card">
            <img src="${product.image}" class="card-img-top" alt="${product.name}">
            <div class="card-body">
              <h5 class="card-title">${product.name}</h5>
              <p class="card-text">Preço: R$ ${product.price.toFixed(2)}</p>
              <button class="btn btn-primary" onclick="addToCart(${product.id})">Adicionar ao Carrinho</button>
            </div>
          </div>
        </div>
      `;
      productList.insertAdjacentHTML("beforeend", productCard);
    });
  } catch (error) {
    console.error("Erro ao carregar os produtos:", error);
  }
}

// Função para converter CSV para array de objetos
function csvToArray(csv) {
  const rows = csv.split("\n").map(row => row.split(","));
  
  // Remover cabeçalho
  const header = rows.shift();
  
  // Converter para objetos
  return rows.map(row => ({
    id: row[0],
    name: row[1],
    price: parseFloat(row[2]),
    image: row[3]
  }));
}

// Adicionar ao carrinho
function addToCart(productId) {
  const product = products.find((p) => p.id === productId);
  const cartItem = cart.find((item) => item.id === productId);

  if (cartItem) {
    cartItem.quantity++;
  } else {
    cart.push({ ...product, quantity: 1 });
  }

  updateCart();
}

// Remover do carrinho
function removeFromCart(productId) {
  cart = cart.filter((item) => item.id !== productId);
  updateCart();
}

// Atualizar carrinho
function updateCart() {
  const cartItems = document.getElementById("cart-items");
  const checkoutButton = document.getElementById("checkout");
  const totalPrice = document.getElementById("total-price");

  cartItems.innerHTML = "";
  let total = 0;

  cart.forEach((item) => {
    total += item.price * item.quantity;
    const cartItem = `
      <li class="list-group-item d-flex justify-content-between align-items-center">
        ${item.name} (x${item.quantity})
        <div>
          <span>R$ ${(item.price * item.quantity).toFixed(2)}</span>
          <button class="btn btn-danger btn-sm ms-3" onclick="removeFromCart(${item.id})">Remover</button>
        </div>
      </li>
    `;
    cartItems.insertAdjacentHTML("beforeend", cartItem);
  });

  totalPrice.textContent = `Total: R$ ${total.toFixed(2)}`;
  checkoutButton.disabled = cart.length === 0;
}

// Finalizar pedido
function checkout() {
  if (!whatsappNumber) {
    alert("Por favor, configure o número de WhatsApp antes de finalizar o pedido.");
    return;
  }

  let message = "Olá, gostaria de fazer um pedido:%0A";
  cart.forEach((item) => {
    message += `- ${item.name} (x${item.quantity}): R$ ${(item.price * item.quantity).toFixed(2)}%0A`;
  });

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  message += `%0ATotal: R$ ${total.toFixed(2)}`;

  const url = `https://wa.me/${whatsappNumber}?text=${message}`;
  window.open(url, "_blank");
}

// Inicializar
document.getElementById("checkout").addEventListener("click", checkout);
loadProducts();
