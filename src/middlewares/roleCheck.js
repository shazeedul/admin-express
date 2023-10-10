// middleware/role.js
const User = require('../models/user');
const { hasPermission } = require('../utils/helper.util');

module.exports = (requiredPermissions) => {
    return async (req, res, next) => {
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
    
      const userRoles = user.roles;
      const hasPermissions = await hasPermission(userRoles[0], requiredPermissions);
      if (!hasPermissions) {
        return res.status(403).json({ error: "Permission denied" });
      }
      next();
  };
};
