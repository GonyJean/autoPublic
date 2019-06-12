# :large_blue_diamond: AutoPublic自动化部署
鉴于工作中部署项目时涉及服务器过多、重复操作较多，为了提高部署效率，特编写此工具，目前已经实现前端项目自动部署

------
## 开发语言
### **Node.js**  
## 目录结构
```JavaScript
│      index.js // 入口
│      config.js // 配置文件
├─app
│      index.js // SSH2功能封装

```
### 使用方法
1. 配置config.js中的服务器信息、项目路径。
2. 使用pkg进行打包 `pkg -t win index.js`
3. 将项目文件放在exe同目录下
4. 双击主程序,等待自动部署  

### config.js配置
``` javascript
exports.users = [
// 多服务器请自行拓展
  { 
    host: "1.1.1.1",
    port: 111,
    username: "1",
    password: "1",
    wwwPath: [// 前端项目路径配置
      {
        path: "/root/XXX/www/test-9010", // 服务器项目路径
        fileName: "dist.zip" // 对应本地项目文件名称 打包成zip
      },
   
	 /* 多项目在这里增加 
	 { 
        path: "", // 服务器项目路径
        fileName: "" // 对应本地项目文件名称 打包成zip
      },
	  */
    ]
  }
];
```

