<?php

/* 

This file is a config for the file 'process.php'. Change this if necessary.
本文件为“process.php”的配置文件。可在必要时更改它。

*/

// THESE ARE CONSTANTS
const username = "root";
const password = "";
const host = "localhost";
const database = "onlinetext";
define('encrypt-key', '123456');
define('share-code-A-part-length', 4);
define('share-code-B-part-length', 2);
define('code-resource', "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789");
define('default-file-length-limit', 20000); //null=无限制
define('default-files-count-limit', 100); //null=无限制