import * as dotenv from 'dotenv';
dotenv.config();
import { StatusCodes } from 'http-status-codes';
import User from '../models/userModel.js';
import { comparePassword, hashPassword } from '../utils/passwordUtils.js';
import { UnauthenticatedError } from '../errors/customError.js';
import { createJWT } from '../utils/tokenUtils.js';
import 'express-async-errors';

export const register = async (req, res) => {
  const isFirstAccount = (await User.countDocuments()) === 0;
  req.body.role = isFirstAccount ? 'admin' : 'user';

  const hashedPassword = await hashPassword(req.body.password);
  req.body.password = hashedPassword;

  const user = await User.create(req.body);

  return res.status(StatusCodes.CREATED).json({ msg: 'SUCCESS', user });
};

export const login = async (req, res) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) throw new UnauthenticatedError('invalid credentials');

  const isValidUser =
    user && (await comparePassword(req.body.password, user.password));

  if (!isValidUser) throw new UnauthenticatedError('invalid credentials');

  const token = createJWT({ userId: user._id, role: user.role });

  const oneDay = 1000 * 60 * 60 * 24;

  res.cookie('token', token, {
    httpOnly: true,
    expires: new Date(Date.now() + oneDay),
    secure: process.env.NODE_ENV === 'production',
  });

  const userWithoutPassword = user.toJSON();

  return res
    .status(StatusCodes.OK)
    .json({ msg: 'SUCCESS', token, user: userWithoutPassword });
};

export const logout = (req, res) => {
  res.cookie('token', 'logout', {
    httpOnly: true,
    expires: new Date(Date.now()),
  });
  return res.status(StatusCodes.OK).json({ msg: 'SUCCESS' });
};
