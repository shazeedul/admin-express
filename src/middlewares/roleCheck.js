// middleware/role.js
module.exports = (requiredPermissions) => {
    return (req, res, next) => {
    const userRoles = req.user.roles; // Assuming user roles are attached to the request
    const hasPermission = userRoles.some((roleId) => {
      // Check if any of the user's roles have the required permission
      const role = findRoleById(roleId); // Implement a function to fetch the role from the database
      return role.permissions.some((permissionId) => requiredPermissions.includes(permissionId));
    });

    if (hasPermission) {
      next(); // User has the required permission
    } else {
      res.status(403).json({ message: 'Permission denied' });
    }
  };
};
