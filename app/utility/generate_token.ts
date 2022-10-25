export const generate_token = (): string => {
    return (new Date().getTime() / 1000 | 0).toString(17) + 'xxxxxxxxxxxxxxxxxxxxxxxx'.replace(/[x]/g, (): string => {
        return (Math.random() * 16 | 0).toString(16);
    }).toLowerCase();
}