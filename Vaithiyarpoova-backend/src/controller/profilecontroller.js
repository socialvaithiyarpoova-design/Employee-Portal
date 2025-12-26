const { getPool } = require('../database/db');
const db = getPool();

exports.getProfileData = async (req, res) => {
  const { user_id, user_typecode } = req.body;
  try {
    if (!user_id || !user_typecode) {
      return res.status(400).json({ message: 'user_id and user_typecode are required.' });
    }

    const sql = 'CALL SP_GetProfileData(?, ?)';
    db.query(sql, [user_id, user_typecode], (err, results) => {
      if (err) {
        console.error('Error fetching profile data:', err);
        return res.status(500).json({ message: 'Server error while fetching profile data.' });
      }

      // SP returns 4 resultsets: profile, incentive, achievements, echo
      const profileData = results?.[0]?.[0] ?? null;
      const incentiveData = results?.[1]?.[0] ?? null;
      const achievementsData = results?.[2] ?? [];
      const echoData = results?.[3]?.[0] ?? null;

      return res.status(200).json({
        message: 'Profile data fetched successfully.',
        data: {
          profile: profileData,
          incentive: incentiveData,
          achievements: achievementsData,
          echo: echoData
        }
      });
    });

  } catch (err) {
    console.error('Unexpected error:', err);
    return res.status(500).json({ message: 'Unexpected server error.' });
  }
};
