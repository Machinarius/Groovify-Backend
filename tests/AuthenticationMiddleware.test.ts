import { mock, instance, when } from "ts-mockito";
import { stub } from "sinon";
import { expect } from "chai";

import AuthenticationMiddleware from "../src/Authentication/AuthenticationMiddleware";
import IJWTValidationBackend from "../src/Authentication/IJWTValidationBackend";

describe("Authentication Middleware", () => {
    var fakeContext: any;
    var mockBackend: IJWTValidationBackend;
    var subject: AuthenticationMiddleware;

    beforeEach(() => {
        mockBackend = mock<IJWTValidationBackend>();
        subject = new AuthenticationMiddleware(instance(mockBackend));

        fakeContext = {
            request: {
                header: {}
            },
            response: {
                status: 0,
                body: ""
            }
        };
    });
    
    it("Must immediately reject the request if no authentication header is present", async () => {
        let failureCallback = stub().rejects();
        await subject.validateJWTToken(fakeContext, failureCallback);

        expect(fakeContext.response.status).to.equal(401);
        expect(fakeContext.response.body).to.equal("Not Authorized");      
    });

    it("Must immediately reject the request if the authentication scheme is not Bearer", async () => {
        fakeContext.request.header["authorization"] = "Basic ...";
        let failureCallback = stub().rejects();
        await subject.validateJWTToken(fakeContext, failureCallback);

        expect(fakeContext.response.status).to.equal(401);
        expect(fakeContext.response.body).to.equal("Not Authorized");    
    });

    it("Must reject the request if the backend rejects the JWT string", async () => {
        let expectedJwtString = "eyasdhsajgbhjsa";
        when(mockBackend.validateJWTString(expectedJwtString)).thenResolve(false);

        fakeContext.request.header["authorization"] = "Bearer " + expectedJwtString;
        let failureCallback = stub().rejects();
        await subject.validateJWTToken(fakeContext, failureCallback);

        expect(fakeContext.response.status).to.equal(401);
        expect(fakeContext.response.body).to.equal("Not Authorized");    
    });

    it("Must call through to the next middleware if the backend accepts the JWT string", async () => {
        let expectedJwtString = "eyasdhsajgbhjsa";
        when(mockBackend.validateJWTString(expectedJwtString)).thenResolve(true);

        fakeContext.request.header["authorization"] = "Bearer " + expectedJwtString;
        let successCallback = stub().resolves();
        await subject.validateJWTToken(fakeContext, successCallback);
        
        expect(successCallback.called).to.be.true;
    });
});