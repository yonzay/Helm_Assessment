export const pick = (object: any, keys: any): object => {
    return keys.reduce((obj: any, key: any) => {
        if (object && Object.prototype.hasOwnProperty.call(object, key)) obj[key] = object[key];
        return obj;
    }, {});
}