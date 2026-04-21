import { AUTH_ERROR_CODES } from "@hostely/shared";
import { AppError } from "../../utils/AppError.js";
import { signJwt } from "../../utils/jwt.js";
import { comparePassword, hashPassword } from "../../utils/password.js";
import type { IUserRepository } from "../user/user.repository.js";
import { userRepository } from "../user/user.repository.js";
import type { PublicUser } from "../user/user.types.js";
import type { LoginInput, RegisterInput } from "./auth.validator.js";

export interface AuthResult {
  /** JWT — consumed by the controller to set the session cookie. */
  token: string;
  user: PublicUser;
}

/**
 * Business rules:
 *  - Unique email + rollNo.
 *  - Email domain allow-list enforced by the validator, not here.
 *  - Login requires matching department + hostelName (campus-scoped).
 *  - Passwords are never returned.
 */
export class AuthService {
  constructor(private readonly users: IUserRepository) {}

  async register(input: RegisterInput): Promise<AuthResult> {
    if (await this.users.existsByEmailOrRollNo(input.email, input.rollNo)) {
      throw AppError.conflict("Email or roll number already registered");
    }
    const passwordHash = await hashPassword(input.password);
    const user = await this.users.create({
      name: input.name,
      email: input.email,
      rollNo: input.rollNo,
      department: input.department,
      hostelName: input.hostelName,
      passwordHash,
    });
    return { token: this.issueToken(user), user };
  }

  async login(input: LoginInput): Promise<AuthResult> {
    const doc = input.email
      ? await this.users.findByEmailWithPassword(input.email)
      : await this.users.findByRollNoWithPassword(input.rollNo!);

    // Uniform error to avoid account enumeration.
    const invalid = new AppError("Invalid credentials", 401, AUTH_ERROR_CODES.INVALID_CREDENTIALS);
    if (!doc) throw invalid;

    const passwordOk = await comparePassword(input.password, doc.passwordHash);
    if (!passwordOk) throw invalid;

    if (
      doc.department.toLowerCase() !== input.department.toLowerCase() ||
      doc.hostelName.toLowerCase() !== input.hostelName.toLowerCase()
    ) {
      throw new AppError(
        "Profile details do not match our records",
        401,
        AUTH_ERROR_CODES.PROFILE_MISMATCH,
      );
    }

    const user: PublicUser = {
      id: doc.id as string,
      name: doc.name,
      email: doc.email,
      rollNo: doc.rollNo,
      department: doc.department,
      hostelName: doc.hostelName,
      role: doc.role as PublicUser["role"],
      avatarUrl: doc.avatarUrl ?? undefined,
      createdAt: doc.createdAt?.toISOString?.() ?? new Date().toISOString(),
      updatedAt: doc.updatedAt?.toISOString?.() ?? new Date().toISOString(),
    };
    return { token: this.issueToken(user), user };
  }

  async me(userId: string): Promise<PublicUser> {
    const user = await this.users.findById(userId);
    if (!user) throw AppError.notFound("User not found");
    return user;
  }

  private issueToken(user: PublicUser): string {
    return signJwt({ sub: user.id, email: user.email, role: user.role });
  }
}

export const authService = new AuthService(userRepository);
