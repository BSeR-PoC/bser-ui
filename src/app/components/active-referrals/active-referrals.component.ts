import { Component, OnInit } from '@angular/core';
import {MockDataRetrievalService} from "../../service/mock-data-retrieval.service";
import {MatTableDataSource} from "@angular/material/table";

@Component({
  selector: 'app-active-referrals',
  templateUrl: './active-referrals.component.html',
  styleUrls: ['./active-referrals.component.scss']
})
export class ActiveReferralsComponent implements OnInit {

  displayedColumns: string[] = ['service', 'serviceProvider', 'status', 'dateCreated', 'lastUpdated'];
  public dataSource = new MatTableDataSource<any>([]);
  constructor(private mockDataRetrievalService: MockDataRetrievalService) { }

  ngOnInit(): void {
    this.mockDataRetrievalService.getActiveReferrals()
      .subscribe({
        next: (data: any) => this.dataSource = data,
        error: console.error
      });
  }

}
