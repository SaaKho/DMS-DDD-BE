import { IPermissionsRepository } from "../repositories/interfaces/IPermissionRepository";
import { Either, ok, failure } from "../utils/monads";
import { Logger } from "../logging/logger";
import { PermissionFactory } from "../factories/PermissionFactory";

export class PermissionsService {
  constructor(
    private permissionsRepository: IPermissionsRepository,
    private logger: Logger
  ) {}

  async grantPermission(
    documentId: string,
    userId: string,
    permissionType: string,
    requesterId: string,
    requesterRole: string
  ): Promise<Either<string, any>> {
    // Verify requester permissions
    if (requesterRole !== "Admin") {
      const ownershipCheck = await this.permissionsRepository.checkOwnership(
        documentId,
        requesterId
      );
      if (ownershipCheck.isFailure() || !ownershipCheck.value) {
        return failure("Insufficient permissions to grant access");
      }
    }

    // Create a Permission entity
    const permission = PermissionFactory.create(
      documentId,
      userId,
      permissionType
    );

    // Persist the entity
    return await this.permissionsRepository.add(permission);
  }

  async revokePermission(
    documentId: string,
    userId: string,
    requesterId: string,
    requesterRole: string
  ): Promise<Either<string, boolean>> {
    // Verify requester permissions
    if (requesterRole !== "Admin") {
      const ownershipCheck = await this.permissionsRepository.checkOwnership(
        documentId,
        requesterId
      );
      if (ownershipCheck.isFailure() || !ownershipCheck.value) {
        return failure("Insufficient permissions to revoke access");
      }
    }

    // Create a Permission entity
    const permission = PermissionFactory.create(documentId, userId, ""); // Type not needed

    // Remove the entity
    return await this.permissionsRepository.remove(permission);
  }
}
