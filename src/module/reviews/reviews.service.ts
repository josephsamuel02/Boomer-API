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
    // Find the movie's review document in the Reviews table by movie_id
    const movieReviews = await this.prisma.reviews.findUnique({
      where: { movie_id: reviewsDto.movie_id },
      select: { reviews: true },
    });

    // If no document exists for the movie, create a new one
    if (!movieReviews) {
      const newReviewDocument = await this.prisma.reviews.create({
        data: {
          movie_id: reviewsDto.movie_id,
          reviews: [
            {
              user_id: reviewsDto.user_id,
              profile_image: reviewsDto.profile_image,
              user_name: reviewsDto.user_name,
              rating: reviewsDto.rating,
              comment: reviewsDto.comment,
            },
          ],
        },
      });

      // Update the rating in the movies table with the initial rating
      await this.prisma.movies.update({
        where: { movie_id: reviewsDto.movie_id },
        data: { rating: reviewsDto.rating, rating_count: 1 },
      });

      return {
        status: 200,
        message: "New review document created and review added successfully",
        data: newReviewDocument,
      };
    }

    // If the document exists, add a new review to the reviews array
    const updatedReviews = await this.prisma.reviews.update({
      where: { movie_id: reviewsDto.movie_id },
      data: {
        reviews: {
          push: {
            user_id: reviewsDto.user_id,
            profile_image: reviewsDto.profile_image,
            user_name: reviewsDto.user_name,
            rating: reviewsDto.rating,
            comment: reviewsDto.comment,
          },
        },
      },
    });

    // Calculate the new average rating
    const totalRating = updatedReviews.reviews.reduce(
      (sum, review) => sum + (review.rating ?? 0),
      0,
    );
    const averageRating = Math.round(
      totalRating / updatedReviews.reviews.length,
    );

    // Update the movie's rating in the movies table
    await this.prisma.movies.update({
      where: { movie_id: reviewsDto.movie_id },
      data: {
        rating: averageRating,
        rating_count: updatedReviews.reviews.length,
      },
    });

    return {
      status: 200,
      message: "Review added successfully and movie rating updated",
      data: updatedReviews,
    };
  }

  async updateReview(reviewsDto: ReviewsDto) {
    // Retrieve the reviews for the movie
    const movieReviews = await this.prisma.reviews.findUnique({
      where: { movie_id: reviewsDto.movie_id },
      select: { reviews: true },
    });

    if (!movieReviews) {
      throw new BadRequestException({
        message: "Movie not found",
      });
    }

    // Locate the index of the existing review by the same user
    const existingReviewIndex = movieReviews.reviews.findIndex(
      (review) => review.user_id === reviewsDto.user_id,
    );

    if (existingReviewIndex === -1) {
      throw new NotFoundException({
        message: "Review not found",
      });
    }

    // Capture the old rating to check if it has changed
    const oldRating = movieReviews.reviews[existingReviewIndex].rating;

    // Update the specific review
    const updatedReviewsArray = movieReviews.reviews.map((review, index) => {
      if (index === existingReviewIndex) {
        return {
          ...review,
          rating: reviewsDto.rating ?? review.rating,
          comment: reviewsDto.comment ?? review.comment,
          profile_image: reviewsDto.profile_image ?? review.profile_image,
          user_name: reviewsDto.user_name ?? review.user_name,
          updatedAt: new Date(),
        };
      }
      return review;
    });

    // Save the updated review array back to the database
    const updatedReviewDocument = await this.prisma.reviews.update({
      where: { movie_id: reviewsDto.movie_id },
      data: {
        reviews: updatedReviewsArray,
      },
    });

    // If the rating has changed, recalculate the movie's average rating
    if (oldRating !== reviewsDto.rating) {
      const totalRating = updatedReviewsArray.reduce(
        (sum, review) => sum + (review.rating ?? 0),
        0,
      );
      const newAverageRating = Math.round(
        totalRating / updatedReviewsArray.length,
      );

      // Update the movie's average rating in the movies table
      await this.prisma.movies.update({
        where: { movie_id: reviewsDto.movie_id },
        data: {
          rating: newAverageRating,
          rating_count: updatedReviewsArray.length,
        },
      });
    }

    return {
      status: 200,
      message: "Review updated successfully and average rating recalculated",
      data: updatedReviewDocument.reviews[existingReviewIndex],
    };
  }

  async findMovieReviewsById(movie_id: string) {
    const review = await this.prisma.reviews.findUnique({
      where: { movie_id: movie_id },
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
