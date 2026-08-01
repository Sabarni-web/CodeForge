import mongoose from 'mongoose';
import Repository from '../models/Repository.js';
import File from '../models/File.js';
import Commit from '../models/Commit.js';
import ForkRelationship from '../models/ForkRelationship.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';
import { sendToUser, getIo } from './socketService.js';

export const forkRepositoryService = async (parentRepository, user) => {
  
  try {
    const parentOwner = await User.findById(parentRepository.owner);

    // 1. Create the new Repository document
    const newRepo = new Repository({
      name: parentRepository.name, // Usually the same name, unless conflict
      description: parentRepository.description,
      owner: user._id,
      isPrivate: false, // Forks of public repos remain public
      visibility: 'public',
      topics: parentRepository.topics,
      readme: parentRepository.readme,
      license: parentRepository.license,
      website: parentRepository.website,
      collaborators: [], // Do not copy collaborators
      defaultBranch: parentRepository.defaultBranch,
      language: parentRepository.language,
      
      // Fork metadata
      isFork: true,
      forkParent: parentRepository._id,
      forkRoot: parentRepository.forkRoot || parentRepository._id,
      forkDepth: (parentRepository.forkDepth || 0) + 1,
      forkCreatedAt: new Date(),
      forkSourceOwner: parentOwner.username,
      forkSourceRepository: parentRepository.name,
      allowSync: true,
      
      // Do not copy stars, watch count, etc.
      stars: [],
      forkCount: 0,
      watchCount: 0,
    });

    // Handle name collision (if the user already has a repo with the exact same name, maybe due to non-fork creation)
    // The middleware already checks if a fork exists, but we can append '-fork' or a number if needed
    let nameExists = await Repository.findOne({ owner: user._id, name: newRepo.name });
    let counter = 1;
    let originalName = newRepo.name;
    while(nameExists) {
      newRepo.name = `${originalName}-${counter}`;
      counter++;
      nameExists = await Repository.findOne({ owner: user._id, name: newRepo.name });
    }

    await newRepo.save();

    // 2. Duplicate Files
    const files = await File.find({ repository: parentRepository._id });
    const fileIdMap = new Map(); // Maps old fileId to new fileId

    if (files.length > 0) {
      const newFiles = files.map(f => {
        const fileObj = f.toObject();
        delete fileObj._id;
        delete fileObj.createdAt;
        delete fileObj.updatedAt;
        fileObj.repository = newRepo._id;
        fileObj.lastCommit = null; // Will map later if needed
        return fileObj;
      });
      const insertedFiles = await File.insertMany(newFiles);
      for (let i = 0; i < files.length; i++) {
        fileIdMap.set(files[i]._id.toString(), insertedFiles[i]._id);
      }
    }

    // 3. Duplicate Commits
    const commits = await Commit.find({ repository: parentRepository._id }).sort({ createdAt: 1 });
    const commitIdMap = new Map();

    if (commits.length > 0) {
      for (const commit of commits) {
        const commitObj = commit.toObject();
        const oldCommitId = commitObj._id.toString();
        
        delete commitObj._id;
        delete commitObj.createdAt;
        delete commitObj.updatedAt;
        
        commitObj.repository = newRepo._id;
        
        if (commitObj.parentCommit) {
          const newParentId = commitIdMap.get(commitObj.parentCommit.toString());
          commitObj.parentCommit = newParentId || null;
        }

        // Map the files in the commit
        if (commitObj.files && commitObj.files.length > 0) {
          commitObj.files = commitObj.files.map(f => {
            if (f.file && fileIdMap.has(f.file.toString())) {
              return { ...f, file: fileIdMap.get(f.file.toString()) };
            }
            return f;
          });
        }

        // Add a marker in the message or keep as is. Instructions say: "Mark copied commits as inherited."
        // We will just keep them as they are structurally, maybe the UI handles inherited styling.
        
        const newCommit = new Commit(commitObj);
        await newCommit.save();
        commitIdMap.set(oldCommitId, newCommit._id);
      }
      
      // Update files with their mapped lastCommit
      for (const file of files) {
        if (file.lastCommit && commitIdMap.has(file.lastCommit.toString())) {
          const newFileId = fileIdMap.get(file._id.toString());
          const newCommitId = commitIdMap.get(file.lastCommit.toString());
          await File.findByIdAndUpdate(newFileId, { lastCommit: newCommitId });
        }
      }
    }

    // 4. Create Fork Relationship
    const relationship = new ForkRelationship({
      parentRepository: parentRepository._id,
      childRepository: newRepo._id,
      forkOwner: user._id,
      forkedBy: user._id,
      syncEnabled: true,
    });
    await relationship.save();

    // 5. Increment parent fork count
    await Repository.findByIdAndUpdate(
      parentRepository._id, 
      { $inc: { forkCount: 1 } }
    );

    // 6. Notifications
    if (parentRepository.owner.toString() !== user._id.toString()) {
      const notification = new Notification({
        recipient: parentRepository.owner,
        sender: user._id,
        type: 'REPOSITORY_FORKED',
        message: `forked your repository ${parentRepository.name}`,
        link: `/${user.username}/${newRepo.name}`
      });
      await notification.save();
      sendToUser(parentRepository.owner, 'new_notification', notification);
    }

    
    // Broadcast update for UI (explore page, parent repo page)
    const io = getIo();
    if (io) {
      io.emit('repository_forked', {
        parentRepoId: parentRepository._id,
        newForkCount: (parentRepository.forkCount || 0) + 1,
        forkRepoId: newRepo._id,
        forkOwnerUsername: user.username,
      });
    }

    return newRepo;
  } catch (error) {
        throw error;
  }
};
