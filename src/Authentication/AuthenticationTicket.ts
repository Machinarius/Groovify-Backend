export default interface AuthenticationTicket {
    id: string;
    expirationDate: Date;
    emailAddress: string;
    name: string;
    pictureURI: string;
}