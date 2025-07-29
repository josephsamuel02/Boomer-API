import {
  Controller,
  Post,
  Body,
  ClassSerializerInterceptor,
  UseInterceptors,
  UseGuards,
  Put,
  Get,
  Query,
  Delete,
} from "@nestjs/common";
import { JwtAuthGuard } from "src/validation/jwt-auth.guard";
import { ApiTags } from "@nestjs/swagger";
import { DownloadLinkDto, MoviesDto } from "src/dtos";
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

  @Get()
  public async getMovies(): Promise<any> {
    return await this.movieService.getMovies();
  }

  @Get("by_id")
  public async getMovieById(@Query("movie_id") movie_id: string): Promise<any> {
    return await this.movieService.getMovieById(movie_id);
  }

  @Post("genre")
  public async getMoviesByGenre(@Body() moviesDto: MoviesDto): Promise<any> {
    return await this.movieService.getMoviesByGenre(moviesDto);
  }

  @Get("type")
  public async getMoviesByType(@Query("type") type: string): Promise<any> {
    return await this.movieService.getMoviesByType(type);
  }

  @Post("search")
  public async searchMoviesByTitle(
    @Body("movie_title") movie_title: string,
  ): Promise<any> {
    return this.movieService.searchMoviesByTitle(movie_title);
  }

  @Get("trending")
  public async getTrendingMovies(): Promise<any> {
    return await this.movieService.getTrendingMovies();
  }

  @Get("top_rated")
  public async getTopRatedMovies(): Promise<any> {
    return await this.movieService.getTopRatedMovies();
  }

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @Put("update")
  public async updateMovie(@Body() moviesDto: MoviesDto): Promise<any> {
    return await this.movieService.updateMovie(moviesDto);
  }

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @Put("add_download_link")
  public async addDownloadLink(
    @Body() downloadLinkDto: DownloadLinkDto,
  ): Promise<any> {
    return await this.movieService.addDownloadLink(downloadLinkDto);
  }

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @Put("rate_download_link")
  public async rateDownloadLink(
    @Body() downloadLinkDto: DownloadLinkDto,
  ): Promise<any> {
    return await this.movieService.rateDownloadLink(downloadLinkDto);
  }

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @Put("update_recommends")
  public async updateRecommends(@Body() moviesDto: MoviesDto): Promise<any> {
    return await this.movieService.updateRecommends(moviesDto);
  }

  @Get("get_recommendations")
  public async getRecommendations(): Promise<any> {
    return await this.movieService.getRecommendations();
  }

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @Delete("delete")
  public async deleteMovie(@Query("movie_id") movie_id: string): Promise<any> {
    return await this.movieService.deleteMovie(movie_id);
  }
}
