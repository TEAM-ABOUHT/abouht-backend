// jsend 
const Jsend = (type, message, data) => {
    return {
      status: type,
      message,
      data,
    };
  };
  module.exports = {
    SUCCESS: (message, data) =>
      Jsend("success", message, data),
    ERROR: (message) => Jsend("error", message),
    FAIL: (message) => Jsend("fail", message),
  };