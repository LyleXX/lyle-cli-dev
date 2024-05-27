'use strict';

const path = require('path');
const {isObject} = require('@lyle-cli-dev/utils')
const pkgDir = require('pkg-dir').sync;
const formatPath = require('@lyle-cli-dev/format-path');

class Package{
    constructor(options){
        if(!options ){
            throw new Error('Package类的options参数不能为空');
        }
        if(!isObject(options)){
            throw new Error('Package类的options参数必须为对象');
        }
        // package的目标路径
        this.targetPath = options.targetPath;
        // package的name
        this.packageName = options.packageName;
        // package的version
        this.packageVersion = options.packageVersion;
    }

    // 判断当前package是否存在
    exists(){}

    // 安装package
    install(){}

    // 更新package
    update(){}

    // 获取入口文件
    getRootFile(){
        // 1.获取package.json所在目录 - pkg-dir 5.0.0
        const dir = pkgDir(this.targetPath);
        if(dir){
        // 2.读取package.json - require() js/json/node
        const pkgFile = require(path.resolve(dir,'package.json'))
        // 3.寻找main/lib - path
        if(pkgFile && (pkgFile.main)){
            // 4.路径兼容(macOS/windows)
            return formatPath(path.resolve(dir,pkgFile.main))
        }
        }
        return null
    }
}

module.exports = Package;


