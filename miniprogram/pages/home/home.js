// pages/home/home.js
Page({
  data: {
    currentCity: '上海',
    searchValue: '',
    showCitySelector: false,
    showFilter: false,
    activities: [
      {
        id: 1,
        title: '周末羽毛球约战',
        time: '今天 19:00-21:00',
        location: '浦东新区羽毛球馆',
        price: 45,
        participants: 6,
        maxParticipants: 8,
        image: '🏸',
        tag: '🔥 热门',
        tagType: 'hot'
      },
      {
        id: 2,
        title: '篮球友谊赛',
        time: '明天 14:00-16:00',
        location: '徐汇区篮球场',
        price: 30,
        participants: 8,
        maxParticipants: 10,
        image: '🏀',
        tag: '🆕 新活动',
        tagType: 'new'
      },
      {
        id: 3,
        title: '网球双打体验',
        time: '周六 10:00-12:00',
        location: '静安区网球中心',
        price: 80,
        participants: 3,
        maxParticipants: 4,
        image: '🎾',
        tag: '仅剩1位',
        tagType: 'limited'
      },
      {
        id: 4,
        title: '足球11人制',
        time: '周日 16:00-18:00',
        location: '浦西足球场',
        price: 25,
        participants: 18,
        maxParticipants: 22,
        image: '⚽',
        tag: '',
        tagType: ''
      }
    ],
    cities: ['上海', '北京', '广州', '深圳', '杭州', '南京', '苏州', '成都'],
  },

  onLoad() {
    this.requestLocation();
    this.loadActivities();
  },

  // 请求用户位置
  requestLocation() {
    wx.getLocation({
      type: 'wgs84',
      success: (res) => {
        // 这里可以根据经纬度获取城市信息
        console.log('获取位置成功', res);
      },
      fail: () => {
        wx.showToast({
          title: '定位失败，默认显示上海',
          icon: 'none'
        });
      }
    });
  },

  // 显示城市选择器
  onCityTap() {
    this.setData({
      showCitySelector: true
    });
  },

  // 城市选择
  onCitySelect(e) {
    const city = e.currentTarget.dataset.city;
    this.setData({
      currentCity: city,
      showCitySelector: false
    });
    this.loadActivities();
  },

  // 关闭城市选择器
  onCloseCitySelector() {
    this.setData({
      showCitySelector: false
    });
  },

  // 搜索输入
  onSearchInput(e) {
    this.setData({
      searchValue: e.detail.value
    });
  },

  // 搜索确认
  onSearchConfirm() {
    if (this.data.searchValue.trim()) {
      wx.showToast({
        title: `搜索: ${this.data.searchValue}`,
        icon: 'none'
      });
    }
  },

  // 显示筛选
  onFilterTap() {
    wx.showToast({
      title: '筛选功能开发中',
      icon: 'none'
    });
  },

  // 下拉刷新
  onPullDownRefresh() {
    wx.showNavigationBarLoading();
    
    setTimeout(() => {
      this.loadActivities();
      wx.hideNavigationBarLoading();
      wx.stopPullDownRefresh();
    }, 1000);
  },

  // 上拉加载更多
  onReachBottom() {
    wx.showToast({
      title: '加载更多...',
      icon: 'loading',
      duration: 1000
    });
    
    // 模拟加载更多数据
    setTimeout(() => {
      wx.showToast({
        title: '已加载全部',
        icon: 'none'
      });
    }, 1000);
  },

  // 加载活动数据
  async loadActivities() {
    try {
      wx.showLoading({
        title: '加载中...'
      });
      
      // 调用云函数获取活动列表
      const result = await wx.cloud.callFunction({
        name: 'getActivities',
        data: {
          city: this.data.currentCity,
          page: 1,
          pageSize: 20
        }
      });
      
      if (result.result.success) {
        this.setData({
          activities: result.result.activities
        });
      } else {
        console.error('获取活动列表失败:', result.result.message);
        // 如果云函数失败，保持使用模拟数据
      }
      
    } catch (error) {
      console.error('加载活动数据失败:', error);
      // 保持使用模拟数据
    } finally {
      wx.hideLoading();
    }
  },

  // 点击活动卡片
  onActivityTap(e) {
    const activityId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/activity-detail/activity-detail?id=${activityId}`
    });
  },

  // 发布活动
  onPublishTap() {
    // 检查用户登录状态
    wx.checkSession({
      success: () => {
        // 已登录，跳转到发布页面
        wx.navigateTo({
          url: '/pages/publish-activity/publish-activity'
        });
      },
      fail: () => {
        // 未登录，提示用户登录
        wx.showModal({
          title: '需要登录',
          content: '发布活动需要先登录，是否前往登录？',
          success: (res) => {
            if (res.confirm) {
              wx.switchTab({
                url: '/pages/profile/profile'
              });
            }
          }
        });
      }
    });
  },

  // 页面显示时刷新数据
  onShow() {
    this.loadActivities();
  }
});