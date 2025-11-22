class InverseKinematics {
    constructor(robotArm) {
        this.robotArm = robotArm;
        this.solutions = [];
        this.currentSolutionIndex = 0;
        this.targetPosition = new THREE.Vector3();
        this.targetOrientation = new THREE.Euler();
        this.animationInProgress = false;
        this.animationDuration = 2000;
        this.animationStartTime = 0;
        this.animationStartAngles = {};
        this.animationTargetAngles = {};
        
        console.log('IK иницијализирана');
        this.initVisualization();
    }

    initVisualization() {
        // Креирање на маркер за целната позиција
        const targetGeometry = new THREE.SphereGeometry(5, 16, 16);
        const targetMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xff0000, 
            transparent: true, 
            opacity: 0.7 
        });
        this.targetMarker = new THREE.Mesh(targetGeometry, targetMaterial);
        this.targetMarker.visible = false;
        this.robotArm.scene.add(this.targetMarker);

        // Креирање на работен простор
        const workspaceGeometry = new THREE.SphereGeometry(250, 16, 16);
        const workspaceMaterial = new THREE.MeshBasicMaterial({ 
            color: 0x00ff00, 
            wireframe: true,
            transparent: true,
            opacity: 0.1
        });
        this.workspaceVisualization = new THREE.Mesh(workspaceGeometry, workspaceMaterial);
        this.workspaceVisualization.visible = false;
        this.robotArm.scene.add(this.workspaceVisualization);
    }

    solve(targetPosition, targetOrientation) {
        console.log('=== РЕШАВАМ ИНВЕРЗНА КИНЕМАТИКА ===');
        console.log('Целна позиција:', targetPosition);
        this.targetPosition.copy(targetPosition);
        this.targetOrientation.copy(targetOrientation);
        
        // Покажи маркер за целта
        this.targetMarker.position.copy(targetPosition);
        this.targetMarker.visible = true;

        // Користи аналитичко решение
        this.solutions = this.analyticalSolution(targetPosition);
        this.currentSolutionIndex = 0;

        if (this.solutions.length > 0) {
            console.log('✓ Пронајдени решенија:', this.solutions.length);
            this.displaySolution(0);
            this.showSuccess("Решение пронајдено!");
            return true;
        } else {
            console.log('✗ Нема решенија');
            this.showError("Целта е надвор од работниот простор");
            return false;
        }
    }

    analyticalSolution(targetPos) {
        const solutions = [];
        
        console.log('--- Аналитичко решение ---');
        console.log('Влезна позиција:', targetPos);
        
        // Должини на краците - ПРИЛАГОДЕТЕ ГИ ОВИЕ ВРЕДНОСТИ!
        const L1 = 30;   // Висина на основата
        const L2 = 120;  // Должина на рамото  
        const L3 = 80;   // Должина на лакот
        const L4 = 30;   // Должина на зглобот
        
        // Пресметка на позицијата на зглобот (wrist)
        const wristTarget = new THREE.Vector3(
            targetPos.x,
            targetPos.y - L4,
            targetPos.z
        );
        
        console.log('Позиција на зглобот:', wristTarget);
        
        // Растојание до основата во XZ рамнина
        const distanceXZ = Math.sqrt(wristTarget.x * wristTarget.x + wristTarget.z * wristTarget.z);
        const verticalDistance = wristTarget.y - L1;
        
        // Вкупно растојание до зглобот
        const totalDistance = Math.sqrt(distanceXZ * distanceXZ + verticalDistance * verticalDistance);
        
        console.log('Димензии:', { distanceXZ, verticalDistance, totalDistance });
        console.log('Максимално растојание:', L2 + L3);
        
        // Проверка дали целта е достапна
        if (totalDistance > (L2 + L3) || totalDistance < Math.abs(L2 - L3)) {
            console.log('✗ Целта е надвор од работниот простор');
            return solutions;
        }
        
        // Агол на основата
        const baseAngle = Math.atan2(wristTarget.x, wristTarget.z); // ПОПРАВКА: x и z заменети
        
        // Косинусова теорема за аголот на лакот
        const cosElbow = (L2*L2 + L3*L3 - totalDistance*totalDistance) / (2 * L2 * L3);
        
        console.log('cosElbow:', cosElbow);
        
        if (Math.abs(cosElbow) > 1) {
            console.log('✗ Нема решение - косинус надвор од опсег');
            return solutions;
        }
        
        const elbowAngle1 = Math.acos(cosElbow);
        const elbowAngle2 = -elbowAngle1;
        
        // Агол на рамото
        const alpha = Math.atan2(verticalDistance, distanceXZ);
        const beta1 = Math.atan2(L3 * Math.sin(elbowAngle1), L2 + L3 * Math.cos(elbowAngle1));
        const beta2 = Math.atan2(L3 * Math.sin(elbowAngle2), L2 + L3 * Math.cos(elbowAngle2));
        
        const shoulderAngle1 = alpha + beta1 - Math.PI/2; // ПОПРАВКА: компензација за почетна ориентација
        const shoulderAngle2 = alpha + beta2 - Math.PI/2;
        
        // Агол на зглобот (за да се одржи грабнувачот хоризонтален)
        const wristAngle1 = -shoulderAngle1 - elbowAngle1;
        const wristAngle2 = -shoulderAngle2 - elbowAngle2;
        
        // Додавање на валидни решенија
        if (this.isValidSolution(shoulderAngle1, elbowAngle1, wristAngle1)) {
            solutions.push({
                base: baseAngle,
                shoulder: shoulderAngle1,
                elbow: elbowAngle1,
                wrist: wristAngle1,
                gripper: 0.5
            });
            console.log('✓ Решение 1 - ВАЛИДНО');
        }
        
        if (this.isValidSolution(shoulderAngle2, elbowAngle2, wristAngle2)) {
            solutions.push({
                base: baseAngle,
                shoulder: shoulderAngle2,
                elbow: elbowAngle2,
                wrist: wristAngle2, 
                gripper: 0.5
            });
            console.log('✓ Решение 2 - ВАЛИДНО');
        }
        
        console.log('Вкупно валидни решенија:', solutions.length);
        return solutions;
    }

    isValidSolution(shoulder, elbow, wrist) {
        const valid = !isNaN(shoulder) && !isNaN(elbow) && !isNaN(wrist) &&
               Math.abs(shoulder) <= Math.PI &&
               Math.abs(elbow) <= Math.PI/2 &&
               Math.abs(wrist) <= Math.PI;
        
        if (!valid) {
            console.log('Невалидно решение:', {
                shoulder: THREE.MathUtils.radToDeg(shoulder),
                elbow: THREE.MathUtils.radToDeg(elbow), 
                wrist: THREE.MathUtils.radToDeg(wrist)
            });
        }
        
        return valid;
    }

    displaySolution(index) {
        if (index < 0 || index >= this.solutions.length) {
            console.log('Невалиден индекс на решение:', index);
            return;
        }
        
        this.currentSolutionIndex = index;
        const solution = this.solutions[index];
        
        console.log('=== ПРИКАЖУВАМ РЕШЕНИЕ ===');
        console.log('Решение', index + 1, 'од', this.solutions.length);
        console.log('Агли во степени:', {
            base: THREE.MathUtils.radToDeg(solution.base).toFixed(1),
            shoulder: THREE.MathUtils.radToDeg(solution.shoulder).toFixed(1),
            elbow: THREE.MathUtils.radToDeg(solution.elbow).toFixed(1),
            wrist: THREE.MathUtils.radToDeg(solution.wrist).toFixed(1)
        });
        
        // Прикажи ги аглите на роботската рака
        this.robotArm.setJointAngles(solution);
        
        // Ажурирај ги информациите за решението
        this.updateSolutionInfo();
    }

    updateSolutionInfo() {
        const solutionCountElement = document.getElementById('solution-count');
        const currentSolutionElement = document.getElementById('current-solution');
        const errorElement = document.getElementById('ik-error');
        
        if (solutionCountElement) {
            solutionCountElement.textContent = this.solutions.length;
        }
        
        if (currentSolutionElement) {
            currentSolutionElement.textContent = this.currentSolutionIndex + 1;
        }
        
        if (errorElement && this.solutions.length > 0) {
            const currentPos = this.robotArm.getEndEffectorPosition();
            const error = currentPos.distanceTo(this.targetPosition);
            errorElement.textContent = error.toFixed(3);
        }
    }

    animateToSolution() {
        if (this.solutions.length === 0) {
            console.log('Нема решение за анимација');
            this.showError("Нема решение за анимација. Прво решете IK.");
            return;
        }
        
        if (this.animationInProgress) {
            console.log('Анимација е веќе во тек');
            return;
        }
        
        console.log('=== ПОЧНУВАМ АНИМАЦИЈА ===');
        console.log('Тековни агли:', this.formatAngles(this.robotArm.angles));
        console.log('Целни агли:', this.formatAngles(this.solutions[this.currentSolutionIndex]));
        
        this.animationInProgress = true;
        this.animationStartTime = Date.now();
        this.animationStartAngles = { ...this.robotArm.angles };
        this.animationTargetAngles = { ...this.solutions[this.currentSolutionIndex] };
        
        this.animationLoop();
    }

    formatAngles(angles) {
        return {
            base: THREE.MathUtils.radToDeg(angles.base).toFixed(1) + '°',
            shoulder: THREE.MathUtils.radToDeg(angles.shoulder).toFixed(1) + '°',
            elbow: THREE.MathUtils.radToDeg(angles.elbow).toFixed(1) + '°',
            wrist: THREE.MathUtils.radToDeg(angles.wrist).toFixed(1) + '°'
        };
    }

    animationLoop() {
        if (!this.animationInProgress) return;
        
        const currentTime = Date.now();
        const elapsed = currentTime - this.animationStartTime;
        const progress = Math.min(elapsed / this.animationDuration, 1);
        
        // Интерполација на сите агли
        const interpolatedAngles = {};
        Object.keys(this.animationStartAngles).forEach(joint => {
            const start = this.animationStartAngles[joint];
            const target = this.animationTargetAngles[joint];
            interpolatedAngles[joint] = start + (target - start) * this.easeInOutCubic(progress);
        });
        
        this.robotArm.setJointAngles(interpolatedAngles);
        
        if (progress < 1) {
            requestAnimationFrame(() => this.animationLoop());
        } else {
            this.animationInProgress = false;
            console.log('✓ Анимација завршена');
            console.log('Конечни агли:', this.formatAngles(this.robotArm.angles));
            this.showSuccess("Анимација завршена!");
        }
    }

    easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    nextSolution() {
        if (this.solutions.length > 0) {
            const nextIndex = (this.currentSolutionIndex + 1) % this.solutions.length;
            console.log('Следно решение:', nextIndex + 1);
            this.displaySolution(nextIndex);
        }
    }

    previousSolution() {
        if (this.solutions.length > 0) {
            const prevIndex = (this.currentSolutionIndex - 1 + this.solutions.length) % this.solutions.length;
            console.log('Претходно решение:', prevIndex + 1);
            this.displaySolution(prevIndex);
        }
    }

    showError(message) {
        console.error('❌', message);
        const statusElement = document.getElementById('ik-status');
        if (statusElement) {
            statusElement.textContent = message;
            statusElement.className = 'status-message error';
        }
    }

    showSuccess(message) {
        console.log('✅', message);
        const statusElement = document.getElementById('ik-status');
        if (statusElement) {
            statusElement.textContent = message;
            statusElement.className = 'status-message success';
        }
    }

    reset() {
        this.targetMarker.visible = false;
        this.workspaceVisualization.visible = false;
        this.solutions = [];
        this.currentSolutionIndex = 0;
        this.animationInProgress = false;
        
        const statusElement = document.getElementById('ik-status');
        if (statusElement) {
            statusElement.textContent = '';
            statusElement.className = 'status-message';
        }
        
        this.updateSolutionInfo();
        console.log('🔄 IK ресетирана');
    }
}

// Тест функции
window.testIK = function() {
    if (window.inverseKinematics) {
        console.log('=== ТЕСТИРАМ ИНВЕРЗНА КИНЕМАТИКА ===');
        
        // Тест 1: Позната позиција што треба да работи
        const testPos1 = new THREE.Vector3(100, 150, 0);
        console.log('Тест 1 - Позиција:', testPos1);
        window.inverseKinematics.solve(testPos1, new THREE.Euler());
        
        // Тест 2: Друга позиција
        setTimeout(() => {
            const testPos2 = new THREE.Vector3(0, 180, 100);
            console.log('Тест 2 - Позиција:', testPos2);
            window.inverseKinematics.solve(testPos2, new THREE.Euler());
        }, 3000);
        
    } else {
        console.error('IK не е иницијализирана');
    }
};

window.debugRobot = function() {
    if (window.robotArm) {
        console.log('=== ДЕБАГ ИНФО ЗА РОБОТ ===');
        console.log('Тековни агли:', window.robotArm.angles);
        console.log('Позиција на крајниот ефектор:', window.robotArm.getEndEffectorPosition());
    } else {
        console.error('Роботската рака не е иницијализирана');
    }
};