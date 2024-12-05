import { model, models, Schema, Types } from "mongoose";

export interface IBoardItem {
  _id: string;
  name: string;
}

const BoardItemSchema = new Schema({
  _id: { type: Types.ObjectId, required: true },
  name: { type: String, required: true },
});

// Use the schema to create a model
const BoardItem = models.BoardItem || model<IBoardItem>("BoardItem", BoardItemSchema, "BoardItems");
export default BoardItem;