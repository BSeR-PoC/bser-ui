export class MappedServiceRequest {
  constructor(serviceRequestResource: any, performerOrganizationResource: any, taskResource?: any) {
    this.serviceRequestId = serviceRequestResource?.id;
    this.status = serviceRequestResource?.status;
    this.serviceProvider = performerOrganizationResource?.name;
    this.dateCreated = serviceRequestResource?.authoredOn;
    this.lastUpdated = serviceRequestResource?.meta?.lastUpdated;
    this.service = serviceRequestResource?.orderDetail?.[0]?.text;
    if (this.status === "active") {
      this.taskStatus = taskResource?.status;
      this.businessStatus = taskResource?.businessStatus?.coding?.[0]?.display;
      this.taskId = taskResource.id;
    }
  }
  serviceRequestId: string;
  status: string; // Service Request Status
  taskStatus?: string;
  taskId?: string;
  businessStatus?: string;
  dateCreated?: string;
  lastUpdated?: string;
  service?: string;
  serviceProvider?: string;
}
