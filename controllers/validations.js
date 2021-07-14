import Joi from "joi";

export const registerUserValidation = Joi.object({
  username: Joi.string().alphanum().min(3).required(),
  password: Joi.string()
    .pattern(
      new RegExp(
        "^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$"
      )
    )
    .required(),
  email: Joi.string().email().required(),
  first_name: Joi.string(),
  last_name: Joi.string(),
  phone_number: Joi.string(),
});

export const loginUserValidation = Joi.object({
  password: Joi.string().required(),
  email: Joi.string().email().required(),
});

export const changePasswordValidation = Joi.object({
  old_password: Joi.string().required(),
  new_password: Joi.string().required(),
  repeat_password: Joi.ref("new_password"),
});

export const updateUserValidation = Joi.object({
  username: Joi.string().alphanum().min(3),
  email: Joi.string().email(),
  first_name: Joi.string(),
  last_name: Joi.string(),
  phone_number: Joi.string(),
});
