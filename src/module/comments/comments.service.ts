import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { CommentDto } from "src/dtos";
import { MongoDBService } from "src/mongodb/mongodb.service";

@Injectable()
export class CommentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mongoDBService: MongoDBService,
  ) {}

  //update comments
  public async updateComments(commentDto: CommentDto): Promise<any> {
    try {
      const comment = await this.prisma.comments.findUnique({
        where: { movie_id: commentDto.movie_id },
      });

      if (!comment) {
        const createComments = await this.prisma.comments.create({
          data: {
            movie_id: commentDto.movie_id,
          },
        });

        if (!createComments) {
          throw new BadRequestException({
            message: "Unable to create comment model",
          });
        }
      }

      const { movie_id, ...others } = commentDto;

      const updateComments = await this.prisma.comments.update({
        where: { movie_id: movie_id },
        data: {
          comments: {
            push: {
              comment_id: Math.random().toString(36).slice(2),
              ...others,
              likes: 0,
              dislikes: 0,
            },
          },
        },
      });

      if (!updateComments) {
        throw new BadRequestException({
          message: "Unable to comment on movie",
        });
      }

      return {
        status: 200,
        message: "Commented on Artwork successfully",
        data: updateComments,
      };
    } catch (error) {
      throw new BadRequestException({
        error: error.message,
      });
    }
  }

  // get comments
  public async getComments(commentDto: CommentDto): Promise<any> {
    try {
      const comments = await this.prisma.comments.findMany({
        where: { movie_id: commentDto.movie_id },
      });

      if (!comments) {
        return new NotFoundException("can not find comments");
      }

      return { status: 200, message: "success", data: comments };
    } catch (error) {
      throw new BadRequestException({
        error: error.message,
      });
    }
  }

  // delete
  public async deleteComment(commentDto: CommentDto): Promise<any> {
    try {
      const comments = await this.prisma.comments.findUnique({
        where: { movie_id: commentDto.movie_id },
        select: { comments: true },
      });

      if (!comments || !comments.comments) {
        throw new NotFoundException("comments not found");
      }

      const updatedComments = comments.comments.filter(
        (comment) => comment.comment_id !== commentDto.comment_id,
      );

      const updatedMovie = await this.prisma.comments.update({
        where: { movie_id: commentDto.movie_id },
        data: {
          comments: updatedComments,
        },
      });

      if (!updatedMovie) {
        throw new BadRequestException("Unable to delete comment");
      }

      return {
        status: 200,
        message: "Comment deleted successfully",
        data: updatedMovie,
      };
    } catch (error) {
      throw new BadRequestException({
        error: error.message,
      });
    }
  }

  public async replyComment(commentDto: CommentDto): Promise<any> {
    try {
      const comments = await this.prisma.comments.findUnique({
        where: { movie_id: commentDto.movie_id },
        select: { comments: true }, // Select only the comments field
      });

      if (!comments || !comments.comments) {
        throw new NotFoundException("Movie or comment not found");
      }

      // Update the replies for the specific comment
      const updatedComments = comments.comments.map((comment) => {
        if (comment.comment_id === commentDto.comment_id) {
          return {
            ...comment,
            replies: [
              ...comment.replies,
              {
                user_id: commentDto.user_id,
                user_name: commentDto.user_name,
                comment: commentDto.text,
              },
            ],
          };
        }
        return comment;
      });

      // Save the updated comments array back to the database
      const updatedComment = await this.prisma.comments.update({
        where: { movie_id: commentDto.movie_id },
        data: {
          comments: updatedComments,
        },
      });

      if (!updatedComment) {
        throw new BadRequestException({
          message: "Unable to comment on movie",
        });
      }

      return {
        status: 200,
        message: "Commented on movie successfully",
        data: updatedComment,
      };
    } catch (error) {
      throw new BadRequestException({
        error: error.message,
      });
    }
  }

  // update  likes
  public async updateLike(commentDto: CommentDto): Promise<any> {
    try {
      const comment = await this.prisma.comments.findUnique({
        where: { movie_id: commentDto.movie_id },
        select: { comments: true },
      });

      let like = 0;
      commentDto.likes == true ? (like = 1) : (like = -1);
      if (!comment || !comment.comments) {
        throw new NotFoundException("Movie or comment not found");
      }

      // Update the likes for the specific comment
      const updatedComments = comment.comments.map((comment) => {
        if (comment.comment_id === commentDto.comment_id) {
          return {
            ...comment,
            likes: comment.likes ? comment.likes + like : like,
          };
        }
        return comment;
      });

      // Save the updated comments array back to the database
      const updateLikes = await this.prisma.comments.update({
        where: { movie_id: commentDto.movie_id },
        data: {
          comments: updatedComments,
        },
      });

      if (!updateLikes) {
        throw new BadRequestException({
          message: "Unable to like artwork",
        });
      }

      return {
        status: 200,
        message: "Movie liked",
        data: updateLikes,
      };
    } catch (error) {
      throw new BadRequestException({
        error: error.message,
      });
    }
  }

  // update  likes
  public async updateDisLike(commentDto: CommentDto): Promise<any> {
    try {
      const comment = await this.prisma.comments.findUnique({
        where: { movie_id: commentDto.movie_id },
        select: { comments: true },
      });

      let dislike = 0;
      commentDto.dislikes == true ? (dislike = 1) : (dislike = -1);

      if (!comment || !comment.comments) {
        throw new NotFoundException("Movie or comment not found");
      }

      // Update the likes for the specific comment
      const updatedComments = comment.comments.map((comment) => {
        if (comment.comment_id === commentDto.comment_id) {
          return {
            ...comment,
            dislikes: comment.dislikes ? comment.dislikes + dislike : dislike,
          };
        }
        return comment;
      });

      // Save the updated comments array back to the database
      const updateDislike = await this.prisma.comments.update({
        where: { movie_id: commentDto.movie_id },
        data: {
          comments: updatedComments,
        },
      });

      return {
        status: 200,
        message: "Movie dislikes",
        data: updateDislike,
      };
    } catch (error) {
      throw new BadRequestException({
        error: error.message,
      });
    }
  }
}
