# perf-report

Web 端性能数据上报插件。

## 使用

### 安装
```bash
npm i git+ssh://git@git.corp.imdada.cn:fe/perf-report.git
```
or

```bash
yarn add git+ssh://git@git.corp.imdada.cn:fe/perf-report.git
```

### 初始化
```javascript
import { init } from 'perf-report'

init({
  project: [project_name],
  version: [project_version]
})
```
举例：
```javascript
import { init } from 'perf-report'
import pkg from 'package.json'

init({
  project: pkg.name,
  version: pkg.version
})
```

## 开发

### 克隆项目
```bash
git clone git@git.corp.imdada.cn:fe/perf-report.git
```

### 安装依赖
```bash
cd perf-report

npm install
```

### 版本发布
打包
```bash
npm run build
```
Git 提交

版本发布
```bash
npm version [patch/minor/major] -m "Release Version %s"
```