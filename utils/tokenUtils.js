import jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';

dotenv.config();

export const createJWT = (payload) => {
  const expirationTime = 60 * 60;

  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: expirationTime,
  });

  return token;
};

export const verifyJWT = (token) => {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  return decoded;
};
