import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {LaunchComponent} from "./components/launch/launch.component";
import {ReferralManagerComponent} from "./components/referral-manager/referral-manager.component";
import {RegistrationComponent} from "./components/registration/registration.component";
import {LandingComponent} from "./components/landing/landing.component";
import {ActiveReferralsComponent} from "./components/active-referrals/active-referrals.component";

const routes: Routes = [
  { path: '', component: LandingComponent},
  { path: 'referral-manager/:id', component: ReferralManagerComponent},
  { path: 'referral-manager', component: ReferralManagerComponent},
  { path: 'referral-viewer/:id', component: ActiveReferralsComponent},
  { path: 'launch', component: LaunchComponent},
  { path: 'register', component: RegistrationComponent},
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
