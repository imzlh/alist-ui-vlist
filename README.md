![vList5](public/images/favicon.svg)

# vList5-aList
<span style="color: gray">性能与全能兼得！</span>

全能还好看的文件管理方案<br>
使用Vue构建，直接使用aList作为后端且支持集成<br>
支持超多打开方式，很多好用的小工具

## vList
修改自我的另一个项目https://github.com/imzlh/vList5

## vList x aList
aList支持多种网盘且统一API，而vList支持多种玩法且功能丰富<br>
a+vList > aList + vList!

## 使用指南

### 1. 分离部署（推荐）
将vList构建的文件放在一个网页服务器上，将aList分离运行<br>
修改config.ts或者使用环境变量修改API地址，如

   VLIST_API=http://demo.org:5244/api/ VLIST_FILE_SERVER=http://demo.org:5244/d/ npm run build

### 2.打包入aList
https://alist.nn.ci/zh/guide/install/source.html<br>
将这个库作为前端文件并构建