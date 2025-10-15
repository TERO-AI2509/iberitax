import Ajv from "ajv";
import addFormats from "ajv-formats";

/**
 * Single Ajv instance for the package.
 * Exported as both named and default to smooth over ESM/CJS interop in Jest.
 */
const ajv = new Ajv({
  allErrors: true,
  strict: false, // relax if schemas use features Ajv warns about
});

addFormats(ajv);

export { ajv };
export default ajv;
