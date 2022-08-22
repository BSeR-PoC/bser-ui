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
  isLoading: boolean = false;

  constructor(private mockDataRetrievalService: MockDataRetrievalService) { }

  getActiveReferrals(){

    this.isLoading = true;

    this.mockDataRetrievalService.getActiveReferrals()
      .subscribe({
        next: (data: any) => {
          this.dataSource = data;
          this.isLoading = false;
        },
        error: (err) => {
          console.error(err);
          this.isLoading = false;
        }
      });
  }

  ngOnInit(): void {
    this.getActiveReferrals();
  }

}
