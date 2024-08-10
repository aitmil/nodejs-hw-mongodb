import * as AuthService from '../services/auth.js';

export const registerUser = async (req, res) => {
  const user = {
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
  };

  console.log('Registering user...');

  const registeredUser = await AuthService.registerUser(user);

  console.log('User registered, sending response...');

  res.status(201).json({
    status: 201,
    message: 'Successfully registered a user!',
    data: registeredUser,
  });
};
