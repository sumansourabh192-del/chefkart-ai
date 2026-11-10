const express = require("express");
const router = express.Router();

const {
  createOrder,
  getOrders,
  getAllOrders,
  updateOrderStatus
} = require("../controllers/orderController");

const { protect } = require("../middleware/authMiddleware");
const { admin } = require("../middleware/adminMiddleware");

// Customer routes: login required
router.post("/", protect, createOrder);
router.get("/", protect, getOrders);

// Admin route: login and admin role required
router.get('/admin/all', protect, admin, getAllOrders);
router.patch("/:id/status", protect, admin, updateOrderStatus);

module.exports = router;


