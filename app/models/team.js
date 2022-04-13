import mongoose from 'mongoose';
const teamSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: { type: String, required: true },
    code: {
        type : String,
        immutable: true, //so that users cannot change the team code with a patch request
        unique: true //each team will have a unique code
    },
    members: { type: Array, required: true }
});
export default mongoose.model('Team', teamSchema);