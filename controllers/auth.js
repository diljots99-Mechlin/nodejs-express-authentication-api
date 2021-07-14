import express from "express";
import { v4 as uuidv4 } from "uuid";
import db from "../models/index.cjs";
import {
  registerUserValidation,
  loginUserValidation,
  changePasswordValidation,
} from "./validations.js";
import bcrypt from "bcryptjs";
import Jwt from "jsonwebtoken";
import { sendConfirmationEmail } from "../services/emailService.js";

const { sequelize, Sequelize } = db;
const router = express.Router();

export const createUser = async (req, res) => {
  let body = req.body;

  const validationResult = registerUserValidation.validate(body);
  if (validationResult.error) {
    const result = {
      status: 422,
      error: {
        message: validationResult.error.details[0].message,
        key: validationResult.error.details[0].context.key,
      },
      errorDetails: validationResult.error,
    };
    return res.status(422).send(result);
  }
  var salt = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync(body.password);

  console.log(
    "Comapre Password: ",
    bcrypt.compareSync(body.password, hashedPassword)
  );
  body.password = hashedPassword;

  sequelize.models.User.create(body)
    .then((result) => {
      let user = result.dataValues;
      console.log(process.env.TOKEN_SECRET);
      console.log(process.env.SMTP_HOST);

      const emailConfirmToken = Jwt.sign(
        { id: user.id, email: user.email },
        process.env.TOKEN_SECRET,
        {
          expiresIn: 60 * 15,
        }
      );
      user.message = `A confirmation email has been sent to ${user.email}. Please verify the sasme to continue`;
      user.emailConfirmToken = emailConfirmToken;
      console.log(user);
      sendConfirmationEmail(
        user.username,
        user.email,
        emailConfirmToken,
        req,
        res
      );
      res.send({ status: 200, user: user });
    })
    .catch((err) => {
      console.log(err);
      const result = {
        status: 500,
        error: {
          message: err.errors[0].message,
          key: err.errors[0].message.path,
        },
        errorDetails: err,
      };
      return res.status(500).send(result);
      console.log("error occured while save user  to db ", err);
    });
};

export const updateUser = (req, res) => {
  let body = req.body;
  let user = req.user;

  let expireIn = req.query.expireIn;
  if (!expireIn) expireIn = 60 * 15;

  const validationResult = registerUserValidation.validate(body);
  if (validationResult.error) {
    const result = {
      status: 422,
      error: {
        message: validationResult.error.details[0].message,
        key: validationResult.error.details[0].context.key,
      },
      errorDetails: validationResult.error,
    };
    return res.status(422).send(result);
  }

  if (body.username) user.username = body.username;
  if (body.email) user.eamil = body.email;
  if (body.first_name) user.first_name = body.first_name;
  if (body.last_name) user.last_name = body.last_name;
  if (body.phone_number) user.phone_number = body.phone_number;

  user
    .save()
    .then((result) => {
      const token = Jwt.sign({ id: user.id }, process.env.TOKEN_SECRET, {
        expiresIn: expireIn,
      });
      const userResult = result.dataValues;

      userResult.token = token;
      delete userResult["password"];

      console.log(result);
      res.send({
        status: 200,
        user: userResult,
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send(err);
    });
};

export const changePassword = (req, res) => {
  const user = req.user;
  let body = req.body;

  let expireIn = req.query.expireIn;
  if (!expireIn) expireIn = 60 * 15;

  const validationResult = changePasswordValidation.validate(body);
  if (validationResult.error) {
    const result = {
      status: 422,
      error: {
        message: validationResult.error.details[0].message,
        key: validationResult.error.details[0].context.key,
      },
      errorDetails: validationResult.error,
    };
    return res.status(422).send(result);
  }

  if (body.old_password == body.new_password) {
    const result = {
      status: 200,
      error: {
        message: "new password can't be same as old password",
        messageShort: "new password can't be same as old password",
        key: "password",
      },
    };
    return res.status(200).send(result);
  }

  bcrypt.compare(body.old_password, user.password, (err, compareRes) => {
    if (err) {
      return res.send(err);
    }

    if (compareRes) {
      const token = Jwt.sign({ id: user.id }, process.env.TOKEN_SECRET, {
        expiresIn: expireIn,
      });
      const hashedPassword = bcrypt.hashSync(body.new_password);

      user.password = hashedPassword;
      user
        .save()
        .then((result) => {
          const User = result.dataValues;

          User.token = token;

          delete User["password"];
          const response = {
            status: 200,
            user: User,
          };
          res.send(response);
        })
        .catch((err) => {
          console.log(err);
          res.send(err);
        });
    } else {
      const result = {
        status: 200,
        error: {
          message: "Invaild email or password",
          messageShort: "Invaild email or password",
          key: "password",
        },
      };
      return res.status(200).send(result);
    }
  });
};

export const getAllUsers = (req, res) => {
  const test = sequelize.models.User.findAll()
    .then((result) => {
      console.log(result);
      res.send(result);
    })
    .catch((err) => {
      console.log("Error Occures");
      console.error(err);
    });
};

export const login = (req, res) => {
  let body = req.body;
  // res.send(body);
  console.log(body);
  let expireIn = req.query.expireIn;
  if (!expireIn) expireIn = 60 * 15;

  const validationResult = loginUserValidation.validate(body);

  if (validationResult.error) {
    const result = {
      status: 422,
      error: {
        message: validationResult.error.details[0].message,
        key: validationResult.error.details[0].context.key,
      },
      errorDetails: validationResult.error,
    };
    return res.status(422).send(result);
  }

  sequelize.models.User.findAll({
    where: {
      email: body.email,
    },
  })
    .then((result) => {
      console.log(result.length);
      if (result.length == 0) {
        const result = {
          status: 200,
          error: {
            message: `User with email: ${body.email} does not exist`,
            messageShort: "User does not exist",
            key: "email",
          },
        };
        return res.status(200).send(result);
      } else {
        let User = result[0];
        const pass = bcrypt.compareSync(body.password, User.password);

        console.log("Console Password comparison : ", pass);
        bcrypt.compare(body.password, User.password, (err, compareRes) => {
          if (err) {
            return res.send(err);
          }

          if (compareRes) {
            const token = Jwt.sign({ id: User.id }, process.env.TOKEN_SECRET, {
              expiresIn: expireIn,
            });
            User.dataValues.token = token;
            User = User.dataValues;

            delete User["password"];
            console.log(User);
            const result = {
              status: 200,
              user: User,
            };
            res.send(result);
          } else {
            const result = {
              status: 200,
              error: {
                message: "Invaild email or password",
                messageShort: "Invaild email or password",
                key: "password",
              },
            };
            return res.status(200).send(result);
          }
        });
      }
    })
    .catch((error) => {
      res.send(error);
      console.log(error);
    });

  // res.send("Login");
};

export const refreshToken = (req, res) => {
  const oldToken = req.userAuthToken;
  let expireIn = req.query.expireIn;
  if (!expireIn) expireIn = 60 * 15;

  console.log("expireIn", expireIn);
  if (req.userId) {
    const token = Jwt.sign({ id: req.userId }, process.env.TOKEN_SECRET, {
      expiresIn: expireIn,
    });
    res.status(200).send({
      status: 200,
      old_token: oldToken,
      refreshed_token: token,
    });
  } else {
    res.send("Error Occured");
  }
};

export const confirmEmail = async (req, res) => {
  const claimEmailToken = req.query.emailConfirmToken;

  if (!claimEmailToken)
    return res
      .status(422)
      .send({ status: 422, error: { message: "Invalid Confirm Email Token" } });

  try {
    const verified = Jwt.verify(claimEmailToken, process.env.TOKEN_SECRET);
    const User = await sequelize.models.User.findOne({
      where: {
        email: verified.email,
      },
    });
    User.emailConfirmed = true;
    User.save()
      .then((result) => {
        const response = {
          status: 200,
          message: `We have confirmed your email you can now proceed to login`,
        };
        return res.send(response);
      })
      .catch((err) => {
        const response = {
          status: 500,
          message: `Unable to confirm email`,
        };
        return res.send(err);
      });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .send({ status: 500, error: { message: "Invalid Token" } });
  }
};
