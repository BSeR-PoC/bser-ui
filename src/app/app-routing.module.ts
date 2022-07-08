import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {LaunchComponent} from "./launch/launch.component";
import {ActiveReferralsComponent} from "./components/active-referrals/active-referrals.component";

const routes: Routes = [
  { path: '', component: ActiveReferralsComponent},
  { path: 'launch', component: LaunchComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
