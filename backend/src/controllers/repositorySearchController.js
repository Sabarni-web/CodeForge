import * as searchService from '../services/repositorySearchService.js';

export const searchPublicRepositories = async (req, res, next) => {
  try {
    const result = await searchService.searchPublicRepositories(req.query);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};
