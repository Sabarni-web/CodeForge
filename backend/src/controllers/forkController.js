import { forkRepositoryService } from '../services/forkService.js';
import { getRepositoryNetwork, getUpstreamRepository } from '../services/forkAnalyticsService.js';
import Repository from '../models/Repository.js';

export const forkRepository = async (req, res) => {
  try {
    const parentRepo = req.parentRepository; // from middleware
    const newRepo = await forkRepositoryService(parentRepo, req.user);
    
    // Return populated response
    const populatedRepo = await Repository.findById(newRepo._id)
      .populate('owner', 'username avatar name')
      .populate('collaborators', 'username avatar')
      .populate('stars', 'username');

    res.status(201).json({
      message: 'Repository forked successfully',
      repository: populatedRepo
    });
  } catch (error) {
    console.error('Fork repository error:', error);
    res.status(500).json({ message: 'Server error while forking repository' });
  }
};

export const getUserForks = async (req, res) => {
  try {
    const userId = req.user.id;
    const forks = await Repository.find({ owner: userId, isFork: true })
      .populate('owner', 'username avatar name')
      .sort({ createdAt: -1 });

    res.status(200).json(forks);
  } catch (error) {
    console.error('Get user forks error:', error);
    res.status(500).json({ message: 'Server error fetching user forks' });
  }
};

export const getRepositoryForks = async (req, res) => {
  try {
    const { id } = req.params;
    const forks = await Repository.find({ forkParent: id, isPrivate: false })
      .populate('owner', 'username avatar name')
      .sort({ createdAt: -1 });

    res.status(200).json(forks);
  } catch (error) {
    console.error('Get repo forks error:', error);
    res.status(500).json({ message: 'Server error fetching repository forks' });
  }
};

export const getNetwork = async (req, res) => {
  try {
    const { id } = req.params;
    const repo = await Repository.findById(id);
    if (!repo) {
      return res.status(404).json({ message: 'Repository not found' });
    }
    
    const rootId = repo.forkRoot || repo._id;
    const network = await getRepositoryNetwork(rootId);
    
    res.status(200).json(network);
  } catch (error) {
    console.error('Get network error:', error);
    res.status(500).json({ message: 'Server error fetching network graph' });
  }
};

export const getUpstream = async (req, res) => {
  try {
    const { id } = req.params;
    const upstream = await getUpstreamRepository(id);
    if (!upstream) {
      return res.status(404).json({ message: 'Upstream not found or repo is not a fork' });
    }
    res.status(200).json(upstream);
  } catch (error) {
    console.error('Get upstream error:', error);
    res.status(500).json({ message: 'Server error fetching upstream repository' });
  }
};

export const checkIsFork = async (req, res) => {
  try {
    const { id } = req.params;
    const repo = await Repository.findById(id).select('isFork forkParent');
    if (!repo) {
      return res.status(404).json({ message: 'Repository not found' });
    }
    res.status(200).json({ isFork: repo.isFork, forkParent: repo.forkParent });
  } catch (error) {
    console.error('Check is fork error:', error);
    res.status(500).json({ message: 'Server error checking fork status' });
  }
};
