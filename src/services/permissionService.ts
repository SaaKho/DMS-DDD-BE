// services/PermissionsService.ts
import { IPermissionsRepository } from "../repositories/interfaces/IPermissionRepository";
import { Either, ok, failure } from "../utils/monads";
import { Logger } from "../logging/logger";

export class PermissionsService {
  private permissionsRepository: IPermissionsRepository;
  private logger: Logger;

  constructor(permissionsRepository: IPermissionsRepository, logger: Logger) {
    this.permissionsRepository = permissionsRepository;
    this.logger = logger;
  }

  async grantPermission(
    documentId: string,
    userId: string,
    permissionType: string,
    requesterId: string,
    requesterRole: string
  ): Promise<Either<string, any>> {
    // Check if requester has admin or ownership rights
    if (requesterRole !== "Admin") {
      const ownershipCheck: any =
        await this.permissionsRepository.checkOwnership(
          documentId,
          requesterId
        );
      if (ownershipCheck.isFailure() || !ownershipCheck.value) {
        return failure("Insufficient permissions to grant access");
      }
    }

    return await this.permissionsRepository.add(
      documentId,
      userId,
      permissionType
    );
  }

  async revokePermission(
    documentId: string,
    userId: string,
    requesterId: string,
    requesterRole: string
  ): Promise<Either<string, boolean>> {
    // Check if requester has admin or ownership rights
    if (requesterRole !== "Admin") {
      const ownershipCheck: any =
        await this.permissionsRepository.checkOwnership(
          documentId,
          requesterId
        );
      if (ownershipCheck.isFailure() || !ownershipCheck.value) {
        return failure("Insufficient permissions to revoke access");
      }
    }

    return await this.permissionsRepository.remove(documentId, userId);
  }
}
