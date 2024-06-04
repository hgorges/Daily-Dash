import type { MatcherFunction } from "expect";

const toBeValidUsername: MatcherFunction<[]> = function (username: unknown) {
    if (typeof username !== "string") {
        throw new TypeError("Username must be of type string!");
    }
    const valid = username.length > 5 && username.length < 20;

    return {
        pass: valid,
        message: () => `expected username ${username} to have valid length`,
    };
};

expect.extend({ toBeValidUsername });

interface CustomMatchers<R> {
    toBeValidUsername(): R;
}

declare global {
    // TODO fix no-namespace issue
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace jest {
        interface Matchers<R> extends CustomMatchers<R> {}
    }
}

describe("custom matchers test", () => {
    it("check for valid username", () => {
        const someUsername = "john_doe";
        expect(someUsername).toBeValidUsername();
    });
});
