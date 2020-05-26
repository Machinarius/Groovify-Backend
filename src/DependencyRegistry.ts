import { DependencyContainer } from "tsyringe";

import GoogleJWTValidationBackend from "./Authentication/GoogleJWTValidationBackend";

export default class DependencyRegistry {
    public static registerTypes(container: DependencyContainer) {
        // TODO: Find a way to make this name type-safe
        container.register("IJWTValidationBackend", {
            useClass: GoogleJWTValidationBackend
        });
    }
}