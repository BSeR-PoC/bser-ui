import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {LaunchComponent} from "./launch/launch.component";
import {ActiveReferralsComponent} from "./components/active-referrals/active-referrals.component";
import {ReferralManagerComponent} from "./components/referral-manager/referral-manager.component";
import { ServiceRequestTesterComponent } from './service-request-tester/service-request-tester.component';
import {RegistrationComponent} from "./components/registration/registration.component";

const routes: Routes = [
  { path: '', component: ActiveReferralsComponent},
  { path: 'referral-manager/:id', component: ReferralManagerComponent},
  { path: 'referral-manager', component: ReferralManagerComponent},
  { path: 'launch', component: LaunchComponent},
  { path: 'register', component: RegistrationComponent},
  { path: 'servicerequesttest', component: ServiceRequestTesterComponent},
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
