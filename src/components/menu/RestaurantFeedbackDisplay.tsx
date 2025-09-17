import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, ThumbsUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "@/hooks/useTranslation";

/**
 * @interface FeedbackDisplayProps
 * @property {string} tenantId - The ID of the tenant whose feedback is to be displayed.
 */
interface FeedbackDisplayProps {
  tenantId: string;
}

/**
 * @interface FeedbackData
 * @property {number} rating - The rating given in the feedback.
 * @property {string} [comment] - The comment left in the feedback.
 * @property {string} created_at - The timestamp when the feedback was created.
 */
interface FeedbackData {
  rating: number;
  comment?: string;
  created_at: string;
}

/**
 * @interface FeedbackStats
 * @property {number} averageRating - The average rating of the restaurant.
 * @property {number} totalFeedback - The total number of feedback entries.
 * @property {FeedbackData[]} recentComments - An array of recent comments.
 */
interface FeedbackStats {
  averageRating: number;
  totalFeedback: number;
  recentComments: FeedbackData[];
}

/**
 * A component that displays feedback statistics and recent comments for a restaurant.
 */
export const RestaurantFeedbackDisplay: React.FC<FeedbackDisplayProps> = ({ tenantId }) => {
  const { t, isRTL } = useTranslation();
  const [feedbackStats, setFeedbackStats] = useState<FeedbackStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeedbackStats();
  }, [tenantId]);

  const fetchFeedbackStats = async () => {
    try {
      const { data: feedback, error } = await supabase
        .from('feedback')
        .select('rating, comment, created_at')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      if (feedback && feedback.length > 0) {
        const averageRating = feedback.reduce((acc, f) => acc + f.rating, 0) / feedback.length;
        const recentComments = feedback.filter(f => f.comment && f.comment.trim() !== '').slice(0, 3);
        
        setFeedbackStats({
          averageRating: Math.round(averageRating * 10) / 10,
          totalFeedback: feedback.length,
          recentComments: recentComments as FeedbackData[]
        });
      }
    } catch (error) {
      console.error('Error fetching feedback:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating)
            ? 'fill-amber-400 text-amber-400'
            : i < rating
            ? 'fill-amber-400/50 text-amber-400'
            : 'text-muted-foreground'
        }`}
      />
    ));
  };

  if (loading) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-background/80 to-secondary/20 p-4 rounded-lg border border-border/50">
      <div className="flex items-center gap-3 mb-3">
        <ThumbsUp className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">{t('publicMenu.customerReviews')}</h3>
      </div>
      
      {feedbackStats && feedbackStats.totalFeedback > 0 ? (
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              {renderStars(feedbackStats.averageRating)}
            </div>
            <span className="text-lg font-bold text-foreground">
              {feedbackStats.averageRating}
            </span>
          </div>
          <Badge variant="secondary" className="text-xs">
            {feedbackStats.totalFeedback} {t('publicMenu.reviews')}
          </Badge>
        </div>
      ) : (
        <div className="text-center py-4 mb-4">
          <p className="text-muted-foreground text-sm mb-2">{t('publicMenu.noReviewsYet')}</p>
          <p className="text-xs text-muted-foreground">{t('publicMenu.encourageFeedback')}</p>
        </div>
      )}

      {feedbackStats && feedbackStats.recentComments.length > 0 && (
        <div className="space-y-2">
          {feedbackStats.recentComments.map((comment, index) => (
            <Card key={index} className="bg-background/50 border-border/30">
              <CardContent className="p-3">
                <div className="flex items-start gap-2">
                  <MessageSquare className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="flex items-center gap-1">
                        {renderStars(comment.rating)}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(comment.created_at).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US')}
                      </span>
                    </div>
                    <p className="text-sm text-foreground leading-relaxed">
                      {comment.comment}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};