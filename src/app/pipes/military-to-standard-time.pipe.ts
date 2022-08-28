import { Pipe, PipeTransform } from '@angular/core';

/*
Angular does not provide pipe for transforming time
used the pipe solution from:
https://stackoverflow.com/questions/50362854/how-to-change-time-from-24-to-12-hour-format-in-angular-5
*/

@Pipe({
  name: 'militaryToStandardTime'
})
export class MilitaryToStandardTimePipe implements PipeTransform {
  transform(time: any): any {
    let hour = (time.split(':'))[0]
    let min = (time.split(':'))[1]
    let part = hour > 12 ? 'pm' : 'am';
    if(parseInt(hour) == 0)
      hour = 12;
    min = (min+'').length == 1 ? `0${min}` : min;
    hour = hour > 12 ? hour - 12 : hour;
    hour = (hour+'').length == 1 ? `0${hour}` : hour;
    return `${hour}:${min} ${part}`
  }

}
