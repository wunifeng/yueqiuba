// 云函数：更新用户信息
const cloud = require('wx-server-sdk')

// 初始化云开发环境
cloud.init({
  env: 'cloud1-2g0h4d0h9d6b431f'
})

const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID
  const { updateData } = event
  
  try {
    console.log('更新用户信息:', { openid, updateData })
    
    // 验证更新数据
    if (!updateData || Object.keys(updateData).length === 0) {
      return {
        success: false,
        message: '更新数据不能为空'
      }
    }
    
    // 构建更新对象
    const updateObj = {
      lastUpdateTime: new Date()
    }
    
    // 安全的字段映射
    const allowedFields = {
      'nickName': 'nickName',
      'phone': 'phone', 
      'level': 'level',
      'avatarUrl': 'avatarUrl',
      'gender': 'gender',
      'country': 'country',
      'province': 'province',
      'city': 'city'
    }
    
    // 只更新允许的字段
    Object.keys(updateData).forEach(key => {
      if (allowedFields[key]) {
        updateObj[allowedFields[key]] = updateData[key]
      }
    })
    
    // 查询用户是否存在
    const userQuery = await db.collection('users').where({
      openid: openid
    }).get()
    
    if (userQuery.data.length === 0) {
      return {
        success: false,
        message: '用户不存在'
      }
    }
    
    // 更新用户信息
    const updateResult = await db.collection('users').doc(userQuery.data[0]._id).update({
      data: updateObj
    })
    
    console.log('用户信息更新成功:', updateResult)
    
    // 返回更新后的用户信息
    const updatedUser = await db.collection('users').doc(userQuery.data[0]._id).get()
    
    return {
      success: true,
      userInfo: updatedUser.data,
      message: '更新成功'
    }
    
  } catch (error) {
    console.error('更新用户信息失败:', error)
    return {
      success: false,
      error: error.message,
      message: '更新失败，请重试'
    }
  }
}