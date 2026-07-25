import Order from "../models/order.js";
import Product from "../models/product.js";
import User from "../models/user.js";
import STATUS_CODE from "../constants/statusCodes.js";
import { fileURLToPath } from "url";
import sendEmail from "../utils/sendEmail.js";

const emailLogoPath = fileURLToPath(
  new URL("../../client/src/assets/logo.png", import.meta.url)
);

const shippingCosts = {
  "Jerusalem District": 70,
  "Northern & Haifa District": 50,
  "Central District": 50,
  "Tel Aviv District": 70,
  "Southern District": 70,
  "West Bank": 70,
};

const normalizeAddressValue = (value) =>
  value.trim().replace(/\s+/g, " ").toLocaleLowerCase();

const escapeHtml = (value = "") =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const getOrderNotificationRecipients = () =>
  process.env.ORDER_NOTIFICATION_EMAIL?.split(",")
    .map((email) => email.trim())
    .filter(Boolean) || [];

const sendNewOrderNotification = async (order, customer) => {
  const recipients = [...new Set(getOrderNotificationRecipients())];

  if (recipients.length === 0) {
    console.warn(
      `New order ${order.orderNumber} created, but ORDER_NOTIFICATION_EMAIL is not configured.`
    );
    return;
  }

  const itemsText = order.items
    .map(
      (item) =>
        `${item.name} × ${item.quantity} — ₪${(
          item.price * item.quantity
        ).toFixed(2)}`
    )
    .join("\n");

  const itemsHtml = order.items
    .map(
      (item) => `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">
            ${escapeHtml(item.name)}
          </td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">
            ${item.quantity}
          </td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">
            ₪${(item.price * item.quantity).toFixed(2)}
          </td>
        </tr>
      `
    )
    .join("");

  const customerName = customer?.name || "Customer";
  const customerEmail = customer?.email || "";
  const customerPhone =
    order.shippingAddress.phone || customer?.phone || "";
  const address = [
    order.shippingAddress.region,
    order.shippingAddress.city,
    order.shippingAddress.street,
  ]
    .filter(Boolean)
    .join(", ");

  await sendEmail({
    to: recipients,
    subject: `New order #${order.orderNumber} - Baby Kids Toys`,
    text: `A new order has been created.

Order: #${order.orderNumber}
Customer: ${customerName}
Email: ${customerEmail}
Phone: ${customerPhone}
Address: ${address}

Items:
${itemsText}

Items total: ₪${order.itemsPrice.toFixed(2)}
Delivery: ₪${order.shippingCost.toFixed(2)}
Order total: ₪${order.totalPrice.toFixed(2)}
${order.deliveryNote ? `Delivery note: ${order.deliveryNote}` : ""}`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 620px; margin: 0 auto; padding: 24px;">
        <img
          src="cid:baby-kids-toys-logo"
          alt="Baby Kids Toys"
          width="90"
          height="90"
          style="display: block; width: 90px; height: 90px; object-fit: cover; border-radius: 50%; margin: 0 auto 18px;"
        />
        <h2 style="text-align: center; margin-bottom: 4px;">A new order was created</h2>
        <p style="text-align: center; color: #666; margin-top: 0;">
          Order #${escapeHtml(order.orderNumber)}
        </p>

        <h3>Customer details</h3>
        <p>
          <strong>Name:</strong> ${escapeHtml(customerName)}<br />
          <strong>Email:</strong> ${escapeHtml(customerEmail)}<br />
          <strong>Phone:</strong> ${escapeHtml(customerPhone)}<br />
          <strong>Address:</strong> ${escapeHtml(address)}
        </p>

        <h3>Items</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background: #f6f2ed;">
              <th style="padding: 10px; text-align: left;">Product</th>
              <th style="padding: 10px;">Quantity</th>
              <th style="padding: 10px; text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>${itemsHtml}</tbody>
        </table>

        <div style="margin-top: 20px; text-align: right;">
          <div>Items: ₪${order.itemsPrice.toFixed(2)}</div>
          <div>Delivery: ₪${order.shippingCost.toFixed(2)}</div>
          <div style="font-size: 20px; font-weight: 700;">
            Total: ₪${order.totalPrice.toFixed(2)}
          </div>
        </div>

        ${
          order.deliveryNote
            ? `<p style="margin-top: 20px;"><strong>Delivery note:</strong> ${escapeHtml(
                order.deliveryNote
              )}</p>`
            : ""
        }
      </div>
    `,
    attachments: [
      {
        filename: "baby-kids-toys-logo.png",
        path: emailLogoPath,
        cid: "baby-kids-toys-logo",
      },
    ],
  });
};

const saveRecentAddress = async (userId, shippingAddress) => {
  const user = await User.findById(userId);

  if (!user) return;

  const address = {
    region: shippingAddress.region.trim(),
    city: shippingAddress.city.trim(),
    street: shippingAddress.street.trim(),
    lastUsedAt: new Date(),
  };

  const existingAddress = user.savedAddresses.find(
    (savedAddress) =>
      normalizeAddressValue(savedAddress.region) ===
        normalizeAddressValue(address.region) &&
      normalizeAddressValue(savedAddress.city) ===
        normalizeAddressValue(address.city) &&
      normalizeAddressValue(savedAddress.street) ===
        normalizeAddressValue(address.street)
  );

  if (existingAddress) {
    address._id = existingAddress._id;
  }

  user.savedAddresses = [
    address,
    ...user.savedAddresses.filter(
      (savedAddress) =>
        !existingAddress ||
        savedAddress._id.toString() !== existingAddress._id.toString()
    ),
  ].slice(0, 3);

  await user.save();
};

export const createOrder = async (req, res, next) => {
  try {
    const { items, shippingAddress, deliveryNote } = req.body;

    if (!items || items.length === 0) {
      return res.status(STATUS_CODE.BAD_REQUEST).json({
        success: false,
        message: "Order must contain at least one item",
      });
    }

    if (!shippingAddress?.region) {
      return res.status(STATUS_CODE.BAD_REQUEST).json({
        success: false,
        message: "Shipping region is required",
      });
    }

    const shippingCost = shippingCosts[shippingAddress.region];

    if (shippingCost === undefined) {
      return res.status(STATUS_CODE.BAD_REQUEST).json({
        success: false,
        message: "Invalid shipping region",
      });
    }

    let itemsPrice = 0;

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

      itemsPrice += product.price * item.quantity;
    }

    const orderItems = items.map((item) => ({
      product: item._id,
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      image: item.images?.[0] || "",
    }));

    const totalPrice = itemsPrice + shippingCost;

    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      shippingAddress,
      deliveryNote,
      itemsPrice,
      shippingCost,
      totalPrice,
    });

    for (const item of items) {
      await Product.findByIdAndUpdate(item._id, {
        $inc: { stock: -item.quantity },
      });
    }

    try {
      await saveRecentAddress(req.user._id, shippingAddress);
    } catch (addressError) {
      console.error("Failed to save recent delivery address:", addressError);
    }

    sendNewOrderNotification(order, req.user).catch((emailError) => {
      console.error(
        `Failed to send notification for order ${order.orderNumber}:`,
        emailError
      );
    });

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

export const updateOrderAdminNote = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { adminNote } = req.body;

    if (typeof adminNote !== "string" || !adminNote.trim()) {
      return res.status(STATUS_CODE.BAD_REQUEST).json({
        success: false,
        message: "Admin note is required",
      });
    }

    if (adminNote.trim().length > 1000) {
      return res.status(STATUS_CODE.BAD_REQUEST).json({
        success: false,
        message: "Admin note cannot exceed 1000 characters",
      });
    }

    const order = await Order.findByIdAndUpdate(
      id,
      { adminNote: adminNote.trim() },
      { new: true, runValidators: true }
    );

    if (!order) {
      return res.status(STATUS_CODE.NOT_FOUND).json({
        success: false,
        message: "Order not found",
      });
    }

    res.status(STATUS_CODE.OK).json({
      success: true,
      message: "Admin note saved successfully",
      data: order,
    });
  } catch (error) {
    next(error);
  }
};
