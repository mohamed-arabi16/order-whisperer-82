import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star, MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/useTranslation";

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenantId: string;
  restaurantName: string;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose,
  tenantId,
  restaurantName,
}) => {
  const { t, isRTL } = useTranslation();
  const { toast } = useToast();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [hoveredStar, setHoveredStar] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      toast({
        title: t("common.error"),
        description: t("restaurant.feedback.error.rating"),
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('feedback')
        .insert({
          tenant_id: tenantId,
          rating,
          comment: comment.trim() || null,
        });

      if (error) throw error;

      toast({
        title: t("restaurant.feedback.success.title"),
        description: t("restaurant.feedback.success.description"),
      });

      setRating(0);
      setComment('');
      onClose();
    } catch (error: any) {
      console.error('Error submitting feedback:', error);
      toast({
        title: t("common.error"),
        description: t("restaurant.feedback.error.submit"),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setRating(0);
    setComment('');
    setHoveredStar(0);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md" dir={isRTL ? 'rtl' : 'ltr'}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            {t("restaurant.feedback.modal.title")} {restaurantName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Rating Stars */}
          <div className="space-y-2">
            <label className="text-sm font-medium">{t("restaurant.feedback.rating.required")}</label>
            <div className="flex gap-1 justify-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredStar(star)}
                  onMouseLeave={() => setHoveredStar(0)}
                  className="transition-all duration-200 hover:scale-110"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= (hoveredStar || rating)
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-muted-foreground'
                    }`}
                  />
                </button>
              ))}
            </div>
            <div className="text-center text-sm text-muted-foreground">
              {rating > 0 && (
                <span>
                  {rating === 1 && t("restaurant.feedback.rating.poor")}
                  {rating === 2 && t("restaurant.feedback.rating.ok")}
                  {rating === 3 && t("restaurant.feedback.rating.good")}
                  {rating === 4 && t("restaurant.feedback.rating.excellent")}
                  {rating === 5 && t("restaurant.feedback.rating.great")}
                </span>
              )}
            </div>
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <label className="text-sm font-medium">{t("restaurant.feedback.comment")}</label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={t("restaurant.feedback.commentPlaceholder")}
              rows={3}
              maxLength={500}
            />
            <div className="text-xs text-muted-foreground text-right">
              {comment.length}/500
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1"
            >
              {t("restaurant.feedback.modal.cancel")}
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={rating === 0 || isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? t("restaurant.feedback.modal.submitting") : t("restaurant.feedback.modal.submit")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};