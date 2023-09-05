const Permission = require('../models/permission');
const Role = require('../models/role');

// user has permission to access action, params are userRoleId: objectId and requiredPermissions: permissionName
const hasPermission = async (userRoleId, requiredPermission) => {
    try {
        const role = await Role.findById(userRoleId);
        const permission = await Permission.findOne({ name: requiredPermission });
        if (!role || !permission) {
            return false;
        }
        // Check if permission._id is in role.permissions
        const checkPermission = role.permissions.includes(permission._id);

        return checkPermission;
    } catch (error) {
        return false; // Handle errors gracefully
    }
};


module.exports = {
    hasPermission
};
