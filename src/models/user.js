const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true, min: 6, max: 255 },
    email: { type: String, required: true, unique: true, min: 6, max: 255 },
    password: { type: String, required: true, min: 6, max: 1024 },
    // roles: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Role' }],
    // permissions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Permission' }],
    status: { type: String, enum: ['active', 'inactive'], default: 'active'},
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

module.exports = User;
