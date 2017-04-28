---
title: Spring boot集成Netty-socket.io通信
date: 2017-04-01 15:20:40
tags: 
- Spring boot
- socket.io
- JAVA
categories:
- JAVA
---
# Spring boot集成Netty-socket.io通信
## 介绍
基于Netty-socket.io实现一个简单聊天功能
<!-- more -->
## Spring boot项目集成实现

1. 在pom.xml中添加依赖

	```xml
	<dependency>
        <groupId>com.corundumstudio.socketio</groupId>
        <artifactId>netty-socketio</artifactId>
        <version>1.7.11</version>
   </dependency>
	```
1. 在application.properties配置文件添加Netty-socket.io的相关配置
	
	```properties
	# socket监听端口
	wss.server.port=8081
	# socket主机
	wss.server.host=localhost
	```
	
1. 添加bean配置

	```java
	@Configuration
	public class NettySocketConfig {
	    @Value("${wss.server.port}")
	    private int WSS_PORT;
	    @Value("${wss.server.host}")
	    private String WSS_HOST;
	
	    @Bean
	    public SocketIOServer socketIOServer() {
	        com.corundumstudio.socketio.Configuration config = new com.corundumstudio.socketio.Configuration();
	        //不设置主机、默认绑定0.0.0.0 or ::0
	        //config.setHostname(WSS_HOST);
	        config.setPort(WSS_PORT);
	
	        //该处进行身份验证h
	        config.setAuthorizationListener(handshakeData -> {
	            //http://localhost:8081?username=test&password=test
	            //例如果使用上面的链接进行connect，可以使用如下代码获取用户密码信息
	            //String username = data.getSingleUrlParam("username");
	            //String password = data.getSingleUrlParam("password");
	            return true;
	        });
	
	        final SocketIOServer server = new SocketIOServer(config);
	        return server;
	    }
	
	    @Bean
	    public SpringAnnotationScanner springAnnotationScanner(SocketIOServer socketServer) {
	        return new SpringAnnotationScanner(socketServer);
	    }
	}
	```
1. 添加ServerRunner
	
	```java
	@Component
	public class ServerRunner implements CommandLineRunner {
	    private final SocketIOServer server;
	    @Autowired
	    public ServerRunner(SocketIOServer server) {
	        this.server = server;
	    }
	    @Override
	    public void run(String... args) throws Exception {
	        server.start();
	    }
	}
	```
1. 添加消息处理类

	```java
	@Component
	public class MessageEventHandler {
	    private static final Logger log = LoggerFactory.getLogger(MessageEventHandler.class);
	    //会话集合
	    private static final ConcurrentSkipListMap<String, ClientInfo> webSocketMap = new ConcurrentSkipListMap<>();
	    //静态变量，用来记录当前在线连接数。（原子类、线程安全）
	    private static AtomicInteger onlineCount = new AtomicInteger(0);
	
	
	    private final SocketIOServer server;
	    @Autowired
	    public MessageEventHandler(SocketIOServer server){
	        this.server = server;
	    }
	
	    /**
	     * connect事件处理，当客户端发起连接时将调用
	     * @param client
	     */
	    @OnConnect
	    public void onConnect(SocketIOClient client){
	        String clientId = client.getHandshakeData().getSingleUrlParam("clientid");
	        log.info("web socket连接:"+clientId);
	        UUID session = client.getSessionId();
	
	        ClientInfo si = webSocketMap.get(clientId);
	        // 如果没有连接信息、则新建会话信息
	        if (si == null) {
	            si = new ClientInfo();
	            si.setOnline(true);
	            //在线数加1
	            log.info("socket 建立新连接、sessionId:"+session+"、clientId:"+clientId+"、当前连接数："+onlineCount.incrementAndGet());
	        }
	
	        // 更新设置客户端连接信息
	        si.setLeastSignificantBits(session.getLeastSignificantBits());
	        si.setMostSignificantBits(session.getMostSignificantBits());
	        si.setLastConnectedTime(new Date());
	
	        //将会话信息更新保存至集合中
	        webSocketMap.put(clientId, si);
	    }
	
	    /**
	     * disconnect事件处理，当客户端断开连接时将调用
	     * @param client
	     */
	    @OnDisconnect
	    public void onDisconnect(SocketIOClient client)
	    {
	        String clientId = client.getHandshakeData().getSingleUrlParam("clientid");
	        webSocketMap.remove(clientId);
	        //在线数减1
	        log.info("socket 断开连接、sessionId:"+client.getSessionId()+"、clientId:"+clientId+"、当前连接数："+ onlineCount.decrementAndGet());
	    }
	
	    /**
	     * 消息接收入口，当接收到消息后，查找发送目标客户端，并且向该客户端发送消息，且给自己发送消息
	     * @param client
	     * @param request
	     * @param data
	     */
	    @OnEvent(value = "message_event")
	    public void onEvent(SocketIOClient client, AckRequest request, MessageInfo data){
	        String targetClientId = data.getTargetClientId();
	        ClientInfo clientInfo = webSocketMap.get(targetClientId);
	        if (clientInfo != null && clientInfo.isOnline()){
	            UUID target = new UUID(clientInfo.getMostSignificantBits(), clientInfo.getLeastSignificantBits());
	            log.info("目标会话UUID:"+target);
	
	            MessageInfo sendData = new MessageInfo();
	            sendData.setSourceClientId(data.getSourceClientId());
	            sendData.setTargetClientId(data.getTargetClientId());
	            sendData.setMsg(data.getMsg());
	
	            // 向当前会话发送信息
	            client.sendEvent("message_event", sendData);
	
	            // 向目标会话发送信息
	            server.getClient(target).sendEvent("message_event", sendData);
	        }
	
	    }
	
	    /**
	     * socket会话信息
	     */
	    public class ClientInfo {
	        private String clientId;
	        private boolean isOnline;
	        private long mostSignificantBits;
	        private long leastSignificantBits;
	        private Date lastConnectedTime;
			 // get/set方法 ....
	    }
	
	    /**
	     * 消息对象
	     */
	    public static class MessageInfo {
	        //源客户端id
	        private String sourceClientId;
	        //目标客户端id
	        private String targetClientId;
	        //消息内容
	        private String msg;
			 // get/set方法 ....
	    }
	}
	
	```
1. 创建客户端文件index.html,index2.html、修改HTML文件中的`clientId`及`targetId`分别对应user1、user2两个用户
	- clientId 为发送者ID
	- targetId 为接收者ID

1. index.html文件内容如下

	```html
	<!DOCTYPE html>
	<html>
	<head lang="zh">
	    <meta charset="utf-8"/>
	    <meta http-equiv="Content-Type" content="text/html; charset=gb2312">
	    <title>Demo Chat</title>
	    <link href="https://cdn.bootcss.com/bootstrap/4.0.0-alpha.6/css/bootstrap.css" rel="stylesheet">
	    <script src="https://cdnjs.cloudflare.com/ajax/libs/socket.io/1.7.3/socket.io.js"></script>
	    <!--moment js下载地址:http://momentjs.com/ -->
	    <script src="moment.js"></script>
	    <script src="http://code.jquery.com/jquery-1.10.1.min.js"></script>
	    <style>
	        body {padding: 20px;} #console {height: 400px;overflow: auto;} .username-msg {color: orange;} .connect-msg {color: green;}.disconnect-msg {color: red;}.send-msg {color: #888}
	    </style>
	    <script>
	        var clientId = 'user1',targetId = 'user2';
	
	        var socket = io.connect('http://localhost:8081?clientid=' + clientId);
	        socket.on('connect', function () {
	            showMsg(':<span class="connect-msg">成功连接到服务器!</span>');
	        });
	        socket.on('message_event', function (data) {
	            showMsg('<br /><span class="username-msg">' + data.sourceClientId + ':</span> ' + data.msg);
	        });
	        socket.on('disconnect', function () {
	            showMsg(':<span class="disconnect-msg">服务已断开！</span>');
	        });
	
	        function sendDisconnect() {
	            socket.disconnect();
	        }
	
	        function sendMessage() {
	            var message = $('#msg').val();
	            $('#msg').val('');
	
	            var jsonObject = {
	                sourceClientId: clientId,
	                targetClientId: targetId,
	                msg: message
	            };
	            socket.emit('message_event', jsonObject);
	        }
	
	        function showMsg(message) {
	            var currentTime = "<span class='time'>" + moment().startOf('hour').fromNow() + "</span>";
	            var element = $("<div>" + currentTime + "" + message + "</div>");
	            $('#console').append(element);
	        }
	
	        $(document).keydown(function (e) {
	            if (e.keyCode == 13) {
	                $('#send').click();
	            }
	        });
	    </script>
	</head>
	<body>
	    <h1>Netty-socket.io Demo</h1><br/>
	    <div id="console" class="well"></div>
	    <form class="well form-inline" onsubmit="return false;">
	        <input id="msg" class="input-xlarge" type="text" placeholder="Type something..."/>&nbsp;&nbsp;
	        <button type="button" onClick="sendMessage()" class="btn" id="send">Send</button>&nbsp;&nbsp;
	        <button type="button" onClick="sendDisconnect()" class="btn">Disconnect</button>
	    </form>
	</body>
	</html>
	```