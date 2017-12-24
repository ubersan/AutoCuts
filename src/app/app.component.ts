import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'app';

  start() {
    console.log("start called")
    testOut();
    console.log(myAddon.factorial(5))
  }
}
