import { Component } from '@angular/core';

//import {testOut} from '../myjslib'

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
  }
}
