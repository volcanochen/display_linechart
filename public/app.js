class DataDisplay {
    constructor(canvasId) {
        // 确保保留clear方法
        this.clear = function() {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        };
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.margin = 50;
        this.xAxisLength = this.canvas.width - this.margin * 2;
        this.yAxisLength = this.canvas.height - this.margin * 2;
        this.currentTimeOffset = 0;  // 新增时间偏移量
        this.playSpeed = 1;        // 播放速度（像素/秒）
        this.isPlaying = false;
        this.animationFrameId = null;
        this.totalTime = null;
        this.getDataFunction = null; // 新增：用于存储数据获取函数
        this.dataArray = null;
        this.interval = null; //数据的间隔时间
    }

    setTotalTime(totalTime) {
        this.totalTime = totalTime;
    }
     // 新增 setspeed 方法
    setspeed(speed) {
        this.playSpeed = speed;
    }

    // 确保保留clear方法
    startPlay() {
        if (!this.isPlaying) {
            this.isPlaying = true;
            const animate = () => {
                this.currentTimeOffset += this.playSpeed * 0.02;
                this.clear();
                this.drawAxis();
                this.drawData();
                this.animationFrameId = requestAnimationFrame(animate);
            };
            animate();
        }
    }

    stopPlay() {
        this.isPlaying = false;
        cancelAnimationFrame(this.animationFrameId);
    }

    togglePlay() {
        if (this.isPlaying) {
            this.stopPlay();
        } else {
            this.startPlay();
        }
    }
    
    drawData() {
        if (!this.getDataFunction) {console.warn("not set data"); return; } // 如果未注册数据获取函数，直接返回


        if (!this.lastData ) {
            [this.dataArray, this.interval ]= this.getDataFunction();
            if (!this.dataArray || this.dataArray.length === 0) {
                console.warn("no data");
                return;
            }
            this.lastData = this.dataArray;
            this.lastInterval = this.interval;
        }
        
        const maxValue = Math.max(...this.dataArray);
        const totalTime = this.totalTime !== null ? this.totalTime : this.dataArray.length * this.interval;
        const visibleDuration = (this.xAxisLength / (this.canvas.width - this.margin * 2)) * totalTime; // 可见区域时间长度


            // 检查是否需要获取新数据
        const lastVisibleTime = this.currentTimeOffset + visibleDuration;
        const lastDataTime = this.dataArray.length * this.interval;
        if (lastVisibleTime >= lastDataTime * 0.8) { // 当可见区域接近数据末尾的 80% 时获取新数据
            const [newData, newInterval] = this.getDataFunction();
            if (newData && newData.length > 0) {
                this.dataArray = this.dataArray.concat(newData);
                this.lastData = this.dataArray;
                this.lastInterval = newInterval;
            }
        }


        const points = [];
        this.ctx.beginPath();
        let isFirstValidPoint = true;
        // 修改后的坐标计算逻辑
        this.dataArray.forEach((value, index) => {
            const timePosition = (index * this.interval) - this.currentTimeOffset;
            const x = this.margin + (timePosition / visibleDuration) * this.xAxisLength;
            const y = this.canvas.height - this.margin - (value / maxValue) * this.yAxisLength;
            
        // 判断点是否在有效范围内
        if (x >= this.margin && x <= this.canvas.width - this.margin) {
            if (isFirstValidPoint) {
                this.ctx.moveTo(x, y);
                isFirstValidPoint = false;
            } else {
                this.ctx.lineTo(x, y);
            }
            points.push({x, y});
        } else {
            // 如果点不在有效范围内，重置路径起点
            isFirstValidPoint = true;
        }
            
        });
       this.ctx.strokeStyle = '#2196F3'; // 设置连线颜色
        this.ctx.stroke(); // 先绘制完整连线
        // 后绘制数据点
        // points.forEach(point => {
        //     if (point.x >= this.margin && point.x <= this.canvas.width - this.margin) {
        //         this.ctx.beginPath();
        //         this.ctx.arc(point.x, point.y, 3, 0, Math.PI * 2);
        //         this.ctx.fillStyle = '#2196F3';
        //         this.ctx.fill();
        //     }
        // });

    }

    drawAxis() {
        // 绘制坐标轴
        this.ctx.beginPath();
        // Y轴
        this.ctx.moveTo(this.margin, this.margin);
        this.ctx.lineTo(this.margin, this.canvas.height - this.margin);
        // X轴
        this.ctx.moveTo(this.margin, this.canvas.height - this.margin);
        this.ctx.lineTo(this.canvas.width - this.margin, this.canvas.height - this.margin);
        this.ctx.strokeStyle = '#333';
        this.ctx.stroke();

        // 添加坐标轴标签
        this.ctx.fillStyle = 'black';
        this.ctx.font = '14px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('时间 (s)', this.canvas.width/2, this.canvas.height - 10);
        this.ctx.save();
        this.ctx.translate(20, this.canvas.height/2);
        this.ctx.rotate(-Math.PI/2);
        this.ctx.fillText('数值', 0, 0);
        this.ctx.restore();
        

        // 修改后的时间刻度绘制逻辑
        const totalTime = this.totalTime !== null ? this.totalTime : (this.lastData?.length * this.lastInterval || 1);
        const visibleDuration = (this.xAxisLength / (this.canvas.width - this.margin * 2)) * totalTime;
        for (let t = 0; t <= totalTime; t += totalTime / 5) {
            const x = this.margin + (t / totalTime) * this.xAxisLength;
            this.ctx.fillText(`${t.toFixed(1)}s`, x, this.canvas.height - this.margin + 20);
        }
    }

    // 新增：注册数据获取函数的方法
    registerDataFunction(getDataFunction) {
        this.getDataFunction = getDataFunction;
    }
}

// 修改测试功能
// 在文件末尾的testDisplay函数中添加初始化
function testDisplay() {
    window.display = new DataDisplay('displayCanvas');
    display.clear();
    
    // 初始化总时间控件
    const timeSlider = document.getElementById('totalTimeSlider');
    const timeValueSpan = document.getElementById('totalTimeValue');
    window.updateTotalTime = function(value) {
        if (display) {
            const time = parseInt(value);
            display.setTotalTime(time);
            timeValueSpan.textContent = `${time} s`;
        }
    }
    display.setTotalTime(parseInt(timeSlider.value)); // 应用初始值
    
    display.playSpeed = 0.3;
    
    // 生成更长的时间序列测试数据
    const testData = Array.from({length: 30}, () => Math.random() * 100);

   // 定义显式函数
   function getData() {
        console.log('getData 函数被调用，返回数据:', testData);
        // 创建带时间戳的日志条目
        const logEntry = document.createElement('div');
        logEntry.style.padding = '5px';
        logEntry.style.margin = '3px 0';
        logEntry.style.background = '#f5f5f5';
        logEntry.style.borderRadius = '3px';
        
        const timestamp = new Date().toLocaleTimeString();
        logEntry.innerHTML = `
            <span style="color: #2196F3;">[${timestamp}]</span>
            获取数据：长度=${testData.length} 
            间隔=0.05s
        `;

        const logContainer = document.getElementById('dataLog');
        // 添加新日志到顶部
        logContainer.insertBefore(logEntry, logContainer.children[1]);
        
        // 保持最多20条日志
        while(logContainer.children.length > 21) {
            logContainer.removeChild(logContainer.lastChild);
        }
        
        console.log('getData 函数被调用，返回数据:', testData);
        return [testData, 0.05];
    }
    // 注册数据获取函数
    display.registerDataFunction(getData);

    display.setTotalTime(1);
    display.drawData( );
    display.startPlay(); // 自动开始播放
    // 修改函数定义为全局函数
    window.updateSpeed = function(value) {
        if (display) {
            display.setspeed(parseFloat(value)*0.2);
            document.getElementById('speedValue').textContent = `${value}x`;
        }
    }
}