function getBytes(string) {
    return (string.match(/[^\n]/g) ? string.match(/[^\n]/g).length : 0) + (string.match(/[\u4e00-\u9fa5]/g) ? string.match(/[\u4e00-\u9fa5]/g).length : 0) * 2;
}

function checkServer(status, freq) {
    let currentTime = new Date();
    sendRequest("type=ping-back", (response) => {
        if (response == "ping.receive") {
            document.getElementById("ping-delay-label").innerText = (new Date() - currentTime) + "ms";
            document.getElementById("server-status").classList = "green";
            document.getElementById("server-status").innerText = "√ 正常";
            setTimeout(() => {
                checkServer(true, freq);
            }, freq);
        } else {
            document.getElementById("ping-delay-label").innerText = "CODE -1";
            document.getElementById("server-status").classList = "red";
            document.getElementById("server-status").innerText = "× 故障";
            if (status) {//避免反复触发
                showMessage("暂时无法连接至服务器。请妥善保存好您所撰写的内容，以免丢失。");
            }
            setTimeout(() => {
                checkServer(false, freq);
            }, freq);
        }
    }, false, (code) => {
        document.getElementById("ping-delay-label").innerText = "CODE " + code;
        document.getElementById("server-status").classList = "red";
        document.getElementById("server-status").innerText = "× 故障";
        if (status) {
            showMessage("暂时无法连接至服务器。请妥善保存好您所撰写的内容，以免丢失。");
        }
        setTimeout(() => {
            checkServer(false, freq);
        }, freq);
    });
}

function loadingAnimation(showOrHide) {
    if (showOrHide) {
        document.getElementById("in-process").style.display = "block";
    } else {
        document.getElementById("in-process").style.display = "none";
    }
}



function showMessage(text, state) {
    let messageObj = document.createElement("div");
    messageObj.classList = ["message-display"];
    messageObj.innerHTML = `
    <div>
        <div>✅
        ${text}
        <small>${new Date().toLocaleTimeString("zh-CN")}</small></div>
    </div>
    <div></div>
    `;
    messageObj.style.opacity = 0;
    document.body.appendChild(messageObj);
    let paceLeft = -messageObj.offsetWidth;
    let main = setInterval(() => {
        messageObj.style.left = paceLeft + "px";
        messageObj.style.opacity = 1;
        if (paceLeft < 10) {
            paceLeft += 20;
        } else {
            clearInterval(main);
            setTimeout(() => {
                let main = setInterval(() => {
                    messageObj.style.left = paceLeft + "px";
                    if (paceLeft > -messageObj.offsetWidth) {
                        paceLeft -= 20;
                    } else {
                        messageObj.remove();
                        clearInterval(main);
                        return;
                    }
                }, 20);
            }, 2800);
        }
    }, 20);
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


function sendRequest(args, callback, jsonData = true, withToken = true) {
    var xmlhttp;
    if (window.XMLHttpRequest) {
        // IE7+, Firefox, Chrome, Opera, Safari 浏览器执行代码
        xmlhttp = new XMLHttpRequest();
    }
    else {
        // IE6, IE5 浏览器执行代码
        xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }
    xmlhttp.onreadystatechange = () => {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            if (typeof callback == "function") {
                // console.log(xmlhttp.responseText);
                if (jsonData) {
                    callback(JSON.parse(xmlhttp.responseText));
                } else {
                    callback(xmlhttp.responseText);
                }
            } else {
                console.error("Not a function:" + callback.toString());
            }
        }
    }
    xmlhttp.open("POST", 'process.php?' + (withToken ? `tokenusername=${localStorage.getItem("KivoText-username")}&tokenpassword=${localStorage.getItem("KivoText-username")}&` : '') + args, true);
    xmlhttp.send();
}

function openPopup(name) {
    document.getElementById("popup-shade").style.display = "block";
    document.getElementById("popup-border").style.display = "block";
    for (const each of document.getElementsByClassName("pop-content")) {
        each.style.display = "none";
        if (each.dataset.type == name) {
            each.style.display = "block";
        }
    }
}

function downloadFile(data, fileName) {
    // data为blob格式
    var blob = new Blob([data]);
    var downloadElement = document.createElement('a');
    var href = window.URL.createObjectURL(blob);
    downloadElement.href = href;
    downloadElement.download = fileName;
    document.body.appendChild(downloadElement);
    downloadElement.click();
    document.body.removeChild(downloadElement);
    window.URL.revokeObjectURL(href);
    showMessage("文件下载已经开始，请在浏览器“下载”页面确认。");
}


function textStatic() {
    function countLines(str) {
        //字符串为空
        if (!str) {
            return 0;
        }
        // 使用正则表达式匹配换行符，并计算匹配的数量
        var matches = str.replace(/\n$/, '').replace(/^\n/, '').match(/\n/g);
        // 如果没有匹配到换行符，则行数为1
        if (!matches) {
            return 1;
        }
        // 返回换行符的数量加1（行数为换行符数量加1）
        return matches.length + 1;
    }
    if (document.getElementById("main-text-editor").value.match(/[^\n]/g)) {
        document.getElementById("text-static-table").getElementsByTagName("b")[0].innerText = document.getElementById("main-text-editor").value.match(/[^\n]/g).length;
    } else {
        document.getElementById("text-static-table").getElementsByTagName("b")[0].innerText = 0;
    }
    if (document.getElementById("main-text-editor").value.match(/[\da-zA-Z\u4e00-\u9fa5]/g)) {
        document.getElementById("text-static-table").getElementsByTagName("b")[1].innerText = document.getElementById("main-text-editor").value.match(/[\da-zA-Z\u4e00-\u9fa5]/g).length;
    } else {
        document.getElementById("text-static-table").getElementsByTagName("b")[1].innerText = 0;
    }
    if (document.getElementById("main-text-editor").value.match(/[\u4e00-\u9fa5]/g)) {
        document.getElementById("text-static-table").getElementsByTagName("b")[2].innerText = document.getElementById("main-text-editor").value.match(/[\u4e00-\u9fa5]/g).length;
    } else {
        document.getElementById("text-static-table").getElementsByTagName("b")[2].innerText = 0;
    }
    document.getElementById("text-static-table").getElementsByTagName("b")[3].innerText = countLines(document.getElementById("main-text-editor").value);
    const chars = getBytes(document.getElementById("main-text-editor").value);
    const sharedChars = getBytes(document.getElementById("shared-file-text-editor").value);
    document.getElementById("text-static-table").getElementsByTagName("b")[4].innerText = chars;
    document.getElementById("current-file-length-label").innerText = chars;
    document.getElementById("file-left-length-label").innerText = (config.fileLengthLimit === null ? "无限制" : (config.fileLengthLimit == -1 ? "只读模式" : config.fileLengthLimit - chars));
    if (config.fileLengthLimit - chars < 0 && config.fileLengthLimit !== null) {
        document.getElementById("file-left-length-label").className = "red-text";
    } else if (config.fileLengthLimit - chars < 100 && config.fileLengthLimit !== null) {
        document.getElementById("file-left-length-label").className = "yellow-text";
    } else {
        document.getElementById("file-left-length-label").className = "green-text";
    }
    return [chars, sharedChars];
}

function searchText() {
    document.getElementById("search-and-replace-table").getElementsByTagName("b")[0].parentElement.innerHTML = "共有<b>0</b>个结果";
    if (document.getElementById("search-text-input").value.length > 0) {
        let searchPattern;
        if (document.getElementById("search-text-input").value.length > 2 && document.getElementById("search-text-input").value[0] == "/" && document.getElementById("search-text-input").value[document.getElementById("search-text-input").value.length - 1] == "/") {
            try {
                searchPattern = new RegExp(document.getElementById("search-text-input").value.slice(1, document.getElementById("search-text-input").value.length - 1), "gm" + (document.getElementById("search-no-sense-of-capitialize").checked ? "i" : ""));
            } catch (error) {
                document.getElementById("search-and-replace-table").getElementsByTagName("b")[0].parentElement.innerHTML = "<b class='red-text'>不合法的正则表达式！</b>";
                return [0, null]
            }

        } else {
            searchPattern = new RegExp(document.getElementById("search-text-input").value.replace(/\\/g, "\\\\"),
                "gm" + (document.getElementById("search-no-sense-of-capitialize").checked ? "i" : ""));
        }
        if (document.getElementById("search-and-replace-table").getElementsByTagName("b")[0].innerText = document.getElementById("main-text-editor").value.match(searchPattern)) {
            document.getElementById("search-and-replace-table").getElementsByTagName("b")[0].innerText = document.getElementById("main-text-editor").value.match(searchPattern).length;
            return [document.getElementById("main-text-editor").value.match(searchPattern).length, searchPattern];
        } else {
            document.getElementById("search-and-replace-table").getElementsByTagName("b")[0].innerText = 0;
            return [0, searchPattern];
        }
    } else {
        document.getElementById("search-and-replace-table").getElementsByTagName("b")[0].innerText = 0;
        return [0, null];
    }
}

function loadingAnimationInPopup(flag) {
    if (flag) {
        document.getElementById("loading-in-popup").style.display = "block";
    } else {
        document.getElementById("loading-in-popup").style.display = "none";
    }
}

function setStyle() {
    for (const each of themes) {
        if (each.label == document.getElementById("theme-selector").value) {
            for (const cssVar in each.cssVars) {
                if (cssVar) {//避免无效样式
                    document.documentElement.style.setProperty(cssVar, each.cssVars[cssVar]);
                }
                document.getElementById("selected-theme-info-table").getElementsByTagName("tr")[0].children[1].innerText = each.author;
                document.getElementById("selected-theme-info-table").getElementsByTagName("tr")[1].children[1].innerText = each.info;
            }
        }
    }
    document.cookie = "KivoText-preferTheme=" + document.getElementById("theme-selector").value + "; max-age=" + (86400 * 7);
    document.cookie = "KivoText-preferFont=" + document.getElementById("font-selector").value + "; max-age=" + (86400 * 7);

    document.body.style.fontFamily = document.getElementById("font-selector").value;

}

function fade(ele, inOrOut = true, time = 30, entire = false) {
    if (inOrOut) {
        if (!entire || ele.style.opacity == 0) {
            ele.style.display = "none";
            ele.style.opacity = 0;
            let opac = 0;
            ele.style.display = "block";
            let timer = setInterval(() => {
                ele.style.opacity = opac / 10;
                opac++;
                if (opac > 10) {
                    clearInterval(timer);
                    return;
                }
            }, time);
        }
    } else {
        if (!entire || ele.style.opacity == 1) {
            let opac = 10;
            let timer = setInterval(() => {
                ele.style.opacity = opac / 10;
                opac--;
                if (opac < 0) {
                    ele.style.display = "none";
                    clearInterval(timer);
                    return;
                }
            }, time);
        }
    }
}

function getFileNameById(id) {
    for (const each of document.getElementsByClassName("file-label")) {
        if (each.getAttribute("fileID") == id) {
            return each.getElementsByClassName("file-name")[0].innerText;
        }
    }
}

function isLogined() {
    return localStorage.getItem("KivoText-username") && localStorage.getItem("KivoText-encpassword");
}