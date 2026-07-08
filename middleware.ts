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

export function middleware(request: NextRequest) {
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

    const encodedCredentials = authHeader.split(" ")[1];
    const decodedCredentials = atob(encodedCredentials);
    const [providedUsername, providedPassword] = decodedCredentials.split(":");

    const isValid =
        providedUsername === username && providedPassword === password;

    if (!isValid) {
        return unauthorized();
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|manifest.json|icons).*)",
    ],
};