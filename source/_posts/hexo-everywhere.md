---
title: 在不同的电脑维护Hexo和写作
date: 2016-05-21 15:20:40
tags: 
- Hexo
- 博客
- 写作
categories:
- Hexo
---
`Hexo`是一个非常棒的开源博客框架，配合`Github Page`可以免费搭建部署自己的静态博客，对于我这种爱作且抠门的人于合适不过了。

`Hexo`支持`Markdown`的写作方式、有丰富的主题及插件、快速生成html静态文件、一键部署等功能。Hexo搭建、写作、部署到Github Page参见:{% link Hexo官网 https://hexo.io/zh-cn/ Hexo官方网站 %}

# 对Hexo做版本控制
版本控制的主要目的是方便在不同的电脑维护Hexo及写作。这里利用github的分支来保存hexo框架的相关文件(hexo配置、md、主题等文件)到github page仓库。
<!-- more -->
这里假设已经在github上建好page仓库，也就是"yourname.github.io"名字的仓库，如{% link jiesenboor.github.io https://github.com/jiesenboor/jiesenboor.github.io %},以及在自己电脑上已经搭建好git、hexo、nodejs环境
## 新建hexo分支
`page`仓库的`master`分支用来存放网站文件的，这是`GitHub Page`的要求，所以只好新建分支来保存Hexo原始文件，在下图的输入框输入分支名并按回车即完成分支创建。
{% img /imgs/1.png %}
## 设置默认分支
因为我们写博客更多的是更新这个分支，网站文件所在的`master`分支则由`hexo d`命令发布文章的时候进行推送，所以我们将`hexo分支>设置为默认分支，这样我们在新的电脑环境下`git clone`该仓库时，自动切到`hexo`分支。按下图进行操作。
{% img /imgs/2.png %}

## 配置hexo deploy参数
为了保证`hexo d`命令可以正确部署到`master`分支，在hexo 的配置文件 `_config.yml`文件中配置参数如下：
{% codeblock _config.yml lang:shell %}
deploy:
  type: git
  repo: https://github.com/jiesenboor/jiesenboor.github.io.git
  branch: master
{% endcodeblock %}
然后使用部署命令`hexo g -d`就会自动渲染`Markdown`文件生成静态文件并部署到`yourname.github.io`仓库的`master`分支上，这时再访问`http://yourname.github.io`就可以看到博客页面了。

此时博客页面是部署保存了，但hexo配置、md、主题等文件还没有保存，在heox目录下使用以下命令将文件推送到`hexo`分支上
{% codeblock %}
git remote add origin https://github.com/yourname/yourname.github.io.git
git add .
git commit -m "提交描述"
git push origin hexo
{% endcodeblock %}


# 维护与写作
有时候我们可能会在不同的电脑上写博客，配置 hexo、git、node.js等环境。
## 已有环境
如果在电脑上已经写过博客，那么可以在已有的工作目录下同步之前写的博客。
在你的仓库目录下右键'git bash shell'，起来bash命令行，然后
> git pull

这样你的状态就更新了，之后就是 `hexo`命令写文章啦。。。
写完`hexo g -d`部署好后，使用
> git add .
> git commit -m "change description"
> git push origin hexo

推送上去。

## 新的环境
到了新的电脑上时，我们需要将项目先下载到本地，然后再进行hexo初始化。
> git clone https://github.com/yourname/yourname.github.io.git
> cd yourname.github.io
> npm install hexo
> npm install
> npm install hexo-deployer-git --save

之后开始写博客，写好部署好之后，别忘记 git add , ....git push origin hexo...推上去。。。

