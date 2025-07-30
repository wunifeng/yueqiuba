// 云函数：用户登录
const cloud = require('wx-server-sdk')

// 初始化云开发环境
cloud.init({
  env: 'cloud1-2g0h4d0h9d6b431f'
})

const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { userInfo } = event
  
  try {
    // 获取用户的openid和unionid
    const openid = wxContext.OPENID
    const unionid = wxContext.UNIONID
    
    console.log('用户登录:', { openid, unionid, userInfo })
    
    // 查询用户是否已存在
    const userQuery = await db.collection('users').where({
      openid: openid
    }).get()
    
    let userData = {
      openid: openid,
      unionid: unionid,
      lastLoginTime: new Date(),
      loginCount: 1
    }
    
    // 如果传入了用户信息，则更新
    if (userInfo) {
      userData = {
        ...userData,
        nickName: userInfo.nickName,
        avatarUrl: userInfo.avatarUrl,
        gender: userInfo.gender,
        country: userInfo.country,
        province: userInfo.province,
        city: userInfo.city,
        language: userInfo.language
      }
    }
    
    if (userQuery.data.length === 0) {
      // 新用户，创建用户记录
      userData.createTime = new Date()
      userData.level = '初级'
      userData.joinDate = new Date().toISOString().split('T')[0]
      
      const createResult = await db.collection('users').add({
        data: userData
      })
      
      console.log('新用户创建成功:', createResult._id)
      
      return {
        success: true,
        isNewUser: true,
        userId: createResult._id,
        userInfo: userData,
        message: '登录成功，欢迎新用户！'
      }
    } else {
      // 老用户，更新登录信息
      const existingUser = userQuery.data[0]
      userData.loginCount = (existingUser.loginCount || 0) + 1
      
      // 保留原有的创建时间和其他信息
      userData.createTime = existingUser.createTime
      userData.level = existingUser.level || '初级'
      userData.joinDate = existingUser.joinDate || new Date().toISOString().split('T')[0]
      
      await db.collection('users').doc(existingUser._id).update({
        data: userData
      })
      
      console.log('用户信息更新成功:', existingUser._id)
      
      return {
        success: true,
        isNewUser: false,
        userId: existingUser._id,
        userInfo: { ...existingUser, ...userData },
        message: '欢迎回来！'
      }
    }
    
  } catch (error) {
    console.error('登录失败:', error)
    return {
      success: false,
      error: error.message,
      message: '登录失败，请重试'
    }
  }
}