const bcrypt = require("bcrypt");
const User = require("../models/user");
const Role = require("../models/role");
const Permission = require("../models/permission");
const { body, validationResult } = require("express-validator");
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
      .isArray()
      .withMessage("Permissions must be an array")
      .notEmpty()
      .withMessage("Permissions array cannot be empty");

    // Extract the validation errors from a request.
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
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
    console.error(error);
    res.status(500).json({ error: "An error occurred" });
  }
};

const assignPermissionToRole = async (req, res) => {
  try {
    const { roleId, permissionName } = req.body;

    // Find the role by name
    const role = await Role.findOne({ _id: roleId });

    if (!role) {
      return res.status(404).json({ error: "Role not found" });
    }

    // Find the permission by name
    const permission = await Permission.findOne({ name: permissionName });

    if (!permission) {
      return res.status(404).json({ error: "Permission not found" });
    }

    // Assign the permission to the role
    role.permissions.push(permission);
    await role.save();

    return res.status(200).json({
      success: true,
      data: role,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred" });
  }
};

module.exports = {
  register,
  login,
  me,
  createRole,
  createPermission,
  assignPermissionToRole,
};
