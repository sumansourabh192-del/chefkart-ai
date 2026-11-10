const Order = require("../models/Order");

const createOrder = async (req, res) => {
  try {
    const {
      customerName,
      customerPhone,
      deliveryAddress,
      items,
      paymentMethod
    } = req.body;

    if (
      !customerName?.trim() ||
      !customerPhone?.trim() ||
      !deliveryAddress?.trim() ||
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required order details."
      });
    }

    if (!/^[6-9]\d{9}$/.test(customerPhone)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid 10-digit phone number."
      });
    }

    if (paymentMethod && paymentMethod !== "COD") {
      return res.status(400).json({
        success: false,
        message: "Invalid payment method."
      });
    }

    const cleanItems = items.map((item) => {
      const price = Number(item.price);
      const quantity = Number(item.quantity);

      if (
        !item.name?.trim() ||
        !Number.isFinite(price) ||
        price < 0 ||
        !Number.isInteger(quantity) ||
        quantity < 1
      ) {
        throw new Error("Invalid food item details.");
      }

      return {
        foodId: item.foodId || "",
        name: item.name.trim(),
        price,
        quantity
      };
    });

    const subtotal = cleanItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );

    const deliveryFee = 30;
    const totalAmount = subtotal + deliveryFee;

    const order = await Order.create({
      user: req.user._id,
      customerName: customerName.trim(),
      customerPhone,
      deliveryAddress: deliveryAddress.trim(),
      items: cleanItems,
      subtotal,
      deliveryFee,
      totalAmount,
      paymentMethod: "COD"
    });

    return res.status(201).json({
      success: true,
      message: "Order placed successfully!",
      order
    });
  } catch (error) {
    console.error("Create order error:", error.message);

    return res.status(400).json({
      success: false,
      message: error.message || "Failed to place order."
    });
  }
};

const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (error) {
    console.error("Get orders error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch orders."
    });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const allowedStatuses = [
      "Pending",
      "Confirmed",
      "Preparing",
      "Out for Delivery",
      "Delivered",
      "Cancelled"
    ];

    const { status } = req.body;

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order status."
      });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { orderStatus: status },
      { new: true, runValidators: true }
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found."
      });
    }

    return res.status(200).json({
      success: true,
      message: "Order status updated.",
      order
    });
  } catch (error) {
    console.error("Update order status error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to update order status."
    });
  }
};

module.exports = { createOrder, getOrders, updateOrderStatus };




const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (error) {
    console.error("Get all orders error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch all orders."
    });
  }
};

module.exports.getAllOrders = getAllOrders;
