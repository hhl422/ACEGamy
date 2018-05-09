import Animation from '../base/animation'
import Enemy from './enemy'

const ENEMY_IMG_SRC1 = 'images/xiao1.png'

const ENEMY_WIDTH = 40
const ENEMY_HEIGHT = 40
const ENEMY_DIAMETER = 40


export default class MyEnemy extends Enemy {
  constructor() {
    super(ENEMY_IMG_SRC1)
    this.initExplosionAnimation()
  }
}