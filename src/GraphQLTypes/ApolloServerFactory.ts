import * as fs from "fs";
import * as path from "path";
import { ApolloServer, gql, IResolvers } from "apollo-server-koa";

let gqlFiles = fs.readdirSync(__dirname)
    .filter(filename => filename.endsWith(".gql"))
    .map(filename => path.join(__dirname, filename))
    .map(filename => fs.readFileSync(filename, "utf-8"));
let schemaText = gqlFiles
    .reduce((aggregate, current) => aggregate.concat(current + "\n\n"), "")
    .trimRight();
let schema = gql(schemaText);

let serverFactory = (resolvers: IResolvers<any, any> | IResolvers<any, any>[]) => 
    new ApolloServer({ 
        typeDefs: schema,
        resolvers,
        context: (config) => {
            let authTicket = config.ctx.state.authTicket;
            return { authTicket };
        }
    });

export default serverFactory;
