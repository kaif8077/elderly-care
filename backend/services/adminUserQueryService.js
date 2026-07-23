const User = require('../models/User');

const SORT_FIELDS = {
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  name: 'name',
  email: 'email'
};

const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const calculateCompletion = (profile) => {
  if (!profile) return 0;
  const fields = [
    profile.name,
    profile.dob,
    profile.gender,
    profile.bloodGroup,
    profile.height,
    profile.weight,
    profile.phone,
    profile.address,
    profile.emergencyContact,
    profile.emergencyPhone,
    profile.dietPreference
  ];
  return Math.round((fields.filter((value) => value !== null && value !== undefined && value !== '').length / fields.length) * 100);
};

const isProfileComplete = (profile) => Boolean(
  profile
  && profile.name
  && profile.dob
  && profile.gender
  && profile.phone
  && profile.address
  && profile.emergencyContact
  && profile.emergencyPhone
);

const completeProfileExpression = {
  $and: [
    { $ne: ['$profile', null] },
    { $ne: ['$profile.name', null] },
    { $ne: ['$profile.dob', null] },
    { $ne: ['$profile.gender', null] },
    { $ne: ['$profile.phone', null] },
    { $ne: ['$profile.address', null] },
    { $ne: ['$profile.emergencyContact', null] },
    { $ne: ['$profile.emergencyPhone', null] }
  ]
};

const parseQuery = (query) => {
  const page = Math.max(Number.parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(Number.parseInt(query.limit, 10) || 10, 5), 50);
  const sortBy = SORT_FIELDS[query.sortBy] || 'createdAt';
  const sortOrder = query.sortOrder === 'asc' ? 1 : -1;
  return { page, limit, sortBy, sortOrder };
};

const listUsers = async (query) => {
  const { page, limit, sortBy, sortOrder } = parseQuery(query);
  const match = { role: { $nin: ['admin', 'super_admin'] } };

  if (query.accountStatus && ['active', 'inactive', 'suspended', 'archived'].includes(query.accountStatus)) {
    match.accountStatus = query.accountStatus;
  } else {
    match.isDeleted = { $ne: true };
  }

  const pipeline = [
    { $match: match },
    {
      $lookup: {
        from: 'medicalprofiles',
        let: { userId: '$_id' },
        pipeline: [
          { $match: { $expr: { $eq: ['$userId', '$$userId'] } } },
          { $sort: { createdAt: -1 } },
          { $limit: 1 },
          {
            $project: {
              name: 1, dob: 1, gender: 1, bloodGroup: 1, height: 1, weight: 1,
              phone: 1, address: 1, emergencyContact: 1, emergencyPhone: 1,
              dietPreference: 1, updatedAt: 1
            }
          }
        ],
        as: 'profiles'
      }
    },
    { $set: { profile: { $first: '$profiles' } } },
    {
      $lookup: {
        from: 'qrcodes',
        let: { userId: '$_id' },
        pipeline: [
          { $match: { $expr: { $eq: ['$userId', '$$userId'] } } },
          { $sort: { createdAt: -1 } },
          { $limit: 1 },
          { $project: { _id: 1, createdAt: 1, status: 1, token: 1 } }
        ],
        as: 'qrCodes'
      }
    },
    { $set: { qrCode: { $first: '$qrCodes' } } }
  ];

  if (query.search?.trim()) {
    const expression = new RegExp(escapeRegex(query.search.trim()), 'i');
    pipeline.push({
      $match: {
        $or: [
          { name: expression },
          { email: expression },
          { 'profile.name': expression },
          { 'profile.phone': expression }
        ]
      }
    });
  }

  if (query.bloodGroup) pipeline.push({ $match: { 'profile.bloodGroup': query.bloodGroup } });
  if (query.profileStatus === 'complete') {
    pipeline.push({ $match: { $expr: completeProfileExpression } });
  } else if (query.profileStatus === 'incomplete') {
    pipeline.push({ $match: { $expr: { $not: [completeProfileExpression] } } });
  }
  if (query.qrStatus === 'generated') pipeline.push({ $match: { qrCode: { $ne: null } } });
  if (query.qrStatus === 'active') pipeline.push({ $match: { 'qrCode.status': 'active', 'qrCode.token': { $ne: null } } });
  if (query.qrStatus === 'revoked') pipeline.push({ $match: { 'qrCode.status': 'revoked' } });
  if (query.qrStatus === 'missing') pipeline.push({ $match: { qrCode: null } });

  pipeline.push(
    { $sort: { [sortBy]: sortOrder, _id: 1 } },
    {
      $facet: {
        rows: [
          { $skip: (page - 1) * limit },
          { $limit: limit },
          {
            $project: {
              password: 0,
              permissions: 0,
              sessionVersion: 0,
              failedLoginAttempts: 0,
              lockedUntil: 0,
              profiles: 0,
              qrCodes: 0
            }
          }
        ],
        total: [{ $count: 'count' }]
      }
    }
  );

  const [result] = await User.aggregate(pipeline);
  const total = result.total[0]?.count || 0;
  const users = result.rows.map((user) => ({
    id: user._id,
    elderlyCareId: null,
    name: user.profile?.name || user.name,
    email: user.email,
    phone: user.profile?.phone || null,
    dob: user.profile?.dob || null,
    gender: user.profile?.gender || null,
    bloodGroup: user.profile?.bloodGroup || null,
    profileCompletion: calculateCompletion(user.profile),
    profileStatus: isProfileComplete(user.profile) ? 'complete' : 'incomplete',
    reportStatus: 'not_available',
    qrStatus: user.qrCode?.token ? user.qrCode.status : (user.qrCode ? 'legacy' : 'missing'),
    accountStatus: user.accountStatus || 'active',
    createdAt: user.createdAt || null,
    updatedAt: user.profile?.updatedAt || user.updatedAt || null
  }));

  return {
    users,
    pagination: {
      page,
      limit,
      total,
      pages: Math.max(Math.ceil(total / limit), 1)
    }
  };
};

module.exports = { calculateCompletion, isProfileComplete, listUsers, parseQuery };
