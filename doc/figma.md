# 约球小程序 Figma 原型图设计说明

## 一、概述

本项目为「约球」小程序的前端原型设计，用于展示活动、预订场地和社交约球功能。原型图需涵盖以下页面：

- 首页
- 活动详情页
- 我的页
- 预订场地页
- 申请参与活动页

## 二、画板组织建议

每个页面分别一个画板，命名方式为：
[页面编号]_[页面名称]_v1

例如：
- `01_首页_v1`
- `02_活动详情页_v1`
- `03_我的_v1`
- `04_预订场地_v1`
- `05_申请参与活动_v1`

---

## 三、页面结构与元素说明

### 01. 首页

#### 画板名称
`01_首页_v1`

#### 页面组成
- 顶部导航栏
  - 城市名称 + 图标（可点击切换城市）
  - 🔍 搜索图标（可选）
- 活动卡片区域（垂直滚动）
  - 活动封面图
  - 活动标题
  - 活动时间 / 地点 / 人数信息
  - 状态标签（如“🔥热门”“🆕新活动”）
- 下拉刷新提示组件
- 悬浮发布按钮（右下角“+”号，跳转到发布活动页）

#### 交互说明
- 未授权定位 → 弹窗提示，默认显示“上海”数据
- 手动城市选择 → 弹出城市列表面板

---

### 02. 活动详情页

#### 画板名称
`02_活动详情页_v1`

#### 页面组成
- 顶部返回按钮 + 活动标题
- 活动信息区：
  - 活动标题、副标题（如“网球双打体验赛”）
  - 活动时间、场地地址（地图图标可跳转）
  - 活动介绍长文（支持展开收起）
- 场地图片：大图横向滑动或单张展示
- 已参与用户列表（横向头像 + 昵称）
- 底部操作区（悬浮在右下角）：
  - [申请参与] 按钮
  - [预订场地] 按钮

#### 交互说明
- 若当前用户为发布者，按钮变为“管理活动”
- 参与人数达到上限或报名截止时间 → 申请按钮变灰

---

### 03. 我的页

#### 画板名称
`03_我的_v1`

#### 页面组成
- 顶部用户信息区域
  - 头像
  - 昵称（可编辑）
  - 绑定手机号
- Tabs 区域：
  - Tab1：我发布的
  - Tab2：我申请的
  - Tab3：我参与的
- 活动列表项（每个Tab通用）：
  - 活动标题、时间、地点
  - 状态标签（“进行中”“已结束”“待确认”）
  - 操作按钮（如取消发布、撤回申请）

#### 交互说明
- Tab 切换时列表更新
- 点击活动跳转活动详情页
- 点击操作按钮弹出确认提示

---

### 04. 预订场地页

#### 画板名称
`04_预订场地_v1`

#### 页面组成
- 顶部筛选区：
  - 城市选择
  - 活动类型选择（多选/单选）
  - 价格、距离筛选（滑块 or 下拉）
- 场地列表：
  - 封面图 + 名称
  - 价格、距离、设施标签
  - 支持滑动查看
- 地图组件：
  - 显示所有球场位置
  - 支持点击气泡查看详情
- 切换视图按钮（地图/列表）

#### 交互说明
- 地图与列表数据保持同步
- 点击场地 → 跳转场地详情页进行预订

---

### 05. 申请参与活动页

#### 画板名称
`05_申请参与活动_v1`

#### 页面组成
- 活动简要信息（复用活动卡片样式）
- 活动介绍文字
- 场地图片
- 发布者信息（头像 + 昵称）
- 填写备注（可选输入框）
- 底部提交申请按钮

#### 交互说明
- 点击提交后弹出“申请已提交”Toast 或状态提示页面
- 若活动有参与门槛（性别、水平），提前提示

---

## 四、组件建议

- ✅ 通用按钮组件（主按钮、次按钮、禁用按钮）
- ✅ 活动卡片组件
- ✅ 活动标签组件（如🔥、🆕）
- ✅ 城市选择器（可复用）
- ✅ 顶部导航栏（支持城市 + 搜索）
- ✅ 悬浮操作按钮（FAB 样式）

---

## 五、颜色与风格建议

- 主色调：活力橙（#FF6D00）
- 辅助色：草绿色 / 湛蓝色（用于标签或状态区分）
- 字体风格：偏向年轻、潮酷、运动感（可选“阿里巴巴普惠体”或“OPPOSans”）
- 圆角卡片设计（8~12px Radius）
- 暗色模式：兼容设计，不强制实现，但需考虑未来扩展性

---

## 六、设备适配建议

- 基于 iPhone 14 / iPhone 12 Pro 尺寸设计（375x812）
- 小程序要求组件缩放适配不同屏幕（字体不小于14px）

---

## 七、设计交付内容

- Figma 文件结构清晰，分组合理，命名规范（Button/Tab/Modal 等组件命名标准化）
- 提供每个画板的交互连接（Prototype 模式）
- 提供页面状态变更交互（如按钮点击、Tab切换、弹窗）

---

