import { Component, OnInit } from '@angular/core';
import { remove } from 'lodash';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  gameStarted = false;
  gameOver = false;
  gameWon = false;
  bases: string[] = ['cube', 'hexagon', 'sphere'];
  sauces: string[] = ['sauce 1', 'sauce 2'];
  spices: string[] = ['salt', 'pepper', 'garlic'];
  orders: any[] = [];
  dogOrdering = false;
  dogTime = 10;
  completedOrders = 1;
  stage: any;
  orderCreateInterval: any;
  orderCheckInterval: any;
  robodogInterval: any;
  now: number;

  constructor() {}

  ngOnInit() {
    console.log('dome dashin');
  }

  startGame() {
    this.now = new Date().getTime();
    this.gameStarted = true;
    this.resetStage();
    // set up interval to create orders
    this.createOrders();
    // set up initial order
    this.createNewOrder(15000);
    // set up interval to update/check game state
    this.orderCheckInterval = setInterval(() => this.checkGameState(), 1000);
  }

  checkGameState() {
    this.now = new Date().getTime();
    this.orders.forEach(order => {
      this.updateOrderStatus(order, this.now);
    });
    if (this.getMissedOrders() >= 10) {
      this.gameOver = true;
    }
    if (this.completedOrders >= 100) {
      this.gameWon = true;
    }
  }

  toggleIngredient(type, ing): void {
    // set the stage type (base/sauce/spice) to selected ingredient or null
    this.stage[type] === ing ? this.stage[type] = null : this.stage[type] = ing;
  }

  resetStage(): void {
    this.stage = { base: null, spice: null, sauce: null };
  }

  updateOrderStatus(order, now) {
    if (now > order.time) {
      this.expireOrder(order);
    }
  }

  expireOrder(order) {
    this.orders = this.orders.map(o => {
      if (o.time === order.time && !order.completed) {
        o.expired = true;
      }
      return o;
    });
  }

  serveDish(order) {
    // if all of the plated ingredients are correct, mark order as completed
    if (order.base === this.stage.base && order.spice === this.stage.spice && order.sauce === this.stage.sauce) {
      this.completedOrders++;
      this.orders = this.orders.map(o => {
        if (o.time === order.time && !order.expired) {
          o.completed = true;
        }
        return o;
      });
    } else {
      // if one or more of the plated ingredients are incorrect, mark as expired
      this.expireOrder(order);
    }
    // empty the plate
    this.resetStage();
  }

  createNewOrder(timeToComplete) {
    this.orders.push({
      base: this.bases[Math.floor(Math.random() * this.bases.length)],
      sauce:  this.sauces[Math.floor(Math.random() * this.sauces.length)],
      spice:  this.spices[Math.floor(Math.random() * this.spices.length)],
      time: this.now + timeToComplete,
      expired: false,
      completed: false
    });
  }

  getActiveOrders(): number {
    // the number of orders that are still active
    return this.orders.reduce((acc, curr) => curr.expired || curr.completed ? acc : acc + 1, 0);
  }

  getMissedOrders(): number {
    // the number of orders that were missed
    return this.orders.reduce((acc, curr) => !curr.expired ? acc : acc + 1, 0);
  }

  roboDog(): void {
    this.dogOrdering = true;
    this.robodogInterval = setInterval(() => this.dogTime--, 1000);
    setTimeout(() => {
      if (this.dogOrdering) {
        this.gameOver = true;
      }
      this.dogTime = 10;
      clearInterval(this.robodogInterval);
    }, 10000);
  }

  giveBone(): void {
    this.dogOrdering = false;
    clearInterval(this.robodogInterval);
  }

  createOrders(): void {
    // order interval and time to complete interval times decrease as orders completed increases
    const baseCreationTime = 8000;
    let orderCreationTime = baseCreationTime;
    const timeToComplete = 20000;

    if (!this.gameOver) {
      this.orderCreateInterval = () => {
          const activeOrders = this.getActiveOrders(); // orders that are not expired or completed
          if (activeOrders <= this.completedOrders + 1 && activeOrders < 3) {
            this.createNewOrder(timeToComplete);
          }
          // robo dog is triggered every 15 orders put in!
          if (!(this.orders.length % 15)) {
            this.roboDog();
          }
          clearInterval(orderInterval);
          orderCreationTime = this.completedOrders > 2 ? 1 / Math.log(this.completedOrders) * baseCreationTime : baseCreationTime;
          orderInterval = setInterval(this.orderCreateInterval, orderCreationTime);
      };
      let orderInterval = setInterval(this.orderCreateInterval, orderCreationTime);
    }
  }

  onDestroy() {
    clearInterval(this.orderCreateInterval);
    clearInterval(this.orderCheckInterval);
  }

}
