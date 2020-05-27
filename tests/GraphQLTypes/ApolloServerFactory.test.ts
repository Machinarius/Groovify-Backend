import * as Koa from "koa";
import * as request from "supertest";
import { IResolvers } from "apollo-server-koa";

import { expect } from "chai"; 

import ApolloServerFactory from "../../src/GraphQLTypes/ApolloServerFactory";
import AuthenticationTicket from "../../src/Authentication/AuthenticationTicket";

describe("ApolloServerFactory", () => {
    it("Must take the authentication ticket from the Koa context and attach it to the GQL context", async () => {
        let fakeTicket: AuthenticationTicket = {
            emailAddress: "asd@asd.com",
            expirationDate: new Date(),
            pictureURI: "http://asd.asd/asd.jpg",
            name: "ASD User",
            id: "asd"
        };

        let fakeResolvers: IResolvers<any, any> = {
            Query: {
                me: (_parent, _args, context) => {
                    return context.authTicket;
                }
            } 
        };

        let app = new Koa();
        app.use(async (context, next) => {
            // Simulate a user having sent a proper auth header
            context.state.authTicket = fakeTicket;
            await next();
        });

        let middleware = ApolloServerFactory(fakeResolvers);
        middleware.applyMiddleware({ app });

        let response = await request(app.callback())
            .post("/graphql")
            .set("Content-Type", "application/json")
            .set("Accept", "application/json")
            .send(JSON.stringify({
                query: "query Me { me { id, name, emailAddress, pictureURI } }"
            }));
        
        expect(response.status).to.equal(200);
        expect(response.header["content-type"]).to.equal("application/json");
        
        let expectedResponse = {
            id: fakeTicket.id,
            name: fakeTicket.name,
            emailAddress: fakeTicket.emailAddress,
            pictureURI: fakeTicket.pictureURI
        };
        expect(response.body.data.me).to.deep.equal(expectedResponse);
    });
});