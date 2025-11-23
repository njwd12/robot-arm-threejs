class RobotArm {
    constructor(scene) {
        this.scene = scene;
        this.parts = {};
        this.joints = {};
        this.angles = {
            base: 0,
            base_link_upper: 0,
            shoulder: 0,
            elbow: 0,
            wristX: 0,
            wristY: 0,
            wristZ: 0,
            gripper: 0.5
        };
        
        this.loader = new THREE.STLLoader();
        this.materials = {};
        this.initMaterials();
        this.init();
    }

    initMaterials() {
      
            this.materials = {
                
                base: new THREE.MeshPhongMaterial({ 
                    color: 0x2E86AB, // Синкаво-сива
                    shininess: 70,
                    specular: 0x444444
                }),
                shoulder: new THREE.MeshPhongMaterial({ 
                    color: 0xF9C80E, // ЖОЛТА! 🟡
                    shininess: 65,
                    specular: 0x333333
                }),
                elbow: new THREE.MeshPhongMaterial({ 
                    color: 0xF18F01, // Портокалова
                    shininess: 60,
                    specular: 0x222222
                }),
                wrist: new THREE.MeshPhongMaterial({ 
                    color: 0xC73E1D, // Црвено-кафеава
                    shininess: 55,
                    specular: 0x222222
                }),
                gripper: new THREE.MeshPhongMaterial({ 
                    color: 0xCC3333, // Јарко црвена
                    shininess: 40,
                    specular: 0x111111
                }),
                accent: new THREE.MeshPhongMaterial({ 
                    color: 0x3BB273, // Зелена
                    shininess: 50,
                    specular: 0x222222
                }),
                darkMetal: new THREE.MeshPhongMaterial({ 
                    color: 0x4A4A4A, // Темно сива
                    shininess: 45
                }),
                lightMetal: new THREE.MeshPhongMaterial({ 
                    color: 0xAAAAAA, // Светло сива  
                    shininess: 75,
                    specular: 0x555555
                }),
                // Нова жолта боја
                yellow: new THREE.MeshPhongMaterial({ 
                    color: 0xFFD700, // Златна жолта
                    shininess: 80,
                    specular: 0x666666
                })
            };
        }

    init() {
        this.joints = {
            base: new THREE.Group(),
            base_link_upper: new THREE.Group(),
            shoulder: new THREE.Group(),
            elbow: new THREE.Group(),
            wrist: new THREE.Group(),
            gripper: new THREE.Group()
        };

        this.joints.base.position.set(0, 0, 0);
        this.scene.add(this.joints.base);
        this.joints.base.add(this.joints.base_link_upper);
    }

    loadModels() {
        return new Promise((resolve, reject) => {
            try {
                console.log('Почнувам со вчитување на моделите...');
                
                this.loadBaseLink().then(() => this.loadBaseLinkUpper())
                .then(() => this.loadArmLink1())
                .then(() => this.loadArmLink2())
                .then(() => this.loadArmLink3())
                .then(() => this.loadGripperComponents())
                .then(() => {
                    console.log('Сите делови на роботската рака се вчитани успешно');
                    this.hideLoading();
                    this.resetPose();
                    resolve();

                    let scrollGripperOffset = this.angles.gripper;
                    window.addEventListener("wheel", (e) => {
                        if (!this.parts.gripper_part_left || !this.parts.gripper_part_right) return;
                        scrollGripperOffset += e.deltaY * -0.001;
                        scrollGripperOffset = Math.max(0, Math.min(1, scrollGripperOffset));
                        this.updateGripper(scrollGripperOffset);
                        this.angles.gripper = scrollGripperOffset;
                    });

                }).catch(error => reject(error));

            } catch (error) {
                console.error('Грешка при вчитување на модели:', error);
                this.showError('Грешка при вчитување на моделите: ' + error.message);
                reject(error);
            }
        });
    }

    // ----------------- Base -----------------
    loadBaseLink() {
        return new Promise((resolve, reject) => {
            this.loader.load('models/base_link.stl', (geometry) => {
                const mesh = new THREE.Mesh(geometry, this.materials.base); // ПРОМЕНЕТО
                mesh.position.set(0, 30, 0);
                mesh.castShadow = true;
                mesh.receiveShadow = true;
                this.joints.base.add(mesh);
                this.parts.base_link = mesh;
                console.log('Base link loaded');
                resolve(mesh);
            }, undefined, reject);
        });
    }

    loadBaseLinkUpper() {
        return new Promise((resolve, reject) => {
            this.loader.load('models/base_link_upper.stl', (geometry) => {
                const mesh = new THREE.Mesh(geometry, this.materials.accent); // ПРОМЕНЕТО
                
                mesh.position.set(0, 0, 0);
                mesh.rotation.set(THREE.MathUtils.degToRad(-90), THREE.MathUtils.degToRad(-45), 0);
                mesh.scale.set(1.2, 1.2, 1.2);
                mesh.castShadow = true;
                mesh.receiveShadow = true;
                
                this.joints.base_link_upper.position.set(40, 5, 40);
                this.joints.base_link_upper.add(mesh);
                this.parts.base_link_upper = mesh;
                
                console.log('Base link upper loaded into joint');
                resolve(mesh);
            }, undefined, reject);
        });
    }

    // ----------------- Arm -----------------
    loadArmLink1() {
        return new Promise((resolve, reject) => {
            this.loader.load('models/arm_link_1.stl', (geometry) => {
                const mesh = new THREE.Mesh(geometry, this.materials.shoulder); // ПРОМЕНЕТО
                this.joints.shoulder.position.set(0, 30, 0);
                this.joints.base.add(this.joints.shoulder);
                mesh.position.set(0, 0, 0);
                mesh.rotation.x = -Math.PI / 2;
                mesh.scale.set(1.2, 1.2, 1.2);
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
                const mesh = new THREE.Mesh(geometry, this.materials.elbow); // ПРОМЕНЕТО
                this.joints.elbow.position.set(0, 130, 0);
                this.joints.shoulder.add(this.joints.elbow);
                mesh.position.set(0, 0, 0);
                mesh.rotation.x = -Math.PI / 2;
                mesh.scale.set(1.2, 1.2, 1.2);
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
                const mesh = new THREE.Mesh(geometry, this.materials.wrist); // ПРОМЕНЕТО
                
                this.joints.wrist.position.set(0, 120, 15);
                this.joints.elbow.add(this.joints.wrist);
                
                mesh.position.set(0, 0, 0);
                mesh.rotation.y = -Math.PI / 2;
                mesh.scale.set(1.2, 1.2, 1.2);
                mesh.castShadow = true;
                mesh.receiveShadow = true;
                this.joints.wrist.add(mesh);
                this.parts.arm_link_3 = mesh;
                console.log('Arm link 3 loaded');
                resolve(mesh);
            }, undefined, reject);
        });
    }

    // ----------------- Gripper -----------------
    loadGripperComponents() {
        return new Promise((resolve, reject) => {
            this.loader.load('models/gripper_base.stl', (geometry) => {
                const mesh = new THREE.Mesh(geometry, this.materials.gripper);
                this.joints.gripper.position.set(0, 10, -30);
                this.joints.wrist.add(this.joints.gripper);
                mesh.position.set(0, 0, 0); 
                mesh.rotation.set(Math.PI / 2, Math.PI, 0); 
                mesh.scale.set(1.2, 1.2, 1.2);
                mesh.castShadow = true;
                mesh.receiveShadow = true;
                this.joints.gripper.add(mesh);
                this.parts.gripper_base = mesh;

                this.loadGripperLink().then(() => {
                    return this.loadGripperPartLeft();
                }).then(() => {
                    return this.loadGripperPartRight();
                }).then(() => resolve())
                  .catch(reject);

            }, undefined, reject);
        });
    }

    loadGripperLink() {
        return new Promise((resolve, reject) => {
            this.loader.load('models/gripper_link.stl', (geometry) => {
                const mesh = new THREE.Mesh(geometry, this.materials.darkMetal); // ПРОМЕНЕТО
                mesh.position.set(0, 0, 0);
                mesh.rotation.set(Math.PI/2, Math.PI/2, 0);
                mesh.scale.set(1.2, 1.2, 1.2);
                mesh.castShadow = true;
                mesh.receiveShadow = true;
                this.joints.gripper.add(mesh);
                this.parts.gripper_link = mesh;
                console.log('Gripper link loaded');
                resolve(mesh);
            }, undefined, reject);
        });
    }

    loadGripperPartLeft() {
        return new Promise((resolve, reject) => {
            this.loader.load('models/gripper_part_left.stl', (geometry) => {
                const mesh = new THREE.Mesh(geometry, this.materials.gripper);
                mesh.position.set(-3.25, 5, 0);
                mesh.rotation.set(Math.PI / 2, 0, -Math.PI / 2);
                mesh.scale.set(1.2, 1.2, 1.2);
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
                mesh.position.set(3.25, 0, 0);
                mesh.rotation.set(Math.PI / 2, Math.PI, -Math.PI / 2);
                mesh.scale.set(1.2, 1.2, 1.2);
                mesh.castShadow = true;
                this.joints.gripper.add(mesh);
                this.parts.gripper_part_right = mesh;
                console.log('Gripper part right loaded');
                resolve(mesh);
            }, undefined, reject);
        });
    }
    
    updateGripper(opening) {
        const normalized = Math.max(0, Math.min(1, opening));
        const maxOpening = 10;
    
        if (this.parts.gripper_part_left && this.parts.gripper_part_right) {
            const fullyClosedLeft = -0.5;
            const fullyClosedRight = 0.5;
    
            this.parts.gripper_part_left.position.x = fullyClosedLeft - normalized * (maxOpening / 2);
            this.parts.gripper_part_right.position.x = fullyClosedRight + normalized * (maxOpening / 2);
        }
    }

    // ----------------- Joint control -----------------
    setJointAngles(angles) {
        console.log('Setting angles:', angles);
        
        if (angles.base !== undefined) {
            this.angles.base = angles.base;
            this.joints.base.rotation.y = angles.base;
        }
        
        if (angles.base_link_upper !== undefined) {
            this.angles.base_link_upper = angles.base_link_upper;
            if (this.joints.base_link_upper) {
                this.joints.base_link_upper.rotation.y = angles.base_link_upper;
                console.log('Base link upper rotated to:', THREE.MathUtils.radToDeg(angles.base_link_upper).toFixed(1) + '°');
            }
        }
        
        if (angles.shoulder !== undefined) {
            this.angles.shoulder = angles.shoulder;
            this.joints.shoulder.rotation.z = angles.shoulder;
        }
        
        if (angles.elbow !== undefined) {
            this.angles.elbow = angles.elbow;
            this.joints.elbow.rotation.z = angles.elbow;
        }
        
        if (angles.wristX !== undefined) {
            this.angles.wristX = angles.wristX;
            this.joints.wrist.rotation.x = angles.wristX;
        }
        
        if (angles.wristY !== undefined) {
            this.angles.wristY = angles.wristY;
            this.joints.wrist.rotation.y = angles.wristY;
        }
        
        if (angles.wristZ !== undefined) {
            this.angles.wristZ = angles.wristZ;
            this.joints.wrist.rotation.z = angles.wristZ;
        }
        
        if (angles.gripper !== undefined) {
            this.angles.gripper = angles.gripper;
            this.updateGripper(angles.gripper);
        }
        this.updateUI();
    }

    resetPose() {
        this.setJointAngles({ 
            base: 0, 
            base_link_upper: 0,
            shoulder: 0, 
            elbow: 0, 
            wristX: 0,
            wristY: 0,
            wristZ: 0,
            gripper: 0.5 
        });
    }

    getEndEffectorPosition() {
        const pos = new THREE.Vector3();
        if (this.joints.gripper) this.joints.gripper.getWorldPosition(pos);
        return pos;
    }

    getEndEffectorOrientation() {
        if (!this.joints.gripper) return { roll:0, pitch:0, yaw:0 };
        const matrix = new THREE.Matrix4();
        this.joints.gripper.updateWorldMatrix(true,false);
        matrix.extractRotation(this.joints.gripper.matrixWorld);
        const euler = new THREE.Euler();
        euler.setFromRotationMatrix(matrix);
        return { 
            roll: THREE.MathUtils.radToDeg(euler.x),
            pitch: THREE.MathUtils.radToDeg(euler.y),
            yaw: THREE.MathUtils.radToDeg(euler.z)
        };
    }

    updateUI() {
        const jointAnglesElement = document.getElementById('joint-angles');
        if(jointAnglesElement){
            jointAnglesElement.innerHTML = `
                <div>Основа: ${(THREE.MathUtils.radToDeg(this.angles.base)).toFixed(1)}°</div>
                <div>Горна основа: ${(THREE.MathUtils.radToDeg(this.angles.base_link_upper)).toFixed(1)}°</div>
                <div>Рамо: ${(THREE.MathUtils.radToDeg(this.angles.shoulder)).toFixed(1)}°</div>
                <div>Лакот: ${(THREE.MathUtils.radToDeg(this.angles.elbow)).toFixed(1)}°</div>
                <div>Грабнувач: ${(this.angles.gripper*100).toFixed(0)}%</div>
            `;
        }
        const pos = this.getEndEffectorPosition();
        const ori = this.getEndEffectorOrientation();
        const posElem = document.getElementById('end-effector-data');
        if(posElem){
            posElem.innerHTML = `<div>X: ${pos.x.toFixed(2)}</div>
                                 <div>Y: ${pos.y.toFixed(2)}</div>
                                 <div>Z: ${pos.z.toFixed(2)}</div>`;
        }
        const oriElem = document.getElementById('orientation-data');
        if(oriElem){
            oriElem.innerHTML = `<div>Roll: ${ori.roll.toFixed(1)}°</div>
                                 <div>Pitch: ${ori.pitch.toFixed(1)}°</div>
                                 <div>Yaw: ${ori.yaw.toFixed(1)}°</div>`;
        }
    }

    hideLoading() {
        const loading = document.getElementById('loading');
        if(loading) loading.style.display = 'none';
    }

    showError(msg){
        const loading = document.getElementById('loading');
        if(loading) loading.innerHTML = `<div style="color:red;">${msg}</div>`;
    }

    getEndEffectorTransform() {
        if(!this.joints.gripper) return new THREE.Matrix4().identity();
        const m = new THREE.Matrix4();
        this.joints.gripper.updateWorldMatrix(true,false);
        m.copy(this.joints.gripper.matrixWorld);
        return m;
    }

    getJointAnglesForIK() {
        return [
            this.angles.base,
            this.angles.shoulder,
            this.angles.elbow,
            this.angles.wristX,
            this.angles.wristY,
            this.angles.wristZ
        ];
    }
}