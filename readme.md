# lab_platform

>学生实验管理平台, 学生登陆后可以选择实验, 提交实验; 老师登陆后可以查看选择他所带实验的学生, 给学生实验报告评分

#### 网站开发用到的技术
> 前端 `Bootstrap 3` `Angularjs 1.5.6`
> <br>
> 后台 `nodejs`
> <br>
>数据库 `mongoDB`

#### 功能需求

一、账户管理模块(*角色: 老师/学生*)
- [x] 1. 登录
- [x] 2. 注册
- [x] 3. 找回密码
- [x] 4. 修改密码

二、学生功能模块
- [x] 1. 顶部导航(回到首页, 个人信息)
- [x] 2. 左侧导航(实验类别)
   - [x] 点击实验类别, 显示该类别下所属实验列表
   - [x] 点击实验列表下某实验, 显示实验的详情(目的, 原理, 目标, 参考资料)
   - [x] 实验详情下会出现提示按钮(选择该实验)
- [x] 3. 登陆后, 界面会显示该学生选择的实验信息(日期, 名称, 是否提交作业, 分数)
- [x] 3. 选择相应实验后, 在首页会出现该实验项目, 学生可以在老师打分前多次提交实验报告
- [x] 4. 提交报告后, 可以预览提交过实验报告

三、教师功能模块
- [x] 1. 顶部导航(回到首页, 个人信息) `注:目前该页面和学生界面公用`
- [x] 2. 左侧导航(实验类别) `注:目前该页面和学生界面公用`
    - [x] 1. 点击实验类别, 显示该类别下自己创建或是公开的实验列表,
    - [x] 2. 点击删除按钮, 弹出确认删除模态框, 如果该实验已经被其他学生或老师选择, 则无法删除
    - [x] 3. 点击修改按钮, 修改实验列表的各项信息(图片, 实验名称, 实验描述)
    - [x] 4. 进入实验修改页面
           - [x] 如果实验是自己创建的, 页面顶部显示`编辑`详情按钮;
           - [x] 如果实验由其他老师创建, 页面顶部会显示`引用实验`按钮, 如果已经引用过该实验, 此时页面顶部会显示`解除引用`按钮, 如果其他学生已经选择了该实验, 则`解除引用`不能成功解除
- [x] 3. 教师登陆后, 首页会显示所带学生的信息列表(姓名, 学号, 实验, 是否提交, 打分)
    - [x] 1. 如果学生已提交作业, 老师可以预览该学生提交的作业(pdf文档)继而可以在分数栏,输入具体分数后提交;
    - [x] 2. 如果学生未提交作业, 老师不能对进行打分操作

#### web structure
一、公共页面
 - 登陆／注册:　login.html
 - 忘记密码：　 recover.html
 - 修改密码：  partials/public/modify-password.html
 - 顶部导航:   nav/nav-header.html
 - 左侧导航:   nav/nav-sidebar.html
 
二、学生界面: 
 - 首页：　     partials/students/work-desc.html
 - 实验列表:   partials/students/lab-list.html
 - 实验详情:   partials/students/lab-detail.html

三、教师界面: 
 - 首页: partials/teacher/students-desc.html
 - 实验列表: partials/teacher/lab-list.html
 - 实验详情: partials/teacher/lab-detail.html

#### 特色功能
- 用户密码在后台以密文方式存储, 如果后台用户丢失, 密码也无法查看
- 用户登陆页面后, 可停留时间是半小时, 半小时后需要重新登陆
- 老师创建实验后, 可选择是否公开这个实验, 如果公开, 那么其他老师可以引用该实验
- 实验列表内容页面, 每页只显示5个实验列表项, 通过底部的分页按钮, 从后台请求下一页的5个列表项

#### 未完成的功能
- [ ] 上传 seedlab 实验室实验 (1 天)
- [ ] 同一个浏览器窗口打开多个用户界面
- [x] token过期后, 前端界面的自动跳转(后台完成)
- [ ] 找一个详情编辑器替代 textAngular
- [x] 实验列表的分页功能
- [x] 修改实验分类后, 从当前分类列表中移除


#### 工作量
- From: 2016-05-19
-  Now: 2016-06-07 