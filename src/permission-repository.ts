export interface PermissionRecord {
    id: string;
    publicId: string;
}

export interface GrantedPermissionRecord {
    apiKeyId: string;
    permission: PermissionRecord;
}

export interface PermissionRepository {
    findActive(): Promise<PermissionRecord[]>;
    findActiveByPublicIds(
        publicIds: readonly string[],
    ): Promise<PermissionRecord[]>;
    grant(apiKeyId: string, permissionIds: readonly string[]): Promise<void>;
    replaceGranted(
        apiKeyId: string,
        permissionIds: readonly string[],
    ): Promise<void>;
    findGranted(
        apiKeyIds: readonly string[],
    ): Promise<GrantedPermissionRecord[]>;
}
