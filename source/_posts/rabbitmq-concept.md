---
title: RabbitMQ入门
date: 2017-02-05 20:06:45
tags: 
- RabbitMQ 
- 消息队列 
- MQ
categories:
- 消息队列
---
本文主要介绍RabbitMQ的相关概念
# Exchange - 交换器		
交换机的类型有以下4种：
## fanout - 广播 
以广播的形式发送信息、所有订阅者(队列)均能收到同一条消息
## direct - 严格广播
严格的广播形式、较`fanout`类型多了个路由关键字、所有匹配路由关键字的订阅者(队列)均能收到同一条消息
## topic - 配置广播
<!-- more -->
发送到`topic`类型的交易所不能有任意的路由的关键字-它必须是一个关键字列表，由点分隔。这关键字可以是任意的，但是通常可以说明消息的基本的联系。几个合法的路由关键字例子:
* `stock.usd.nyse`
* `nyse.vmw`
* `quick.orange.rabbit`

关键字上限是255个字节。topic交易所逻辑背后是与direct交易所类型类似-一个带特别的路由关键字的消息将会被传递到所有匹配绑定的关键字的队列。但是有两个特别重要的绑定关键字。
> `*` (星标) 能替代任意一个单词
> `#` (哈希) 能代替零个或多个单词

![](/imgs/12.png)

## headers
`headers`类型的exchange使用的比较少，它也是忽略routingKey的一种路由方式。是使用Headers来匹配的。Headers是一个键值对，可以定义成Hashtable。发送者在发送的时候定义一些键值对，接收者也可以再绑定时候传入一些键值对，两者匹配的话，则对应的队列就可以收到消息。匹配有两种方式`all`和`any`。这两种方式是在接收端必须要用键值`x-mactch`来定义。all代表定义的多个键值对都要满足，而any则代码只要满足一个就可以了。fanout，direct，topic exchange的routingKey都需要要字符串形式的，而headers exchange则没有这个要求，因为键值对的值可以是任何类型。
