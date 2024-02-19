import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {MockDataRetrievalService} from "../../service/mock-data-retrieval.service";
import {ServiceRequestHandlerService} from "../../service/service-request-handler.service";
import {Router} from "@angular/router";
import {openConformationDialog} from "../conformation-dialog/conformation-dialog.component";
import {UtilsService} from "../../service/utils.service";
import {MatTableDataSource} from "@angular/material/table";
import {MatDialog} from "@angular/material/dialog";
import {ServiceRequestStatusType} from "../../domain/service-request-status-type";

@Component({
  selector: 'app-service-request-list',
  templateUrl: './service-request-list.component.html',
  styleUrls: ['./service-request-list.component.scss']
})
export class ServiceRequestListComponent implements OnInit, OnChanges {

  @Input() serviceRequest: any[];
  @Input() isLoading: boolean;
  @Input() serviceRequestType: ServiceRequestStatusType;
  @Output() serviceRequestDeletedEvent = new EventEmitter();

  displayedColumns: string[] = ['service', 'serviceProvider', 'status', 'dateCreated', 'lastUpdated'];
  public dataSource = new MatTableDataSource<any>([]);
  protected readonly ServiceRequestStatusType = ServiceRequestStatusType;

  constructor(
    private mockDataRetrievalService: MockDataRetrievalService,
    private serviceRequestHandlerService: ServiceRequestHandlerService,
    private router: Router,
    private dialog: MatDialog,
    private utilsService: UtilsService) { }

  ngOnInit(): void {
  }

  onEdit(serviceRequest) {
    this.router.navigate(['referral-manager', serviceRequest.serviceRequestId]);
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Data is loaded asynchronously and we set the table data source every time the data changes.
    // TODO this may be a performance issue, and we may need to load the data asynchronously and only once
    if(this.serviceRequestType == ServiceRequestStatusType.draft && (this.displayedColumns.indexOf('actions') == -1)){
      this.displayedColumns.push('actions')
    }
    else if (this.serviceRequestType != ServiceRequestStatusType.draft && this.displayedColumns.indexOf('actions') != -1){
      this.displayedColumns = this.displayedColumns.filter(column => column != 'actions')
    }
    this.dataSource.data = this.serviceRequest;
  }


  onRowClick(serviceRequest) {
    this.router.navigate(['referral-manager', serviceRequest.serviceRequestId]);
  }

  deleteServiceRequest(serviceRequest){
    this.serviceRequestHandlerService.deleteServiceRequest(serviceRequest.serviceRequestId).subscribe({
      next: value => {
        this.serviceRequestDeletedEvent.emit();
        this.utilsService.showSuccessNotification("Referral deleted successfully.");
      },
      error: err => console.error(err)
    })
  }

  onDelete(serviceRequest) {
    openConformationDialog(
      this.dialog,
      {
        title: "Discard Referral",
        content: "Discard the " + serviceRequest.status + " referral for " + serviceRequest.service + ' provided by ' + serviceRequest.serviceProvider + '?',
        defaultActionBtnTitle: "Cancel",
        secondaryActionBtnTitle: "Discard",
        width: "30em",
        height: "14em"
      })
      .subscribe(
        action => {
          if (action == 'defaultAction') {
            this.router.navigate(['/']);
          }
          else if (action == 'secondaryAction') {
            this.deleteServiceRequest(serviceRequest);
          }
        }
      )
  }
}
