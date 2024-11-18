// src/config/appConfig.ts
import { JwtAuthHandler } from "../auth/JWTAuthHandler";
import { UserRepository } from "../repositories/implementations/userRepository";

const userRepository = new UserRepository();
const jwtAuthHandler = new JwtAuthHandler(userRepository);

export { jwtAuthHandler };
