import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {MatTableDataSource} from "@angular/material/table";
import {MockDataRetrievalService} from "../../service/mock-data-retrieval.service";
import {ServiceRequestHandlerService} from "../../service/service-request-handler.service";
import {Router} from "@angular/router";

@Component({
  selector: 'app-service-request-list',
  templateUrl: './service-request-list.component.html',
  styleUrls: ['./service-request-list.component.scss']
})
export class ServiceRequestListComponent implements OnInit, OnChanges {

  @Input() serviceRequest: any[];
  @Input() isLoading: boolean;

  displayedColumns: string[] = ['service', 'serviceProvider', 'status', 'dateCreated', 'lastUpdated', 'actions'];
  public dataSource = new MatTableDataSource<any>([]);

  constructor(
    private mockDataRetrievalService: MockDataRetrievalService,
    private serviceRequestHandlerService: ServiceRequestHandlerService,
    private router: Router) { }

  ngOnInit(): void {
  }

  onEdit(element) {
    this.router.navigate(['referral-manager', element.serviceRequestId])
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Data is loaded asynchronously and we set the table data source every time the data changes.
    // TODO this may be a performance issue, and we may need to load the data asynchronously and only once
    this.dataSource.data = this.serviceRequest;
  }



}
