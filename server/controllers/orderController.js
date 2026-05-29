import Order from "../models/order.js";
import Product from "../models/product.js";
import STATUS_CODE from "../constants/statusCodes.js";

export const createOrder = async (req, res, next) => {
  try {
    const { items, shippingAddress, totalPrice } = req.body;

    if (!items || items.length === 0) {
      return res.status(STATUS_CODE.BAD_REQUEST).json({
        success: false,
        message: "Order must contain at least one item",
      });
    }

    for (const item of items) {
      const product = await Product.findById(item._id);

      if (!product) {
        return res.status(STATUS_CODE.NOT_FOUND).json({
          success: false,
          message: `Product not found: ${item.name}`,
        });
      }

      if (product.stock < item.quantity) {
        return res.status(STATUS_CODE.BAD_REQUEST).json({
          success: false,
          message: `${product.name} is not available in the requested quantity`,
        });
      }
    }

    const orderItems = items.map((item) => ({
      product: item._id,
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      image: item.images?.[0] || "",
    }));

    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      shippingAddress,
      totalPrice,
    });

    for (const item of items) {
      await Product.findByIdAndUpdate(item._id, {
        $inc: { stock: -item.quantity },
      });
    }

    res.status(STATUS_CODE.CREATED).json({
      success: true,
      message: "Order created successfully",
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({
      createdAt: -1,
    });

    res.status(STATUS_CODE.OK).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email phone")
      .sort({ createdAt: -1 });

    res.status(STATUS_CODE.OK).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

export const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = [
      "pending",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(STATUS_CODE.BAD_REQUEST).json({
        success: false,
        message: "Invalid order status",
      });
    }

    const order = await Order.findById(id);

    if (!order) {
      return res.status(STATUS_CODE.NOT_FOUND).json({
        success: false,
        message: "Order not found",
      });
    }

    const previousStatus = order.status;

    if (previousStatus === status) {
      return res.status(STATUS_CODE.OK).json({
        success: true,
        message: "Order status is already up to date",
        data: order,
      });
    }

    if (
      status === "cancelled" &&
      ["shipped", "delivered"].includes(previousStatus)
    ) {
      return res.status(STATUS_CODE.BAD_REQUEST).json({
        success: false,
        message: "Cannot cancel an order after it has been shipped or delivered",
      });
    }

    if (status === "cancelled" && previousStatus !== "cancelled") {
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: item.quantity },
        });
      }
    }
    
    order.status = status;
    await order.save();
    res.status(STATUS_CODE.OK).json({
      success: true,
      message: "Order status updated successfully",
      data: order,
    });
  } catch (error) {
    next(error);
  }
};