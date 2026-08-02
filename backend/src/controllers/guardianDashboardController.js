import { getUserGuardianDashboard } from '../services/guardianDashboardService.js';

export const fetchUserDashboard = async (req, res, next) => {
  try {
    const dashboardData = await getUserGuardianDashboard(req.user._id);
    res.status(200).json({
      success: true,
      data: dashboardData
    });
  } catch (error) {
    next(error);
  }
};
