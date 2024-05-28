'use strict';

module.exports = exec;

const path = require('path');
const Package = require('@lyle-cli-dev/package');
const log = require('@lyle-cli-dev/log');

const SETTINGS = {
    init:'@imooc-cli/init'
}

const CACHE_DIR = 'dependencies';

async function exec() {
    let targetPath = process.env.CLI_TARGET_PATH;
    const homePath = process.env.CLI_HOME_PATH;
    let storeDir = ''
    let pkg
    log.verbose('targetPath', targetPath);
    log.verbose('homePath', homePath);

    const cmdObj = arguments[arguments.length - 1];
    const cmdName = cmdObj.name();
    const packageName = SETTINGS[cmdName];
    const packageVersion = 'latest';

    if(!targetPath){
        targetPath = path.resolve(homePath,CACHE_DIR) // 生成缓存路径
        storeDir = path.resolve(targetPath,'node_modules') // 生成缓存路径
        log.verbose('targetPath', targetPath,'storeDir',storeDir);
        pkg = new Package({targetPath, storeDir,packageName, packageVersion});
        if(await pkg.exists()){
            //  更新package

        }else{
            // 安装package
           await pkg.install();
        }
    }else{
         pkg = new Package({targetPath, packageName, packageVersion});
    }
    console.log(await pkg.exists())
    const rootFile = pkg.getRootFile();
    if(rootFile){
        require(rootFile).apply(null, arguments);
    }

    // 1.targetPath => modulePath
    // 2.modulePath => Package(npm模块)
    // 3.Package.getRootFile(入口文件)
    // 4.Package.update / Package.install
}
