import { Router } from "express";
const router = Router();
import * as projectcontroller from "../controllers/project.controllers.js";
import * as authmiddleware from "../middlewares/auth.middleware.js";
import { body } from "express-validator";

router.post(
  "/create",
  authmiddleware.auth,
  body("name").isString().withMessage("name must be a string"),
  projectcontroller.createproject
);

router.get("/all", authmiddleware.auth, projectcontroller.getallprojects);
router.put(
  "/add-user",
  authmiddleware.auth,
  body("projectid").isString().withMessage("projectid is required"),
  body("users")
    .isArray({ min: 1 })
    .withMessage("The users input field must be an array of strings")
    .bail()
    .custom((users) => users.every((user) => typeof user === "string"))
    .withMessage("Every user ID should be a string"),
  projectcontroller.adduser
);
router.put(
  "/update-filetree/:id",
  authmiddleware.auth,
  body("fileTree").isObject().withMessage("fileTree should be an object"),
  projectcontroller.updateFileTree
);
router.get(
  "/get-project/:id",
  authmiddleware.auth,
  projectcontroller.getproject
);
export default router;