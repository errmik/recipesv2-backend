import mongoose from "mongoose";
import jwt from "jsonwebtoken";

interface IUser extends mongoose.Document {
  name: string;
  email: string;
  emailVerified: boolean;
  phone: string;
  phoneVerified: boolean;
  sharedSecret?: string;
  refreshToken?: string;
  avatar?: string;
  blocked?: boolean;
}

// Put all user instance methods in this interface:
interface IUserMethods {
  createAccessToken(): string;
  createRefreshToken(): string;
}

// Create a new Model type that knows about IUserMethods...
type UserModel = mongoose.Model<IUser, {}, IUserMethods>;

const UserSchema = new mongoose.Schema<IUser, UserModel, IUserMethods>({
  name: {
    type: String,
    required: [true, "Name is required"],
    maxlength: 50,
    minlength: 2,
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    match: [
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      "Please provide a valid email",
    ],
    unique: true,
  },
  emailVerified: {
    type: Boolean,
    default: false,
  },
  phone: {
    type: String,
    required: false,
    match: [/^\+[1-9]{1}[0-9]{3,14}$/, "Please provide a valid phone number"],
    unique: false,
  },
  phoneVerified: {
    type: Boolean,
    default: false,
  },
  sharedSecret: {
    type: String,
    required: false,
  },
  refreshToken: {
    type: String,
    required: false,
  },
  avatar: {
    type: String,
    required: false,
  },
  blocked: {
    type: Boolean,
    default: false,
  },
});

// UserSchema.method("fullName", function fullName() {
//   return this.firstName + " " + this.lastName;
// });

UserSchema.methods.createAccessToken = function () {
  return jwt.sign(
    {
      userId: this._id,
      name: this.name,
      email: this.email,
      avatar: this.avatar,
    },
    process.env.ACCESS_TOKEN_SECRET as string,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRATION,
    }
  );
};

UserSchema.methods.createRefreshToken = function () {
  return jwt.sign(
    {
      userId: this._id,
      name: this.name,
      email: this.email,
      avatar: this.avatar,
    },
    process.env.REFRESH_TOKEN_SECRET as string,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRATION,
    }
  );
};

const User = mongoose.model<IUser, UserModel>("User", UserSchema);

export { User, IUser, UserModel };
