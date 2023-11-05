import {
  generateAuthenticationOptions,
  generateRegistrationOptions,
  verifyAuthenticationResponse,
  verifyRegistrationResponse,
} from "@simplewebauthn/server";
import userModel from "../schemas/user.schema.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { envConfig } from "../config/env.config.js";
import { uint8ArrayToHex, hexToUint8Array } from "../utils/webauthn.js";
import httpStatus from "http-status";
import ApiError from "../utils/apiError.js";

const rpName = "Jhala's First Webauthn";
const rpID = "webauthn-react.vercel.app";
const origin = `https://${rpID}`;

export const generateAuthOptions = async (user) => {
  const options = await generateAuthenticationOptions({
    allowCredentials: user.authenticators.map((authenticators) => ({
      id:
        authenticators.credentialID &&
        hexToUint8Array(authenticators.credentialID),
      type: "public-key",
      transports:
        authenticators.transports && hexToUint8Array(authenticators.transports),
    })),
    userVerification: "preferred",
  });
  await userModel.updateOne({ _id: user.id }, { challenge: options.challenge });
  return options;
};

export const generateRegOptions = async (user) => {
  const options = await generateRegistrationOptions({
    rpName,
    rpID,
    userID: user._id,
    userName: user.name,
    // Don't prompt users for additional information about the authenticator
    // (Recommended for smoother UX)
    attestationType: "none",
  });

  await userModel.updateOne(
    { _id: user._id },
    { challenge: options.challenge }
  );
  return options;
};

export const verifyRegOptions = async (req, res, next) => {
  const { attResp, id } = req.body;

  const user = await userModel.findById(id);
  const verification = await verifyRegistrationResponse({
    response: attResp,
    expectedChallenge: user.challenge,
    expectedOrigin: origin,
    expectedRPID: rpID,
  });

  if (verification.verified) {
    const { registrationInfo } = verification;
    const { credentialPublicKey, credentialID, counter } = registrationInfo;

    const authenticators = [
      {
        credentialID: uint8ArrayToHex(credentialID),
        credentialPublicKey: uint8ArrayToHex(credentialPublicKey),
        counter: uint8ArrayToHex(counter),
      },
    ];
    await userModel.updateOne(
      { _id: user.id },
      {
        authenticators,
      }
    );
  }
  return res.status(httpStatus.OK).send({
    data: {
      verified: verification.verified,
    },
    message: "Verification of Registered User done successfully",
  });
};

export const verifyAuthOptions = async (req, res, next) => {
  const { attResp, id } = req.body;

  const user = await userModel.findById(id);
  let authenticators = user.authenticators;
  authenticators = authenticators.map((authenticator) => ({
    credentialID: hexToUint8Array(authenticator.credentialID),
    credentialPublicKey: hexToUint8Array(authenticator.credentialPublicKey),
    counter: authenticator.counter,
  }));
  const verification = await verifyAuthenticationResponse({
    response: attResp,
    expectedChallenge: user.challenge,
    expectedOrigin: origin,
    expectedRPID: rpID,
    authenticator: authenticators[0],
  });

  if (verification.verified) {
    const { authenticationInfo } = verification;
    const { newCounter } = authenticationInfo;

    user.authenticators = [
      ...user.authenticators,
      {
        ...authenticationInfo,
        counter: newCounter,
      },
    ];
  }
  const accessToken = jwt.sign({ id: user.id }, envConfig.jwtSecret);

  return res.status(httpStatus.OK).send({
    data: {
      verified: verification.verified,
      accessToken,
    },
    message: "Verification of Authentication User done successfully",
  });
};

export const signup = async (req, res, next) => {
  const { email, password, isWebAuthnReg, name } = req.body;

  const user = await userModel.findOne({ email });
  if (user)
    return res
      .status(httpStatus.CONFLICT)
      .send({ message: "User already registered" });

  const hashPassword = await bcrypt.hash(password, 10);

  const newUser = await userModel.create({
    email,
    password: hashPassword,
    name,
  });
  let options;
  if (isWebAuthnReg) options = await generateRegOptions(newUser);

  return res.status(httpStatus.OK).send({
    message: "User registered successfully",
    data: {
      options,
      id: newUser._id,
    },
  });
};

export const login = async (req, res, next) => {
  const { email, password, isLoginWithWebAuthn } = req.body;

  const user = await userModel.findOne({ email });
  if (!user) return res.status(409).send({ message: "User not registered" });

  if (password) {
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch)
      throw new ApiError(httpStatus.UNAUTHORIZED, "Password does not match");

    const accessToken = jwt.sign({ id: user.id }, envConfig.jwtSecret);
    return res.status(httpStatus.OK).send({
      data: { accessToken, id: user._id },
      message: "User Logged In Successfully",
    });
  }
  if (user.authenticators.length === 0 && isLoginWithWebAuthn)
    throw new ApiError(
      httpStatus.CONFLICT,
      "You do not register with Web Authn"
    );
  if (isLoginWithWebAuthn) {
    const options = await generateAuthOptions(user);

    return res.status(httpStatus.OK).send({
      message: "User loggedin successfully",
      data: {
        options,
        id: user._id,
      },
    });
  }
};
