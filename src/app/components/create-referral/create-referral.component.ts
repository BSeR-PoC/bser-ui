import {Component, OnInit, ViewChild} from '@angular/core';

@Component({
  selector: 'app-create-referral',
  templateUrl: './create-referral.component.html',
  styleUrls: ['./create-referral.component.scss']
})
export class CreateReferralComponent implements OnInit {

  constructor(
  ) { }

  ngOnInit(): void {
  }

  isStepCompleted(stepNumber: number): boolean {
    return true;
  }

}
