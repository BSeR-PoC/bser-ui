// TODO delete this code if we find a way to use another library
export class BloodPressure {

  name: string;
  part: any[];

  constructor(diastolic: number, systolic: number, valueDateTime: string){
    this.name = "bloodPressure";
    this.part = [
      {
        name: "date",
        valueDateTime: valueDateTime
      },
      {
        name: "diastolic",
        valueQuantity : {
          value : diastolic,
          unit : "mmHg",
          system : "http://unitsofmeasure.org",
          code : "mm[Hg]"
        }
      },
      {
        name: "systolic",
        valueQuantity : {
          value : systolic,
          unit : "mmHg",
          system : "http://unitsofmeasure.org",
          code : "mm[Hg]"
        }
      }
    ]
  }
}
