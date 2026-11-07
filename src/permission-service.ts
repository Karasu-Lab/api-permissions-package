import { parsePermissionId } from "./permission";
import type {
    PermissionRecord,
    PermissionRepository,
} from "./permission-repository";
import type { PermissionSummary } from "./types";

export class UnknownPermissionError extends Error {}

function toSummary(record: PermissionRecord): PermissionSummary | null {
    const definition = parsePermissionId(record.publicId);
    if (!definition) return null;
    return {
        publicId: definition.publicId,
        operation: definition.operation,
        resource: definition.resource,
        action: definition.action,
    };
}

function toSummaries(
    records: readonly PermissionRecord[],
): PermissionSummary[] {
    return records
        .map(toSummary)
        .filter((summary): summary is PermissionSummary => summary !== null);
}

export class PermissionService {
    private readonly repository: PermissionRepository;

    constructor(repository: PermissionRepository) {
        this.repository = repository;
    }

    async listActivePermissions(): Promise<PermissionSummary[]> {
        return toSummaries(await this.repository.findActive());
    }

    async listOperationPermissions(
        operation: string,
    ): Promise<PermissionSummary[]> {
        const summaries = await this.listActivePermissions();
        return summaries.filter((summary) => summary.operation === operation);
    }

    async grant(
        apiKeyId: string,
        publicIds: readonly string[],
    ): Promise<PermissionSummary[]> {
        const uniquePublicIds = [...new Set(publicIds)];
        const records =
            uniquePublicIds.length === 0
                ? []
                : await this.repository.findActiveByPublicIds(uniquePublicIds);
        if (records.length !== uniquePublicIds.length)
            throw new UnknownPermissionError();
        if (records.length > 0)
            await this.repository.grant(
                apiKeyId,
                records.map((record) => record.id),
            );
        return toSummaries(records);
    }

    async setGranted(
        apiKeyId: string,
        publicIds: readonly string[],
    ): Promise<PermissionSummary[]> {
        const uniquePublicIds = [...new Set(publicIds)];
        const records =
            uniquePublicIds.length === 0
                ? []
                : await this.repository.findActiveByPublicIds(uniquePublicIds);
        if (records.length !== uniquePublicIds.length)
            throw new UnknownPermissionError();
        await this.repository.replaceGranted(
            apiKeyId,
            records.map((record) => record.id),
        );
        return toSummaries(records);
    }

    async getGrantedPermissions(
        apiKeyIds: readonly string[],
    ): Promise<Map<string, PermissionSummary[]>> {
        const granted = new Map<string, PermissionSummary[]>();
        if (apiKeyIds.length === 0) return granted;

        for (const {
            apiKeyId,
            permission,
        } of await this.repository.findGranted(apiKeyIds)) {
            const summary = toSummary(permission);
            if (!summary) continue;
            granted.set(apiKeyId, [...(granted.get(apiKeyId) ?? []), summary]);
        }
        return granted;
    }

    async resolve(apiKeyId: string): Promise<string[]> {
        const granted =
            (await this.getGrantedPermissions([apiKeyId])).get(apiKeyId) ?? [];
        return granted.map((summary) => summary.publicId);
    }
}
