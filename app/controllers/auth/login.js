const User = require('../../models/User');

module.exports = async (req, res) => {
  const { email, password } = req.body;
  try {
    const token = await User.authenticate(email, password);
    return res.json({ token });
  } catch (e) {
    return res.status(401).json({ message: e instanceof Error ? e.toString() : e });
  }
};
