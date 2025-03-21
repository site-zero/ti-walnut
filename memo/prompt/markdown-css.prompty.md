我渲染输出的 Markdown-it 文档的 HTML 代码如下：

```html
<article class="as-markdown"><table class="front-matter-table"><tbody><tr><th>title</th><td>HTTP注册接口</td></tr><tr><th>author</th><td>zozohtnt@gmail.com</td></tr><tr><th>key</th><td>c1-api</td></tr></tbody></table><hr>
<h1>动机：为什么要有HTTP注册接口</h1>
<p>让任何用户都可以轻松的搭建自己的动态<code>HTTP</code>服务。</p>
<hr>
<h1>计划应用场景</h1>
<ul>
<li>论坛，商城等动态网站</li>
<li>游戏/应用的动态数据获取</li>
<li>向第三方开放数据接口</li>
</ul>
<hr>
<h1>设计思路与边界</h1>
<p>在一个域里，通过简单的配置，就能让一个 http 请求路由到一个命令里。
命令的输出就是 http 的响应。</p>
<p>为了能获取 HTTP 请求的内容，每次请求都会为其建立一个文件对象。
具体请参看 <a href="#%E8%AF%B7%E6%B1%82%E5%AF%B9%E8%B1%A1">请求对象</a> 一节。</p>
<blockquote>
<p>当然，为了让请求速度更快，可以将 <code>~/.regapi/tmp/</code> 映射为内存模式</p>
</blockquote>
<hr>
<h1>数据结构描述</h1>
<h2>域数据结构</h2>
<pre><code class="language-bash">~/.regapi/
#------------------------------
# 存放所有的API对象
|-- api/
|   |-- test       # 对应 /api/{MyDomain}/test
|   |-- weixin/    # 按目录存放路径
|   |   |-- in     # 对应 /api/{MyDomain}/weixin/in
#------------------------------
# 路径通配符
# `_ANY` 表示通配符
# 元数据 `api-param-name:"id"` 表示这个通配符的形参名
# 更多请参看 [路径参数] 一节
|   |-- _ANY/      # 路径通配符 ?
|   |   |-- _ANY   # 文件的话，相当于 *
#------------------------------
# 存放所有的临时请求对象
|-- tmp/
    |-- ofb5luva5agl2pnmlj2376vuku   # 每个请一个对象
    |-- piub8fs0dgg95qvpgr0vo8rm2m   # 请求对象会缓存10分钟
</code></pre>
<h2>API对象</h2>
<p>API 对象是一个文件，REGAPI模块通过一个<code>http url</code>路由到它，然后通过它的文件内容（命令模板）来处理请求。它通过一些元数据支持如下的定制行为:</p>
<pre><code class="language-bash">#--------------------------------------------------
#                 访问控制
#--------------------------------------------------
# 一个访问安全密钥，客户端必须通过指定的请求键，传入密钥
# REGAPI 模块会验证对应的密钥文件内容，如果不相符，则返回 403
# = 后面的可选，如果不指定，则默认用 ~/.domain/api_access_token
api-access-token: "http-qs-at=~/.domain/api_access_token"
#--------------------------------------------------
#                 参数处理
#--------------------------------------------------
# 这个选项默认是 true
# 即，所有的参数(路径参数和QueryString)都会被做防注入处理
# 即通过 WnStr.safe 函数的过滤掉所有的单双引号，回车以及`;`字符
# ! 对于请求的 POST body 部分，无论是 JSON 还是 form 表单
# ! 都不处理，因为这个应该是命令 jsonx 或者 httpparam 的任务
http-safe-params: true
#--------------------------------------------------
#               指定响应头
#--------------------------------------------------
# 指定了 http-header- 前缀的元数据会固定写入到响应头里，
# 当然，元数据名称是大小写不敏感的，实际上写入响应头时全部会被转成大写
http-header-Content-Type : "text/plain; charset=utf-8"
# or
http-header-Content-Type : "image/png"
#--------------------------------------------------
#                 重定向
#--------------------------------------------------
# 开启这个选项，你的命令输出将会作为重定向的内容
http-resp-code : 302
#--------------------------------------------------
#               指定缓冲大小
#--------------------------------------------------
# 默认的 Web 容器一般会设置缓冲大小
# 譬如 Jetty 是 32K， 在缓冲大小内的响应，会自动设置 Content-Length
# 如果你想修改本次请求响应的缓冲区大小，添加这个元数据即可
http-resp-buff-size : 1024
#--------------------------------------------------
#               动态响应头
#--------------------------------------------------
# 有时候你需要用命令来动态决定响应头
# 开启这个选项即可。详情请参看 [动态决定响应头] 一节
#--------------------------------------------------
http-dynamic-header : true
#--------------------------------------------------
#               支持跨域
#
# 如果你的 API 需要支持跨域，采用 http-header-xxx 
# 需要编写多个响应头，比较麻烦
# 这里有一个快捷属性，声明了它，就相当于声明了
# "http-header-Access-Control-Allow-Origin" : "*"
# 并且，它会自动增加下面的响应头
# "Access-Control-Allow-Methods" : "GET, POST, PUT, DELETE, OPTIONS, PATCH"
# "Access-Control-Allow-Headers" : "Origin, Content-Type, Accept, X-Requested-With"
# "Access-Control-Allow-Credentials" : true
# 当然，如果你通过 http-header-xxx 特殊指定，优先级更高
# 如果你声明的是 "*"， API 的响应里，会自动用当前的 Origin 头来代替
#--------------------------------------------------
http-cross-origin : "*"
#--------------------------------------------------
#                 开启钩子
#--------------------------------------------------
# 开启这个选项，本接口所有的执行都会带上钩子
run-with-hook : true
#--------------------------------------------------
#                 网站登陆
#--------------------------------------------------
# 根据票据自动取得网站用户的账户信息
# @see [获取网站会话] 一节获取更多信息
# 为了适应多网站共存一个域的场景，本字段支持 explain 表达式
# 你可以声明 "=wn_www_site?~/www/demo"
# 它首先会从 HttpRequest 属性里尝试加载 wn_www_site 属性
# 这个属性是 Walnut 全局过滤器，在碰到域名转发时加上的
# 表示当前域名对应站点的全路径，支持 ~
http-www-home   : "~/www"  # 站点目录
http-www-ticket : "http-qs-ticket"  # 从哪里获取票据，默认http-qs-ticket
# 如果为 true，则必须登陆，否则返回 403
# 默认会看看是否设置了 http-www-home
http-www-auth   : true
#--------------------------------------------------
#
#                 预加载数据
#
#  执行 API 之前，预先运行一段命令，以便获取更多的上下文信息
#--------------------------------------------------
# 多个条件逐一判断，执行第一个查询条件
# 在网站登录逻辑之后，以便获取更多的上下文内容
# 如果有任何一个预加载条件被加载后，则会标识一个固定标志到上下文:
# {"api-preloaded":true}
preload : [{
	  # 【选】这个是一个Explain语法的Map，将上下文中的某些内容
    # 转换出更多的内容，比较适合将字典值，映射为名称之类的操作
    appends : {
    	"KEY1" : "=the_key",
    	"KEY2" : {
    		 key : "KEYx",
    		 mapping : {..},
             dft : "ABC"
    	}
    },
    # 满足本条件的上下文才会执行 run
    # 语法参见 c2-syntax-validate.md
    test : {
        "http-qs-ts": "^~/(projects|projworks)$"
    },
    # 每个命令执行的结果，默认会被 JSON 解析
    # 如果仅仅是想记录输出的纯文本，则需要在 KEY 前加 "!" 前缀
    # 因此键 "!..." 非法，因为无法处理，所以会被无视
    # 键 "..." 对应的执行结果，如果不是 Map，也无法处理，而被无视
    run : {
        # =&gt; ReqMap
        "..."  : "obj ~/setup.json",
        # =&gt; ReqMap[KEY1]
        "KEY1" : "obj ~/${http-qs-ts} -cqn",
        # =&gt; ReqMap[KEY2]
        # 并且作为纯文本存入
        "!KEY2" : "thing ~/${http-qs-ts} -cqn",
    }
}]
#--------------------------------------------------
#
#                 记录历史
#
#   如果你开启了 http-www-auth，那么你还可以记录历史
#--------------------------------------------------
# 判断当前 API 请是否需要记录历史
# 语法参见 c2-syntax-validate.md
histest: {
  "api-preloaded" : true
}
# 每次请求都会记录一下本次操作的历史记录
# 下面是这个历史记录对象的模板
# 记录历史记录是发生在请求完成以后
# 这个值是个对象模板，遵循 =xxx 以及 -&gt;xxx 的 explain 模板语法
# 为了能记录更多的历史记录细节，可以通过开关:
#  - http-body: "text"     // 支持 text|json|form
#  - http-ouput: "json"    // 支持 text|json
# 将请求的输入和输出临时保存在请求对象里（并不会持久化）
# 但是在渲染的时候，可以通过 ${http-body} 这样的占位符获取
# ！注，上面两个开关支持的类型不为 "text" 时
# ！会将文本解析后放入上下文，以便你访问内部数据
# 本键值可以是一个对象，或者一个数组，表示多条历史记录
history: [{
    #-------------------------------------
    # 谁？
    #-------------------------------------
    uid : "=http-www-me-id",        # 用户ID
    unm : "=http-www-me-nm",        # 【冗】用户名
    utp : "=http-www-me-role?user", # 【选】用户类型
    #-------------------------------------
    # 对什么？
    #-------------------------------------
    tid : "=http-qs-id",       # 关联对象的 ID
    tnm : "=output.title",     # 【冗】关联对象名
    ttp : "=output.cate",      # 【选】关联对象类型
    #-------------------------------------
    # 做了什么？
    #-------------------------------------
    opt : "save",   # 这个是动作名称
    mor : "xxx"     # 关于动作的更多细节，譬如更新的字段值等
}],
# 有些时候，根据请求参数的不同，我们需要设置不同的历史记录参数模板
# 这里给了一个列表，匹配上的项目，会和上面的历史记录模板融合
hismetas: [{
    # 语法参见 c2-syntax-validate.md
    test: {
        "http-qs-ts": "^~/(projects|projworks)$"
    },
    update: {
        tnm: "=output.nm"
    }
}]
# 指定历史记录数据源的名称，默认为 _history
# 这个需要在 ~/.domain/history/ 下面做自定义
# 关于详情可以参看下列相关文档，了解历史记录机制更过细节
#  - c1-general-data-entity.md#历史记录
#  - cmd_history.md
hisname: "xxx"
#--------------------------------------------------
#                 临时数据
#--------------------------------------------------
# 下面两个参数是为了历史记录或者API钩子设计的
# 是为了得到更多的这个请求的处理细节
# 在历史记录或者钩子渲染时，可以通过 `${http-body}` 这样
# 的占位符获得
# ！注意：如果声明了
# ！ - `http-dynamic-header`
# ！ - `http-resp-code : 301 | 302`
# ！为了考虑效率， http-output 部分会被无视
#--------------------------------------------------
# 将请求体内容放入上下文 "body" 中
http-body: "text"
# 将响应流内容放入上下文 "output" 中
http-ouput: "json"
#--------------------------------------------------
#
# 这个是对 body 为 JSON 的 POST 请求的优化
# 这个选项生效的前提是 http-body 选项设置为 "json"
#
#--------------------------------------------------
# 逐个遍历下面的条件，将第一个匹配项目于请求 body 合并
http-post-json-merge : [{
    # 语法参见 c2-syntax-validate.md
    # 如果为一个空 {}，则表示一定跳过
    # 如果为 null 或者未定义，则表示一定匹配
    # 通常用作默认分支。当然你可能也不需要默认分支
    test : {
        "ts" : "^(comments|profile)$"
    },
    # 将这个对象融合到 post json 对象里
    # 如果嵌套了对象，将会深层融合
    update : {
        "uid" : "=http-www-me-id"
    }
}]
#--------------------------------------------------
#                 权限验证
#--------------------------------------------------
# 如果本 API 的 http-www-auth==true， 则可以继续验证当前账户
# 的业务权限，这里需要挂接一个业务权限配置文件。
# 文件的内容请参看 c2-biz-privilege-model.md
# 大多数时候，为了避免很多 api 设置同样的 pvg-setup
# 可以在 http-www-home 对应的元数据 `pvg_setup` 下设置
# !!! 注意是 `pvg_setup` 不是 `pvg-setup` 这个是考虑站点那边
# 元数据的惯例是用 `SnakeCase` 而 API 这边用的是 `KebabCase`
pvg-setup: "~/path/to/pvg.json"

# 如果声明了 pvg-setup （在当前 API 或者对应站点目录对象上）
# 模块会依据这个段，看看当前会话账户是否具备足够的访问权限
# 值为一个数组，每个元素都是字符串表示一个或多个动作（半角竖线分隔）
# 任何一个动作被满足，即说明当前项目检查通过。
# 当数组全部项目被检查通过，本接口才可以被继续执行
# 即，数组间是 AND 的关系，元素里用`|`分隔的动作是 OR 的关系
pvg-assert: ["Action-A|ActionB", "Action-C"]
#--------------------------------------------------
#                 缓存
#
# &gt; 详细描述，参见后面【缓存结果】一节
#--------------------------------------------------
# 通过这个参数可以确定一个请求是否要尝试命中缓存。
# 这个选项就是一组判断条件，会依次判断是否匹配。如果匹配了就终止。
# 全部条件都未匹配，则表示本次请求无需尝试命中缓存
cache-test : [{
    # 如果声明了这个选项，表示开启缓存的API需要匹配 Query String 的细节才能
    # 尝试命中缓存。 条件是一个数组，元素之间是 OR 的关系。 元素是一个对象，
    # 代表一组 AND 关系。 当然也可以直接就是一个对象
    # 其中每个对象项就是一个 WnValidate 的验证器。验证的对象是 Query String 组成
    # 的对象（去掉 "http-qs-" 前缀的版本）
    # 如果没有有声明，这个选项，则表示一定会命中，通常用作默认值
    # 语法参见 c2-syntax-validate.md
    match: {
        "!id" : "",
        "!ts" : "^(site/(accounts|roles))$"
    },
    # 这个路径是一个字符串模板，渲染上下文为整个请求对象
    # 因此，你可以使用诸如 ${http-qs-xxx} 等占位符
    path : "~/.domain/cache/api/get-${http-qs-id}.json",
    # 可选测试，如果没有指定，则用缓存文件的 mime 作为
    # 响应的 Content-Type
    mime : "text/json"
}]
#--------------------------------------------------
# 如果这个选项的值是整数且大于0，则表示缓存文件的有效期（秒）
# 即，如果发现缓存文件，其最后修改时间太老，则丢弃之
# 默认则表示缓存文件永久有效
cache-duration : 60
# 如果开启，则表示每个请求都要判断对应缓存是否是对应这个请求。
# 但是如何判断呢？会根据这个键名，即缓存对象必须存在这个键，且其值
# 与 MD5(http-qs) 的签名相同才算匹配
# 默认的，这个开关是关闭的，即，不会检查签名
cache-finger-key : "http-query-finger"
# 上面提到的签名，默认算法是 MD5（因为速度快一点）
# 如果想用 SHA1 等其他签名算法，就修改这个参数即可
cache-finger-as  : "MD5"
# 如果启用了缓存，那么这个参数为 true 表示，请求结果会自动生成缓存
# 如果为 false，则表示不会自动生成缓存数据
# 默认为 true
cache-lazy  : true
#--------------------------------------------------
# 声明了这个选项，就表示要输出 HTTP 302 
# 值是一个 URL 模板，占位符上下文为缓存对象的元数据
# 且多了一个占位符 ${sha1Path}， 即缓存对象 sha1 值
# 得路径花字符串： "xxxx/xxxx...xxx"
# 没声明这个选项，则表示直接将缓存对象输回响应流
cache-redirect : "http://xx.xx/xx/${sha1Path}"
#--------------------------------------------------
#                 请求对象
#--------------------------------------------------
# 请求对象被创建后一段时间会被自动删除
# 默认的时间为 1 分钟
http-tmp-duraion : 60000
#--------------------------------------------------
# 你可以指定将请求的某几个 Cookie 值 Copy 到请求执行的上下文里
# 不过通常你不需要设置这个属性
#--------------------------------------------------
copy-cookie : ["SEID", "ABC"]
</code></pre>
<p>文件的内容是一个命令模板，模板的占位符上下文为请求对象本身。
因此你可以使用任何请求对象的元数据，也可以用 <code>cat id:${id}</code> 的方式读取请求对象的内容。</p>
<h2>请求对象</h2>
<pre><code class="language-bash">#--------------------------------------------------
#
#                 域信息
#
#--------------------------------------------------
http-usr : "demo"        # API的处理域主账户名
http-grp : "demo"        # API的处理域主账户的主组（通常就是域的名称）
http-usr : "/home/demo/" # API的处理域主账户名的HOME目录
http-api : "test"        # API 文件名称
#--------------------------------------------------
#
#                 系统会话信息
#
#--------------------------------------------------
# 如果你已经登录了一个 Walnut 系统会话，这个会显示系统会话信息
# 当然，如果你没登陆（同时是没登陆的）这些元数据都是没有的
http-se-id      : "67r..23q"   # 会话 ID
http-se-ticket  : "8um..32q"   # 会话票据
http-se-me-name : "demo"       # 会话用户名
http-se-me-group: "demo"       # 会话用户主组
http-se-vars : {..}            # 会话内的环境变量
#--------------------------------------------------
#
#                 站点会话信息
#
#--------------------------------------------------
# 如果你已经在域里建立一个有用户系统的站点
# 当前会话信息会自动增加在这里
http-www-se-id       : "y6..91"     # 站点会话ID 
http-www-se-ticket   : "8um..32q"   # 站点会话票据
http-www-me-id       : "5e..g1"     # 会话用户ID
http-www-me-nm       : "xiaobai"    # 会话用户登陆名
http-www-me-nickname : "xiaobai"    # 会话用户昵称
http-www-me-thumb    : "id:xxx"     # 会话用户头像路径
http-www-me-phone    : "139..."     # 会话用户手机号
http-www-me-email    : "x@xx.com"   # 会话用户邮箱
http-www-me-role     : "user"       # 会话用户业务角色名
http-www-me-nickname : "小白"        # 会话用户昵称
#--------------------------------------------------
#
#                 请求信息
#
#--------------------------------------------------
http-url : "http://localhost:8080/api/demo/test"  # 请求的完整路径
http-uri : "/api/demo/test"  # 请求的全路径
http-method   : "GET"        # 请求方法
http-protocol : "HTTP/1.1"   # 协议

# 路径参数： @see “路径参数”一节
args : ["test"]
params : {
  "nm" : "test"
}

# Query String 
# 请求参数用 http-qs- 作为前缀，参数名全小写
http-qs   : "a=find&amp;x=99"
http-qs-a : "find"
http-qs-x : "99"

# 所有的 Cookie 用 http-cookie- 作为前缀
# 键名全大写
http-cookie-SEID: "ujsmsd0564juorkvek6v3hgg7o"

# 所有的请求头参数用 http-header- 作为前缀
# 键名全大写
http-header-ACCEPT: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
http-header-ACCEPT-ENCODING : "gzip, deflate, br",
http-header-ACCEPT-LANGUAGE : "zh-CN,zh;q=0.9",
http-header-CONNECTION : "keep-alive",
http-header-COOKIE : "SEID=ujsmsd0564juorkvek6v3hgg7o",
http-header-HOST : "localhost:8080",
http-header-SEC-FETCH-DEST : "document",
http-header-SEC-FETCH-MODE : "navigate",
http-header-SEC-FETCH-SITE : "none",
http-header-SEC-FETCH-USER : "?1",
http-header-UPGRADE-INSECURE-REQUESTS : "1",
http-header-USER-AGENT : "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.149 Safari/537.36",
</code></pre>
<p>请求对象的请求体就是 HTTP 请求的流内容。普通的GET请求，那么它就是空。
如果是<code>POST</code>请求，那么就是：</p>
<pre><code>a=xxx&amp;b=xxx
</code></pre>
<p>如果是HTML5的文件上传流，那么就是文件内容:</p>
<pre><code>7b0a 2020 2278 223a 2031 3030 2c0a 2020
227a 223a 2033 322c 0a20 2022 7922 3a20
...
</code></pre>
<p>因此，你要做一个文件上传，就非常简单了，直接 <code>cp id:${id} ~/path/to/target</code> 即可。</p>
<hr>
<h1>动态决定响应头</h1>
<p>有时候，你的希望你的 api 命令来指定 HTTP 响应的头部内容，你可以为你的 api 文件添加元数据 <code>http-dynamic-header=true</code>。这样系统执行你的命令时，会先将你命令所有的输出，输出到一个字符串缓冲里，然后进行分析。 如果你的输出格式类似:</p>
<pre><code>HTTP/1.1 200 OK
Content-Type: text/html;charset=UTF-8
SET-COOKIE:MYID=xxxxxxxx; Path=/;
Server: Walnut HTTPAPI

&lt;html&gt;
...
</code></pre>
<p>那么它会解析输出内容的头部，将其作为标准的 HTTP 头写回到响应里。</p>
<p>这个机制非常适合读取多媒体信息等场景，因为你可以在命令里判断是否可以输出 <code>HTTP302</code>。
Walnut 也为你内置了一个命令：</p>
<pre><code class="language-bash"># API(thing): 缩略图
@FILE .regapi/api/thumb
{
  "http-dynamic-header": true
}
%COPY:
httpout -body ${http-qs} \
  -etag  '${http-header-IF-NONE-MATCH?none}' \
  -range '${http-header-RANGE?}'
%END%
</code></pre>
<hr>
<h1>缓存结果</h1>
<p>有时候，一个 API 会被频繁调用，但是其查询的内容可能并不会改变，
如果为此就浪费宝贵的 CPU 和 IO 资源是非常可惜的。
为此，你可以在 API 对象上声明一个缓存策略。</p>
<p>缓存的策略包括下面几个信息：</p>
<ol>
<li>缓存数据如何存放?</li>
<li>缓存如何更新?</li>
<li>缓存的结果如何回复给客户端?</li>
</ol>
<p><strong>!!!注意</strong>，缓存策略在下面几种情况下会被无视：</p>
<ul>
<li>非 <code>GET</code> 请求无视</li>
<li>需要校验 <code>auth</code> 的请求无视</li>
<li>动态请求头的 <code>API</code> 无视</li>
</ul>
<h2>1.缓存数据如何存放?</h2>
<pre><code class="language-bash"># 通过这个参数可以确定一个请求是否要尝试命中缓存。
# 这个选项就是一组判断条件，会依次判断是否匹配。如果匹配了就终止。
# 全部条件都未匹配，则表示本次请求无需尝试命中缓存
cache-test : [{
    # 如果声明了这个选项，表示开启缓存的API需要匹配 Query String 的细节才能
    # 尝试命中缓存。 条件是一个数组，元素之间是 OR 的关系。 元素是一个对象，
    # 代表一组 AND 关系。 当然也可以直接就是一个对象
    # 其中每个对象项就是一个 WnValidate 的验证器。验证的对象是 Query String 组成
    # 的对象（去掉 "http-qs-" 前缀的版本）
    # 如果没有有声明，这个选项，则表示一定会命中，通常用作默认值
    match: {
        "id" : "notEmpty",
        "!ts" : "^(site/(accounts|roles))$"
    },
    # 这个路径是一个字符串模板，渲染上下文为整个请求对象
    # 因此，你可以使用诸如 ${http-qs-xxx} 等占位符
    path : "~/.domain/cache/api/get-${http-qs-id}.json",
    # 可选测试，如果没有指定，则用缓存文件的 mime 作为
    # 响应的 Content-Type
    mime : "text/json"
}]
</code></pre>
<h2>2.缓存如何更新</h2>
<pre><code class="language-bash">#----------------------------------------------------------
# 如果这个选项的值是整数且大于0，则表示缓存文件的有效期（秒）
# 即，如果发现缓存文件，其最后修改时间太老，则丢弃之
# 默认则表示缓存文件永久有效
cache-duration : 60
#----------------------------------------------------------
# 如果开启，则表示每个请求都要判断对应缓存是否是对应这个请求。
# 但是如何判断呢？会根据这个键名，即缓存对象必须存在这个键，且其值
# 与 MD5(http-qs) 的签名相同才算匹配
# 默认的，这个开关是关闭的，即，不会检查签名
cache-finger-key : "http-query-finger"
# 上面提到的签名，默认算法是 MD5（因为速度快一点）
# 如果想用 SHA1 等其他签名算法，就修改这个参数即可
cache-finger-as : "MD5"
#----------------------------------------------------------
# 如果启用了缓存，那么这个参数为 true 表示，请求结果会自动生成缓存
# 如果为 false，则表示不会自动生成缓存数据
# 默认为 true
cache-lazy  : true
</code></pre>
<h2>3.缓存的结果如何回复给客户端?</h2>
<p>一共有两种方式：</p>
<ol>
<li>读取缓存内容，直接写回响应流</li>
<li>返回一个<code>HTTP 302</code>，因为缓存可以通过 CDN 等分布式服务读取到。</li>
</ol>
<pre><code class="language-bash"># 声明了这个选项，就表示要输出 HTTP 302 
# 值是一个 URL 模板，占位符上下文为缓存对象的元数据
# 且多了一个占位符 ${sha1Path}， 即缓存对象 sha1 值
# 得路径花字符串： "xxxx/xxxx...xxx"
# 没声明这个选项，则表示直接将缓存对象输回响应流
cache-redirect : "http://xx.xx/xx/${sha1Path}"
</code></pre>
<hr>
<h1>路径参数</h1>
<p>考虑到兼容世界上大多数 REST API，必须支持路径参数啊。</p>
<ul>
<li><code>.regapi/api</code> 目录下的 名字为 <code>_ANY</code> 文件或者目录表示 <code>?</code></li>
<li>如果 <code>_ANY</code> 是目录，则相当于 <code>?</code> 其内的 <code>_action</code> 文件表示具体的操作</li>
<li>如果 <code>_ANY</code> 是文件，则相当于 <code>*</code></li>
<li><code>_ANY</code> 目录/文件支持元数据: <code>api-param-name:"id"</code>，以便为路径参数指定形参名称</li>
</ul>
<h2>匹配 <code>?</code></h2>
<pre><code class="language-bash">API:  ~/.regapi/api/post/_ANY/_action
        其中 _ANY {"api-param-name" : "id"}
URL: http://host/api/yourdomain/post/9827
请求对象会多出元数据: 
{
    ...
    args : ["9827"]
    params : {       // 只有声明了 "api-param-name" 才会有
        "id" : "9827"
    }
    ...
}
#---------------------------------------------
API:  ~/.regapi/api/post/_ANY/_action
如果URL: http://host/api/yourdomain/post/9827/xyz
那么就会 404
#---------------------------------------------
API:  ~/.regapi/api/post/_ANY/get
URL: http://host/api/yourdomain/post/9827/get
请求对象会多出元数据: 
{
    ...
    args : ["9827"]
    ...
}
#---------------------------------------------
如果URL: http://host/api/yourdomain/post/9827
那么就会 404
</code></pre>
<h2>匹配 <code>*</code></h2>
<pre><code class="language-bash">API:  ~/.regapi/api/post/_ANY
        其中 _ANY {"api-param-name" : "ph"}
URL: http://host/api/yourdomain/post/cat/409681
请求对象会多出元数据: 
{
    ...
    args : ["cat/409681"]
    params : {       // 只有声明了 "api-param-name" 才会有
        "ph" : "cat/409681"
    }
    ...
}
#---------------------------------------------
如果URL: http://host/api/yourdomain/xyz/9827
那么就会 404
</code></pre>
<h2>组合两种通配符</h2>
<pre><code class="language-bash">API:  ~/.regapi/api/post/_ANY/_ANY/_action
        其中
            _ANY[0] {"api-param-name" : "type"}
            _ANY[1] {"api-param-name" : "id"}
URL: http://host/api/yourdomain/post/pet/cat/409681
请求对象会多出元数据: 
{
    ...
    args : ["pet", "cat/40981"]
    params : {       // 只有声明了 "api-param-name" 才会有
        "type" : "cat",
        "id" : "cat/409681"
    }
    ...
}
</code></pre>
</article>
```

我想为它定义成一个漂亮的 document css 便于人阅读，你给我输出一段 CSS 定制文章内容就好。
我的要求如下，我需要生成 scss 代码:

```scss
@use '@site0/tijs/sass/_all.scss' as *;

article.is-markdown {
  //--------------------------------------------
  // 这里是预定义变量 --xx-color ...，我需要对 
  //--------------------------------------------
  // 1. 块级元素：table, table.front-matter, ul, ol, blockquote, pre
  // 2. 行内元素: code
  // 都定义 bgcolor 以及 color, 譬如 --ul-bgcolor, --ul-color
  // 我需要定义 a,strong,em,u, 等行内元素的 color 变量
  // 我还需要定义 blockquote 元素的左侧竖线的宽度以及颜色
  // 对于 blockquote 以及 pre 我需要可以定义圆角以及阴影
  // 我还需要变量定义全局字体大小以及行高
  //--------------------------------------------
  // 这里是整体 CSS
  // 我不需要指定字体
  //--------------------------------------------
  ...

  //--------------------------------------------
  // 每个块元素的定义
  // 标题元素，以及任何元素的字体边距等我都希望采用 em 作为单位
  //--------------------------------------------

  //--------------------------------------------
  // 每个行内元素的定义
  // 图片默认采用原始宽度，但是要限定 max-width:100%

  //--------------------------------------------

}
```
请给我输出 scss 代码