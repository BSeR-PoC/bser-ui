import { Component, OnInit } from '@angular/core';

export interface Referrals {
  service: string;
  serviceProvider: string;
  status: string;
  dateCreated: string;
  lastUpdated: string;
}

const REFERRALS_DATA: Referrals[] = [
  { service: '(Not Selected)', serviceProvider: 'YMCA', status: 'Draft', dateCreated: '05/02/2022', lastUpdated: '05/02/2022' },
  { service: 'Diabetes Prevention', serviceProvider: 'YMCA', status: 'Accepted', dateCreated: '01/02/2022', lastUpdated: '05/02/2022' },
  { service: 'Tobacco Cessation', serviceProvider: 'Tobacco Support USA', status: 'Completed',  dateCreated: '05/01/2022', lastUpdated: '05/02/2022' },
];


@Component({
  selector: 'app-active-referrals',
  templateUrl: './active-referrals.component.html',
  styleUrls: ['./active-referrals.component.scss']
})
export class ActiveReferralsComponent implements OnInit {
  displayedColumns: string[] = ['service', 'serviceProvider', 'status', 'dateCreated', 'lastUpdated'];
  dataSource = REFERRALS_DATA;
  constructor() { }

  ngOnInit(): void {
  }

}
