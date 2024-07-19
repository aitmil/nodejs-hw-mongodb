import express from "express";
import cors from "cors";
import pino from "pino-http";
import { env } from "./utils/env";

const PORT = Number(env("PORT", "8080"));

export const startServer = () => {
  const app = express();

  app.use(cors());

  app.use(
    pino({
      transport: {
        target: "pino-pretty",
      },
    })
  );

  app.use("*", (req, res, next) => {
    res.status(404).json({
      message: "Not found",
    });
    next();
  });

  app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
};
