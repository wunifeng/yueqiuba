// 数据库初始化云函数
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const { action } = event
  
  try {
    switch (action) {
      case 'initCollections':
        return await initCollections()
      case 'createIndexes':
        return await createIndexes()
      case 'setupSecurity':
        return await setupSecurityRules()
      case 'validateSecurity':
        return await validateSecurityConfiguration()
      case 'createDefaultAdmin':
        return await createDefaultAdmin(event.adminData)
      case 'initAll':
        const collectionsResult = await initCollections()
        const indexesResult = await createIndexes()
        const securityResult = await setupSecurityRules()
        return {
          success: true,
          collections: collectionsResult,
          indexes: indexesResult,
          security: securityResult
        }
      case 'cleanupInitDocs':
        return await cleanupInitDocs()
      case 'cleanupDuplicateSessions':
        return await cleanupDuplicateSessions()
      case 'cleanupExpiredSessions':
        return await cleanupExpiredSessions()
      default:
        throw new Error('Invalid action')
    }
  } catch (error) {
    console.error('数据库初始化错误:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

// 初始化数据库集合
async function initCollections() {
  const collections = [
    'users',
    'sessions', 
    'activities',
    'participations',
    'reviews',
    'notifications',
    'venues',
    'security_logs'  // 新增安全日志集合
  ]
  
  const results = []
  
  for (const collectionName of collections) {
    try {
      // 方法1: 使用 createCollection API（如果可用）
      try {
        await db.createCollection(collectionName)
        results.push({
          collection: collectionName,
          status: 'created',
          message: '集合已通过 createCollection 创建'
        })
        continue
      } catch (createError) {
        // 如果 createCollection 不可用或集合已存在，继续使用备用方法
        console.log(`createCollection 失败 (${collectionName}):`, createError.message)
      }
      
      // 方法2: 通过插入文档创建集合，但保留一个初始化文档
      const initDoc = await db.collection(collectionName).add({
        data: { 
          _init: true,
          _createTime: new Date(),
          _note: 'Collection initialization document - safe to delete',
          _version: '1.0.0'
        }
      })
      
      // 验证集合是否真的创建成功
      const testQuery = await db.collection(collectionName).where({
        _init: true
      }).get()
      
      if (testQuery.data.length > 0) {
        results.push({
          collection: collectionName,
          status: 'created_with_init_doc',
          message: '集合已创建，包含初始化文档',
          initDocId: initDoc._id
        })
      } else {
        throw new Error('集合创建验证失败')
      }
      
    } catch (error) {
      // 尝试查询集合来检查是否已存在
      try {
        await db.collection(collectionName).limit(1).get()
        results.push({
          collection: collectionName,
          status: 'exists',
          message: '集合已存在'
        })
      } catch (queryError) {
        results.push({
          collection: collectionName,
          status: 'error',
          error: error.message,
          queryError: queryError.message
        })
      }
    }
  }
  
  return {
    success: true,
    results: results
  }
}

// 创建数据库索引
async function createIndexes() {
  const indexes = [
    // users 集合索引
    {
      collection: 'users',
      indexes: [
        { keys: { openid: 1 }, unique: true },
        { keys: { phoneNumber: 1 }, sparse: true },
        { keys: { userRole: 1 } },
        { keys: { createTime: -1 } }
      ]
    },
    // sessions 集合索引
    {
      collection: 'sessions',
      indexes: [
        { keys: { openid: 1, token: 1 }, unique: true },
        { keys: { userId: 1 } },
        { keys: { expireTime: 1 } },
        { keys: { createTime: -1 } }
      ]
    },
    // activities 集合索引
    {
      collection: 'activities',
      indexes: [
        { keys: { organizerId: 1 } },
        { keys: { openid: 1 } },
        { keys: { type: 1 } },
        { keys: { status: 1 } },
        { keys: { activityTime: 1 } },
        { keys: { location: 1 } },
        { keys: { isPublic: 1 } },
        { keys: { createTime: -1 } },
        { keys: { rating: -1 } },
        { keys: { type: 1, activityTime: 1 } },
        { keys: { status: 1, activityTime: 1 } }
      ]
    },
    // participations 集合索引
    {
      collection: 'participations',
      indexes: [
        { keys: { activityId: 1, userId: 1 }, unique: true },
        { keys: { activityId: 1 } },
        { keys: { userId: 1 } },
        { keys: { openid: 1 } },
        { keys: { status: 1 } },
        { keys: { joinTime: -1 } },
        { keys: { userId: 1, status: 1 } }
      ]
    },
    // reviews 集合索引
    {
      collection: 'reviews',
      indexes: [
        { keys: { activityId: 1, userId: 1 }, unique: true },
        { keys: { activityId: 1 } },
        { keys: { userId: 1 } },
        { keys: { openid: 1 } },
        { keys: { rating: 1 } },
        { keys: { createTime: -1 } }
      ]
    },
    // notifications 集合索引
    {
      collection: 'notifications',
      indexes: [
        { keys: { userId: 1 } },
        { keys: { openid: 1 } },
        { keys: { type: 1 } },
        { keys: { isRead: 1 } },
        { keys: { createTime: -1 } },
        { keys: { userId: 1, isRead: 1 } },
        { keys: { userId: 1, createTime: -1 } }
      ]
    },
    // venues 集合索引
    {
      collection: 'venues',
      indexes: [
        { keys: { managerId: 1 } },
        { keys: { managerOpenid: 1 } },
        { keys: { status: 1 } },
        { keys: { facilities: 1 } },
        { keys: { rating: -1 } },
        { keys: { createTime: -1 } },
        { keys: { 'location.latitude': 1, 'location.longitude': 1 } }
      ]
    }
  ]
  
  const results = []
  
  for (const collectionIndexes of indexes) {
    const collectionName = collectionIndexes.collection
    
    for (const indexSpec of collectionIndexes.indexes) {
      try {
        // 注意：在实际的微信云开发中，索引需要通过控制台手动创建
        // 这里只是记录需要创建的索引信息
        results.push({
          collection: collectionName,
          index: indexSpec,
          status: 'documented',
          note: '需要在云开发控制台手动创建此索引'
        })
      } catch (error) {
        results.push({
          collection: collectionName,
          index: indexSpec,
          status: 'error',
          error: error.message
        })
      }
    }
  }
  
  return {
    success: true,
    results: results,
    note: '索引需要在微信云开发控制台中手动创建'
  }
}

// 清理初始化文档
async function cleanupInitDocs() {
  const collections = [
    'users',
    'sessions', 
    'activities',
    'participations',
    'reviews',
    'notifications',
    'venues'
  ]
  
  const results = []
  
  for (const collectionName of collections) {
    try {
      const initDocs = await db.collection(collectionName).where({
        _init: true
      }).get()
      
      let deletedCount = 0
      for (const doc of initDocs.data) {
        await db.collection(collectionName).doc(doc._id).remove()
        deletedCount++
      }
      
      results.push({
        collection: collectionName,
        status: 'cleaned',
        deletedCount: deletedCount
      })
      
    } catch (error) {
      results.push({
        collection: collectionName,
        status: 'error',
        error: error.message
      })
    }
  }
  
  return {
    success: true,
    results: results
  }
}
/**
 *
 设置安全规则配置指南
 */
async function setupSecurityRules() {
  const securityConfiguration = {
    message: '数据库安全规则配置指南 - 基于用户身份的权限控制',
    version: '2.0',
    lastUpdated: new Date().toISOString(),
    
    configurationSteps: [
      '1. 登录微信云开发控制台 (https://console.cloud.tencent.com/tcb)',
      '2. 选择对应的云开发环境',
      '3. 进入"数据库" -> "安全规则"',
      '4. 为每个集合配置以下安全规则',
      '5. 测试规则配置是否正确生效',
      '6. 监控安全日志确保规则有效'
    ],
    
    collections: {
      users: {
        description: '用户信息集合 - 严格的个人数据保护',
        rules: {
          read: "auth != null && (auth.openid == resource.openid || get('database').collection('users').where({openid: auth.openid}).get().data[0].userRole == 'admin')",
          write: "auth != null && auth.openid == resource.openid && resource.isActive != false"
        },
        fieldLevelSecurity: {
          phoneNumber: "auth.openid == resource.openid || get('database').collection('users').where({openid: auth.openid}).get().data[0].userRole == 'admin'",
          userRole: "get('database').collection('users').where({openid: auth.openid}).get().data[0].userRole == 'admin'",
          privacySettings: "auth.openid == resource.openid"
        }
      },
      
      sessions: {
        description: '用户会话管理 - 仅用户本人可访问',
        rules: {
          read: "auth != null && auth.openid == resource.openid",
          write: false
        }
      },
      
      activities: {
        description: '活动信息集合 - 公开读取，创建者和管理员可写',
        rules: {
          read: true,
          write: "auth != null && (auth.openid == resource.openid || get('database').collection('users').where({openid: auth.openid}).get().data[0].userRole in ['admin', 'venue_manager'])"
        },
        conditions: [
          "resource.status in ['pending', 'ongoing', 'completed', 'cancelled']",
          "resource.currentParticipants <= resource.maxParticipants"
        ]
      },
      
      participations: {
        description: '参与记录集合 - 参与者和活动创建者可访问',
        rules: {
          read: "auth != null && (auth.openid == resource.openid || resource.activityId in get('database').collection('activities').where({openid: auth.openid}).get().data.map(item => item._id) || get('database').collection('users').where({openid: auth.openid}).get().data[0].userRole == 'admin')",
          write: "auth != null && auth.openid == resource.openid"
        }
      },
      
      reviews: {
        description: '评价反馈集合 - 公开读取，评价者可写',
        rules: {
          read: true,
          write: "auth != null && auth.openid == resource.openid"
        },
        conditions: [
          "resource.rating >= 1 && resource.rating <= 5",
          "resource.comment.length <= 500"
        ]
      },
      
      notifications: {
        description: '通知消息集合 - 仅接收者可读，系统写入',
        rules: {
          read: "auth != null && auth.openid == resource.openid",
          write: false
        }
      },
      
      venues: {
        description: '场地信息集合 - 公开读取，场地管理员可写',
        rules: {
          read: true,
          write: "auth != null && get('database').collection('users').where({openid: auth.openid}).get().data[0].userRole in ['venue_manager', 'admin']"
        }
      },
      
      security_logs: {
        description: '安全审计日志 - 仅管理员可访问',
        rules: {
          read: "auth != null && get('database').collection('users').where({openid: auth.openid}).get().data[0].userRole == 'admin'",
          write: false
        }
      }
    },
    
    storageRules: {
      description: '云存储安全规则 - 认证用户可读，文件所有者可写',
      rules: {
        read: "auth != null",
        write: "auth != null && (resource.openid == auth.openid || get('database').collection('users').where({openid: auth.openid}).get().data[0].userRole == 'admin')"
      },
      pathSpecificRules: {
        'avatars/*': {
          read: "auth != null",
          write: "auth != null && resource.openid == auth.openid"
        },
        'activities/*': {
          read: "auth != null",
          write: "auth != null && (resource.openid == auth.openid || get('database').collection('users').where({openid: auth.openid}).get().data[0].userRole in ['admin', 'venue_manager'])"
        },
        'temp/*': {
          read: "auth != null && resource.openid == auth.openid",
          write: "auth != null && resource.openid == auth.openid"
        }
      }
    },
    
    roleBasedAccess: {
      guest: {
        permissions: ["read_public_activities", "read_public_venues"],
        restrictions: ["no_personal_data_access", "no_write_operations"]
      },
      user: {
        permissions: [
          "read_own_data",
          "write_own_data", 
          "create_activities",
          "join_activities",
          "submit_reviews",
          "read_public_data"
        ],
        restrictions: ["no_admin_operations", "no_other_user_sensitive_data"]
      },
      venue_manager: {
        permissions: [
          "all_user_permissions",
          "manage_venues",
          "view_venue_statistics",
          "moderate_venue_activities"
        ],
        restrictions: ["no_user_management", "no_system_admin_operations"]
      },
      admin: {
        permissions: [
          "all_permissions",
          "manage_users",
          "delete_any_content",
          "view_all_data",
          "system_configuration"
        ],
        restrictions: []
      }
    },
    
    securityBestPractices: [
      '定期审查和更新安全规则',
      '监控异常访问模式',
      '实施最小权限原则',
      '对敏感操作进行额外验证',
      '定期备份重要数据',
      '保持系统和依赖项更新'
    ],
    
    testingGuidelines: [
      '使用不同角色的测试账号验证权限',
      '测试边界条件和异常情况',
      '验证数据过滤是否正确工作',
      '检查敏感数据是否被正确保护',
      '确认审计日志记录完整'
    ]
  };
  
  return { success: true, securityConfiguration };
}

/**
 * 验证安全配置
 */
async function validateSecurityConfiguration() {
  const validationResults = {
    timestamp: new Date().toISOString(),
    checks: []
  };
  
  try {
    // 检查必要集合是否存在
    const requiredCollections = ['users', 'sessions', 'activities', 'participations', 'reviews', 'notifications', 'venues', 'security_logs'];
    
    for (const collectionName of requiredCollections) {
      try {
        await db.collection(collectionName).limit(1).get();
        validationResults.checks.push({
          type: 'collection_exists',
          target: collectionName,
          status: 'pass',
          message: `Collection ${collectionName} exists`
        });
      } catch (error) {
        validationResults.checks.push({
          type: 'collection_exists',
          target: collectionName,
          status: 'fail',
          message: `Collection ${collectionName} does not exist`,
          error: error.message
        });
      }
    }
    
    // 检查是否有管理员用户
    try {
      const adminUsers = await db.collection('users').where({
        userRole: 'admin',
        isActive: true
      }).get();
      
      if (adminUsers.data.length > 0) {
        validationResults.checks.push({
          type: 'admin_user_exists',
          status: 'pass',
          message: `Found ${adminUsers.data.length} active admin user(s)`
        });
      } else {
        validationResults.checks.push({
          type: 'admin_user_exists',
          status: 'warning',
          message: 'No active admin users found. Consider creating at least one admin user.'
        });
      }
    } catch (error) {
      validationResults.checks.push({
        type: 'admin_user_exists',
        status: 'error',
        message: 'Failed to check admin users',
        error: error.message
      });
    }
    
    // 检查数据完整性
    try {
      const userCount = await db.collection('users').count();
      const activityCount = await db.collection('activities').count();
      
      validationResults.checks.push({
        type: 'data_integrity',
        status: 'info',
        message: `Database contains ${userCount.total} users and ${activityCount.total} activities`
      });
    } catch (error) {
      validationResults.checks.push({
        type: 'data_integrity',
        status: 'error',
        message: 'Failed to check data integrity',
        error: error.message
      });
    }
    
    const passCount = validationResults.checks.filter(c => c.status === 'pass').length;
    const failCount = validationResults.checks.filter(c => c.status === 'fail').length;
    const warningCount = validationResults.checks.filter(c => c.status === 'warning').length;
    
    validationResults.summary = {
      total: validationResults.checks.length,
      passed: passCount,
      failed: failCount,
      warnings: warningCount,
      overall: failCount === 0 ? 'healthy' : 'needs_attention'
    };
    
    return { success: true, validation: validationResults };
    
  } catch (error) {
    return { 
      success: false, 
      error: error.message,
      validation: validationResults
    };
  }
}

/**
 * 创建默认管理员用户
 */
async function createDefaultAdmin(adminData) {
  if (!adminData || !adminData.openid) {
    return { 
      success: false, 
      error: 'Admin data with openid is required' 
    };
  }
  
  try {
    // 检查用户是否已存在
    const existingUser = await db.collection('users').where({
      openid: adminData.openid
    }).get();
    
    if (existingUser.data.length > 0) {
      // 更新现有用户为管理员
      await db.collection('users').doc(existingUser.data[0]._id).update({
        data: {
          userRole: 'admin',
          updateTime: new Date(),
          isActive: true
        }
      });
      
      return { 
        success: true, 
        message: 'Existing user updated to admin role',
        userId: existingUser.data[0]._id
      };
    } else {
      // 创建新的管理员用户
      const newAdmin = {
        openid: adminData.openid,
        nickName: adminData.nickName || 'System Admin',
        avatarUrl: adminData.avatarUrl || '',
        userRole: 'admin',
        phoneNumber: adminData.phoneNumber || null,
        preferences: {
          sportTypes: [],
          locations: []
        },
        privacySettings: {
          showPhone: false,
          showLocation: true
        },
        createTime: new Date(),
        updateTime: new Date(),
        isActive: true
      };
      
      const result = await db.collection('users').add({
        data: newAdmin
      });
      
      return { 
        success: true, 
        message: 'Admin user created successfully',
        userId: result._id
      };
    }
  } catch (error) {
    return { 
      success: false, 
      error: error.message 
    };
  }
}

/**
 * 清理重复的 sessions 记录
 */
async function cleanupDuplicateSessions() {
  try {
    // 获取所有 sessions 记录
    const allSessions = await db.collection('sessions').get();
    
    // 找出问题记录（openid 或 token 为 null/undefined 的记录）
    const problemRecords = allSessions.data.filter(session => 
      session.openid === null || session.openid === undefined ||
      session.token === null || session.token === undefined ||
      session.openid === '' || session.token === ''
    );
    
    console.log(`找到 ${problemRecords.length} 条问题记录`);
    
    // 删除问题记录
    let deletedCount = 0;
    const errors = [];
    
    for (const record of problemRecords) {
      try {
        await db.collection('sessions').doc(record._id).remove();
        deletedCount++;
      } catch (error) {
        console.error(`删除记录 ${record._id} 失败:`, error);
        errors.push({
          recordId: record._id,
          error: error.message
        });
      }
    }
    
    return {
      success: true,
      deletedCount: deletedCount,
      totalProblemRecords: problemRecords.length,
      errors: errors
    };
    
  } catch (error) {
    console.error('清理重复 sessions 记录失败:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * 清理过期的 sessions 记录
 */
async function cleanupExpiredSessions() {
  try {
    const currentTime = new Date();
    
    // 查找过期的 sessions
    const expiredSessions = await db.collection('sessions').where({
      expireTime: db.command.lt(currentTime)
    }).get();
    
    console.log(`找到 ${expiredSessions.data.length} 条过期记录`);
    
    // 删除过期记录
    let deletedCount = 0;
    const errors = [];
    
    for (const session of expiredSessions.data) {
      try {
        await db.collection('sessions').doc(session._id).remove();
        deletedCount++;
      } catch (error) {
        console.error(`删除过期记录 ${session._id} 失败:`, error);
        errors.push({
          recordId: session._id,
          error: error.message
        });
      }
    }
    
    return {
      success: true,
      deletedCount: deletedCount,
      totalExpiredRecords: expiredSessions.data.length,
      errors: errors
    };
    
  } catch (error) {
    console.error('清理过期 sessions 记录失败:', error);
    return {
      success: false,
      error: error.message
    };
  }
}