import mongoose from "mongoose";
const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Product name is required"],
            trim: true,
        },
        slug: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        description: {
            type: String,
            required: [true, "Product description is required"],
            trim: true,
        },
        price: {
            type: Number,
            required: [true, "Product price is required"],
            min: [0, "Price cannot be negative"]
        },
        category: {
            type: String,
            required: [true, "Product category is required"],
            enum: ["Educational Toys", "Sensory Toys", "Puzzle & Brain Games", "Motor Skills Toys", "Outdoor Toys", "Other"]
        },
        ageRange: {
            type: String,
            required: [true, "Product age range is required"],
            enum: [
                '0-6 Months',
                '6-12 Months',
                '1-2 Years',
                '3-5 Years',
                '6+ Years',
            ],
        },
        stock: {
            type: Number,
            required: [true, "Product stock is required"],
            min: [0, "Stock cannot be negative"],
            default: 0,
        },
        images: {
            type: [String],
            default: [],
        },

    },
    { timestamps: true }
);
// productSchema.index({ slug: 1 });
const Product = mongoose.model("Product", productSchema);
export default Product;
