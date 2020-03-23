export default interface IJWTValidationBackend {
    validateJWTString(jwtString: string): Promise<boolean>;
}