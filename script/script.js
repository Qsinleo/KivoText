
// DEFINE THE CONSTANT
let fileNameLimitLength;
let shareCodeLength;
let fileLengthLimit;
let filesCountLimit;
let deleteFileAble;
let themes;
let originText = null;

function getFileStatus(flag) {
    //获得文件的各种状态
    switch (flag) {
        case "is-open":
            return document.getElementById("file-not-open-hint").style.display == "none";
        case "is-saved":
            return document.getElementById("file-save-status-label").className == "green-text" || document.getElementById("file-editable-label").className == "yellow-text";
        case "is-short-to-save":
            return fileLengthLimit !== null && (textStatic()[0] > fileLengthLimit);
        case "is-shared":
            return document.getElementById("shared-status").className == "green";
        default:
            break;
    }
}



function operationOfFiles(type, fileid) {
    function fileInfoFormatter() {
        return getFileNameById(fileid) + "(ID:" + fileid + ")";
    }
    switch (type) {
        case "open-file":
            if (getFileStatus("is-open")) {
                if (confirm("已有打开的文件。是否覆盖打开？")) {
                    if (!getFileStatus("is-saved")) {
                        if (!getFileStatus("is-able-to-save")) {
                            if (!confirm("保存失败：文件内容长度超出了限制！是否仍要打开新文件？"));
                            break;
                        } else if (getFileStatus("is-shared")) {
                            if (!confirm("保存失败：文件属于共享状态，无法保存共享文件！是否仍要打开新文件？"));
                            break;
                        } else {
                            if (confirm("是否保存正在编辑的文件？按下“确定”保存退出，按下“取消”不保存退出。"))
                                operationOfFiles("save-file", fileid);
                        }
                    }
                } else {
                    break;
                }
            }
            document.getElementById("file-not-open-hint").style.display = "block";
            document.getElementById("file-not-open-hint").style.removeProperty("font-style")
            document.getElementById("file-not-open-hint").style.fontWeight = "bold";
            document.getElementById("file-not-open-hint").innerText = "正在打开文件" + fileInfoFormatter() + "……";
            loadFileMeta(null, true, fileid);
            break;
        case "save-file":
            if (getFileStatus("is-shared")) {
                showMessage("保存失败：文件属于共享状态，无法对共享文件编辑！请先关闭共享再保存。");
                break;
            }

            if (getFileStatus("is-short-to-save")) {
                showMessage("保存失败：文件内容长度超出了限制！可在“权限查看”页面确认权限。");
                break;
            }

            loadingAnimation(true);
            sendRequest("type=save-file&fileid=" + fileid + "&filecontent=" + encodeURIComponent(document.getElementById("main-text-editor").value), (response) => {
                showMessage("保存文件成功！")
                loadingAnimation(false);
                loadFileMeta(null, true, fileid);
            }, false); //刷新共享状态;
            break;
        case "close-file":
            if (!getFileStatus("is-saved")) {
                if (!confirm("有更改尚未保存！确定关闭吗？")) {
                    break;
                }
            }
        case "close-file-force":
            document.getElementById("file-opened-area").style.display = "none";
            document.getElementById("file-not-open-hint").style.display = "block";
            document.getElementById("file-not-open-hint").style.fontStyle = "italic";
            document.getElementById("file-not-open-hint").style.removeProperty("font-weight");
            document.getElementById("file-not-open-hint").innerText = "可在“文件列表”选择文件打开。";
            for (const each of document.getElementsByClassName("file-label")) {
                if (each.getAttribute("fileID") == fileid) {
                    each.style.removeProperty("background-color");
                }
                each.getElementsByClassName("open-file-button")[0].disabled = "";
            }
            break;
        case "rename-file":
            var askName = prompt("请为文件" + fileInfoFormatter() + "指定新文件名，长度不能超过" + fileNameLimitLength + "：");
            if (askName) {
                if (askName.length > fileNameLimitLength) {
                    alert("文件名错误：长度过长（" + askName.length + "/" + fileNameLimitLength + "）！")
                } else {
                    loadingAnimation(true);
                    sendRequest("type=rename-file&newname=" + encodeURIComponent(askName) + "&fileid=" + fileid, (response) => {
                        if (document.getElementById("file-info").getElementsByTagName("span")[1].innerText == fileid) {
                            document.getElementById("file-info").getElementsByTagName("span")[0].innerText = askName;
                        }
                        loadUserInfo(() => {
                            for (const each of document.getElementsByClassName("file-label")) {
                                if (each.getAttribute("fileID") == fileid && document.getElementById("file-not-open-hint").style.display == "none") {
                                    each.getElementsByClassName("open-file-button")[0].disabled = "disabled";
                                    each.style.backgroundColor = "var(--high-light-color)";
                                }
                            }
                            showMessage("重命名文件成功");
                        });
                    }, false);
                }
            }
            break;
        case "restore-file":
            if (!confirm("是否恢复到上次保存的内容？")) {
                break;
            }
            document.getElementById("main-text-editor").value = originText;
            document.getElementById("file-save-status-label").innerText = "所有更改已经保存";
            document.getElementById("file-save-status-label").className = "green-text";
            break;
        case "create-file":
            if (filesCountLimit !== null) {
                if (parseInt(document.getElementById("total-files-label").innerText) >= filesCountLimit) {
                    showMessage("创建文件失败：文件数量超出限制！");
                    break;
                }
            }

            var askName = prompt("请指定新文件名，留空以取消，长度不能超过" + fileNameLimitLength + "：");
            if (askName) {
                if (askName.length > fileNameLimitLength) {
                    alert("文件名错误：长度过长（" + askName.length + "/" + fileNameLimitLength + "）！")
                } else {
                    loadingAnimation(true);
                    sendRequest("type=create-file&filename=" + encodeURIComponent(askName), (response) => {
                        loadUserInfo(() => {
                            showMessage("创建文件" + askName + "成功");
                        });
                    }, false);
                }
            }
            break;
        case "delete-file":
            if (deleteFileAble == 0) {
                showMessage("删除失败：你没有删除文件的权限！");
                break;
            }
            if (!confirm("确定删除" + fileInfoFormatter() + "吗？一切数据都将被抹除。")) {
                break;
            }
        case "delete-file-force":
            loadingAnimation(true);
            sendRequest("type=delete-file&fileid=" + fileid, (response) => {
                loadUserInfo(() => {
                    if (fileid == document.getElementById("file-info").getElementsByTagName("span")[1].innerText) {
                        operationOfFiles("close-file", fileid);
                    }
                    showMessage("删除文件成功！");
                    displaySelectInfo();
                });
            }, false);
            break;
        case "download-file":
            let saveFlag;
            if (getFileStatus("is-open") && document.getElementById("file-info").getElementsByTagName("span")[1].innerText == fileid && !getFileStatus("is-save")) {
                if (!document.getElementById("multi-operation-no-ask-again").checked) {
                    if (!confirm("确认要下载" + fileInfoFormatter() + "吗？")) {
                        break;
                    }
                }
                saveFlag = confirm("你下载的文件是正在编辑的文件，点击“确定”下载编辑框输入的内容；\n点击“取消”下载服务器原先保存的文件");
            } else {
                if (!document.getElementById("multi-operation-no-ask-again").checked) {
                    if (!confirm("确认要下载" + fileInfoFormatter() + "吗？")) {
                        break;
                    }
                }
                saveFlag = false;
            }
            loadingAnimation(true);
            if (saveFlag) {
                downloadFile(document.getElementById("main-text-editor").value, JSON.parse(response)["name"] + ".txt");
            } else {
                sendRequest("type=open-file&fileid=" + fileid, (response) => {
                    downloadFile(JSON.parse(response)["content"], JSON.parse(response)["name"] + ".txt");
                    loadingAnimation(false);
                }, true);
            }
            break;
        case "copy-file":
            if (fileLengthLimit != null) {
                if (textStatic()[0] > fileLengthLimit) {
                    showMessage("另存为失败：当前文件内容长度超出了限制！可在“权限查看”页面确认权限。");
                    break;
                }
            }

            if (filesCountLimit != null) {
                if (parseInt(document.getElementById("total-files-label").innerText) >= filesCountLimit) {
                    showMessage("创建文件失败：文件数量超出限制！");
                    break;
                }
            }

            if (getFileStatus("is-open") && !getFileStatus("is-saved") && document.getElementById("file-info").getElementsByTagName("span")[1].innerText == fileid) {
                var askName = prompt("请为" + fileInfoFormatter() + "指定新文件名，长度不能超过" + fileNameLimitLength + "！留空以取消。\n【注意】：你另存为的文件是正在编辑的文件，请先保存，否则文件内容将与现在编辑内容不一致！");
            } else {
                var askName = prompt("请为" + fileInfoFormatter() + "指定新文件名，长度不能超过" + fileNameLimitLength + "！留空以取消。");
            }
            if (!askName) {
                break;
            }
            if (askName.length > fileNameLimitLength) {
                alert("文件名错误：长度过长（" + askName.length + "/" + fileNameLimitLength + "）！");
            } else {
                loadingAnimation(true);
                sendRequest("type=copy-file&newname=" + encodeURIComponent(askName) + "&fileid=" + fileid, (response) => {
                    loadUserInfo(() => {
                        showMessage("另存文件成功");
                    });
                }, false);
            }
            break;
        case "open-shared-file":
            if (!/[\dA-Za-z]{6}/.test(document.getElementById("share-code-input").value)) {
                document.getElementById("request-shared-file-status-label").innerText = "共享码格式错误";
                document.getElementById("request-shared-file-status-label").className = "red";
                break;
            }
            if (!obj.judge()) {
                document.getElementById("request-shared-file-status-label").innerText = "验证码错误";
                document.getElementById("request-shared-file-status-label").className = "red";
                break;
            }
            loadingAnimationInPopup(true);
            document.getElementById("request-shared-file-status-label").innerText = "正在读取中";
            document.getElementById("request-shared-file-status-label").className = "blue";
            sendRequest("type=open-shared-file&sharecode=" + document.getElementById("share-code-input").value, (response) => {
                loadingAnimationInPopup(false);
                if (response == "openSharedFile.error.shareCodeErrorOrShareIsClosed") {
                    document.getElementById("request-shared-file-status-label").innerText = "共享码错误或文件关闭共享";
                    document.getElementById("request-shared-file-status-label").className = "red";
                } else {
                    const result = JSON.parse(response.slice(7));
                    document.getElementById("request-shared-file-status-label").innerText = "文件打开成功";
                    document.getElementById("request-shared-file-status-label").className = "green";
                    document.getElementById("shared-file-info").getElementsByTagName("span")[0].innerText = result.name;
                    document.getElementById("shared-file-info").getElementsByTagName("span")[1].innerText = result.fileid;
                    document.getElementById("shared-file-info").getElementsByTagName("span")[2].innerText = result.lastmodifiedtime;
                    document.getElementById("shared-file-info").getElementsByTagName("span")[3].innerText = result.ownername;
                    document.getElementById("shared-file-info").getElementsByTagName("span")[4].innerText = result.readtimes;
                    document.getElementById("shared-file-text-editor").value = result.content;
                    document.getElementById("shared-file-text-editor").disabled = "";
                    for (const each of document.getElementById("shared-file-operator").getElementsByTagName("button")) {
                        each.disabled = "";
                    }
                }
            }, true);
            obj.refresh();
            break;
        case "close-shared-file":
            document.getElementById("request-shared-file-status-label").innerText = "等待共享码";
            document.getElementById("request-shared-file-status-label").className = "";
            document.getElementById("shared-file-info").getElementsByTagName("span")[0].innerText = "--";
            document.getElementById("shared-file-info").getElementsByTagName("span")[1].innerText = "--";
            document.getElementById("shared-file-info").getElementsByTagName("span")[2].innerText = "----.--.-- --:--:--";
            document.getElementById("shared-file-info").getElementsByTagName("span")[3].innerText = "--";
            document.getElementById("shared-file-info").getElementsByTagName("span")[4].innerText = "--";
            document.getElementById("shared-file-text-editor").value = "";
            document.getElementById("shared-file-text-editor").disabled = "disabled";
            for (const each of document.getElementById("shared-file-operator").getElementsByTagName("button")) {
                each.disabled = "disabled";
            }
            break;
        case "download-shared-file":
            downloadFile(document.getElementById("shared-file-text-editor").value, document.getElementById("shared-file-info").getElementsByTagName("span")[0].innerText);
            break;
        case "resave-shared-file":
            if (filesCountLimit != null) {
                if (parseInt(document.getElementById("total-files-label").innerText) >= filesCountLimit) {
                    showMessage("转存文件失败：文件数量超出限制！");
                    break;
                }
            }
            if (fileLengthLimit != null) {
                if (textStatic()[1] > fileLengthLimit) {
                    showMessage("另存为失败：当前文件内容长度超出了自己的限制！可在自己的“权限查看”页面确认权限。");
                    break;
                }
            }
            var askName = prompt("请输入转存后的新文件名，长度不能超过" + fileNameLimitLength + "！留空以沿用原名称。");
            if (askName === null) {
                break;
            }
            for (const each of document.getElementById("shared-file-operator").getElementsByTagName("button")) {
                each.disabled = "disabled";
            }
            sendRequest("type=resave-shared-file&fileid=" + document.getElementById("shared-file-info").getElementsByTagName("span")[1].innerText + "&newname=" + encodeURIComponent(askName ? askName : document.getElementById("shared-file-info").getElementsByTagName("span")[0].innerText), (response) => {
                loadUserInfo(() => {
                    showMessage("转存文件至" + askName + "成功");
                    for (const each of document.getElementById("shared-file-operator").getElementsByTagName("button")) {
                        each.disabled = "";
                    }
                });
            });
            break;
        default:
            break;
    }
}

function displaySelectInfo() {
    let selectedFileCount = 0;
    for (const each of document.getElementsByClassName("file-select-checkbox")) {
        if (each.checked) {
            selectedFileCount++;
        }
    }
    document.getElementById("has-selected-file-count-label").innerText = selectedFileCount;
    if (selectedFileCount) {
        document.getElementById("files-operator-list").style.display = "block";
    } else {
        document.getElementById("files-operator-list").style.display = "none";
    }
}

function loadUserInfo(callback = {}) {
    loadingAnimation(true);
    sendRequest("type=request-info", (response) => {
        // 加载用户基本数据
        response = JSON.parse(response);
        if (response.needrelogin) {
            alert("该账号已在其他地方登录，点击“确定”重新登录，新的登录IP：" + response.userinfo.lastloginIP)
            document.cookie = "KivoText-loginID=; max-age=Thu, 01 Jan 1970 00:00:00 GMT";
            location.reload();
            return;
        }
        for (const each of document.getElementsByClassName("user-name-label")) {
            each.innerText = response.userinfo.name;
        };
        for (const each of document.getElementsByClassName("user-id-label")) {
            each.innerText = getCookie("KivoText-loginID");
        };
        document.getElementById("last-online-time-label").innerText = response.userinfo.lastonlinetime;

        function resolveString(str) {
            if (str !== null)
                return parseInt(str);
            else
                return null;
        }
        fileNameLimitLength = resolveString(response.constants.fileNameLimitLength);
        shareCodeLength = resolveString(response.constants.shareCodeLength);
        fileLengthLimit = resolveString(response.constants.fileLengthLimit);
        filesCountLimit = resolveString(response.constants.filesCountLimit);
        deleteFileAble = resolveString(response.constants.deleteFileAble);
        for (const each of document.getElementsByClassName("files-count-limit-label")) {
            each.innerText = (filesCountLimit === null ? "无限制" : filesCountLimit);
        }
        for (const each of document.getElementsByClassName("file-length-limit-label")) {
            each.innerText = (fileLengthLimit === null ? "无限制" : fileLengthLimit);
        }

        if (response.files.length >= filesCountLimit && filesCountLimit !== null) {
            document.getElementById("total-files-label").className = "red-text";
        } else if (response.files.length >= filesCountLimit - 3 && filesCountLimit !== null) {
            document.getElementById("total-files-label").className = "yellow-text";
        } else {
            document.getElementById("total-files-label").className = "green-text";
        }

        document.getElementById("file-name-length-limit-label").innerText = fileNameLimitLength;
        if (deleteFileAble == 0) {
            document.getElementById("delete-file-able-label").className = "red-text";
            document.getElementById("delete-file-able-label").innerText = "不可";
        } else {
            document.getElementById("delete-file-able-label").className = "green-text";
            document.getElementById("delete-file-able-label").innerText = "可以";
        }
        // 加载文件
        document.getElementById("file-list").innerHTML = "";
        document.getElementById("total-files-label").innerText = response.files.length;
        if (response.files.length > 0) {
            let order = 1;
            for (const each of response.files) {
                let fileObj = document.createElement("div");
                fileObj.className = "file-label";
                fileObj.innerHTML = '<input type="checkbox" class="file-select-checkbox" />\
            <small>' + order++ + '</small>\
            <span class="file-name" title="ID:' + each.id + '">' + each.name + '</span>\
            '+ (each.avaliable == "1" ? '<span class="shared-file-icon">已共享</span>' : '') + '<button class="open-file-button">打开</button>';
                fileObj.setAttribute("fileID", each.id);
                document.getElementById("file-list").appendChild(fileObj);
            }
            document.getElementById("files-operator-list").style.display = "block";
            for (const each of document.getElementsByClassName("open-file-button")) {
                each.onclick = () => {
                    operationOfFiles("open-file", each.parentElement.getAttribute("fileID"));
                };
            }
            for (const each of document.getElementsByClassName("file-select-checkbox")) {
                each.onchange = () => {
                    displaySelectInfo();
                }
            }
            for (const each of document.getElementsByClassName("file-label")) {
                if (each.getAttribute("fileID") == document.getElementById("file-info").getElementsByTagName("span")[1].innerText && document.getElementById("file-not-open-hint").style.display == "none") {
                    each.getElementsByClassName("open-file-button")[0].disabled = "disabled";
                    each.style.backgroundColor = "var(--high-light-color)";
                } else {
                    each.style.removeProperty("background-color");
                }
            }
            displaySelectInfo();
            setStyle();
            document.getElementById("reset-uploaded-files-button").click();
        } else {
            let obj = document.createElement("div");
            obj.style.fontStyle = "italic";
            obj.innerText = "无文件";
            document.getElementById("file-list").appendChild(obj);
            document.getElementById("files-operator-list").style.display = "none";
        }
        loadingAnimation(false);
        if (typeof callback == "function") {
            callback();
        }
    }, true);
}

function loadFileMeta(callback = {}, changeTextarea = false, fileid = document.getElementById("file-info").getElementsByTagName("span")[1].innerText) {
    function dateDiffWithinNDays(date1, date2, n) {
        const diffTime = Math.abs(date2 - date1);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // 计算天数差
        return diffDays <= n;
    }
    loadingAnimation(true);
    sendRequest("type=read-file&fileid=" + fileid, (response) => {
        loadingAnimation(false);
        for (const each of document.getElementsByClassName("file-label")) {
            if (each.getAttribute("fileID") == fileid) {
                each.style.backgroundColor = "var(--high-light-color)";
                each.getElementsByClassName("open-file-button")[0].disabled = "disabled";
            } else {
                each.style.removeProperty("background-color");
                each.getElementsByClassName("open-file-button")[0].disabled = "";
            }
        }
        document.getElementById("close-file-button").onclick = () => {
            operationOfFiles("close-file", fileid);
        };
        document.getElementById("save-file-button").onclick = () => {
            operationOfFiles("save-file", fileid);
        };
        document.getElementById("rename-file-button-inedit").onclick = () => {
            operationOfFiles("rename-file", fileid);
        };
        document.getElementById("restore-file-button-inedit").onclick = () => {
            operationOfFiles("restore-file", fileid);
        };
        document.getElementById("delete-file-button-inedit").onclick = () => {
            operationOfFiles("delete-file", fileid);
        };
        document.getElementById("download-file-button-inedit").onclick = () => {
            operationOfFiles("download-file", fileid);
        };
        document.getElementById("copy-file-button-inedit").onclick = () => {
            operationOfFiles("copy-file", fileid);
        };
        document.getElementById("file-not-open-hint").style.display = "none";
        document.getElementById("file-opened-area").style.display = "block";
        let fileObj = JSON.parse(response);
        document.getElementById("file-info").getElementsByTagName("span")[0].innerText = fileObj.fileinfo.name;
        document.getElementById("file-info").getElementsByTagName("span")[1].innerText = fileObj.fileinfo.id;
        document.getElementById("file-info").getElementsByTagName("span")[2].innerText = fileObj.fileinfo.lastmodifiedtime;
        document.getElementById("close-file-button").disabled = "";
        if (changeTextarea) {
            document.getElementById("file-save-status-label").innerText = "所有更改已经保存";
            document.getElementById("file-save-status-label").className = "green-text";
            document.getElementById("main-text-editor").value = fileObj.fileinfo.content;
        }
        originText = fileObj.fileinfo.content;
        if (fileObj.shareinfo.avaliable == 1) {
            document.getElementById("switch-share-status-button").innerText = "关闭共享";
            document.getElementById("shared-status").innerText = "已共享";
            document.getElementById("shared-status").className = "green";
        } else {
            document.getElementById("switch-share-status-button").innerText = "开启共享";
            document.getElementById("shared-status").innerText = "未共享";
            document.getElementById("shared-status").className = "red";
        }
        // 共享信息
        document.getElementById("share-code-label").innerText = fileObj.shareinfo.sharecode;
        document.getElementById("shared-file-visited-times-label").innerText = fileObj.sharedfilereadinfo.length;
        document.getElementById("has-read-shared-file-list").innerHTML = "";

        if (fileObj.sharedfilereadinfo.length) {
            let existOneRead = false;
            for (const each of fileObj.sharedfilereadinfo) {
                if (document.getElementById("read-list-time-filter").value != "all") {
                    if (!dateDiffWithinNDays(new Date(), new Date(each.readtime), parseInt(document.getElementById("read-list-time-filter").value))) {
                        continue;
                    } else {
                        existOneRead = true;
                    }
                }
                const listobj = document.createElement("div");
                listobj.innerHTML = "<b>" + each.name + "</b><br><small>ID:" + each.id + "</small> <small>" + each.readtime + "</small>";
                document.getElementById("has-read-shared-file-list").appendChild(listobj);
            }
            if (!existOneRead && document.getElementById("read-list-time-filter").value != "all") {
                document.getElementById("has-read-shared-file-list").innerHTML = "<i>筛选的时间内暂时无人观看</i>";
            }
        } else {
            document.getElementById("has-read-shared-file-list").innerHTML = "<i>暂时无人观看</i>";
        }
        if (fileObj.shareinfo.avaliable == 1) {
            document.getElementById("file-editable-label").innerText = "只读模式(共享文件)";
            document.getElementById("file-editable-label").className = "yellow-text";
        } else if (fileLengthLimit < 0) {
            document.getElementById("file-editable-label").innerText = "只读模式(账号限制)";
            document.getElementById("file-editable-label").className = "yellow-text";
        } else {
            document.getElementById("file-editable-label").innerText = "-";
            document.getElementById("file-editable-label").className = "green-text";
        }
        textStatic();
        searchText();
        if (typeof callback == "function") {
            callback();
        }
    }, true);

}

document.getElementById("now-loading-content").innerText = "样式和字体文件";

window.onload = () => {
    document.getElementById("now-loading-content").innerText = "主题和配色方案";
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
            themes = JSON.parse(xmlhttp.responseText);
            if (/Android|webOS|iPhone|iPod|BlackBerry/i.test(navigator.userAgent) && !/Html5Plus/i.test(navigator.userAgent)) {
                // 手机版且不是MUI
                if (!getCookie("KivoText-hasRecommendedMobilephoneAPK") || getCookie("KivoText-hasRecommendedMobilephoneAPK") == "false") {
                    //未推荐过
                    openPopup("mobilephone-apk-recommend");
                    document.cookie = "KivoText-hasRecommendedMobilephoneAPK=false; max-age=" + new Date(new Date().getTime() + 3600000 * 24 * 7).toUTCString();
                    document.getElementById("no-ask-download-apk-again").checked = "";
                }
            }
            if (getCookie("KivoText-loginID")) {
                document.getElementById("now-loading-content").innerText = "用户数据";
                //已登录
                document.getElementById("need-login").remove();
                loadUserInfo(() => {
                    document.getElementById("on-loading").remove();
                    bindEvents(true);
                    operationOfFiles("close-shared-file");
                    checkServer(true, 5000);
                    setInterval(() => {
                        if (document.getElementById("file-not-open-hint").style.display == "none" && !(getFileStatus("is-saved"))) {
                            showMessage("记得保存你的编辑！", 3000);
                        }
                    }, 60000);
                });
            } else {
                //未登录
                document.getElementById("on-loading").remove();
                document.getElementById("main-body").remove();
                document.getElementById("login-info").remove();
                {
                    const elements = document.getElementsByClassName('pop-content');
                    for (var i = elements.length - 1; i >= 0; i--) {
                        var element = elements[i];
                        if (element.getAttribute('type') != 'theme-selector' &&
                            element.getAttribute('type') != 'mobilephone-apk-recommend') {
                            element.parentNode.removeChild(element);
                        }
                    }
                }
                bindEvents(false);
            }
        }
    }
    xmlhttp.open("GET", "themes.json", true);
    xmlhttp.send();
}