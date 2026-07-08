import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  standalone: true,
  selector: 'app-bot-message',
  imports: [MatIconModule],
  templateUrl: './bot-message.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './bot-message.component.css',
})
export class BotMessageComponent {
  @Input() time: string = '';
  @Input() isLoading: boolean = false;
}
