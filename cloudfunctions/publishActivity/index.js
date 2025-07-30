// 云函数：发布活动
const cloud = require('wx-server-sdk')

// 初始化云开发环境
cloud.init({
  env: 'cloud1-2g0h4d0h9d6b431f'
})

const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { activityData } = event
  
  try {
    const openid = wxContext.OPENID
    console.log('发布活动:', { openid, activityData })
    
    // 验证必填字段
    const requiredFields = ['title', 'description', 'sportType', 'startTime', 'endTime', 'location', 'maxParticipants', 'price']
    for (let field of requiredFields) {
      if (!activityData[field]) {
        return {
          success: false,
          message: `缺少必填字段: ${field}`
        }
      }
    }
    
    // 验证时间
    const startTime = new Date(activityData.startTime)
    const endTime = new Date(activityData.endTime)
    const now = new Date()
    
    if (startTime <= now) {
      return {
        success: false,
        message: '活动开始时间不能早于当前时间'
      }
    }
    
    if (endTime <= startTime) {
      return {
        success: false,
        message: '活动结束时间不能早于开始时间'
      }
    }
    
    // 验证参与人数
    if (activityData.maxParticipants < 2 || activityData.maxParticipants > 100) {
      return {
        success: false,
        message: '参与人数应在2-100人之间'
      }
    }
    
    // 验证价格
    if (activityData.price < 0 || activityData.price > 1000) {
      return {
        success: false,
        message: '活动价格应在0-1000元之间'
      }
    }
    
    // 构建活动数据
    const activity = {
      ...activityData,
      organizerId: openid,
      currentParticipants: 0,
      status: 'active', // active, cancelled, finished
      createTime: new Date(),
      updateTime: new Date(),
      participants: [], // 参与者列表
      applicants: [], // 申请者列表
      city: activityData.city || '上海',
      viewCount: 0,
      likeCount: 0
    }
    
    // 添加活动到数据库
    const result = await db.collection('activities').add({
      data: activity
    })
    
    console.log('活动发布成功:', result._id)
    
    return {
      success: true,
      activityId: result._id,
      message: '活动发布成功！'
    }
    
  } catch (error) {
    console.error('发布活动失败:', error)
    return {
      success: false,
      error: error.message,
      message: '发布失败，请重试'
    }
  }
}