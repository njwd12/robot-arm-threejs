// Global variables
let scene, camera, renderer, controls, robotArm, inverseKinematics; // ДОДАДЕНО inverseKinematics

// Initialize the application
function init() {
    createScene();
    setupCamera();
    setupRenderer();
    setupControls();
    setupLighting();
    setupEnvironment();
    createRobotArm();
    // setupUI() ЌЕ СЕ ПОВИКА АВТОМАТСКИ ОТКАКО РОБОТСКАТА РАКА ЌЕ СЕ ВЧИТА
    // animate() ЌЕ СЕ ПОВИКА АВТОМАТСКИ ОТКАКО РОБОТСКАТА РАКА ЌЕ СЕ ВЧИТА
}

function createScene() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x2a2a2a);
}

function setupCamera() {
    camera = new THREE.PerspectiveCamera(100, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(200, 450, 150);
    camera.lookAt(0, 0, 0);
}

function setupRenderer() {
    const container = document.getElementById('scene-container');
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.shadowMap.enabled = false;
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);
}

function setupControls() {
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.minDistance = 50;
    controls.maxDistance = 500;
    controls.maxPolarAngle = Math.PI;
}

function setupLighting() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
    directionalLight.position.set(60, 120, 60);
    directionalLight.castShadow = false;
    scene.add(directionalLight);

    const backLight = new THREE.DirectionalLight(0xffffff, 0.8);
    backLight.position.set(-60, 80, -60);
    scene.add(backLight);

    const sideLight = new THREE.DirectionalLight(0xffffff, 0.6);
    sideLight.position.set(0, 100, -80);
    scene.add(sideLight);
}

function setupEnvironment() {
    const gridHelper = new THREE.GridHelper(200, 20, 0x666666, 0x444444);
    gridHelper.material.opacity = 0.3;
    gridHelper.material.transparent = true;
    scene.add(gridHelper);

    const axesHelper = new THREE.AxesHelper(50);
    scene.add(axesHelper);

    const floorGeometry = new THREE.PlaneGeometry(400, 400);
    const floorMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x333333,
        shininess: 0,
        side: THREE.DoubleSide
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = false;
    scene.add(floor);
}

function createRobotArm() {
    robotArm = new RobotArm(scene);
    robotArm.loadModels().then(() => {
        console.log('Роботската рака е иницијализирана');
        
        // СЕГА ИНИЦИЈАЛИЗИРАЈ ЈА ИНВЕРЗНАТА КИНЕМАТИКА
        inverseKinematics = new InverseKinematics(robotArm);
        
        // СЕГА СЕТИРАЈ ГИ СИТЕ КОМПОНЕНТИ
        setupSliders();
        setupIKControls();
        setupUI(); // ДОДАДЕНО ОВДЕ
        
        // СЕГА ЗАПОЧНИ ЈА АНИМАЦИЈАТА
        animate(); // ДОДАДЕНО ОВДЕ
        
        console.log('Сите компоненти се иницијализирани');
        
    }).catch(error => {
        console.error('Грешка при креирање на роботската рака:', error);
    });
}
function setupIKControls() {
    const solveButton = document.getElementById('solve-ik');
    const animateButton = document.getElementById('animate-ik');
    const resetButton = document.getElementById('reset-ik');
    const prevSolutionButton = document.getElementById('prev-solution');
    const nextSolutionButton = document.getElementById('next-solution');
    
    console.log('🔍 Наоѓам IK копчиња:', {
        solve: !!solveButton,
        animate: !!animateButton, 
        reset: !!resetButton,
        prev: !!prevSolutionButton,
        next: !!nextSolutionButton
    });
    
    if (solveButton) {
        solveButton.addEventListener('click', function() {
            console.log(' Solve IK кликнато');
            solveIK();
        });
        console.log('✅ solveButton event listener додаден');
    }
    
    if (animateButton) {
        animateButton.addEventListener('click', function() {
            console.log(' Animate IK кликнато');
            if (window.animateIK) {
                console.log('✅ animateIK постои, викам...');
                animateIK();
            } else {
                console.log('❌ animateIK не постои!');
            }
        });
        console.log('✅ animateButton event listener додаден');
    }
    
    if (resetButton) {
        resetButton.addEventListener('click', function() {
            console.log('🔄 Reset IK кликнато');
            resetIK();
        });
        console.log('✅ resetButton event listener додаден');
    }
    
    if (prevSolutionButton) {
        prevSolutionButton.addEventListener('click', function() {
            console.log('⬅ Previous Solution кликнато');
            previousSolution();
        });
    }
    
    if (nextSolutionButton) {
        nextSolutionButton.addEventListener('click', function() {
            console.log(' Next Solution кликнато');
            nextSolution();
        });
    }
    
    console.log('✅ IK контролите се поставени');
}

function solveIK() {

    // ПРОВЕРКА ДАЛИ ИНВЕРЗНАТА КИНЕМАТИКА Е ИНИЦИЈАЛИЗИРАНА
    if (!inverseKinematics) {
        console.error('Инверзна кинематика не е иницијализирана!');
        alert('Инверзна кинематика не е подготвена. Почекајте додека се вчита роботската рака.');
        return;
    }
    

    const x = parseFloat(document.getElementById('ik-x').value);
    const y = parseFloat(document.getElementById('ik-y').value);
    const z = parseFloat(document.getElementById('ik-z').value);
    const roll = parseFloat(document.getElementById('ik-roll').value);
    const pitch = parseFloat(document.getElementById('ik-pitch').value);
    const yaw = parseFloat(document.getElementById('ik-yaw').value);
    
    console.log('Решавам IK за позиција:', x, y, z);
    
    const targetPosition = new THREE.Vector3(x, y, z);
    const targetOrientation = new THREE.Euler(
        THREE.MathUtils.degToRad(roll),
        THREE.MathUtils.degToRad(pitch),
        THREE.MathUtils.degToRad(yaw)
    );
    
    const success = inverseKinematics.solve(targetPosition, targetOrientation);
    
    if (success) {
        inverseKinematics.showSuccess("Решение пронајдено!");
        console.log('Решение пронајдено!');
    } else {
        console.log('Не успеа да најде решение');
    }
}

function animateIK() {
    console.log(' animateIK() ФУНКЦИЈАТА СЕ ВИКА!');
    
    if (!inverseKinematics) {
        console.error('❌ Инверзна кинематика не е иницијализирана!');
        return;
    }
    
    console.log(' Проверка на IK состојба:');
    console.log('- Број на решенија:', inverseKinematics.solutions.length);
    console.log('- Анимација во тек:', inverseKinematics.animationInProgress);
    
    if (inverseKinematics.solutions.length === 0) {
        console.log('⚠️ Нема решенија за анимација. Прво решете IK.');
        return;
    }
    
    console.log('🚀 Пушам анимација...');
    inverseKinematics.animateToSolution();
}

function resetIK() {
    if (!inverseKinematics) {
        console.error('Инверзна кинематика не е иницијализирана!');
        return;
    }
    inverseKinematics.reset();
    
    // Ресетирање на влезните полиња
    document.getElementById('ik-x').value = "150"; // ПРОМЕНЕТО ОД 1.5 НА 150
    document.getElementById('ik-y').value = "100"; // ПРОМЕНЕТО ОД 1.0 НА 100
    document.getElementById('ik-z').value = "50";  // ПРОМЕНЕТО ОД 1.5 НА 50
    document.getElementById('ik-roll').value = "0";
    document.getElementById('ik-pitch').value = "0";
    document.getElementById('ik-yaw').value = "0";
}

function previousSolution() {
    if (!inverseKinematics) {
        console.error('Инверзна кинематика не е иницијализирана!');
        return;
    }
    inverseKinematics.previousSolution();
}

function nextSolution() {
    if (!inverseKinematics) {
        console.error('Инверзна кинематика не е иницијализирана!');
        return;
    }
    inverseKinematics.nextSolution();
}

function setupUI() {
    window.addEventListener('resize', onWindowResize);
    console.log('UI е поставен');
}

function setupSliders() {
    const slidersContainer = document.getElementById('sliders-container');
    const jointConfigs = [
        { id: 'base', label: 'Основа (Base)',  min: -Math.PI, max: Math.PI,step: 0.01, value: 0 },
        { id: 'base-link-upper', label: 'Горна Основа (Base)',  min: -Math.PI, max: Math.PI,step: 0.01, value: 0 },
        { id: 'shoulder', label: 'Рамо (Shoulder)', min: -Math.PI, max: Math.PI, step: 0.01, value: 0 },
        { id: 'elbow', label: 'Лакот (Elbow)', min: -Math.PI/2, max: Math.PI/2, step: 0.01, value: 0 },
        { id: 'wristX', label: 'Wrist Pitch (X)', min: -Math.PI/2, max: Math.PI/2, step: 0.01, value: 0 },
        { id: 'wristY', label: 'Wrist Yaw (Y)', min: -Math.PI, max: Math.PI, step: 0.01, value: 0 },
        { id: 'wristZ', label: 'Wrist Roll (Z)', min: -Math.PI, max: Math.PI, step: 0.01, value: 0 },
        { id: 'gripper', label: 'Грабнувач (Gripper)', min: 0, max: 1, step: 0.01, value: 0.5 }
    ];
    
    slidersContainer.innerHTML = jointConfigs.map(config => `
        <div class="slider-group">
            <label for="${config.id}">${config.label}</label>
            <div class="slider-with-value">
                <input type="range" 
                       id="${config.id}" 
                       class="joint-slider"
                       min="${config.min}" 
                       max="${config.max}" 
                       step="${config.step}" 
                       value="${config.value}">
                <span class="slider-value" id="${config.id}-value">${config.id === 'gripper' ? (config.value * 100).toFixed(0) + '%' : THREE.MathUtils.radToDeg(config.value).toFixed(1) + '°'}</span>
            </div>
        </div>
    `).join('');

    jointConfigs.forEach(config => {
        const slider = document.getElementById(config.id);
        const valueDisplay = document.getElementById(config.id + '-value');
        
        slider.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            let displayValue = value;
            
            if (config.id === 'gripper') {
                displayValue = (value * 100).toFixed(0) + '%';
            } else {
                displayValue = THREE.MathUtils.radToDeg(value).toFixed(1) + '°';
            }
            
            valueDisplay.textContent = displayValue;
            
            const angles = {};
            angles[config.id] = value;
            robotArm.setJointAngles(angles);
        });
    });

    const presetSection = document.createElement('div');
    presetSection.className = 'section';
    presetSection.innerHTML = `
        <h3> Пред-дефинирани Пози</h3>
        <div class="preset-buttons">
            <button class="preset-btn" onclick="setPresetPose('home')">Дома</button>
            <button class="preset-btn" onclick="setPresetPose('extended')">Испружена</button>
            <button class="preset-btn" onclick="setPresetPose('folded')">Соборена</button>
            <button class="preset-btn" onclick="setPresetPose('pickup')">Земање</button>
            <button class="preset-btn" onclick="robotArm.resetPose()">Ресетирај</button>
        </div>
    `;
    
    slidersContainer.parentNode.insertBefore(presetSection, slidersContainer.nextSibling);
    
    console.log('Лизгачите се поставени');
}
const presetPoses = {
    home: { base: 0, base_link_upper: 0, shoulder: 0, elbow: 0, wrist: 0, gripper: 0.5 },
    extended: { base: Math.PI/4, base_link_upper: Math.PI/8, shoulder: -Math.PI/6, elbow: Math.PI/3, wrist: -Math.PI/6, gripper: 0.8 },
    folded: { base: -Math.PI/4, base_link_upper: -Math.PI/8, shoulder: Math.PI/4, elbow: -Math.PI/4, wrist: Math.PI/8, gripper: 0.2 },
    pickup: { base: Math.PI/2, base_link_upper: Math.PI/6, shoulder: -Math.PI/8, elbow: Math.PI/4, wrist: -Math.PI/8, gripper: 0.3 }
};

function setPresetPose(presetName) {
    const pose = presetPoses[presetName];
    if (pose) {
        Object.keys(pose).forEach(joint => {
            const slider = document.getElementById(joint);
            const valueDisplay = document.getElementById(joint + '-value');
            
            if (slider && valueDisplay) {
                slider.value = pose[joint];
                let displayValue = pose[joint];
                
                if (joint === 'gripper') {
                    displayValue = (pose[joint] * 100).toFixed(0) + '%';
                } else {
                    displayValue = THREE.MathUtils.radToDeg(pose[joint]).toFixed(1) + '°';
                }
                
                valueDisplay.textContent = displayValue;
            }
        });
        
        robotArm.setJointAngles(pose);
    }
}

function onWindowResize() {
    const container = document.getElementById('scene-container');
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
}

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

window.setPresetPose = setPresetPose;

// ДОДАДЕНО: Глобални функции за IK
window.solveIK = solveIK;
window.animateIK = animateIK;
window.resetIK = resetIK;
window.previousSolution = previousSolution;
window.nextSolution = nextSolution;

document.addEventListener('DOMContentLoaded', init);