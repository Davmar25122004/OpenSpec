const joi = require('joi');

const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) {
      return res.status(400).json({ errors: error.details.map((x) => x.message) });
    }
    req.body = value;
    next();
  };
};

module.exports = validate;
