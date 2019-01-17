# era2js

> 注意该项目当前为探索性质,随时可能会鸽 <br>
> 这里只是一些实验性代码与资料, 暂时并没有实质的功能

这是一个ERA转Javascript脚本的转换器

![image](https://user-images.githubusercontent.com/5716100/51324923-d7dd2b00-1aa6-11e9-952d-3016e21b3f47.png)



## 资料

#### ERA语法高亮
https://github.com/sasami/vscode-erabasic
> 通过代码高亮相关代码可以了解很多token的解析方法 以及粗略的逻辑 <br>
> 项目中 vscode-erabasic-master 为该项目的clone

#### ERA WIKI
http://xiaxiansy.pw/sy/index.php/Era%E4%BB%A3%E7%A0%81%E6%95%99%E7%A8%8B%E5%92%8C%E6%B1%89%E5%8C%96%E5%B7%A5%E5%85%B7
> 汉化的ERA代码教程 了解语法

## 相关库
| 组件 | 描述 | 地址 |
| :--- | :--- | :--- |
| jison | JavaScript编写的语法解析器类似Bison | http://jison.org |
| jison-gho | ↑ 的分叉, 仍在积极维护的版本 | https://github.com/GerHobbelt/jison |
| escodegen | AST构建JavaScript代码 | https://github.com/estools/escodegen |

## Think
* 如何实现 WAIT INPUT 之类的等待函数
> 使用 async 与 await 解决

* 如何实现goto函数
> js没有goto函数 采用 while + switch 可以解决这个问题
> 代码如下 
```javascript
let next = 'block1';
let i = 0;
gotoWhile:
while (true){
    switch (next) {
      case 'block1':
          console.log('测试代码块1');
          next = 'block3';
          break;
      case 'block2':
          console.log('测试代码块2', i);
          next = 'block3';
          break;
      case 'block3':
          console.log('测试代码块3', i);
          if(i < 3){
              i++;
              next = 'block2';
              break;
          }
          next = '';
          break;
      default:
          break gotoWhile;
    }
} 
```