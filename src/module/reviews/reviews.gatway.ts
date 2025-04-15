import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";

import { ApiTags } from "@nestjs/swagger";
import {
  UseGuards,
  UseInterceptors,
  ClassSerializerInterceptor,
} from "@nestjs/common";
import { JwtAuthGuard } from "src/validation/jwt-auth.guard";
import { ReviewsService } from "./reviews.service";
@WebSocketGateway({
  cors: {
    origin: "*",
  },
})
@ApiTags("reviews")
export class BlogpostGateway {
  @WebSocketServer()
  server: Server;
  constructor(private readonly reviewsService: ReviewsService) {}

  async handleConnection(@ConnectedSocket() client: Socket) {
    console.log(`Socket connected: ${client.id}`);

    try {
      this.server.emit(`blogposts`);
    } catch (error) {
      client.emit(`blogposts`, {
        status: "error",
        message: "Failed to retrieve blogpost",
      });
    }
  }

  async handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @SubscribeMessage("create_blogpost")
  async createBlogpost(
    @MessageBody("movie_id") movie_id: string,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const data = await this.reviewsService.findMovieReviewsById(movie_id);
      client.emit("reviews", data);
    } catch (error) {
      console.error("Error handling reviews:", error);
      client.emit("error", "Failed to upload");
      return error;
    }
  }

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @SubscribeMessage("update_blogpost")
  async updateBlogpost(
    @MessageBody() updateBlogpost: updateBlogpost,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const data = await this.blogpostService.updateBlogpost(updateBlogpost);

      this.server.emit(`blogposts`, data);
    } catch (error) {
      console.error("Error handling blogpost:", error);
      client.emit("error", "Failed to upload");
      return error;
    }
  }

  @SubscribeMessage("get_all_blogposts")
  async getAllMessagesForUser(@ConnectedSocket() client: Socket) {
    try {
      const data = await this.blogpostService.getAllBlogpost();
      this.server.emit(`blogposts`, data);
    } catch (error) {
      console.error("Error fetching blogposts:", error);
      client.emit(`blogposts`, {
        status: "error",
        message: "Failed to retrieve blogposts",
      });
    }
  }

  @SubscribeMessage("get_blogpost_by_id")
  async getBlogpostById(
    @MessageBody() id: number,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const data = await this.blogpostService.getBlogpost(id);

      client.emit(`blogposts`, data);
    } catch (error) {
      console.error("Error handling blogposts:", error);
      client.emit(`blogposts`, {
        status: "error",
        message: "Failed to retrieve blogposts",
      });
    }
  }

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @SubscribeMessage("delete_blogpost")
  async sendMessage(
    @MessageBody() id: number,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const data = await this.blogpostService.deleteBlogpost(id);

      this.server.emit(`blogposts`, data);
    } catch (error) {
      console.error("Error handling blogposts:", error);
      client.emit("error", "Failed to send message");
    }
  }
}
