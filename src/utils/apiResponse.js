export const replaceMessage = (message, data) => {
  return message.replace("##", data);
};

const apiResponse = (res, statusCode, message, data = []) => {
  return res.status(statusCode).send({ code: statusCode, message, data });
};
export default apiResponse;
