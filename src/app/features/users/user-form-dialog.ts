import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import {
  AbstractControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';

import { MIN_PASSWORD_LENGTH } from '../../core/auth/password';
import { UserRepository } from '../../core/data/user-repository';
import { describeError } from '../../core/errors';
import { collapseSpaces } from '../../domain/text';
import { AppUser, GENDERS, UserProfile } from '../../domain/user';
import { guardDialogClose } from '../../shared/ui/dialog-guard';
import { NotificationService } from '../../shared/ui/notification-service';

export interface UserFormData {
  /** Usuário em edição. Sem este campo, o formulário é de inclusão. */
  readonly user?: AppUser;
}

export interface UserFormResult {
  readonly created: boolean;
}

@Component({
  selector: 'app-user-form-dialog',
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './user-form-dialog.html',
  styleUrl: './user-form-dialog.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserFormDialog {
  private readonly data = inject<UserFormData>(MAT_DIALOG_DATA);
  private readonly ref = inject<MatDialogRef<UserFormDialog, UserFormResult>>(MatDialogRef);
  private readonly repository = inject(UserRepository);
  private readonly notifications = inject(NotificationService);
  private readonly fb = inject(NonNullableFormBuilder);

  protected readonly user = this.data.user;
  protected readonly editing = !!this.user;
  protected readonly genders = GENDERS;
  protected readonly minPasswordLength = MIN_PASSWORD_LENGTH;
  protected readonly saving = signal(false);
  protected readonly showPassword = signal(false);

  private readonly uniqueUsername: ValidatorFn = (control: AbstractControl) =>
    this.repository.isUsernameTaken(String(control.value ?? ''), this.user?.id)
      ? { usernameTaken: true }
      : null;

  protected readonly form = this.fb.group({
    username: [
      this.user?.username ?? '',
      [Validators.required, Validators.maxLength(30), this.uniqueUsername],
    ],
    name: [this.user?.name ?? '', [Validators.required, Validators.maxLength(120)]],
    gender: [this.user?.gender ?? '', Validators.required],
    // Na edição, a senha é opcional: em branco mantém a senha atual.
    password: [
      '',
      this.editing
        ? [Validators.minLength(MIN_PASSWORD_LENGTH)]
        : [Validators.required, Validators.minLength(MIN_PASSWORD_LENGTH)],
    ],
  });

  protected readonly requestClose = guardDialogClose(() => this.form.dirty);

  protected passwordError(): string {
    const control = this.form.controls.password;
    if (control.hasError('required')) return 'Informe a senha.';
    if (control.hasError('minlength')) {
      return `A senha deve ter pelo menos ${MIN_PASSWORD_LENGTH} caracteres.`;
    }
    return '';
  }

  protected clear(): void {
    this.form.reset({ username: '', name: '', gender: '', password: '' });
  }

  protected async save(): Promise<void> {
    if (this.saving()) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const profile: UserProfile = {
      username: collapseSpaces(value.username),
      name: collapseSpaces(value.name),
      gender: value.gender,
    };

    this.saving.set(true);
    try {
      if (this.user) {
        await this.repository.update(this.user.id, profile, value.password || undefined);
        this.ref.close({ created: false });
      } else {
        await this.repository.create(profile, value.password);
        this.ref.close({ created: true });
      }
    } catch (error) {
      this.notifications.error(describeError(error, 'Não foi possível salvar o usuário.'));
    } finally {
      this.saving.set(false);
    }
  }
}
