

# 3D Симулатор на Роботска Рака

## Опис на проектот

Овој проект е 3D веб симулатор на роботска рака направен со Three.js. Во него има директна и инверзна кинематика. Може да се гледаат движењата на роботот, да се контролираат зглобовите и да се анализира како се движи роботската рака во реално време.

## Технички способности

### Веб развој и 3D графика

* Three.js за 3D приказ
* HTML5 Canvas за рендерирање
* CSS за уредување на интерфејс
* JavaScript ES6+ за логиката

### Роботска кинематика

* Директна кинематика со DH параметри
* Инверзна кинематика со аналитички пресметки
* DH конвенција за моделирање на зглобовите
* Јакобијан за анализа на движењата

### Софтверска архитектура

* REST API со Express.js
* Event-driven пристап
* Модуларни класи за делови од системот
* Асинхрон код со Promises

## Имплементирани функции

### Кориснички интерфејс

* Слајдери за контрола на секој зглоб
* Основа: -180° до +180°
* Рамо: -180° до +180°
* Лакот: -90° до +90°
* Зглоб: -180° до +180°
* Грабнувач: 0% до 100%

### Директна кинематика

* Пресметка на позиција и ориентација во реално време
* Приказ на координатни системи
* Приказ на аглите Roll, Pitch, Yaw

### Инверзна кинематика

* Аналитичко решение со повеќе можни конфигурации
* Визуелизација на целната позиција
* Анимација до целната точка
* Детекција на работниот простор

### REST API

```javascript
GET    /api/robot/config
POST   /api/robot/forward-kinematics
POST   /api/robot/inverse-kinematics
POST   /api/robot/trajectory
```

## Архитектура на системот

Three.js сцена

* 3D визуелизација
* RobotArm класа
* Kinematics класа
* InverseKinematics класа
* REST API преку Express.js

## Клучни класи

### RobotArm

```javascript
class RobotArm {
    loadModels()
    setJointAngles()
    getEndEffectorPosition()
    updateUI()
}
```

### InverseKinematics

```javascript
class InverseKinematics {
    solve()
    analyticalSolution()
    animateToSolution()
    displaySolution()
}
```

### Kinematics

```javascript
class Kinematics {
    static forwardKinematics()
    static getJacobian()
    static checkSingularity()
}
```

## Математички делови

### DH параметри

```javascript
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
```

### Инверзна кинематика (аналитичко решение)

```javascript
analyticalSolution(targetPos) {
    const cosElbow = (L2*L2 + L3*L3 - totalDistance*totalDistance) / (2 * L2 * L3);
    const elbowAngle = Math.acos(cosElbow);

    const shoulderAngle = alpha + beta;
    const wristAngle = -shoulderAngle - elbowAngle;

    return multiple_solutions;
}
```

## Инсталација и покренување

### Стартување на симулаторот

```
Отвори index.html во прелистувач
```

### Стартување на API серверот

```
node api-server.js
```

### Тестирање на API

```
curl http://localhost:3000/api/robot/config
```

## Демонстрации

### Основна контрола

* Користење на слајдерите за зглобовите
* Приказ на позиција и ориентација
* Пред-дефинирани пози

### Инверзна кинематика

* Внесување X, Y, Z
* Пресметка на решение
* Анимација до целната точка
* Преглед на повеќе решенија

### API интеграција

* Стартување на серверот
* Повик на endpoints со curl или Postman

## Постигнати барања (до оценка 10)

### Основни барања

* 3D приказ на модел
* Директна кинематика
* Интерфејс со контроли
* Реално-временски приказ

### Напредни барања

* Инверзна кинематика
* Визуелизација на целната точка
* Анимација на движење
* Јакобијан анализа
* REST API

## Заклучок

Проектот покажува познавање на роботска кинематика, веб развој и работа со 3D графика. Може да се користи за учење, демонстрација и основни експерименти со роботски раце. Направен е модуларно и може да се проширува понатаму.


