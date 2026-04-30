import { validationResult } from "express-validator";
import * as userservice from "../services/user.services.js";
import usermodel from '../db/models/user_model.js';

// Get logged-in user (requires middleware that sets req.user)
export const getuser =(req,res)=>{
  if(!req.user){
    // If token is invalid or user not attached
    return res.status(400).json({message:"invalid token"});
  } 
  else {
    console.log(req.user);
    // Return current user info
    return res.status(200).json({user:req.user});
  }
}

// Login controller
export const logincontroller = async (req, res) => {
  console.log(req.body);

  // Validate request using express-validator
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  // Call service to authenticate user
  const response = await userservice.loginuser(req.body);

  if (response.status === "error") {
    // Invalid credentials
    res.status(401).send(response.message);
  }
  else {
    // Generate JWT token
    const token = response.generateJWT();

    // Store token in cookie
    res.cookie("token",token);

    // Remove password before sending response
    delete response._doc.password;

    res.status(200).json({ response, token });
  }
}

// Create user (signup)
export const createusercontroller = async (req, res) => {
  const errors = validationResult(req);
  console.log(errors);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    // Create new user
    const user = await userservice.createuser(req.body);

    // Generate JWT token
    const token = user.generateJWT();

    // Remove password from response
    delete user._doc.password;

    // Store token in cookie (NOTE: httpOnly=false is insecure in production)
    res.cookie("token", token, { httpOnly: false });

    res.status(201).json({ user, token });
  }
  catch (err) {
    res.status(400).send(err.message);
  }
}

// Google OAuth login/signup
export const googlecontroller = async (req, res) => {
  const { email, firstname, lastname } = req.body;

  // Create or fetch user via Google
  const response = await userservice.googleuser(email, firstname, lastname);

  if (response.status === "error") {
    return res.status(400).send(response.message);
  }

  // Generate token
  const token = response.generateJWT();

  // Remove password
  delete response._doc.password;

  res.cookie("token", token, { httpOnly: false });

  res.status(201).json({ response, token });
}

// Get all users except logged-in user
export const getallusers = async (req, res) => {
  console.log(req.user);

  try {
    const loggedin_user = req.user?.email;

    if (!loggedin_user) {
      return res.status(401).send("User not logged in.");
    }

    // Fetch current user from DB
    const user = await usermodel.findOne({ email: loggedin_user });

    if (!user) {
      return res.status(404).send("Logged-in user not found.");
    }

    // Fetch all users except current user
    const response = await userservice.allusersexceptid({user_id:user._id}); 
      
    if (response.status === "error") {
      return res.status(400).send(response.message);
    }

    return res.status(200).send(response.allusers);

  } catch (error) {
    // Server error
    return res.status(500).send(error.message);
  }
};

// Return profile (simple endpoint)
export const profilecontroller = async (req, res) => {
  res.status(200).json({
    user: req.user
  })
}

// Service-like function (NOTE: shouldn't be in controller file ideally)
export const allusersexceptid = async(userid) =>{
  try {
    if(!userid){
      throw new Error("project services did not receive the userid");
    }

    // Fetch all users except given user id
    const allusers = await usermodel.find({
      _id : { $ne : userid}
    });

    return {
      status : "success",
      allusers : allusers
    };
  } catch (error) {
    return {
      status : "error",
      message : error.message
    }
  }
}

// Get users not in a specific project
export const usersexceptinproject=async (req,res)=>{
  let project_id= req.params.id;

  let response= await userservice.allusersExceptInProjectid({project_id});

  if(response.status=='error'){
    // Wrong order: status should come before json
    res.status(401).json(response.message);
  }
  else {
    return res.status(200).json(response.allusers);
  }
}

// Logout controller
export const logoutcontroller = async (req, res) => {
  try {
    // Get token from cookie or Authorization header
    const token = req.cookies.token || 
      (req.headers.authorization && req.headers.authorization.split(' ')[1]);

    // Add token to blacklist in Redis (expires in 24 hrs)
    redisclient.set(token,'logout','EX',60*60*24);

    res.status(200).json({
      message : "user logged out successfully"
    })
  }
  catch (err) {
    console.log(err);
    res.status(400).send(err);
  }
}