import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DialogStateService {
  private maximizeSource = new BehaviorSubject<boolean>(false);
  currentMaximizeState = this.maximizeSource.asObservable();

  constructor() {}

  updateMaximizeState(state: boolean) {
    this.maximizeSource.next(state);
  }
}
