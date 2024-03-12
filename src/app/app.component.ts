import { Component } from '@angular/core';
import {Router} from "@angular/router";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
   constructor(private router: Router) {
     // The ap should always navigate the browser to root if the page is refreshed, because we only load the data once
    this.router.navigate(['/']);
  }
}
