const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// Симилирана база на податоци за конфигурација на роботската рака
const robotConfig = {
    dimensions: {
        baseHeight: 0.5,
        shoulderLength: 1.0,
        elbowLength: 1.0,
        wristLength: 0.5,
        gripperLength: 0.3
    },
    jointLimits: {
        base: { min: -Math.PI, max: Math.PI },
        shoulder: { min: -Math.PI, max: Math.PI },
        elbow: { min: -Math.PI/2, max: Math.PI/2 },
        wrist: { min: -Math.PI/2, max: Math.PI/2 },
        gripper: { min: 0, max: 1 }
    }
};

// REST API endpoints
app.get('/api/robot/config', (req, res) => {
    res.json(robotConfig);
});

app.post('/api/robot/forward-kinematics', (req, res) => {
    const { jointAngles } = req.body;
    
    // Симилирана пресметка на директна кинематика
    const position = {
        x: Math.cos(jointAngles.base) * (robotConfig.dimensions.shoulderLength * Math.cos(jointAngles.shoulder) + 
                                        robotConfig.dimensions.elbowLength * Math.cos(jointAngles.shoulder + jointAngles.elbow) +
                                        robotConfig.dimensions.wristLength * Math.cos(jointAngles.shoulder + jointAngles.elbow + jointAngles.wrist)),
        y: robotConfig.dimensions.baseHeight + 
           robotConfig.dimensions.shoulderLength * Math.sin(jointAngles.shoulder) + 
           robotConfig.dimensions.elbowLength * Math.sin(jointAngles.shoulder + jointAngles.elbow) +
           robotConfig.dimensions.wristLength * Math.sin(jointAngles.shoulder + jointAngles.elbow + jointAngles.wrist),
        z: Math.sin(jointAngles.base) * (robotConfig.dimensions.shoulderLength * Math.cos(jointAngles.shoulder) + 
                                        robotConfig.dimensions.elbowLength * Math.cos(jointAngles.shoulder + jointAngles.elbow) +
                                        robotConfig.dimensions.wristLength * Math.cos(jointAngles.shoulder + jointAngles.elbow + jointAngles.wrist))
    };
    
    res.json({ position });
});

app.post('/api/robot/inverse-kinematics', (req, res) => {
    const { targetPosition, targetOrientation } = req.body;
    
    // Симилирана пресметка на инверзна кинематика
    // Во реална имплементација, ова би била вистинска пресметка
    const solutions = [
        {
            base: Math.atan2(targetPosition.z, targetPosition.x),
            shoulder: 0.5,
            elbow: 0.3,
            wrist: -0.2
        },
        {
            base: Math.atan2(targetPosition.z, targetPosition.x) + Math.PI,
            shoulder: -0.5,
            elbow: 0.7,
            wrist: -0.5
        }
    ];
    
    res.json({ solutions });
});

app.post('/api/robot/trajectory', (req, res) => {
    const { waypoints } = req.body;
    
    // Генерирање на траекторија
    const trajectory = waypoints.map((waypoint, index) => {
        return {
            time: index * 1000, // 1 секунда помеѓу секоја точка
            position: waypoint.position,
            jointAngles: waypoint.jointAngles || null
        };
    });
    
    res.json({ trajectory });
});

app.listen(port, () => {
    console.log(`API серверот слуша на порта ${port}`);
});