import express from "express";

const router = express.Router();

import {
  createUser,
  updateUser,
  getAllUsers,
  login,
  changePassword,
  refreshToken,
  confirmEmail,
} from "../controllers/auth.js";
import db from "../models/index.cjs";
import verifyToken from "../controllers/jwtmiddleware.js";

const { sequelize, Sequelize } = db;

/**
 * @swagger
 *
 * /emailAuthentication/register:
 *   post:
 *     tags: [Authentication]
 *     description: This enpoint is used to create a new user in this system
 *     produces:
 *       - application/json
 *     requestBody:
 *        description: sas
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                username:
 *                  type: string
 *                first_name:
 *                  type: string
 *                last_name:
 *                  type: string
 *                email:
 *                  type: string
 *                password:
 *                  type: string
 *                phone_number:
 *                  type: string
 *     responses:
 *          '200':
 *              description: A Successfull response
 *          '422':
 *              description:  Validation error
 */
router.post("/register", createUser);

/**
 * @swagger
 *
 * /emailAuthentication/updateUser:
 *   put:
 *     tags: [Authentication]
 *     produces:
 *       - application/json
 *     security:
 *       - jwt: []
 *     parameters:
 *      - in: query
 *        name: expireIn
 *        description: default Value 15 minutes This parameter defines validity of token after the given time in this parameter token will expire for eg '1m' means 1 minute '5d' means 5 days and '6y' means 6 years. We can also deine time in milliseconds for eg 900000 means 15 minutes
 *
 *     requestBody:
 *        description: A JSON object to update user information
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                username:
 *                  type: string
 *                first_name:
 *                  type: string
 *                last_name:
 *                  type: string
 *                email:
 *                  type: string
 *                phone_number:
 *                  type: string
 *     responses:
 *          '200':
 *              description: A Successfull response
 *
 */
router.put("/updateUser", verifyToken, updateUser);

/**
 * @swagger
 *
 * /emailAuthentication/change_password:
 *   post:
 *     tags: [Authentication]
 *     description: This enpoint is used to change the password of the existing user. it reqiures the JWT Authorization bearer  token
 *     produces:
 *       - application/json
 *     security:
 *       - jwt: []
 *     parameters:
 *      - in: query
 *        name: expireIn
 *        description: default Value 15 minutes This parameter defines validity of token after the given time in this parameter token will expire for eg '1m' means 1 minute '5d' means 5 days and '6y' means 6 years. We can also deine time in milliseconds for eg 900000 means 15 minutes
 *
 *     requestBody:
 *        description: Change Password request body sample object
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                old_password:
 *                  type: string
 *                new_password:
 *                  type: string
 *                repeat_password:
 *                  type: string
 *     responses:
 *          '200':
 *              description: A Successfull response
 *          '422':
 *              description: Validation error
 *          '401':
 *              description: Unauthorized error
 */
router.post("/change_password", verifyToken, changePassword);

/**
 * @swagger
 *
 * /emailAuthentication/login:
 *   post:
 *     tags: [Authentication]
 *     description: This enpoint is used to login the existing user using its email and password and it returns jwt token in response body on succesfull verfication of the credentials which is used to authorize protected endpoints of this system
 *     produces:
 *       - application/json
 *     parameters:
 *      - in: query
 *        name: expireIn
 *        description: default Value 15 minutes This parameter defines validity of token after the given time in this parameter token will expire for eg '1m' means 1 minute '5d' means 5 days and '6y' means 6 years. We can also deine time in milliseconds for eg 900000 means 15 minutes
 *
 *     requestBody:
 *        description: Login request body sample object
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                email:
 *                  type: string
 *                password:
 *                  type: string
 *     responses:
 *          '200':
 *              description: A Successfull response
 *          '422':
 *              description: Validation error
 */
router.post("/login", login);

/**
 * @swagger
 *
 * /emailAuthentication/getAllUsers:
 *   get:
 *      tags: [Authentication]
 *      produces:
 *       - application/json
 *      responses:
 *          '200':
 *              description: A Successfull response
 */
router.get("/getAllUsers", getAllUsers);

/**
 * @swagger
 *
 * /emailAuthentication/refreshToken:
 *   get:
 *     tags: [Authentication]
 *     description: This endpoint is used to refresh the expiration of the token it takes old token  and genreates new token
 *     produces:
 *       - application/json
 *     security:
 *       - jwt: []
 *     parameters:
 *      - in: query
 *        name: expireIn
 *        description: default Value 15 minutes This parameter defines validity of token after the given time in this parameter token will expire for eg '1m' means 1 minute '5d' means 5 days and '6y' means 6 years. We can also deine time in milliseconds for eg 900000 means 15 minutes
 *
 *     responses:
 *          '200':
 *              description: A Successfull response
 *          '422':
 *              description: Validation error
 *          '401':
 *              description: Unauthorized error
 */
router.get("/refreshToken", verifyToken, refreshToken);

router.get("/confirmEmail", confirmEmail);

router.get("/sayhello", verifyToken, (req, res) => res.send("Hello"));

export default router;
