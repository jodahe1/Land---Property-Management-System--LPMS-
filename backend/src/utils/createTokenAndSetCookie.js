import jwt from "jsonwebtoken";

export const createTokenAndSetCookie = (userId, res) => {
  const token = jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: "7d" } // token expires in 7 days
  );

  res.cookie("token", token, {
    httpOnly: true, // prevents client-side JS from accessing the cookie
    secure: process.env.NODE_ENV === "production", // cookie only sent over HTTPS in production
    sameSite: "strict", // CSRF protection
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
  });

  return token;
};
