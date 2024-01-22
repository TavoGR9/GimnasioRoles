
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'product-management',
  templateUrl: './product-Management.component.html',
  styleUrls: ['./product-Management.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductManagementComponent { }
