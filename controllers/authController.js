// import User from '../models/User.js';
// import jwt from 'jsonwebtoken';

// // Generate JWT Token
// const generateToken = (id) => {
//   return jwt.sign({ id }, process.env.JWT_SECRET, {
//     expiresIn: process.env.JWT_EXPIRE || '30d'
//   });
// };

// // Register User
// const register = async (req, res) => {
//   try {
//     const { name, email, password, phone, role, dateOfBirth, address, diagnosticCenterId } = req.body;

//     // Check if user exists
//     const existingUser = await User.findOne({ email });
//     if (existingUser) {
//       return res.status(400).json({
//         success: false,
//         message: 'User already exists with this email'
//       });
//     }

//     // Create user
//     const user = await User.create({
//       name,
//       email,
//       password,
//       phone,
//       role,
//       dateOfBirth,
//       address,
//       diagnosticCenterId
//     });

//     // Generate token
//     const token = generateToken(user._id);

//     res.status(201).json({
//       success: true,
//       message: 'User registered successfully',
//       token,
//       user: {
//         id: user._id,
//         name: user.name,
//         email: user.email,
//         role: user.role
//       }
//     });
//   } catch (error) {
//     console.error('Registration error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Registration failed',
//       error: error.message
//     });
//   }
// };

// // Login User
// const login = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     // Validate input
//     if (!email || !password) {
//       return res.status(400).json({
//         success: false,
//         message: 'Please provide email and password'
//       });
//     }

//     // Find user
//     const user = await User.findOne({ email }).select('+password');
//     if (!user || !user.isActive) {
//       return res.status(401).json({
//         success: false,
//         message: 'Invalid credentials'
//       });
//     }

//     // Check password
//     const isPasswordValid = await user.comparePassword(password);
//     if (!isPasswordValid) {
//       return res.status(401).json({
//         success: false,
//         message: 'Invalid credentials'
//       });
//     }

//     // Generate token
//     const token = generateToken(user._id);

//     res.status(200).json({
//       success: true,
//       message: 'Login successful',
//       token,
//       user: {
//         id: user._id,
//         name: user.name,
//         email: user.email,
//         role: user.role
//       }
//     });
//   } catch (error) {
//     console.error('Login error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Login failed',
//       error: error.message
//     });
//   }
// };

// // Get User Profile
// const getProfile = async (req, res) => {
//   try {
//     const user = await User.findById(req.user.id).populate('diagnosticCenterId');
    
//     res.status(200).json({
//       success: true,
//       user
//     });
//   } catch (error) {
//     console.error('Get profile error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to get profile',
//       error: error.message
//     });
//   }
// };

// export {
//   register,
//   login,
//   getProfile
// };


import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import dotenv from "dotenv"

dotenv.config();

// Email transporter setup (using Gmail as example)
// const transporter = nodemailer.createTransport({
//   service: 'gmail', // or your email service
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS
//   }
// });

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d'
  });
};

// Send OTP Email
const sendOTPEmail = async (email, otp, type = 'registration') => {
  const subject = type === 'registration' ? 'Verify Your Registration' : 'Password Reset OTP';
  const text = type === 'registration' 
    ? `Your registration OTP is: ${otp}. This OTP will expire in 10 minutes.`
    : `Your password reset OTP is: ${otp}. This OTP will expire in 10 minutes.`;

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject,
      text
    });
    console.log(`OTP email sent to ${email}`);
  } catch (error) {
    console.error('Error sending OTP email:', error);
    throw new Error('Failed to send OTP email');
  }
};

// Register User (Step 1 - Send OTP)
const register = async (req, res) => {
  try {
    const { name, email, password, phone, role, dateOfBirth, address, diagnosticCenterId } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser && existingUser.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    let user;
    if (existingUser && !existingUser.isEmailVerified) {
      // Update existing unverified user
      user = existingUser;
      user.name = name;
      user.password = password;
      user.phone = phone;
      user.role = role || 'patient';
      user.dateOfBirth = dateOfBirth;
      user.diagnosticCenterId = diagnosticCenterId;
    } else {
      // Create new user
      user = new User({
        name,
        email,
        password,
        phone,
        role: role || 'patient',
        diagnosticCenterId,
        isActive: false,
        isEmailVerified: false
      });
    }

    // Generate and send OTP
    const otp = user.generateOTP('registration');
    await user.save();
    
    // Send OTP email
    await sendOTPEmail(email, otp, 'registration');

    res.status(200).json({
      success: true,
      message: 'OTP sent to your email. Please verify to complete registration.',
      userId: user._id
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message
    });
  }
};

// Verify OTP for Registration
const verifyRegistrationOTP = async (req, res) => {
  try {
    const { userId, otp } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.otpType !== 'registration') {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP type'
      });
    }

    if (!user.verifyOTP(otp)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP'
      });
    }

    // Activate user account
    user.isActive = true;
    user.isEmailVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    user.otpType = undefined;
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Registration completed successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({
      success: false,
      message: 'OTP verification failed',
      error: error.message
    });
  }
};

// Forgot Password (Step 1 - Send OTP)
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user || !user.isEmailVerified) {
      return res.status(404).json({
        success: false,
        message: 'User not found or email not verified'
      });
    }

    // Generate and send OTP
    const otp = user.generateOTP('password_reset');
    await user.save();
    
    // Send OTP email
    await sendOTPEmail(email, otp, 'password_reset');

    res.status(200).json({
      success: true,
      message: 'Password reset OTP sent to your email',
      userId: user._id
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process forgot password request',
      error: error.message
    });
  }
};

// Reset Password (Step 2 - Verify OTP and Reset)
const resetPassword = async (req, res) => {
  try {
    const { userId, otp, newPassword } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.otpType !== 'password_reset') {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP type'
      });
    }

    if (!user.verifyOTP(otp)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP'
      });
    }

    // Reset password
    user.password = newPassword;
    user.otp = undefined;
    user.otpExpires = undefined;
    user.otpType = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successfully'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Password reset failed',
      error: error.message
    });
  }
};

// Login User
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Find user
    const user = await User.findOne({ email }).select('+password');
    // || !user.isEmailVerified
    if (!user || !user.isActive ) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials or account not verified'
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
};

// Get User Profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('diagnosticCenterId');
    
    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get profile',
      error: error.message
    });
  }
};

export {
  register,
  verifyRegistrationOTP,
  forgotPassword,
  resetPassword,
  login,
  getProfile
};

