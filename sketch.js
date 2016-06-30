var movers = [];
var littleMovers = [];
var attractor; var shark;
var G = 1;
var yoff = 0.0;

function setup() {
  createCanvas(1000,500);
  background(255);
  for (var i = 0; i < 40; i++) {
    movers[i] = new Mover();
  }
  for (var j = 0; j < 40; j++) {
    littleMovers[j] = new LittleMover();
  }
  attractor = new Attractor();
  shark = new Shark();
}

function draw() {
  background(255);
  fill(176,196,222);
  noStroke();
  // We are going to draw a polygon out of the wave points
  beginShape();

  var xoff = 0;       // Option #1: 2D Noise
  // var xoff = yoff; // Option #2: 1D Noise

  // Iterate over horizontal pixels
  for (var x = 0; x <= width; x += 10) {
    // Calculate a y value according to noise, map to

    // Option #1: 2D Noise
    var y = map(noise(xoff, yoff), 0, 1, 0,100);

    // Option #2: 1D Noise
    // var y = map(noise(xoff), 0, 1, 200,300);

    // Set the vertex
    vertex(x, y);
    // Increment x dimension for noise
    xoff += 0.05;
  }
  // increment y dimension for noise
  yoff += 0.01;
  vertex(width, height);
  vertex(0, height);
  endShape(CLOSE);

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
    movers[i].checkEdges();
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
    var angle = this.velocity.heading();
    noStroke();
    fill(this.fill);
    rectMode(CENTER);
    push();
    translate(this.position.x, this.position.y);
    rotate(angle);
    rect(0, 0, this.radius*3, this.radius);
    pop();
  };

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
    } else if (this.position.y < 80) {
      this.velocity.y *= -1;
      this.position.y = 81;
    }
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
    this.acceleration.y = map(noise(this.noff.y), 0, 1, -0.2, 0.25);
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
    } else if (this.position.y < 80) {
      this.velocity.y *= -1;
      this.position.y = 81;
    }
  };
}

function Attractor() {
  this.position = createVector(width/2, height/2);
  // this.fill = random(100, 255);
  this.noff = createVector(random(1000),random(1000));

  this.display = function() {
    // fill(this.fill);
    fill(0, 0);
    noStroke();
    ellipse(this.position.x, this.position.y, 48, 48);
  };

  this.update = function() {
    this.position.x = map(noise(this.noff.x),0,1,0,width);
    this.position.y = map(noise(this.noff.y),0,1,100,height);
    this.noff.add(0.01,0.01,0);
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
