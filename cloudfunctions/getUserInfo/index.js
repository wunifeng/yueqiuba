// 云函数：获取用户信息
const cloud = require('wx-server-sdk')

// 初始化云开发环境
cloud.init({
  env: 'cloud1-2g0h4d0h9d6b431f'
})

const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID
  
  try {
    console.log('获取用户信息:', openid)
    
    // 查询用户信息
    const userQuery = await db.collection('users').where({
      openid: openid
    }).get()
    
    if (userQuery.data.length === 0) {
      return {
        success: false,
        message: '用户不存在，请先登录'
      }
    }
    
    const userInfo = userQuery.data[0]
    
    // 同时获取用户的活动统计信息
    const [publishedCount, appliedCount, joinedCount] = await Promise.all([
      // 我发布的活动数量
      db.collection('activities').where({
        organizerId: openid
      }).count(),
      
      // 我申请的活动数量  
      db.collection('activity_applications').where({
        applicantId: openid
      }).count(),
      
      // 我参与的活动数量
      db.collection('activity_participants').where({
        participantId: openid
      }).count()
    ])
    
    return {
      success: true,
      userInfo: {
        ...userInfo,
        statistics: {
          publishedCount: publishedCount.total,
          appliedCount: appliedCount.total,
          joinedCount: joinedCount.total
        }
      }
    }
    
  } catch (error) {
    console.error('获取用户信息失败:', error)
    return {
      success: false,
      error: error.message,
      message: '获取用户信息失败'
    }
  }
}