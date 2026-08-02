import { getGuardianAnalytics } from '../services/guardianAnalyticsService.js';

export const fetchGuardianAnalytics = async (req, res, next) => {
  try {
    const analytics = await getGuardianAnalytics();
    res.status(200).json({
      success: true,
      analytics
    });
  } catch (error) {
    next(error);
  }
};
