import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-profile-main',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './profile-main.component.html',
  styleUrl: './profile-main.component.css'
})
export class ProfileMainComponent {
  activeTab: 'medicos' | 'preferencias' = 'preferencias';

  alergias: string[] = [];
  alergiaInput: string = '';

  agrada: string[] = [];
  agradaInput: string = '';

  noAgrada: string[] = [];
  noAgradaInput: string = '';

  setActiveTab(tab: 'medicos' | 'preferencias') {
    this.activeTab = tab;
  }

  addAlergia() {
    const val = this.alergiaInput.trim();
    if (val && !this.alergias.includes(val)) {
      this.alergias.push(val);
    }
    this.alergiaInput = '';
  }

  removeAlergia(item: string) {
    this.alergias = this.alergias.filter(a => a !== item);
  }

  addAgrada() {
    const val = this.agradaInput.trim();
    if (val && !this.agrada.includes(val)) {
      this.agrada.push(val);
    }
    this.agradaInput = '';
  }

  removeAgrada(item: string) {
    this.agrada = this.agrada.filter(a => a !== item);
  }

  addNoAgrada() {
    const val = this.noAgradaInput.trim();
    if (val && !this.noAgrada.includes(val)) {
      this.noAgrada.push(val);
    }
    this.noAgradaInput = '';
  }

  removeNoAgrada(item: string) {
    this.noAgrada = this.noAgrada.filter(a => a !== item);
  }

  onAlergiaKey(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.addAlergia();
    }
  }

  onAgradaKey(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.addAgrada();
    }
  }

  onNoAgradaKey(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.addNoAgrada();
    }
  }
}
