import { RequestHandler } from "express";
import createHttpError from "http-errors";

export const requiresAuth: RequestHandler = (req, res, next) => {
  if (req.session.userId) {
    next(); //next without any argument will forward the request to the endpoint
  } else {
    next(createHttpError(401, "User not authenticated"));
  }
};
