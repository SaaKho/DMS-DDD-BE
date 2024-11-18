import { IUserRepository } from "../repositories/interfaces/IUserRepository";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { UserRole } from "../drizzle/schema";
import { Logger } from "../logging/logger";
import { Either, ok, failure } from "../utils/monads";
import { Pagination } from "../utils/Pagination";
import { User } from "../entities/User";
import { UserFactory } from "../factories/UserFactory";
import config from "./../utils/config";

export class UserService {
  constructor(
    private userRepository: IUserRepository,
    private logger: Logger
  ) {}

  async registerUser(
    username: string,
    email: string,
    password: string,
    role: UserRole
  ): Promise<Either<string, User>> {
    this.logger.log("Registering user");

    const hashedPassword = await bcrypt.hash(password, 10);

    // Create User entity
    const user = UserFactory.create(username, email, hashedPassword, role);

    return await this.userRepository.add(user);
  }

  async loginUser(
    username: string,
    password: string
  ): Promise<Either<string, string>> {
    const userResult = await this.userRepository.fetchByUsername(username);

    if (userResult.isFailure()) return failure(userResult.value);

    const user = userResult.value;

    if (!user || !(await bcrypt.compare(password, user.getHashedPassword()))) {
      return failure("Invalid username or password");
    }

    const token = this.generateToken(user);
    return ok(token);
  }

  async getPaginatedUsers(
    page: number,
    limit: number
  ): Promise<Either<string, Pagination<User>>> {
    const usersResult = await this.userRepository.fetchAll();

    if (usersResult.isFailure()) {
      return failure(usersResult.value);
    }

    const users = usersResult.value;
    const pagination = new Pagination(users, users.length, page, limit);

    return ok(pagination);
  }

  async updateUser(
    id: string,
    data: Partial<{
      username: string;
      email: string;
      password: string;
      role: UserRole;
    }>
  ): Promise<Either<string, User | null>> {
    const userResult = await this.userRepository.fetchById(id);

    if (userResult.isFailure() || !userResult.value) {
      return failure("User not found");
    }

    const user = userResult.value;

    // Update fields conditionally
    const updatedUser = new User(
      data.username || user.getUsername(),
      data.email || user.getEmail(),
      data.password ? await bcrypt.hash(data.password, 10) : user.getHashedPassword(),
      data.role || user.getRole(),
      user.getId(),
      user.getCreatedAt()
    );

    return await this.userRepository.update(updatedUser);
  }

  async deleteUser(id: string): Promise<Either<string, boolean>> {
    return await this.userRepository.remove(id);
  }

  private generateToken(user: User): string {
    const JWT_SECRET = config.jwtSecret;
    return jwt.sign(
      { id: user.getId(), username: user.getUsername(), role: user.getRole() },
      JWT_SECRET,
      { expiresIn: "1h" }
    );
  }
}
