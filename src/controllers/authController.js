const bcrypt = require("bcrypt");
const User = require("../models/user");
const jwt = require("jsonwebtoken");

const register = async (req, res) => {
    const { email, password, name } = req.body;

    try {
        const emailExist = await User.findOne({ email });

        if (emailExist) {
            return res.status(400).json({
                success: false,
                error: "Email already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email,
            password: hashedPassword
        });

        const token = jwt.sign({email: user.email, id: user._id}, process.env.JWT_SECRET, { expiresIn: "1h" });

        res.status(201).json({
            success: true,
            data: user,
            token
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        return res.status(200).json({
            data: user,
            token: jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" }),
            success: true,
        });
    } catch (error) {
        res.status(500).json({ error: 'An error occurred' });
    }
}

const me = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        return res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        res.status(500).json({ error: 'An error occurred' });
    }
}

module.exports = {
    register,
    login,
    me
}
