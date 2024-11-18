// src/repositories/interfaces/IPermissionsRepository.ts
import { Either } from "../../utils/monads";
import { Permission } from "../../entities/Permission";

export interface IPermissionsRepository {
  add(permission: Permission): Promise<Either<string, Permission>>;
  remove(permission: Permission): Promise<Either<string, boolean>>;
  checkOwnership(
    documentId: string,
    requesterId: string
  ): Promise<Either<string, boolean>>;
  assignPermission(permission: Permission): Promise<Either<string, Permission>>;
  fetchUserPermission(
    permission: Permission
  ): Promise<Either<string, Permission | null>>;
}
