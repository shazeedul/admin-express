const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true, min: 6, max: 255 },
    email: { type: String, required: true, unique: true, min: 6, max: 255 },
    password: { type: String, required: true, min: 6, max: 1024 },
    roles: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Role' }],
    status: { type: String, enum: ['active', 'inactive'], default: 'active'},
}, {timestamps: true});

const User = mongoose.model('users', userSchema);

module.exports = User;
