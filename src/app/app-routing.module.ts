import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {LaunchComponent} from "./launch/launch.component";
import {ActiveReferralsComponent} from "./components/active-referrals/active-referrals.component";
import {ReferralManagerComponent} from "./components/referral-manager/referral-manager.component";

const routes: Routes = [
  { path: '', component: ActiveReferralsComponent},
  { path: 'referral-manager', component: ReferralManagerComponent},
  { path: 'launch', component: LaunchComponent},
  { // This path MUST ALWAYS be the last path!!!
    // Do not add any paths below this point or they will not work and will be redirected to landing.
    path: '**', redirectTo: ''
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
