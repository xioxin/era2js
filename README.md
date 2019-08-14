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

#### TS编译原理
https://jkchao.github.io/typescript-book-chinese/compiler/overview.html
> 参考学习工作原理

#### 别人踩坑经历
https://blog.zsxsoft.com/post/28

#### sweet.js
https://www.sweetjs.org/
###### 中文资料
https://segmentfault.com/a/1190000000401847



#### acorn
https://github.com/acornjs/acorn
https://juejin.im/post/582425402e958a129926fcb4



## 相关库
| 组件 | 描述 | 地址 |
| :--- | :--- | :--- |
| jison | JavaScript编写的语法解析器类似Bison | http://jison.org |
| jison-gho | ↑ 的分叉, 仍在积极维护的版本 | https://github.com/GerHobbelt/jison |
| escodegen | AST构建JavaScript代码 | https://github.com/estools/escodegen |

## Think
#### 如何实现 WAIT INPUT 之类的等待函数
> 使用 async 与 await 解决

#### 如何实现goto函数
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
          next = 'block3'; break; // GOTO block3
      case 'block2':
          console.log('测试代码块2', i);
          next = 'block3'; break; // GOTO block3
      case 'block3':
          console.log('测试代码块3', i);
          if(i < 3){
              i++;
              next = 'block2'; break; // GOTO block2
              
          }
          next = ''; break; // END
      default:
          break gotoWhile;
    }
}
/*
运行结果:
测试代码块1
测试代码块3 0
测试代码块2 1
测试代码块3 1
测试代码块2 2
测试代码块3 2
测试代码块2 3
测试代码块3 3
*/
```

#### 关于era数组变量在使用时 直接读取会获得到下标0的数据解决方法

1. 通过编译器 当做语法糖自动加上下标比如 `ARGS` -> `ARGS[0]`
2. 封装类
```
class EraVar extends Array {
  constructor(...args) {
    super(...args)
  }

  toString(){
    return this[0] || ''
  }

  valueOf() {
    return this[0] || 0
  }

}

const ARGS = new EraVar(1,2,3,4,5,6);

console.log(ARGS) // [1,2,3,4,5,6]
console.log(ARGS + 1) // 2
console.log(ARGS[1] + 1) // 3
console.log(`HP: ${ARGS}`) // HP: 1

```



