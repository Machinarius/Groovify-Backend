import IJWTValidationBackend from "./IJWTValidationBackend";
import { LoginTicket, OAuth2Client } from "google-auth-library";

export default class GoogleJWTValidationBackend implements IJWTValidationBackend {
    private googleOauthClient: OAuth2Client;

    constructor() {
        this.googleOauthClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    }

    public async validateJWTString(jwtString: string): Promise<boolean> {
        var ticket: LoginTicket;
        try {
            ticket = await this.googleOauthClient.verifyIdToken({
                idToken: jwtString,
                audience: process.env.GOOGLE_CLIENT_ID
            });
        } catch (ex) {
            console.log("Error verifying idToken", ex);
            return false;        
        }

        return true;
    }
}