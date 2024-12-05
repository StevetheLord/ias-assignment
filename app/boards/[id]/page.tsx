"use client"; 
import { useParams } from "next/navigation"; 
import { useState, useEffect } from "react";
import { getLists, createList, deleteList, updateList, createCard, updateCard, deleteCard, getCards } from "@/app/actions"; 
import { CardModal } from "@/app/components/CardModal";

interface List {
  _id: string;
  name: string;
  boardId: string;
}

interface Card {
  _id: string;
  name: string;
  description: string;
  listId: string;
}

export default function BoardPage() {
  const { id } = useParams(); 
  const boardId = Array.isArray(id) ? id[0] : id; 

  const [lists, setLists] = useState<List[]>([]);
  const [cards, setCards] = useState<Record<string, Card[]>>({});
  const [newListName, setNewListName] = useState("");
  const [loading, setLoading] = useState<boolean>(true); 
  const [openCardModal, setOpenCardModal] = useState<{ isOpen: boolean; listId: string | null }>({ isOpen: false, listId: null });
  const [viewCardModal, setViewCardModal] = useState<{
    isOpen: boolean;
    id: string | null;
    name: string | null;
    description: string | null;
    listId: string | null;
  }>({
    isOpen: false,
    id: null,
    name: null,
    description: null,
    listId: null,
  });

  useEffect(() => {
    if (boardId) {
      const fetchListsAndCards = async () => {
        try {
          const listData = await getLists(boardId); 
          setLists(listData);

          const cardsByList = await Promise.all(
            listData.map(async (list) => {
              const cardsForList = await getCards(list._id); 
              return { [list._id]: cardsForList };
            })
          );

          const mergedCards = cardsByList.reduce((acc, curr) => ({ ...acc, ...curr }), {});
          setCards(mergedCards);
        } catch (error) {
          console.error("Failed to fetch Lists and Cards:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchListsAndCards();
    }
  }, [boardId]);

  const handleDelete = async (listId: string) => {
    try {
      await deleteList(listId);
      setLists(await getLists(boardId)); 
    } catch (error) {
      console.error("Failed to delete List:", error);
    }
  };

  const handleEdit = async (listId: string, newName: string) => {
    try {
      await updateList(listId, newName);
      setLists(await getLists(boardId)); 
    } catch (error) {
      console.error("Failed to update List:", error);
    }
  };

  const handleAddList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newListName.trim()) {
      try {
        await createList(boardId, newListName.trim());
        setLists(await getLists(boardId)); 
        setNewListName(""); 
      } catch (error) {
        console.error("Failed to create List:", error);
      }
    }
  };

  const handleAddCard = async (name: string, description: string, listId: string) => {
    try {
      await createCard(listId, name, description);
      const updatedCardsForList = await getCards(listId);
      setCards((prevCards) => ({ ...prevCards, [listId]: updatedCardsForList }));
      setOpenCardModal({ isOpen: false, listId: null });
    } catch (error) {
      console.error("Failed to create Card:", error);
    }
  };

  const handleEditCard = async (id: string, name: string, description: string, listId: string) => {
    try {
      await updateCard(id, name, description);
      const updatedCardsForList = await getCards(listId);
      setCards((prevCards) => ({ ...prevCards, [listId]: updatedCardsForList }));
      setViewCardModal({ isOpen: false, id: null, name: null, description: null, listId: null });
    } catch (error) {
      console.error("Failed to edit Card:", error);
    }
  };

  const handleDeleteCard = async (id: string, listId: string) => {
    try {
      await deleteCard(id);
      const updatedCardsForList = await getCards(listId);
      setCards((prevCards) => ({ ...prevCards, [listId]: updatedCardsForList }));
      setViewCardModal({ isOpen: false, id: null, name: null, description: null, listId: null });
    } catch (error) {
      console.error("Failed to delete Card:", error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Lists for Board {boardId}</h2>
      <form onSubmit={handleAddList} className="flex items-center space-x-2 mb-6">
        <input
          type="text"
          value={newListName}
          onChange={(e) => setNewListName(e.target.value)}
          placeholder="Add a new List"
          className="w-full p-2 border rounded text-sm outline-none"
        />
        <button
          type="submit"
          className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Add List
        </button>
      </form>

      {lists.length === 0 ? (
        <div className="text-center text-gray-500">No Lists available for this board.</div>
      ) : (
        <div className="flex flex-col space-y-4">
          {lists.map((list) => (
            <div
              key={list._id}
              className="bg-white shadow-md rounded-lg p-4 flex flex-col gap-2"
            >
              <input
                type="text"
                value={list.name}
                onChange={(e) =>
                  setLists((prevLists) =>
                    prevLists.map((l) =>
                      l._id === list._id ? { ...l, name: e.target.value } : l
                    )
                  )
                }
                className="text-lg font-semibold text-gray-800 border-none focus:outline-none"
              />

            <div className="flex space-x-2">
          <button
            onClick={() => handleEdit(list._id, list.name)}
            className="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Edit
          </button>
          <button
            onClick={() => handleDelete(list._id)}
            className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Delete
          </button>
        </div>

              <div className="mt-4">
                {cards[list._id]?.length === 0 ? (
                  <div className="text-gray-500">No cards in this list.</div>
                ) : (
                  <ul className="space-y-2">
                    {cards[list._id]?.map((card) => (
                      <li
                        key={card._id}
                        className="p-2 bg-gray-100 rounded shadow-sm flex justify-between items-center"
                      >
                        <span>{card.name}</span>
                        <button
                          onClick={() =>
                            setViewCardModal({
                              isOpen: true,
                              id: card._id,
                              name: card.name,
                              description: card.description,
                              listId: card.listId,
                            })
                          }
                          className="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                          View
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <button
                onClick={() => setOpenCardModal({ isOpen: true, listId: list._id })}
                className="mt-4 p-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
                Add Card
            </button>
            </div>
            
          ))}
        </div>
      )}

      {openCardModal.isOpen && (
        <CardModal
          isOpen={openCardModal.isOpen}
          onClose={() => setOpenCardModal({ isOpen: false, listId: null })}
          onSubmit={(name, description) => handleAddCard(name, description, openCardModal.listId!)}
          onDelete={() => handleDeleteCard("", openCardModal.listId!)}
          onUpdate={(name, description) => handleEditCard("", name, description, openCardModal.listId!)}
        />
      )}

      {viewCardModal.isOpen && (
        <CardModal
          isOpen={viewCardModal.isOpen}
          onClose={() => setViewCardModal({ isOpen: false, id: null, name: null, description: null, listId: null })}
          onSubmit={(name, description) => handleEditCard(viewCardModal.id!, name, description, viewCardModal.listId!)}
          onDelete={() => handleDeleteCard(viewCardModal.id!, viewCardModal.listId!)}
          onUpdate={(name, description) => handleEditCard(viewCardModal.id!, name, description, viewCardModal.listId!)}
          cardData={{
            id: viewCardModal.id!,
            name: viewCardModal.name!,
            description: viewCardModal.description!,
          }}
          isEditable={true}
        />
      )}
    </div>
  );
}