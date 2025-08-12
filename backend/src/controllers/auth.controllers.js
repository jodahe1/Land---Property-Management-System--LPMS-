import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import { createTokenAndSetCookie } from "../utils/createTokenAndSetCookie.js";

export const signup = async (req, res) => {
  const { citizenId, email, phoneNumber, name, password } = req.body;

  try {
    // Check if all fields are present
    if (!citizenId || !email || !phoneNumber || !name || !password) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    // Check if citizenId or email already exists
    const user = await User.findOne({
      $or: [{ citizenId }, { email }],
    });

    if (user) {
      return res.status(400).json({
        message: "User with this Citizen ID or Email already exists",
      });
    }

    // Hash password
    const hashedPswd = bcrypt.hashSync(password, 10);

    // Save user
    const newUser = new User({
      citizenId,
      email,
      phoneNumber,
      name,
      password: hashedPswd,
    });

    const savedUser = await newUser.save();

    // Create JWT and set cookie
    const token = createTokenAndSetCookie(savedUser._id, res);

    // Remove password before sending response
    const { password: pwd, ...userWithoutPassword } = savedUser.toObject();

    console.log("User Saved");
    return res.status(201).json(userWithoutPassword, token);
  } catch (error) {
    console.error("Error on Signup Controller:", error);
    return res.status(500).json({
      message: "Error while signing up",
    });
  }
};

export const login = async (req, res) => {
  const { citizenId, password } = req.body;

  try {
    if (!citizenId || !password) {
      return res
        .status(400)
        .json({ message: "Citizen ID and password are required" });
    }

    const user = await User.findOne({ citizenId });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    createTokenAndSetCookie(user._id, res);

    const { password: pwd, ...userWithoutPassword } = user.toObject();
    return res.status(200).json(userWithoutPassword);
  } catch (error) {
    console.error("Error on Login Controller:", error);
    return res.status(500).json({ message: "Server error during login" });
  }
};

export const logout = (req, res) => {
  res.cookie("token", "", {
    httpOnly: true,
    expires: new Date(0), // Expire immediately
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
  return res.status(200).json({ message: "Logged out successfully" });
};
