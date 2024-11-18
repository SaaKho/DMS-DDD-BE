// src/repositories/implementations/PermissionsRepository.ts
import { IPermissionsRepository } from "../interfaces/IPermissionRepository";
import { db, permissions } from "../../drizzle/schema";
import { Either, ok, failure } from "../../utils/monads";
import { eq, and } from "drizzle-orm";
import { Permission } from "../../entities/Permission";
import { PermissionFactory } from "../../factories/PermissionFactory";

export class PermissionsRepository implements IPermissionsRepository {
  async add(permission: Permission): Promise<Either<string, Permission>> {
    try {
      const result = await db
        .insert(permissions)
        .values({
          id: permission.getId(),
          documentId: permission.getDocumentId(),
          userId: permission.getUserId(),
          permissionType: permission.getPermissionType(),
          createdAt: permission.getCreatedAt(),
          updatedAt: permission.getUpdatedAt(),
        })
        .returning()
        .execute();

      const createdPermission = result[0];
      return ok(
        PermissionFactory.create(
          createdPermission.documentId,
          createdPermission.userId,
          createdPermission.permissionType,
          createdPermission.id,
          createdPermission.createdAt,
          createdPermission.updatedAt
        )
      );
    } catch (error) {
      return failure("Failed to grant permission");
    }
  }

  async remove(permission: Permission): Promise<Either<string, boolean>> {
    try {
      const deleteResult = await db
        .delete(permissions)
        .where(
          and(
            eq(permissions.documentId, permission.getDocumentId()),
            eq(permissions.userId, permission.getUserId())
          )
        )
        .execute();

      return ok((deleteResult.rowCount ?? 0) > 0);
    } catch (error) {
      return failure("Failed to revoke permission");
    }
  }

  async checkOwnership(
    documentId: string,
    requesterId: string
  ): Promise<Either<string, boolean>> {
    try {
      const result = await db
        .select()
        .from(permissions)
        .where(
          and(
            eq(permissions.documentId, documentId),
            eq(permissions.userId, requesterId),
            eq(permissions.permissionType, "Owner")
          )
        )
        .execute();

      return ok(result.length > 0);
    } catch (error) {
      return failure("Failed to check ownership");
    }
  }

  async assignPermission(
    permission: Permission
  ): Promise<Either<string, Permission>> {
    try {
      const result = await db
        .insert(permissions)
        .values({
          id: permission.getId(),
          documentId: permission.getDocumentId(),
          userId: permission.getUserId(),
          permissionType: permission.getPermissionType(),
          createdAt: permission.getCreatedAt(),
          updatedAt: permission.getUpdatedAt(),
        })
        .returning()
        .execute();

      const createdPermission = result[0];
      return ok(
        PermissionFactory.create(
          createdPermission.documentId,
          createdPermission.userId,
          createdPermission.permissionType,
          createdPermission.id,
          createdPermission.createdAt,
          createdPermission.updatedAt
        )
      );
    } catch (error) {
      return failure("Failed to assign permission");
    }
  }

  async fetchUserPermission(
    permission: Permission
  ): Promise<Either<string, Permission | null>> {
    try {
      const result = await db
        .select()
        .from(permissions)
        .where(
          and(
            eq(permissions.documentId, permission.getDocumentId()),
            eq(permissions.userId, permission.getUserId()),
            eq(permissions.permissionType, permission.getPermissionType())
          )
        )
        .execute();

      if (result.length === 0) return ok(null);

      const fetchedPermission = result[0];
      return ok(
        PermissionFactory.create(
          fetchedPermission.documentId,
          fetchedPermission.userId,
          fetchedPermission.permissionType,
          fetchedPermission.id,
          fetchedPermission.createdAt,
          fetchedPermission.updatedAt
        )
      );
    } catch (error) {
      return failure("Failed to fetch user permissions");
    }
  }
}
