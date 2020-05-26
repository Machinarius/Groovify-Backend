import * as Koa from "koa";
import { injectable, inject } from "tsyringe";

import IJWTValidationBackend from "./IJWTValidationBackend";

@injectable()
export default class AuthenticationMiddleware {
    constructor(
        // TODO: Find a way to make this name type-safe
        @inject("IJWTValidationBackend") private backend: IJWTValidationBackend
    ) {
        if (!backend) {
            throw new Error("The backend parameter requires a value");
        }

        this.validateJWTToken = this.validateJWTToken.bind(this);
        this.rejectRequest = this.rejectRequest.bind(this);
    }

    public async validateJWTToken(context: Koa.Context, next: Koa.Next): Promise<void> {
        let authHeaderValue = context.request.header["authorization"] as string;
        if (!authHeaderValue) {
            this.rejectRequest(context.response);
            return;
        }

        if (!authHeaderValue.startsWith("Bearer")) {
            this.rejectRequest(context.response);
            return;
        }

        let jwtString = authHeaderValue.substr("Bearer ".length);
        let jwtValidated = await this.backend.validateJWTString(jwtString);
        if (!jwtValidated) {
            this.rejectRequest(context.response);
            return;
        }
        
        await next();
    }

    private rejectRequest(response: Koa.Response) {
        response.status = 401;
        response.body = "Not Authorized";
    }
}