
import { createContext, useContext, useEffect, useState } from "react";

const cartContext = createContext();
const useCartContext = () => useContext(cartContext);
export default useCartContext;

export function CartProvider({ children }) {
  const [allCartItems, setCartItems] = useState(() => {
    try {
      const storedItems = localStorage.getItem("cartItem");
      const parsedItems = storedItems ? JSON.parse(storedItems) : [];

      if (!Array.isArray(parsedItems)) return [];

      return parsedItems.filter(
        (item) =>
          item &&
          typeof item._id === "string" &&
          item.productName &&
          Number.isSafeInteger(Number(item.quantity)) &&
          Number(item.quantity) > 0
      );
    } catch (error) {
      console.error("Unable to restore cart:", error);
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("cartItem", JSON.stringify(allCartItems));
  }, [allCartItems]);

  function updateCartItem(selectedItem, initialQty = 1, selectedSize = "One Size") {
    const productId = selectedItem?._id ?? selectedItem?.id;

    if (!productId || !selectedItem) {
      console.error("Cannot add product without a valid ID:", selectedItem);
      return;
    }

    setCartItems((previousItems) => {
      const existingItem = previousItems.find(
        (item) =>
          String(item._id) === String(productId) &&
          (item.selectedSize || "One Size") === selectedSize
      );

      if (existingItem) {
        return previousItems.map((item) =>
          String(item._id) === String(productId) &&
          (item.selectedSize || "One Size") === selectedSize
            ? {
                ...item,
                quantity: Number(item.quantity || 0) + Number(initialQty || 1),
                selectedSize,
              }
            : item
        );
      }

      return [
        ...previousItems,
        {
          ...selectedItem,
          _id: String(productId),
          quantity: Math.max(1, Number(initialQty) || 1),
          selectedSize,
        },
      ];
    });
  }

  function DecreaseQty(id) {
    setCartItems((previousItems) =>
      previousItems.map((item) =>
        String(item._id) === String(id) && Number(item.quantity) > 1
          ? { ...item, quantity: Number(item.quantity) - 1 }
          : item
      )
    );
  }

  function IncreaseQty(id) {
    setCartItems((previousItems) =>
      previousItems.map((item) =>
        String(item._id) === String(id)
          ? { ...item, quantity: Number(item.quantity) + 1 }
          : item
      )
    );
  }

  function deleteCartItem(deletedItemId) {
    setCartItems((previousItems) =>
      previousItems.filter(
        (item) => String(item._id) !== String(deletedItemId)
      )
    );
  }

  function clearCart() {
    setCartItems([]);
    localStorage.removeItem("cartItem");
  }

  return (
    <cartContext.Provider
      value={{
        allCartItems,
        updateCartItem,
        DecreaseQty,
        IncreaseQty,
        deleteCartItem,
        clearCart,
      }}
    >
      {children}
    </cartContext.Provider>
  );
}
