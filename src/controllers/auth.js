import * as AuthService from '../services/auth.js';

export const registerUser = async (req, res) => {
  const user = {
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
  };

  const registeredUser = await AuthService.registerUser(user);

  res.status(201).json({
    status: 201,
    message: 'Successfully registered a user!',
    data: registeredUser,
  });
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  await AuthService.loginUser(email, password);

  res.status(200).json({
    status: 200,
    message: 'Successfully logged in an user!',
    // data: accessToken,
  });
};
