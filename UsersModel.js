import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    points: [{
        type: Number
    }]
})

const UsersModel = mongoose.model("users", UserSchema);
export default UsersModel;