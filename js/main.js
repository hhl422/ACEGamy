import Player from './player/index'
import Enemy from './npc/enemy'
import BackGround from './runtime/background'
import GameInfo from './runtime/gameinfo'
import Music from './runtime/music'
import DataBus from './databus'
import MyEnemy from './npc/myenemy'

let ctx = canvas.getContext('2d')
let databus = new DataBus()
var time
/**
 * 游戏主函数
 */
export default class Main {
  constructor() {
    // 维护当前requestAnimationFrame的id
    this.aniId = 0

    this.restart()
  }

  restart() {
    databus.reset()

    canvas.removeEventListener(
      'touchstart',
      this.touchHandler
    )
    this.bg = new BackGround(ctx)
    this.enemyGenerate()
    this.player = new Player(ctx)
    this.gameinfo = new GameInfo()
    //this.music = new Music()
    this.time=setInterval(function () { upscore() }, 3000)
    this.bindLoop = this.loop.bind(this)
    this.hasEventBind = false

    // 清除上一局的动画
    window.cancelAnimationFrame(this.aniId);

    this.aniId = window.requestAnimationFrame(
      this.bindLoop,
      canvas
    )

  }

  /**
   * 随着帧数变化的敌机生成逻辑
   * 帧数取模定义成生成的频率
   */
  enemyGenerate() {
    for (var i = 0; i < 15; i++) {
      let enemy = databus.pool.getItemByClass('enemy', Enemy)
      enemy.init(1)
      databus.enemys.push(enemy)
    }
    // for (var i = 0; i < 3; i++) {
    //   let enemy1 = databus.pool.getItemByClass('myenemy', MyEnemy)
    //   enemy1.init(1)
    //   databus.enemys.push(enemy1)
    // }
  }

  // 全局碰撞检测
  collisionDetection() {

    for (let i = 0, il = databus.enemys.length; i < il - 1; i++) {
      let enemy = databus.enemys[i]
      for (let j = i + 1; j < il; j++) {
        let enemy1 = databus.enemys[j]
        if (!enemy.isPlaying && enemy.isCollideBetween(enemy1)) {
          var deltaX=(enemy.x-enemy1.x)/2/10
          var deltaY=(enemy.y-enemy1.y)/2/10
          enemy.x+=deltaX
          enemy1.x -= deltaX
          enemy.y += deltaY
          enemy1.y -= deltaY
          var deltaXspeed = enemy.Xspeed - enemy1.Xspeed
          var deltaYspeed = enemy.Yspeed - enemy1.Yspeed
          enemy.Xspeed = (enemy.Xspeed - deltaXspeed)
          enemy1.Xspeed = (enemy1.Xspeed + deltaXspeed)
          enemy.Yspeed = (enemy.Yspeed - deltaYspeed)
          enemy1.Yspeed = (enemy1.Yspeed + deltaYspeed) 

          break
        }
      }
    }

    for (let i = 0, il = databus.enemys.length; i < il; i++) {
      let enemy = databus.enemys[i]

      if (this.player.isCollideBetween(enemy)) {
        enemy.playAnimation()
        databus.death+=1
        //that.music.playExplosion()
        break
      }
    }
    if (databus.enemys.length - databus.death == 3) {
      clearInterval(this.time)
      databus.gameOver = true
    }
  }

  // 游戏结束后的触摸事件处理逻辑
  touchEventHandler(e) {
    e.preventDefault()

    let x = e.touches[0].clientX
    let y = e.touches[0].clientY

    let area = this.gameinfo.btnArea

    if (x >= area.startX
      && x <= area.endX
      && y >= area.startY
      && y <= area.endY)
      this.restart()
  }

  /**
   * canvas重绘函数
   * 每一帧重新绘制所有的需要展示的元素
   */
  render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    this.bg.render(ctx)

    databus.enemys.forEach((item) => {
      item.drawToCanvas(ctx)
    })
    this.player.drawToCanvas(ctx)

    databus.animations.forEach((ani) => {
      if (ani.isPlaying) {
        ani.aniRender(ctx)
      }
    })

    this.gameinfo.renderGameScore(ctx, databus.score)

    // 游戏结束停止帧循环
    if (databus.gameOver) {
      this.gameinfo.renderGameOver(ctx, databus.score)

      if (!this.hasEventBind) {
        this.hasEventBind = true
        this.touchHandler = this.touchEventHandler.bind(this)
        canvas.addEventListener('touchstart', this.touchHandler)
      }
    }
  }

  // 游戏逻辑更新主函数
  update() {
    if (databus.gameOver)
      return;

    this.bg.update()

    databus.enemys
      .forEach((item) => {
        item.update()
      })

    this.collisionDetection()
  }

  // 实现游戏帧循环
  loop() {
    databus.frame++

    this.update()
    this.render()

    this.aniId = window.requestAnimationFrame(
      this.bindLoop,
      canvas
    )
  }
}
function upscore(){
  databus.score+=1
  databus.s = databus.s*1.5
}