export class Address {
  constructor (address){
    this.line = address?.line?.[0];
    this.city = address?.city;
    this.state = address?.state;
    this.postalCode = address?.postalCode;
    this.country = address?.country;
  }
  line: string
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export class Organization {
  constructor(organizationResource){
    this.address = new Address(organizationResource?.address?.[0]);
    this.name = organizationResource?.name;
    this.phone = organizationResource?.telecom?.[0]?.value;
  }
  name: string;
  phone: string;
  address: Address;
}

export class MappedServiceRequest {
  constructor(serviceRequestResource: any, organizationResource: any, taskResource?: any) {
    this.serviceRequestId = serviceRequestResource?.id;
    this.status = serviceRequestResource?.status;
    this.dateCreated = serviceRequestResource?.authoredOn;
    this.lastUpdated = serviceRequestResource?.meta?.lastUpdated;
    this.service = serviceRequestResource?.orderDetail?.[0]?.text;
    if (this.status === "active") {
      this.taskStatus = taskResource?.status;
      this.businessStatus = taskResource?.businessStatus?.coding?.[0]?.display;
      this.taskId = taskResource.id;
    }
    this.serviceProvider = new Organization(organizationResource);
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
}
