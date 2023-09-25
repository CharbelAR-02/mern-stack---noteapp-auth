import "dotenv/config";
import express, { NextFunction, Request, Response } from "express";
import notesRoutes from "./routes/notes";
import userRoutes from "./routes/users";
import morgan from "morgan";
import createHttpError, { isHttpError } from "http-errors";
import session from "express-session";
import env from "./util/validateEnv";
import MongoStore from "connect-mongo";
import { requiresAuth } from "./middleware/auth";
// Create an Express application
const app = express();

app.use(morgan("dev"));

app.use(express.json()); //this is a middleware that allows to send data in json format to mongodb in this project

app.use(
  session({
    secret: env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 60 * 60 * 1000,
    },
    rolling: true,
    store: MongoStore.create({
      mongoUrl: env.MONGO_CONNECTION_STRING,
    }),
  })
);

app.use("/api/users", userRoutes);
app.use("/api/notes", requiresAuth, notesRoutes); // this is the endpoint prefix

app.use((req, res, next) => {
  //middleware for handling routes that doen't exist
  next(createHttpError(404, "Endpoint not found"));
});

// Define a global error handling middleware
//this global error handling middleware will trigger every time an endpoint catches an error the error will be passed to this middleware
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((error: unknown, req: Request, res: Response, next: NextFunction) => {
  // Log the error to the console
  console.error(error);

  // Set a default error message
  let errorMessage = "An unknown error occurred";
  let statusCode = 500;
  // Check if the error is an instance of the Error class, and if so, extract the error message
  if (isHttpError(error)) {
    statusCode = error.status;
    errorMessage = error.message;
  }

  // Respond to the client with a 500 (Internal Server Error) status and an error JSON object
  res.status(statusCode).json({ error: errorMessage });
});

// Export the Express application
export default app;
