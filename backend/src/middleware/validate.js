const { validationResult } = require('express-validator');

const validate = (validations) => {
  return async (req, res, next) => {
    for (let validation of validations) {
      const result = await validation.run(req);
      if (result.errors.length) break;
    }

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    const extractedErrors = [];
    errors.array({ onlyFirstError: true }).forEach((err) => extractedErrors.push(err.msg));

    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors: extractedErrors,
    });
  };
};

module.exports = validate;
