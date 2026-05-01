import { validationResult } from "express-validator";
import usermodel from "../db/models/user_model.js";
import * as projectservices from "../services/project.services.js";
import user from "../db/models/user_model.js";

export const createproject = async (req, res) => {

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ status: "error", errors: errors.array() });
  }

  try {
    const loggedin_user = req.user.email;
    // console.log("Email check:", loggedin_user);
    const user = await usermodel.findOne({ email: loggedin_user });
    if (!user) {
      return res.status(404).json({ status: "error", message: "User not found" });
    }

    delete user._doc.password;

    const { name,description} = req.body;
    const project = await projectservices.createaproject(name, description,user._id);

    if (project.status === "error") {
      return res.status(400).json({ status: "error", message: project.message });
    }

    return res.status(201).json({ status: "success", project });
  } catch (err) {
    console.error("Error in createproject:", err.message);
    return res.status(500).json({ status: "error", message: "Internal Server Error" });
  }
};

export const getallprojects = async (req, res) => {
  try {
    const loggedin_user = req.user.email;
    const user = await usermodel.findOne({ email: loggedin_user });
    
    const all_projects = await projectservices.getallprojectsbyid(user._id);

    if (all_projects.status === "error") {
      return res.staus(400).send(all_projects.message);
    }
    return res.status(200).send(all_projects);

  } catch (error) {
    res.staus(400).send(err.message);
  }

};

export const updateFileTree = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ status: "error", errors: errors.array() });
  }
  try {
    const projectid = req.params.id;
    const { fileTree } = req.body;
    const response = await projectservices.updateFileTree(projectid, fileTree);
    if (response.status === "error") {
      return res.status(400).json({ status: "error", message: response.message });
    }
    return res.status(200).json({ status: "success", project: response.project });
  } catch (err) {
    console.error("Error in updateFileTree:", err.message);
    return res.status(500).json({ status: "error", message: "Internal Server Error" });
  }
};
export const adduser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).send(errors.array());
  }
  try {
    const { users, projectid } = req.body;
    const loggedin_user = req.user.email;
    console.log(loggedin_user);
    const user = await usermodel.findOne({ email: loggedin_user });
    const response = await projectservices.adduserstoproject(users, projectid, user._id);
    if (response.status === "error") {
      return res.status(400).send(response.message);
    }
    return res.status(200).send(response.project);
  } catch (error) {
    console.log("error inn adduser controller : ", err);
    return res.status(400).send(err.message);
  }



}
export const getproject = async (req, res) => {
  try {
    const projectid = req.params.id;
    const response = await projectservices.getproject_(projectid);
    if (response.status === "error") {
      return res.status(400).send(response.message);
    }
    return res.status(200).send(response.project);
  } catch (error) {
    res.status(400).send(error.message);
  }
}