// 云函数：获取活动列表
const cloud = require('wx-server-sdk')

// 初始化云开发环境
cloud.init({
  env: 'cloud1-2g0h4d0h9d6b431f'
})

const db = cloud.database()

exports.main = async (event, context) => {
  const { city, sportType, page = 1, pageSize = 10, sortBy = 'createTime' } = event
  
  try {
    console.log('获取活动列表:', { city, sportType, page, pageSize })
    
    // 构建查询条件
    let query = db.collection('activities').where({
      status: 'active'
    })
    
    // 城市筛选
    if (city && city !== '全部') {
      query = query.where({
        city: city
      })
    }
    
    // 运动类型筛选
    if (sportType && sportType !== '全部') {
      query = query.where({
        sportType: sportType
      })
    }
    
    // 排序
    const sortOrder = sortBy === 'createTime' ? 'desc' : 'asc'
    query = query.orderBy(sortBy, sortOrder)
    
    // 分页
    const skip = (page - 1) * pageSize
    query = query.skip(skip).limit(pageSize)
    
    // 执行查询
    const result = await query.get()
    
    // 处理活动数据
    const activities = result.data.map(activity => {
      // 计算活动标签
      let tag = ''
      let tagType = ''
      
      const now = new Date()
      const startTime = new Date(activity.startTime)
      const hoursUntilStart = (startTime - now) / (1000 * 60 * 60)
      
      // 判断标签类型
      if (activity.currentParticipants >= activity.maxParticipants) {
        tag = '已满员'
        tagType = 'full'
      } else if (activity.maxParticipants - activity.currentParticipants <= 2) {
        tag = `仅剩${activity.maxParticipants - activity.currentParticipants}位`
        tagType = 'limited'
      } else if (hoursUntilStart <= 24) {
        tag = '🔥 即将开始'
        tagType = 'hot'
      } else if (activity.createTime > new Date(Date.now() - 24 * 60 * 60 * 1000)) {
        tag = '🆕 新活动'
        tagType = 'new'
      }
      
      return {
        id: activity._id,
        title: activity.title,
        time: `${activity.startTime.split('T')[0]} ${activity.startTime.split('T')[1].substring(0, 5)}-${activity.endTime.split('T')[1].substring(0, 5)}`,
        location: activity.location,
        price: activity.price,
        participants: activity.currentParticipants,
        maxParticipants: activity.maxParticipants,
        image: activity.sportType === 'badminton' ? '🏸' :
               activity.sportType === 'basketball' ? '🏀' :
               activity.sportType === 'tennis' ? '🎾' :
               activity.sportType === 'football' ? '⚽' :
               activity.sportType === 'pingpong' ? '🏓' : '🏃',
        tag,
        tagType,
        sportType: activity.sportType,
        organizerId: activity.organizerId
      }
    })
    
    // 获取总数（用于分页）
    const countResult = await db.collection('activities').where({
      status: 'active'
    }).count()
    
    return {
      success: true,
      activities,
      total: countResult.total,
      page,
      pageSize,
      hasMore: skip + activities.length < countResult.total
    }
    
  } catch (error) {
    console.error('获取活动列表失败:', error)
    return {
      success: false,
      error: error.message,
      message: '获取活动列表失败'
    }
  }
}