import * as dotenv from 'dotenv';
dotenv.config();
import { StatusCodes } from 'http-status-codes';
import User from '../models/userModel.js';
import RefreshToken from '../models/refreshTokenModel.js';
import { comparePassword, hashPassword } from '../utils/passwordUtils.js';
import { UnauthenticatedError } from '../errors/customError.js';
import { createJWT } from '../utils/tokenUtils.js';
import jwt from 'jsonwebtoken';
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
  const refreshToken = jwt.sign(
    { userId: user._id, role: user.role },
    'RefreshToken'
  );
  const newRefreshToken = new RefreshToken({ token: refreshToken });
  await newRefreshToken.save();

  const accessTokenExpiration = jwt.decode(token).exp;

  const oneDay = 1000 * 60 * 60 * 24;

  res.cookie('token', token, {
    httpOnly: true,
    expires: new Date(Date.now() + oneDay),
    secure: process.env.NODE_ENV === 'production',
  });

  const userWithoutPassword = user.toJSON();

  return res.status(StatusCodes.OK).json({
    msg: 'SUCCESS',
    token,
    refreshToken,
    accessTokenExpiration,
    user: userWithoutPassword,
  });
};

export const refreshToken = async (req, res) => {
  const { refreshToken } = req.body;

  const isValidRefreshToken = await RefreshToken.exists({
    token: refreshToken,
  });

  if (!isValidRefreshToken)
    throw new UnauthenticatedError('invalid refresh token');

  jwt.verify(refreshToken, 'RefreshToken', (err, user) => {
    if (err) {
      throw new UnauthenticatedError('invalid refresh token');
    }

    const expirationTime = Math.floor(Date.now() / 1000) + 15 * 24 * 60 * 60;

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: expirationTime }
    );

    const accessTokenExpiration = jwt.decode(token).exp;

    res.json({ token, refreshToken, accessTokenExpiration });
  });
};

export const logout = (req, res) => {
  res.cookie('token', 'logout', {
    httpOnly: true,
    expires: new Date(Date.now()),
  });
  return res.status(StatusCodes.OK).json({ msg: 'SUCCESS' });
};
