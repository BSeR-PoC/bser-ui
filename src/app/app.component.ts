import { Component } from '@angular/core';
import  packageInfo from '../../package.json';
@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    standalone: false
})
export class AppComponent {
  title = 'bser-ui';
  version = packageInfo.version;
}
