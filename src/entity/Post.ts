import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from "typeorm";
import { PostImage } from "./PostImage";

@Entity()
export class Post {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @OneToMany(type => PostImage, postImage => postImage.post, {
    cascade: true
  })
  postImages: PostImage[];
}
