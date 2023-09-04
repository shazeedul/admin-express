const mongoose = require('mongoose');

const permissionSchema = new mongoose.Schema({
    name: { type: String, required: true, min: 6, max: 255 },
}, { timestamps: true });

const Permission = mongoose.model('Permission', permissionSchema);

module.exports = Permission;
