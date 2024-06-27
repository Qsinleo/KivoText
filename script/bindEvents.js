function bindEvents(logined) {
    //绑定事件
    loadingAnimationInPopup(false);
    {//主题切换
        document.getElementById("theme-selector-link").addEventListener("click", () => {
            openPopup("theme-selector");
        });
        {
            document.getElementById("font-selector").addEventListener("change", () => {
                setStyle();
            });

            if (getCookie("KivoText-preferFont")) {
                let validCookie = false;
                for (const each of document.getElementById("font-selector").getElementsByTagName("option")) {
                    if (each.value == getCookie("KivoText-preferFont")) validCookie = true;
                }
                if (validCookie) {
                    document.getElementById("font-selector").value = getCookie("KivoText-preferFont");
                } else {
                    showMessage("无效的本地偏爱字体设置。已为你恢复默认设置。");
                }
            }
        }

        {
            document.getElementById("theme-selector").innerHTML = "";
            let validCookie = false;
            for (const each of themes) {
                const optionEle = document.createElement("option");
                optionEle.value = each.label;
                optionEle.innerText = each.name;
                document.getElementById("theme-selector").appendChild(optionEle);
                if (getCookie("KivoText-preferTheme")) {
                    if (each.label == getCookie("KivoText-preferTheme")) {
                        validCookie = true;
                        optionEle.selected = "selected";
                    }
                }
            }

            if (getCookie("KivoText-preferTheme")) {
                if (validCookie) {
                    document.cookie = "KivoText-preferTheme=" + getCookie("KivoText-preferTheme") + "; max-age=" + (86400 * 7);
                } else {
                    showMessage("无效的本地偏爱主题设置。已为你恢复默认设置。");
                    document.getElementById("theme-selector").value = document.getElementById("theme-selector").firstElementChild.value;
                }
            } else {
                document.getElementById("theme-selector").value = document.getElementById("theme-selector").firstElementChild.value;
            }
            document.getElementById("theme-selector").addEventListener("change", () => {
                setStyle();
            });
        }

        setStyle();

        document.getElementById("download-apk-link").addEventListener("click", () => {
            openPopup("mobilephone-apk-recommend");
        });

        document.getElementById("no-ask-download-apk-again").addEventListener("change", () => {
            if (document.getElementById("no-ask-download-apk-again").checked) {
                document.cookie = "KivoText-recommendedAPK=true; max-age=" + (86400 * 7);
            } else {
                document.cookie = "KivoText-recommendedAPK=false; max-age=" + (86400 * 7);
            }
        });
    }

    document.getElementById("close-hint").addEventListener("click", () => {
        document.getElementById("popup-border").style.display = "none";
        document.getElementById("popup-shader").style.display = "none";
    })
    if (logined) {
        document.getElementById("login-info").addEventListener("mouseenter", () => {
            fade(document.getElementById("login-info-menu"), true, 30, true);
        });

        document.getElementById("login-info").addEventListener("mouseleave", () => {
            fade(document.getElementById("login-info-menu"), false, 30, true);
        });

        function verify(type) {
            if (type == "password") {
                const origin = document.getElementById("change-password-panel");
                if (origin.getElementsByTagName("input")[1].value.length < 6) {
                    origin.getElementsByClassName("red-text")[1].innerText = "密码长度不能少于6！"
                    passed = false;
                } else {
                    origin.getElementsByClassName("red")[1].innerText = "";
                }
                if (origin.getElementsByTagName("input")[2].value.length < 6) {
                    origin.getElementsByClassName("red-text")[2].innerText = "密码长度不能少于6！"
                    passed = false;
                } else {
                    if (origin.getElementsByTagName("input")[2].value != origin.getElementsByTagName("input")[1].value) {
                        origin.getElementsByClassName("red-text")[2].innerText = "密码不相符！"
                        passed = false;
                    } else {
                        origin.getElementsByClassName("red-text")[2].innerText = "";
                    }
                }
                return passed;
            } else {
                const origin = document.getElementById("change-username-panel");
                if (!/^[0-9a-zA-Z]*$/.test(origin.getElementsByTagName("input")[0].value)) {
                    origin.getElementsByClassName("red-text")[0].innerText = "用户名只能是大小写字母和数字！";
                    return false;
                } else {
                    if (origin.getElementsByTagName("input")[0].value.length < 6) {
                        origin.getElementsByClassName("red-text")[0].innerText = "用户名长度不能少于6！";
                        return false;
                    } else {
                        origin.getElementsByClassName("red-text")[0].innerText = "";
                        return true;
                    }
                }
            }
        }

        document.getElementById("open-shared-file-link").addEventListener("click", () => {
            openPopup("open-shared-file");
        });

        document.getElementById("logout-link").addEventListener("click", () => {
            if (confirm("确定要退出登录吗？")) {
                logoutAndReload();
            }
        });
        document.getElementById("more-account-settings-link").addEventListener("click", () => {
            openPopup("more-account-settings");
        });
        document.getElementById("delete-account-link").addEventListener("click", () => {
            let secondCheckPassword = Math.floor(Math.random() * 8999 + 1000);
            if (prompt("你确定吗？所有文件和数据都将丢失。如果确定，请输入验证码：" + secondCheckPassword.toString()) == secondCheckPassword) {
                loadingAnimationInPopup(true);
                sendRequest("type=delete-account", (response) => {
                    alert("账号已注销。感谢你的使用，期待下次再见。按下确定键重启页面。");
                    location.reload();
                }, false);
            }
        });
        document.getElementById("change-password-panel").nextElementSibling.getElementsByTagName("button")[0].addEventListener("click", () => {
            if (verify("password")) {
                loadingAnimationInPopup(true);
                sendRequest("type=change-password&oldpasswordENC=" + sha1(document.getElementById("change-password-panel").getElementsByTagName("input")[0].value) + "&newpasswordENC" + sha1(document.getElementById("change-password-panel").getElementsByTagName("input")[1].value), (response) => {
                    switch (response) {
                        case "changePassword.success":
                            alert("更改密码成功。请牢记。");
                            localStorage.setItem("KivoText-encpassword", sha1(document.getElementById("change-password-panel").getElementsByTagName("input")[1].value))
                            for (const each of document.getElementById("change-password-panel").getElementsByTagName("input")) {
                                each.value = "";
                            }
                            break;
                        case "changePassword.error.passwordNotSame":
                            document.getElementById("change-password-panel").getElementsByClassName("red-text")[0].innerText = "旧密码不正确！";
                        default:
                            break;
                    }
                    loadingAnimationInPopup(false);
                });
            }
        });
        document.getElementById("change-username-panel").getElementsByTagName("button")[0].addEventListener("click", () => {
            if (verify("username")) {
                loadingAnimationInPopup(true);
                sendRequest("type=change-username&newusername=" + document.getElementById("change-username-panel").getElementsByTagName("input")[0].value, (response) => {
                    loadingAnimationInPopup(false);
                    switch (response) {
                        case "changeUserName.error.alreadyExists":
                            document.getElementById("change-username-panel").getElementsByClassName("red-text")[0].innerText = "用户名已存在！";
                            break;
                        case "changeUserName.success":
                            localStorage.setItem("KivoText-username", document.getElementById("change-username-panel").getElementsByTagName("input")[0].value);
                            for (const each of document.getElementsByClassName("user-name-label")) {
                                each.innerText = document.getElementById("change-username-panel").getElementsByTagName("input")[0].value;
                            }
                            document.getElementById("change-username-panel").getElementsByTagName("input")[0].value = "";
                            alert("更改用户名成功，请牢记。")
                            break;
                        default:
                            break;
                    }
                }, false);
            }
        });

        document.getElementById("change-username-panel").getElementsByTagName("button")[1].addEventListener("click", () => {
            document.getElementById("change-username-panel").getElementsByTagName("input")[0].value = "";
            document.getElementById("change-username-panel").getElementsByClassName("red-text")[0].innerText = "";
        });

        document.getElementById("change-password-panel").nextElementSibling.getElementsByTagName("button")[1].addEventListener("click", () => {
            for (const each of document.getElementById("change-password-panel").getElementsByTagName("input")) {
                each.value = "";
            }
            for (const each of document.getElementById("change-password-panel").getElementsByClassName("red-text")) {
                each.innerText = "";
            }
        });
        document.getElementById("file-operator").getElementsByTagName("select")[0].addEventListener("change", () => {
            document.getElementById("main-text-editor").style.fontSize = document.getElementById("file-operator").getElementsByTagName("select")[0].value + "px";
        });
        document.getElementById("create-new-file-button").addEventListener("click", () => {
            operationOfFiles("create-file");
        });
        document.getElementById("refresh-files-button").addEventListener("click", () => {
            loadUserInfo();
        });
        document.getElementById("show-user-meta-button").addEventListener("click", () => {
            openPopup("user-meta");
        });
        document.getElementById("user-UA-label").innerText = navigator.userAgent;

        document.getElementById("main-text-editor").onchange =
            document.getElementById("main-text-editor").onkeydown =
            document.getElementById("main-text-editor").onkeyup = () => {
                searchText();
                textStatic();
                if (document.getElementById("main-text-editor").value != originText) {
                    document.getElementById("file-save-status-label").innerText = "有更改未保存";
                    document.getElementById("file-save-status-label").className = "red-text";
                } else {
                    document.getElementById("file-save-status-label").innerText = "所有更改已经保存";
                    document.getElementById("file-save-status-label").className = "green-text";
                }
            };

        document.getElementById("is-auto-wrapped").addEventListener("change", () => {
            if (document.getElementById("is-auto-wrapped").checked) {
                document.getElementById("main-text-editor").style.whiteSpace = "normal";
            } else {
                document.getElementById("main-text-editor").style.whiteSpace = "nowrap";
            }
        });

        {
            function staticUploadedFilesCount() {
                let afterUploadedFiles;
                if (document.getElementById("uploaded-files-list").firstChild.nodeName != "DIV") {
                    afterUploadedFiles = parseInt(document.getElementById("total-files-label").innerText)
                } else {
                    afterUploadedFiles = parseInt(document.getElementById("total-files-label").innerText) + document.getElementById("uploaded-files-list").childElementCount;
                }
                document.getElementById("uploaded-files-total-count-label").innerText = afterUploadedFiles;
                if (afterUploadedFiles >= config.filesCountLimit && config.filesCountLimit !== null) {
                    document.getElementById("uploaded-files-total-count-label").className = "red-text";
                } else if (afterUploadedFiles >= config.filesCountLimit - 3 && config.filesCountLimit !== null) {
                    document.getElementById("uploaded-files-total-count-label").className = "yellow-text";
                } else {
                    document.getElementById("uploaded-files-total-count-label").className = "green-text";
                }
                return afterUploadedFiles;
            }

            document.getElementById("upload-files-link").addEventListener("click", () => {
                staticUploadedFilesCount();
                openPopup("upload-files");
            });

            let uploadedFiles = [];

            document.getElementById("upload-files-input").addEventListener("change", () => {
                if (document.getElementById("upload-files-input").files.length > 0) {
                    if (document.getElementById("uploaded-files-list").firstChild.nodeName != "DIV") {
                        document.getElementById("uploaded-files-list").innerHTML = "";
                    }

                    loadingAnimationInPopup(true);

                    let count = document.getElementById("uploaded-files-list").childElementCount + 1;
                    let doneOperations = 0;//已完成操作数

                    for (const eachFile of document.getElementById("upload-files-input").files) {
                        let reader = new FileReader();
                        // result 属性中将包含一个字符串以表示所读取的文件内容。
                        reader.readAsText(eachFile, "utf-8");
                        reader.onloadend = () => {
                            const uploadedFileLength = getBytes(reader.result);
                            uploadedFiles.push(reader.result);
                            let fileObj = document.createElement("div");
                            fileObj.innerHTML = "\
                                    <div><small>" + count + "</small><b>" + eachFile.name.replace(".txt", "") + "</b></div>\
                                    <button class='red delete-uploaded-file'>删除</button>" +
                                (eachFile.name.replace(".txt", "").length > config.fileNameLimitLength || (uploadedFileLength > config.fileLengthLimit && config.fileLengthLimit !== null) ? "" : "<label><input type='radio' name='rename-file-type-of-" + count + "' checked value='no-rename' />不重命名</label>") + (uploadedFileLength > config.fileLengthLimit && config.fileLengthLimit !== null ? "" : "<label><input type='radio' name='rename-file-type-of-" + count + "' " + (eachFile.name.replace(".txt", "").length > config.fileNameLimitLength ? "checked" : "")) + " value='rename-custom'/>重命名至</label><input type='text' maxlength='" + config.fileNameLimitLength + "' value='" + (uploadedFileLength > config.fileLengthLimit && config.fileLengthLimit !== null ? "' disabled" : "New File'") + "/>\
                                    <small><div class='red-text'>" + (uploadedFileLength > config.fileLengthLimit && config.fileLengthLimit !== null ? "<b>错误</b> 文件内容长度超出上限（" + uploadedFileLength + "/" + config.fileLengthLimit + "）" : "") + "</div></small>";
                            document.getElementById("uploaded-files-list").appendChild(fileObj);
                            count++;
                            doneOperations++;
                            if (doneOperations == document.getElementById("upload-files-input").files.length) {
                                for (const each of document.getElementsByClassName("delete-uploaded-file")) {
                                    each.onclick = () => {
                                        uploadedFiles.splice(parseInt(each.previousElementSibling.getElementsByTagName("small")[0].innerText) - 1, 1);
                                        each.parentElement.remove();
                                        if (document.getElementById("uploaded-files-list").childElementCount == 0) {
                                            document.getElementById("uploaded-files-list").innerHTML = "<i>没有上传的文件。</i>";
                                        } else {
                                            let count = 1;
                                            for (const each of document.getElementById("uploaded-files-list").children) {
                                                each.getElementsByTagName("small")[0].innerText = count;
                                                each.getElementsByTagName("input")[1].name = each.getElementsByTagName("input")[1].name.replace(/\d/, count);
                                                each.getElementsByTagName("input")[2].name = each.getElementsByTagName("input")[2].name.replace(/\d/, count);
                                                count++;
                                            }
                                        }
                                    }
                                }
                                loadingAnimationInPopup(false);
                                document.getElementById("upload-files-input").value = "";
                                staticUploadedFilesCount();
                            }
                        }
                    }
                }
            });

            document.getElementById("reset-uploaded-files-button").addEventListener("click", () => {
                document.getElementById("uploaded-files-list").innerHTML = "<i>没有上传的文件。</i>";
                staticUploadedFilesCount();
            });

            document.getElementById("process-uploaded-files").getElementsByTagName("button")[0].addEventListener("click", () => {
                function getValue(name) {
                    var radio = document.getElementsByName(name);
                    for (i = 0; i < radio.length; i++) {
                        if (radio[i].checked) {
                            return radio[i].value;
                        }
                    }
                }
                if (document.getElementById("uploaded-files-list").firstChild.nodeName != "DIV") {
                    alert("没有上传的文件！");
                } else {
                    // 验证上传文件
                    if (staticUploadedFilesCount() > config.filesCountLimit && config.filesCountLimit !== null) {
                        alert("文件数量超出限制，请移除（" + staticUploadedFilesCount() + "/" + config.filesCountLimit + "）。");
                        return;
                    }
                    let invalidFiles = [];
                    var count = 1;
                    for (const each of uploadedFiles) {
                        if (getBytes(each) > config.fileLengthLimit && config.fileLengthLimit !== null) {
                            invalidFiles.push(count)
                        }
                        count++;
                    }
                    if (invalidFiles.length > 0) {
                        alert("以下序号的文件长度过长，请移除：\n" + invalidFiles.join("，"))
                        return;
                    }

                    if (confirm("确定要上传这些文件吗？")) {
                        loadingAnimationInPopup(true);
                        for (const each of document.getElementById("uploaded-files-list").getElementsByTagName("button")) {
                            each.disabled = "disabled";
                        }
                        for (const each of document.getElementById("uploaded-files-list").getElementsByTagName("input")) {
                            each.disabled = "disabled";
                        }
                        let doneOperations = 0;
                        for (const each of document.getElementById("uploaded-files-list").children) {
                            let fileName;
                            if (getValue("rename-file-type-of-" + each.getElementsByTagName("small")[0].innerText) == "rename-custom") {
                                fileName = each.querySelector("input[type=text]").value;
                            } else {
                                fileName = each.getElementsByTagName("b")[0].innerText;
                            }
                            sendRequest("type=upload-file&filename=" + encodeURIComponent(fileName) + "&filecontent=" + encodeURIComponent(uploadedFiles[parseInt(each.getElementsByTagName("small")[0].innerText) - 1]), (response) => {
                                doneOperations++;
                                if (doneOperations == document.getElementById("uploaded-files-list").childElementCount) {
                                    loadUserInfo(() => {
                                        loadingAnimationInPopup(false);
                                        document.getElementById("reset-uploaded-files-button").click();//重置上传文件列表
                                    })
                                }
                            }, false);
                        }
                    }
                }
            });
        }

        {
            var count = 0;
            for (const each of document.getElementById("file-track-labels").children) {
                let tempcount = count;
                each.addEventListener("click", () => {
                    if (each.style.backgroundColor == "var(--highlight)") {
                        each.style.backgroundColor = "var(--light-blue)";
                        each.style.width = "initial";
                        document.getElementById("file-track-contents").children[tempcount].style.display = "none";
                    } else {
                        for (const item of document.getElementById("file-track-labels").children) {
                            item.style.backgroundColor = "var(--light-blue)";
                            item.style.width = "initial";
                        }
                        each.style.backgroundColor = "var(--highlight)";
                        each.style.width = "120px";
                        for (const item of document.getElementById("file-track-contents").children) {
                            item.style.display = "none";
                        }
                        document.getElementById("file-track-contents").children[tempcount].style.display = "block";
                    }
                });
                count++;
            }
        }//操作面板处理


        {
            document.getElementById("search-text-input").addEventListener("keyup", () => {
                searchText();
            });

            document.getElementById("replace-text-button").addEventListener("click", () => {
                if (!searchText()[0]) {
                    alert("未找到文本，无法替换！")
                } else {
                    if (confirm("确定替换文本吗？")) {
                        document.getElementById("file-save-status-label").innerText = "有更改未保存";
                        document.getElementById("file-save-status-label").className = "red-text";
                        document.getElementById("main-text-editor").value = document.getElementById("main-text-editor").value.replace(searchText()[1], document.getElementById("replace-text-input").value);
                        textStatic();
                        searchText();
                    }
                }
            });
            document.getElementById("search-no-sense-of-capitialize").addEventListener("change", () => {
                searchText();
            })
        }//查找替换

        {
            document.getElementById("shared-rule-link").addEventListener("click", () => {
                openPopup("shared-rule");
            });

            document.getElementById("switch-share-status-button").addEventListener("click", () => {
                loadingAnimation(true);
                sendRequest("type=change-shared-status&method=" + (document.getElementById("shared-status").className == "green" ? "off" : "on") + "&fileid=" + document.getElementById("file-info").getElementsByTagName("span")[1].innerText, (response1) => {
                    loadUserInfo(() => {
                        loadFileMeta(() => {
                            showMessage("切换共享状态成功！");
                        })
                    });
                }, false);
            });
            document.getElementById("copy-share-code-button").addEventListener("click", () => {
                navigator.clipboard.writeText(document.getElementById("share-code-label").innerText).then(() => {
                    showMessage("成功复制共享码到剪贴板！");
                })
            });
            document.getElementById("refresh-share-info-button").addEventListener("click", () => {
                loadingAnimation(true);
                sendRequest("type=read-file&fileid=" + document.getElementById("file-info").getElementsByTagName("span")[1].innerText, (response1) => {
                    loadUserInfo(() => {
                        loadFileMeta(() => {
                            showMessage("刷新共享状态成功！");
                        })
                    });
                }, true);
            });
            document.getElementById("read-list-time-filter").addEventListener("change", () => {
                loadFileMeta()
            })
        }//共享状态切换

        {
            obj.init("share-verify-code-canvas", document.getElementById("share-verify-code-input"));
            document.getElementById("read-shared-file-button").addEventListener("click", () => {
                operationOfFiles("open-shared-file", null);     //无需文件ID
            });
            document.getElementById("share-code-input").addEventListener("focus", () => {
                document.getElementById("request-shared-file-status-label").innerText = "等待共享码";
                document.getElementById("request-shared-file-status-label").className = "";
            });
            document.getElementById("share-code-input").placeholder = "长度为" + config.shareCodeLength + "，不区分大小写";
            document.getElementById("close-shared-file-button").addEventListener("click", () => {
                operationOfFiles("close-shared-file", null);
            });
            document.getElementById("copy-shared-file-button").addEventListener("click", () => {
                navigator.clipboard.writeText(document.getElementById("shared-file-text-editor").value).then(() => {
                    showMessage("复制文件内容成功！");
                });
            });
            document.getElementById("download-shared-file-button").addEventListener("click", () => {
                operationOfFiles("download-shared-file", null);
            });
            document.getElementById("resave-shared-file-button").addEventListener("click", () => {
                operationOfFiles("resave-shared-file", null);
            });
            document.getElementById("shared-file-operator").getElementsByTagName("select")[0].addEventListener("change", () => {
                document.getElementById("shared-file-text-editor").style.fontSize = document.getElementById("shared-file-operator").getElementsByTagName("select")[0].value + "px";
            });
        }//共享界面

        {
            function selectFileObjectCreator(func) {
                for (const each of document.getElementsByClassName("file-select-checkbox")) {
                    func(each);
                }
                displaySelectInfo();
            }

            function getAllSelctedID() {
                let result = [];
                for (const each of document.getElementsByClassName("file-label")) {
                    if (each.getElementsByClassName("file-select-checkbox")[0].checked) {
                        result.push(each.dataset.fileid)
                    }
                }
                return result;
            }
            document.getElementById("select-all-file-button").addEventListener("click", () => {
                selectFileObjectCreator((each) => {
                    each.checked = "checked";
                });
            });

            document.getElementById("unselect-all-file-button").addEventListener("click", () => {
                selectFileObjectCreator((each) => {
                    each.checked = "";
                });
            });

            document.getElementById("reversedly-select-all-file-button").addEventListener("click", () => {
                selectFileObjectCreator((each) => {
                    if (each.checked) {
                        each.checked = "";
                    } else {
                        each.checked = "checked";
                    }
                });
            });

            document.getElementById("rename-file-button").addEventListener("click", () => {
                if (getAllSelctedID()) {
                    for (const each of getAllSelctedID()) {
                        operationOfFiles("rename-file", each);
                    }
                }
            });

            document.getElementById("download-file-button").addEventListener("click", () => {
                if (getAllSelctedID().length > 1 && document.getElementById("multi-operation-no-ask-again").checked) {
                    if (confirm("确认要下载选中的文件吗？")) {
                        for (const each of getAllSelctedID()) {
                            operationOfFiles("download-file", each);
                        }
                    }

                } else if (getAllSelctedID()) {
                    for (const each of getAllSelctedID()) {
                        operationOfFiles("download-file", each);
                    }
                }
            });

            document.getElementById("copy-file-button").addEventListener("click", () => {
                if (getAllSelctedID()) {
                    if (config.filesCountLimit === null || getAllSelctedID() + parseInt(document.getElementById("total-files-label")) <= config.filesCountLimit) {
                        for (const each of getAllSelctedID()) {
                            operationOfFiles("copy-file", each);
                        }
                        showMessage("另存为文件成功");
                    } else {
                        showMessage("另存为文件失败：文件数量超出限制！");
                    }
                }
            });

            document.getElementById("delete-file-button").addEventListener("click", () => {
                if (config.deleteFileAble == 0) {
                    showMessage("删除失败：你没有删除文件的权限！");
                } else {
                    if (getAllSelctedID().length > 1 && document.getElementById("multi-operation-no-ask-again").checked) {
                        if (confirm("确认要删除选中的文件吗？")) {
                            for (const each of getAllSelctedID()) {
                                operationOfFiles("delete-file-force", each);
                            }
                            showMessage("删除文件成功");
                        }
                    } else if (getAllSelctedID()) {
                        for (const each of getAllSelctedID()) {
                            operationOfFiles("delete-file", each);
                        }
                    }
                }
            });
        }//文件操作

        {
            document.getElementById("search-file-button").addEventListener("click", () => {
                let matchCount = document.getElementsByClassName("file-label").length;
                for (const iterator of document.getElementsByClassName("file-label")) {
                    iterator.style.display = "";
                }
                for (const iterator of document.getElementsByClassName("file-label")) {
                    function test(obj) {
                        if (!obj && iterator.style.display != "none") {
                            matchCount--;
                            iterator.style.display = "none";
                        }
                    }

                    test((document.getElementById("search-file-name-input").value == "") || ((
                        document.getElementById("search-file-name-method").value == "include" && iterator.getElementsByClassName("file-name")[0].innerText.indexOf(document.getElementById("search-file-name-input").value) != -1
                    ) || (
                            document.getElementById("search-file-name-method").value == "equal" && iterator.getElementsByClassName("file-name")[0].innerText == document.getElementById("search-file-name-input").value
                        ) || (
                            document.getElementById("search-file-name-method").value == "exclude" && iterator.getElementsByClassName("file-name")[0].innerText.indexOf(document.getElementById("search-file-name-input").value) == -1
                        ))
                    );
                    test(document.getElementById("search-file-size-select").value == "no-limit" ||
                        (document.getElementById("search-file-size-select").value == "empty" && iterator.dataset.filesize == 0) ||
                        (document.getElementById("search-file-size-select").value == "1000-" && iterator.dataset.filesize > 0 && iterator.dataset.filesize <= 1000) ||
                        (document.getElementById("search-file-size-select").value == "1000+" && iterator.dataset.filesize >= 1000)
                    );
                }
                if (document.getElementById("search-file-name-input").value || document.getElementById("search-file-size-select").value != "no-limit") {
                    document.getElementById("search-result-label").innerText = `筛选共${matchCount}个`;
                }
            });
        }//搜索文件
    }
}//绑定事件
