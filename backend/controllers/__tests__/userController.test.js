const { getUsers, getUserById, createUser } = require("../userController.js");
const { ValidationError } = require("sequelize");
const User = require("../../models/userModel.js");
const bcrypt = require("bcrypt");

jest.mock("bcrypt");

describe("User controller tests", () => {

    let req, res;

    beforeEach(() => {
        req = { params: {}, query: {}, body: {} };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
    });

    describe("getUsers", () => {
        it("should return users successfully", async () => {
            const mockUsers = [{ id: 1, firstName: "Nicholas", lastName: "Moniz", username: "nmoniz5", role: "tenant", verified: true }];
            User.findAll.mockResolvedValue(mockUsers);

            await getUsers(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                status: "success",
                message: "1 user(s) found",
                data: mockUsers,
                errors: []
            });
        });

        it("should not search users by email or password", async () => {

            req.query = { email: "nmoniz5@uwo.ca", password: "password" };

            await getUsers(req, res);

            expect(req.query.email).toBe(undefined);
            expect(req.query.password).toBe(undefined);
        });

        it("should return 404 if no users are found", async () => {
            User.findAll.mockResolvedValue([]);

            await getUsers(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                status: "error",
                message: "No user(s) found",
                data: [],
                errors: ["No user(s) found with data {}"]
            });
        });

        it("should return 400 on validation error", async () => {
            User.findAll.mockRejectedValue(new ValidationError([{ message: "Invalid user ID" }]));

            await getUsers(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                status: "error",
                message: "Unable to get user(s) due to validation error(s)",
                data: [],
                errors: ["Invalid user ID"]
            });
        });

        it("should return 500 on unexpected error", async () => {
            User.findAll.mockRejectedValue(new Error("database error"));

            await getUsers(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                status: "error",
                message: "An unexpected error occured while trying to get user(s)",
                data: [],
                errors: ["database error"]
            });
        });
    });

    describe("getUserById", () => {
        it("should return user successfully", async () => {
            const mockUser = { id: 1, firstName: "Nicholas", lastName: "Moniz", username: "nmoniz5", role: "tenant", verified: true };
            User.findByPk.mockResolvedValue(mockUser);

            req.params.id = 1

            await getUserById(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                status: "success",
                message: "User 1 found",
                data: [mockUser],
                errors: []
            });
        });

        it("should return 404 if no users are found", async () => {
            User.findByPk.mockResolvedValue(null);

            req.params.id = 2

            await getUserById(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                status: "error",
                message: "No user found",
                data: [],
                errors: ["User 2 does not exist"]
            });
        });

        it("should return 400 on validation error", async () => {
            User.findByPk.mockRejectedValue(new ValidationError([{ message: "Invalid user ID" }]));

            req.params.id = 1

            await getUserById(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                status: "error",
                message: "Unable to get user 1 due to validation error(s)",
                data: [],
                errors: ["Invalid user ID"]
            });
        });

        it("should return 500 on unexpected error", async () => {
            User.findByPk.mockRejectedValue(new Error("database error"));

            req.params.id = 1

            await getUserById(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                status: "error",
                message: "An unexpected error occured while trying to get user 1",
                data: [],
                errors: ["database error"]
            });
        });
    });

    describe("createUser", () => {
        it("should return 201 on successful user creation", async () => {
            const mockUser = { id: 1, firstName: "Nicholas", lastName: "Moniz", username: "nmoniz5", role: "tenant", email: "nmoniz5@uwo.ca", password: "password" };
            User.create.mockResolvedValue(mockUser);

            req.body.password = "password";

            await createUser(req, res);

            expect(bcrypt.hash).toHaveBeenCalledWith("password", 10);
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                status: "success",
                message: "User 1 created",
                data: [mockUser],
                errors: []
            });
        });

        it("should return 400 on validation error", async () => {
            User.create.mockRejectedValue(new ValidationError([{ message: "Invalid user ID" }]));

            await createUser(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                status: "error",
                message: "Unable to create user due to validation error(s)",
                data: [],
                errors: ["Invalid user ID"]
            });
        });

        it("should return 500 on unexpected error", async () => {
            User.create.mockRejectedValue(new Error("database error"));

            await createUser(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                status: "error",
                message: "An unexpected error occured while trying to create user",
                data: [],
                errors: ["database error"]
            });
        });
    });
});