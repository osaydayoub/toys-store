import express from 'express';
import { createProduct, deleteProduct, getAllProducts, getProductBySlug, updateProduct } from '../controllers/productController.js';
const router = express.Router();

router.post('/', createProduct);
router.get('/', getAllProducts);
router.get('/:slug', getProductBySlug);
router.put('/:slug', updateProduct);
router.delete('/:slug', deleteProduct);


export default router;