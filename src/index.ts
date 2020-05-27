import * as Koa from "koa";
import * as dotenv from "dotenv";
dotenv.config();

import "core-js/features/reflect";
import { container as rootContainer } from "tsyringe";

import ApolloServerFactory from "./GraphQLTypes/ApolloServerFactory";

import DependencyRegistry from "./DependencyRegistry";
DependencyRegistry.registerTypes(rootContainer);

import AuthenticationMiddleware from "./Authentication/AuthenticationMiddleware";
let authMiddleware = rootContainer.resolve(AuthenticationMiddleware);

let app = new Koa();
let ApolloServer = ApolloServerFactory({});

app.use(authMiddleware.validateJWTToken);
ApolloServer.applyMiddleware({ app });
app.use(async (context, next) => {
    if (context.path == "/") {
        context.redirect(ApolloServer.graphqlPath);
        return;
    }

    await next();
});

let port = process.env.PORT || 3000;
app.listen({ port }, () => {
    console.log("Listening on port " + port);
    console.log("Apollo available on " + ApolloServer.graphqlPath);
});