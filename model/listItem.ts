import { model, models, Schema, Types } from "mongoose";

export interface IListItem {
  toObject: any;
  _id: string;
  boardId: string;
  name: string;
}

const ListItemSchema = new Schema({
  _id: { type: Types.ObjectId, required: true },
  boardId: { type: Types.ObjectId, ref: 'BoardItem', required: true },
  name: { type: String, required: true },
});

// Use the schema to create a model
const ListItem = models.ListItem || model<IListItem>("ListItem", ListItemSchema, "ListItems");
export default ListItem;