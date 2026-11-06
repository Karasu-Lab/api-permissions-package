export interface PermissionDefinition {
    publicId: string;
    operation: string;
    name: string;
    resource: string;
    action: string;
}

const PUBLIC_ID_PATTERN = /^([a-z0-9-]+):([a-z0-9-]+)\.([a-z0-9-]+)$/;

export function parsePermissionId(
    publicId: string,
): PermissionDefinition | null {
    const match = PUBLIC_ID_PATTERN.exec(publicId);
    if (!match) return null;
    const [, operation, name, action] = match;
    return {
        publicId,
        operation,
        name,
        resource: `${operation}.${name}`,
        action,
    };
}

export function permissionIdWithinOperation(
    definition: PermissionDefinition,
): string {
    return `${definition.name}.${definition.action}`;
}
