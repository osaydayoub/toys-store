import Product from "../models/product.js";
import STATUS_CODE from "../constants/statusCodes.js";

export const createProduct = async (req, res, next) => {
    try {
        const { name, slug, description, price, category, ageRange, stock, images } = req.body;
        const existingProduct = await Product.findOne({ slug });
        if (existingProduct) {
            return res.status(STATUS_CODE.CONFLICT).json({ success: false, message: "Product with this slug already exists" });
        }
        const newProduct = await Product.create({ name, slug, description, price, category, ageRange, stock, images });
        res.status(STATUS_CODE.CREATED).json({
            success: true,
            message: "Product created successfully",
            data: newProduct,
        });
    } catch (error) {
        next(error);
    }
};

export const getAllProducts = async (req, res, next) => {
    try {
        const products = await Product.find();
        res.status(STATUS_CODE.OK).json({
            success: true,
            count: products.length,
            data: products,
        });
    } catch (error) {
        next(error);
    }
};

export const getProductBySlug = async (req, res, next) => {
    try {
        const { slug } = req.params;
        const product = await Product.findOne({ slug });
        if (!product) {
            return res.status(STATUS_CODE.NOT_FOUND).json({ success: false, message: "Product not found" });
        } res.status(STATUS_CODE.OK).json({ success: true, data: product });
    } catch (error) {
        next(error);
    }

};

export const updateProduct = async (req, res, next) => {
    try {
        const { slug } = req.params;
        const { name, description, price, category, ageRange, stock, images } = req.body;
        const product = await Product.findOneAndUpdate(
            { slug },
            { name, description, price, category, ageRange, stock, images },
            { returnDocument: "after", runValidators: true }
        );
        if (!product) {
            return res.status(STATUS_CODE.NOT_FOUND).json({
                success: false,
                message: "Product not found"
            });
        } res.status(STATUS_CODE.OK).json({
            success: true,
            message: "Product updated successfully",
            data: product
        });
    } catch (error) {
        next(error);
    }
};

export const deleteProduct = async (req, res, next) => {
    try {
        const { slug } = req.params;
        const product = await Product.findOneAndDelete({ slug });
        if (!product) {
            return res.status(STATUS_CODE.NOT_FOUND).json({ success: false, message: "Product not found" });
        }
        res.status(STATUS_CODE.OK).json({ success: true, message: "Product deleted successfully" });
    } catch (error) {
        next(error);
    }
};
