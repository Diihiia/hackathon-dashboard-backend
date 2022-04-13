import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    username: { type: String, required: true },
    teamCode: {
        type : String
    },
    email: { 
        type: String, 
        required: true, 
        unique: true, 
        //the match regex checks if the provided string has the format of an email or not
        match: /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/
    },
    password: { required: true, type: String}
});

export default mongoose.model('User', userSchema);