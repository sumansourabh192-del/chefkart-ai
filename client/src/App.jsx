import { useState } from "react";
import axios from "axios";
import "./index.css";
import "./food-details.css";
import "./cart.css";
import "./checkout.css";
import "./auth.css";
import "./order-history.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const categories = [
  { name: "All", icon: "🍽️" },
  { name: "Pizza", icon: "🍕" },
  { name: "Burgers", icon: "🍔" },
  { name: "Indian", icon: "🍛" },
  { name: "Healthy", icon: "🥗" },
  { name: "Desserts", icon: "🍰" },
];

const foods = [
  {
    id: 1,
    name: "Margherita Pizza",
    category: "Pizza",
    price: 249,
    rating: "4.8",
    time: "25 min",
    image: "🍕",
    color: "#fff0df",
    description: "Classic pizza topped with fresh tomatoes, mozzarella cheese and herbs.",
    calories: 285,
    protein: 12,
  },
  {
    id: 2,
    name: "Classic Burger",
    category: "Burgers",
    price: 179,
    rating: "4.7",
    time: "20 min",
    image: "🍔",
    color: "#fce8d7",
    description: "A delicious burger with a vegetable patty and fresh toppings.",
    calories: 350,
    protein: 15,
  },
  {
    id: 3,
    name: "Healthy Salad Bowl",
    category: "Healthy",
    price: 199,
    rating: "4.9",
    time: "15 min",
    image: "🥗",
    color: "#e4f3df",
    description: "A refreshing bowl of fresh vegetables and nutritious greens.",
    calories: 180,
    protein: 6,
  },
  {
    id: 4,
    name: "Paneer Biryani",
    category: "Indian",
    price: 229,
    rating: "4.8",
    time: "30 min",
    image: "🍛",
    color: "#fff0d6",
    description: "Aromatic basmati rice cooked with paneer and Indian spices.",
    calories: 420,
    protein: 18,
  },
  {
    id: 5,
    name: "Chocolate Cake",
    category: "Desserts",
    price: 149,
    rating: "4.6",
    time: "20 min",
    image: "🍰",
    color: "#f7e6e0",
    description: "A rich and delicious chocolate dessert.",
    calories: 320,
    protein: 5,
  },
];

function App() {
  const [token, setToken] = useState(
    () => localStorage.getItem("chefkart_token") || ""
  );
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("chefkart_user")) || null;
    } catch {
      return null;
    }
  });
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [authName, setAuthName] = useState("");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderError, setOrderError] = useState("");
  const [savedOrder, setSavedOrder] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [selectedFood, setSelectedFood] = useState(null);
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [orders, setOrders] = useState([]);
  const [isOrdersOpen, setIsOrdersOpen] = useState(false);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [ordersError, setOrdersError] = useState("");
  const [adminOrders, setAdminOrders] = useState([]);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isLoadingAdminOrders, setIsLoadingAdminOrders] = useState(false);
  const [adminOrdersError, setAdminOrdersError] = useState("");

  const filteredFoods = foods.filter((food) => {
    const matchesCategory =
      selectedCategory === "All" ||
      food.category === selectedCategory;

    const matchesSearch = food.name
      .toLowerCase()
      .includes(search.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const fetchOrders = async () => {
    if (!token) return;

    setIsLoadingOrders(true);
    setOrdersError("");

    try {
      const response = await axios.get(
        `${API_URL}/orders`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        setOrders(response.data.orders);
      }
    } catch (error) {
      setOrdersError(
        error.response?.data?.message || "Unable to load your orders."
      );
    } finally {
      setIsLoadingOrders(false);
    }
  };

  const fetchAdminOrders = async () => {
    if (!token || currentUser?.role !== "admin") return;

    setIsLoadingAdminOrders(true);
    setAdminOrdersError("");

    try {
      const response = await axios.get(
        `${API_URL}/orders/admin/all`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        setAdminOrders(response.data.orders);
      }
    } catch (error) {
      setAdminOrdersError(
        error.response?.data?.message || "Unable to load all orders."
      );
    } finally {
      setIsLoadingAdminOrders(false);
    }
  };

  const updateAdminOrderStatus = async (orderId, status) => {
    try {
      const response = await axios.patch(
        `${API_URL}/orders/${orderId}/status`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        setAdminOrders((previous) =>
          previous.map((order) =>
            order._id === orderId
              ? { ...order, orderStatus: response.data.order.orderStatus }
              : order
          )
        );
      }
    } catch (error) {
      setAdminOrdersError(
        error.response?.data?.message || "Unable to update order status."
      );
    }
  };

  const openAdminDashboard = async () => {
    if (currentUser?.role !== "admin") return;

    setIsAdminOpen(true);
    await fetchAdminOrders();
  };

  const openOrderHistory = async () => {
    if (!token) {
      setAuthMode("login");
      setIsAuthOpen(true);
      return;
    }

    setIsOrdersOpen(true);
    await fetchOrders();
  };

  const handleAuthSubmit = async (event) => {
    event.preventDefault();
    setAuthError("");
    setIsAuthLoading(true);

    try {
      const endpoint = authMode === "register" ? "register" : "login";

      const payload = authMode === "register"
        ? { name: authName, email: authEmail, password: authPassword }
        : { email: authEmail, password: authPassword };

      const response = await axios.post(
        `${API_URL}/auth/${endpoint}`,
        payload
      );

      if (response.data.success) {
        localStorage.setItem("chefkart_token", response.data.token);
        localStorage.setItem("chefkart_user", JSON.stringify(response.data.user));

        setToken(response.data.token);
        setCurrentUser(response.data.user);
        setIsAuthOpen(false);
        setAuthName("");
        setAuthEmail("");
        setAuthPassword("");
        setAuthError("");
      }
    } catch (error) {
      setAuthError(
        error.response?.data?.message || "Authentication failed. Please try again."
      );
    } finally {
      setIsAuthLoading(false);
    }
  };

  const toggleFavorite = (id) => {
    setFavorites((previous) =>
      previous.includes(id)
        ? previous.filter((item) => item !== id)
        : [...previous, id]
    );
  };

  const addToCart = (food, quantity = 1) => {
    setCartItems((previous) => {
      const existingItem = previous.find((item) => item.id === food.id);

      if (existingItem) {
        return previous.map((item) =>
          item.id === food.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }

      return [...previous, { ...food, quantity }];
    });
  };

  const updateCartQuantity = (foodId, change) => {
    setCartItems((previous) =>
      previous
        .map((item) =>
          item.id === foodId
            ? { ...item, quantity: item.quantity + change }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (foodId) => {
    setCartItems((previous) =>
      previous.filter((item) => item.id !== foodId)
    );
  };

  const cartCount = cartItems.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const cartSubtotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  return (
    <div className="app">
      <header className="navbar">
        <a className="logo" href="#home">
          <span className="logo-icon">🍃</span>
          ChefKart<span>AI</span>
        </a>

        <nav className="nav-links">
          <a href="#home">Home</a>
          <a href="#menu">Explore Food</a>
          <a href="#nutrition">AI Nutrition</a>
          <button className="nav-order-btn" onClick={openOrderHistory}>
            My Orders
          </button>
          {currentUser?.role === "admin" && (
            <button className="nav-order-btn" onClick={openAdminDashboard}>
              Admin Dashboard
            </button>
          )}
        </nav>

        <div className="nav-actions">
          {currentUser ? (
  <div className="auth-user">
    <span>Hi, {currentUser.name}</span>
    <button
      className="login-btn"
      onClick={() => {
        localStorage.removeItem("chefkart_token");
        localStorage.removeItem("chefkart_user");
        setToken("");
        setCurrentUser(null);
      }}
    >
      Logout
    </button>
  </div>
) : (
  <button
    className="login-btn"
    onClick={() => {
      setAuthMode("login");
      setAuthError("");
      setIsAuthOpen(true);
    }}
  >
    Login
  </button>
)}
          <button className="cart-btn" onClick={() => setIsCartOpen(!isCartOpen)}>
            🛒 Cart <span>{cartCount}</span>
          </button>
        </div>
      </header>

      {isAuthOpen && (
        <div className="auth-overlay">
          <div className="auth-panel">
            <button
              className="auth-close"
              onClick={() => setIsAuthOpen(false)}
              type="button"
            >
              ×
            </button>

            <h2>
              {authMode === "login" ? "Welcome Back!" : "Create Account"}
            </h2>

            <p>
              {authMode === "login"
                ? "Login to continue ordering."
                : "Join ChefKart AI today."}
            </p>

            <form onSubmit={handleAuthSubmit}>
              {authMode === "register" && (
                <input
                  type="text"
                  placeholder="Your full name"
                  value={authName}
                  onChange={(event) => setAuthName(event.target.value)}
                  required
                  minLength={2}
                />
              )}

              <input
                type="email"
                placeholder="Email address"
                value={authEmail}
                onChange={(event) => setAuthEmail(event.target.value)}
                required
              />

              <input
                type="password"
                placeholder="Password (minimum 8 characters)"
                value={authPassword}
                onChange={(event) => setAuthPassword(event.target.value)}
                required
                minLength={8}
              />

              {authError && (
                <p className="auth-error">{authError}</p>
              )}

              <button type="submit" disabled={isAuthLoading}>
                {isAuthLoading
                  ? "Please wait..."
                  : authMode === "login"
                    ? "Login"
                    : "Create Account"}
              </button>
            </form>

            <p className="auth-switch">
              {authMode === "login"
                ? "Don't have an account?"
                : "Already have an account?"}

              <button
                type="button"
                onClick={() => {
                  setAuthMode(authMode === "login" ? "register" : "login");
                  setAuthError("");
                }}
              >
                {authMode === "login" ? " Register" : " Login"}
              </button>
            </p>
          </div>
        </div>
      )}

      <main>
        <section className="hero" id="home">
          <div className="hero-content">
            <span className="eyebrow">
              FRESH FOOD • SMARTER CHOICES
            </span>

            <h1>
              Delicious food,
              <br />
              <span>healthier living.</span>
            </h1>

            <p>
              Discover delicious meals, order your favourites
              and make smarter food choices with AI-powered nutrition.
            </p>

            <div className="search-box">
              <span>🔍</span>
              <input
                type="text"
                placeholder="Search your favourite food..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
              <button
                onClick={() =>
                  document.getElementById("menu").scrollIntoView({
                    behavior: "smooth",
                  })
                }
              >
                Search
              </button>
            </div>

            <div className="hero-stats">
              <div><strong>Fresh</strong><small>Every day</small></div>
              <div><strong>Smart</strong><small>AI nutrition</small></div>
              <div><strong>Fast</strong><small>Food delivery</small></div>
            </div>
          </div>

          <div className="hero-image">
            <div className="food-circle">🥗</div>
            <div className="floating-card">
              <span>💚</span>
              <div>
                <strong>Eat Better</strong>
                <small>Live healthier</small>
              </div>
            </div>
          </div>
        </section>

        <section className="menu-section" id="menu">
          <div className="section-heading">
            <div>
              <span className="eyebrow">EXPLORE OUR MENU</span>
              <h2>What are you craving?</h2>
            </div>
            <a href="#menu">Explore food →</a>
          </div>

          <div className="categories">
            {categories.map((category) => (
              <button
                key={category.name}
                onClick={() => setSelectedCategory(category.name)}
                className={`category ${
                  selectedCategory === category.name ? "active" : ""
                }`}
              >
                <span>{category.icon}</span>
                {category.name}
              </button>
            ))}
          </div>

          <div className="food-grid">
            {filteredFoods.length > 0 ? (
              filteredFoods.map((food) => (
                <article className="food-card" key={food.id}>
                  <div
                    className="food-image"
                    style={{ backgroundColor: food.color }}
                  >
                    <span>{food.image}</span>
                    <button
                      className="favorite"
                      onClick={() => toggleFavorite(food.id)}
                    >
                      {favorites.includes(food.id) ? "❤️" : "♡"}
                    </button>
                  </div>

                  <div className="food-info">
                    <div className="food-category">{food.category}</div>
                    <h3>{food.name}</h3>

                    <div className="food-meta">
                      <span>⭐ {food.rating}</span>
                      <span>🕒 {food.time}</span>
                    </div>

                    <div className="food-bottom">
                      <strong>₹{food.price}</strong>
                      <div className="food-actions">
                        <button
                          className="details-btn"
                          onClick={() => {
                            setSelectedFood(food);
                            setSelectedQuantity(1);
                          }}
                        >
                          Details
                        </button>
                        <button onClick={() => addToCart(food, 1)}>
                          Add +
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <p>No food items found. Try another search.</p>
            )}
          </div>
        </section>

        {selectedFood && (
          <div
            className="details-overlay"
            onClick={() => setSelectedFood(null)}
          >
            <div
              className="details-modal"
              onClick={(event) => event.stopPropagation()}
            >
              <button
                className="close-btn"
                onClick={() => setSelectedFood(null)}
              >
                ×
              </button>

              <div
                className="details-image"
                style={{ backgroundColor: selectedFood.color }}
              >
                {selectedFood.image}
              </div>

              <span className="food-category">
                {selectedFood.category}
              </span>

              <h2>{selectedFood.name}</h2>
              <p>{selectedFood.description}</p>

              <div className="details-nutrition">
                <div>
                  <strong>{selectedFood.calories}</strong>
                  <small>Calories (kcal)</small>
                </div>
                <div>
                  <strong>{selectedFood.protein}g</strong>
                  <small>Protein</small>
                </div>
              </div>

              <div className="details-price">
                <strong>₹{selectedFood.price}</strong>

                <div className="quantity-control">
                  <button
                    onClick={() =>
                      setSelectedQuantity((q) => Math.max(1, q - 1))
                    }
                  >
                    −
                  </button>

                  <span>{selectedQuantity}</span>

                  <button
                    onClick={() => setSelectedQuantity((q) => q + 1)}
                  >
                    +
                  </button>
                </div>
              </div>

              <button
                className="modal-add-btn"
                onClick={() => {
                  addToCart(selectedFood, selectedQuantity);
                  setSelectedFood(null);
                }}
              >
                Add to Cart — ₹{selectedFood.price * selectedQuantity}
              </button>
            </div>
          </div>
        )}

        <section className="nutrition-section" id="nutrition">
          <div>
            <span className="eyebrow">
              MEET YOUR AI FOOD ASSISTANT
            </span>
            <h2>Know what you eat.</h2>
            <p>
              Discover calories, protein, carbohydrates and fats
              with our AI-powered nutrition assistant.
            </p>
            <button className="nutrition-btn">
              Explore AI Nutrition →
            </button>
          </div>
          <div className="nutrition-icon">🧠🥑</div>
        </section>
      </main>

      {isOrdersOpen && (
        <div
          className="orders-overlay"
          onClick={() => setIsOrdersOpen(false)}
        >
          <div
            className="orders-panel"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="orders-header">
              <div>
                <h2>My Orders</h2>
                <p>Track your food orders</p>
              </div>
              <button
                className="orders-close"
                onClick={() => setIsOrdersOpen(false)}
              >
                ×
              </button>
            </div>

            {isLoadingOrders ? (
              <p className="orders-message">Loading your orders...</p>
            ) : ordersError ? (
              <p className="orders-error">{ordersError}</p>
            ) : orders.length === 0 ? (
              <div className="orders-empty">
                <h3>No orders yet</h3>
                <p>Your placed orders will appear here.</p>
              </div>
            ) : (
              <div className="orders-list">
                {orders.map((order) => {
                  const trackingSteps = [
                    "Pending",
                    "Confirmed",
                    "Preparing",
                    "Out for Delivery",
                    "Delivered"
                  ];
                  const currentStep = trackingSteps.indexOf(order.orderStatus);

                  return (
                    <article className="order-card" key={order._id}>
                      <div className="order-card-top">
                        <div>
                          <h3>Order #{order._id.slice(-8)}</h3>
                          <p>
                            {new Date(order.createdAt).toLocaleString("en-IN")}
                          </p>
                        </div>
                        <span className="order-status">
                          {order.orderStatus}
                        </span>
                      </div>

                      <div className="order-items">
                        {order.items.map((item) => (
                          <div className="order-item" key={item._id}>
                            <span>{item.name} × {item.quantity}</span>
                            <strong>₹{item.price * item.quantity}</strong>
                          </div>
                        ))}
                      </div>

                      <div className="order-total">
                        <span>Payment: Cash on Delivery</span>
                        <strong>Total: ₹{order.totalAmount}</strong>
                      </div>

                      {order.orderStatus === "Cancelled" ? (
                        <p className="orders-error">This order was cancelled.</p>
                      ) : (
                        <div className="tracking-section">
                          <h4>Order Tracking</h4>
                          <div className="tracking-steps">
                            {trackingSteps.map((step, index) => (
                              <div
                                className={`tracking-step ${
                                  currentStep >= index ? "completed" : ""
                                }`}
                                key={step}
                              >
                                <span className="tracking-dot">
                                  {currentStep >= index ? "✓" : index + 1}
                                </span>
                                <small>{step}</small>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {isCartOpen && (
        <div
          className="cart-overlay"
          onClick={() => setIsCartOpen(false)}
        >
          <div
            className="cart-panel"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="cart-header">
              <div>
                <span className="eyebrow">YOUR ORDER</span>
                <h2>Shopping Cart ({cartCount})</h2>
              </div>
              <button
                className="cart-close"
                onClick={() => setIsCartOpen(false)}
              >
                ×
              </button>
            </div>

            {cartItems.length === 0 ? (
              <div className="empty-cart">
                <div>🛒</div>
                <h3>Your cart is empty</h3>
                <p>Add some delicious food to get started.</p>
                <button onClick={() => setIsCartOpen(false)}>
                  Explore Menu
                </button>
              </div>
            ) : (
              <>
                <div className="cart-items">
                  {cartItems.map((item) => (
                    <div className="cart-item" key={item.id}>
                      <div
                        className="cart-item-image"
                        style={{ backgroundColor: item.color }}
                      >
                        {item.image}
                      </div>

                      <div className="cart-item-info">
                        <h3>{item.name}</h3>
                        <p>₹{item.price} each</p>

                        <div className="cart-quantity">
                          <button
                            onClick={() => updateCartQuantity(item.id, -1)}
                          >
                            −
                          </button>
                          <span>{item.quantity}</span>
                          <button
                            onClick={() => updateCartQuantity(item.id, 1)}
                          >
                            +
                          </button>
                        </div>
                      </div>

                      <div className="cart-item-right">
                        <strong>₹{item.price * item.quantity}</strong>
                        <button
                          className="remove-item"
                          onClick={() => removeFromCart(item.id)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="cart-summary">
                  <div>
                    <span>Subtotal</span>
                    <strong>₹{cartSubtotal}</strong>
                  </div>
                  <div>
                    <span>Delivery fee</span>
                    <strong>₹30</strong>
                  </div>
                  <div className="cart-total">
                    <span>Total</span>
                    <strong>₹{cartSubtotal + 30}</strong>
                  </div>
                  <button
                    className="checkout-btn"
                    onClick={() => {
  setIsCartOpen(false);

  if (!token) {
    setAuthMode("login");
    setIsAuthOpen(true);
    return;
  }

  setIsCheckoutOpen(true);
}}
                  >
                    Proceed to Checkout
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
      {isCheckoutOpen && (
        <div
          className="checkout-overlay"
          onClick={() => setIsCheckoutOpen(false)}
        >
          <div
            className="checkout-panel"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="checkout-header">
              <h2>
                {orderConfirmed ? "Order Confirmed!" : "Checkout"}
              </h2>
              <button
                className="checkout-close"
                onClick={() => {
                  setIsCheckoutOpen(false);
                  setOrderConfirmed(false);
                }}
              >
                ×
              </button>
            </div>

            {orderConfirmed ? (
              <div className="checkout-success">
                <div style={{ fontSize: "55px" }}>✅</div>
                <h2>Thank you, {customerName}!</h2>
                <p>Your order has been placed successfully!</p>
                <p>Order ID: <strong>{savedOrder?._id || "Not available"}</strong></p>
                <p>Payment: {savedOrder?.paymentMethod === "COD" ? "Cash on Delivery" : savedOrder?.paymentMethod}</p>
                <h3>Order Total: ₹{savedOrder?.totalAmount ?? cartSubtotal + 30}</h3>
                <p>Order Status: {savedOrder?.orderStatus || "Pending"}</p>
                <button
                  className="checkout-submit"
                  onClick={() => {
                    setCartItems([]);
                    setIsCheckoutOpen(false);
                    setOrderConfirmed(false);
                    setCustomerName("");
                    setCustomerPhone("");
                    setDeliveryAddress("");
                    setIsCartOpen(false);
                  }}
                >
                  Continue Shopping
                </button>
              </div>
            ) : (
              <form
                className="checkout-form"
                onSubmit={async (event) => {
                  event.preventDefault();

                  if (!/^[6-9]\d{9}$/.test(customerPhone)) {
                    alert("Please enter a valid 10-digit Indian mobile number.");
                    return;
                  }

                  setIsPlacingOrder(true);
                  setOrderError("");

                  try {
                    const response = await axios.post(
                      `${API_URL}/orders`,
                      {
                        customerName,
                        customerPhone,
                        deliveryAddress,
                        paymentMethod,
                        items: cartItems.map((item) => ({
                          foodId: String(item.id),
                          name: item.name,
                          price: item.price,
                          quantity: item.quantity
                        }))
                      },
                      {
                        headers: {
                          Authorization: `Bearer ${token}`
                        }
                      }
                    );

                    if (response.data.success) {
                      setSavedOrder(response.data.order);
                      setOrderConfirmed(true);
                    } else {
                      setOrderError("Unable to place your order. Please try again.");
                    }
                  } catch (error) {
                    setOrderError(
                      error.response?.data?.message ||
                      "Could not connect to the server. Please try again."
                    );
                  } finally {
                    setIsPlacingOrder(false);
                  }
                }}
              >
                <label>
                  Full Name
                  <input
                    type="text"
                    placeholder="Enter your full name"
                    value={customerName}
                    onChange={(event) => setCustomerName(event.target.value)}
                    required
                    minLength={2}
                  />
                </label>

                <label>
                  Mobile Number
                  <input
                    type="tel"
                    placeholder="10-digit mobile number"
                    value={customerPhone}
                    onChange={(event) =>
                      setCustomerPhone(event.target.value.replace(/\D/g, "").slice(0, 10))
                    }
                    required
                    maxLength={10}
                  />
                </label>

                <label>
                  Delivery Address
                  <textarea
                    placeholder="House number, street, area, city and PIN code"
                    value={deliveryAddress}
                    onChange={(event) => setDeliveryAddress(event.target.value)}
                    required
                    minLength={10}
                  />
                </label>

                <label>
                  Payment Method
                  <select
                    value={paymentMethod}
                    onChange={(event) => setPaymentMethod(event.target.value)}
                  >
                    <option value="COD">Cash on Delivery</option>
                  </select>
                </label>

                {orderError && (
                  <p className="checkout-error" role="alert">
                    {orderError}
                  </p>
                )}

                <div className="checkout-summary">
                  <div>
                    <span>Subtotal</span>
                    <strong>₹{cartSubtotal}</strong>
                  </div>
                  <div>
                    <span>Delivery Fee</span>
                    <strong>₹30</strong>
                  </div>
                  <div>
                    <strong>Total Amount</strong>
                    <strong>₹{cartSubtotal + 30}</strong>
                  </div>
                </div>

                <button
                  type="submit"
                  className="checkout-submit"
                  disabled={cartItems.length === 0 || isPlacingOrder}
                >
                  {isPlacingOrder
                    ? "Placing Order..."
                    : `Place Order · ₹${cartSubtotal + 30}`}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
      {isAdminOpen && currentUser?.role === "admin" && (
        <div className="modal-overlay">
          <div className="orders-modal admin-dashboard">
            <div className="modal-header">
              <div>
                <h2>Admin Dashboard</h2>
                <p>Manage all customer orders</p>
              </div>
              <button
                className="modal-close"
                onClick={() => setIsAdminOpen(false)}
              >
                ×
              </button>
            </div>

            <div className="admin-summary">
              <h3>Total Orders: {adminOrders.length}</h3>
              <button
                className="nav-order-btn"
                onClick={fetchAdminOrders}
                disabled={isLoadingAdminOrders}
              >
                {isLoadingAdminOrders ? "Refreshing..." : "Refresh Orders"}
              </button>
            </div>

            {adminOrdersError && (
              <p className="checkout-error">{adminOrdersError}</p>
            )}

            {isLoadingAdminOrders ? (
              <p>Loading all orders...</p>
            ) : adminOrders.length === 0 ? (
              <p>No customer orders found.</p>
            ) : (
              <div className="admin-orders-list">
                {adminOrders.map((order) => (
                  <div className="admin-order-card" key={order._id}>
                    <div className="admin-order-heading">
                      <strong>Order #{order._id.slice(-8)}</strong>
                      <strong>₹{order.totalAmount}</strong>
                    </div>

                    <p>Customer: {order.customerName}</p>
                    <p>Phone: {order.customerPhone}</p>
                    <p>Address: {order.deliveryAddress}</p>
                    <p>Payment: {order.paymentMethod}</p>
                    <p>
                      Date: {new Date(order.createdAt).toLocaleString()}
                    </p>

                    <div className="admin-order-items">
                      <strong>Items:</strong>
                      {order.items.map((item, index) => (
                        <p key={`${order._id}-${index}`}>
                          {item.name} × {item.quantity}
                        </p>
                      ))}
                    </div>

                    <div className="admin-status-control">
                      <label>Update Order Status:</label>
                      <select
                        value={order.orderStatus || "Pending"}
                        onChange={(event) =>
                          updateAdminOrderStatus(order._id, event.target.value)
                        }
                      >
                        <option value="Pending">Pending</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Preparing">Preparing</option>
                        <option value="Out for Delivery">Out for Delivery</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <footer>
        <a className="logo" href="#home">
          🍃 ChefKart<span>AI</span>
        </a>
        <p>Good food. Smart choices. Better living.</p>
        <small>© 2026 ChefKart AI. All rights reserved.</small>
      </footer>
    </div>
  );
}

export default App;



































