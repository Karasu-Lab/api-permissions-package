export type RouteAuthMethod = "apiKey" | "oauthApp" | "session";

export interface RouteAuthContext {
    userId: string;
    authMethod: RouteAuthMethod;
    permissionIds: string[] | null;
    scopes: string[] | null;
}

export interface TokenValidator {
    validateApiKey(
        token: string,
    ): Promise<{ userId: string; permissionIds: string[] } | null>;
    validateOauthToken(
        token: string,
    ): Promise<{ userId: string; scopes: string[] } | null>;
}

export interface PermissionSummary {
    publicId: string;
    operation: string;
    resource: string;
    action: string;
}

export interface ApiKeySummary {
    id: string;
    name: string | null;
    start: string | null;
    createdAt: string;
    lastRequest: string | null;
    permissions: PermissionSummary[];
}

export interface ApiKeyCreated extends ApiKeySummary {
    key: string;
}
