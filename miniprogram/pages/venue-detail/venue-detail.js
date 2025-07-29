// pages/venue-detail/venue-detail.js
Page({
  data: {
    venueId: '',
    venue: {
      id: 1,
      name: '浦东新区羽毛球馆',
      image: '🏸',
      price: 45,
      distance: 1.2,
      rating: 4.8,
      address: '上海市浦东新区张江高科技园区祖冲之路2288号',
      phone: '021-12345678',
      openTime: '06:00-22:00',
      description: '专业羽毛球场地，设施齐全，环境优雅。拥有12片标准羽毛球场地，采用进口地胶，灯光明亮均匀。提供球拍租借、更衣室、淋浴等配套服务。',
      images: ['🏸', '🏟️', '🚿', '🅿️'],
      facilities: [
        { name: '专业场地', icon: '🏸', available: true },
        { name: '球拍租借', icon: '🏓', available: true },
        { name: '更衣室', icon: '👕', available: true },
        { name: '淋浴设施', icon: '🚿', available: true },
        { name: '停车场', icon: '🅿️', available: true },
        { name: 'WiFi', icon: '📶', available: true },
        { name: '空调', icon: '❄️', available: true },
        { name: '饮水机', icon: '💧', available: true }
      ],
      timeSlots: [
        { time: '06:00-08:00', price: 35, available: true },
        { time: '08:00-10:00', price: 40, available: true },
        { time: '10:00-12:00', price: 45, available: false },
        { time: '12:00-14:00', price: 40, available: true },
        { time: '14:00-16:00', price: 45, available: true },
        { time: '16:00-18:00', price: 50, available: true },
        { time: '18:00-20:00', price: 60, available: false },
        { time: '20:00-22:00', price: 55, available: true }
      ],
      reviews: [
        {
          id: 1,
          user: { avatar: '👨', nickname: '运动达人' },
          rating: 5,
          content: '场地很棒，设施齐全，服务态度也很好！',
          date: '2024-01-15',
          images: ['🏸']
        },
        {
          id: 2,
          user: { avatar: '👩', nickname: '羽毛球爱好者' },
          rating: 4,
          content: '环境不错，就是高峰期人比较多，建议提前预约。',
          date: '2024-01-10'
        }
      ]
    },
    selectedDate: '',
    selectedTimeSlot: '',
    currentImageIndex: 0,
    showBookingModal: false
  },

  onLoad(options) {
    const venueId = options.id || '1';
    this.setData({
      venueId,
      selectedDate: this.formatDate(new Date())
    });
    this.loadVenueDetail(venueId);
  },

  // 加载场地详情
  loadVenueDetail(id) {
    wx.showLoading({
      title: '加载中...'
    });
    
    setTimeout(() => {
      wx.hideLoading();
    }, 500);
  },

  // 格式化日期
  formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  // 返回上一页
  onBack() {
    wx.navigateBack();
  },

  // 图片轮播改变
  onSwiperChange(e) {
    this.setData({
      currentImageIndex: e.detail.current
    });
  },

  // 电话联系
  onCall() {
    wx.makePhoneCall({
      phoneNumber: this.data.venue.phone
    });
  },

  // 导航到场地
  onNavigate() {
    wx.openLocation({
      latitude: 31.2304,
      longitude: 121.4737,
      name: this.data.venue.name,
      address: this.data.venue.address
    });
  },

  // 时间段选择
  onTimeSlotSelect(e) {
    const timeSlot = e.currentTarget.dataset.slot;
    if (!timeSlot.available) {
      wx.showToast({
        title: '该时段已被预订',
        icon: 'none'
      });
      return;
    }
    
    this.setData({
      selectedTimeSlot: timeSlot.time
    });
  },

  // 显示预订弹窗
  onShowBooking() {
    if (!this.data.selectedTimeSlot) {
      wx.showToast({
        title: '请选择预订时间',
        icon: 'none'
      });
      return;
    }
    
    this.setData({
      showBookingModal: true
    });
  },

  // 关闭预订弹窗
  onCloseBooking() {
    this.setData({
      showBookingModal: false
    });
  },

  // 确认预订
  onConfirmBooking() {
    wx.showLoading({
      title: '预订中...'
    });
    
    setTimeout(() => {
      wx.hideLoading();
      this.setData({
        showBookingModal: false
      });
      
      wx.showModal({
        title: '预订成功',
        content: `您已成功预订 ${this.data.venue.name}\n时间：${this.data.selectedDate} ${this.data.selectedTimeSlot}\n请按时到场，如需取消请提前2小时联系场地。`,
        showCancel: false,
        success: () => {
          wx.navigateBack();
        }
      });
    }, 2000);
  },

  // 分享场地
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

  // 查看评价详情
  onReviewTap(e) {
    const review = e.currentTarget.dataset.review;
    wx.showToast({
      title: `查看${review.user.nickname}的评价`,
      icon: 'none'
    });
  }
});