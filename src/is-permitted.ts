import { parsePermissionId, type PermissionDefinition } from "./permission";
import type { RouteAuthContext } from "./types";

export function toOauthScope(
    permission: Pick<PermissionDefinition, "action" | "resource">,
): string {
    return `${permission.action}:${permission.resource}`;
}

export function isPermitted(
    auth: RouteAuthContext,
    publicId: string,
): boolean {
    if (auth.authMethod === "session") return true;
    if (auth.authMethod === "apiKey")
        return auth.permissionIds?.includes(publicId) ?? false;
    const definition = parsePermissionId(publicId);
    if (!definition) return false;
    return auth.scopes?.includes(toOauthScope(definition)) ?? false;
}
