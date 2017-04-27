---
title: Spring boot集成websocket通信
date: 2017-04-01 15:20:40
tags: 
- Spring boot
- websocket
- 通信
- JAVA
categories:
- JAVA
---
# Spring boot集成websocket通信
## 介绍
websocket是一个持久化的协议，实现了浏览器与服务器的全双工通信。不再像http那样，只有在浏览器发出request之后才有response，websocket能实现服务器主动向浏览器发出消息。

## Spring boot项目集成实现

1. 在pom.xml中添加依赖

	```xml
	<dependency>
	    <groupId>org.springframework.boot</groupId>
	    <artifactId>spring-boot-starter-websocket</artifactId>
	</dependency>
	```
	
1. 添加一个单例bean配置，名为ServerEndpointExporter

	```java
	@Configuration
	public class WebSocketConfig  {
	    @Bean
	    public ServerEndpointExporter serverEndpointExporter() {
	        return new ServerEndpointExporter();
	    }
	}
	```
1. websocket监听实现示例

	```java
	@ServerEndpoint(value = "/websocket")
	@Component
	public class WebSocketServer {
	    private static final Logger log = LoggerFactory.getLogger(WebSocketServer.class);
	    //静态变量，用来记录当前在线连接数。应该把它设计成线程安全的。
	    private static int onlineCount = 0;
	    //会话保存集合
	    private static ConcurrentSkipListMap<String, WebSocketServer> webSocketMap = new ConcurrentSkipListMap<>();
	    //企业编号 作为保存会话的key
	    private String enterpriseNo;
	    //与某个客户端的连接会话，需要通过它来给客户端发送数据
	    private Session session;
	
	    /**
	     * 会话建立
	     * @param session
	     */
	    @OnOpen
	    public void onOpen(Session session) {
	        List<String> params = session.getRequestParameterMap().get("enterpriseNo");
	        if (params != null && (this.enterpriseNo = params.get(0)) != null && this.enterpriseNo.length() > 0) {
	            //保存会话
	            this.session = session;
	            webSocketMap.put(this.enterpriseNo, this);
	
	            addOnlineCount();           //在线数加1
	            log.info("有新连接加入！当前在线人数为" + getOnlineCount());
	        } else {
	            // 如果参数不正确，则不保存会话
	            try {
	                session.close();
	            } catch (IOException e) {
	                log.error(e.getMessage(),e.getCause());
	                e.printStackTrace();
	            }
	        }
	
	    }
	
	    /**
	     * 连接关闭调用的方法
	     */
	    @OnClose
	    public void onClose() {
	        webSocketMap.remove(this.enterpriseNo);
	        subOnlineCount();           //在线数减1
	        log.info("有一连接关闭！当前在线人数为" + getOnlineCount());
	    }
	
	    /**
	     * 接收消息
	     * @param message
	     * @param session
	     */
	    @OnMessage
	    public void onMessage(String message, Session session) {
	        try {
	            log.info("接收到会话：\""+session.getId()+"\"发送的信息、消息内容："+message);
	            //数据转换成对象
	           
	        } catch (Exception e) {
	            log.error(e.getMessage(),e.getCause());
	            e.printStackTrace();
	        }
	    }
	
	
	    /**
	     * 异常记录
	     * @param session
	     * @param error
	     */
	    @OnError
	    public void onError(Session session, Throwable error) {
	        log.error(error.getMessage(), error.getCause());
	    }
	
	
	    /**
	     * 执行向浏览器发送消息动作
	     * @param message
	     * @throws IOException
	     */
	    public void sendMessage(String message) throws IOException {
	        this.session.getBasicRemote().sendText(message);
	    }
	
	
	    /**
	     * 向指定会话发送消息
	     * @param enterpriseNo
	     * @param message
	     */
	    public static boolean sendInfo(String enterpriseNo,String message)  {
	        try {
	            WebSocketServer wss = webSocketMap.get(enterpriseNo);
	            if (wss!=null) {
	                wss.sendMessage(message);
	                return true;
	            }
	        } catch (IOException e) {
	            e.printStackTrace();
	        }
	        return false;
	    }
	
	    public static synchronized int getOnlineCount() {
	        return onlineCount;
	    }
	
	    public static synchronized void addOnlineCount() {
	        WebSocketServer.onlineCount++;
	    }
	
	    public static synchronized void subOnlineCount() {
	        WebSocketServer.onlineCount--;
	    }
	}
	```
1. HTML页面代码示例

	```html
	<!DOCTYPE HTML>  
	<html>  
	<head>  
	    <base href="http://localhost:8080/">  
	    <title>My WebSocket</title>  
	</head>  
	  
	<body>  
	Welcome<br/>  
	<input id="text" type="text"/>  
	<button onclick="send()">Send</button>  
	<button onclick="closeWebSocket()">Close</button>  
	<div id="message">  
	</div>  
	</body>  
	  
	<script type="text/javascript">  
	    var websocket = null;  
	  
	    //判断当前浏览器是否支持WebSocket  
	    if ('WebSocket' in window) {  
	        websocket = new WebSocket("ws://localhost:8080/websocket");  
	    }  
	    else {  
	        alert('Not support websocket')  
	    }  
	  
	    //连接发生错误的回调方法  
	    websocket.onerror = function () {  
	        setMessageInnerHTML("error");  
	    };  
	  
	    //连接成功建立的回调方法  
	    websocket.onopen = function (event) {  
	        setMessageInnerHTML("open");  
	    }  
	  
	    //接收到消息的回调方法  
	    websocket.onmessage = function (event) {  
	        setMessageInnerHTML(event.data);  
	    }  
	  
	    //连接关闭的回调方法  
	    websocket.onclose = function () {  
	        setMessageInnerHTML("close");  
	    }  
	  
	    //监听窗口关闭事件，当窗口关闭时，主动去关闭websocket连接，防止连接还没断开就关闭窗口，server端会抛异常。  
	    window.onbeforeunload = function () {  
	        websocket.close();  
	    }  
	  
	    //将消息显示在网页上  
	    function setMessageInnerHTML(innerHTML) {  
	        document.getElementById('message').innerHTML += innerHTML + '<br/>';  
	    }  
	  
	    //关闭连接  
	    function closeWebSocket() {  
	        websocket.close();  
	    }  
	  
	    //发送消息  
	    function send() {  
	        var message = document.getElementById('text').value;  
	        websocket.send(message);  
	    }  
	</script>  
	</html>  
	```
接下来便能直接启动websocket进行访问了，具体的扩展可以根据业务需求进行增加。
其实websocket就是基于http协议的升级，在http的headers中有一个header名为Upgrade，用来对http协议进行升级，从而换用其他的协议，在本例中，为Upgrade:websocket