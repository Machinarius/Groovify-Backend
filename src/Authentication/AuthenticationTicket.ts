export interface AuthenticationTicket {
    userId: string;
    expirationDate: Date;
    emailAddress: string;
    name: string;
    externalPictureURI: string;
}