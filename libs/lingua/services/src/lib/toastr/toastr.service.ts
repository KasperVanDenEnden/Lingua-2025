import { Injectable, inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private toastr = inject(ToastrService);

  success(message: string) {
    this.toastr.success(message, 'Success');
  }

  error(message: string) {
    this.toastr.error(message, 'Error!');
  }

  info(message: string) {
    this.toastr.info(message, 'Info');
  }

  warning(message: string) {
    this.toastr.warning(message, 'Warning');
  }

  custom(message: string, title: string) {
    this.toastr.show(message, title);
  }

  // Nieuwe methode voor notificaties met kopieerbare tekst
  copyToClipboard(title = 'Copy to clipboard:', textToCopy: string) {
    const messageWithCopyText = `Copy to clipboard: <span class="copy-text-btn">${textToCopy}</span>`;

    const toast = this.toastr.info(messageWithCopyText, title, {
      enableHtml: true,
      tapToDismiss: false,
    });

    if (toast) {
      toast.onTap.subscribe(() => {
        navigator.clipboard
          .writeText(textToCopy)
          .then(() => {
            this.toastr.success('Text copied to clipboard!', 'Success');
          })
          .catch((err) => {
            this.toastr.error(`Couldn't copy: ` + err, 'Error');
          });
      });
    }
  }
}
