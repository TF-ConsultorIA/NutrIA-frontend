import {
  Component,
  signal,
  ChangeDetectionStrategy,
  inject,
  ViewChild,
  ElementRef,
  effect,
} from '@angular/core';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { UserMessageComponent } from '../components/user-message/user-message.component';
import { BotMessageComponent } from '../components/bot-message/bot-message.component';
import { CommonModule } from '@angular/common';
import { MarkdownComponent } from 'ngx-markdown';
import { ChatMessage } from '../../../models/chatbot';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ChatbotService } from '../../../services/chatbot.service';
import { take } from 'rxjs';

@Component({
  standalone: true,
  selector: 'app-chat',
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonToggleModule,
    BotMessageComponent,
    UserMessageComponent,
    MarkdownComponent,
    ReactiveFormsModule,
  ],
  templateUrl: './chat.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './chat.component.css',
})
export class ChatComponent {
  chatMode = signal<'recomendacion' | 'soporte'>('recomendacion');
  private fb = inject(FormBuilder);
  private chatbotService = inject(ChatbotService);
  @ViewChild('chatScrollContainer') private scrollContainer!: ElementRef;

  isLoading = signal(false);

  messageForm = this.fb.group({
    message: [''],
  });

  protected readonly now = () => new Date();

  messagesChat = signal<ChatMessage[]>([
    { message: '¡Hola! 👋 Soy NutriBot.', sender: 'bot', date: new Date() },
  ]);

  constructor() {
    effect(() => {
    this.messagesChat();
    this.isLoading();

    setTimeout(() => {
      this.scrollToBottom();
    }, 100);
  });
  }

  sendMessage() {
    const message = this.messageForm.get('message')?.value;

    if (!message) return;

    this.messagesChat.update((messages) => [
      ...messages,
      { message, sender: 'user', date: new Date() },
    ]);

    if (this.chatMode() === 'recomendacion') {
      this.isLoading.set(true);
      this.chatbotService
        .recommendation({ message })
        .pipe(take(1))
        .subscribe((response) => {
          this.messagesChat.update((messages) => [
            ...messages,
            { message: response.reply, sender: 'bot', date: response.date },
          ]);
          this.isLoading.set(false);
        });
    } else if (this.chatMode() === 'soporte') {
      this.isLoading.set(true);
      this.chatbotService
        .support({ message })
        .pipe(take(1))
        .subscribe((response) => {
          this.messagesChat.update((messages) => [
            ...messages,
            { message: response.reply, sender: 'bot', date: response.date },
          ]);
          this.isLoading.set(false);
        });
    }

    this.messageForm.reset();
  }

  private scrollToBottom(): void {
    try {
      const element = this.scrollContainer.nativeElement;
      element.scrollTo({
        top: element.scrollHeight,
        behavior: 'smooth',
      });
    } catch (err) {
      // Ignorar errores si el contenedor aún no existe
    }
  }
}
