function randomNum(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}
function randomColor(min, max) {
    var a = randomNum(min, max);
    var b = randomNum(min, max);
    var c = randomNum(min, max);
    return 'rgb(' + a + ',' + b + ',' + c + ')';
}
function numArr() {
    return "0,1,2,3,4,5,6,7,8,9".split(',');
}
function letterArr() {
    return "a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,y,z".split(',');
}
var obj = {
    el: null,
    init: function (options, element) {
        this.el = element;
        this.GVerify(options);
        this.initCanvas(options);
        this.refresh();
    },
    //处理参数
    GVerify: function (options) {
        this.options = { //默认options参数值
            id: "", //容器Id
            canvasId: "verifyPic", //canvas的ID
            width: "120", //默认canvas宽度
            height: "50", //默认canvas高度
            type: "blend", //图形验证码默认类型blend:数字字母混合类型、number:纯数字、letter:纯字母
            code: ""
        }
        //判断传入的参数
        if (Object.prototype.toString.call(options) == '[object Object]') {
            for (var i in options) {
                this.options[i] = options[i];
            }
        } else {
            this.options.id = options;
        }
    },
    initCanvas: function (element) {
        var canvas = document.createElement('canvas');
        var parent = document.getElementById(element);
        canvas.id = this.options.canvasId;
        canvas.width = this.options.width;
        canvas.height = this.options.height;
        canvas.style.cursor = "pointer";
        canvas.onclick = () => {
            this.refresh();
        }
        parent.appendChild(canvas);
    },
    refresh: function () {
        var self = this;
        self.options.code = '';
        self.el.value = '';
        var canvas = document.getElementById(self.options.canvasId);
        if (canvas.getContext) {
            var ctx = canvas.getContext('2d');
            var ctxText;
            ctx.clearRect(0, 0, self.options.width, self.options.height);
            //1.画图片
            ctx.fillStyle = randomColor(180, 240);
            ctx.fillRect(0, 0, self.options.width, self.options.height);
            ctx.textBaseline = 'middle';
            //2.画数字
            if (self.options.type == 'blend') {
                ctxText = numArr().concat(letterArr());
            } else if (self.options.type == 'number') {
                ctxText = numArr();
            } else {
                ctxText = letterArr();
            }
            for (var i = 1; i <= 4; ++i) {
                var num = ctxText[randomNum(0, ctxText.length - 1)];
                var x = self.options.width / 5 * i;
                var y = self.options.height / 2;
                var deg = randomNum(-30, 30);
                ctx.font = randomNum(self.options.height / 2, self.options.height) + 'px SimHei';
                ctx.fillStyle = randomColor(50, 160);
                ctx.shadowBlur = randomNum(-3, 3);
                ctx.shadowColor = 'rgba(0,0,0,0.3)';
                ctx.translate(x, y);
                ctx.rotate(deg * Math.PI / 180);
                ctx.fillText(num, 0, 0);
                self.options.code += num;
                ctx.rotate(-deg * Math.PI / 180);
                ctx.translate(-x, -y);
            }
            //3.画干扰线
            for (i = 0; i < 4; ++i) {
                var self = this;
                ctx.strokeStyle = randomColor(40, 180);
                ctx.beginPath();
                ctx.moveTo(randomNum(0, self.options.width / 2), randomNum(0, self.options.height / 2));
                ctx.lineTo(randomNum(0, self.options.width / 2), randomNum(0, self.options.height));
                ctx.stroke();
            }
            //4.画干扰点
            for (i = 0; i < this.options.width / 4; ++i) {
                var self = this;
                ctx.fillStyle = randomColor(0, 255);
                ctx.beginPath();
                ctx.arc(randomNum(0, self.options.width), randomNum(0, self.options.height), 1, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    },
    //判断输入的值与验证码的值是否一致
    judge: function () {
        var code = this.el.value.toLowerCase();
        var options = this.options.code.toLowerCase();
        if (code == options) {
            return true;
        } else {
            return false;
        }
    }
}
