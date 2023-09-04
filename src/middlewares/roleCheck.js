// middleware/role.js
module.exports = (roles) => {
    return (req, res, next) => {
        const user = req.user;
        const userRoles = user.roles.map(role => role.name);
        const hasAccess = roles.some(role => userRoles.includes(role));
        if (!hasAccess) {
            return res.status(403).json({ message: "Forbidden" });
        }
        next();
    }
};
  