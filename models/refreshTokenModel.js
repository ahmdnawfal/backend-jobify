import mongoose from 'mongoose';

const RefreshTokenSchema = new mongoose.Schema({
  token: String,
});

export default mongoose.model('RefreshToken', RefreshTokenSchema);
