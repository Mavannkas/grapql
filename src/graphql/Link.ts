import { extendType, intArg, nonNull, objectType, stringArg } from "nexus";
import { NexusGenObjects } from "../nexus";

export const Link = objectType({
    name: "Link",
    definition(t) {
        t.nonNull.int("id");
        t.nonNull.string("description");
        t.nonNull.string("url");
        t.field("postedBy", {
            type: "User",
            resolve: (parent, _args, context) => {
                return context.client.link.findUnique({
                    where: { id: parent.id },
                })
                    .postedBy();
            }
        });
    },
});

let links: NexusGenObjects["Link"][] = [
    {
        id: 1,
        description: "Fullstack tutorial for GraphQL",
        url: "https://www.howtographql.com/"
    },
    {
        id: 2,
        description: "GraphQL official documentation",
        url: "https://graphql.org/",
    },
];

export const LinkQuuery = extendType({
    type: "Query",
    definition(t) {
        t.nonNull.list.nonNull.field("feed", {
            type: "Link",
            resolve: (_parent, _args, context) => context.client.link.findMany(),
        });
        t.field("link", {
            type: "Link",
            args: {
                id: nonNull(intArg()),
            },
            resolve: (_parent, args, context) => {
                return context.client.link.findUnique({
                    where: { id: args.id },
                });
            },
        });
    },
})


export const LinkMutation = extendType({
    type: "Mutation",
    definition(t) {
        t.nonNull.field("post", {
            type: "Link",
            args: {
                description: nonNull(stringArg()),
                url: nonNull(stringArg()),
            },
            resolve: (parent, args, context) => {
                return context.client.link.create({
                    data: {
                        description: args.description,
                        url: args.url,
                    },
                });
            },
        });

        t.nonNull.field("updateLink", {
            type: "Link",
            args: {
                id: nonNull(intArg()),
                description: stringArg(),
                url: stringArg(),
            },
            resolve: async (parent, args, context) => {
                const link = await context.client.link.findUnique({
                    where: { id: args.id },
                });
                if (!link) {
                    throw new Error(`Could not find link with id ${args.id}`);
                }
                if (typeof args.description === "string") {
                    link.description = args.description;
                }
                if (typeof args.url === "string") {
                    link.url = args.url;
                }
                return context.client.link.update({
                    where: { id: args.id },
                    data: link,
                });;
            }
        });

        t.nonNull.field("deleteLink", {
            type: "Link",
            args: {
                id: nonNull(intArg()),
            },
            resolve: async (parent, args, context) => {
                return context.client.link.delete({
                    where: { id: args.id },
                });;
            }
        });
    }
})