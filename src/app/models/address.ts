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
