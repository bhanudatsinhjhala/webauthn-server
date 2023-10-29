import * as userServices from "../services/userServices.js";

/**
 * Description: User Login Controller
 */
export const login = async (req, res, next) => {
  await userServices.login(req, res, next);
};

export const signup = async (req, res, next) => {
  await userServices.signup(req, res, next);
};

export const generateRegOptions = async (req, res, next) => {
  await userServices.generateRegOptions(req, res, next);
};
export const generateAuthOptions = async (req, res, next) => {
  await userServices.generateAuthOptions(req, res, next);
};
export const verifyRegOptions = async (req, res, next) => {
  await userServices.verifyRegOptions(req, res, next);
};

export const verifyAuthOptions = async (req, res, next) => {
  await userServices.verifyAuthOptions(req, res, next);
};
