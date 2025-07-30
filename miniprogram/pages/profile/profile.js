// pages/profile/profile.js
Page({
  data: {
    // 用户登录状态
    isLoggedIn: false,
    isLoading: true,
    
    // 用户信息
    userInfo: {
      avatar: '',
      nickname: '未登录',
      phone: '',
      level: '初级',
      joinDate: '',
      openid: '',
      statistics: {
        publishedCount: 0,
        appliedCount: 0,
        joinedCount: 0
      }
    },
    
    currentTab: 0,
    tabs: [
      { label: '我发布的', value: 'published' },
      { label: '我申请的', value: 'applied' },
      { label: '我参与的', value: 'joined' }
    ],
    
    // 我发布的活动
    publishedActivities: [
      {
        id: 1,
        title: '周末羽毛球约战',
        time: '今天 19:00-21:00',
        location: '浦东新区羽毛球馆',
        status: 'active',
        statusText: '进行中',
        participants: 6,
        maxParticipants: 8,
        image: '🏸'
      },
      {
        id: 2,
        title: '篮球友谊赛',
        time: '昨天 14:00-16:00',
        location: '徐汇区篮球场',
        status: 'finished',
        statusText: '已结束',
        participants: 10,
        maxParticipants: 10,
        image: '🏀'
      }
    ],
    
    // 我申请的活动
    appliedActivities: [
      {
        id: 3,
        title: '网球双打体验',
        time: '周六 10:00-12:00',
        location: '静安区网球中心',
        status: 'pending',
        statusText: '待确认',
        organizer: '网球教练',
        image: '🎾'
      },
      {
        id: 4,
        title: '足球11人制',
        time: '周日 16:00-18:00',
        location: '浦西足球场',
        status: 'approved',
        statusText: '已通过',
        organizer: '足球队长',
        image: '⚽'
      },
      {
        id: 5,
        title: '乒乓球训练',
        time: '上周六 14:00-16:00',
        location: '体育中心',
        status: 'rejected',
        statusText: '已拒绝',
        organizer: '乒乓球爱好者',
        image: '🏓'
      }
    ],
    
    // 我参与的活动
    joinedActivities: [
      {
        id: 6,
        title: '晨跑活动',
        time: '明天 07:00-08:00',
        location: '世纪公园',
        status: 'upcoming',
        statusText: '即将开始',
        organizer: '跑步达人',
        image: '🏃'
      },
      {
        id: 7,
        title: '游泳训练',
        time: '上周日 15:00-17:00',
        location: '游泳馆',
        status: 'completed',
        statusText: '已完成',
        organizer: '游泳教练',
        image: '🏊'
      }
    ]
  },

  onLoad() {
    this.checkLoginStatus();
  },

  onShow() {
    // 每次显示页面时检查登录状态
    if (this.data.isLoggedIn) {
      this.refreshUserInfo();
    }
  },

  // 检查登录状态
  async checkLoginStatus() {
    this.setData({ isLoading: true });
    
    try {
      // 检查微信登录状态
      await this.checkWechatSession();
      
      // 获取用户信息
      await this.getUserInfo();
      
    } catch (error) {
      console.error('检查登录状态失败:', error);
      this.setData({
        isLoggedIn: false,
        isLoading: false
      });
    }
  },

  // 检查微信会话状态
  checkWechatSession() {
    return new Promise((resolve, reject) => {
      wx.checkSession({
        success: () => {
          console.log('微信会话有效');
          resolve();
        },
        fail: () => {
          console.log('微信会话失效，需要重新登录');
          reject(new Error('会话失效'));
        }
      });
    });
  },

  // 获取用户信息
  async getUserInfo() {
    try {
      wx.showLoading({ title: '加载中...' });
      
      // 调用云函数获取用户信息
      const result = await wx.cloud.callFunction({
        name: 'getUserInfo'
      });
      
      if (result.result.success) {
        const userInfo = result.result.userInfo;
        this.setData({
          isLoggedIn: true,
          isLoading: false,
          userInfo: {
            avatar: userInfo.avatarUrl || '👤',
            nickname: userInfo.nickName || '运动达人',
            phone: userInfo.phone || '',
            level: userInfo.level || '初级',
            joinDate: userInfo.joinDate || '',
            openid: userInfo.openid || '',
            statistics: userInfo.statistics || {
              publishedCount: 0,
              appliedCount: 0,
              joinedCount: 0
            }
          }
        });
        
        // 加载用户活动数据
        this.loadUserActivities();
      } else {
        // 用户不存在，需要登录
        this.setData({
          isLoggedIn: false,
          isLoading: false
        });
      }
      
    } catch (error) {
      console.error('获取用户信息失败:', error);
      this.setData({
        isLoggedIn: false,
        isLoading: false
      });
      wx.showToast({
        title: '获取用户信息失败',
        icon: 'none'
      });
    } finally {
      wx.hideLoading();
    }
  },

  // 刷新用户信息
  async refreshUserInfo() {
    try {
      const result = await wx.cloud.callFunction({
        name: 'getUserInfo'
      });
      
      if (result.result.success) {
        const userInfo = result.result.userInfo;
        this.setData({
          'userInfo.statistics': userInfo.statistics || {
            publishedCount: 0,
            appliedCount: 0,
            joinedCount: 0
          }
        });
      }
    } catch (error) {
      console.error('刷新用户信息失败:', error);
    }
  },

	async onLogin() {
		try {
			// 1. 用户手动点击，立即请求用户信息
			const userProfile = await wx.getUserProfile({
				desc: '用于完善用户信息'
			});
	
			wx.showLoading({ title: '登录中...' });
	
			// 2. 获取 code
			const loginResult = await this.wxLogin();
	
			// 3. 云函数登录
			const cloudResult = await wx.cloud.callFunction({
				name: 'login',
				data: {
					code: loginResult.code,
					userInfo: userProfile.userInfo
				}
			});
	
			if (cloudResult.result.success) {
				const userInfo = cloudResult.result.userInfo;
	
				this.setData({
					isLoggedIn: true,
					userInfo: {
						avatar: userInfo.avatarUrl || userProfile.userInfo.avatarUrl,
						nickname: userInfo.nickName || userProfile.userInfo.nickName,
						phone: userInfo.phone || '',
						level: userInfo.level || '初级',
						joinDate: userInfo.joinDate || '',
						openid: userInfo.openid || '',
						statistics: userInfo.statistics || {
							publishedCount: 0,
							appliedCount: 0,
							joinedCount: 0
						}
					}
				});
	
				this.loadUserActivities(); // 👈 这个函数如果是异步的，可以加 await
	
				wx.showToast({
					title: cloudResult.result.message || '登录成功',
					icon: 'success'
				});
	
			} else {
				throw new Error(cloudResult.result.message || '登录失败');
			}
	
		} catch (error) {
			console.error('登录失败:', error);
			wx.showToast({
				title: error.message || '登录失败',
				icon: 'none'
			});
		} finally {
			wx.hideLoading();
		}
	},
	

  // 微信登录
  wxLogin() {
    return new Promise((resolve, reject) => {
      wx.login({
        success: resolve,
        fail: reject
      });
    });
  },

  // 获取用户授权信息
  getUserProfile() {
    return new Promise((resolve, reject) => {
      wx.getUserProfile({
        desc: '用于完善用户资料',
        success: resolve,
        fail: reject
      });
    });
  },

  // 加载用户活动数据
  loadUserActivities() {
    // 这里可以根据用户的统计信息更新活动列表
    // 暂时使用模拟数据，后续可以从云数据库获取真实数据
    console.log('加载用户活动数据');
  },

  // Tab切换
  onTabChange(e) {
    const index = e.detail.value;
    this.setData({
      currentTab: index
    });
  },

  // 获取当前Tab对应的活动列表
  getCurrentActivities() {
    const { currentTab } = this.data;
    switch (currentTab) {
      case 0:
        return this.data.publishedActivities;
      case 1:
        return this.data.appliedActivities;
      case 2:
        return this.data.joinedActivities;
      default:
        return [];
    }
  },

  // 点击活动项
  onActivityTap(e) {
    const activityId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/activity-detail/activity-detail?id=${activityId}`
    });
  },

  // 编辑活动
  onEditActivity(e) {
    e.stopPropagation();
    const activityId = e.currentTarget.dataset.id;
    wx.showToast({
      title: '编辑功能开发中',
      icon: 'none'
    });
  },

  // 取消发布
  onCancelPublish(e) {
    e.stopPropagation();
    const activityId = e.currentTarget.dataset.id;
    
    wx.showModal({
      title: '确认取消',
      content: '确定要取消发布这个活动吗？',
      success: (res) => {
        if (res.confirm) {
          this.cancelActivity(activityId);
        }
      }
    });
  },

  // 撤回申请
  onWithdrawApplication(e) {
    e.stopPropagation();
    const activityId = e.currentTarget.dataset.id;
    
    wx.showModal({
      title: '确认撤回',
      content: '确定要撤回申请吗？',
      success: (res) => {
        if (res.confirm) {
          this.withdrawApplication(activityId);
        }
      }
    });
  },

  // 重新申请
  onReapply(e) {
    e.stopPropagation();
    const activityId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/join-activity/join-activity?id=${activityId}`
    });
  },

  // 取消活动
  cancelActivity(activityId) {
    wx.showLoading({
      title: '处理中...'
    });
    
    setTimeout(() => {
      wx.hideLoading();
      wx.showToast({
        title: '取消成功',
        icon: 'success'
      });
      
      // 更新数据
      const publishedActivities = this.data.publishedActivities.map(item => {
        if (item.id === activityId) {
          return { ...item, status: 'cancelled', statusText: '已取消' };
        }
        return item;
      });
      
      this.setData({
        publishedActivities
      });
    }, 1000);
  },

  // 撤回申请
  withdrawApplication(activityId) {
    wx.showLoading({
      title: '处理中...'
    });
    
    setTimeout(() => {
      wx.hideLoading();
      wx.showToast({
        title: '撤回成功',
        icon: 'success'
      });
      
      // 更新数据
      const appliedActivities = this.data.appliedActivities.filter(item => item.id !== activityId);
      this.setData({
        appliedActivities
      });
    }, 1000);
  },

  // 编辑个人信息
  onEditProfile() {
    if (!this.data.isLoggedIn) {
      this.onLogin();
      return;
    }
    
    wx.showActionSheet({
      itemList: ['修改昵称', '修改手机号', '修改运动水平'],
      success: (res) => {
        const actions = ['修改昵称', '修改手机号', '修改运动水平'];
        this.handleEditAction(res.tapIndex);
      }
    });
  },

  // 处理编辑操作
  handleEditAction(index) {
    switch (index) {
      case 0:
        this.editNickname();
        break;
      case 1:
        this.editPhone();
        break;
      case 2:
        this.editLevel();
        break;
    }
  },

  // 修改昵称
  editNickname() {
    wx.showModal({
      title: '修改昵称',
      editable: true,
      placeholderText: this.data.userInfo.nickname,
      success: (res) => {
        if (res.confirm && res.content.trim()) {
          this.updateUserInfo({ nickName: res.content.trim() });
        }
      }
    });
  },

  // 修改手机号
  editPhone() {
    wx.showModal({
      title: '修改手机号',
      editable: true,
      placeholderText: this.data.userInfo.phone || '请输入手机号',
      success: (res) => {
        if (res.confirm && res.content.trim()) {
          const phone = res.content.trim();
          if (!/^1[3-9]\d{9}$/.test(phone)) {
            wx.showToast({
              title: '手机号格式不正确',
              icon: 'none'
            });
            return;
          }
          this.updateUserInfo({ phone: phone });
        }
      }
    });
  },

  // 修改运动水平
  editLevel() {
    const levels = ['初级', '中级', '高级', '专业'];
    wx.showActionSheet({
      itemList: levels,
      success: (res) => {
        this.updateUserInfo({ level: levels[res.tapIndex] });
      }
    });
  },

  // 更新用户信息
  async updateUserInfo(updateData) {
    try {
      wx.showLoading({ title: '更新中...' });
      
      // 调用云函数更新用户信息
      const result = await wx.cloud.callFunction({
        name: 'updateUserInfo',
        data: {
          updateData: updateData
        }
      });
      
      if (result.result.success) {
        // 更新本地用户信息
        const userInfo = { ...this.data.userInfo };
        Object.keys(updateData).forEach(key => {
          if (key === 'nickName') {
            userInfo.nickname = updateData[key];
          } else {
            userInfo[key] = updateData[key];
          }
        });
        
        this.setData({ userInfo });
        
        wx.showToast({
          title: result.result.message,
          icon: 'success'
        });
      } else {
        throw new Error(result.result.message);
      }
      
    } catch (error) {
      console.error('更新用户信息失败:', error);
      wx.showToast({
        title: error.message || '更新失败',
        icon: 'none'
      });
    } finally {
      wx.hideLoading();
    }
  },

  // 退出登录
  onLogout() {
    wx.showModal({
      title: '确认退出',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          this.setData({
            isLoggedIn: false,
            userInfo: {
              avatar: '',
              nickname: '未登录',
              phone: '',
              level: '初级',
              joinDate: '',
              openid: '',
              statistics: {
                publishedCount: 0,
                appliedCount: 0,
                joinedCount: 0
              }
            },
            publishedActivities: [],
            appliedActivities: [],
            joinedActivities: []
          });
          
          wx.showToast({
            title: '已退出登录',
            icon: 'success'
          });
        }
      }
    });
  },

  // 设置
  onSettings() {
    wx.showActionSheet({
      itemList: ['修改昵称', '绑定手机', '隐私设置', '关于我们'],
      success: (res) => {
        const actions = ['修改昵称', '绑定手机', '隐私设置', '关于我们'];
        wx.showToast({
          title: actions[res.tapIndex],
          icon: 'none'
        });
      }
    });
  },

  // 联系客服
  onContactService() {
    wx.showModal({
      title: '联系客服',
      content: '客服电话：400-123-4567\n工作时间：9:00-18:00',
      showCancel: false
    });
  }
});