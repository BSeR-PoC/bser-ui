import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'daysOfWeek'
})
export class DaysOfWeekPipe implements PipeTransform {

  transform(value: string): string {
    switch (value) {
      case "mon": {
        return "Monday";
        break;
      }
      case "tue": {
        return "Tuesday";
        break;
      }
      case "wed": {
        return "Wednesday";
        break;
      }
      case "thu": {
        return "Thursday";
        break;
      }
      case "fri": {
        return "Friday";
        break;
      }
      case "sat": {
        return "Saturday";
        break;
      }
      case "sun": {
        return "Saturday";
        break;
      }
      default:
        console.error(`Unable to convert ${value} do a day of the week`);
        return null;
    }
  }
}
