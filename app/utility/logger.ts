import { Logger as WinstonLogger, createLogger, format, transports } from 'winston';

class Logger {
    public instance: WinstonLogger;
    private enumerate_error_format = format(info => {
        if (info instanceof Error) Object.assign(info, { message: info.stack });
        return info;
    });
    constructor() { 
        this.instance = createLogger({
            level: process.env.node_env === 'dev' ? 'debug' : 'info',
            format: format.combine(
                this.enumerate_error_format(),
                process.env.node_env === 'dev' ? format.colorize() : format.uncolorize(),
                format.splat(),
                format.json(),
                format.printf(({ level, message }) => `${ level }: ${ message }`)
            ),
            transports: [
                new transports.Console({
                    stderrLevels: ['error']
                })
        ]});
    }
};

export { Logger }