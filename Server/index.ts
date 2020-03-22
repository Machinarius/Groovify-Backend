import * as Koa from "koa";
import * as dotenv from "dotenv";
import { OAuth2Client, LoginTicket } from "google-auth-library";

dotenv.config();

let googleOauthClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
let app = new Koa();

app.use(async (ctx, next) => {
    let authHeaderValue = ctx.request.header["authorization"] as string;
    if (!authHeaderValue) {
        ctx.response.status = 401;
        ctx.response.body = "Not Authorized";
        return;
    }

    let jwtString = authHeaderValue.substr("Bearear ".length - 1);
    if (!jwtString) {
        ctx.response.status = 401;
        ctx.response.body = "Not Authorized";
        return;
    }

    var ticket: LoginTicket;
    try {
        ticket = await googleOauthClient.verifyIdToken({
            idToken: jwtString,
            audience: process.env.GOOGLE_CLIENT_ID
        });
    } catch (ex) {
        console.log("Error verifying idToken", ex);

        ctx.response.status = 401;
        ctx.response.body = "Not Authorized";
        return;        
    }

    await next();
});

app.use(ctx => {
    ctx.response.status = 200;
    ctx.response.body = "Authenticated";
});

app.listen(3000);