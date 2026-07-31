import GeneratedSite from '../models/GeneratedSite.js';
import { generateWebsite } from '../services/aiService.js';

/**
 * @desc    Generate a website using AI
 * @route   POST /api/ai/generate
 * @access  Private
 */
export const generateSite = async (req, res, next) => {
  try {
    const { prompt } = req.body;

    const { html, title } = await generateWebsite(prompt);

    // Save to database
    const site = await GeneratedSite.create({
      title,
      prompt,
      html,
      user: req.user._id,
    });

    res.status(201).json({
      success: true,
      site: {
        _id: site._id,
        title: site.title,
        prompt: site.prompt,
        html: site.html,
        createdAt: site.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all generated sites for the logged-in user
 * @route   GET /api/ai/sites
 * @access  Private
 */
export const getMySites = async (req, res, next) => {
  try {
    const sites = await GeneratedSite.find({ user: req.user._id })
      .select('-html') // Don't send HTML in list view for performance
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      count: sites.length,
      sites,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get a single generated site
 * @route   GET /api/ai/sites/:id
 * @access  Private
 */
export const getSiteById = async (req, res, next) => {
  try {
    const site = await GeneratedSite.findOne({
      _id: req.params.id,
      user: req.user._id,
    }).lean();

    if (!site) {
      const error = new Error('Generated site not found');
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({
      success: true,
      site,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a generated site
 * @route   DELETE /api/ai/sites/:id
 * @access  Private
 */
export const deleteSite = async (req, res, next) => {
  try {
    const site = await GeneratedSite.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!site) {
      const error = new Error('Generated site not found');
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({
      success: true,
      message: 'Site deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
