"use server";

import connectMongo from "@/db/mongoose";
import BoardItem, { IBoardItem } from "@/model/boardItem";
import ListItem, { IListItem } from "@/model/listItem";
import CardItem, { ICardItem } from "@/model/cardItem";

import { Types } from "mongoose";

export async function getItems(): Promise<IBoardItem[]> {
    try {
      await connectMongo();
      const boardItems = await BoardItem.find({}).lean<IBoardItem[]>();
      const formattedBoardItems = boardItems.map((boardItem) => ({
        _id: boardItem._id.toString(),
        name: boardItem.name,
      }));
      return formattedBoardItems;
    } catch (e) {
      console.error(e);
      throw e;
    }
  }
  
  export async function createBoardItem(name: IBoardItem["name"]) {
    try {
      await connectMongo();
      const newBoardItem = new BoardItem({
        _id: new Types.ObjectId(),
        name,
      });
      await newBoardItem.save();
      console.log("Created new Board Item:", newBoardItem);
    } catch (e) {
      console.error(e);
      throw e;
    }
  }
  
  export async function deleteBoardItem(id: IBoardItem["_id"]) {
    try {
      await connectMongo();
      const lists = await ListItem.find({ boardId: id }); // Find all lists for the given board
      const listIds = lists.map((list) => list._id); // Extract list IDs
  
      if (listIds.length > 0) {
        // Delete all cards associated with the lists
        const deletedCards = await CardItem.deleteMany({ listId: { $in: listIds } });
        console.log(`Deleted ${deletedCards.deletedCount} cards associated with the lists.`);
      } else {
        console.log("No lists found for the board, so no cards to delete.");
      }
  
      // Step 2: Delete all lists associated with the board
      const deletedLists = await ListItem.deleteMany({ boardId: id });
      if (deletedLists.deletedCount === 0) {
        console.log("No lists found for the board, or they were already deleted.");
      } else {
        console.log(`Deleted ${deletedLists.deletedCount} lists for the board.`);
      }

      const deletedBoardItem = await BoardItem.findByIdAndDelete(id);
      if (!deletedBoardItem) {
        throw new Error("Can't delete board item");
      }
    } catch (e) {
      console.error(e);
      throw e;
    }
  }
  
  export const updateBoardItem = async (id: IBoardItem["_id"], name: IBoardItem["name"]) => {
    try {
      await connectMongo();
      const updatedBoardItem = await BoardItem.findByIdAndUpdate(
        id,
        { name }
      );
      if (!updatedBoardItem) {
        throw new Error("Board Item not found!");
      }
    } catch (e) {
      console.error(e);
      throw e;
    }
  };

  export async function getLists(boardId: string): Promise<IListItem[]> {
    try {
      await connectMongo();
      
      // Fetch all ListItems that belong to the given boardId
      const listItems = await ListItem.find({ boardId }).lean<IListItem[]>();
      
      // Return the List items with formatted _id as string
      return listItems.map((listItem) => ({
        ...listItem,
        _id: listItem._id.toString(), // Convert _id to string for consistency
        boardId: listItem.boardId.toString(),
      }));
    } catch (e) {
      console.error(e);
      throw e;
    }
  }

  export async function createList(boardId: IListItem["boardId"], name: IListItem["name"]) {
    try {
      await connectMongo();
  
      const newList = new ListItem({
        _id: new Types.ObjectId(), // Generate a new ObjectId for the List
        boardId: new Types.ObjectId(boardId), // Ensure boardId is an ObjectId
        name,
      });
  
      await newList.save();
      console.log("Created new List Item:", newList);
  
      return {
        _id: newList._id.toString(),
        boardId: newList.boardId.toString(),
        name: newList.name,
      };
    } catch (e) {
      console.error(e);
      throw e;
    }
  }
  
  // Delete a List by its ID
  export async function deleteList(id: IListItem["_id"]) {
    try {
      await connectMongo();
  
      // Step 1: Delete all cards associated with this list
      const deletedCards = await CardItem.deleteMany({ listId: id });
      if (deletedCards.deletedCount > 0) {
        console.log(`Deleted ${deletedCards.deletedCount} cards associated with this list.`);
      } else {
        console.log("No cards found for this list.");
      }
  
      // Step 2: Delete the list
      const deletedList = await ListItem.findByIdAndDelete(id);
      if (!deletedList) {
        throw new Error("Can't delete list item");
      }
  
      console.log("Deleted List Item:", deletedList);
  
    } catch (e) {
      console.error(e);
      throw e;
    }
  }
  
  // Update a List's name by its ID
  export const updateList = async (id: IListItem["_id"], name: IListItem["name"]) => {
    try {
      await connectMongo();
  
      const updatedList = await ListItem.findByIdAndUpdate(
        id,
        { name },
        { new: true } // Return the updated document
      );
  
      if (!updatedList) {
        throw new Error("List List not found!");
      }
  
      console.log("Updated List Item:", updatedList);
  
      return {
        _id: updatedList._id.toString(),
        boardId: updatedList.boardId.toString(),
        name: updatedList.name,
      };
    } catch (e) {
      console.error(e);
      throw e;
    }
  };

  export async function getCards(listId: string): Promise<ICardItem[]> {
    try {
      await connectMongo();
      
      // Fetch all CardItems that belong to the given listId
      const cardItems = await CardItem.find({ listId }).lean<ICardItem[]>();
      
      // Return the Card items with formatted _id as string
      return cardItems.map((cardItem) => ({
        ...cardItem,
        _id: cardItem._id.toString(), // Convert _id to string for consistency
        listId: cardItem.listId.toString(),
      }));
    } catch (e) {
      console.error(e);
      throw e;
    }
  }

  export async function createCard(
    listId: ICardItem["listId"],
    name: ICardItem["name"],
    description: ICardItem["description"]
  ) {
    try {
      await connectMongo();
  
  
      console.log("listId: " + listId);
      const newCard = new CardItem({
        _id: new Types.ObjectId(),
        listId: new Types.ObjectId(listId), // Convert to ObjectId
        name,
        description,
      });
  
      await newCard.save();
      console.log("Created new Card Item:", newCard);
  
      return {
        _id: newCard._id.toString(),
        listId: newCard.listId.toString(),
        name: newCard.name,
        description: newCard.description,
      };
    } catch (e) {
      console.error(e);
      throw e;
    }
  }
  
  export async function deleteCard(id: ICardItem["_id"]) {
    try {
      await connectMongo();
  
      const deletedCard = await CardItem.findByIdAndDelete(id);
      if (!deletedCard) {
        throw new Error("Can't delete card item");
      }
  
      console.log("Deleted Card Item:", deletedCard);
    } catch (e) {
      console.error(e);
      throw e;
    }
  }

  export const updateCard = async (id: ICardItem["_id"], name: ICardItem["name"], description: ICardItem["description"]) => {
    try {
      await connectMongo();
  
      const updatedCard = await CardItem.findByIdAndUpdate(
        id,
        { name, description },
        { new: true } // Return the updated document
      );
  
      if (!updatedCard) {
        throw new Error("Card not found!");
      }
  
      console.log("Updated Card Item:", updatedCard);
  
      return {
        _id: updatedCard._id.toString(),
        listId: updatedCard.listId.toString(),
        name: updatedCard.name,
        description: updatedCard.description,
      };
    } catch (e) {
      console.error(e);
      throw e;
    }
  };