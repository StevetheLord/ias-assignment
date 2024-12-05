import { useState, useEffect } from "react";

interface CardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string, description: string) => void;
  onDelete: (id: string) => void; // Delete handler
  onUpdate: (id: string, name: string, description: string) => Promise<void>; // Update handler
  cardData?: { id: string; name: string; description: string }; // Include `id` for database operations
  isEditable?: boolean; // Determines if the modal is editable (edit or add modes)
}

export const CardModal = ({
  isOpen,
  onClose,
  onSubmit,
  onDelete,
  onUpdate,
  cardData,
  isEditable = true,
}: CardModalProps) => {
  const [cardName, setCardName] = useState(cardData?.name || "");
  const [cardDescription, setCardDescription] = useState(
    cardData?.description || ""
  );

  // Reset modal state when it's opened or cardData changes
  useEffect(() => {
    setCardName(cardData?.name || "");
    setCardDescription(cardData?.description || "");
  }, [cardData, isOpen]);

  const handleUpdate = async () => {
    if (cardData?.id) {
      try {
        await onUpdate(cardData.id, cardName.trim(), cardDescription.trim());
        onClose(); // Close modal after successful update
      } catch (error) {
        console.error("Error updating card:", error);
      }
    }
  };

  const handleDelete = async () => {
    if (cardData?.id) {
      try {
        await onDelete(cardData.id);
        onClose(); // Close modal after successful deletion
      } catch (error) {
        console.error("Error deleting card:", error);
      }
    }
  };

  return (
    <div
      className={`fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50 ${
        isOpen ? "block" : "hidden"
      }`}
    >
      <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
        <h3 className="text-xl font-semibold mb-4">
          {isEditable
            ? cardData
              ? "Edit Card"
              : "Add New Card"
            : "View Card"}
        </h3>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (isEditable) {
              onSubmit(cardName.trim(), cardDescription.trim());
            } else {
              handleUpdate();
            }
          }}
        >
          <input
            type="text"
            placeholder="Card Name"
            value={cardName}
            onChange={(e) => setCardName(e.target.value)}
            disabled={!isEditable} // Disable in view mode
            className="w-full p-2 mb-4 border rounded"
          />
          <textarea
            placeholder="Card Description"
            value={cardDescription}
            onChange={(e) => setCardDescription(e.target.value)}
            disabled={!isEditable} // Disable in view mode
            className="w-full p-2 mb-4 border rounded"
          />
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Close
            </button>
            {isEditable ? (
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                {cardData ? "Update Card" : "Add Card"}
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleDelete} // Trigger the delete handler
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Delete
                </button>
                <button
                  type="button"
                  onClick={handleUpdate} // Trigger the update handler
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Edit
                </button>
              </>
            )} 
            {isEditable && cardData && (
            <button
                type="button"
                onClick={handleDelete} // Trigger the delete handler
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
                Delete
            </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
