import { Router } from "express";
const router = Router();

// Import Git controller functions (adjust the path as needed)
import * as  gitController from '../controllers/gitController.js';

// Route to initialize a new Git repository for a project
router.post('/init', gitController.initRepo);

// Route to commit changes
router.post('/commit', gitController.commitChanges);

// Route to get commit history (git log)
router.get('/logs', gitController.getLogs);

// Route to push changes to a remote repository
router.post('/push', gitController.pushChanges);

export default router;  