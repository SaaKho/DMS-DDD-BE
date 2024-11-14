// userService.ts
import { IUserRepository } from "../repositories/interfaces/IUserRepository";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { UserRole } from "../drizzle/schema";
import { Logger } from "../logging/logger";
import { Either, ok, failure } from "../utils/monads";
import { Pagination } from "../utils/Pagination";

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
  ): Promise<Either<string, any>> {
    this.logger.log("Registering user");
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await this.userRepository.add(
      username,
      email,
      hashedPassword,
      role
    );
    return result.isFailure()
      ? failure(result.value)
      : ok({ message: "User registered successfully" });
  }
  async getPaginatedUsers(
    page: number,
    limit: number
  ): Promise<Either<string, any>> {
    const usersResult:any = await this.userRepository.fetchAll();
    if (usersResult.isFailure()) {
      return failure(usersResult.value);
    }

    const users = usersResult.value;
    const pagination = new Pagination(users, users.length, page, limit);
    const paginatedData = pagination.getPaginatedData();

    return ok(paginatedData);
  }

  async loginUser(
    username: string,
    password: string
  ): Promise<Either<string, string>> {
    const userResult: any = await this.userRepository.fetchByUsername(username);
    if (userResult.isFailure()) return failure(userResult.value);

    const user = userResult.value;
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return failure("Invalid username or password");
    }

    const token = this.generateToken(user);
    return ok(token);
  }

  async updateUser(
    id: string,
    data: Partial<{
      username: string;
      email: string;
      password: string;
      role: UserRole;
    }>
  ): Promise<Either<string, any | null>> {
    const hashedPassword: any = data.password
      ? await bcrypt.hash(data.password, 10)
      : undefined;
    const result: any = await this.userRepository.update(
      id,
      data.username,
      data.email,
      hashedPassword,
      data.role
    );
    return result.isOk()
      ? ok({ message: "User updated successfully" })
      : failure(result.value);
  }

  async deleteUser(id: string): Promise<Either<string, boolean>> {
    const result: any = await this.userRepository.remove(id);
    return result.isFailure() ? failure(result.value) : ok(result.value);
  }

  private generateToken(user: {
    id: string;
    username: string;
    role: UserRole;
  }): string {
    const JWT_SECRET = process.env.JWT_SECRET || "carbonteq";
    return jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: "1h" }
    );
  }
}
export default UserService;
