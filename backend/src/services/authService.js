const User = require('../models/User');
const Role = require('../models/Role');
const { hashPassword, comparePassword } = require('../utils/password');
const { generateToken } = require('../utils/jwt');

const authService = {
  async login(emailOrPhone, password) {
    const user = await User.findByEmail(emailOrPhone);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isMatch = await comparePassword(password, user.password_hash);
    if (!isMatch) {
      throw new Error('Invalid credentials');
    }

    const roles = await Role.getUserRoles(user.id);
    const roleNames = roles.map(r => r.name);

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      location: user.location,
      status: user.status,
      roles: roleNames
    };

    const token = generateToken({ id: user.id, email: user.email, roles: roleNames });
    return { user: safeUser, token };
  },

  async register(data) {
    const existing = await User.findByEmail(data.email);
    if (existing) {
      throw new Error('User already exists with this email');
    }

    const passwordHash = await hashPassword(data.password);
    const newUser = await User.create({
      name: data.name,
      email: data.email,
      phone: data.phone,
      passwordHash,
      location: data.location
    });

    const token = generateToken({ id: newUser.id, email: newUser.email, roles: ['User'] });
    return { user: newUser, token };
  }
};

module.exports = authService;
