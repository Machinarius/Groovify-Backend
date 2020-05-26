import * as Koa from "koa";
import * as dotenv from "dotenv";
dotenv.config();

import "core-js/features/reflect";
import { container as rootContainer } from "tsyringe";

import DependencyRegistry from "./DependencyRegistry";
DependencyRegistry.registerTypes(rootContainer);

import AuthenticationMiddleware from "./Authentication/AuthenticationMiddleware";
let authMiddleware = rootContainer.resolve(AuthenticationMiddleware);

let app = new Koa();
app.use(authMiddleware.validateJWTToken);

app.use(ctx => {
    ctx.response.status = 200;
    ctx.response.body = "Authenticated";
});

let port = process.env.PORT || 3000;
console.log("Listening on port " + port);
app.listen(port);