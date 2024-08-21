import {
  Controller,
  Put,
  Body,
  UseGuards,
  UseInterceptors,
  Get,
  Delete,
} from "@nestjs/common";
import { ClassSerializerInterceptor } from "@nestjs/common";
import { ReviewsDto } from "src/dtos/reviews.dto";
import { ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "src/validation/jwt-auth.guard";
import { ReviewsService } from "./reviews.service";

@ApiTags("reviews")
@Controller("reviews")
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @Put()
  async postReview(@Body() reviewsDto: ReviewsDto) {
    return await this.reviewsService.postReview(reviewsDto);
  }

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @Put("update")
  async updateReview(@Body() reviewsDto: ReviewsDto) {
    return await this.reviewsService.updateReview(reviewsDto);
  }

  @Get()
  async findMovieReviewsById(@Body() reviewsDto: ReviewsDto) {
    return await this.reviewsService.findMovieReviewsById(reviewsDto);
  }

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @Delete("delete")
  async deleteReview(@Body() reviewsDto: ReviewsDto) {
    return await this.reviewsService.deleteReview(reviewsDto);
  }
}
