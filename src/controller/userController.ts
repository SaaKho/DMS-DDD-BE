// userController.ts
import { Request, Response } from "express";
import { registerSchema, loginSchema } from "../validation/authvalidation";
import { UserRole } from "../drizzle/schema";
import { UserService } from "../services/userService"; // Assume userService is instantiated with DI
import { UserRepository } from "../repositories/implementations/userRepository";
import { ConsoleLogger } from "../logging/console.logger";

const userRepository = new UserRepository();
const logger = new ConsoleLogger();
const userService = new UserService(userRepository, logger);

class UserController {
  private static handleResponse(
    res: Response,
    result: any,
    successStatus = 200,
    successMessage?: string
  ) {
    if (result.isFailure()) {
      return res.status(500).json({ error: result.value });
    }
    if (!result.value) {
      return res.status(404).json({ message: "User not found" });
    }
    const responseContent = successMessage
      ? { message: successMessage }
      : result.value;
    return res.status(successStatus).json(responseContent);
  }

  static registerUser = async (req: Request, res: Response) => {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ errors: parsed.error.errors });
    }

    const { username, email, password } = parsed.data;
    const result = await userService.registerUser(
      username,
      email,
      password,
      UserRole.User
    );
    UserController.handleResponse(
      res,
      result,
      201,
      "User registered successfully"
    );
  };

  static loginUser = async (req: Request, res: Response) => {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ errors: parsed.error.errors });
    }

    const { username, password } = parsed.data;
    const result: any = await userService.loginUser(username, password);

    if (result.isFailure()) {
      return res.status(500).json({ error: result.value });
    }

    // Wrap the token in a JSON object
    return res.status(200).json({ token: result.value });
  };

  static updateUser = async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await userService.updateUser(id, req.body);
    UserController.handleResponse(
      res,
      result,
      200,
      "User updated successfully"
    );
  };
  static async getPaginatedUsers(req: Request, res: Response): Promise<void> {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result: any = await userService.getPaginatedUsers(page, limit);

    if (result.isFailure()) {
      res.status(500).json({ error: result.value });
    } else {
      res.json(result.value);
    }
  }

  static deleteUser = async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await userService.deleteUser(id);
    UserController.handleResponse(res, result, 204);
  };
}

export default UserController;
