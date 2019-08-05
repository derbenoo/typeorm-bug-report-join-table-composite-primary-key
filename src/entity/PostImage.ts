import { Entity, ManyToOne, Column } from "typeorm";
import { Image } from "./Image";
import { Post } from "./Post";

@Entity()
export class PostImage {
  @ManyToOne(type => Image, image => image.postImages, {
    primary: true,
    cascade: true
  })
  image: Image;

  @ManyToOne(type => Post, post => post.postImages, { primary: true })
  post: Post;

  @Column()
  description: string;
}
