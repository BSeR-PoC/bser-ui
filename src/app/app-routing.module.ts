import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {MainComponent} from "./main/main.component";
import {LaunchComponent} from "./launch/launch.component";

const routes: Routes = [
  { path: '', component: MainComponent},
  { path: 'launch', component: LaunchComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
