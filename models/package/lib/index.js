'use strict'

const path = require('path')
const fes = require('fs-extra')
const { isObject } = require('@lyle-cli-dev/utils')
const pkgDir = require('pkg-dir').sync
const pathExists = require('path-exists').sync
const formatPath = require('@lyle-cli-dev/format-path')
const npminstall = require('npminstall')
const {
  getDefaultRegistry,
  getNpmLatestVersion
} = require('@lyle-cli-dev/get-npm-info')

class Package {
  constructor(options) {
    if (!options) {
      throw new Error('Package类的options参数不能为空')
    }
    if (!isObject(options)) {
      throw new Error('Package类的options参数必须为对象')
    }
    // package的目标路径
    this.targetPath = options.targetPath
    // package的缓存路径
    this.storeDir = options.storeDir
    // package的name
    this.packageName = options.packageName
    // package的version
    this.packageVersion = options.packageVersion
    // package的缓存目录前缀
    this.cacheFilePathPrefix = this.packageName.replace('/', '_')
  }

  async prepare() {
    // fs-extra@9.0.1
    if (this.storeDir && !pathExists(this.storeDir)) {
      fes.mkdirpSync(this.storeDir)
    }
    if (this.packageVersion === 'latest') {
      this.packageVersion = await getNpmLatestVersion(this.packageName)
    }
  }

  get cacheFilePath() {
    return path.resolve(
      this.storeDir,
      `_${this.cacheFilePathPrefix}@${this.packageVersion}@${this.packageName}`
    )
  }

  getSpecificCacheFilePath(packageVersion) {
    return path.resolve(
      this.storeDir,
      `_${this.cacheFilePathPrefix}@${packageVersion}@${this.packageName}`
    )
  }

  // 判断当前package是否存在
  async exists() {
    if (this.storeDir) {
      await this.prepare()
      return pathExists(this.cacheFilePath)
    } else {
      return pathExists(this.targetPath)
    }
  }

  // 安装package
  async install() {
    // npminstall 4.10.0
    await this.prepare()
    return npminstall({
      root: this.targetPath,
      storeDir: this.storeDir,
      registry: getDefaultRegistry(),
      pkgs: [
        {
          name: this.packageName,
          version: this.packageVersion
        }
      ]
    })
  }

  // 更新package
  async update() {
    await this.prepare()
    // 获取最新的npm模块版本号
    const latestPackageVersion = await getNpmLatestVersion(this.packageName)
    // 查询最新版本号对应的路径是否存在
    const latestFilePath = this.getSpecificCacheFilePath(latestPackageVersion)
    // 如果不存在，则安装最新版本
    if (!pathExists(latestFilePath)) {
      await npminstall({
        root: this.targetPath,
        storeDir: this.storeDir,
        registry: getDefaultRegistry(),
        pkgs: [
          {
            name: this.packageName,
            version: latestPackageVersion
          }
        ]
      })
      this.packageVersion = latestPackageVersion
    } else {
      this.packageVersion = latestPackageVersion
    }
  }

  // 获取入口文件
  getRootFile() {
    function _getRootFile(targetPath) {
      // 1.获取package.json所在目录 - pkg-dir 5.0.0
      const dir = pkgDir(targetPath)
      if (dir) {
        // 2.读取package.json - require() js/json/node
        const pkgFile = require(path.resolve(dir, 'package.json'))
        // 3.寻找main/lib - path
        if (pkgFile && pkgFile.main) {
          // 4.路径兼容(macOS/windows)
          return formatPath(path.resolve(dir, pkgFile.main))
        }
      }
      return null
    }
    if (this.storeDir) {
      return _getRootFile(this.cacheFilePath)
    } else {
      return _getRootFile(this.targetPath)
    }
  }
}

module.exports = Package
