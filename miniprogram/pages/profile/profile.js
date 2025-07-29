// pages/profile/profile.js
Page({
  data: {
    userInfo: {
      avatar: '👤',
      nickname: '运动达人',
      phone: '138****8888',
      level: '中级',
      joinDate: '2023-06-15'
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
    this.getUserInfo();
  },

  // 获取用户信息
  getUserInfo() {
    // 这里可以从服务器获取用户信息
    wx.getUserProfile({
      desc: '用于完善用户资料',
      success: (res) => {
        this.setData({
          'userInfo.avatar': res.userInfo.avatarUrl || '👤',
          'userInfo.nickname': res.userInfo.nickName || '运动达人'
        });
      },
      fail: () => {
        console.log('用户拒绝授权');
      }
    });
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
    wx.showToast({
      title: '编辑功能开发中',
      icon: 'none'
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