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
      // Create user information
      const movieData = {
        movie_id: `${Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2)}`,
        ...moviesDto,
      };
      const newMovie = await this.prisma.movies.create({
        data: {
          ...movieData,
          ...(moviesDto.movie_poster_image && {
            movie_poster_image: {
              set: [...moviesDto.movie_poster_image],
            },
          }),
          release_date: movieData.release_date
            ? new Date(movieData.release_date)
            : undefined,
        },
      });
      if (!newMovie) {
        throw new BadRequestException({
          message: "Unable to upload artwork",
        });
      }

      // create Comment datable
      await this.prisma.comments.create({
        data: { movie_id: movieData.movie_id },
      });

      // create reviews datable
      await this.prisma.reviews.create({
        data: { movie_id: movieData.movie_id },
      });

      return {
        status: 200,
        message: "Artwork updated successfully",
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

  public async getMovieById(moviesDto: MoviesDto): Promise<any> {
    try {
      const movies = await this.prisma.movies.findFirst({
        where: { movie_id: moviesDto.movie_id },
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
      const movies = await this.prisma.movies.findMany({
        where: { movie_genre: moviesDto.movie_genre },
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
