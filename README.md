## 目录结构

```
├── mock                     # 本地模拟数据
├── public
│   │
│   └── index.html           # HTML 入口模板
├── src
│   ├── common               # 应用公用配置，如导航信息
│   ├── components           # 业务通用组件
│   ├── layouts              # 通用布局
│   ├── models               # dva model
│   ├── routes               # 业务页面入口和常用模板
│   ├── services             # 后台接口服务
│   ├── utils                # 工具库
│   ├── g2.js                # 可视化图形配置(备用)
│   ├── polyfill.js          # 兼容性垫片工具
│   ├── theme.js             # 主题配置
│   ├── index.js             # 应用入口
│   ├── index.less           # 全局样式
│   └── router.js            # 路由入口
├── tests                    # 测试文件 npm test
├── README.md
└── package.json
```


###系统环境

node >= 8.4.0

npm >= 5.5.1

### 配置项

####console配置(所有配置文件都在对应目录，后缀多一个.bak)

```shell
console.cli.im/consrc/common/origin.js
console.cli.im/.roadhogrc
console.cli.im/dist/sso.html #用于本地用户中心登录(dist目录在build之后才会有)
```

#### 用户中心配置

```javascript
user_center/bin/config.php
SSO_HOST_ARR加一项console.cli.me	// 本地配置域名指向127.0.0.0
```

### 项目初始化

```shell
#进入项目目录
cd console.cli.im
#项目工程初始化
npm intsall
#本地热更新服务构建(访问localhost:8000 改host指向console.cli.me:8000)
npm start
#本地生产环境配置(一般不需要)
npm run build
```