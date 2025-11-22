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
            wrist1: new THREE.Group(),
            gripper: new THREE.Group()
        };

        // Основата стои на подот
        this.joints.base.position.set(0, 0, 0);
        this.scene.add(this.joints.base);
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

                    // Scroll control за грабнувач
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
                const mesh = new THREE.Mesh(geometry, this.materials.metal);
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
                const mesh = new THREE.Mesh(geometry, this.materials.metal);
                mesh.position.set(40, 5, 40);
                mesh.rotation.set(THREE.MathUtils.degToRad(-90), THREE.MathUtils.degToRad(-45), 0);
                mesh.castShadow = true;
                mesh.receiveShadow = true;
                this.joints.base.add(mesh);
                this.parts.base_link_upper = mesh;
                console.log('Base link upper loaded');
                resolve(mesh);
            }, undefined, reject);
        });
    }

    // ----------------- Arm -----------------
    loadArmLink1() {
        return new Promise((resolve, reject) => {
            this.loader.load('models/arm_link_1.stl', (geometry) => {
                const mesh = new THREE.Mesh(geometry, this.materials.darkMetal);
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
                const mesh = new THREE.Mesh(geometry, this.materials.darkMetal);
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
                const mesh = new THREE.Mesh(geometry, this.materials.darkMetal);
                
                // ПОПРАВКА: Зглобот директно на крајот од лакот
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

                // Повик за секој дел на грабнувачот
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
                const mesh = new THREE.Mesh(geometry, this.materials.gripper);
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
                mesh.position.set(-3.25, 5, 0); // почетна позиција (ќе се прилагоди во updateGripper)
                mesh.rotation.set(Math.PI / 2, 0, -Math.PI / 2);
                mesh.scale.set(1.5, 1.5, 1.5);
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
                mesh.position.set(3.25, 0, 0); // почетна позиција (ќе се прилагоди во updateGripper)
                mesh.rotation.set(Math.PI / 2, Math.PI, -Math.PI / 2);
                mesh.scale.set(1.5, 1.5, 1.5);
                mesh.castShadow = true;
                this.joints.gripper.add(mesh);
                this.parts.gripper_part_right = mesh;
                console.log('Gripper part right loaded');
                resolve(mesh);
            }, undefined, reject);
        });
    }
    
    updateGripper(opening) {
        // Ограничување 0-1
        const normalized = Math.max(0, Math.min(1, opening));
        const maxOpening = 10; // колку се движат надвор кога е fully open
    
        if (this.parts.gripper_part_left && this.parts.gripper_part_right) {
            // При fully closed (opening = 0) левиот и десниот дел се на иста линија
            const fullyClosedLeft = -0.5;  // поместување кон левата страна
            const fullyClosedRight = 0.5;  // поместување кон десната страна
    
            // Позиции се пресметуваат
            this.parts.gripper_part_left.position.x = fullyClosedLeft - normalized * (maxOpening / 2);
            this.parts.gripper_part_right.position.x = fullyClosedRight + normalized * (maxOpening / 2);
        }
    }
    
    
    
    
    

    // ----------------- Joint control -----------------
    setJointAngles(angles) {
        if (angles.base !== undefined) {
            this.angles.base = angles.base;
            this.joints.base.rotation.y = angles.base;
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
            this.joints.wrist.rotation.x = angles.wristX; // pitch - нагоре/надолу
        }
        
        if (angles.wristY !== undefined) {
            this.angles.wristY = angles.wristY;
            this.joints.wrist.rotation.y = angles.wristY; // yaw - лево/десно
        }
        
        if (angles.wristZ !== undefined) {
            this.angles.wristZ = angles.wristZ;
            this.joints.wrist.rotation.z = angles.wristZ; // roll - вртење околу оска
        }
        
        
        if (angles.gripper !== undefined) {
            this.angles.gripper = angles.gripper;
            this.updateGripper(angles.gripper);
        }
        this.updateUI();
    }

    resetPose() {
        this.setJointAngles({ base:0, shoulder:0, elbow:0, wrist:0, gripper:0.5 });
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
                <div>Рамо: ${(THREE.MathUtils.radToDeg(this.angles.shoulder)).toFixed(1)}°</div>
                <div>Лакот: ${(THREE.MathUtils.radToDeg(this.angles.elbow)).toFixed(1)}°</div>
                <div>Зглоб: ${(THREE.MathUtils.radToDeg(this.angles.wrist)).toFixed(1)}°</div>
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
            this.angles.wrist,
            0,
            0
        ];
    }
}
