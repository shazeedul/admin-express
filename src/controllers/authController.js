import { bcryptjs } from "bcryptjs";
import { User } from "../models/user";
import { jwt } from "jsonwebtoken";

export const register = async (req, res) => {
    const { email, password, name } = req.body;

    try {
        const emailExist = await User.findOne({ email });

        if (emailExist) {
            return res.status(400).json({
                success: false,
                error: "Email already exists"
            });
        }

        const hashedPassword = await bcryptjs.hash(password, 10);

        const user = await User.create({
            name,
            email,
            password: hashedPassword
        });

        res.status(201).json({
            success: true,
            data: user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}

export const login = async (req, res) => {
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
            token: jwt.sign({ id: user._id }, process.env.JWT_SECRET),
            success: true,
        });
    } catch (error) {
        res.status(500).json({ error: 'An error occurred' });
    }
}

export const me = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

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
