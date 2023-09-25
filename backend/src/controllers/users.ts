import { RequestHandler } from "express";
import createHttpError from "http-errors";
import userModel from "../models/user";
import bcrypt from "bcrypt";
interface signUpBody {
  username?: string;
  email?: string;
  password?: string;
}

export const getAuthenticatedUser: RequestHandler = async (req, res, next) => {
  try {
    const user = await userModel
      .findById(req.session.userId)
      .select("+email")
      .exec();
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

export const signUp: RequestHandler<
  unknown,
  unknown,
  signUpBody,
  unknown
> = async (req, res, next) => {
  const username = req.body.username;
  const email = req.body.email;
  const rawPassword = req.body.password;

  try {
    if (!username || !email || !rawPassword) {
      throw createHttpError(400, "Parameters Missing");
    }
    const existingUsername = await userModel
      .findOne({ username: username })
      .exec();
    if (existingUsername) {
      throw createHttpError(
        409,
        "Username already taken please choose a different one or login instead"
      );
    }
    const existingEmail = await userModel.findOne({ email: email }).exec();
    if (existingEmail) {
      throw createHttpError(
        409,
        "Email already taken please choose a different one ore login instead"
      );
    }
    const hashedPassword = await bcrypt.hash(rawPassword, 10);
    const newUser = await userModel.create({
      username: username,
      email: email,
      password: hashedPassword,
    });
    req.session.userId = newUser._id;

    res.status(201).json(newUser);
  } catch (error) {
    next(error);
  }
};

interface loginBody {
  username?: string;
  password?: string;
}

export const login: RequestHandler<
  unknown,
  unknown,
  loginBody,
  unknown
> = async (req, res, next) => {
  const username = req.body.username;
  const password = req.body.password;
  try {
    if (!username || !password) {
      throw createHttpError(400, "Parameters Missing");
    }

    const user = await userModel
      .findOne({
        username: username,
      })
      .select("+password +email")
      .exec();

    if (!user) {
      throw createHttpError(401, "Invalid credentials");
    }
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      throw createHttpError(401, "Invalid credentials");
    }
    req.session.userId = user._id;
    return res.status(201).json(user);
  } catch (error) {
    next(error);
  }
};

export const logout: RequestHandler = (req, res, next) => {
  req.session.destroy((error) => {
    if (error) {
      next(error);
    } else {
      res.sendStatus(200); //send status because we dont have a json body to send just the code
    }
  });
};
