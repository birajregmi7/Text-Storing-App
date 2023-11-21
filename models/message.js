const mongoose = require('mongoose');
const MONGO_URL = "mongodb://127.0.0.1:27017/companyMessage";
const user = require('./owner')
const Schema = mongoose.Schema;
main().catch(err => console.log(err));
async function main() {
    await mongoose.connect(MONGO_URL);
}
main()
const userSchema = mongoose.Schema({
    message: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'user',
    }

});

const textModel = mongoose.model('text', userSchema);
module.exports = textModel;

