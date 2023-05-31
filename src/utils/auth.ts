import { verify } from "jsonwebtoken";

export const APP_SECRET = "GraphQL-is-aw3some";

export interface AuthTokenPayload {
    userId: number;
}

export function decodeAuthHeader(authHeader: String): AuthTokenPayload | null {
    const token = authHeader.replace("Bearer ", "");
    if(!token) return null;
    const decoded = verify(token, APP_SECRET) as AuthTokenPayload;
    return decoded;
}