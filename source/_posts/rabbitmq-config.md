---
title: RabbitMQ安装与配置
date: 2017-02-03 18:24:55
tags:
- 消息队列
- MQ
- RabbitMQ
categories:
- 消息队列
---
本文主要对RabbitMQ在Mac OS X环境下的安装、管理、常用配置进行简单说明。详尽文档参见:[官网文档](http://www.rabbitmq.com/documentation.html)
# 安装
在Mac OS X中可以使用brew工具安装RabbitMQ的服务端，RabbitMQ是用Erlang实现的一个高并发可靠的AMQP消息队列服务器、因此安装RabbitMQ前需要安装Erlang。安装命令如下：
``` shell
brew update
brew install erlang rabbitmq
```
通过上面的命令，RabbitMQ Server的命令会被安装到`/usr/local/sbin`，并不会自动加到用户的环境变量中去，所以我们需要在`.bash_profile`或`.profile`文件中增加下面内容：
``` shell
PATH=$PATH:/usr/local/sbin
```
至此、我们就可以在任何目录下通过`rabbitmq-server`命令来启动RabbitMQ的服务端了
# 管理
我们可以直接通过配置文件的访问进行管理，也可以通过Web的访问进行管理。以下是开启Web UI进行管理的方法。

1. 执行`rabbitmq-plugins enable rabbitmq_management`命令，开启Web UI管理插件
1. 访问 [http://localhost:15672](http://localhost:15672) 进行RabbitMQ管理的登陆页面、默认的用户名及密码为均为`guest`、登陆后进行到RabbitMQ的概述页面


