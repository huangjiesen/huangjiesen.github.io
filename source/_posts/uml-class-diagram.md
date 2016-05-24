---
title: UML类图关系表示说明
date: 2016-05-23 17:46:05
tags:
- UML
- 类图
- 设计
categories: UML
---
这里参考`<<大计设计模式>>`对`UML`类图常见关系表示做简单的摘要记录，关于`UML`更多信息请参见：[统一建模语言](https://zh.wikipedia.org/wiki/统一建模语言)
![](/imgs/3.png)

# 类(Class)

类图分三层，第一层显示类的名称，如果是抽象类，则用斜体表示。第二层是类的特性，通常是字段或属性。第三层是行为，通常是方法或函数。注意前面的符号，`+`表示`public`、`-`表示`private`、`#`表示`protected`
<!-- more -->
![](/imgs/4.png)


# 接口(interface)
与类的区别是顶端有`<<interface>>`显示，第一层显示接口名称，第二层是接口方法。接口还有另一种表示的方法，俗称棒棒糖表示法，就是下图唐老鸭类实现了`讲人话`的接口。
![](/imgs/5.png)

# 类与接口的关系
## 继承(extends)
`空心三角形+实线`表示`继承`关系。如示例图中`动物`、`鸟`、`鸭`、`唐老鸭`之间的关系符号。
![](/imgs/6.png)
``` java
//继承动物类
public class Bird extends Animal{
}
```
## 实现接口(implements)
`空心三角+虚线`表示`实现接口`。如是示例图中类`大雁`实现了接口`飞翔`。
![](/imgs/7.png)
``` java
//现实飞翔接口
public class WideGoose implements IFly{
}
```
## 关联(association)
`实线箭头`表示`关联`关系。如企鹅和气候这两个类的关联，企鹅需要`知道`气候的变化，需要`了解`气候规律。当一个类`知道`另一类时，可以用`关联(association)`。
![](/imgs/8.png)
``` java
public class Penguin extends Bird{
  //企鹅Penguin中，引用到气候Climate对象
  private Climate climate;
}
```
## 聚合(Aggregation)
`空心菱形+实线箭头`表示`聚合`关系。**聚合表示一种弱的`拥有`关系，体现的是A对象可以包含B,但B对象不是A对象的一部分**。如：`大雁`与`雁群`两个类，大雁是群居动物，每只大雁都属于一个雁群，一个雁群可以有多只大雁，所以它们之间就满足了`聚合`关系。
![](/imgs/9.png)
``` java
public class WideGooseAggregate{
  //在雁群WideGooseAggregate类中，有大雁数组对象arrayWideGoose
  private WideGoose[] arrayWideGoose;
}
```
## 合成(Composition,也有翻译成 组合 的)
`实心菱形+实线箭头`表示`合成`关系，另外，合成关系的连线两端还有一个数字`1`和`2`,这被称为基数,表明这一端的类可以有几个实例，很显然一个鸟应该有两个翅膀，如果一个类可能有无数个实例，则就用`n`表示，`关联`与`聚合`关系也可以有基数。**`合成`是一种强的`拥有`关系，体现了严格的部分和整体的关系，部分和整体的生命周期一样**,如`鸟`和其`翅膀`就是`合成`关系，因为它们是部分和整体的关系，并且翅膀和鸟的生命周期是相同的。
![](/imgs/10.png)
``` java
public class Bird{
	private Wing wing;
	public Bird(){
		//在鸟Bird类中，初始化时，实例化翅膀Wing,它们之间同时生成
		wing=new Wing();
	}
}
```
## 依赖关系(Dependency)
`虚线箭头`表示依赖关系。如动物要有生命力，需要氧气、水以及食物等。也就是说，动物依赖氧气和水。
![](/imgs/11.png)
``` java
abstract class Animal{
	void metabolism(Oxygen oxygen,Water water){
	}
}
```
