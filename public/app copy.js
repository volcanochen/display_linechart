class DataDisplay {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.margin = 50;
        this.xAxisLength = this.canvas.width - this.margin * 2;
        this.yAxisLength = this.canvas.height - this.margin * 2;
    }

    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
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
    }

    drawData(dataArray, timeInterval) {
        if (!dataArray || dataArray.length === 0) return;

        const maxValue = Math.max(...dataArray);
        const totalTime = dataArray.length * timeInterval;
        
        this.ctx.beginPath();
        this.ctx.strokeStyle = '#2196F3';
        this.ctx.lineWidth = 2;

        dataArray.forEach((value, index) => {
            const x = this.margin + (index * timeInterval / totalTime) * this.xAxisLength;
            const y = this.canvas.height - this.margin - (value / maxValue) * this.yAxisLength;
            
            if (index === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
        });

        this.ctx.stroke();
    }
}

// 测试功能
function testDisplay() {
    const display = new DataDisplay('displayCanvas');
    display.clear();
    display.drawAxis();
    
    // 生成随机测试数据（10个点，时间间隔0.5秒）
    const testData = Array.from({length: 10}, () => Math.random() * 100);
    display.drawData(testData, 0.5);
}