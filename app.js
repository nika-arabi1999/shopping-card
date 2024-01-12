import { productsData } from "./products.js";
//select Elements:
const allProducts = document.querySelector(".all-products");
const shoppingCartBtn = document.querySelector(".cart-btn");
const modal = document.querySelector(".modal-section");
const backdrop = document.querySelector(".backdrop");
let totalItems = document.querySelector(".cart-items");
let totalPrice = document.querySelector(".total-price");
let cartModalItems = document.querySelector(".cart-modal-items");
const cartContent = document.querySelector(".cart-modal-items");
const clearCartBtn = document.querySelector(".clear-cart-btn");
const confirmBtn = document.querySelector(".confirm-cart-btn");

//initialize global variables: cart and buttons
let cart = [];
let domButtons = [];
//classes Section
class UI {
  displayProducts(products) {
    let result = "";
    products.forEach(
      (product) =>
        (result += `<div class="product">
            <div class="img-box">
              <img
                class="product-img"
                src="${product.imageUrl}"
                alt="${product.title}"
              />
            </div>
            <div class="product-description">
              <h3 class="product-title">${product.title}</h3>
              <p class="product-price">${product.price}$</p>
            </div>
    
            <button class="btn add-to-cart" data-id="${product.id}" >
              <i class="fa-solid fa-cart-plus"></i>
              <p>Add to cart</p>
            </button>
          </div>`)
    );
    allProducts.innerHTML = result;
  }

  getAddToCartButton() {
    let addToCartBtns = document.querySelectorAll(".add-to-cart");
    addToCartBtns = [...addToCartBtns];
    domButtons = addToCartBtns;
    addToCartBtns.forEach((btn) => {
      const id = btn.dataset.id;
      const isInCart = cart.find((p) => parseInt(p.id) === parseInt(id));
      if (isInCart) {
        btn.innerHTML = `<i class="fa-solid fa-circle-check"></i>
          <p>Added</p>`;
        btn.disabled = true;
      }
      // const checkAddedItem = cart.find(p => p.id === id);
      btn.addEventListener("click", () => {
        btn.innerHTML = `<i class="fa-solid fa-circle-check"></i>
            <p>Added</p>`;
        btn.disabled = true;

        const addedProduct = { ...Storage.getProduct(id), quantity: 1 };

        cart = [...cart, addedProduct];
        Storage.saveCart(cart);

        this.setTotalPrice(cart);
        this.setCartItems(addedProduct);
        // console.log(cart);
      });
    });
  }

  setTotalPrice(cart) {
    let cartItems = 0;
    let cartPrice = cart.reduce((acc, item) => {
      cartItems += item.quantity;
      return acc + item.quantity * item.price;
    }, 0);
    totalItems.innerText = cartItems;
    totalPrice.innerText = `Total price = ${cartPrice.toFixed(2)}$`;
  }

  setCartItems(product) {
    const singleItemDiv = document.createElement("div");
    singleItemDiv.classList.add("cart-modal-single");
    singleItemDiv.innerHTML = `<div class="column first-column">
    <div class="modal-item-img">
      <img src="${product.imageUrl}" alt="product image" />
    </div>
    <div class="modal-item-desc">
      <span class="item-title">${product.title}</span>
      <small>price : ${product.price}$</small>
    </div>
  </div>
  <div class="column second-column">
    <div class="modal-item-quantity">
      <i class="fa-solid fa-caret-up" data-id="${product.id}"></i>
      <span class="quantity">${product.quantity}</span>
      
        <i class="fa-solid fa-caret-down" data-id="${product.id}"></i>
      
    </div>
    <div class="modal-item-delete">
      <i class="fa-regular fa-trash-can delete-item-btn" data-id="${product.id}"></i>
    </div>
  </div>`;
    cartModalItems.appendChild(singleItemDiv);
  }

  cartLogic() {
    confirmBtn.addEventListener("click", () => {
      if (cart.length) {
        location.href = "/payment.html";
        return;
      }

      alert("Please select some products");
    });
    clearCartBtn.addEventListener("click", () => this.clearAllItems());
    cartContent.addEventListener("click", (event) => {
      // cart = Storage.getCart();
      if (event.target.classList.contains("delete-item-btn")) {
        const removebtn = event.target;
        // const removeItem = cart.find(
        //   (item) => parseInt(item.id) === parseInt(removebtn.dataset.id)
        // );
        this.removeSingle(removebtn.dataset.id);
        removebtn.parentNode.parentNode.parentNode.remove();
      }
      if (event.target.classList.contains("fa-caret-up")) {
        //increment quantity:
        const incrementBtn = event.target;
        const increasedItem = cart.find(
          (item) => parseInt(item.id) === parseInt(incrementBtn.dataset.id)
        );
        if (increasedItem.quantity === 5) {
          const message = "you can not buy this product more than 5";
          alert(message);
          return;
        }
        increasedItem.quantity++;
       //update Dom:
        incrementBtn.nextElementSibling.innerText = `${increasedItem.quantity}`;
        Storage.saveCart(cart);
        this.setTotalPrice(cart);

        
      }
      if (event.target.classList.contains("fa-caret-down")) {
        //decrement quantity:
        const decrementBtn = event.target;
        const decreasedItem = cart.find(
          (item) => parseInt(item.id) === parseInt(decrementBtn.dataset.id)
        );
        decreasedItem.quantity--;
        Storage.saveCart(cart);
        this.setTotalPrice(cart);
        decrementBtn.previousElementSibling.innerText = `${decreasedItem.quantity}`;

        if (decreasedItem.quantity === 0) {
          this.removeSingle(decreasedItem.id);
          decrementBtn.parentNode.parentNode.parentNode.remove();
          return;
        }
        
      }
    });
  }

  clearAllItems() {
    cart.forEach((item) => this.removeSingle(item.id));
    cartContent.innerHTML = "";
    modal.classList.add("hidden");
  }

  removeSingle(id) {
    // console.log(id);
    cart = cart.filter((item) => item.id !== id);
    this.setTotalPrice(cart);
    Storage.saveCart(cart);

    //reset the buttons:
    const itemBtn = this.getSingleBtn(id);
    itemBtn.innerHTML = `<i class="fa-solid fa-cart-plus"></i>
    <p>Add to cart</p>`;
    itemBtn.disabled = false;
    // console.log(itemBtn);
  }

  getSingleBtn(id) {
    return domButtons.find((btn) => parseInt(btn.dataset.id) === parseInt(id));
  }

  setupApp() {
    //1.get the cart
    cart = Storage.getCart();
    // 2.set items and price

    cart.forEach((item) => {
      this.setCartItems(item);
    });

    this.setTotalPrice(cart);
  }

  OpenModal() {
    shoppingCartBtn.addEventListener("click", () => {
      modal.classList.remove("hidden");
    });
  }

  CloseModal() {
    backdrop.addEventListener("click", () => {
      modal.classList.add("hidden");
    });
  }
}

class Products {
  getProducts() {
    return productsData;
  }
}

class Storage {
  static saveProducts(products) {
    localStorage.setItem("products", JSON.stringify(products));
  }

  static getProduct(id) {
    const _products = JSON.parse(localStorage.getItem("products"));
    return _products.find((product) => Number(product.id) === Number(id));
  }

  static saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
  }

  static getCart() {
    return localStorage.getItem("cart")
      ? JSON.parse(localStorage.getItem("cart"))
      : [];
  }
}

// const getProducts = new products();

document.addEventListener("DOMContentLoaded", () => {
  const products = new Products();
  const productsData = products.getProducts();
  const ui = new UI();
  Storage.saveProducts(productsData);
  ui.displayProducts(productsData);
  ui.setupApp();
  ui.getAddToCartButton();
  ui.OpenModal();
  ui.cartLogic();
  ui.CloseModal();
});
