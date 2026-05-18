const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const {
  isDemoAuthFallbackEnabled,
  isDatabaseConnectionError,
  findDemoUserByEmail,
  findDemoUserById,
  listDemoUsersByRole,
  toTokenUser,
  toProfileUser,
} = require('../utils/demoAuth');

const VALID_ROLES = new Set(['employee', 'manager', 'admin']);

const signToken = (user) =>
  jwt.sign(
    { id: user.id, email: user.email, name: user.name, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );

const databaseUnavailableResponse = (res) =>
  res.status(503).json({
    error: 'Database connection failed. Check DATABASE_URL in backend/.env and make sure the Supabase project is active.',
  });

// GET /api/auth/accounts/:role
const getLoginAccounts = async (req, res) => {
  try {
    const { role } = req.params;

    if (!VALID_ROLES.has(role)) {
      return res.status(400).json({ error: 'Invalid role.' });
    }

    const result = await pool.query(
      `SELECT id, name, email, role
       FROM users
       WHERE role = $1 AND is_active = TRUE
       ORDER BY name`,
      [role]
    );

    res.json({ users: result.rows });
  } catch (error) {
    if (isDatabaseConnectionError(error)) {
      console.error('Get login accounts database connection error:', error.message);

      if (isDemoAuthFallbackEnabled()) {
        return res.json({
          users: listDemoUsersByRole(req.params.role).map(toTokenUser),
        });
      }

      return databaseUnavailableResponse(res);
    }

    console.error('Get login accounts error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const result = await pool.query(
      'SELECT id, name, email, password_hash, role, monthly_salary FROM users WHERE email = $1 AND is_active = TRUE',
      [email.toLowerCase()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const user = result.rows[0];
    const isValid = await bcrypt.compare(password, user.password_hash);

    if (!isValid) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = signToken(user);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    if (isDatabaseConnectionError(error)) {
      console.error('Login database connection error:', error.message);

      if (isDemoAuthFallbackEnabled()) {
        const demoUser = findDemoUserByEmail(req.body?.email);
        if (demoUser && req.body?.password === demoUser.password) {
          const tokenUser = toTokenUser(demoUser);
          const token = signToken(tokenUser);

          return res.json({
            message: 'Login successful',
            token,
            user: tokenUser,
          });
        }
      }

      return databaseUnavailableResponse(res);
    }

    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

// GET /api/auth/me
const getProfile = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.id, u.name, u.email, u.role, u.joining_date, u.monthly_salary,
              m.name as manager_name, m.email as manager_email
       FROM users u
       LEFT JOIN users m ON u.manager_id = m.id
       WHERE u.id = $1`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    res.json({ user: result.rows[0] });
  } catch (error) {
    if (isDatabaseConnectionError(error)) {
      console.error('Get profile database connection error:', error.message);

      if (isDemoAuthFallbackEnabled()) {
        const demoUser = findDemoUserById(req.user?.id) || findDemoUserByEmail(req.user?.email);
        if (demoUser) {
          return res.json({ user: toProfileUser(demoUser) });
        }
      }

      return databaseUnavailableResponse(res);
    }

    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

module.exports = { login, getProfile, getLoginAccounts };
