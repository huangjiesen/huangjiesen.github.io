---
title: 仿jdk动态代理
date: 2020-01-03 12:42:00
tags:
- Java
- Proxy
categories:
- Java
---
# 代理模式
在代理模式（Proxy Pattern）中，一个类代表另一个类的功能。这种类型的设计模式属于结构型模式。<br />
在代理模式中，我们创建具有现有对象的对象，以便向外界提供功能接口。

` 意图: ` 为其他对象提供一种代理以控制对这个对象的访问。<br />
`何时使用：`想在访问一个类时做一些控制。
<!-- more -->
几种实现代理的实现：
* 静态代理，如通过继承或聚合实现
* 动态代理，如jdk动态代理或cglib动态代理

术语：
* 代理对象：增加控制逻辑后的对象(增强后的对象)
* 目标对象：要增加控制逻辑的对象(要增强的对象)

# 静态代理
## 继承代理
代理对象继承目标对象，重写需要增强的方法<br/>
缺点：当有多个代理业务时，代理类数量随之增多,如果要组成代理链路则类会更多且复杂
```java
public class UserDao {
    public void save(String user) {
        System.out.println("save user info:" + user);
    }
}
public class UserDaoLogProxy extends UserDao {
    @Override
    public void save(String user) {
        System.out.println("com.sen.sp.DogProxy: dog proxy logic");
        super.save(user);
    }
}
```
## 聚合代理
目标对象和代理对象实现同一个接口，代理对象当中要包含目标对象。
缺点：代理类也会随业务增多，但相比继承代理，组成代理链路时不需要创建新的继承链路类
```java
public interface UserDao {
    void save(String user);
}
public class UserDaoImpl implements UserDao {
    @Override
    public void save(String user) {
        System.out.println("save user info:" + user);
    }
}
public class UserDaoLogProxy implements UserDao {
    UserDao target;
    public UserDaoLogProxy(UserDao target) {
        this.target = target;
    }
    @Override
    public void save(String user) {
        System.out.println(this.getClass().getSimpleName()+": logs logic");
        target.save(user);
    }
}
public class UserDaoVerifyProxy implements UserDao {
    UserDao target;
    public UserDaoVerifyProxy(UserDao target) {
        this.target = target;
    }
    @Override
    public void save(String user) {
        System.out.println(this.getClass().getSimpleName()+": verify logic");
        target.save(user);
    }
}
public static void main(String[] args) {
    UserDao target = new UserDaoImpl();
    // 目标对象作为代理对象的属性存在，相比继承代理的顺序更灵活，不存在链路继承产生更多类的问题
    //UserDao proxy = new UserDaoVerifyProxy(new UserDaoLogProxy(target));
    UserDao proxy = new UserDaoLogProxy(new UserDaoVerifyProxy(target));
    proxy.save("lishi");
}
```

# 动态代理
## jdk动态代理
JDK的动态代理只允许动态代理接口，因为动态生成的代理类继承了`Proxy`类，基于java单继承的原则所以只可代理接口<br/>
```java
public class JdkProxyDemo {
    public static void main(String[] args) {
        Object proxy = Proxy.newProxyInstance(App.class.getClassLoader(), new Class<?>[]{ReadInterface.class, WriteInterface.class}, new InvocationHandler() {
            @Override
            public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
                // 如果调用的是Object类的方法，则由代理执行，如toString,hashCode
                Class<?> declaringClass = method.getDeclaringClass();
                if (Object.class.equals(declaringClass)) {
                    return method.invoke(proxy, args);
                }
                return "this is method result,method:" + method.getName() + ",args:{" + args[0] + "}";
            }
        });
        ReadInterface readProxy = (ReadInterface) proxy;
        System.out.println(readProxy.read("d:/")); //this is method result,method:read,args:{d:/}

        WriteInterface writeProxy = (WriteInterface) proxy;
        System.out.println(writeProxy.write("e:/")); //this is method result,method:write,args:{e:/}
    }

    public interface ReadInterface {
        String read(String path);
    }
    public interface WriteInterface {
        String write(String path);
    }
}
```
只能动态代理接口是设计猜测，因为动态代理一个类存在一些问题。在代理模式中代理类只做一些额外的拦截处理，实际处理是转发到原始类做的。。如果允许动态代理一个类，则代理类需要继承目标类，那么代理对象也会继承目标类的所有字段，而这些字段是实际上是没有使用的，对内存空间是一个浪费。因为一般业务代理对象只做方法的拦截转发处理，对象的字段存取都是在原始对象上处理。更为致命的是如果代理的类中有final的方法，动态生成的类是没法覆盖这个方法的，没法代理，而且存取的字段是代理对象上的字段，这显然不是我们希望的结果。spring aop框架就是这种模式

## 仿动态代理
jdk只能代理接口而不能代理类是因为动态生成的代理类继承了`Proxy`类，如果改为继承`代理目标类`则可实现类的代理<br/>
动态代理的实现步骤：
1. 生成java源码文件
1. 将java文件动态编译为class字节码文件
1. 通过类加载器将class字节码文件加载到jvm当中，获取Class对象

以下示例，为了可读性，生成代理类java源文件未判断方法只否可重写、及代码的优化
```java
public class ProxyUtil  {
    // 代理类增强回调
    public interface InvocationHandler {
        Object invoke(Object proxy, Method method, Object[] args);
    }
    // 生成代理类java源文件
    private static String generateProxyJava(Class<?> target) {
        StringBuilder sb = new StringBuilder();
        sb.append("package " + target.getPackage().getName() + ";\n");
        sb.append("import com.sen.dynamicproxy.jdkproxy.ProxyUtil.InvocationHandler;\n");
        sb.append("import java.lang.reflect.Method;\n");
        sb.append("import " + target.getCanonicalName() + ";\n");

        sb.append("public class $" + target.getSimpleName() + "Proxy " + (target.isInterface() ? "implements " : "extends ") + target.getSimpleName() + " {\n");
        sb.append("    private InvocationHandler handler;\n");
        sb.append("    public $" + target.getSimpleName() + "Proxy(InvocationHandler handler){\n");
        sb.append("        this.handler=handler;\n");
        sb.append("    }\n");

        for (Method method : target.getDeclaredMethods()) {
            Class<?>[] types = method.getParameterTypes();
            String args = "";
            String params = "";
            String argsType = "";
            for (int i = 0; i < types.length; i++) {
                argsType += "," + types[i].getCanonicalName() + ".class";
                args += "," + types[i].getCanonicalName() + " p" + i;
                params += ",p" + i;
            }
            if (args.length() > 0) {
                args = args.substring(1);
                params = params.substring(1);
                argsType = argsType.substring(1);
            }
            String returnType = "void".equals(method.getReturnType().getName()) ? "" : "return (" + method.getReturnType().getName() + ")";

            sb.append("    @Override\n");
            sb.append("    public " + method.getReturnType().getName() + " " + method.getName() + "(" + args + ") {\n");
            sb.append("        Method method = null;\n");
            sb.append("        try {\n");
            sb.append("            method = " + target.getSimpleName() + ".class.getDeclaredMethod(\"" + method.getName() + "\",new Class<?>[]{" + argsType + "});\n");
            sb.append("        } catch (Exception e) {\n");
            sb.append("             throw new RuntimeException(e);\n");
            sb.append("        }\n");
            sb.append("        " + returnType + "handler.invoke(this,method,new Object[]{" + params + "});\n");
            sb.append("    }\n");
        }
        sb.append("}");
        return sb.toString();
    }

    
    public static Object newProxyInstance(ClassLoader loader, Class<?> target, InvocationHandler handler) throws Exception{
        String distDir = ProxyUtil.class.getClassLoader().getResource("").getPath()+"/";
        File packageDir = new File(distDir + target.getPackage().getName().replaceAll("\\.", "/"));
        if (!packageDir.exists()) {
            packageDir.mkdirs();
        }
        Path path = Paths.get(packageDir.getPath() + "/$" + target.getSimpleName() + "Proxy.java");
        Files.write(path, generateProxyJava(target).getBytes(), StandardOpenOption.CREATE,StandardOpenOption.TRUNCATE_EXISTING);

        // 编译java源文件
        JavaCompiler compiler = ToolProvider.getSystemJavaCompiler();
        int flag = compiler.run(null, null, null, path.toString());
        if(flag!=0){
            throw new RuntimeException("编译失败");
        }
        // 如果代理类生成在外部，则需要URLClassLoader进行加载，如D:/com/sen/$TestProxy.java
        // loader = new URLClassLoader(new URL[]{new URL("file://D://")});

        // 加载类，并通过反射得到代理对象
        Class<?> aClass = loader.loadClass(target.getPackage().getName() + ".$" + target.getSimpleName() + "Proxy");
        Constructor<?> declaredConstructor = aClass.getDeclaredConstructor(InvocationHandler.class);
        return declaredConstructor.newInstance(handler);
    }
}
```
使用示例：
```java
public class ProxyDemo {
    public interface Animal {
        String eat(String food);
    }

    public static class Hunter {
        public boolean fire(){
            System.out.println("Hunter fire");
            return false;
        }
    }

    public static void main(String[] args) throws Exception {
        // 代理接口示例
        Animal animalProxy = (Animal) ProxyUtil.newProxyInstance(ProxyUtil.class.getClassLoader(), Animal.class, (proxy, method, args1) -> {
            Class<?> declaringClass = method.getDeclaringClass();
            if (Object.class.equals(declaringClass)) {
                try {
                    return method.invoke(proxy, args1);
                } catch (Exception e) {
                    e.printStackTrace();
                }
            }
            System.out.println("proxy interface logs --------------------");
            return method.getName() + "," + args1[0];
        });
        System.out.println("animalProxy result:"+animalProxy.eat("cookie"));
        
        
        //代理对象示例，需要对象传到InvocationHandler中，如以下示例，或通过InvocationHandler的构造方法传入
        Hunter hunterProxy = (Hunter) ProxyUtil.newProxyInstance(ProxyUtil.class.getClassLoader(), Hunter.class, new ProxyUtil.InvocationHandler() {
            Hunter hunter = new Hunter();
            @Override
            public Object invoke(Object proxy, Method method, Object[] args) {
                try {
                    Class<?> declaringClass = method.getDeclaringClass();
                    if (Object.class.equals(declaringClass)) {
                        return method.invoke(proxy, args);
                    }

                    System.out.println("proxy class logs --------------------");
                    return method.invoke(hunter, args);
                } catch (Exception e) {
                    throw new RuntimeException(e);
                }
            }
        });
        System.out.println("hunterProxy result:"+hunterProxy.fire());
    }
}
```

