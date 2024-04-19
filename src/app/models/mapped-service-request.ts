import {Organization} from "./organization";

export class MappedServiceRequest {
  constructor(serviceRequestResource: any, organizationResource: any, taskResource?: any) {
    this.serviceRequestId = serviceRequestResource?.id;
    this.status = serviceRequestResource?.status;
    this.dateCreated = serviceRequestResource?.authoredOn;
    this.lastUpdated = serviceRequestResource?.meta?.lastUpdated;
    this.service = serviceRequestResource?.orderDetail?.[0]?.text;
    if (this.status !== "draft") {
      this.taskStatus = taskResource?.status;
      this.businessStatus = taskResource?.businessStatus?.coding?.[0]?.display;
      this.taskId = taskResource.id;
    }
    this.serviceProvider = new Organization(organizationResource);
    this.supportingInfoRef = serviceRequestResource?.supportingInfo?.[0]?.reference;
  }
  serviceRequestId: string;
  status: string; // Service Request Status
  taskStatus?: string;
  taskId?: string;
  businessStatus?: string;
  dateCreated?: string;
  lastUpdated?: string;
  service?: string;
  serviceProvider?: Organization;
  supportingInfoRef: string;
}
