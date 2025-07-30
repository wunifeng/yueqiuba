// pages/publish-activity/publish-activity.js
Page({
  data: {
    // 表单数据
    formData: {
      title: '',
      description: '',
      sportType: '',
      startDate: '',
      startTime: '',
      endDate: '',
      endTime: '',
      location: '',
      address: '',
      maxParticipants: 8,
      price: 0,
      requirements: '',
      contactInfo: ''
    },
    
    // 运动类型选项
    sportTypes: [
      { value: 'badminton', label: '羽毛球', icon: '🏸' },
      { value: 'basketball', label: '篮球', icon: '🏀' },
      { value: 'tennis', label: '网球', icon: '🎾' },
      { value: 'football', label: '足球', icon: '⚽' },
      { value: 'pingpong', label: '乒乓球', icon: '🏓' },
      { value: 'running', label: '跑步', icon: '🏃' },
      { value: 'swimming', label: '游泳', icon: '🏊' },
      { value: 'cycling', label: '骑行', icon: '🚴' }
    ],
    
    // 参与人数选项
    participantOptions: [
      { value: 2, label: '2人' },
      { value: 4, label: '4人' },
      { value: 6, label: '6人' },
      { value: 8, label: '8人' },
      { value: 10, label: '10人' },
      { value: 12, label: '12人' },
      { value: 16, label: '16人' },
      { value: 20, label: '20人' },
      { value: 22, label: '22人' }
    ],
    
    // UI状态
    showSportTypePicker: false,
    showParticipantPicker: false,
    submitting: false,
    currentCity: '上海',
    
    // 当前选中的运动类型信息（用于显示）
    selectedSportType: null
  },

  onLoad() {
    this.initializeForm();
  },

  // 初始化表单
  initializeForm() {
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    
    // 设置默认日期为明天
    const defaultDate = this.formatDate(tomorrow);
    const defaultTime = '19:00';
    const defaultEndTime = '21:00';
    
    this.setData({
      'formData.startDate': defaultDate,
      'formData.endDate': defaultDate,
      'formData.startTime': defaultTime,
      'formData.endTime': defaultEndTime
    });
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
    if (this.hasFormData()) {
      wx.showModal({
        title: '确认离开',
        content: '您有未保存的内容，确定要离开吗？',
        success: (res) => {
          if (res.confirm) {
            wx.navigateBack();
          }
        }
      });
    } else {
      wx.navigateBack();
    }
  },

  // 检查是否有表单数据
  hasFormData() {
    const { formData } = this.data;
    return formData.title || formData.description || formData.location;
  },

  // 标题输入
  onTitleInput(e) {
    this.setData({
      'formData.title': e.detail.value
    });
  },

  // 描述输入
  onDescriptionInput(e) {
    this.setData({
      'formData.description': e.detail.value
    });
  },

  // 运动类型选择
  onSportTypeSelect() {
    this.setData({
      showSportTypePicker: true
    });
  },

  onSportTypeChange(e) {
    const index = e.detail.value;
    const sportType = this.data.sportTypes[index];
    this.setData({
      'formData.sportType': sportType.value,
      selectedSportType: sportType,
      showSportTypePicker: false
    });
  },

  onSportTypeCancel() {
    this.setData({
      showSportTypePicker: false
    });
  },

  // 日期时间选择
  onStartDateChange(e) {
    this.setData({
      'formData.startDate': e.detail.value
    });
  },

  onStartTimeChange(e) {
    this.setData({
      'formData.startTime': e.detail.value
    });
  },

  onEndDateChange(e) {
    this.setData({
      'formData.endDate': e.detail.value
    });
  },

  onEndTimeChange(e) {
    this.setData({
      'formData.endTime': e.detail.value
    });
  },

  // 地点输入
  onLocationInput(e) {
    this.setData({
      'formData.location': e.detail.value
    });
  },

  onAddressInput(e) {
    this.setData({
      'formData.address': e.detail.value
    });
  },

  // 选择地点
  onSelectLocation() {
    wx.chooseLocation({
      success: (res) => {
        this.setData({
          'formData.location': res.name,
          'formData.address': res.address
        });
      },
      fail: () => {
        wx.showToast({
          title: '获取位置失败',
          icon: 'none'
        });
      }
    });
  },

  // 参与人数选择
  onParticipantSelect() {
    this.setData({
      showParticipantPicker: true
    });
  },

  onParticipantChange(e) {
    const index = e.detail.value;
    const participant = this.data.participantOptions[index];
    this.setData({
      'formData.maxParticipants': participant.value,
      showParticipantPicker: false
    });
  },

  onParticipantCancel() {
    this.setData({
      showParticipantPicker: false
    });
  },

  // 价格输入
  onPriceInput(e) {
    const price = parseFloat(e.detail.value) || 0;
    this.setData({
      'formData.price': price
    });
  },

  // 要求输入
  onRequirementsInput(e) {
    this.setData({
      'formData.requirements': e.detail.value
    });
  },

  // 联系方式输入
  onContactInput(e) {
    this.setData({
      'formData.contactInfo': e.detail.value
    });
  },

  // 表单验证
  validateForm() {
    const { formData } = this.data;
    
    if (!formData.title.trim()) {
      wx.showToast({
        title: '请输入活动标题',
        icon: 'none'
      });
      return false;
    }
    
    if (!formData.description.trim()) {
      wx.showToast({
        title: '请输入活动描述',
        icon: 'none'
      });
      return false;
    }
    
    if (!formData.sportType) {
      wx.showToast({
        title: '请选择运动类型',
        icon: 'none'
      });
      return false;
    }
    
    if (!formData.startDate || !formData.startTime) {
      wx.showToast({
        title: '请选择开始时间',
        icon: 'none'
      });
      return false;
    }
    
    if (!formData.endDate || !formData.endTime) {
      wx.showToast({
        title: '请选择结束时间',
        icon: 'none'
      });
      return false;
    }
    
    if (!formData.location.trim()) {
      wx.showToast({
        title: '请输入活动地点',
        icon: 'none'
      });
      return false;
    }
    
    // 验证时间逻辑
    const startDateTime = new Date(`${formData.startDate} ${formData.startTime}`);
    const endDateTime = new Date(`${formData.endDate} ${formData.endTime}`);
    const now = new Date();
    
    if (startDateTime <= now) {
      wx.showToast({
        title: '开始时间不能早于当前时间',
        icon: 'none'
      });
      return false;
    }
    
    if (endDateTime <= startDateTime) {
      wx.showToast({
        title: '结束时间不能早于开始时间',
        icon: 'none'
      });
      return false;
    }
    
    if (formData.maxParticipants < 2) {
      wx.showToast({
        title: '参与人数至少为2人',
        icon: 'none'
      });
      return false;
    }
    
    if (formData.price < 0) {
      wx.showToast({
        title: '价格不能为负数',
        icon: 'none'
      });
      return false;
    }
    
    return true;
  },

  // 发布活动
  async onPublish() {
    if (!this.validateForm()) {
      return;
    }
    
    if (this.data.submitting) {
      return;
    }
    
    try {
      this.setData({ submitting: true });
      wx.showLoading({ title: '发布中...' });
      
      const { formData } = this.data;
      
      // 构建活动数据
      const activityData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        sportType: formData.sportType,
        startTime: `${formData.startDate}T${formData.startTime}:00`,
        endTime: `${formData.endDate}T${formData.endTime}:00`,
        location: formData.location.trim(),
        address: formData.address.trim(),
        maxParticipants: formData.maxParticipants,
        price: formData.price,
        requirements: formData.requirements.trim(),
        contactInfo: formData.contactInfo.trim(),
        city: this.data.currentCity
      };
      
      // 调用云函数发布活动
      const result = await wx.cloud.callFunction({
        name: 'publishActivity',
        data: {
          activityData: activityData
        }
      });
      
      if (result.result.success) {
        wx.showToast({
          title: result.result.message,
          icon: 'success'
        });
        
        // 返回首页并刷新
        setTimeout(() => {
          wx.switchTab({
            url: '/pages/home/home'
          });
        }, 1500);
        
      } else {
        throw new Error(result.result.message);
      }
      
    } catch (error) {
      console.error('发布活动失败:', error);
      wx.showToast({
        title: error.message || '发布失败',
        icon: 'none'
      });
    } finally {
      this.setData({ submitting: false });
      wx.hideLoading();
    }
  },

  // 预览活动
  onPreview() {
    if (!this.validateForm()) {
      return;
    }
    
    const { formData } = this.data;
    const sportType = this.data.sportTypes.find(type => type.value === formData.sportType);
    
    wx.showModal({
      title: '活动预览',
      content: `${sportType ? sportType.icon : '🏃'} ${formData.title}\n📅 ${formData.startDate} ${formData.startTime}-${formData.endTime}\n📍 ${formData.location}\n👥 最多${formData.maxParticipants}人\n💰 ¥${formData.price}/人`,
      showCancel: false
    });
  }
});