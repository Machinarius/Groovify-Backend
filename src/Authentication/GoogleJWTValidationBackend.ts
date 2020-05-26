import IJWTValidationBackend, { JWTValidationResult } from "./IJWTValidationBackend";
import { LoginTicket, OAuth2Client } from "google-auth-library";
import { AuthenticationTicket } from "./AuthenticationTicket";

export default class GoogleJWTValidationBackend implements IJWTValidationBackend {
    private googleOauthClient: OAuth2Client;

    constructor() {
        this.googleOauthClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    }

    public async validateJWTString(jwtString: string): Promise<JWTValidationResult> {
        var ticket: LoginTicket;
        try {
            ticket = await this.googleOauthClient.verifyIdToken({
                idToken: jwtString,
                audience: process.env.GOOGLE_CLIENT_ID
            });
        } catch (ex) {
            console.log("Error verifying idToken", ex);
            return { success: false };        
        }

        let payload = ticket.getPayload();
        let authTicket: AuthenticationTicket = {
            userId: payload.sub,
            name: payload.name!,
            emailAddress: payload.email!,
            externalPictureURI: payload.picture,
            expirationDate: new Date(payload.exp * 1000)
        };

        return {
            success: true,
            ticket: authTicket
        };
    }
}