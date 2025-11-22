class RobotArm {
    constructor(scene) {
        this.scene = scene;
        this.parts = {};
        this.joints = {};
        this.angles = {
            base: 0,
            shoulder: 0,
            elbow: 0,
            wrist: 0,
            gripper: 0.5
        };
        
        this.loader = new THREE.STLLoader();
        this.materials = {};
        this.initMaterials();
        this.init();
    }

    initMaterials() {
        this.materials = {
            metal: new THREE.MeshPhongMaterial({ 
                color: 0x888888, 
                shininess: 60,
                specular: 0x222222
            }),
            darkMetal: new THREE.MeshPhongMaterial({ 
                color: 0x555555, 
                shininess: 50 
            }),
            gripper: new THREE.MeshPhongMaterial({ 
                color: 0xCC3333, 
                shininess: 40 
            })
        };
    }

    init() {
        this.joints = {
            base: new THREE.Group(),
            shoulder: new THREE.Group(),
            elbow: new THREE.Group(),
            wrist: new THREE.Group(),
            gripper: new THREE.Group()
        };

        // Основата стои исправено на подот
        this.joints.base.position.set(0, 0, 0);
        this.scene.add(this.joints.base);
    }

    loadModels() {
        return new Promise((resolve, reject) => {
            try {
                console.log('Почнувам со вчитување на моделите...');
                
                this.loadBaseLink().then(() => {
                    return this.loadBaseLinkUpper();
                }).then(() => {
                    return this.loadArmLink1();
                }).then(() => {
                    return this.loadArmLink2();
                }).then(() => {
                    return this.loadArmLink3();
                }).then(() => {
                    return this.loadGripperComponents();
                }).then(() => {
                    console.log('Сите делови на роботската рака се вчитани успешно');
                    this.hideLoading();
                    this.resetPose();
                    resolve();
                }).catch(error => {
                    reject(error);
                });

            } catch (error) {
                console.error('Грешка при вчитување на модели:', error);
                this.showError('Грешка при вчитување на моделите: ' + error.message);
                reject(error);
            }
        });
    }

    loadBaseLink() {
        return new Promise((resolve, reject) => {
            this.loader.load('models/base_link.stl', (geometry) => {
                const mesh = new THREE.Mesh(geometry, this.materials.metal);
                mesh.position.set(0, 30, 0);
                mesh.castShadow = true;
                mesh.receiveShadow = true;
                this.joints.base.add(mesh);
                this.parts.base_link = mesh;
                console.log('Base link loaded');
                resolve(mesh);
            }, undefined, (error) => {
                console.error('Error loading base_link:', error);
                reject(error);
            });
        });
    }

    loadBaseLinkUpper() { 
        return new Promise((resolve, reject) => {
            this.loader.load('models/base_link_upper.stl', (geometry) => {
                const mesh = new THREE.Mesh(geometry, this.materials.metal);
                // ПОПРАВКА: Прстенот хоризонтално и улегнат 90 степени на десно
                mesh.position.set(0, 30, 40);  // Вратете ја позицијата на центар
            
                mesh.rotation.x = THREE.MathUtils.degToRad(-90);   // хоризонтално
                mesh.rotation.y = THREE.MathUtils.degToRad(-45);   // улегнат на десно
                mesh.rotation.z = THREE.MathUtils.degToRad(0);     // Z ориентација
                
                // позиции:
                mesh.position.x += 40;   // десно
                mesh.position.y -= 25;   // долу
                mesh.position.z += 0;    // НА КОН ТЕБЕ
                mesh.castShadow = true;
                mesh.receiveShadow = true;
                this.joints.base.add(mesh);
                this.parts.base_link_upper = mesh;
                console.log('Base link upper loaded');
                resolve(mesh);
            }, undefined, reject);
        });
    }

    loadArmLink1() {
        return new Promise((resolve, reject) => {
            this.loader.load('models/arm_link_1.stl', (geometry) => {
                const mesh = new THREE.Mesh(geometry, this.materials.darkMetal);
                
                // ПОПРАВКА: Рамото директно на врвот на основата - ПОМАЛУ ВИСОЧИНА
                this.joints.shoulder.position.set(0, 30, 0); // Намалена висина од 60 на 30
                this.joints.base.add(this.joints.shoulder);
                
                mesh.position.set(0, 0, 0);
                mesh.rotation.x = -Math.PI / 2;
                mesh.castShadow = true;
                mesh.receiveShadow = true;
                this.joints.shoulder.add(mesh);
                this.parts.arm_link_1 = mesh;
                console.log('Arm link 1 loaded');
                resolve(mesh);
            }, undefined, reject);
        });
    }
    loadArmLink2() {
        return new Promise((resolve, reject) => {
            this.loader.load('models/arm_link_2.stl', (geometry) => {
                const mesh = new THREE.Mesh(geometry, this.materials.darkMetal);
                
                // ПОПРАВКА: Лакот директно на крајот од рамото
                this.joints.elbow.position.set(0, 120, 0);
                this.joints.shoulder.add(this.joints.elbow);
                
                mesh.position.set(0, 0, 0);
                // ПОПРАВКА: Лакот вертикално ориентиран
                mesh.rotation.x = -Math.PI / 2;
                mesh.castShadow = true;
                mesh.receiveShadow = true;
                this.joints.elbow.add(mesh);
                this.parts.arm_link_2 = mesh;
                console.log('Arm link 2 loaded');
                resolve(mesh);
            }, undefined, reject);
        });
    }

    loadArmLink3() {
        return new Promise((resolve, reject) => {
            this.loader.load('models/arm_link_3.stl', (geometry) => {
                const mesh = new THREE.Mesh(geometry, this.materials.darkMetal);
                
                // ПОПРАВКА: Зглобот директно на крајот од лакот
                this.joints.wrist.position.set(0, 80, 0);
                this.joints.elbow.add(this.joints.wrist);
                
                mesh.position.set(0, 0, 0);
                // ПОПРАВКА: Зглобот вертикално ориентиран
                mesh.rotation.x = -Math.PI / 2;
                mesh.castShadow = true;
                mesh.receiveShadow = true;
                this.joints.wrist.add(mesh);
                this.parts.arm_link_3 = mesh;
                console.log('Arm link 3 loaded');
                resolve(mesh);
            }, undefined, reject);
        });
    }

    loadGripperComponents() {
        return new Promise((resolve, reject) => {
            console.log('Loading gripper components...');
            
            this.loader.load('models/gripper_base.stl', (geometry) => {
                const mesh = new THREE.Mesh(geometry, this.materials.gripper);
                
                // ПОПРАВКА: Грабнувачот директно на крајот од зглобот
                this.joints.gripper.position.set(0, 30, 0);
                this.joints.wrist.add(this.joints.gripper);
                
                mesh.position.set(0, 0, 0);
                // ПОПРАВКА: Грабнувачот вертикално ориентиран
                mesh.rotation.x = -Math.PI / 2;
                mesh.castShadow = true;
                mesh.receiveShadow = true;
                this.joints.gripper.add(mesh);
                this.parts.gripper_base = mesh;
                console.log('Gripper base loaded');

                this.loadGripperPartLeft().then(() => {
                    return this.loadGripperPartRight();
                }).then(() => {
                    resolve();
                }).catch(reject);
                
            }, undefined, reject);
        });
    }

    loadGripperPartLeft() {
        return new Promise((resolve, reject) => {
            this.loader.load('models/gripper_part_left.stl', (geometry) => {
                const mesh = new THREE.Mesh(geometry, this.materials.gripper);
                mesh.position.set(-10, 0, 0);
                mesh.rotation.x = -Math.PI / 2;
                mesh.castShadow = true;
                this.joints.gripper.add(mesh);
                this.parts.gripper_part_left = mesh;
                console.log('Gripper part left loaded');
                resolve(mesh);
            }, undefined, reject);
        });
    }

    loadGripperPartRight() {
        return new Promise((resolve, reject) => {
            this.loader.load('models/gripper_part_right.stl', (geometry) => {
                const mesh = new THREE.Mesh(geometry, this.materials.gripper);
                mesh.position.set(10, 0, 0);
                mesh.rotation.x = -Math.PI / 2;
                mesh.castShadow = true;
                this.joints.gripper.add(mesh);
                this.parts.gripper_part_right = mesh;
                console.log('Gripper part right loaded');
                resolve(mesh);
            }, undefined, reject);
        });
    }

    setJointAngles(angles) {
        if (angles.base !== undefined) {
            this.angles.base = angles.base;
            this.joints.base.rotation.y = angles.base;
        }

        if (angles.shoulder !== undefined) {
            this.angles.shoulder = angles.shoulder;
            // Рамото ротира околу Z-оската
            this.joints.shoulder.rotation.z = angles.shoulder;
        }

        if (angles.elbow !== undefined) {
            this.angles.elbow = angles.elbow;
            // Лакот ротира околу Z-оската
            this.joints.elbow.rotation.z = angles.elbow;
        }

        if (angles.wrist !== undefined) {
            this.angles.wrist = angles.wrist;
            // Зглобот ротира околу Z-оската
            this.joints.wrist.rotation.z = angles.wrist;
        }

        if (angles.gripper !== undefined) {
            this.angles.gripper = angles.gripper;
            this.updateGripper(angles.gripper);
        }

        this.updateUI();
    }

    updateGripper(opening) {
        const normalized = Math.max(0, Math.min(1, opening));
        const maxOpening = 8;
        
        if (this.parts.gripper_part_left) {
            this.parts.gripper_part_left.position.x = -5 - (normalized * maxOpening);
        }
        
        if (this.parts.gripper_part_right) {
            this.parts.gripper_part_right.position.x = 5 + (normalized * maxOpening);
        }
    }

    updateUI() {
        const jointAnglesElement = document.getElementById('joint-angles');
        if (jointAnglesElement) {
            jointAnglesElement.innerHTML = `
                <div>Основа: ${(THREE.MathUtils.radToDeg(this.angles.base)).toFixed(1)}°</div>
                <div>Рамо: ${(THREE.MathUtils.radToDeg(this.angles.shoulder)).toFixed(1)}°</div>
                <div>Лакот: ${(THREE.MathUtils.radToDeg(this.angles.elbow)).toFixed(1)}°</div>
                <div>Зглоб: ${(THREE.MathUtils.radToDeg(this.angles.wrist)).toFixed(1)}°</div>
                <div>Грабнувач: ${(this.angles.gripper * 100).toFixed(0)}%</div>
            `;
        }

        this.updateEndEffectorInfo();
    }

    updateEndEffectorInfo() {
        const position = this.getEndEffectorPosition();
        const orientation = this.getEndEffectorOrientation();

        const positionElement = document.getElementById('end-effector-data');
        if (positionElement) {
            positionElement.innerHTML = `
                <div>X: ${position.x.toFixed(2)}</div>
                <div>Y: ${position.y.toFixed(2)}</div>
                <div>Z: ${position.z.toFixed(2)}</div>
            `;
        }

        const orientationElement = document.getElementById('orientation-data');
        if (orientationElement) {
            orientationElement.innerHTML = `
                <div>Roll: ${orientation.roll.toFixed(1)}°</div>
                <div>Pitch: ${orientation.pitch.toFixed(1)}°</div>
                <div>Yaw: ${orientation.yaw.toFixed(1)}°</div>
            `;
        }
    }

    getEndEffectorPosition() {
        const worldPosition = new THREE.Vector3();
        if (this.joints.gripper) {
            this.joints.gripper.getWorldPosition(worldPosition);
        }
        return worldPosition;
    }

    getEndEffectorOrientation() {
        if (!this.joints.gripper) {
            return { roll: 0, pitch: 0, yaw: 0 };
        }
        
        const matrix = new THREE.Matrix4();
        this.joints.gripper.updateWorldMatrix(true, false);
        matrix.extractRotation(this.joints.gripper.matrixWorld);
        
        const euler = new THREE.Euler();
        euler.setFromRotationMatrix(matrix);
        
        return {
            roll: THREE.MathUtils.radToDeg(euler.x),
            pitch: THREE.MathUtils.radToDeg(euler.y),
            yaw: THREE.MathUtils.radToDeg(euler.z)
        };
    }

    resetPose() {
        this.setJointAngles({
            base: 0,
            shoulder: 0,
            elbow: 0,
            wrist: 0,
            gripper: 0.5
        });
    }
    getEndEffectorTransform() {
        if (!this.joints.gripper) {
            return new THREE.Matrix4().identity();
        }
        
        const matrix = new THREE.Matrix4();
        this.joints.gripper.updateWorldMatrix(true, false);
        matrix.copy(this.joints.gripper.matrixWorld);
        
        return matrix;
    }

    getJointAnglesForIK() {
        return [
            this.angles.base,
            this.angles.shoulder,
            this.angles.elbow,
            this.angles.wrist,
            0, // За ориентација на грабнувачот
            0  // За отворање на грабнувачот
        ];
    }
    hideLoading() {
        const loadingElement = document.getElementById('loading');
        if (loadingElement) {
            loadingElement.style.display = 'none';
        }
    }

    showError(message) {
        const loadingElement = document.getElementById('loading');
        if (loadingElement) {
            loadingElement.innerHTML = `<div style="color: red;">${message}</div>`;
        }
    }
}