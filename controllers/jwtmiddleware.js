import Jwt from "jsonwebtoken";

import db from "../models/index.cjs";
const { sequelize, Sequelize } = db;

export default async function verifyToken(req, res, next) {
  // const token = req.header("auth-token");
  const authHeader = req.headers.authorization;
  if (!authHeader)
    return res
      .status(401)
      .send({ status: 401, error: { message: "Access Denied" } });
  const token = authHeader.split(" ")[1];
  console.log(authHeader);
  console.log(token);
  if (!token)
    return res
      .status(401)
      .send({ status: 401, error: { message: "Access Denied" } });

  try {
    const verified = Jwt.verify(token, process.env.TOKEN_SECRET);
    const User = await sequelize.models.User.findOne({
      where: {
        id: verified.id,
      },
    });
    req.user = User;
    req.userId = verified.id;
    req.userAuthToken = token;
    console.log(verified);
    console.log(User);
    next();
  } catch (err) {
    return res
      .status(401)
      .send({ status: 401, error: { message: "Invalid Token" } });
  }
}
