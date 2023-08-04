class ExpressError extends Error {
    constructor(message, status) {
        super();
        this.message = message;
        this.status = status;
    }
}
// exporting so that index.js can require and use this class
module.exports = ExpressError;