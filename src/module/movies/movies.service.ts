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
      const M_id = `${Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2)}`;
      const movieData = {
        movie_id: `${Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2)}`,
        ...moviesDto,
      };

      // Extract reviews from the movie data to handle it separately
      const { download_link, reviews, ...movieDataWithoutReviews } = movieData;

      // Create the movie entry in the `movies` table
      const newMovie = await this.prisma.movies.create({
        data: {
          ...movieDataWithoutReviews,
          ...(moviesDto.movie_poster_image && {
            movie_poster_image: {
              set: [...moviesDto.movie_poster_image],
            },
          }),
          movie_id: movieData.movie_id ? movieData.movie_id : M_id,
          release_date: movieDataWithoutReviews.release_date
            ? new Date(movieDataWithoutReviews.release_date)
            : undefined,
          downloadLinks: moviesDto.download_link
            ? {
                create: {
                  user_id: moviesDto.user_id,
                  url: download_link, // Assuming download_link is a string
                  // Ensure this matches the ObjectId format
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

  async getTopRatedMoviesWithMostReviews() {
    const fiveDaysAgo = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);

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

      // Filter to only include movies and reviews created in the last 5 days
      {
        $match: {
          "movieData.createdAt": { $gte: fiveDaysAgo },
          createdAt: { $gte: fiveDaysAgo },
        },
      },

      // Sort by review creation date in descending order (latest to oldest)
      { $sort: { createdAt: -1 } },

      // Group by movie_id to aggregate review count and average rating
      {
        $group: {
          _id: "$movie_id",
          reviewCount: { $sum: 1 },
          averageRating: { $avg: "$rating" },
          movieData: { $first: "$movieData" }, // Keep the latest movieData entry after sorting
        },
      },

      // Sort by review count and average rating
      { $sort: { reviewCount: -1, averageRating: -1 } },

      // Limit to top 12 results
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
}
