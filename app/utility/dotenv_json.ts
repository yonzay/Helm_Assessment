import { readFileSync } from 'fs';
import { resolve } from 'path';
import { compile } from 'joi';
import { MiscValidations } from '../validations/misc_validations';

export const dotenv_json = (options: any) => {
    try {
        const env_config = JSON.parse(readFileSync(resolve(process.cwd(), (options && options.path) || '.env.json'), { encoding: 'utf8' }));
        for (const key in env_config) process.env[key] = process.env[key] || env_config[key];
        const { value, error } = compile(MiscValidations.configuration)
        .prefs({ errors: { label: 'key' }, abortEarly: false })
        .validate(process.env);
        if (error) throw new Error(error.details.map(detail => detail.message).join(', '));
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}