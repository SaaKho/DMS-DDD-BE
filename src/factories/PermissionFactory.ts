import { Permission } from "../entities/Permission";

export class PermissionFactory {
  static create(
    documentId: string,
    userId: string,
    permissionType: string,
    id?: string,
    createdAt?: Date | null,
    updatedAt?: Date | null
  ): Permission {
    return new Permission(
      documentId,
      userId,
      permissionType,
      id,
      createdAt || undefined,
      updatedAt || undefined
    );
  }
}
