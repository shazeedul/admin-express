const bcrypt = require("bcrypt");
const User = require("../models/user");
const Role = require("../models/role");
const Permission = require("../models/permission");
const { body, validationResult, check } = require("express-validator");
const jwt = require("jsonwebtoken");

const register = async (req, res) => {
  const { email, password, name } = req.body;

  try {
    const emailExist = await User.findOne({ email });

    if (emailExist) {
      return res.status(400).json({
        success: false,
        error: "Email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    const token = jwt.sign(
      { email: user.email, id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(201).json({
      success: true,
      data: user,
      token,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    return res.status(200).json({
      data: user,
      token: jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "1h",
      }),
      success: true,
    });
  } catch (error) {
    res.status(500).json({ error: "An error occurred" });
  }
};

const me = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({ error: "An error occurred" });
  }
};

// roles create api
const createRole = async (req, res) => {
  try {
    const { name } = req.body;

    // Validate the request body
    await body("name").isLength({ min: 2 }).isString().trim().run(req);

    // Extract the validation errors from a request.
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    //if name is already exist in database, return error
    const existingRole = await Role.findOne({ name }).exec();
    if (existingRole) {
      return res.status(400).json({ error: "Role already exists" });
    }

    const role = await Role.create({
      name,
    });

    return res.status(201).json({
      success: true,
      data: role,
    });
  } catch (error) {
    console.error(error); // Log the error for debugging
    res.status(500).json({ error: "An error occurred" });
  }
};

const createPermission = async (req, res) => {
  try {
    const { permissions } = req.body;

    // Validate the request body permissions is array
    await body("permissions")
      .notEmpty().withMessage("Permissions array cannot be empty")
      .isArray().withMessage("Permissions must be an array")
      .run(req);

    // Extract the validation errors from a request.
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    // if permissions array isEmpty return error
    if (permissions.length === 0) {
      return res.status(400).json({ error: "Permissions array cannot be empty" });
    }
    // Find existing permissions
    const existingPermissions = await Permission.find({
      name: { $in: permissions },
    });

    // Extract names of existing permissions
    const existingPermissionNames = existingPermissions.map(
      (existing) => existing.name
    );

    // Filter out unique permissions to be created
    const uniquePermissions = permissions.filter((permission) => {
      return !existingPermissionNames.includes(permission);
    });

    // Create new permission objects for the unique permissions
    const newPermissions = uniquePermissions.map((permissionName) => ({
      name: permissionName,
    }));

    // if newPermissions is empty, return error
    if (newPermissions.length === 0) {
      return res.status(400).json({ error: "Permissions already exist" });
    }

    const createdPermissions = await Permission.insertMany(newPermissions);

    return res.status(201).json({
      success: true,
      data: createdPermissions,
    });
  } catch (error) {
    res.status(500).json({ error: "An error occurred" });
  }
};

const assignRolePermissions = async (req, res) => {
  try {
    const { roleId, permissions } = req.body;

    // Find the role by ID
    const role = await Role.findById(roleId);

    if (!role) {
      return res.status(404).json({ error: "Role not found" });
    }

    // Delete all role.permissions before store permissions
    role.permissions = [];

    // Find the permissions by IDs or names
    const permissionIds = [];
    for (const permission of permissions) {
      let permissionObj;
      if (typeof permission === 'string') {
        // If permission is a string, find it by name
        permissionObj = await Permission.findOne({ name: permission });
      } else {
        // If permission is an object, assume it contains the ID
        permissionObj = await Permission.findById(permission);
      }

      if (!permissionObj) {
        return res.status(404).json({ error: `Permission not found: ${permission}` });
      }

      permissionIds.push(permissionObj._id);
    }

    // Assign the permissions to the role
    role.permissions.push(...permissionIds);
    await role.save();

    return res.status(200).json({
      success: true,
      data: role,
    });
  } catch (error) {
    res.status(500).json({ error: "An error occurred" });
  }
};

const assignRole = async (req, res) => {
  try {
    const { userId, roleId } = req.body;

    // find user by id
    let user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // find role by id
    let role = await Role.findById(roleId);
    
    if (!role) {
      return res.status(404).json({ error: "Role not found" });
    }

    // Delete all user.roles before store role
    user.roles = [];

    // assign role to user
    user.roles.push(role._id);
    await user.save();

    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({ error: "An error occurred" });
  }
};

module.exports = {
  register,
  login,
  me,
  createRole,
  createPermission,
  assignRolePermissions,
  assignRole
};
