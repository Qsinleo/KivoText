document.getElementById("process-button").addEventListener("click", () => {
    if (verify()) {
        document.getElementById("process-button").disabled = "disabled";
        document.getElementById("loading-circle").style.display = "inline-block";
        document.getElementById("return-button").disabled = "disabled";
        document.getElementById("process-button").innerText = "提交中";
        let sendparam = "";
        if (select == 0) {
            sendparam = "type=login&name=" + document.getElementById("name").value + "&passwordENC=" + sha1(document.getElementById("password").value) + "&keeplogined=" + (document.getElementById("keep-logined-checkbox").checked ? "true" : "false");
        } else {
            sendparam = "type=register&name=" + document.getElementById("name").value + "&passwordENC=" + sha1(document.getElementById("password").value) + "&keeplogined=" + (document.getElementById("keep-logined-checkbox").checked ? "true" : "false");
        }
        sendRequest(sendparam, (res) => {
            document.getElementById("process-button").disabled = "";
            document.getElementById("return-button").disabled = "";
            document.getElementById("process-button").innerText = "提交";
            document.getElementById("loading-circle").style.display = "none";
            console.log(res);
            if (select == 0) {
                switch (res) {
                    case "login.error.doesNotExistOrPasswordWrong":
                        document.getElementById("name-error").innerText = "用户名或密码错误！";
                        break;
                    case "login.success":
                        document.body.getElementsByTagName("main")[0].innerHTML = "<h2>正在跳转中……</h2>";
                        location.href = "index.html";
                        break;
                    default:
                        document.body.getElementsByTagName("main")[0].innerHTML = "<h2>错误：请使用服务器运行，而不是直接打开文件！</h2>";
                        break;
                }
            } else {
                switch (res) {
                    case "register.error.alreadyExists":
                        document.getElementById("name-error").innerText = "用户名已存在！";
                        break;
                    case "register.success":
                        alert("注册成功，点击“确定”返回主界面。");
                        document.body.getElementsByTagName("main")[0].innerHTML = "<h2>正在跳转中……</h2>";
                        location.href = "index.html";
                        break;
                    default:
                        document.body.getElementsByTagName("main")[0].innerHTML = "<h2>错误：请使用服务器运行，而不是直接打开文件！</h2>";
                        break;
                }
            }
        }, false);
    }
});

function sendRequest(args, callback) {
    var xmlhttp;
    if (window.XMLHttpRequest) {
        // IE7+, Firefox, Chrome, Opera, Safari 浏览器执行代码
        xmlhttp = new XMLHttpRequest();
    }
    else {
        // IE6, IE5 浏览器执行代码
        xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }
    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            if (typeof callback == "function") {
                callback(xmlhttp.responseText);
            } else {
                console.error("Not a function:" + callback.toString());
            }
        }
    }
    xmlhttp.open("POST", "process.php?" + args, true);
    xmlhttp.send();
}


function getCookie(name) {
    var strcookie = document.cookie;//获取cookie字符串
    var arrcookie = strcookie.split("; ");//分割
    //遍历匹配
    for (var i = 0; i < arrcookie.length; i++) {
        var arr = arrcookie[i].split("=");
        if (arr[0] == name) {
            return arr[1];
        }
    }
    return null;
}

function verify() {
    let passed = true;
    if (document.getElementById("name").value.length == 0) {
        document.getElementById("name-error").innerText = "用户名不能为空！"
        passed = false;
    } else {
        document.getElementById("name-error").innerText = ""
    }
    if (document.getElementById("password").value.length == 0) {
        document.getElementById("password-error").innerText = "密码不能为空！"
        passed = false;
    } else {
        document.getElementById("password-error").innerText = ""
    }
    if (!obj.judge()) {
        document.getElementById("verifycode-error").innerText = "验证码错误！";
        passed = false;
    } else {
        document.getElementById("verifycode-error").innerText = "";
    }
    return passed;
}

let select;
for (let index = 0; index < document.getElementById("options-box").childElementCount; index++) {
    const iterator = document.getElementById("options-box").children[index];
    iterator.addEventListener("click", () => {
        select = index;
        for (const iterator1 of document.getElementById("options-box").children) {
            iterator1.style.backgroundColor = "";
        }
        document.getElementById("name-error").innerText = "";
        document.getElementById("password-error").innerText = "";
        iterator.style.backgroundColor = "var(--high-light-color)";
    });
}
{
    const iterator = document.getElementById("options-box").children[0];
    select = 0;
    for (const iterator1 of document.getElementById("options-box").children) {
        iterator1.style.backgroundColor = "";
    }
    iterator.style.backgroundColor = "var(--high-light-color)";
}
document.getElementById("return-button").addEventListener("click", () => {
    location.href = "index.html";
});

if (getCookie("KivoText-loginID")) {
    alert("你已登录，ID：" + getCookie("KivoText-loginID") + "，将跳转至首页。");
    location.href = "index.html";
} else {
    obj.init("pic", document.getElementById("verify-code"));
}