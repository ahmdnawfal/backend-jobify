import jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';

dotenv.config();

export const createJWT = (payload) => {
  const oneDay = Math.floor(Date.now() / 1000) + 24 * 60 * 60;

  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: oneDay,
  });

  return token;
};

export const verifyJWT = (token) => {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  return decoded;
};
