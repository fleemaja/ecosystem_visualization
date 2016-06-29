var movers = [];
var littleMovers = [];
var attractor; var shark;
var G = 1;

function setup() {
  createCanvas(900,500);
  background(176,196,222);
  for (var i = 0; i < 75; i++) {
    movers[i] = new Mover();
  }
  for (var j = 0; j < 50; j++) {
    littleMovers[j] = new LittleMover();
  }
  attractor = new Attractor();
  shark = new Shark();
}

function draw() {
  background(176,196,222);

  for (var i = 0; i < movers.length; i++) {
    var follow = p5.Vector.sub(attractor.position, movers[i].position);
    follow.normalize();
    follow.mult(0.011 * movers[i].mass);
    var sharkForce = shark.calculateRepulsion(movers[i]);
    for (var j = 0; j < movers.length; j++) {
      if (i !== j) {
        var force = movers[j].calculateAttraction(movers[i]);
        movers[i].applyForce(force);
        movers[i].applyForce(follow);
        movers[i].applyForce(sharkForce);
      }
    }
    movers[i].update();
    movers[i].display();
  }
  for (var j = 0; j < littleMovers.length; j++) {
    littleMovers[j].checkEdges();
    littleMovers[j].update();
    littleMovers[j].display();
  }
  attractor.update();
  attractor.display();
  shark.update();
  shark.display();
}

function Mover() {
  this.mass = random(0.1, 2);
  this.position = createVector(width/2 + random(-100, 100), height/2 + random(-100, 100));
  this.velocity = createVector();
  this.acceleration = createVector();
  this.radius = this.mass * 11;

  this.fill = random(100, 250);

  this.applyForce = function(force) {
    var f = p5.Vector.div(force, this.mass);
    this.acceleration.add(f);
  };

  this.update = function() {
    this.velocity.add(this.acceleration);
    this.position.add(this.velocity);
    this.acceleration.mult(0);
    this.velocity.limit(1);
  };

  this.display = function() {
    noStroke();
    fill(this.fill);
    ellipse(this.position.x, this.position.y, this.radius*2, this.radius*2);
  };

  this.calculateAttraction = function(m) {
    // Calculate direction of force
    var force = p5.Vector.sub(this.position, m.position);
    // Distance between objects
    var distance = force.mag() - this.radius - m.radius;
    // Limiting the distance to eliminate "extreme" results for very close or very far objects
    distance = constrain(distance, 5.0, 25.0);
    // Normalize vector (distance doesn't matter here, we just want this vector for direction
    force.normalize();
    // Calculate gravitional force magnitude
    if (distance <= 10.0) {
      var strength = (5 * G * this.mass * m.mass) / (distance * distance);
    } else {
      var strength = (G * this.mass * m.mass) / (distance * distance);
    }
    // Get force vector --> magnitude * direction
    force.mult(-strength);
    return force;
  };
}

function LittleMover() {
  this.position = createVector(random(width),random(height));
  this.velocity = createVector();
  this.acceleration = createVector();
  this.noff = createVector(random(1000),random(1000));
  this.topspeed = 3;

  this.update = function() {
    this.acceleration.x = map(noise(this.noff.x), 0, 1, -1, 1);
    this.acceleration.y = map(noise(this.noff.y), 0, 1, -1, 1);
    this.noff.add(0.01,0.01,0);
    this.velocity.add(this.acceleration);
    this.velocity.limit(this.topspeed);
    this.position.add(this.velocity);
  }

  this.display = function() {
    noStroke();
    fill(255, 127, 127);
    ellipse(this.position.x, this.position.y, 8, 8);
  }

  this.checkEdges = function() {
    if (this.position.x > width + 200) {
      this.position.x = width;
      this.velocity.x *= -1;
    } else if (this.position.x < 0 - 200) {
      this.velocity.x *= -1;
      this.position.x = 0;
    }
    if (this.position.y > height + 200) {
      this.velocity.y *= -1;
      this.position.y = height;
    } else if (this.position.y < 0 - 200) {
      this.velocity.y *= -1;
      this.position.y = 0;
    }
  };
}

function Attractor() {
  this.position = createVector(width/2, height/2);
  this.fill = random(100, 255);
  this.noff = createVector(random(1000),random(1000));

  this.display = function() {
    fill(this.fill);
    noStroke();
    ellipse(this.position.x, this.position.y, 48, 48);
  };

  this.update = function() {
    this.position.x = map(noise(this.noff.x),0,1,0,width);
    this.position.y = map(noise(this.noff.y),0,1,0,height);
    this.noff.add(0.003,0.003,0);
  };
}

function Shark() {
  this.position = createVector(width/2,height/2);
  this.size = 64;
  this.noff = createVector(random(1000),random(1000));
  this.mass = 5;

  this.display = function() {
    fill(0, 0);
    noStroke();
    ellipse(this.position.x, this.position.y, this.size, this.size);
  };

  this.update = function() {
    this.position.x = map(noise(this.noff.x),0,1,0,width);
    this.position.y = map(noise(this.noff.y),0,1,0,height);
    this.noff.add(0.003,0.003,0);
  };

  this.calculateRepulsion = function(m) {
    // Calculate direction of force
    var force = p5.Vector.sub(this.position, m.position);
    // Distance between objects
    var distance = force.mag();
    // Limiting the distance to eliminate "extreme" results for very close or very far objects
    distance = constrain(distance, 5.0, 25.0);
    // Normalize vector (distance doesn't matter here, we just want this vector for direction
    force.normalize();
    // Calculate gravitional force magnitude
    var strength = (G * this.mass * m.mass) / (distance * distance);
    // Get force vector --> magnitude * direction
    force.mult(-strength);
    return force;
  };
}
