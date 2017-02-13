---
title: ELK 日志分析系统搭建
date: 2017-02-13 22:17:23
tags:
- log
- ELK
categories:
- 日志系统
---
# ELK 介绍
日志主要包括系统日志、应用程序日志和安全日志。系统运维和开发人员可以通过日志了解服务器软硬件信息、检查配置过程中的错误及错误发生的原因。经常分析日志可以了解服务器的负荷，性能安全性，从而及时采取措施纠正错误。
<!-- more -->
集中化管理日志后，日志的统计和检索又成为一件比较麻烦的事情，一般我们使用grep、awk和wc等Linux命令能实现检索和统计，但是对于要求更高的查询、排序和统计等要求和庞大的机器数量依然使用这样的方法难免有点力不从心。

开源实时日志分析ELK平台能够完美的解决我们上述的问题，ELK由ElasticSearch、Logstash和Kiabana三个开源工具组成。官方网站：[https://www.elastic.co/products](https://www.elastic.co/products)
* Elasticsearch
开源分页式搜索引擎，它的特点有：分布式，零配置，自动发现，索引自动分片，索引副本机制，restful风格接口，多数据源，自动搜索负载等
* Logstash
开源工具、可以对日志进行收集、过滤，并将其存储供以后使用（如，搜索）
* Kibana
开源和免费的工具，它Kibana可以为 Logstash 和 ElasticSearch 提供的日志分析友好的 Web 界面，可以帮助您汇总、分析和搜索重要数据日志

ELK工作的原理图:
![](/imgs/22.png)
Logstash收集AppServer产生的Log,并存放到ElasticSearch集群中，而Kibana则从ES集群中查询数据生成图表，再返回给Browser。
# ELK平台搭建
系统环境：
* Mac OS X
* openjdk version "1.8.0_111"
* Elasticsearch:5.2.0
* Logstash:5.2.0
* Kibana:5.2.0
* x-pack:5.2.0 插件包


> `NOTE`: ELK依赖JAVA环境，并且EKL在5.x以上的版本要求jre版本不低于1.8
> ELK可以通过终端命令安装，详细步骤请参考官方文档。这里只介绍下载程序包解压运行

## 安装Elasticsearch
下载页面：[https://www.elastic.co/downloads/elasticsearch](https://www.elastic.co/downloads/elasticsearch)
``` shell
tar zxvf elasticsearch-5.2.0.tar.gz
cd elasticsearch-5.2.0
```
可根据需要修改配置文件：
``` shell
vim config/elasticsearch.yml
```
修改示例(注意`:`后的空格):
``` shell
# 集群名称
cluster.name: my_es
# 节点名称
node.name: node1
# 数据保存路径
path.data: /tmp/elasticsearch/data
# 日志保存路径
path.logs: /tmp/elasticsearch/logs
# 端口,默认使用9200，这里就不修改了
#network.port: 9200
```
启动elasticsearch:
``` shell
bin/elasticsearch
# 添加参数`&`为后台进程的方式启动
# bin/elasticsearch &
```
![](/imgs/13.png)
可以看到，它跟其他的节点的传输端口为9300，接受HTTP请求的端口为9200,使用`CTRL`+`C`停止

然后可以打开页面[http://localhost:9200](http://localhost:9200)，将会看到以下内容
<img src="/imgs/14.png" style="width:400px;height:200px;"/>
返回了配置的cluster_name和name，以及安装的elasticsearch的版本等信息
## 安装Logstash
Logstash的功能如下：
![](/imgs/15.png)
其实它就是一个`收集器`而已，我们需要为它指定`input`和`output`（可以指定多个）。由于我们需要把Java代码中Log4j的日志输出到ElasticSearch中，因此这里的input使用log4j，而output就是`elasticsearch`。
`input`/`output`的插件可查阅官网:
input plugin:[https://www.elastic.co/guide/en/logstash/current/input-plugins.html](https://www.elastic.co/guide/en/logstash/current/input-plugins.html)
output plugin:[https://www.elastic.co/guide/en/logstash/current/output-plugins.html](https://www.elastic.co/guide/en/logstash/current/output-plugins.html)
下载页面:[https://www.elastic.co/downloads/logstash](https://www.elastic.co/downloads/logstash)
``` shell
tar zxvf logstash-5.2.0.tar.gz 
cd logstash-5.2.0
```
编写配置文件(名字和位置可以随意，这里我放在config目录下，取名为log4j.conf)：
``` shell
vim config/log4j.conf
```
输入以下内容：
``` shell
# For detail structure of this file
# Set: https://www.elastic.co/guide/en/logstash/current/configuration-file-structure.html
input {
  # For detail config for log4j as input, 
  # See: https://www.elastic.co/guide/en/logstash/current/plugins-inputs-log4j.html
  log4j {
   # mode => "server"
   # host => "127.0.0.0"
   # port => 4560
  }
}
filter {
  #Only matched data are send to output.
}
output {
  # For detail config for elasticsearch as output, 
  # See: https://www.elastic.co/guide/en/logstash/current/plugins-outputs-elasticsearch.html
  elasticsearch {
    action => "index"          #The operation on ES
    hosts  => "127.0.0.1:9200" #ElasticSearch host, can be array.
    index  => "mylogs"         #The index to write data to.
  }
}
```
启动logstash,使用-f指定配置文件：
``` shell
bin/logstash -f config/log4j.conf
```
![](/imgs/16.png)
可以看到监听了4560端口，到这里，我们已经可以使用Logstash来收集日志并保存到elasticsearch中了

这个时候只要配置下JAVA项目的log4j.properties，将Log4j的日志通过`SocketAppender`便可输出到elasticsearch 
``` shell
# LOG4J配置
log4j.rootCategory=WARN,console,socket

log4j.appender.socket=org.apache.log4j.net.SocketAppender
log4j.appender.socket.port=4560
log4j.appender.socket.remoteHost=127.0.0.1
log4j.appender.socket.layout=org.apache.log4j.PatternLayout
log4j.appender.socket.layout.ConversionPattern=%d [%-5p] [%l] %m%n
log4j.appender.socket.reconnectionDelay=10000

log4j.appender.console=org.apache.log4j.ConsoleAppender
log4j.appender.console.target=System.out
log4j.appender.console.layout=org.apache.log4j.PatternLayout
log4j.appender.console.layout.ConversionPattern=%d [%-5p] [%l] %m%n
```
> `NOTE`: 这里的端口号需要跟Logstash监听的端口号一致`4560`

## 安装Kibana
下载页面:[https://www.elastic.co/downloads/kibana](https://www.elastic.co/downloads/kibana)
``` shell
tar zxvf kibana-5.2.0-darwin-x86_64.tar.gz 
cd kibana-5.2.0-darwin-x86_64
```
修改配置文件
``` shell
vim config/kibana.yml
```
示例修改数据
``` shell
# kibana 服务端口
server.port: 5601
# elasticsearch 链接
elasticsearch.url: http://127.0.0.1:9200
```
启动kibana
``` shell
bin/kibana
```
启动成功显示下图
![](/imgs/17.png)
浏览器打工:[http://localhost:5601](http://localhost:5601)
<img src="/imgs/18.png" style="height:350px;width:500px;" />
为了后续使用Kibana，需要配置至少一个Index名字或者Pattern，它用于在分析时确定`elasticsearc`中的Index。这里我输入之前配置的Index名字`mylogs`，Kibana会自动加载该Index下doc的field，并自动选择合适的field用于图标中的时间字段：
<img src="/imgs/19.png" style="height:350px;width:500px;">
点击create后，可以看到左侧增加了配置的Index名字：
<img src="/imgs/20.png" style="height:350px;width:500px;">
接下来切换到Discover标签上，注意右上角是查询的时间范围，如果没有查找到数据，那么你就可能需要调整这个时间范围：
<img src="/imgs/21.png" style="height:350px;width:600px;">
其它功能、慢慢发现吧。
# 安全
x-pack..... 未完待续！
