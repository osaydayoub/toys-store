import express from 'express';
import { createProduct, deleteProduct, getAllProducts, getProductBySlug, updateProduct } from '../controllers/productController.js';
import { protect, adminOnly } from "../middleware/authMiddleware.js";
const router = express.Router();


router.get('/', getAllProducts);
router.get('/:slug', getProductBySlug);
router.post('/', protect, adminOnly, createProduct);
router.put('/:slug', protect, adminOnly, updateProduct);
router.delete('/:slug', protect, adminOnly, deleteProduct);


export default router;