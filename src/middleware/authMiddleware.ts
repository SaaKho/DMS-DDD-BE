import { Request, Response, NextFunction } from "express";
import { jwtAuthHandler } from "../auth/authConfig";

export interface AuthenticatedRequest extends Request {
  user?: { id: string; username: string; role: string };
}

// Middleware for checking if a user is authenticated
export const AuthMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "Authorization header is missing" });
  }

  const token = authHeader.split(" ")[1];

  // Use JwtAuthHandler to verify and decode the token
  const isValid = await jwtAuthHandler.verify(token);
  if (!isValid) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }

  try {
    // Decode the token and attach user info to the request
    const decodedUser = await jwtAuthHandler.decode(token);
    req.user = decodedUser;
    next();
  } catch (error) {
    return res.status(403).json({ message: "Failed to decode token" });
  }
};

// Middleware for role-based authorization
export const authorizeRole = (role: string) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user || req.user.role !== role) {
      return res
        .status(403)
        .json({ message: `Access denied. Requires ${role} role.` });
    }
    next();
  };
};
