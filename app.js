const scoreEl = document.querySelector('#scoleEl')
const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

canvas.width = window.innerWidth
canvas.height = window.innerHeight

class Player {
  constructor() {
    this.velocity = {
      x: 0,
      y: 0
    }
    this.rotation = 0
    this.opacity = 1

    const image = new Image()
    image.src = './images/spaceship.png'
    image.onload = () => {
      const scale = .15
      this.image = image
      this.width = image.width * scale
      this.height = image.height * scale
      this.position = {
        x: canvas.width / 2 - this.width / 2,
        y: canvas.height - this.height - 20
      }
    }

  }

  draw() {
    // c.fillStyle = 'red'
    // c.fillRect(this.position.x, this.position.y, this.width, this.height)

    c.save()
    c.globalAlpha = this.opacity
    c.translate(player.position.x + player.width / 2, player.position.y + player.height / 2)
    c.rotate(this.rotation)
    c.translate(-player.position.x - player.width / 2, -player.position.y - player.height / 2)

    c.drawImage(this.image, this.position.x, this.position.y, this.width, this.height)

    c.restore()
  }

  update() {
    if (this.image) {
      this.draw()
      this.position.x += this.velocity.x
    }
  }
}

class Projectile {
  constructor({ position, velocity }) {
    this.position = position
    this.velocity = velocity

    this.radius = 3
  }

  draw() {
    c.beginPath()
    c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2,)
    c.fillStyle = 'red'
    c.fill()
    c.closePath()
  }

  update() {
    this.draw()
    this.position.x += this.velocity.x
    this.position.y += this.velocity.y
  }
}

class Invader {
  constructor({ position }) {
    this.velocity = {
      x: 0,
      y: 0
    }

    const image = new Image()
    image.src = './images/invader.png'
    image.onload = () => {
      const scale = 1
      this.image = image
      this.width = image.width * scale
      this.height = image.height * scale
      this.position = {
        x: position.x,
        y: position.y
      }
    }

  }

  draw() {
    // c.fillStyle = 'red'
    // c.fillRect(this.position.x, this.position.y, this.width, this.height)

    c.drawImage(this.image, this.position.x, this.position.y, this.width, this.height)

  }

  update({ velocity }) {
    if (this.image) {
      this.draw()
      this.position.x += velocity.x
      this.position.y += velocity.y
    }
  }

  shoot(invaderProjectiles) {
    invaderProjectiles.push(
      new InvaderProjectile({
        position: {
          x: this.position.x + this.width / 2,
          y: this.position.y + this.height
        },
        velocity: {
          x: 0,
          y: 5
        }
      })
    )
  }
}


class InvaderProjectile {
  constructor({ position, velocity }) {
    this.position = position
    this.velocity = velocity

    this.width = 3
    this.height = 10
  }

  draw() {
    c.fillStyle = 'white'
    c.fillRect(this.position.x, this.position.y, this.width, this.height)
  }

  update() {
    this.draw()
    this.position.x += this.velocity.x
    this.position.y += this.velocity.y
  }
}

class Particles {
  constructor({ position, velocity, radius, color, fade }) {
    this.position = position
    this.velocity = velocity
    this.radius = radius
    this.color = color
    this.opacity = 1
    this.fade = fade
  }

  draw() {
    c.save()
    c.globalOpacity = this.opacity
    c.beginPath()
    c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2,)
    c.fillStyle = this.color
    c.fill()
    c.closePath()
    c.restore()
  }

  update() {
    this.draw()
    this.position.x += this.velocity.x
    this.position.y += this.velocity.y

    if(this.fade) this.opacity -= 0.01
  }
}

class Grid {
  constructor() {
    this.position = {
      x: 0,
      y: 0
    }

    this.velocity = {
      x: 3,
      y: 0
    }

    this.invaders = []


    const columns = Math.floor(Math.random() * 10 + 5)
    const rows = Math.floor(Math.random() * 5 + 2)

    this.width = columns * 30
    for (let x = 0; x < columns; x++) {
      for (let y = 0; y < rows; y++) {
        this.invaders.push(
          new Invader({
            position: { x: x * 30, y: y * 30 }
          })
        )
      }
    }

  }

  update() {
    this.position.x += this.velocity.x
    this.position.y += this.velocity.y

    this.velocity.y = 0

    if (this.position.x + this.width >= canvas.width || this.position.x <= 0) {
      this.velocity.x = -this.velocity.x
      this.velocity.y = 30
    }
  }
}


// create a player
let game = {
  over: false,
  active: true
}
let score = 0
const player = new Player()
const projectiles = []
const grids = []
const invaderProjectiles = []
const particles = []

// 
const keys = {
  a: {
    pressed: false
  },
  d: {
    pressed: false
  }
}

const SPEED = 5
let frame = 0
let randomInterval = Math.floor(Math.random() * 500 + 500)

for (let i = 0; i < 100; i++) {
  particles.push(
    new Particles({
      position: {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
      },
      velocity: {
        x: 0,
        y: .3
      },
      radius: Math.random() * 3,
      color: 'white'
    })
  )
}

function createParticles({object, color, fade}) {
  for (let i = 0; i < 15; i++) {
    particles.push(
      new Particles({
        position: {
          x: object.position.x,
          y: object.position.y,
        },
        velocity: {
          x: (Math.random() - 0.5) * 2,
          y: (Math.random() - 0.5) * 2
        },
        radius: Math.random() * 3,
        color: color || '#BAA0DE',
        fade
      })
    )
  }
}

function animate() {
  if(!game.active) return
  requestAnimationFrame(animate)

  c.fillStyle = 'black';
  // c.fillStyle = 'rgba(0, 0, 0, 0.8)';
  c.fillRect(0, 0, canvas.width, canvas.height)
  player.update()

  // update particles
  particles.forEach((particle, index) => {

    if(particle.position.y + particle.radius > canvas.height) {
      particle.position.x = Math.random() * canvas.width
      particle.position.y = -particle.radius
    }

    if (particle.opacity <= 0) {
      setTimeout(() => {
        particles.splice(index, 1)
      }, 0)
    } else {
      particle.update()
    }
  })


  // update invader projectiles
  invaderProjectiles.forEach((invaderProjectile, index) => {
    if (invaderProjectile.position.y + invaderProjectile.height >= canvas.height) {
      setTimeout(() => {
        invaderProjectiles.splice(index, 1)
      }, 0)
    } else {
      invaderProjectile.update()
    }

    // collision a player
    if (
      invaderProjectile.position.y + invaderProjectile.height >= player.position.y &&
      invaderProjectile.position.y <= player.position.y + player.height &&
      invaderProjectile.position.x + invaderProjectile.width >= player.position.x &&
      invaderProjectile.position.x <= player.position.x + player.width
    ) {
      setTimeout(() => {
        invaderProjectiles.splice(index, 1)
        player.opacity = 0
        game.over = true

      }, 0)
      setTimeout(() => {
        game.active = false

      }, 2000)
      createParticles({object: player, color: 'white', fade: true })
    }
  })


  // remove and update projectiles
  projectiles.forEach((projectile, index) => {
    if (projectile.position.y + projectile.radius <= 0) {
      setTimeout(() => {
        projectiles.splice(index, 1)
      }, 0)
    } else {
      projectile.update()
    }
  })

  // spawn grid invaders
  grids.forEach((grid, gridIndex) => {
    grid.update()

    if (frame % 100 === 0 && grid.invaders.length > 0) {
      grid.invaders[Math.floor(Math.random() * grid.invaders.length)].shoot(invaderProjectiles)
    }
    grid.invaders.forEach((invader, ii) => {
      invader.update({ velocity: grid.velocity })

      projectiles.forEach((projectile, pi) => {
        if (
          projectile.position.y - projectile.radius <= invader.position.y + invader.height &&
          projectile.position.y + projectile.radius >= invader.position.y &&
          projectile.position.x - projectile.radius <= invader.position.x + invader.width &&
          projectile.position.x + projectile.radius >= invader.position.x
        ) {

          setTimeout(() => {
            const invadersFound = grid.invaders.find(invader2 => invader2 === invader)
            const projectileFound = projectiles.find(projectile2 => projectile2 === projectile)

            if (invadersFound && projectileFound) {
              projectiles.splice(pi, 1)
              grid.invaders.splice(ii, 1)
              createParticles({object: invader, fade: true })
              score += 100
              scoreEl.innerHTML = score

              if (grid.invaders.length > 0) {
                firstInvader = grid.invaders[0]
                lastInvader = grid.invaders[grid.invaders.length - 1]
                grid.width = lastInvader.position.x - firstInvader.position.x + 30
                grid.position.x = firstInvader.position.x
              } else {
                grids.splice(gridIndex, 1)
              }
            }
          }, 0)
        }
      })
    })
  })


  // check moving 
  if (keys.a.pressed && player.position.x >= 0) {
    player.velocity.x = -SPEED
    player.rotation = -.15
  } else if (keys.d.pressed && player.position.x + player.width <= canvas.width) {
    player.velocity.x = SPEED
    player.rotation = .15
  } else {
    player.velocity.x = 0
    player.rotation = 0
  }

  // console.log(frame)
  if (frame % randomInterval === 0) {
    grids.push(new Grid())
    frame = 0
    randomInterval = Math.floor(Math.random() * 500 + 500)
  }

  frame++
}

animate()


// start moving events
addEventListener('keydown', ({ key }) => {
  if(game.over) return
  switch (key) {
    case 'a':
      keys.a.pressed = true
      break;
    case 'd':
      keys.d.pressed = true
      break;
    case ' ':
      projectiles.push(new Projectile({
        position: { x: player.position.x + player.width / 2, y: player.position.y },
        velocity: { x: 0, y: -10 }
      }))
      break;
  }
})

// stop moving events
addEventListener('keyup', ({ key }) => {
  switch (key) {
    case 'a':
      keys.a.pressed = false
      break;
    case 'd':
      keys.d.pressed = false
      break;
    case ' ':
      // console.log('shoooot')
      break;
  }
})