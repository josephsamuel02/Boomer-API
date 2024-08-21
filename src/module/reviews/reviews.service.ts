import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { ReviewsDto } from "src/dtos/reviews.dto";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  async postReview(reviewsDto: ReviewsDto) {
    const reviews = await this.prisma.reviews.findUnique({
      where: { movie_id: reviewsDto.movie_id },
      select: { reviews: true },
    });

    if (!reviews) {
      throw new BadRequestException({
        message: "Movie not found",
      });
    }

    // Check if the review from the same user already exists
    const existingReviewIndex = reviews.reviews.findIndex(
      (review) => review.user_id === reviewsDto.user_id,
    );

    if (existingReviewIndex > -1) {
      // Update the replies for the specific comment
      const updatedComments = reviews.reviews.map((review) => {
        if (review.user_id === reviewsDto.user_id) {
          return {
            ...review,

            rating: reviewsDto.rating ? reviewsDto.rating : review.rating,
            comment: reviewsDto.comment ? reviewsDto.comment : review.comment,
            profile_image: reviewsDto.profile_image
              ? reviewsDto.profile_image
              : review.profile_image,
            user_name: reviewsDto.user_name
              ? reviewsDto.user_name
              : review.user_name,
            updatedAt: new Date(),
          };
        }
        return review;
      });

      // Update the reviews array in the database
      const updatedReviews = await this.prisma.reviews.update({
        where: { movie_id: reviewsDto.movie_id },
        data: {
          reviews: updatedComments,
        },
      });

      return {
        status: 200,
        message: "Review added or updated successfully",
        data: updatedReviews,
      };
    }

    const updatedReviews = await this.prisma.reviews.update({
      where: { movie_id: reviewsDto.movie_id },
      data: {
        reviews: {
          push: {
            user_id: reviewsDto.user_id,
            rating: reviewsDto.rating,
            comment: reviewsDto.comment,
            profile_image: reviewsDto.profile_image,
            user_name: reviewsDto.user_name,
          },
        },
      },
    });

    if (!updatedReviews) {
      return new BadRequestException({
        message: "Unable to add or update review",
      });
    }
    return {
      status: 200,
      message: "Review added successfully",
      data: updatedReviews.reviews[existingReviewIndex],
    };
  }

  async updateReview(reviewsDto: ReviewsDto) {
    const reviews = await this.prisma.reviews.findUnique({
      where: { movie_id: reviewsDto.movie_id },
      select: { reviews: true },
    });

    if (!reviews) {
      throw new BadRequestException({
        message: "Movie not found",
      });
    }

    // Check if the review from the same user already exists
    const existingReviewIndex = reviews.reviews.findIndex(
      (review) => review.user_id === reviewsDto.user_id,
    );

    if (!existingReviewIndex) {
      throw new NotFoundException({
        message: "Review not found",
      });
    }
    // Update the replies for the specific comment
    const updatedComments = reviews.reviews.map((review) => {
      if (review.user_id === reviewsDto.user_id) {
        return {
          ...review,

          rating: reviewsDto.rating ? reviewsDto.rating : review.rating,
          comment: reviewsDto.comment ? reviewsDto.comment : review.comment,
          profile_image: reviewsDto.profile_image
            ? reviewsDto.profile_image
            : review.profile_image,
          user_name: reviewsDto.user_name
            ? reviewsDto.user_name
            : review.user_name,
          updatedAt: new Date(),
        };
      }
      return review;
    });

    // Update the reviews array in the database
    const updatedReviews = await this.prisma.reviews.update({
      where: { movie_id: reviewsDto.movie_id },
      data: {
        reviews: updatedComments,
      },
    });

    return {
      status: 200,
      message: "Review added or updated successfully",
      data: updatedReviews.reviews[existingReviewIndex],
    };
  }

  async findMovieReviewsById(reviewsDto: ReviewsDto) {
    const review = await this.prisma.reviews.findUnique({
      where: { movie_id: reviewsDto.movie_id },
    });
    if (!review) {
      throw new NotFoundException("Review not found");
    }
    return {
      status: 200,
      message: "success",
      data: review,
    };
  }

  async deleteReview(reviewsDto: ReviewsDto) {
    const movie = await this.prisma.reviews.findUnique({
      where: { movie_id: reviewsDto.movie_id },
      select: { reviews: true },
    });

    if (!movie) {
      throw new BadRequestException({
        message: "Movie not found",
      });
    }

    const updatedReviews = movie.reviews.filter(
      (review) => review.user_id !== reviewsDto.user_id,
    );

    const updatedMovie = await this.prisma.reviews.update({
      where: { movie_id: reviewsDto.movie_id },
      data: {
        reviews: updatedReviews,
      },
    });

    if (!updatedMovie) {
      throw new BadRequestException({
        message: "Unable to delete review",
      });
    }

    return {
      status: 200,
      message: "Review deleted successfully",
    };
  }
}
