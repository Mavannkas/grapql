import { extendType, nonNull, objectType, stringArg } from "nexus";
import * as bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";
import { APP_SECRET } from "../utils/auth";

export const AuthPayLoad = objectType({
    name: "AuthPayLoad",
    definition(t) {
        t.nonNull.string("token");
        t.nonNull.field("user", {
            type: "User",
        });
    },
});

export const AuthMutation = extendType({
    type: "Mutation",
    definition(t) {
        t.nonNull.field("signup", {
            type: "AuthPayLoad",
            args: {
                name: nonNull(stringArg()),
                email: nonNull(stringArg()),
                password: nonNull(stringArg()),
            },
            resolve: async (_parent, args, context) => {
                const {email, name} = args;
                const password = await bcrypt.hash(args.password, 10);
                const user = await context.client.user.create({
                    data: {
                        email,
                        name,
                        password,
                    },
                });

                const token = jwt.sign({userId: user.id}, APP_SECRET);
                return {
                    token,
                    user,
                };
            },
        });

        t.nonNull.field("login", {
            type: "AuthPayLoad",
            args: {
                email: nonNull(stringArg()),
                password: nonNull(stringArg()),
            },
            resolve: async (_parent, args, context) => {
                const {email, password} = args;
                const user = await context.client.user.findUnique({
                    where: {email},
                });
                if (!user) {
                    throw new Error(`No user found for email: ${email}`);
                }

                const valid = await bcrypt.compare(password, user.password);
                if (!valid) {
                    throw new Error("Invalid password");
                }

                const token = jwt.sign({userId: user.id}, APP_SECRET);
                return {
                    token,
                    user,
                };
            }
        });
    },
});
