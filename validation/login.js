const Validator = require("validator");
const isEmpty = require("is-empty");
module.exports = function validateLoginInput(data) {
  let errors = {};
// Convert empty fields to an empty string so we can use validator functions
  data.phoneNumber = !isEmpty(data.phoneNumber) ? data.phoneNumber : "";  
// Password checks
  if (Validator.isEmpty(data.phoneNumber)) {
    errors.phoneNumber = "PhoneNumber field is required";
  }
return {
    errors,
    isValid: isEmpty(errors)
  };
};