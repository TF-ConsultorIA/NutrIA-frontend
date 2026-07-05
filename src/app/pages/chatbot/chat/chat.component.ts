import { Component, signal, ChangeDetectionStrategy } from '@angular/core';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { UserMessageComponent } from '../components/user-message/user-message.component';
import { BotMessageComponent } from '../components/bot-message/bot-message.component';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-chat',
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonToggleModule,
    BotMessageComponent,
    UserMessageComponent,
  ],
  templateUrl: './chat.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './chat.component.css',
})
export class ChatComponent {
  chatMode = signal<'recomendacion' | 'soporte'>('recomendacion');
}
