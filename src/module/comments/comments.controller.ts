import {
  Controller,
  Body,
  ClassSerializerInterceptor,
  UseInterceptors,
  UseGuards,
  Put,
  Get,
  Delete,
} from "@nestjs/common";
import { JwtAuthGuard } from "src/validation/jwt-auth.guard";
import { ApiTags } from "@nestjs/swagger";
import { CommentDto } from "src/dtos";
import { CommentsService } from "./comments.service";

@ApiTags("comments")
@Controller("movie/comment")
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @Put()
  public async updateComments(@Body() commentDto: CommentDto): Promise<any> {
    return await this.commentsService.updateComments(commentDto);
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Get()
  public async getComments(@Body() commentDto: CommentDto): Promise<any> {
    return await this.commentsService.getComments(commentDto);
  }

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @Put("like")
  public async updateLike(@Body() commentDto: CommentDto): Promise<any> {
    return await this.commentsService.updateLike(commentDto);
  }

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @Put("dislike")
  public async updateDisLike(@Body() commentDto: CommentDto): Promise<any> {
    return await this.commentsService.updateDisLike(commentDto);
  }

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @Put("reply")
  public async replyComment(@Body() commentDto: CommentDto): Promise<any> {
    return await this.commentsService.replyComment(commentDto);
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Delete("delete")
  public async deleteComment(@Body() commentDto: CommentDto): Promise<any> {
    return await this.commentsService.deleteComment(commentDto);
  }
}
