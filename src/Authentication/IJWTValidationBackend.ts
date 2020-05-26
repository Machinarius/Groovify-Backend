import { AuthenticationTicket } from "./AuthenticationTicket";

export interface JWTValidationResult {
    success: boolean,
    ticket?: AuthenticationTicket
}

export default interface IJWTValidationBackend {
    validateJWTString(jwtString: string): Promise<JWTValidationResult>;
}