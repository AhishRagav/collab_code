import { Router } from "express";
import * as authmiddleware from "../middlewares/auth.middleware.js";
import { body } from "express-validator";
import * as chatController from '../controllers/chat.controllers.js'
const router= Router();

router.post(
    "/add-chat",
    authmiddleware.auth,
//     body("projectid")
//   .isString().withMessage("Project ID is required and must be a string")
//   .bail()
//   .custom((projectid) => {
//       console.log("Received projectid:", projectid);
//       projectid=projectid.toString();
//       let rs=mongoose.Types.ObjectId.isValid(projectid);
//       console.log(rs);
//       return rs;
//   })
//   .withMessage("Invalid project ID format"),
    chatController.addChatToProjectid
  );

router.delete("/delete-chat",authmiddleware.auth,chatController.deleteMessage)

router.put("/edit-chat",authmiddleware.auth,chatController.editchat)

router.post("/get-chat",authmiddleware.auth,chatController.getChatById);

export default router;