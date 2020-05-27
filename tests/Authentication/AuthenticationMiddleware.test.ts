import { mock, instance, when } from "ts-mockito";
import { stub } from "sinon";
import { expect } from "chai";

import AuthenticationMiddleware from "../../src/Authentication/AuthenticationMiddleware";
import IJWTValidationBackend from "../../src/Authentication/IJWTValidationBackend";
import AuthenticationTicket from "../../src/Authentication/AuthenticationTicket";

describe("Authentication Middleware", () => {
    var fakeContext: any;
    var mockBackend: IJWTValidationBackend;
    var subject: AuthenticationMiddleware;

    beforeEach(() => {
        mockBackend = mock<IJWTValidationBackend>();
        subject = new AuthenticationMiddleware(instance(mockBackend));

        fakeContext = {
            state: {},
            request: {
                header: {}
            },
            response: {
                status: 0,
                body: ""
            }
        };
    });

    it("Must call the next middleware even if the backend rejects the supplied token", async () => {
        let expectedJwtString = "eyasdhsajgbhjsa";
        when(mockBackend.validateJWTString(expectedJwtString)).thenResolve({ success: false });

        fakeContext.request.header["authorization"] = "Bearer " + expectedJwtString;
        let fakeNext = stub().resolves();
        await subject.validateJWTToken(fakeContext, fakeNext);

        expect(fakeNext.called).to.be.true;
    });

    it("Must call the next middleware even if no authentication token is supplied", async () => {
        let fakeNext = stub().resolves();
        await subject.validateJWTToken(fakeContext, fakeNext);

        expect(fakeNext.called).to.be.true;
    });

    it("Must attach the AuthenticationTicket to the context and call the next middleware if the backend accepts the supplied token", async () => {
        let fakeTicket: AuthenticationTicket = {
            id: "asd",
            emailAddress: "asd@asd.com",
            expirationDate: new Date(),
            pictureURI: "http://asd/asd.jpg",
            name: "ASDUser"
        };

        let expectedJwtString = "eyasdhsajgbhjsa";
        when(mockBackend.validateJWTString(expectedJwtString)).thenResolve({
            success: true,
            ticket: fakeTicket
        });

        fakeContext.request.header["authorization"] = "Bearer " + expectedJwtString;
        let successCallback = stub().resolves();
        await subject.validateJWTToken(fakeContext, successCallback);
        
        expect(fakeContext.state.authTicket).to.equal(fakeTicket);
        expect(successCallback.called).to.be.true;
    });
});