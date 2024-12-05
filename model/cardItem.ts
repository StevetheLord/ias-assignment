import { model, models, Schema, Types } from "mongoose";

export interface ICardItem {
  toObject: any;
  _id: string;
  listId: string;
  name: string;
  description: string;
}

const CardItemSchema = new Schema({
  _id: { type: Types.ObjectId, required: true },
  listId: { type: Types.ObjectId, ref: 'ListItem', required: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
});

// Use the schema to create a model
const CardItem = models.CardItem || model<ICardItem>("CardItem", CardItemSchema, "CardItems");
export default CardItem;