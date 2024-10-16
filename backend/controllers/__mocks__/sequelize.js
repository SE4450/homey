module.exports = {
    ValidationError: class extends Error {
        constructor(errors) {
            super("Validation Error");
            this.errors = errors;
        }
    },
    Sequelize: jest.fn().mockImplementation(() => {
        return {
            define: jest.fn().mockImplementation(() => {
                return {
                    findAll: jest.fn(),
                    findByPk: jest.fn(),
                    create: jest.fn()
                };
            })
        }
    }),
    DataTypes: {}
};