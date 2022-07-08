import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {LaunchComponent} from "./launch/launch.component";
import {ActiveRefferalsComponent} from "./components/active-refferals/active-refferals.component";

const routes: Routes = [
  { path: '', component: ActiveRefferalsComponent},
  { path: 'launch', component: LaunchComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
