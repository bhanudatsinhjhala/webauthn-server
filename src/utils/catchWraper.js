const catchWraper = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch((error) => {
    if (error instanceof Error) next(error);
  });
};

export default catchWraper;
