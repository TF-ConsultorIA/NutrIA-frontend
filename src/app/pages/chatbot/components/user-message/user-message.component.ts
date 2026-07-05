import { Component, Input } from '@angular/core';
import { MatIconModule } from "@angular/material/icon";

@Component({
  standalone: true,
  selector: 'app-user-message',
  imports: [MatIconModule],
  templateUrl: './user-message.component.html',
  styleUrl: './user-message.component.css',
})
export class UserMessageComponent {
  @Input() time: string = '';
}
