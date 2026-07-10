/**
 * Server-side client for calling STG website APIs from the
 * Command Center, authenticated with the shared service key.
 *
 * Required env vars:
 * - STG_SITE_URL          e.g. https://www.spencertechgroup.org
 * - STG_SERVICE_API_KEY   must match the site's STG_SERVICE_API_KEY
 *
 * Server-only: never import this from a client component — the
 * service key must not reach the browser.
 */

export class SiteApiError extends Error {
    readonly status: number;
    readonly code: string;

    constructor(status: number, code: string) {
        super(`Site API error ${status}: ${code}`);
        this.name = "SiteApiError";
        this.status = status;
        this.code = code;
    }
}

function getConfig() {
    const baseUrl = process.env.STG_SITE_URL?.trim().replace(/\/+$/, "");
    const apiKey = process.env.STG_SERVICE_API_KEY?.trim();

    if (!baseUrl) {
        throw new SiteApiError(0, "site_url_not_configured");
    }

    if (!apiKey) {
        throw new SiteApiError(0, "service_key_not_configured");
    }

    return { baseUrl, apiKey };
}

export async function siteApiFetch<T>(
    path: string,
    init?: Omit<RequestInit, "cache">,
): Promise<T> {
    const { baseUrl, apiKey } = getConfig();

    let response: Response;

    try {
        response = await fetch(`${baseUrl}${path}`, {
            ...init,
            cache: "no-store",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiKey}`,
                ...init?.headers,
            },
        });
    } catch {
        throw new SiteApiError(0, "site_unreachable");
    }

    const body = (await response.json().catch(() => null)) as
        | (T & { error?: string })
        | null;

    if (!response.ok) {
        throw new SiteApiError(
            response.status,
            body?.error ?? `http_${response.status}`,
        );
    }

    if (!body) {
        throw new SiteApiError(response.status, "invalid_response_body");
    }

    return body;
}
