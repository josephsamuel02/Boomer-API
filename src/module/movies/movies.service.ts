import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { DownloadLinkDto, MoviesDto } from "src/dtos";
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
      const { download_link, reviews, user_id, ...movieDataWithoutReviews } =
        movieData;

      // Create the movie entry in the `movies` table
      const newMovie = await this.prisma.movies.create({
        data: {
          ...movieDataWithoutReviews,
          ...(moviesDto.movie_poster_image && {
            movie_poster_image: {
              set: [...moviesDto.movie_poster_image],
            },
          }),
          movie_id: movieData.movie_id,
          release_date: movieDataWithoutReviews.release_date
            ? new Date(movieDataWithoutReviews.release_date)
            : undefined,
          downloadLinks: moviesDto.download_link
            ? {
                create: {
                  user_id: user_id, // Ensure user_id is included if provided
                  url: download_link,
                },
              }
            : undefined, // If no download_link, don't include the field
        },
        select: {
          id: true, // Select relevant fields from the created movie
          movie_id: true,
          movie_title: true,
          // Include the downloadLinks as well if needed
          downloadLinks: true,
        },
      });

      if (!newMovie) {
        throw new BadRequestException({
          message: "Unable to upload movie",
        });
      }

      // Handle review if provided
      if (reviews && Object.keys(reviews).length > 0) {
        // Wrap the single review object in an array format for storage
        const baseReview = {
          user_id: reviews.user_id,
          profile_image: movieDataWithoutReviews.poster_profile_image,
          user_name: movieDataWithoutReviews.poster_user_name,
        };

        const optionalFields = {
          ...(reviews.rating !== undefined && { rating: reviews.rating }),
          ...(reviews.comment && { comment: reviews.comment }),
        };

        const formattedReviewsArray = [{ ...baseReview, ...optionalFields }];
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
      const movies = await this.prisma.movies.findMany({
        orderBy: {
          createdAt: "desc", // Sorts from latest to oldest
        },
      });

      if (!movies || movies.length === 0) {
        // throw new BadRequestException({
        //   message: "Unable to get movies",
        // });

        return {
          status: 400,
          message: "No movies found",
          data: [],
        };
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
        include: {
          downloadLinks: true,
        },
      });

      if (!movies) {
        // throw new BadRequestException({
        //   message: "Unable to get movies",
        // });
        return {
          status: 400,
          message: "Movie not found",
          data: [],
        };
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
        orderBy: {
          createdAt: "desc", // Sorts from latest to oldest
        },
      });

      if (!movies || movies.length === 0) {
        return {
          status: 200,
          message: "No movies found for the provided genres",
          data: [],
        };
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
        orderBy: {
          createdAt: "desc", // Sorts from latest to oldest
        },
      });

      if (!movies || movies.length === 0) {
        return {
          status: 200,
          message: "No movies found for the provided type ",
          data: [],
        };
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
        orderBy: {
          createdAt: "desc", // Sorts from latest to oldest
        },
      });

      if (!movies || movies.length === 0) {
        return {
          status: 200,
          message: "No movies found",
          data: [], // Return an empty array if no movies are found
        };
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

  public async getTopRatedMoviesWithMostReviews(): Promise<any> {
    try {
      const fourteenDaysAgo = new Date();
      fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

      const recentMovies = await this.prisma.movies.findMany({
        where: {
          createdAt: {
            gte: fourteenDaysAgo,
          },
        },
        select: {
          movie_id: true,
          movie_title: true,
        },
      });

      const movieIds = recentMovies.map((movie) => movie.movie_id);

      const reviews = await this.prisma.reviews.findMany({
        where: {
          movie_id: {
            in: movieIds,
          },
        },
      });

      if (!reviews || reviews.length == 0) {
        return {
          status: 401,
          message: "no records found",
          data: [],
        };
      }

      const results = reviews.map((r) => {
        const validReviews = r.reviews.filter((rev) => {
          return rev.createdAt && new Date(rev.createdAt) >= fourteenDaysAgo;
        });

        const reviewCount = validReviews.length;
        const averageRating =
          reviewCount > 0
            ? validReviews.reduce((acc, cur) => acc + (cur.rating || 0), 0) /
              reviewCount
            : 0;

        return {
          movie_id: r.movie_id,
          averageRating,
          reviewCount,
        };
      });

      const sorted = results
        .sort((a, b) => {
          if (b.reviewCount === a.reviewCount) {
            return b.averageRating - a.averageRating;
          }
          return b.reviewCount - a.reviewCount;
        })
        .slice(0, 12); // top 12
      const topMovieIds = sorted.map((item) => item.movie_id);

      const topMovies = await this.prisma.movies.findMany({
        where: {
          movie_id: {
            in: topMovieIds,
          },
        },
        select: {
          movie_id: true,
          movie_title: true,
          rating: true,
          movie_poster_image: true,
          movie_genre: true,
          type: true,
        },
      });
      const topMoviesSorted = topMovieIds.map((id) =>
        topMovies.find((movie) => movie.movie_id === id),
      );

      return {
        status: 200,
        message:
          "Top 12 movies with highest reviews and ratings in last 14 days",
        data: topMoviesSorted,
      };
    } catch (error) {
      throw new BadRequestException({
        error: error.message,
      });
    }
  }

  public async updateMovie(moviesDto: MoviesDto): Promise<any> {
    try {
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
          message: "Unable to update download link",
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

  public async addDownloadLink(downloadLinkDto: DownloadLinkDto): Promise<any> {
    try {
      const updatedMovie = await this.prisma.downloadLink.create({
        data: {
          user_id: downloadLinkDto.user_id,
          url: downloadLinkDto.url,
          movie_id: downloadLinkDto.movie_id, // Ensure this matches the ObjectId format
          rated_by: [], // Initialize rated_by as an empty array if necessary
          rating: 0, // Default rating to 0
        },
      });

      if (!updatedMovie) {
        throw new BadRequestException({
          message: "Unable to update artwork",
        });
      }

      return {
        status: 200,
        message: "Movie rated successfully",
        data: updatedMovie,
      };
    } catch (error) {
      throw new BadRequestException({
        error: error.message,
      });
    }
  }

  public async rateDownloadLink(
    downloadLinkDto: DownloadLinkDto,
  ): Promise<any> {
    try {
      const { id, rating, ...others } = downloadLinkDto;

      const rate = rating == "inc" ? 1 : -1;

      const updatedDownloadLink = await this.prisma.downloadLink.update({
        where: { id: id },
        data: {
          rating: {
            increment: rate,
          },
          rated_by: {
            push: downloadLinkDto.user_id,
          },
          ...others,
        },
      });

      if (!updatedDownloadLink) {
        throw new BadRequestException({
          message: "Unable to update artwork",
        });
      }

      return {
        status: 200,
        message: "Movie rated successfully",
        data: updatedDownloadLink,
      };
    } catch (error) {
      throw new BadRequestException({
        error: error.message,
      });
    }
  }

  public async updateRecommends(moviesDto: MoviesDto): Promise<any> {
    try {
      const updatedMovie = await this.prisma.movies.update({
        where: { movie_id: moviesDto.movie_id },
        data: {
          recommend: moviesDto.recommend,
        },
      });

      if (!updatedMovie) {
        throw new BadRequestException({
          message: "Unable to update recommends",
        });
      }

      return {
        status: 200,
        message: "Recommendations updated successfully",
        data: updatedMovie,
      };
    } catch (error) {
      throw new BadRequestException({
        error: error.message,
      });
    }
  }

  public async getRecommendations(): Promise<any> {
    try {
      const recommendations = await this.prisma.movies.findMany({
        where: {
          recommend: true,
        },
        orderBy: {
          createdAt: "desc", // Sorts from latest to oldest
        },
      });
      if (!recommendations || recommendations.length == 0) {
        return {
          status: 200,
          message: "No recommendations found",
          data: [],
        };
      }

      return {
        status: 200,
        message: "Recommendations fetched successfully",
        data: recommendations,
      };
    } catch (error) {
      throw new BadRequestException({
        error: error.message,
      });
    }
  }

  public async deleteMovie(movie_id: string): Promise<any> {
    try {
      // 1. Find the movie
      const movie = await this.prisma.movies.findUnique({
        where: { movie_id },
        include: { downloadLinks: true },
      });

      if (!movie) {
        throw new BadRequestException({ message: "Movie not found" });
      }

      await this.prisma.downloadLink.deleteMany({
        where: { movie_id: movie.movie_id }, // assuming movie.id is the reference
      });

      const deletedMovie = await this.prisma.movies.delete({
        where: { movie_id },
      });

      return {
        status: 200,
        message: "Movie deleted successfully",
        data: deletedMovie,
      };
    } catch (error) {
      throw new BadRequestException({ error: error.message });
    }
  }
}
