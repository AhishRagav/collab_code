import nodegit from "nodegit";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Support for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Initializes a Git repository for the given project.
 */
export const initRepo = async (req, res) => {
  try {
    const { projectName } = req.body;
    // Define the project directory where code lives
    const projectPath = path.join(__dirname, "../../projects", projectName);

    // Ensure the directory exists; create it recursively if not.
    if (!fs.existsSync(projectPath)) {
      fs.mkdirSync(projectPath, { recursive: true });
    }

    // Initialize a repository if not already present
    const repo = await nodegit.Repository.init(projectPath, 0);
    return res.status(200).json({
      success: true,
      message: "Repository initialized",
      repoPath: projectPath
    });
  } catch (err) {
    console.error("initRepo error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Stages all changes and creates a new commit with the provided commit message.
 * Before committing, it compares the current tree with the previous commit's tree.
 * If there are no changes, it returns a "Nothing to commit" message.
 * Also returns the list of files that were committed (if a commit was created).
 */
export const commitChanges = async (req, res) => {
  try {
    const { projectName, commitMessage, authorName, authorEmail } = req.body;
    const projectPath = path.join(__dirname, "../../projects", projectName);

    // Check if project directory exists
    if (!fs.existsSync(projectPath)) {
      return res.status(400).json({
        success: false,
        message: "Project repository does not exist. Please initialize it first."
      });
    }

    const repo = await nodegit.Repository.open(projectPath);

    // Stage all changes
    const index = await repo.refreshIndex();
    await index.addAll();
    await index.write();
    const treeOid = await index.writeTree();

    // Get HEAD commit (if exists) to compare the tree
    let parent = null;
    try {
      parent = await repo.getHeadCommit();
    } catch (e) {
      parent = null;
    }

    // If there is a parent commit, compare tree hashes.
    if (parent && treeOid.tostrS() === parent.treeId().tostrS()) {
      return res.status(200).json({
        success: true,
        message: "Nothing to commit: file tree unchanged"
      });
    }

    // Use provided author details or default to fallback values.
    const author = nodegit.Signature.now(
      authorName || "Collab User",
      authorEmail || "user@example.com"
    );
    const committer = author; // For simplicity, using the same signature

    // Create commit (initial commit if no parent)
    const commitId = await repo.createCommit(
      "HEAD",
      author,
      committer,
      commitMessage,
      treeOid,
      parent ? [parent] : []
    );

    // Optionally, list files committed:
    const tree = await repo.getTree(treeOid);
    const filesCommitted = tree.entries().map(entry => entry.path());

    return res.status(200).json({
      success: true,
      commitId: commitId.tostrS(),
      message: "Changes committed successfully",
      filesCommitted
    });
  } catch (err) {
    console.error("commitChanges error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Retrieves the commit history (similar to git log) for the given project.
 * Includes both the author and committer details.
 */
export const getLogs = async (req, res) => {
  try {
    const { projectName } = req.query;
    const projectPath = path.join(__dirname, "../../projects", projectName);

    // Check if project directory exists
    if (!fs.existsSync(projectPath)) {
      return res.status(400).json({
        success: false,
        message: "Project repository does not exist. Please initialize it first."
      });
    }

    const repo = await nodegit.Repository.open(projectPath);
    const firstCommit = await repo.getMasterCommit();
    const history = firstCommit.history(nodegit.Revwalk.SORT.Time);
    const commits = [];

    await new Promise((resolve, reject) => {
      history.on("commit", (commit) => {
        commits.push({
          sha: commit.sha(),
          author: {
            name: commit.author().name(),
            email: commit.author().email()
          },
          committer: {
            name: commit.committer().name(),
            email: commit.committer().email()
          },
          date: commit.date(),
          message: commit.message()
        });
      });
      history.on("end", resolve);
      history.on("error", reject);
      history.start();
    });

    return res.status(200).json({ success: true, commits });
  } catch (err) {
    console.error("getLogs error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Pushes changes from the local repository to the remote repository.
 * Expects a non-empty remoteUrl in the request body.
 * Uses GitHub credentials from the request body or environment variables.
 */
export const pushChanges = async (req, res) => {
  try {
    const { projectName, remoteUrl, githubUsername, githubToken } = req.body;

    // Validate that remoteUrl is provided
    if (!remoteUrl) {
      return res.status(400).json({
        success: false,
        message: "Remote URL is required for push operation."
      });
    }

    // Use provided credentials or fallback to environment variables.
    const username = githubUsername || process.env.GITHUB_USERNAME;
    const token = githubToken || process.env.GITHUB_TOKEN;

    const projectPath = path.join(__dirname, "../../projects", projectName);

    // Check if project directory exists
    if (!fs.existsSync(projectPath)) {
      return res.status(400).json({
        success: false,
        message: "Project repository does not exist. Please initialize it first."
      });
    }

    const repo = await nodegit.Repository.open(projectPath);

    // Get the remote 'origin'; if not present, create it.
    let remote;
    try {
      remote = await repo.getRemote("origin");
    } catch {
      remote = await nodegit.Remote.create(repo, "origin", remoteUrl);
    }

    // Push to remote using provided credentials
    await remote.push(
      ["refs/heads/master:refs/heads/master"],
      {
        callbacks: {
          credentials: () => nodegit.Cred.userpassPlaintextNew(username, token)
        }
      }
    );
    return res.status(200).json({ success: true, message: "Pushed to remote successfully" });
  } catch (err) {
    console.error("pushChanges error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};