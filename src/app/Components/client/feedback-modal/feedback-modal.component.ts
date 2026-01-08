import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FeedbackService } from '../../../../Services/feedback.service';


@Component({
  selector: 'app-feedback-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './feedback-modal.component.html',
  styleUrls: ['./feedback-modal.component.css']
})
export class FeedbackModalComponent {
  @Input() token: string = '';
  @Output() close = new EventEmitter<void>();

  rating: number = 0;
  feedbackTags: string[] = ["Vệ sinh không sạch sẽ", "Nhân viên không nhiệt tình", "Món ăn không ngon", "Món ăn phục vụ lâu", "Giá không phù hợp", "Không gian bất tiện", "Không gian ồn"];
  selectedTags: string[] = [];
  comment: string = '';
  phoneNumber: string = '';
  isSubmitting = false;

  constructor(private feedbackService: FeedbackService) {}

  setRating(star: number): void {
    this.rating = star;
  }

  toggleTag(tag: string): void {
    const index = this.selectedTags.indexOf(tag);
    if (index > -1) {
      this.selectedTags.splice(index, 1);
    } else {
      this.selectedTags.push(tag);
    }
  }

  submitFeedback(): void {
    if (this.rating === 0) {
      alert('Vui lòng chọn số sao đánh giá.');
      return;
    }

    this.isSubmitting = true;
    const feedbackData = {
      token: this.token,
      rating: this.rating,
      negativeFeedbackTags: this.selectedTags,
      comments: this.comment,
      customerPhoneNumber: this.phoneNumber
    };

    this.feedbackService.submitFeedback(feedbackData).subscribe({
      next: () => {
        alert('Cảm ơn bạn đã gửi đánh giá!');
        this.isSubmitting = false;
        this.close.emit();
      },
      error: (err) => {
        alert('Gửi đánh giá thất bại, vui lòng thử lại.');
        this.isSubmitting = false;
        console.error(err);
      }
    });
  }
}