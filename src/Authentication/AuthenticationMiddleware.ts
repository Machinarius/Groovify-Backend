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
    }

    public async validateJWTToken(context: Koa.Context, next: Koa.Next): Promise<void> {
        let authHeaderValue = context.request.header["authorization"] as string;
        if (authHeaderValue && authHeaderValue.startsWith("Bearer")) {
            let jwtString = authHeaderValue.substr("Bearer ".length);
            let validationResult = await this.backend.validateJWTString(jwtString);
            if (validationResult.success) {
                context.state.authTicket = validationResult.ticket!;
            }
        }
        
        await next();
    }
}