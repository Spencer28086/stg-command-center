// middleware.ts
import { NextRequest, NextResponse } from "next/server";

function unauthorized() {
    return new NextResponse("Authentication required", {
        status: 401,
        headers: {
            "WWW-Authenticate": 'Basic realm="STG Command Center"',
        },
    });
}

/**
 * Hash a string to a fixed-length SHA-256 digest using Web Crypto,
 * which is available in the Edge runtime (no Node crypto required).
 *
 * Hashing both sides before comparing normalizes length, so the
 * comparison below leaks no information about the real credential's
 * length or contents.
 */
async function sha256(value: string): Promise<Uint8Array> {
    const data = new TextEncoder().encode(value);
    const digest = await crypto.subtle.digest("SHA-256", data);
    return new Uint8Array(digest);
}

/**
 * Constant-time comparison of two equal-length byte arrays.
 * XOR-accumulates every byte so execution time does not depend
 * on where the first mismatch occurs.
 */
function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
    if (a.length !== b.length) {
        return false;
    }

    let diff = 0;
    for (let i = 0; i < a.length; i++) {
        diff |= a[i] ^ b[i];
    }

    return diff === 0;
}

async function credentialsMatch(
    provided: string,
    expected: string,
): Promise<boolean> {
    const [providedHash, expectedHash] = await Promise.all([
        sha256(provided),
        sha256(expected),
    ]);

    return timingSafeEqual(providedHash, expectedHash);
}

export async function middleware(request: NextRequest) {
    const username = process.env.COMMAND_CENTER_USER;
    const password = process.env.COMMAND_CENTER_PASSWORD;

    if (!username || !password) {
        return new NextResponse("Command Center credentials are not configured.", {
            status: 500,
        });
    }

    const authHeader = request.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Basic ")) {
        return unauthorized();
    }

    let decodedCredentials: string;

    try {
        decodedCredentials = atob(authHeader.split(" ")[1] ?? "");
    } catch {
        // Malformed base64 in the Authorization header.
        return unauthorized();
    }

    // Split on the FIRST colon only, so passwords containing ":" work.
    const separatorIndex = decodedCredentials.indexOf(":");

    if (separatorIndex === -1) {
        return unauthorized();
    }

    const providedUsername = decodedCredentials.slice(0, separatorIndex);
    const providedPassword = decodedCredentials.slice(separatorIndex + 1);

    // Always evaluate BOTH checks (no short-circuit) so a request with
    // a wrong username takes the same time as one with a wrong password.
    const [usernameValid, passwordValid] = await Promise.all([
        credentialsMatch(providedUsername, username),
        credentialsMatch(providedPassword, password),
    ]);

    if (!usernameValid || !passwordValid) {
        return unauthorized();
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|manifest.json|icons).*)",
    ],
};
