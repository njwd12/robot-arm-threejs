class Kinematics {
    static getDHParameters() {
        return [
            { a: 0, alpha: -Math.PI/2, d: 0.5, theta: 0 },
            { a: 1, alpha: 0, d: 0, theta: -Math.PI/2 },
            { a: 1, alpha: 0, d: 0, theta: 0 },
            { a: 0, alpha: -Math.PI/2, d: 0.5, theta: -Math.PI/2 },
            { a: 0, alpha: Math.PI/2, d: 0, theta: 0 },
            { a: 0, alpha: 0, d: 0.3, theta: 0 }
        ];
    }
    
    static dhToMatrix(a, alpha, d, theta) {
        const cosTheta = Math.cos(theta);
        const sinTheta = Math.sin(theta);
        const cosAlpha = Math.cos(alpha);
        const sinAlpha = Math.sin(alpha);
        
        return new THREE.Matrix4().set(
            cosTheta, -sinTheta * cosAlpha, sinTheta * sinAlpha, a * cosTheta,
            sinTheta, cosTheta * cosAlpha, -cosTheta * sinAlpha, a * sinTheta,
            0, sinAlpha, cosAlpha, d,
            0, 0, 0, 1
        );
    }
    
    static forwardKinematics(jointAngles) {
        const dhParams = this.getDHParameters();
        let transformation = new THREE.Matrix4().identity();
        
        for (let i = 0; i < jointAngles.length; i++) {
            const { a, alpha, d } = dhParams[i];
            const theta = jointAngles[i] + dhParams[i].theta;
            
            const jointMatrix = this.dhToMatrix(a, alpha, d, theta);
            transformation.multiplyMatrices(transformation, jointMatrix);
        }
        
        return transformation;
    }
    
    static getPositionFromMatrix(matrix) {
        const position = new THREE.Vector3();
        position.setFromMatrixPosition(matrix);
        return position;
    }
    
    static getOrientationFromMatrix(matrix) {
        const euler = new THREE.Euler();
        euler.setFromRotationMatrix(matrix);
        return {
            roll: THREE.MathUtils.radToDeg(euler.x),
            pitch: THREE.MathUtils.radToDeg(euler.y),
            yaw: THREE.MathUtils.radToDeg(euler.z)
        };
    }

    static getJacobian(jointAngles) {
        // Пресметка на Јакобијан матрица за роботска рака
        const dhParams = this.getDHParameters();
        const n = jointAngles.length;
        const jacobian = [];
        
        // Тековна позиција на крајниот ефектор
        const T = this.forwardKinematics(jointAngles);
        const p_eff = this.getPositionFromMatrix(T);
        
        // Пресметка на позициите на секој зглоб
        const jointPositions = [];
        let T_current = new THREE.Matrix4().identity();
        
        for (let i = 0; i < n; i++) {
            const { a, alpha, d } = dhParams[i];
            const theta = jointAngles[i] + dhParams[i].theta;
            const jointMatrix = this.dhToMatrix(a, alpha, d, theta);
            T_current.multiplyMatrices(T_current, jointMatrix);
            
            const pos = new THREE.Vector3();
            pos.setFromMatrixPosition(T_current);
            jointPositions.push(pos);
        }
        
        // Пресметка на Јакобијан
        for (let i = 0; i < n; i++) {
            // Оска на ротација за секој зглоб
            let axis;
            if (i === 0) {
                axis = new THREE.Vector3(0, 0, 1); // Z оска за основата
            } else {
                // За другите зглобови, оската зависи од DH параметрите
                axis = new THREE.Vector3(0, 0, 1);
            }
            
            // Позиција на зглобот i
            const p_i = jointPositions[i];
            
            // Вектор од зглобот i до крајниот ефектор
            const r = new THREE.Vector3().subVectors(p_eff, p_i);
            
            // Линеарен дел: v_i = ω_i × r_i
            const linear = new THREE.Vector3().crossVectors(axis, r);
            
            // Агуларен дел: ω_i
            const angular = axis;
            
            jacobian.push([
                linear.x, linear.y, linear.z,
                angular.x, angular.y, angular.z
            ]);
        }
        
        // Транспонирање на матрицата за да биде 6 x n
        const result = [];
        for (let i = 0; i < 6; i++) {
            result[i] = [];
            for (let j = 0; j < n; j++) {
                result[i][j] = jacobian[j][i];
            }
        }
        
        return result;
    }

    static checkSingularity(jacobian) {
        // Едноставна проверка за сингуларност преку детерминанта
        if (jacobian.length !== 6 || jacobian[0].length !== 6) return false;
        
        // За поедноставување, проверуваме само дали некоја колона е нула
        for (let j = 0; j < 6; j++) {
            let columnSum = 0;
            for (let i = 0; i < 6; i++) {
                columnSum += Math.abs(jacobian[i][j]);
            }
            if (columnSum < 1e-10) {
                return true;
            }
        }
        return false;
    }
}