/**
 * Created by kevalin on 2015/4/27.
 */
var async = require('async');
var SSH2Utils = require('ssh2-utils');
var fs = require('fs');
var ssh = new SSH2Utils();
// var privateKey = '../xxx.pem';

/*
exec linux shell on remote-servers
----------------------------------------------------------------------------------------------
 */
exports.cmdShell2 = function(cmd, ips, password,port,callback) {
    if(!cmd || !ips || !ips.length) {
        console.log('cmdShell2 ERR - 缺少参数')
    }
    else {
        var results = [];
        async.waterfall([
            function(cb1) {
                var servers = [];
                    var _server = {};
                    _server['host'] = ips;
                    _server['username'] = 'root';
                    _server['password'] = password;
                    _server['port'] = port;
                    servers.push(_server)
                cb1(null, servers)
            },
            function(servers, cb1) {
                async.each(servers, function(server, cb2) {
                    var _result = {};
                    ssh.exec(server, cmd, function(err, stdout, stderr, server, conn) {
                        if (err) {
                          if (err.message.substr(-11)=="File exists") {
                            console.log(`${err.message.substr(32,35)}===>该目录已经存在,跳过创建`);
                          }
                          // console.log(`${err.message},跳过创建`);
                          if(err.code == 3 || err.message=="read ECONNRESET" ){

                            throw "连接断开!!!!"
                          }
                        };
                        _result['ip'] = server.host;
                        _result['cmdResult'] = stdout.replace('\n\n', '').replace('\n', '');
                        results.push(_result);
                        conn.end()
                        cb2()
                    })
                }, function(err) {
                    cb1(err, results)
                })
            }
        ], function(err, result) {
            if (err) throw err;
            callback(result,err)
        })
    }
}

/*
put file to remote-servers function
----------------------------------------------------------------------------------------------
 */
exports.putFiles = function(ips, filename, localPath, remotePath,password,port,callback) {
    if (!ips || !filename || !remotePath || !localPath) {
        console.log('putFiles ERR - 缺少参数')
    }
    else {
        async.waterfall([
            function(cb1) {
                var servers = [];
               
                    var _server = {};
                    _server['host'] = ips;
                    _server['username'] = 'root';
                    _server['password'] = password;
                    _server['port'] = port;
                    servers.push(_server)
                
                cb1(null, servers)
            },
            function(servers, cb1) {
                async.each(servers, function(server, cb2) {
                    var _localFile = localPath + filename;
                    var _remoteFile = remotePath+'/'+ filename
                    // + "/"+ filename
                    // +'/' + filename;
                    console.log(_localFile,_remoteFile);
                    
                    ssh.putFile(server, _localFile, _remoteFile, function(err, server, conn) {
                        if (err) {
                            console.log(err.message)
                           if(err.code == 3){
                             
                            throw "连接断开!!!!"
                          }
                        }
                        conn.end();
                        cb2()
                    })
                }, function(err) {
                    cb1()
                })
            }
        ], function(err, result) {
            if (err) throw err;
            callback('put file success!!!')
        })
    }
}