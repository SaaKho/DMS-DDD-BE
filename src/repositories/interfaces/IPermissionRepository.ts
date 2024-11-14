// repositories/interfaces/IPermissionsRepository.ts
import { Either } from "../../utils/monads";

export interface IPermissionsRepository {
  add(
    documentId: string,
    userId: string,
    permissionType: string
  ): Promise<Either<string, any>>;
  remove(
    documentId: string,
    userId: string
  ): Promise<Either<string, boolean>>;
  checkOwnership(
    documentId: string,
    requesterId: string
  ): Promise<Either<string, boolean>>;
}
