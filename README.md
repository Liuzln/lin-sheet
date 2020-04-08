# lin-sheet
基于 canvas 的表格编辑器。

![image](https://raw.githubusercontent.com/Liuzln/lin-sheet/master/gif/GIF%202020-4-8%2012-52-36.gif)

## 优化项清单
- [x] canvas 离屏渲染
- [x] 表格滚动时，从canvas离屏渲染的数据中裁剪所需区域，绘制到可视canvas上
- [ ] canvas 离屏渲染可视部分
- [ ] 更易用的鼠标点击控制光标
- [ ] 火狐浏览器在高DPI的情况下，滚动条无法跟着鼠标

## :white_check_mark: 开发项清单
- [x] 渲染表格和内容
  - [x] 列名称默认为英文字母递增
  - [x] 行名称默认为数字递增
- [x] 按比例缩放表格
·- [ ] 单元格内容输入
 - [x] 基础输入
 - [x] 中文输入
 - [x] 内容粘贴
 - [ ] 日期选择
  - [ ] 手动填写
  - [ ] 弹出框选择
- [ ] 单元格操作
  - [x] 单元格选择
    - [x] 鼠标点击选择
    - [x] 键盘方向键控制
  - [ ] 单元格多选
  - [ ] 单元格复制
- [x] 虚拟光标
  - [x] 鼠标控制光标位置
  - [x] 键盘控制光标位置
  - [x] 在光标位置输入内容
  - [x] 适应缩放比例
- [x] 滚动条
  - [x] 水平滚动条
  - [x] 竖向滚动条
  - [x] 表格滚动
  - [x] 编辑区域滚动
  - [x] 适应缩放比例
- [ ] 单元格内容框选
- [ ] 单元格内容处理
  - [ ] 内容溢出时，增加编辑区域宽度
  - [ ] 内容溢出时，自动换行，增加编辑区域高度
- [x] 表格自定义
  - [x] 自定义列名称
  - [x] 自定义行名称
  - [x] 自定义单元格展示Key
- [ ] 行操作 Row 
  - [ ] 编辑行名称
  - [ ] 控制行高度
  - [ ] 增加行的选择效果
- [ ] 列操作 Cloumn
  - [ ] 编辑列名称
  - [ ] 控制列宽度
  - [ ] 增加列的选择效果

## 启动
```
npm install
npm run serve
```
