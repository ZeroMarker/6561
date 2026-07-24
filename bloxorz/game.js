class Bloxorz {
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(
            45,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(0x1a1a1a);
        this.renderer.shadowMap.enabled = true;
        document.getElementById('game-container').appendChild(this.renderer.domElement);

        this.currentLevel = 0;
        this.moves = 0;
        this.block = null;
        this.tiles = [];
        this.isMoving = false;
        this.gameState = 'playing';

        // Block state: pos: {x, y}, state: 'vertical' | 'horizontal_x' | 'horizontal_y'
        this.blockData = {
            pos: { x: 0, y: 0 },
            state: 'vertical'
        };

        this.initLights();
        this.initLevel(this.currentLevel);
        this.setupControls();
        this.animate();

        window.addEventListener('resize', () => this.onWindowResize());
    }

    initLights() {
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 20, 10);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 1024;
        directionalLight.shadow.mapSize.height = 1024;
        this.scene.add(directionalLight);
    }

    initLevel(levelIndex) {
        // Clear old level
        if (this.block) this.scene.remove(this.block);
        this.tiles.forEach((tile) => this.scene.remove(tile));
        this.tiles = [];

        const level = LEVELS[levelIndex];
        this.blockData.pos = { ...level.start };
        this.blockData.state = 'vertical';
        this.moves = 0;
        this.updateUI();

        // Create Grid
        const tileGeometry = new THREE.BoxGeometry(0.95, 0.2, 0.95);
        const tileMaterial = new THREE.MeshPhongMaterial({ color: 0x444444 });
        const targetMaterial = new THREE.MeshPhongMaterial({
            color: 0xff0000,
            transparent: true,
            opacity: 0.5
        });

        for (let y = 0; y < level.grid.length; y++) {
            for (let x = 0; x < level.grid[y].length; x++) {
                if (level.grid[y][x] > 0) {
                    const material = level.grid[y][x] === 2 ? targetMaterial : tileMaterial;
                    const tile = new THREE.Mesh(tileGeometry, material);
                    tile.position.set(x, -0.1, y);
                    tile.receiveShadow = true;
                    this.scene.add(tile);
                    this.tiles.push(tile);
                }
            }
        }

        // Create Block
        const blockGeometry = new THREE.BoxGeometry(1, 2, 1);
        const blockMaterial = new THREE.MeshPhongMaterial({ color: 0xcccccc });
        this.block = new THREE.Mesh(blockGeometry, blockMaterial);
        this.block.castShadow = true;
        this.updateBlockPosition();
        this.scene.add(this.block);

        // Center camera
        this.camera.position.set(level.grid[0].length / 2, 8, level.grid.length + 5);
        this.camera.lookAt(level.grid[0].length / 2, 0, level.grid.length / 2);
    }

    updateBlockPosition() {
        const { x, y } = this.blockData.pos;
        if (this.blockData.state === 'vertical') {
            this.block.scale.set(1, 1, 1);
            this.block.rotation.set(0, 0, 0);
            this.block.position.set(x, 1, y);
        } else if (this.blockData.state === 'horizontal_x') {
            this.block.scale.set(1, 1, 1);
            this.block.rotation.set(0, 0, Math.PI / 2);
            this.block.position.set(x + 0.5, 0.5, y);
        } else if (this.blockData.state === 'horizontal_y') {
            this.block.scale.set(1, 1, 1);
            this.block.rotation.set(Math.PI / 2, 0, 0);
            this.block.position.set(x, 0.5, y + 0.5);
        }
    }

    move(direction) {
        if (this.isMoving || this.gameState !== 'playing') return;

        const prevPos = { ...this.blockData.pos };
        const prevState = this.blockData.state;
        let nextPos = { ...this.blockData.pos };
        let nextState = this.blockData.state;

        // Calculate next state and position
        if (direction === 'up') {
            if (prevState === 'vertical') {
                nextPos.y -= 2;
                nextState = 'horizontal_y';
            } else if (prevState === 'horizontal_x') {
                nextPos.y -= 1;
            } else if (prevState === 'horizontal_y') {
                nextPos.y -= 1;
                nextState = 'vertical';
            }
        } else if (direction === 'down') {
            if (prevState === 'vertical') {
                nextPos.y += 1;
                nextState = 'horizontal_y';
            } else if (prevState === 'horizontal_x') {
                nextPos.y += 1;
            } else if (prevState === 'horizontal_y') {
                nextPos.y += 2;
                nextState = 'vertical';
            }
        } else if (direction === 'left') {
            if (prevState === 'vertical') {
                nextPos.x -= 2;
                nextState = 'horizontal_x';
            } else if (prevState === 'horizontal_x') {
                nextPos.x -= 1;
                nextState = 'vertical';
            } else if (prevState === 'horizontal_y') {
                nextPos.x -= 1;
            }
        } else if (direction === 'right') {
            if (prevState === 'vertical') {
                nextPos.x += 1;
                nextState = 'horizontal_x';
            } else if (prevState === 'horizontal_x') {
                nextPos.x += 2;
                nextState = 'vertical';
            } else if (prevState === 'horizontal_y') {
                nextPos.x += 1;
            }
        }

        this.animateMove(direction, nextPos, nextState);
    }

    animateMove(direction, nextPos, nextState) {
        if (this.isMoving) return;
        this.isMoving = true;
        this.moves++;
        this.updateUI();

        const startPos = this.block.position.clone();
        const startQuat = this.block.quaternion.clone();

        // 1. Calculate Pivot and Axis
        let pivot = new THREE.Vector3();
        let axis = new THREE.Vector3();
        const halfH = this.blockData.state === 'vertical' ? 1 : 0.5;
        const halfW = 0.5;

        if (direction === 'right') {
            axis.set(0, 0, -1);
            const offset = this.blockData.state === 'horizontal_x' ? 1.5 : 0.5;
            pivot.set(startPos.x + offset, 0, startPos.z);
        } else if (direction === 'left') {
            axis.set(0, 0, 1);
            const offset = this.blockData.state === 'horizontal_x' ? 0.5 : 0.5;
            pivot.set(startPos.x - offset, 0, startPos.z);
        } else if (direction === 'up') {
            axis.set(-1, 0, 0);
            const offset = this.blockData.state === 'horizontal_y' ? 0.5 : 0.5;
            pivot.set(startPos.x, 0, startPos.z - offset);
        } else if (direction === 'down') {
            axis.set(1, 0, 0);
            const offset = this.blockData.state === 'horizontal_y' ? 1.5 : 0.5;
            pivot.set(startPos.x, 0, startPos.z + offset);
        }

        // 2. Animate using a proxy object for progress
        const proxy = { t: 0 };
        new TWEEN.Tween(proxy)
            .to({ t: Math.PI / 2 }, 300)
            .easing(TWEEN.Easing.Quadratic.InOut)
            .onUpdate(() => {
                // Reset to start
                this.block.position.copy(startPos);
                this.block.quaternion.copy(startQuat);

                // Rotate around pivot
                const q = new THREE.Quaternion().setFromAxisAngle(axis, proxy.t);

                // Position offset
                this.block.position.sub(pivot);
                this.block.position.applyQuaternion(q);
                this.block.position.add(pivot);

                // Rotation offset
                this.block.quaternion.premultiply(q);
            })
            .onComplete(() => {
                this.blockData.pos = nextPos;
                this.blockData.state = nextState;
                this.isMoving = false;

                // Snap to exact position to avoid floating point drift
                const finalVisualPos = this.getVisualPosition(nextPos, nextState);
                this.block.position.set(finalVisualPos.x, finalVisualPos.y, finalVisualPos.z);
                const finalVisualRot = this.getVisualRotation(nextState);
                this.block.rotation.set(finalVisualRot.x, finalVisualRot.y, finalVisualRot.z);

                this.checkGameState();
            })
            .start();
    }

    getVisualPosition(pos, state) {
        if (state === 'vertical') return { x: pos.x, y: 1, z: pos.y };
        if (state === 'horizontal_x') return { x: pos.x + 0.5, y: 0.5, z: pos.y };
        if (state === 'horizontal_y') return { x: pos.x, y: 0.5, z: pos.y + 0.5 };
    }

    getVisualRotation(state) {
        if (state === 'vertical') return { x: 0, y: 0, z: 0 };
        if (state === 'horizontal_x') return { x: 0, y: 0, z: Math.PI / 2 };
        if (state === 'horizontal_y') return { x: Math.PI / 2, y: 0, z: 0 };
    }

    checkGameState() {
        const grid = LEVELS[this.currentLevel].grid;
        const { x, y } = this.blockData.pos;
        const state = this.blockData.state;

        const isTile = (tx, ty) => {
            if (ty < 0 || ty >= grid.length || tx < 0 || tx >= grid[0].length) return 0;
            return grid[ty][tx];
        };

        let onTarget = false;
        let fallen = false;

        if (state === 'vertical') {
            const tile = isTile(x, y);
            if (tile === 0) fallen = true;
            if (tile === 2) onTarget = true;
        } else if (state === 'horizontal_x') {
            if (isTile(x, y) === 0 || isTile(x + 1, y) === 0) fallen = true;
        } else if (state === 'horizontal_y') {
            if (isTile(x, y) === 0 || isTile(x, y + 1) === 0) fallen = true;
        }

        if (onTarget) {
            this.win();
        } else if (fallen) {
            this.fail();
        }
    }

    win() {
        this.gameState = 'win';
        document.getElementById('overlay').classList.remove('hidden');
        document.getElementById('overlay-title').textContent = 'Level Complete!';
        new TWEEN.Tween(this.block.position).to({ y: -1 }, 500).start();
    }

    fail() {
        this.gameState = 'fail';
        new TWEEN.Tween(this.block.position)
            .to({ y: -5 }, 500)
            .onComplete(() => {
                this.initLevel(this.currentLevel);
                this.gameState = 'playing';
            })
            .start();
    }

    setupControls() {
        window.addEventListener('keydown', (e) => {
            switch (e.key) {
                case 'ArrowUp':
                case 'w':
                    this.move('up');
                    break;
                case 'ArrowDown':
                case 's':
                    this.move('down');
                    break;
                case 'ArrowLeft':
                case 'a':
                    this.move('left');
                    break;
                case 'ArrowRight':
                case 'd':
                    this.move('right');
                    break;
            }
        });

        document.getElementById('reset-btn').onclick = () => this.initLevel(this.currentLevel);
        document.getElementById('next-btn').onclick = () => {
            this.currentLevel = (this.currentLevel + 1) % LEVELS.length;
            this.initLevel(this.currentLevel);
            document.getElementById('overlay').classList.add('hidden');
            this.gameState = 'playing';
        };

        // Swipe controls
        let touchStart = null;
        window.addEventListener('touchstart', (e) => {
            touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        });
        window.addEventListener('touchend', (e) => {
            if (!touchStart) return;
            const touchEnd = { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY };
            const dx = touchEnd.x - touchStart.x;
            const dy = touchEnd.y - touchStart.y;
            if (Math.abs(dx) > Math.abs(dy)) {
                if (Math.abs(dx) > 30) this.move(dx > 0 ? 'right' : 'left');
            } else {
                if (Math.abs(dy) > 30) this.move(dy > 0 ? 'down' : 'up');
            }
            touchStart = null;
        });
    }

    updateUI() {
        document.getElementById('level-val').textContent = this.currentLevel + 1;
        document.getElementById('moves-val').textContent = this.moves;
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    animate(time) {
        requestAnimationFrame((t) => this.animate(t));
        TWEEN.update(time);
        this.renderer.render(this.scene, this.camera);
    }
}

new Bloxorz();
