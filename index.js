var Client = require("ssh2").Client;
var clientServer = require("./app");
var async = require("async");
var moment = require("moment");
var users = require(process.cwd() + "/config");
var DATE1 = moment().format("YYYY-MM-DD");
var filename = "dist.zip"; //文件名
var localPaht = "./"; // 本地路径
var cmd = [];
var fs = require('fs');
let options = {
  flags: 'a',     // append模式
  encoding: 'utf8',  // utf8编码
};
let stdout = fs.createWriteStream('./stdout.log', options);
let stderr = fs.createWriteStream('./stderr.log', options);
// 创建logger
let logger = new console.Console(stdout, stderr);
async.mapLimit(
  users.users,
  5,
  function(e, callbackU) {
    let ip = e.host;
    let password = e.password;
    let port = e.port
    let bakPath = e.bakPath;
    async.mapSeries(
      e.wwwPath,
      function(path, callbackE) {
        (async function() {
          let filename = path.fileName;
          path = path.path;
          var one = await bak(ip, password,port, path, filename,bakPath);
          var two = await up(path, filename, password, ip,port);
          var three = await unzip(ip, password, port,path, filename);
          // logger.log(one, two, three);
          logger.log('####################');
          logger.log(`${ip} 服务器----${path} 项目部署完毕!!`);
          logger.log('####################');
          console.log('####################');
          console.log(`${ip} 服务器----${path} 项目部署完毕!!`);
          console.log('####################');
          callbackE(null,ip)
        })();
      },
      function(err, res) {
        callbackU(null,res)
      }
    );
  },
  function(err, res) {
    logger.log("本次部署服务器列表:", JSON.stringify(res));
    console.log("本次部署服务器列表:", JSON.stringify(res));
  }
);

function unzip(ip, password,port, path, filename) {
  return new Promise((resolve, reject) => {
    cmd = [
      `unzip ${path}/${filename} -d ${path}/`, // 解压
      `rm -rf ${path}/${filename}` // 删除解压文件
    ];
    async.mapSeries(
      cmd,
      function(c, callbackU) {
        (async () => {
          var dd = await new Promise((res, reject) => {
            clientServer.cmdShell2(c, ip, password,port, function(result) {
              logger.log(`当前执行命令:${c} >>>>>> 解压缩文件完成!!`);
              console.log(`当前执行命令:${c} >>>>>> 解压缩文件完成!!`);
              res()
            });
          });
          callbackU(null,c)
        })();
      },
      function(err, res) {
        // logger.log(res);
        resolve();
      }
    );
  });
}
function bak(ip, password,port, path, filename,bakPath) {
  return new Promise((resolve, reject) => {
    logger.log(
      `备份文件储存到>>> ${bakPath}${DATE1}/${path.replace(
        `${bakPath}`,
        ""
      )} 当前路径:${path}`
    );
    console.log(
      `备份文件储存到>>> ${bakPath}${DATE1}/${path.replace(
        `${bakPath}`,
        ""
      )} 当前路径:${path}`
    );
    cmd = [
      // `rm -rf /root/bakFile/${DATE1}}`,
      // `rm -rf /root/bakFile/${DATE1}/${e.replace("/root/XXXXX/www/", "")}`,
      `mkdir ${bakPath}${DATE1}`,
      `mkdir ${bakPath}${DATE1}/${path.replace(path,"")}`,
      `cp -rf ${path} ${bakPath}${DATE1}/${path.replace(
        path,
        ""
      )}`, //备份项目里面的文件
      `cd ${path} `,
      `find ${path} -name dist -exec rm -rf {} \\;`, //删除项目里面的文件
      `find ${path} -name index.html -exec rm -rf {} \\;` //删除项目里面的文件
    ];
    async.mapSeries(
      cmd,
      function(c, callbackU) {
        (async () => {
          var dd = await new Promise((res, rej) => {
            clientServer.cmdShell2(c, ip, password,port, function(result) {
              logger.log(`当前执行命令:${c}`);
              console.log(`当前执行命令:${c}`);
              res(c);
            });
          });
          callbackU(null,c);
        })();
      },
      function(err, res) {
        logger.log("备份操作执行完毕: " + res);
        console.log("备份操作执行完毕: " + res);
        resolve();
      }
    );
  });
}
function up(path, filename, password, ip,port) {
  return new Promise((resolve, reject) => {
    logger.log(path + " 开始上传!!");
    console.log(path + " 开始上传!!");
    clientServer.putFiles(ip, filename, localPaht, path, password,port, function(
      msg
    ) {
      logger.log(path + " 上传完毕!! 现在开始解压!!");
      logger.log(`开始解压缩文件到${path}/`);
      console.log(path + " 上传完毕!! 现在开始解压!!");
      console.log(`开始解压缩文件到${path}/`);
      resolve();
    });
  });
}
