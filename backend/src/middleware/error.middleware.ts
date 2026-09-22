import { type Request, type Response, type NextFunction } from "express";

export const errorMiddleware = (
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  console.error(error);

  return res.status(500).json({
    message: "Internal server error.",
  });
};
