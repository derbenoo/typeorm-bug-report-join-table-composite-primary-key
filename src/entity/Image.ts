import { Column, Entity, OneToMany } from "typeorm";
import { PostImage } from "./PostImage";

@Entity()
export class Image {
  @Column({
    primary: true
  })
  fileId: number;

  @Column({
    primary: true
  })
  userId: number;

  @OneToMany(type => PostImage, postImage => postImage.image)
  postImages: PostImage[];
}
