// repositories/implementations/PermissionsRepository.ts
import { IPermissionsRepository } from "../interfaces/IPermissionRepository";
import { db, permissions } from "../../drizzle/schema";
import { v4 as uuidv4 } from "uuid";
import { Either, ok, failure } from "../../utils/monads";
import { eq, and } from "drizzle-orm";

export class PermissionsRepository implements IPermissionsRepository {
  async add(
    documentId: string,
    userId: string,
    permissionType: string
  ): Promise<Either<string, any>> {
    try {
      const newPermission = await db
        .insert(permissions)
        .values({
          id: uuidv4(),
          documentId,
          userId,
          permissionType,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning()
        .execute();

      return ok(newPermission[0]);
    } catch (error) {
      return failure("Failed to grant permission");
    }
  }

  async remove(
    documentId: string,
    userId: string
  ): Promise<Either<string, boolean>> {
    try {
      const deleteResult = await db
        .delete(permissions)
        .where(
          and(
            eq(permissions.documentId, documentId),
            eq(permissions.userId, userId)
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
}
