import express from "express";
import * as usercontroller from "../controllers/user.controllers.js";
import * as userservices from "../services/user.services.js";
import * as authmiddleware from "../middlewares/auth.middleware.js" 
import { body } from "express-validator";

const userrouter = express.Router();

userrouter.get("/", (req, res) => {
  res.send("hey from users base route: /register | /login");
});

// register
userrouter.post(
  "/register",
  body("firstname")
    .isLength({ min: 3 })
    .withMessage("First name must be at least 3 characters long"),

  body("email").isEmail().withMessage("email must be a  valid email address"),
  body("password")
    .isLength({ min: 3 })
    .withMessage("password must be atleast three digits long"),
  usercontroller.createusercontroller
);

// login 
userrouter.post("/login",

  body('email').isEmail().withMessage("email must be a valid email address"),
  body('password').isLength({min : 3}).withMessage("password must be atleast three digits long"),

  usercontroller.logincontroller
)
userrouter.post("/google-register",
  usercontroller.googlecontroller
)
userrouter.get("/allusers",authmiddleware.auth,usercontroller.getallusers);
userrouter.get("/logout" , authmiddleware.auth, usercontroller.logoutcontroller);
userrouter.get("/auth/me",authmiddleware.auth,usercontroller.getuser);
userrouter.get("/usersnotinproject/:id",authmiddleware.auth,usercontroller.usersexceptinproject)
export default userrouter;