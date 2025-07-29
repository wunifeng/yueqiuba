// pages/booking/booking.js
Page({
  data: {
    currentCity: '上海',
    showCitySelector: false,
    showFilter: false,
    viewMode: 'list', // list | map
    
    // 筛选条件
    filters: {
      sportType: '',
      priceRange: [0, 200],
      distance: 10,
      facilities: []
    },
    
    // 运动类型选项
    sportTypes: [
      { id: '', name: '全部', icon: '🏃' },
      { id: 'badminton', name: '羽毛球', icon: '🏸' },
      { id: 'basketball', name: '篮球', icon: '🏀' },
      { id: 'tennis', name: '网球', icon: '🎾' },
      { id: 'football', name: '足球', icon: '⚽' },
      { id: 'pingpong', name: '乒乓球', icon: '🏓' }
    ],
    
    // 场地列表
    venues: [
      {
        id: 1,
        name: '浦东新区羽毛球馆',
        image: '🏸',
        price: 45,
        distance: 1.2,
        rating: 4.8,
        tags: ['专业场地', '停车便利', '设施齐全'],
        address: '浦东新区张江高科技园区',
        facilities: ['专业场地', '球拍租借', '更衣室', '淋浴', '停车场'],
        openTime: '06:00-22:00',
        phone: '021-12345678'
      },
      {
        id: 2,
        name: '徐汇区篮球场',
        image: '🏀',
        price: 30,
        distance: 2.5,
        rating: 4.6,
        tags: ['室外场地', '价格实惠'],
        address: '徐汇区漕河泾开发区',
        facilities: ['标准场地', '免费停车', '饮水机'],
        openTime: '06:00-21:00',
        phone: '021-87654321'
      },
      {
        id: 3,
        name: '静安区网球中心',
        image: '🎾',
        price: 80,
        distance: 3.8,
        rating: 4.9,
        tags: ['高端场地', '教练服务'],
        address: '静安区南京西路',
        facilities: ['专业场地', '教练服务', '器材租借', '会员制'],
        openTime: '07:00-22:00',
        phone: '021-11223344'
      },
      {
        id: 4,
        name: '浦西足球场',
        image: '⚽',
        price: 25,
        distance: 4.2,
        rating: 4.5,
        tags: ['11人制', '草坪场地'],
        address: '普陀区中山北路',
        facilities: ['天然草坪', '更衣室', '停车场', '夜间照明'],
        openTime: '08:00-20:00',
        phone: '021-99887766'
      }
    ],
    
    cities: ['上海', '北京', '广州', '深圳', '杭州', '南京', '苏州', '成都']
  },

  onLoad() {
    this.loadVenues();
  },

  // 加载场地数据
  loadVenues() {
    wx.showLoading({
      title: '加载中...'
    });
    
    setTimeout(() => {
      wx.hideLoading();
    }, 500);
  },

  // 城市选择
  onCityTap() {
    this.setData({
      showCitySelector: true
    });
  },

  onCitySelect(e) {
    const city = e.currentTarget.dataset.city;
    this.setData({
      currentCity: city,
      showCitySelector: false
    });
    this.loadVenues();
  },

  onCloseCitySelector() {
    this.setData({
      showCitySelector: false
    });
  },

  // 运动类型筛选
  onSportTypeSelect(e) {
    const sportType = e.currentTarget.dataset.type;
    this.setData({
      'filters.sportType': sportType
    });
    this.filterVenues();
  },

  // 筛选场地
  filterVenues() {
    // 这里可以根据筛选条件过滤场地数据
    wx.showToast({
      title: '筛选功能开发中',
      icon: 'none'
    });
  },

  // 切换视图模式
  onViewModeChange(e) {
    const mode = e.currentTarget.dataset.mode;
    this.setData({
      viewMode: mode
    });
    
    if (mode === 'map') {
      this.showMapView();
    }
  },

  // 显示地图视图
  showMapView() {
    wx.showToast({
      title: '地图模式开发中',
      icon: 'none'
    });
  },

  // 点击场地卡片
  onVenueTap(e) {
    const venueId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/venue-detail/venue-detail?id=${venueId}`
    });
  },

  // 电话联系
  onCallVenue(e) {
    e.stopPropagation();
    const phone = e.currentTarget.dataset.phone;
    wx.makePhoneCall({
      phoneNumber: phone
    });
  },

  // 导航到场地
  onNavigateToVenue(e) {
    e.stopPropagation();
    const venue = e.currentTarget.dataset.venue;
    wx.openLocation({
      latitude: 31.2304,
      longitude: 121.4737,
      name: venue.name,
      address: venue.address
    });
  },

  // 显示筛选面板
  onShowFilter() {
    wx.showToast({
      title: '高级筛选开发中',
      icon: 'none'
    });
  }
});