const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
    name: { type: String, required: true, min: 6, max: 255, unique: true },
    permissions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Permission' }], // Permissions assigned to this role
}, { timestamps: true });

const Role = mongoose.model('Role', roleSchema);

module.exports = Role;
