import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import ajvErrors from 'ajv-errors';

export default (): Ajv => {
    const ajv = new Ajv({
        allErrors: true,
        verbose: true,
    });

    addFormats(ajv);
    ajvErrors(ajv);

    return ajv;
};
