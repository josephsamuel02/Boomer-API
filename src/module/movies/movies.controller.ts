import {
  Controller,
  Post,
  Body,
  ClassSerializerInterceptor,
  UseInterceptors,
  UseGuards,
  Put,
  Get,
} from "@nestjs/common";
import { JwtAuthGuard } from "src/validation/jwt-auth.guard";
import { ApiTags } from "@nestjs/swagger";
import { MoviesDto } from "src/dtos";
import { MovieService } from "./movies.service";

@ApiTags("movies")
@Controller("movies")
export class ArtworkController {
  constructor(private readonly movieService: MovieService) {}

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @Post()
  public async uploadMovie(@Body() moviesDto: MoviesDto): Promise<any> {
    return await this.movieService.uploadMovie(moviesDto);
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Get()
  public async getMovies(): Promise<any> {
    return await this.movieService.getMovies();
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Get("by_id")
  public async getMovieById(@Body() moviesDto: MoviesDto): Promise<any> {
    return await this.movieService.getMovieById(moviesDto);
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Get("genre")
  public async getMoviesByGenre(@Body() moviesDto: MoviesDto): Promise<any> {
    return await this.movieService.getMoviesByGenre(moviesDto);
  }

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @Put("update")
  public async updateMovie(@Body() moviesDto: MoviesDto): Promise<any> {
    return await this.movieService.updateMovie(moviesDto);
  }
}
