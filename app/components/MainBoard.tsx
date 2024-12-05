"use client"; // Add this to mark the component as a Client Component

import { useState } from "react";
import { useRouter } from "next/navigation"; // Fix the routing import
import { getItems, createBoardItem, updateBoardItem, deleteBoardItem } from "@/app/actions";

/**
 * We try to infer the type returned by the `getItems` function which is async/a promise.
 */
type BoardItemType = Awaited<ReturnType<typeof getItems>>;

export default function MainBoard({ mainBoard }: { mainBoard: BoardItemType }) {
  const [boardItems, setBoardItems] = useState<BoardItemType>(mainBoard);
  const [newBoardItem, setNewBoardItem] = useState("");
  const router = useRouter(); // Now using next/navigation

  // Handle deleting a board item
  const handleDelete = async (id: string) => {
    await deleteBoardItem(id);
    setBoardItems(await getItems());
  };

  // Handle adding a new board item
  const handleAddBoardItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newBoardItem.trim()) {
      await createBoardItem(newBoardItem.trim());
      setBoardItems(await getItems());
      setNewBoardItem("");
    }
  };

  // Handle editing a board item
  const handleEdit = async (id: string, name: string) => {
    await updateBoardItem(id, name);
    setBoardItems(await getItems());
  };

  // Navigate to the Lists page of the selected board
  const handleGoToLists = (id: string) => {
    console.log("Navigating to board with ID:", id); // Log the ID
    router.push(`/boards/${id}`);
  };

  return (
    <div className="flex flex-col gap-4 p-4 bg-light-blue-100 min-h-screen w-full">
      <h1 className="text-3xl font-bold mb-4 text-blue-800 text-center">Project Management App</h1>
      <form
        onSubmit={handleAddBoardItem}
        className="flex items-center space-x-2 shadow-md bg-white rounded-lg overflow-hidden p-2 max-w-sm mx-auto"
      >
        <input
          type="text"
          value={newBoardItem}
          onChange={(e) => setNewBoardItem(e.target.value)}
          placeholder="Add a new board"
          className="w-full p-2 border rounded-md text-sm focus:outline-none"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
        >
          Add
        </button>
      </form>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {boardItems.map((boardItem) => (
          <div
            key={boardItem._id}
            className="bg-white shadow-md rounded-lg p-4 flex flex-col h-full"
          >
            <div className="flex justify-between items-center mb-4">
              <input
                type="text"
                value={boardItem.name}
                onChange={(e) =>
                  setBoardItems((prevItems) =>
                    prevItems.map((item) =>
                      item._id === boardItem._id
                        ? { ...item, name: e.target.value }
                        : item
                    )
                  )
                }
                className="w-full text-lg font-semibold text-gray-800 border-none focus:outline-none"
              />
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(boardItem._id, boardItem.name)}
                  className="bg-purple-500 text-white px-2 py-1 rounded-md hover:bg-purple-600"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleGoToLists(boardItem._id)} // Button to go to the list of Lists
                  className="bg-blue-500 text-white px-2 py-1 rounded-md hover:bg-blue-600"
                >
                  View Lists
                </button>
              </div>
            </div>
            <button
              onClick={() => handleDelete(boardItem._id)}
              className="mt-auto bg-purple-500 text-white px-4 py-2 rounded-md hover:bg-purple-600"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}