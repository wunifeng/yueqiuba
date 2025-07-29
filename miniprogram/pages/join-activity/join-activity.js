// pages/join-activity/join-activity.js
Page({
  data: {
    activityId: '',
    activity: {
      id: 1,
      title: '周末羽毛球约战',
      subtitle: '双打友谊赛，欢迎各水平球友',
      time: '今天 19:00-21:00',
      location: '浦东新区羽毛球馆',
      price: 45,
      participants: 6,
      maxParticipants: 8,
      image: '🏸',
      organizer: {
        avatar: '👤',
        nickname: '羽毛球达人',
        level: '中级'
      },
      requirements: {
        gender: '', // male, female, ''
        level: '', // beginner, intermediate, advanced, ''
        age: '', // 18-25, 26-35, 36-45, 46+, ''
        other: '请穿着运动服装，自备球拍'
      }
    },
    
    // 表单数据
    formData: {
      skillLevel: '',
      experience: '',
      remark: '',
      contactPhone: '',
      emergencyContact: ''
    },
    
    // 技能水平选项
    skillLevels: [
      { value: 'beginner', label: '初级', desc: '刚开始接触，基本动作不熟练' },
      { value: 'intermediate', label: '中级', desc: '有一定基础，能进行基本对战' },
      { value: 'advanced', label: '高级', desc: '技术娴熟，经验丰富' },
      { value: 'professional', label: '专业', desc: '专业水平，参加过比赛' }
    ],
    
    // 运动经验选项
    experienceOptions: [
      { value: '1', label: '1年以下' },
      { value: '1-3', label: '1-3年' },
      { value: '3-5', label: '3-5年' },
      { value: '5+', label: '5年以上' }
    ],
    
    submitting: false,
    agreed: false
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
    
    setTimeout(() => {
      wx.hideLoading();
      // 这里可以根据id从服务器获取具体活动数据
    }, 500);
  },

  // 返回上一页
  onBack() {
    wx.navigateBack();
  },

  // 技能水平选择
  onSkillLevelChange(e) {
    this.setData({
      'formData.skillLevel': e.detail.value
    });
  },

  // 运动经验选择
  onExperienceChange(e) {
    this.setData({
      'formData.experience': e.detail.value
    });
  },

  // 备注输入
  onRemarkInput(e) {
    this.setData({
      'formData.remark': e.detail.value
    });
  },

  // 联系电话输入
  onPhoneInput(e) {
    this.setData({
      'formData.contactPhone': e.detail.value
    });
  },

  // 紧急联系人输入
  onEmergencyContactInput(e) {
    this.setData({
      'formData.emergencyContact': e.detail.value
    });
  },

  // 同意协议
  onAgreeChange(e) {
    this.setData({
      agreed: e.detail.checked
    });
  },

  // 查看协议
  onViewAgreement() {
    wx.showModal({
      title: '参与协议',
      content: '1. 参与者需确保身体健康，适合参加体育活动\n2. 活动期间请遵守场地规则和组织者安排\n3. 如有身体不适请立即停止运动\n4. 参与者需对自己的安全负责\n5. 活动费用一经支付不予退还',
      showCancel: false
    });
  },

  // 表单验证
  validateForm() {
    const { formData, agreed } = this.data;
    
    if (!formData.skillLevel) {
      wx.showToast({
        title: '请选择技能水平',
        icon: 'none'
      });
      return false;
    }
    
    if (!formData.experience) {
      wx.showToast({
        title: '请选择运动经验',
        icon: 'none'
      });
      return false;
    }
    
    if (!formData.contactPhone) {
      wx.showToast({
        title: '请填写联系电话',
        icon: 'none'
      });
      return false;
    }
    
    // 验证手机号格式
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!phoneRegex.test(formData.contactPhone)) {
      wx.showToast({
        title: '请填写正确的手机号',
        icon: 'none'
      });
      return false;
    }
    
    if (!agreed) {
      wx.showToast({
        title: '请阅读并同意参与协议',
        icon: 'none'
      });
      return false;
    }
    
    return true;
  },

  // 提交申请
  onSubmit() {
    if (!this.validateForm()) {
      return;
    }
    
    if (this.data.submitting) {
      return;
    }
    
    this.setData({
      submitting: true
    });
    
    wx.showLoading({
      title: '提交中...'
    });
    
    // 模拟提交
    setTimeout(() => {
      wx.hideLoading();
      this.setData({
        submitting: false
      });
      
      wx.showModal({
        title: '申请成功',
        content: '您的申请已提交，请等待组织者确认。我们会通过短信或小程序消息通知您结果。',
        showCancel: false,
        success: () => {
          wx.navigateBack();
        }
      });
    }, 2000);
  },

  // 联系组织者
  onContactOrganizer() {
    wx.showActionSheet({
      itemList: ['微信联系', '电话联系'],
      success: (res) => {
        if (res.tapIndex === 0) {
          wx.showToast({
            title: '微信联系功能开发中',
            icon: 'none'
          });
        } else {
          wx.showToast({
            title: '电话联系功能开发中',
            icon: 'none'
          });
        }
      }
    });
  }
});