import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { MoviesDto } from "src/dtos";
import { MongoDBService } from "src/mongodb/mongodb.service";

@Injectable()
export class MovieService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mongoDBService: MongoDBService,
  ) {}

  public async uploadMovie(moviesDto: MoviesDto): Promise<any> {
    try {
      // Prepare movie data with unique movie ID
      const movieData = {
        movie_id: `${Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2)}`,
        ...moviesDto,
      };

      // Extract reviews from the movie data to handle it separately
      const { reviews, ...movieDataWithoutReviews } = movieData;

      // Create the movie entry in the `movies` table
      const newMovie = await this.prisma.movies.create({
        data: {
          ...movieDataWithoutReviews,
          ...(moviesDto.movie_poster_image && {
            movie_poster_image: {
              set: [...moviesDto.movie_poster_image],
            },
          }),
          release_date: movieDataWithoutReviews.release_date
            ? new Date(movieDataWithoutReviews.release_date)
            : undefined,
        },
      });

      if (!newMovie) {
        throw new BadRequestException({
          message: "Unable to upload movie",
        });
      }

      // Handle review if provided
      if (reviews) {
        // Wrap the single review object in an array format for storage
        const formattedReviewsArray = [
          {
            user_id: reviews.user_id,
            profile_image: movieDataWithoutReviews.poster_profile_image,
            user_name: movieDataWithoutReviews.poster_user_name,
            rating: reviews.rating,
            comment: reviews.comment,
          },
        ];

        // Insert the reviews array into the Reviews table
        await this.prisma.reviews.create({
          data: {
            movie_id: movieData.movie_id,
            reviews: formattedReviewsArray,
          },
        });

        // Since only one review is provided, we set this review's rating as the average rating in `movies` table
        await this.prisma.movies.update({
          where: { movie_id: movieData.movie_id },
          data: { rating: reviews.rating, rating_count: 1 },
        });
      }

      return {
        status: 200,
        message: "Movie uploaded successfully",
        data: newMovie,
      };
    } catch (error) {
      throw new BadRequestException({
        error: error.message,
      });
    }
  }

  public async getMovies(): Promise<any> {
    try {
      const movies = await this.prisma.movies.findMany();

      if (!movies) {
        throw new BadRequestException({
          message: "Unable to get movies",
        });
      }

      return {
        status: 200,
        message: "success",
        data: movies,
      };
    } catch (error) {
      throw new BadRequestException({
        error: error.message,
      });
    }
  }

  public async getMovieById(movie_id: string): Promise<any> {
    try {
      const movies = await this.prisma.movies.findFirst({
        where: { movie_id: movie_id },
      });

      if (!movies) {
        throw new BadRequestException({
          message: "Unable to get movies",
        });
      }

      return {
        status: 200,
        message: "success",
        data: movies,
      };
    } catch (error) {
      throw new BadRequestException({
        error: error.message,
      });
    }
  }

  public async getMoviesByGenre(moviesDto: MoviesDto): Promise<any> {
    try {
      // Using the $in operator to check if the genre is part of the movie_genre array
      const movies = await this.prisma.movies.findMany({
        where: {
          movie_genre: {
            // Ensure movie_genre is an array and match any of the values passed in moviesDto.movie_genre
            hasSome: moviesDto.movie_genre, // Alternatively, use 'has' for exact match of a single genre
          },
        },
      });

      if (!movies || movies.length === 0) {
        throw new BadRequestException({
          message: "No movies found for the provided genres",
        });
      }

      return {
        status: 200,
        message: "success",
        data: movies,
      };
    } catch (error) {
      throw new BadRequestException({
        error: error.message,
      });
    }
  }

  public async getMoviesByType(type: string): Promise<any> {
    try {
      // Using the $in operator to check if the genre is part of the movie_genre array
      const movies = await this.prisma.movies.findMany({
        where: {
          type: type,
        },
      });

      if (!movies || movies.length === 0) {
        throw new BadRequestException({
          message: "No movies found for the provided type",
        });
      }

      return {
        status: 200,
        message: "success",
        data: movies,
      };
    } catch (error) {
      throw new BadRequestException({
        error: error.message,
      });
    }
  }

  public async searchMoviesByTitle(searchTerm: string): Promise<any> {
    try {
      // If no search term is provided, throw an error
      if (!searchTerm) {
        throw new BadRequestException({
          message: "Search term cannot be empty",
        });
      }

      // Fetch movies with titles that contain the search term
      const movies = await this.prisma.movies.findMany({
        where: {
          movie_title: {
            contains: searchTerm,
            mode: "insensitive", // Makes the search case-insensitive
          },
        },
      });

      if (!movies || movies.length === 0) {
        throw new BadRequestException({
          message: "No movies found with the provided title",
        });
      }

      return {
        status: 200,
        message: "success",
        data: movies,
      };
    } catch (error) {
      throw new BadRequestException({
        error: error.message,
      });
    }
  }

  async getTopRatedMoviesWithMostReviews() {
    const fiveDaysAgo = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);

    // Define the aggregation pipeline for the reviews collection
    const pipeline = [
      {
        $lookup: {
          from: "movies",
          localField: "movie_id",
          foreignField: "movie_id",
          as: "movieData",
        },
      },
      { $unwind: "$movieData" },

      // Filter to only include movies created in the last 5 days
      {
        $match: {
          "movieData.createdAt": { $gte: fiveDaysAgo },
          "reviews.createdAt": { $gte: fiveDaysAgo },
        },
      },

      // Group by movie_id to aggregate review count and average rating
      {
        $group: {
          _id: "$movie_id",
          reviewCount: { $sum: 1 },
          averageRating: { $avg: "$reviews.rating" },
        },
      },
      { $sort: { reviewCount: -1, averageRating: -1 } },
      { $limit: 12 },
    ];

    // Execute the aggregation on the `reviews` collection
    const topReviews = await this.mongoDBService
      .getDatabase()
      .collection("reviews")
      .aggregate(pipeline)
      .toArray();

    if (!topReviews) {
      throw new BadRequestException({
        message: "Couldn't retrieve movie ID(s)",
      });
    }

    // Extract movie IDs from the aggregation result
    const movieIds = topReviews.map((review) => review._id);

    // Fetch movie details for the top movies using the movie IDs
    const movies = await this.mongoDBService
      .getDatabase()
      .collection("movies")
      .find({
        movie_id: { $in: movieIds },
      })
      .toArray();

    if (!movies) {
      throw new BadRequestException({
        message: "Unable to fetch movies",
      });
    }

    return {
      status: 200,
      message: "Movies fetched successfully",
      data: movies,
    };
  }

  public async updateMovie(moviesDto: MoviesDto): Promise<any> {
    try {
      const existingMovie = await this.prisma.movies.findUnique({
        where: { movie_id: moviesDto.movie_id },
      });

      if (!existingMovie) {
        throw new NotFoundException("Movie not found");
      }

      const updatedMovie = await this.prisma.movies.update({
        where: { movie_id: moviesDto.movie_id },
        data: {
          ...moviesDto,
          release_date: moviesDto.release_date
            ? new Date(moviesDto.release_date)
            : undefined,
        },
      });

      if (!updatedMovie) {
        throw new BadRequestException({
          message: "Unable to update artwork",
        });
      }

      return {
        status: 200,
        message: "Movie updated successfully",
        data: updatedMovie,
      };
    } catch (error) {
      throw new BadRequestException({
        error: error.message,
      });
    }
  }
}
