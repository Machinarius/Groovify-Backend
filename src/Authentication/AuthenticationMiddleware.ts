import { injectable, inject } from "tsyringe";
import { nameof } from "ts-simple-nameof";

import IJWTValidationBackend from "./IJWTValidationBackend";

export interface AuthRequestContext {
    request: {
        header: {
            [key: string]: any
        }
    },
    response: IRejectedRequest
}

interface IRejectedRequest {
    status: number,
    body: string | object
}

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

    public async validateJWTToken(
        context: AuthRequestContext, 
        next: () => Promise<void>): Promise<void> {
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

    private rejectRequest(response: IRejectedRequest) {
        response.status = 401;
        response.body = "Not Authorized";
    }
}