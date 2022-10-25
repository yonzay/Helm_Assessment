class ApiError extends Error {
    public status_code: number;
    public is_operational: boolean;
    constructor(status_code: number, message: string, is_operational: boolean = true, stack: string = '') {
        super(message);
        this.status_code = status_code;
        this.is_operational = is_operational;
        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
};

export { ApiError }