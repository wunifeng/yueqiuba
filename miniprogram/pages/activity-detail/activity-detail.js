// pages/activity-detail/activity-detail.js
Page({
  data: {
    activityId: '',
    activity: {
      id: 1,
      title: '周末羽毛球约战',
      subtitle: '双打友谊赛，欢迎各水平球友',
      time: '今天 19:00-21:00',
      location: '浦东新区羽毛球馆',
      address: '上海市浦东新区张江高科技园区祖冲之路2288号',
      price: 45,
      participants: 6,
      maxParticipants: 8,
      image: '🏸',
      description: '本次羽毛球活动面向所有水平的球友，无论你是初学者还是高手，都欢迎参加。我们将根据参与者的水平进行合理分组，确保每个人都能享受到运动的乐趣。\n\n场地设施：\n- 专业羽毛球场地\n- 提供球拍租借\n- 免费饮用水\n- 更衣室和淋浴设施\n\n注意事项：\n- 请穿着运动服装和运动鞋\n- 建议提前10分钟到场\n- 如有身体不适请勿参加',
      organizer: {
        avatar: '👤',
        nickname: '羽毛球达人',
        level: '中级'
      },
      venue: {
        name: '浦东新区羽毛球馆',
        images: ['🏸', '🏟️', '🚿'],
        facilities: ['专业场地', '球拍租借', '更衣室', '淋浴', '停车场']
      },
      participantList: [
        { avatar: '👨', nickname: '小明', level: '初级' },
        { avatar: '👩', nickname: '小红', level: '中级' },
        { avatar: '👨', nickname: '大强', level: '高级' },
        { avatar: '👩', nickname: '丽丽', level: '中级' },
        { avatar: '👨', nickname: '阿伟', level: '初级' },
        { avatar: '👩', nickname: '小芳', level: '中级' }
      ]
    },
    showFullDescription: false,
    currentImageIndex: 0,
    isParticipant: false,
    isOrganizer: false
  },

  onLoad(options) {
    const activityId = options.id || '1';
    this.setData({
      activityId
    });
    this.loadActivityDetail(activityId);
  },

  // 加载活动详情
  loadActivityDetail(id) {
    wx.showLoading({
      title: '加载中...'
    });
    
    // 模拟数据加载
    setTimeout(() => {
      wx.hideLoading();
      // 这里可以根据id从服务器获取具体活动数据
    }, 500);
  },

  // 返回上一页
  onBack() {
    wx.navigateBack();
  },

  // 切换描述展开状态
  toggleDescription() {
    this.setData({
      showFullDescription: !this.data.showFullDescription
    });
  },

  // 图片轮播改变
  onSwiperChange(e) {
    this.setData({
      currentImageIndex: e.detail.current
    });
  },

  // 查看参与者详情
  onParticipantTap(e) {
    const participant = e.currentTarget.dataset.participant;
    wx.showToast({
      title: `查看${participant.nickname}的详情`,
      icon: 'none'
    });
  },

  // 申请参与活动
  onJoinActivity() {
    if (this.data.isParticipant) {
      wx.showModal({
        title: '提示',
        content: '您已经参与了此活动',
        showCancel: false
      });
      return;
    }

    if (this.data.activity.participants >= this.data.activity.maxParticipants) {
      wx.showModal({
        title: '提示',
        content: '活动人数已满',
        showCancel: false
      });
      return;
    }

    wx.navigateTo({
      url: `/pages/join-activity/join-activity?id=${this.data.activityId}`
    });
  },

  // 预订场地
  onBookVenue() {
    wx.navigateTo({
      url: '/pages/booking/booking'
    });
  },

  // 分享活动
  onShare() {
    wx.showActionSheet({
      itemList: ['分享给好友', '分享到朋友圈', '复制链接'],
      success: (res) => {
        const actions = ['分享给好友', '分享到朋友圈', '复制链接'];
        wx.showToast({
          title: actions[res.tapIndex],
          icon: 'none'
        });
      }
    });
  },

  // 查看地图
  onViewMap() {
    wx.openLocation({
      latitude: 31.2304,
      longitude: 121.4737,
      name: this.data.activity.venue.name,
      address: this.data.activity.address
    });
  },

  // 联系组织者
  onContactOrganizer() {
    wx.showModal({
      title: '联系组织者',
      content: '是否要联系活动组织者？',
      success: (res) => {
        if (res.confirm) {
          wx.showToast({
            title: '联系功能开发中',
            icon: 'none'
          });
        }
      }
    });
  }
});