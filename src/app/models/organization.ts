import {Address} from "./address";

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
