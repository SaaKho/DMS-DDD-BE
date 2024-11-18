import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { IAuthHandler } from "../auth/IAuthHandler";
import { IUserRepository } from "../repositories/interfaces/IUserRepository";
import config from "../utils/config";

const JWT_SECRET = config.jwtSecret;

export class JwtAuthHandler implements IAuthHandler {
  private userRepository: IUserRepository;

  constructor(userRepository: IUserRepository) {
    this.userRepository = userRepository;
  }
  async login(username: string, password: string): Promise<string> {
    // Fetch the user by username
    const userResult = await this.userRepository.fetchByUsername(username);

    // Check if the user was found and if the password matches
    if (userResult.isFailure() || !userResult.value) {
      throw new Error("Invalid username or password");
    }

    const user = userResult.value;

    // Compare provided password with the stored hashed password
    const isPasswordValid = await bcrypt.compare(
      password,
      user.getHashedPassword()
    );
    if (!isPasswordValid) {
      throw new Error("Invalid username or password");
    }

    // Generate a JWT token if credentials are valid
    const token = jwt.sign(
      { id: user.getId(), username: user.getUsername(), role: user.getRole() },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    return token;
  }

  async verify(token: string): Promise<boolean> {
    try {
      jwt.verify(token, JWT_SECRET);
      return true;
    } catch {
      return false;
    }
  }

  async decode(
    token: string
  ): Promise<{ id: string; username: string; role: string }> {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string;
      username: string;
      role: string;
    };
    return decoded;
  }
}
