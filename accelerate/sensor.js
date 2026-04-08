class SensorController {
    constructor(game, onMove) {
        this.game = game;
        this.onMove = onMove;
        this.threshold = 8; // 加速度阈值（摇一摇力度）
        this.lastMoveTime = 0;
        this.moveCooldown = 500; // 冷却时间（毫秒）
        this.isListening = false;
        this.hasPermission = false;
    }

    async requestPermission() {
        try {
            // 检查浏览器是否支持 DeviceMotionEvent
            if (typeof DeviceMotionEvent === 'undefined') {
                alert('您的浏览器不支持运动传感器');
                return false;
            }

            // iOS 13+ 需要用户授权
            if (typeof DeviceMotionEvent.requestPermission === 'function') {
                try {
                    const permissionState = await DeviceMotionEvent.requestPermission();
                    if (permissionState === 'granted') {
                        this.setupListeners();
                        return true;
                    } else {
                        alert('请在设置中允许访问运动数据');
                        return false;
                    }
                } catch (permError) {
                    alert('权限请求失败，请重试');
                    return false;
                }
            } else {
                // Android 和其他浏览器 - 直接添加监听器
                this.setupListeners();
                return true;
            }
        } catch (error) {
            alert('传感器初始化失败');
            return false;
        }
    }

    setupListeners() {
        // 添加加速度传感器监听
        window.addEventListener('devicemotion', (event) => {
            this.handleMotion(event);
        });
        
        // 添加设备方向监听（备选方案）
        window.addEventListener('deviceorientation', (event) => {
            this.handleOrientation(event);
        });
        
        this.hasPermission = true;
        this.isListening = true;
    }

    startListening() {
        // 注意：此方法已被废弃，请使用 requestPermission()
        console.warn('请使用 requestPermission() 方法代替');
        return this.isListening;
    }

    handleOrientation(event) {
        // 使用设备方向数据作为备选方案
        if (event.beta === null || event.gamma === null) return;

        const currentTime = Date.now();
        if (currentTime - this.lastMoveTime < this.moveCooldown) return;

        // beta: 前后倾斜 (-180 到 180)
        // gamma: 左右倾斜 (-90 到 90)
        const beta = event.beta;
        const gamma = event.gamma;

        // 使用更大的角度阈值（需要明显倾斜）
        const angleThreshold = 25;

        let direction = null;

        if (Math.abs(gamma) > Math.abs(beta)) {
            // 左右倾斜为主
            if (gamma > angleThreshold) {
                direction = 'right';
            } else if (gamma < -angleThreshold) {
                direction = 'left';
            }
        } else {
            // 前后倾斜为主
            if (beta > angleThreshold) {
                direction = 'down';
            } else if (beta < -angleThreshold) {
                direction = 'up';
            }
        }

        if (direction) {
            this.lastMoveTime = currentTime;
            this.onMove(direction);

            if (navigator.vibrate) {
                navigator.vibrate(50);
            }
        }
    }

    handleMotion(event) {
        const acceleration = event.accelerationIncludingGravity;
        
        if (!acceleration) return;

        const currentTime = Date.now();
        if (currentTime - this.lastMoveTime < this.moveCooldown) return;

        const { x, y, z } = acceleration;

        // 计算总加速度（排除重力影响）
        // 静止时加速度约为 9.8 m/s²（重力）
        const totalAccel = Math.sqrt(x * x + y * y + z * z);
        const netAccel = Math.abs(totalAccel - 9.8);

        // 只有当净加速度超过阈值时才触发
        if (netAccel < this.threshold) return;

        // 判断主要移动方向
        let direction = null;

        if (Math.abs(x) > Math.abs(y)) {
            // 水平摇动
            if (x > this.threshold) {
                direction = 'left';
            } else if (x < -this.threshold) {
                direction = 'right';
            }
        } else {
            // 垂直摇动
            if (y > this.threshold) {
                direction = 'down';
            } else if (y < -this.threshold) {
                direction = 'up';
            }
        }

        if (direction) {
            this.lastMoveTime = currentTime;
            this.onMove(direction);
            
            if (navigator.vibrate) {
                navigator.vibrate(50);
            }
        }
    }

    stopListening() {
        this.isListening = false;
        // 注意：devicemotion 事件无法移除监听器，这里只是标记状态
    }

    setThreshold(value) {
        this.threshold = Math.max(0.5, Math.min(3, value));
    }
}
