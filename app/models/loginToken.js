import mongoose, { Schema as Schema } from 'mongoose';

const LoginTokenSchema = new mongoose.Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "user",
        required: true,
    },
    token: {
        type: String,
        required: true,
    },
    createdDate: {
        type: Date, default: Date.now
    }
})

const LoginToken = mongoose.model('LoginToken', LoginTokenSchema)

export { LoginToken } 