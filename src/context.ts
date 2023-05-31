import { PrismaClient } from "@prisma/client";
import { decodeAuthHeader } from "./utils/auth";
import { Request } from "express";  

export const client = new PrismaClient();

export interface Context {
    client: PrismaClient;
    userId?: number;
}

export function context({req}: {req: Request}): Context {
    console.log(req?.headers?.authorization);
    const token = decodeAuthHeader(req?.headers?.authorization || "")
    return {
        client,
        userId: token?.userId,
    };
}