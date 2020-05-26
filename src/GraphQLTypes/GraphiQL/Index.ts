import * as fs from "fs";
import * as path from "path";
import * as Koa from "koa";

let viewTemplate = fs.readFileSync(path.join(__dirname, "Index.html"), "utf-8");
function GraphiQLMiddlewareFactory(graphqlEndpoint: string) : Koa.Middleware {
    let viewText = viewTemplate.replace("{GRAPHQL_PATH}", graphqlEndpoint);
    return function GraphiQLViewMiddleware(context: Koa.Context, next: Koa.Next) {
        context.response.body = viewText;
        context.set("Content-Type", "text/html; charset=UTF-8;");
    };
};

export default GraphiQLMiddlewareFactory;