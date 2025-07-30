// 云函数：删除活动
const cloud = require('wx-server-sdk')

// 初始化云开发环境
cloud.init({
  env: 'cloud1-2g0h4d0h9d6b431f'
})

const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { activityId } = event
  
  try {
    const openid = wxContext.OPENID
    console.log('删除活动:', { openid, activityId })
    
    if (!activityId) {
      return {
        success: false,
        message: '活动ID不能为空'
      }
    }
    
    // 查询活动是否存在且属于当前用户
    const activityQuery = await db.collection('activities').doc(activityId).get()
    
    if (!activityQuery.data) {
      return {
        success: false,
        message: '活动不存在'
      }
    }
    
    const activity = activityQuery.data
    
    // 检查是否为活动组织者
    if (activity.organizerId !== openid) {
      return {
        success: false,
        message: '只有活动组织者可以删除活动'
      }
    }
    
    // 检查活动状态
    if (activity.status === 'finished') {
      return {
        success: false,
        message: '已结束的活动不能删除'
      }
    }
    
    // 检查是否有参与者
    if (activity.currentParticipants > 0) {
      return {
        success: false,
        message: '已有参与者的活动不能删除，请先取消活动'
      }
    }
    
    // 删除活动
    await db.collection('activities').doc(activityId).remove()
    
    console.log('活动删除成功:', activityId)
    
    return {
      success: true,
      message: '活动删除成功'
    }
    
  } catch (error) {
    console.error('删除活动失败:', error)
    return {
      success: false,
      error: error.message,
      message: '删除失败，请重试'
    }
  }
}