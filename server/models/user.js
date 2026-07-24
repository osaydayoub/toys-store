import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const savedAddressSchema = new mongoose.Schema(
    {
        region: {
            type: String,
            required: true,
            trim: true,
        },
        city: {
            type: String,
            required: true,
            trim: true,
            maxlength: [100, "City cannot exceed 100 characters"],
        },
        street: {
            type: String,
            required: true,
            trim: true,
            maxlength: [200, "Street cannot exceed 200 characters"],
        },
        lastUsedAt: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: false }
);

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true,
        },
        phone: {
            type: String,
            required: [true, "Phone number is required"],
            trim: true,
            match: [/^05\d{8}$/, "Enter a valid Israeli phone number"],
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            trim: true,
        },
        password: {
            type: String,
            required: [true, "Password is required"],
            minlength: [6, "Password must be at least 6 characters"],
            select: false,
        },
        role: {
            type: String,
            enum: ["customer", "admin"],
            default: "customer",
        },
        savedAddresses: {
            type: [savedAddressSchema],
            default: [],
        },
        isEmailVerified: {
            type: Boolean,
            default: false,
        },

        emailVerificationCode: {
            type: String,
            select: false,
        },
        emailVerificationExpires: {
            type: Date,
        },
        emailVerificationAttempts: {
            type: Number,
            default: 0,
            select: false,
        },
        emailVerificationLastSentAt: {
            type: Date,
            select: false,
        },

        passwordResetToken: {
            type: String,
            select: false,
        },

        passwordResetExpires: {
            type: Date,
        },
        passwordResetAttempts: {
            type: Number,
            default: 0,
            select: false,
        },
        passwordResetLastSentAt: {
            type: Date,
            select: false,
        },
    },
    { timestamps: true }
);

userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
    return bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);

export default User;
